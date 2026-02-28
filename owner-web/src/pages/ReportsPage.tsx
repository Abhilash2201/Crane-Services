import { Card, CardContent } from "../components/ui/card";

const monthlyRevenue = [11.2, 12.4, 13.8, 12.9, 15.1, 18.46];
const utilization = [62, 67, 65, 70, 72, 73];

export function ReportsPage() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1>Earnings & Reports</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        <Card>
          <CardContent>
            <h3 style={{ marginTop: 0 }}>Revenue Trend (₹ Lakhs)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, alignItems: "end", height: 180 }}>
              {monthlyRevenue.map((value, idx) => (
                <div key={idx} style={{ display: "grid", justifyItems: "center", gap: 6 }}>
                  <div style={{ width: 28, height: `${value * 7}px`, borderRadius: 8, background: idx === 5 ? "#FF6200" : "#0A2540" }} />
                  <small style={{ color: "#64748B" }}>{["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"][idx]}</small>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 style={{ marginTop: 0 }}>Fleet Utilization %</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {utilization.map((u, idx) => (
                <div key={idx}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <small style={{ color: "#64748B" }}>{["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"][idx]}</small>
                    <small>{u}%</small>
                  </div>
                  <div style={{ height: 10, borderRadius: 999, background: "#e2e8f0" }}>
                    <div style={{ height: "100%", width: `${u}%`, borderRadius: 999, background: "#FF6200" }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h3 style={{ marginTop: 0 }}>Report Snapshot (Feb 2026)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
            <div style={{ border: "1px solid #E2E8F0", borderRadius: 10, padding: 10 }}>
              <small style={{ color: "#64748B" }}>Gross Earnings</small>
              <p style={{ margin: "6px 0 0", fontWeight: 700 }}>₹18,46,000</p>
            </div>
            <div style={{ border: "1px solid #E2E8F0", borderRadius: 10, padding: 10 }}>
              <small style={{ color: "#64748B" }}>Completed Jobs</small>
              <p style={{ margin: "6px 0 0", fontWeight: 700 }}>42</p>
            </div>
            <div style={{ border: "1px solid #E2E8F0", borderRadius: 10, padding: 10 }}>
              <small style={{ color: "#64748B" }}>Avg Job Ticket Size</small>
              <p style={{ margin: "6px 0 0", fontWeight: 700 }}>₹43,952</p>
            </div>
            <div style={{ border: "1px solid #E2E8F0", borderRadius: 10, padding: 10 }}>
              <small style={{ color: "#64748B" }}>Quote Acceptance Rate</small>
              <p style={{ margin: "6px 0 0", fontWeight: 700 }}>59%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
