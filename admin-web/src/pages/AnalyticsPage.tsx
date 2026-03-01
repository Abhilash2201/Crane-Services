import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, LineChart } from "../components/ui/charts";
import { cityRequestData, ownerPerformance, peakHourData } from "../data/mockData";
import { Input } from "../components/ui/input";

export function AnalyticsPage() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, color: "#0A2540" }}>Analytics & Reports</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Input type="date" defaultValue="2026-02-01" />
          <Input type="date" defaultValue="2026-03-01" />
        </div>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "2fr 1fr" }}>
        <Card>
          <CardHeader>
            <CardTitle>Requests by City (Map + Bar)</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ border: "1px dashed #CBD5E1", borderRadius: 10, display: "grid", placeItems: "center", minHeight: 220, background: "#F8FAFC", color: "#64748B" }}>
                India Map Heat View (Mock)
              </div>
              <BarChart data={cityRequestData.map((item) => ({ label: item.city, value: item.requests }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={peakHourData.map((item) => ({ label: item.hour, value: item.value }))} />
          </CardContent>
        </Card>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <Card>
          <CardHeader>
            <CardTitle>Owner Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #E2E8F0", padding: 8, fontSize: 12, color: "#64748B" }}>Owner</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #E2E8F0", padding: 8, fontSize: 12, color: "#64748B" }}>Jobs</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #E2E8F0", padding: 8, fontSize: 12, color: "#64748B" }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {ownerPerformance.map((owner) => (
                  <tr key={owner.owner}>
                    <td style={{ padding: 8, borderBottom: "1px solid #E2E8F0" }}>{owner.owner}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #E2E8F0" }}>{owner.jobs}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #E2E8F0" }}>{owner.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver Ratings Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={[
                { label: "5?", value: 182 },
                { label: "4?", value: 94 },
                { label: "3?", value: 26 },
                { label: "2?", value: 9 },
                { label: "1?", value: 3 }
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
