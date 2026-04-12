import React from "react";
import { APP_URLS, BASE, SUITE } from "./config";
import { Controls } from "./components/Controls";
import { LogPanel, FailurePanel } from "./components/LogPanels";
import { SummaryCards } from "./components/SummaryCards";
import { TestSection } from "./components/TestSection";
import { createApi } from "./services/api";
import { buildTests } from "./services/tests";
import type { AuditEntry, LogEntry, QaState, TestStatus } from "./types";

const initialStatuses = Object.fromEntries(
  SUITE.flatMap((s) => s.tests.map((t) => [t.id, "pending"])),
) as Record<string, TestStatus>;

export default function App() {
  const [statuses, setStatuses] =
    React.useState<Record<string, TestStatus>>(initialStatuses);
  const [details, setDetails] = React.useState<Record<string, string>>({});
  const [times, setTimes] = React.useState<Record<string, number>>({});
  const [running, setRunning] = React.useState(false);
  const [progressPct, setProgressPct] = React.useState(0);
  const [progressLabel, setProgressLabel] = React.useState("Ready");
  const [logs, setLogs] = React.useState<LogEntry[]>([
    { t: "00.0", type: "info", message: "Waiting to run" },
  ]);
  const [failedAudit, setFailedAudit] = React.useState<AuditEntry[]>([]);

  const stateRef = React.useRef<QaState>({ tokens: {}, data: {} });
  const startRef = React.useRef<number>(Date.now());
  const api = React.useMemo(
    () => createApi(BASE, (role) => stateRef.current.tokens[role]),
    [],
  );

  function tstamp() {
    return ((Date.now() - startRef.current) / 1000).toFixed(1).padStart(5, "0");
  }

  function addLog(message: string, type: LogEntry["type"] = "info") {
    setLogs((prev) => [...prev, { t: tstamp(), type, message }]);
  }

  const stats = React.useMemo(() => {
    const values = Object.values(statuses);
    return {
      total: values.filter((v) => v !== "pending").length,
      byStatus: {
        pending: values.filter((v) => v === "pending").length,
        running: values.filter((v) => v === "running").length,
        pass: values.filter((v) => v === "pass").length,
        fail: values.filter((v) => v === "fail").length,
        warn: values.filter((v) => v === "warn").length,
        skip: values.filter((v) => v === "skip").length,
      } as Record<TestStatus, number>,
    };
  }, [statuses]);

  const runAll = React.useCallback(async () => {
    if (running) return;
    setRunning(true);
    stateRef.current = { tokens: {}, data: {} };
    api.clearAudit();
    startRef.current = Date.now();
    setStatuses(initialStatuses);
    setDetails({});
    setTimes({});
    setFailedAudit([]);
    setProgressPct(0);
    setProgressLabel("Starting...");
    setLogs([{ t: "00.0", type: "info", message: "Starting test run..." }]);

    const registry = buildTests({ state: stateRef.current, req: api.req });
    const all = SUITE.flatMap((s) => s.tests);

    for (let i = 0; i < all.length; i += 1) {
      const test = all[i];
      setStatuses((prev) => ({ ...prev, [test.id]: "running" }));
      const t0 = Date.now();
      const fn = registry[test.fnKey];

      if (!fn) {
        setStatuses((prev) => ({ ...prev, [test.id]: "fail" }));
        setDetails((prev) => ({
          ...prev,
          [test.id]: `Missing runner: ${test.fnKey}`,
        }));
      } else {
        try {
          const res = await fn();
          setStatuses((prev) => ({ ...prev, [test.id]: res.status }));
          setDetails((prev) => ({ ...prev, [test.id]: res.detail }));
          setTimes((prev) => ({ ...prev, [test.id]: Date.now() - t0 }));
          addLog(
            `[${res.status.toUpperCase()}] ${test.name} - ${res.detail}`,
            res.status === "pass"
              ? "pass"
              : res.status === "fail"
                ? "fail"
                : res.status === "warn"
                  ? "warn"
                  : "info",
          );
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          setStatuses((prev) => ({ ...prev, [test.id]: "fail" }));
          setDetails((prev) => ({ ...prev, [test.id]: `Exception: ${msg}` }));
          setTimes((prev) => ({ ...prev, [test.id]: Date.now() - t0 }));
          addLog(`[FAIL] ${test.name} - Exception: ${msg}`, "fail");
        }
      }

      const pct = Math.round(((i + 1) / all.length) * 100);
      setProgressPct(pct);
      setProgressLabel(`${pct}% - ${test.name}`);
    }

    const failures = api.getAudit().filter((x) => !x.auditOk);
    setFailedAudit(failures);
    setProgressLabel(`Complete - ${all.length} tests run`);
    setRunning(false);
  }, [api, running]);

  const now = new Date().toLocaleString();

  return (
    <div className="container">
      <header>
        <div className="header-inner">
          <div className="logo-row">
            <div className="logo-icon">QA</div>
            <div>
              <h1>
                Crane Services <span>QA</span>
              </h1>
              <div className="subtitle">
                END-TO-END TEST REPORT | GENERATED {now}
              </div>
            </div>
          </div>
          <div className="badge-row">
            <span className="badge badge-env">ENV: PRODUCTION</span>
            <span className="badge badge-live">LIVE APIs</span>
          </div>
        </div>
      </header>

      <SummaryCards total={stats.total} byStatus={stats.byStatus} />

      <div className="notice">
        Live Server/local domains must be allowed in backend CORS_ORIGINS. Run
        from localhost dev server, not file://.
      </div>

      <Controls
        running={running}
        progressPct={progressPct}
        progressLabel={progressLabel}
        onRun={runAll}
      />

      <div className="section-title">App Targets</div>
      <table className="cred-table">
        <thead>
          <tr>
            <th>APP</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Customer</td>
            <td>{APP_URLS.customer}</td>
          </tr>
          <tr>
            <td>Owner</td>
            <td>{APP_URLS.owner}</td>
          </tr>
          <tr>
            <td>Driver</td>
            <td>{APP_URLS.driver}</td>
          </tr>
          <tr>
            <td>Admin</td>
            <td>{APP_URLS.admin}</td>
          </tr>
        </tbody>
      </table>

      {SUITE.map((s) => (
        <TestSection
          key={s.id}
          suite={s}
          statuses={statuses}
          details={details}
          times={times}
        />
      ))}

      <LogPanel entries={logs} />
      <FailurePanel failed={failedAudit} />
    </div>
  );
}
