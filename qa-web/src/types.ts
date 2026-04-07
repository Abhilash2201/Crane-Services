export type Role = "customer" | "owner" | "driver" | "admin";

export type TestStatus = "pending" | "running" | "pass" | "fail" | "warn" | "skip";

export type TestResult = {
  status: Exclude<TestStatus, "pending" | "running">;
  detail: string;
};

export type TestCase = {
  id: string;
  name: string;
  fnKey: string;
};

export type SuiteGroup = {
  id: string;
  label: string;
  url: string;
  tests: TestCase[];
};

export type Cred = { email: string; password: string; name: string };

export type AuditEntry = {
  startedAt: string;
  durationMs: number;
  role: Role;
  method: string;
  url: string;
  payload: unknown;
  ok: boolean;
  auditOk: boolean;
  status: number;
  response: unknown;
  error?: string;
};

export type LogEntry = { t: string; type: "info" | "pass" | "fail" | "warn"; message: string };

export type QaState = {
  tokens: Partial<Record<Role, string>>;
  data: Record<string, unknown>;
};
