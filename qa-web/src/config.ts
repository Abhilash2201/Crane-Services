import type { Cred, Role, SuiteGroup } from "./types";

export const BASE = "https://crane-api-production.up.railway.app/api";

export const APP_URLS: Record<Role, string> = {
  customer: "https://crane-services-customer.vercel.app",
  owner: "https://crane-services-owner.vercel.app",
  driver: "https://crane-service-driver.vercel.app",
  admin: "https://crane-services-admin.vercel.app",
};

export const CREDS: Record<Role, Cred> = {
  customer: { email: "posonec416@muncloud.com", password: "12345678", name: "Mahesh" },
  owner: { email: "docaho1860@nexafilm.com", password: "12345678", name: "Umesh" },
  driver: { email: "padirer122@nexafilm.com", password: "12345678", name: "Prakash" },
  admin: { email: "admin@example.com", password: "1234567890", name: "Super Admin" },
};

export const SUITE: SuiteGroup[] = [
  { id: "api", label: "API & Auth", url: BASE, tests: [
    { id: "t_swagger", name: "Swagger docs reachable", fnKey: "chkSwagger" },
    { id: "t_health", name: "Health endpoint", fnKey: "chkHealth" },
    { id: "t_authpath", name: "Auth endpoint responds", fnKey: "chkAuthPath" },
    { id: "t_lc", name: "Customer login", fnKey: "loginCustomer" },
    { id: "t_lo", name: "Owner login", fnKey: "loginOwner" },
    { id: "t_ld", name: "Driver login", fnKey: "loginDriver" },
    { id: "t_la", name: "Admin login", fnKey: "loginAdmin" },
    { id: "t_mec", name: "Customer /auth/me", fnKey: "meCustomer" },
    { id: "t_meo", name: "Owner /auth/me", fnKey: "meOwner" },
    { id: "t_med", name: "Driver /auth/me", fnKey: "meDriver" },
    { id: "t_mea", name: "Admin /auth/me", fnKey: "meAdmin" },
  ]},
  { id: "cust", label: "Customer App", url: APP_URLS.customer, tests: [
    { id: "t_cr", name: "Customer app reachable", fnKey: "reachCustomer" },
    { id: "t_cv", name: "Variants list", fnKey: "getVariants" },
    { id: "t_cp", name: "Pricing", fnKey: "chkPricing" },
    { id: "t_cdash", name: "Customer dashboard", fnKey: "custDash" },
    { id: "t_creqs", name: "Customer requests list", fnKey: "custReqs" },
    { id: "t_creq", name: "Create request", fnKey: "createReq" },
    { id: "t_ctrk", name: "Request tracking", fnKey: "custTracking" },
    { id: "t_ccan", name: "Cancel request endpoint", fnKey: "custCancel" },
  ]},
  { id: "own", label: "Owner App", url: APP_URLS.owner, tests: [
    { id: "t_or", name: "Owner app reachable", fnKey: "reachOwner" },
    { id: "t_oin", name: "Incoming requests", fnKey: "ownIncoming" },
    { id: "t_oaccl", name: "Accepted requests", fnKey: "ownAcceptedList" },
    { id: "t_odr", name: "Owner drivers list", fnKey: "ownDrivers" },
    { id: "t_ofl", name: "Owner fleet list", fnKey: "ownFleet" },
    { id: "t_oj", name: "Owner jobs list", fnKey: "ownJobs" },
    { id: "t_oacc", name: "Accept request endpoint", fnKey: "ownAccept" },
    { id: "t_odis", name: "Assign driver endpoint", fnKey: "ownDispatch" },
    { id: "t_otrk", name: "Owner tracking endpoint", fnKey: "ownTracking" },
    { id: "t_ovr", name: "Owner variant requests", fnKey: "ownVariantReqs" },
  ]},
  { id: "drv", label: "Driver App", url: APP_URLS.driver, tests: [
    { id: "t_dr", name: "Driver app reachable", fnKey: "reachDriver" },
    { id: "t_dj", name: "Driver jobs list", fnKey: "drvJobs" },
    { id: "t_ds", name: "Driver status update", fnKey: "drvStatus" },
    { id: "t_dgps", name: "Driver tracking post", fnKey: "drvGPS" },
  ]},
  { id: "adm", label: "Admin App", url: APP_URLS.admin, tests: [
    { id: "t_ar", name: "Admin app reachable", fnKey: "reachAdmin" },
    { id: "t_aov", name: "Admin overview", fnKey: "admOverview" },
    { id: "t_aus", name: "Admin users list", fnKey: "admUsers" },
    { id: "t_aups", name: "Admin user status patch", fnKey: "admUserStatusPatch" },
    { id: "t_areqs", name: "Admin requests list", fnKey: "admReqs" },
    { id: "t_apay", name: "Admin payments list", fnKey: "admPay" },
    { id: "t_avar", name: "Admin variants list", fnKey: "admVars" },
    { id: "t_avr", name: "Admin variant requests", fnKey: "admVariantReqs" },
    { id: "t_aprg", name: "Admin pricing get", fnKey: "admPricingGet" },
    { id: "t_aan", name: "Admin analytics", fnKey: "admAnalytics" },
  ]},
];
