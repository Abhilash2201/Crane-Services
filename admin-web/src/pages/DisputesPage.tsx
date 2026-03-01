import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { disputes } from "../data/mockData";
import { Badge } from "../components/ui/badge";

export function DisputesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Disputes & Support</CardTitle>
      </CardHeader>
      <CardContent>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Dispute ID", "Request ID", "Complainant", "Reason", "Evidence", "Status"].map((head) => (
                <th key={head} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #E2E8F0", fontSize: 12, color: "#64748B" }}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {disputes.map((row) => (
              <tr key={row.id}>
                <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{row.id}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{row.requestId}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{row.complainant}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{row.reason}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <img src="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?w=60" alt="evidence" width="44" height="34" style={{ borderRadius: 6, objectFit: "cover" }} />
                    <img src="https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=60" alt="evidence" width="44" height="34" style={{ borderRadius: 6, objectFit: "cover" }} />
                  </div>
                </td>
                <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                  <Badge variant={row.status === "Resolved" ? "success" : "warning"}>{row.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
