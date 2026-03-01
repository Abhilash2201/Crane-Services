import styled from "styled-components";

const ChartWrap = styled.div`
  height: 240px;
  width: 100%;
`;

const Axis = styled.div`
  display: grid;
  grid-template-columns: repeat(var(--count), minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
`;

export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <ChartWrap>
      <div style={{ height: 200, display: "grid", alignItems: "end", gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`, gap: 12 }}>
        {data.map((item) => (
          <div key={item.label} title={`${item.label}: ${item.value}`}>
            <div
              style={{
                height: `${(item.value / max) * 180}px`,
                borderRadius: 10,
                background: "linear-gradient(180deg, #FF6200 0%, #FF8A3D 100%)",
                boxShadow: "0 8px 18px rgba(255,98,0,0.25)",
                transition: "0.2s"
              }}
            />
          </div>
        ))}
      </div>
      <Axis style={{ ["--count" as string]: data.length }}>
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </Axis>
    </ChartWrap>
  );
}

export function LineChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const min = Math.min(...data.map((item) => item.value), 0);

  const points = data
    .map((point, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - ((point.value - min) / Math.max(max - min, 1)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <ChartWrap>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: 200 }}>
        <defs>
          <linearGradient id="cranehub-line" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6200" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FF6200" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke="#FF6200" strokeWidth="2.4" points={points} />
        <polygon fill="url(#cranehub-line)" points={`0,100 ${points} 100,100`} />
      </svg>
      <Axis style={{ ["--count" as string]: data.length }}>
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </Axis>
    </ChartWrap>
  );
}
