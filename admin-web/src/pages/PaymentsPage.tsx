import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AppDataTable } from "../components/ui/datatable";
import type { ColumnDef } from "../components/ui/datatable";
import { api } from "../lib/api";

const currency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const columns: ColumnDef[] = [
  {
    field: "id",
    header: "Payment ID",
    body: (row) => (
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: "#475569",
        }}
      >
        {String(row.id).slice(0, 8).toUpperCase()}
      </span>
    ),
  },
  {
    field: "request_id",
    header: "Request ID",
    body: (row) => row.request_id || "—",
  },
  {
    field: "customer_name",
    header: "Customer",
    sortable: true,
    body: (row) => row.customer_name || "—",
  },
  {
    field: "owner_name",
    header: "Owner",
    sortable: true,
    body: (row) => row.owner_name || "—",
  },
  {
    field: "amount",
    header: "Amount",
    sortable: true,
    body: (row) => (
      <strong style={{ color: "#0A2540" }}>
        {currency(Number(row.amount || 0))}
      </strong>
    ),
  },
  {
    field: "status",
    header: "Status",
    sortable: true,
    body: (row) => (
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color:
            row.status === "paid"
              ? "#16A34A"
              : row.status === "failed"
                ? "#DC2626"
                : "#D97706",
        }}
      >
        {row.status || "—"}
      </span>
    ),
  },
  {
    field: "created_at",
    header: "Created",
    sortable: true,
    body: (row) =>
      row.created_at ? new Date(row.created_at).toLocaleDateString() : "—",
  },
];

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
        <CardContent>
          <AppDataTable
            data={rows}
            columns={columns}
            loading={loading}
            searchable
            searchPlaceholder="Search customer, owner, status…"
            searchFields={["customer_name", "owner_name", "status", "request_id"]}
            actions={<Button variant="outline">Export CSV</Button>}
            emptyMessage="No payments found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
