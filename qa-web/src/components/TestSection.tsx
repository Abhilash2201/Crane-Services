import type { SuiteGroup, TestStatus } from "../types";

type Props = {
  suite: SuiteGroup;
  statuses: Record<string, TestStatus>;
  details: Record<string, string>;
  times: Record<string, number>;
};

export function TestSection({ suite, statuses, details, times }: Props) {
  const passCount = suite.tests.filter((t) => statuses[t.id] === "pass").length;
  const failCount = suite.tests.filter((t) => statuses[t.id] === "fail").length;

  return (
    <div className="app-section">
      <div className="app-header">
        <span className="app-name">{suite.label}</span>
        <span className="app-url">{suite.url}</span>
        <span className="app-status-count">{passCount}/{suite.tests.length} PASS{failCount ? ` | ${failCount} FAIL` : ""}</span>
      </div>
      <div className="test-list">
        {suite.tests.map((t, i) => {
          const status = statuses[t.id] || "pending";
          return (
            <div className="test-row" key={t.id}>
              <div className="test-num">{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div className="test-name">{t.name}</div>
                <div className={`test-detail ${details[t.id] ? "has-result" : ""} ${status === "fail" ? "is-error" : ""}`}>{details[t.id] || "-"}</div>
              </div>
              <div><span className={`test-status status-${status}`}>{status.toUpperCase()}</span></div>
              <div className="test-time">{times[t.id] ? `${times[t.id]}ms` : "-"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
