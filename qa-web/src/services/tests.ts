import { APP_URLS, CREDS } from "../config";
import type { QaState, Role, TestResult } from "../types";

type ReqFn = (path: string, opts: RequestInit & { expectedStatuses?: number[] }, role: Role) => Promise<{ ok: boolean; status: number; data: any }>;

type Ctx = { state: QaState; req: ReqFn };

function toArr(d: any): any[] {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  for (const k of ["data", "items", "results", "users", "requests", "variants", "payments", "cranes", "jobs", "drivers", "fleet"]) {
    if (Array.isArray(d[k])) return d[k];
  }
  return [];
}

function getToken(d: any): string | null {
  return d?.token || d?.access_token || d?.accessToken || d?.data?.token || d?.data?.access_token || d?.data?.accessToken || null;
}

async function reach(url: string): Promise<TestResult> {
  try {
    await fetch(url, { mode: "no-cors" });
    return { status: "pass", detail: `${url} reachable` };
  } catch {
    return { status: "warn", detail: "Browser blocked reachability check" };
  }
}

async function login(ctx: Ctx, role: Role): Promise<TestResult> {
  const c = CREDS[role];
  const r = await ctx.req("/auth/login", { method: "POST", body: JSON.stringify({ email: c.email, password: c.password }) }, role);
  if (!r.ok) return { status: "fail", detail: `${role} login failed (HTTP ${r.status})` };
  const tok = getToken(r.data);
  if (!tok) return { status: "warn", detail: `${role} login returned no token` };
  ctx.state.tokens[role] = tok;
  return { status: "pass", detail: `${role} login success` };
}

async function authMe(ctx: Ctx, role: Role): Promise<TestResult> {
  if (!ctx.state.tokens[role]) return { status: "skip", detail: `${role} login failed` };
  const r = await ctx.req("/auth/me", {}, role);
  return r.ok ? { status: "pass", detail: `/auth/me ok for ${role}` } : { status: "warn", detail: `/auth/me failed (${r.status})` };
}

export function buildTests(ctx: Ctx): Record<string, () => Promise<TestResult>> {
  return {
    chkSwagger: async () => {
      const r = await ctx.req("/docs/", { method: "GET" }, "customer");
      return r.ok || r.status === 200 ? { status: "pass", detail: `Swagger reachable (${r.status})` } : { status: "warn", detail: `Swagger check HTTP ${r.status || "network error"}` };
    },
    chkHealth: async () => {
      const r = await ctx.req("/health", {}, "customer");
      return r.ok ? { status: "pass", detail: `Health OK (${r.status})` } : { status: "fail", detail: `Health failed (${r.status || "network error"})` };
    },
    chkAuthPath: async () => {
      const r = await ctx.req("/auth/login", { method: "POST", body: JSON.stringify({}), expectedStatuses: [400, 401, 422] }, "customer");
      if ([400, 401, 422].includes(r.status) || r.ok) return { status: "pass", detail: `Auth endpoint live (${r.status})` };
      if (r.status === 404) return { status: "fail", detail: "/auth/login not found" };
      return { status: "warn", detail: `Auth path HTTP ${r.status || "network error"}` };
    },

    loginCustomer: () => login(ctx, "customer"),
    loginOwner: () => login(ctx, "owner"),
    loginDriver: () => login(ctx, "driver"),
    loginAdmin: () => login(ctx, "admin"),
    meCustomer: () => authMe(ctx, "customer"),
    meOwner: () => authMe(ctx, "owner"),
    meDriver: () => authMe(ctx, "driver"),
    meAdmin: () => authMe(ctx, "admin"),

    reachCustomer: () => reach(APP_URLS.customer),
    reachOwner: () => reach(APP_URLS.owner),
    reachDriver: () => reach(APP_URLS.driver),
    reachAdmin: () => reach(APP_URLS.admin),

    getVariants: async () => {
      const r = await ctx.req("/variants?active=true", {}, "customer");
      if (!r.ok) return { status: "warn", detail: `Variants failed (${r.status})` };
      const list = toArr(r.data);
      ctx.state.data.variantId = list[0]?.id;
      return { status: list.length ? "pass" : "warn", detail: `${list.length} active variants` };
    },
    chkPricing: async () => {
      const v = ctx.state.data.variantId as string | undefined;
      const p = v ? `/pricing?variantId=${encodeURIComponent(v)}` : "/pricing";
      const r = await ctx.req(p, {}, "customer");
      return r.ok ? { status: "pass", detail: `Pricing OK (${p})` } : { status: "warn", detail: `Pricing failed (${r.status})` };
    },
    custDash: async () => {
      if (!ctx.state.tokens.customer) return { status: "skip", detail: "customer login failed" };
      const r = await ctx.req("/customer/dashboard", {}, "customer");
      return r.ok ? { status: "pass", detail: "dashboard API ok" } : { status: "warn", detail: `dashboard failed (${r.status})` };
    },
    custReqs: async () => {
      if (!ctx.state.tokens.customer) return { status: "skip", detail: "customer login failed" };
      const r = await ctx.req("/customer/requests", {}, "customer");
      if (!r.ok) return { status: "warn", detail: `customer requests failed (${r.status})` };
      const rows = toArr(r.data);
      ctx.state.data.requestId = rows[0]?.id || ctx.state.data.requestId;
      return { status: "pass", detail: `${rows.length} customer requests` };
    },
    createReq: async () => {
      if (!ctx.state.tokens.customer) return { status: "skip", detail: "customer login failed" };
      const body = {
        pickupAddress: "123 QA Test St, Bangalore",
        dropAddress: "456 QA Drop St, Bangalore",
        variantId: ctx.state.data.variantId,
        durationHours: 2,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        notes: "Automated QA request",
      };
      const r = await ctx.req("/customer/requests", { method: "POST", body: JSON.stringify(body) }, "customer");
      if (r.ok) {
        const newId = r.data?.data?.id || ctx.state.data.requestId;
        ctx.state.data.requestId = newId;
        ctx.state.data.flowRequestId = newId;
        return { status: "pass", detail: `request created (${String(ctx.state.data.requestId || "n/a")})` };
      }
      if (r.status === 500 && /duration_hours|estimated_price/i.test(JSON.stringify(r.data || {}))) {
        return { status: "warn", detail: "create request blocked by backend schema mismatch (missing duration_hours column)" };
      }
      return { status: "warn", detail: `create request failed (${r.status})` };
    },
    custTracking: async () => {
      if (!ctx.state.tokens.customer) return { status: "skip", detail: "customer login failed" };
      const trackId = ctx.state.data.flowRequestId || ctx.state.data.requestId;
      if (!trackId) return { status: "skip", detail: "no request id" };
      const r = await ctx.req(`/customer/requests/${trackId}/tracking`, {}, "customer");
      return r.ok ? { status: "pass", detail: "tracking payload received" } : { status: "warn", detail: `tracking failed (${r.status})` };
    },
    custCancel: async () => {
      if (!ctx.state.tokens.customer) return { status: "skip", detail: "customer login failed" };
      return { status: "skip", detail: "cancel test deferred to avoid breaking owner/driver flow" };
    },

    ownIncoming: async () => {
      if (!ctx.state.tokens.owner) return { status: "skip", detail: "owner login failed" };
      const r = await ctx.req("/owner/incoming-requests", {}, "owner");
      if (!r.ok) return { status: "warn", detail: `incoming failed (${r.status})` };
      const rows = toArr(r.data);
      const flowRequestId = ctx.state.data.flowRequestId as string | undefined;
      const selected = flowRequestId ? rows.find((x) => x.id === flowRequestId) : rows[0];
      ctx.state.data.pendingRequestId = selected?.id;
      if (!ctx.state.data.pendingRequestId) return { status: "warn", detail: `${rows.length} incoming requests, flow request not visible to owner` };
      return { status: "pass", detail: `${rows.length} incoming requests (selected ${String(ctx.state.data.pendingRequestId)})` };
    },
    ownAcceptedList: async () => {
      if (!ctx.state.tokens.owner) return { status: "skip", detail: "owner login failed" };
      const r = await ctx.req("/owner/accepted-requests", {}, "owner");
      if (!r.ok) return { status: "warn", detail: `accepted list failed (${r.status})` };
      const rows = toArr(r.data);
      ctx.state.data.acceptedRequestId = rows[0]?.id || ctx.state.data.acceptedRequestId;
      return { status: "pass", detail: `${rows.length} accepted requests` };
    },
    ownDrivers: async () => {
      if (!ctx.state.tokens.owner) return { status: "skip", detail: "owner login failed" };
      const r = await ctx.req("/owner/drivers", {}, "owner");
      if (!r.ok) return { status: "warn", detail: `owner drivers failed (${r.status})` };
      const rows = toArr(r.data);
      const match = rows.find((x) => String(x.email || "").toLowerCase() === CREDS.driver.email.toLowerCase());
      ctx.state.data.ownerDriverId = match?.id || rows[0]?.id;
      return { status: rows.length ? "pass" : "warn", detail: `${rows.length} owner drivers` };
    },
    ownFleet: async () => {
      if (!ctx.state.tokens.owner) return { status: "skip", detail: "owner login failed" };
      const r = await ctx.req("/owner/fleet", {}, "owner");
      if (!r.ok) return { status: "warn", detail: `owner fleet failed (${r.status})` };
      const rows = toArr(r.data);
      ctx.state.data.ownerCraneRegistration = rows[0]?.registration || "QA-REG-001";
      return { status: rows.length ? "pass" : "warn", detail: `${rows.length} fleet entries` };
    },
    ownJobs: async () => {
      if (!ctx.state.tokens.owner) return { status: "skip", detail: "owner login failed" };
      const r = await ctx.req("/owner/jobs", {}, "owner");
      return r.ok ? { status: "pass", detail: `${toArr(r.data).length} owner jobs` } : { status: "warn", detail: `owner jobs failed (${r.status})` };
    },
    ownAccept: async () => {
      if (!ctx.state.tokens.owner) return { status: "skip", detail: "owner login failed" };
      const requestId = ctx.state.data.pendingRequestId;
      if (!requestId) return { status: "skip", detail: "no pending request id" };
      const r = await ctx.req("/owner/accept-request", { method: "POST", body: JSON.stringify({ requestId }) }, "owner");
      if (!r.ok) return { status: "warn", detail: `accept failed (${r.status})` };
      ctx.state.data.acceptedRequestId = r.data?.data?.id || requestId;
      return { status: "pass", detail: `accepted ${String(ctx.state.data.acceptedRequestId)}` };
    },
    ownDispatch: async () => {
      if (!ctx.state.tokens.owner) return { status: "skip", detail: "owner login failed" };
      const requestId = ctx.state.data.acceptedRequestId;
      const driverId = ctx.state.data.ownerDriverId;
      const craneRegistration = ctx.state.data.ownerCraneRegistration;
      if (!requestId || !driverId || !craneRegistration) return { status: "skip", detail: "need request + driver + crane" };
      const r = await ctx.req("/owner/assign-driver", { method: "POST", body: JSON.stringify({ requestId, driverId, craneRegistration }) }, "owner");
      if (!r.ok) return { status: "warn", detail: `assign failed (${r.status})` };
      ctx.state.data.jobId = r.data?.data?.id || ctx.state.data.jobId;
      return { status: "pass", detail: `driver assigned, job ${String(ctx.state.data.jobId || "n/a")}` };
    },
    ownTracking: async () => {
      if (!ctx.state.tokens.owner) return { status: "skip", detail: "owner login failed" };
      const requestId = ctx.state.data.acceptedRequestId;
      if (!requestId) return { status: "skip", detail: "no request id" };
      const r = await ctx.req(`/owner/requests/${requestId}/tracking`, {}, "owner");
      return r.ok ? { status: "pass", detail: "owner tracking payload received" } : { status: "warn", detail: `owner tracking failed (${r.status})` };
    },
    ownVariantReqs: async () => {
      if (!ctx.state.tokens.owner) return { status: "skip", detail: "owner login failed" };
      const r = await ctx.req("/owner/variant-requests", {}, "owner");
      return r.ok ? { status: "pass", detail: `${toArr(r.data).length} owner variant requests` } : { status: "warn", detail: `owner variant requests failed (${r.status})` };
    },

    drvJobs: async () => {
      if (!ctx.state.tokens.driver) return { status: "skip", detail: "driver login failed" };
      const r = await ctx.req("/driver/jobs", {}, "driver");
      if (!r.ok) return { status: "warn", detail: `driver jobs failed (${r.status})` };
      const rows = toArr(r.data);
      const targetJobId = ctx.state.data.jobId as string | undefined;
      const selected = targetJobId ? rows.find((x) => x.id === targetJobId) : rows[0];
      ctx.state.data.driverJobId = selected?.id;
      return { status: "pass", detail: `${rows.length} driver jobs` };
    },
    drvStatus: async () => {
      if (!ctx.state.tokens.driver) return { status: "skip", detail: "driver login failed" };
      const jobId = ctx.state.data.driverJobId;
      if (!jobId) return { status: "skip", detail: "no driver job id" };
      const r = await ctx.req(`/driver/jobs/${jobId}/status`, { method: "PATCH", body: JSON.stringify({ status: "en_route" }) }, "driver");
      return r.ok ? { status: "pass", detail: "driver status updated" } : { status: "warn", detail: `driver status failed (${r.status})` };
    },
    drvGPS: async () => {
      if (!ctx.state.tokens.driver) return { status: "skip", detail: "driver login failed" };
      const jobId = ctx.state.data.driverJobId;
      if (!jobId) return { status: "skip", detail: "no driver job id" };
      const r = await ctx.req("/driver/tracking", { method: "POST", body: JSON.stringify({ jobId, latitude: 12.9716, longitude: 77.5946, speedKmph: 20, heading: 180 }) }, "driver");
      return r.ok ? { status: "pass", detail: "tracking event posted" } : { status: "warn", detail: `tracking post failed (${r.status})` };
    },

    admOverview: async () => {
      if (!ctx.state.tokens.admin) return { status: "skip", detail: "admin login failed" };
      const r = await ctx.req("/admin/overview", {}, "admin");
      return r.ok ? { status: "pass", detail: "overview API ok" } : { status: "warn", detail: `overview failed (${r.status})` };
    },
    admUsers: async () => {
      if (!ctx.state.tokens.admin) return { status: "skip", detail: "admin login failed" };
      const r = await ctx.req("/admin/users", {}, "admin");
      if (!r.ok) return { status: "warn", detail: `users failed (${r.status})` };
      const rows = toArr(r.data);
      ctx.state.data.adminUserId = rows[0]?.id;
      ctx.state.data.adminUserActive = !!rows[0]?.is_active;
      return { status: "pass", detail: `${rows.length} users` };
    },
    admUserStatusPatch: async () => {
      if (!ctx.state.tokens.admin) return { status: "skip", detail: "admin login failed" };
      if (!ctx.state.data.adminUserId) return { status: "skip", detail: "no admin user id" };
      const r = await ctx.req(`/admin/users/${ctx.state.data.adminUserId}/status`, { method: "PATCH", body: JSON.stringify({ isActive: ctx.state.data.adminUserActive }) }, "admin");
      return r.ok ? { status: "pass", detail: "user status patch ok" } : { status: "warn", detail: `user status patch failed (${r.status})` };
    },
    admReqs: async () => {
      if (!ctx.state.tokens.admin) return { status: "skip", detail: "admin login failed" };
      const r = await ctx.req("/admin/requests", {}, "admin");
      return r.ok ? { status: "pass", detail: `${toArr(r.data).length} requests` } : { status: "warn", detail: `requests failed (${r.status})` };
    },
    admPay: async () => {
      if (!ctx.state.tokens.admin) return { status: "skip", detail: "admin login failed" };
      const r = await ctx.req("/admin/payments", {}, "admin");
      return r.ok ? { status: "pass", detail: `${toArr(r.data).length} payments` } : { status: "warn", detail: `payments failed (${r.status})` };
    },
    admVars: async () => {
      if (!ctx.state.tokens.admin) return { status: "skip", detail: "admin login failed" };
      const r = await ctx.req("/admin/variants", {}, "admin");
      return r.ok ? { status: "pass", detail: `${toArr(r.data).length} variants` } : { status: "warn", detail: `variants failed (${r.status})` };
    },
    admVariantReqs: async () => {
      if (!ctx.state.tokens.admin) return { status: "skip", detail: "admin login failed" };
      const r = await ctx.req("/admin/variant-requests", {}, "admin");
      return r.ok ? { status: "pass", detail: `${toArr(r.data).length} variant requests` } : { status: "warn", detail: `variant requests failed (${r.status})` };
    },
    admPricingGet: async () => {
      if (!ctx.state.tokens.admin) return { status: "skip", detail: "admin login failed" };
      const r = await ctx.req("/admin/pricing", {}, "admin");
      return r.ok ? { status: "pass", detail: "pricing get ok" } : { status: "warn", detail: `pricing get failed (${r.status})` };
    },
    admAnalytics: async () => {
      if (!ctx.state.tokens.admin) return { status: "skip", detail: "admin login failed" };
      const r = await ctx.req("/admin/analytics", {}, "admin");
      return r.ok ? { status: "pass", detail: "analytics API ok" } : { status: "warn", detail: `analytics failed (${r.status})` };
    },
  };
}




