import type { AuditEntry, LogEntry } from "../types";

export function LogPanel({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="log-section">
      <div className="section-title">Test Log</div>
      <div className="log-box">
        {entries.map((e, idx) => (
          <div className="log-entry" key={`${e.t}-${idx}`}>
            <span className="log-time">{e.t}</span>
            <span className={`log-${e.type}`}>{e.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FailurePanel({ failed }: { failed: AuditEntry[] }) {
  if (!failed.length) return null;
  return (
    <div className="log-section">
      <div className="section-title">Failure Details</div>
      <div className="ai-box">{JSON.stringify(failed, null, 2)}</div>
    </div>
  );
}
