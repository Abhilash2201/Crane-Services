type Props = {
  running: boolean;
  progressPct: number;
  progressLabel: string;
  onRun: () => void;
};

export function Controls({ running, progressPct, progressLabel, onRun }: Props) {
  return (
    <div className="controls">
      <button className="run-btn" disabled={running} onClick={onRun}>
        {running ? "..." : ">"} RUN ALL TESTS
      </button>
      <button className="export-btn" onClick={() => window.print()}>PRINT / SAVE PDF</button>
      <div className="progress-wrap">
        <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${progressPct}%` }} /></div>
        <div className="progress-label">{progressLabel}</div>
      </div>
    </div>
  );
}
