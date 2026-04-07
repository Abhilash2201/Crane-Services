import type { TestStatus } from "../types";

type Props = {
  total: number;
  byStatus: Record<TestStatus, number>;
};

export function SummaryCards({ total, byStatus }: Props) {
  return (
    <div className="summary-grid">
      <Stat label="TOTAL" value={total || "-"} variant="total" />
      <Stat label="PASSED" value={byStatus.pass || "-"} variant="pass" />
      <Stat label="FAILED" value={byStatus.fail || "-"} variant="fail" />
      <Stat label="WARNINGS" value={byStatus.warn || "-"} variant="warn" />
      <Stat label="SKIPPED" value={byStatus.skip || "-"} variant="skip" />
    </div>
  );
}

function Stat({ label, value, variant }: { label: string; value: string | number; variant: string }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-num">{value}</div>
    </div>
  );
}
