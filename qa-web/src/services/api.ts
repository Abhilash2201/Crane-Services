import type { AuditEntry, Role } from "../types";

type ReqOptions = RequestInit & { expectedStatuses?: number[] };

export function createApi(base: string, getToken: (role: Role) => string | undefined) {
  const requestAudit: AuditEntry[] = [];

  function headersFor(role: Role, extra?: HeadersInit): HeadersInit {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    const token = getToken(role);
    if (token) h.Authorization = `Bearer ${token}`;
    if (extra && typeof extra === "object") Object.assign(h, extra as Record<string, string>);
    return h;
  }

  async function req(path: string, opts: ReqOptions = {}, role: Role) {
    const { expectedStatuses = [], ...fetchOpts } = opts;
    const url = path.startsWith("http") ? path : `${base}${path}`;
    const method = (fetchOpts.method || "GET").toUpperCase();
    const t0 = Date.now();
    const startedAt = new Date().toISOString();

    let payload: unknown = null;
    if (typeof fetchOpts.body === "string") {
      try { payload = JSON.parse(fetchOpts.body); } catch { payload = fetchOpts.body; }
    }

    try {
      const res = await fetch(url, { ...fetchOpts, headers: headersFor(role, fetchOpts.headers), mode: "cors" });
      let data: unknown = null;
      try { data = await res.json(); } catch {}
      const auditOk = res.ok || expectedStatuses.includes(res.status);
      requestAudit.push({ startedAt, durationMs: Date.now() - t0, role, method, url, payload, ok: res.ok, auditOk, status: res.status, response: data });
      return { ok: res.ok, status: res.status, data };
    } catch (error) {
      requestAudit.push({ startedAt, durationMs: Date.now() - t0, role, method, url, payload, ok: false, auditOk: false, status: 0, response: null, error: error instanceof Error ? error.message : String(error) });
      return { ok: false, status: 0, data: null, err: error instanceof Error ? error.message : String(error) };
    }
  }

  return {
    req,
    clearAudit: () => { requestAudit.length = 0; },
    getAudit: () => [...requestAudit],
  };
}
