import { Activity, IndianRupee, Truck, WavesLadder } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";

const earnings = [4.2, 5.1, 4.8, 6.4, 7.3, 6.9, 7.8];

const activity = [
  "REQ-BLR-9910 accepted from Brigade Infra, Whitefield.",
  "Driver Nadeem Shaikh assigned to REQ-MUM-7742.",
  "Invoice INV-2026-281 marked paid (₹1,24,000).",
  "Crane KA-53-MR-2281 moved to maintenance schedule."
];

export function DashboardPage() {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ marginBottom: 0 }}>Welcome, Rajesh Crane Services Pvt Ltd</h1>
      <p style={{ marginTop: 0, color: "#64748B" }}>
        Powerful, role-based owner console for 2-15 crane fleet operations.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
        <Card>
          <CardContent>
            <p style={{ color: "#64748B", marginTop: 0 }}>Total Cranes</p>
            <h3 style={{ margin: "0 0 6px 0" }}>11</h3>
            <Badge variant="outline"><Truck size={14} /> 8 available now</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p style={{ color: "#64748B", marginTop: 0 }}>Active Requests Today</p>
            <h3 style={{ margin: "0 0 6px 0" }}>17</h3>
            <Badge><Activity size={14} /> 5 high urgency</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p style={{ color: "#64748B", marginTop: 0 }}>Monthly Revenue</p>
            <h3 style={{ margin: "0 0 6px 0" }}>₹18,46,000</h3>
            <Badge variant="success"><IndianRupee size={14} /> +12.4% MoM</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p style={{ color: "#64748B", marginTop: 0 }}>Fleet Utilization</p>
            <h3 style={{ margin: "0 0 6px 0" }}>73%</h3>
            <Badge variant="warning"><WavesLadder size={14} /> 2 cranes near full load</Badge>
          </CardContent>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
        <Card>
          <CardContent>
            <h3 style={{ marginTop: 0 }}>Earnings (Last 7 Days, ₹ Lakhs)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", alignItems: "end", gap: 8, height: 180 }}>
              {earnings.map((day, index) => (
                <div key={index} style={{ display: "grid", gap: 6, justifyItems: "center" }}>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 32,
                      height: `${day * 18}px`,
                      borderRadius: 8,
                      background: index === earnings.length - 1 ? "#FF6200" : "#0A2540"
                    }}
                  />
                  <small style={{ color: "#64748B" }}>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</small>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 style={{ marginTop: 0 }}>Recent Activity</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {activity.map((item) => (
                <div key={item} style={{ border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 12px", color: "#334155" }}>
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h3 style={{ marginTop: 0 }}>Sidebar Modes (Open + Collapsed View)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ border: "1px solid #E2E8F0", borderRadius: 10, padding: 10 }}>
              <strong>Open Mode</strong>
              <p style={{ margin: "6px 0 0", color: "#64748B" }}>Full labels + fast navigation for office ops.</p>
            </div>
            <div style={{ border: "1px solid #E2E8F0", borderRadius: 10, padding: 10 }}>
              <strong>Collapsed Mode</strong>
              <p style={{ margin: "6px 0 0", color: "#64748B" }}>Icon-only rail for dense workspace on small screens.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
