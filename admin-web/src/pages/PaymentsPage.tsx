import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { api } from "../lib/api";

const currency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export function PaymentsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/payments")
      .then((res) => setRows(res.data?.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const total = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const commission = total * 0.15;
    const payoutsPending = total - commission;
    return { total, commission, payoutsPending };
  }, [rows]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          display: "grid",
          gap: 10,
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        }}
      >
        <Card>
          <CardContent>
            <div style={{ color: "#64748B", fontSize: 13 }}>
              Total Collected
            </div>
            <strong style={{ fontSize: 26, color: "#0A2540" }}>
              {currency(totals.total)}
            </strong>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div style={{ color: "#64748B", fontSize: 13 }}>
              Platform Commission (15%)
            </div>
            <strong style={{ fontSize: 26, color: "#0A2540" }}>
              {currency(totals.commission)}
            </strong>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div style={{ color: "#64748B", fontSize: 13 }}>
              Owner Payouts Pending
            </div>
            <strong style={{ fontSize: 26, color: "#0A2540" }}>
              {currency(totals.payoutsPending)}
            </strong>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <CardTitle>Payments</CardTitle>
            <Button variant="outline">Export CSV</Button>
          </div>
        </CardHeader>
        <CardContent>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "Payment ID",
                  "Request ID",
                  "Customer",
                  "Owner",
                  "Amount",
                  "Status",
                  "Created",
                ].map((head) => (
                  <th
                    key={head}
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #E2E8F0",
                      padding: 10,
                      fontSize: 12,
                      color: "#64748B",
                    }}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 12 }}>
                    Loading payments...
                  </td>
                </tr>
              ) : null}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 12 }}>
                    No payments found.
                  </td>
                </tr>
              ) : null}
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                    {row.id}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                    {row.request_id || "—"}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                    {row.customer_name || "—"}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                    {row.owner_name || "—"}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                    {currency(Number(row.amount || 0))}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                    {row.status || "—"}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                    {row.created_at
                      ? new Date(row.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
