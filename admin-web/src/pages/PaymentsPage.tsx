import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { payments } from "../data/mockData";
import { Button } from "../components/ui/button";

const currency = (value: number) => `?${value.toLocaleString("en-IN")}`;

export function PaymentsPage() {
  const total = payments.reduce((sum, row) => sum + row.amount, 0);
  const commission = payments.reduce((sum, row) => sum + row.commission, 0);
  const payoutsPending = 245600;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <Card>
          <CardContent>
            <div style={{ color: "#64748B", fontSize: 13 }}>Total Collected</div>
            <strong style={{ fontSize: 26, color: "#0A2540" }}>{currency(total)}</strong>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div style={{ color: "#64748B", fontSize: 13 }}>Platform Commission (15%)</div>
            <strong style={{ fontSize: 26, color: "#0A2540" }}>{currency(commission)}</strong>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div style={{ color: "#64748B", fontSize: 13 }}>Owner Payouts Pending</div>
            <strong style={{ fontSize: 26, color: "#0A2540" }}>{currency(payoutsPending)}</strong>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <CardTitle>Completed Jobs & Commission Breakdown</CardTitle>
            <Button variant="outline">Export CSV</Button>
          </div>
        </CardHeader>
        <CardContent>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Job ID", "Request ID", "City", "Gross Amount", "Commission (15%)", "Owner Payout"].map((head) => (
                  <th key={head} style={{ textAlign: "left", borderBottom: "1px solid #E2E8F0", padding: 10, fontSize: 12, color: "#64748B" }}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((row) => (
                <tr key={row.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{row.id}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{row.requestId}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{row.city}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{currency(row.amount)}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{currency(row.commission)}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{currency(row.ownerPayout)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
