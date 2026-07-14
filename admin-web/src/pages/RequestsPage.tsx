import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Modal } from "../components/ui/modal";
import { AppDataTable } from "../components/ui/datatable";
import type { ColumnDef } from "../components/ui/datatable";
import { createRealtimeSocket } from "../lib/realtime";
import { api, authStore } from "../lib/api";

const sid = (id: string) => id.replace(/-/g, "").slice(0, 6).toUpperCase();

const statusVariant = (status: string) => {
  if (status === "completed") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "in_progress") return "info" as const;
  if (status === "accepted") return "teal" as const;
  if (status === "cancelled") return "danger" as const;
  return "default" as const;
};

const columns: ColumnDef[] = [
  {
    field: "ref_id",
    header: "Request ID",
    sortable: true,
    body: (row) => (
      <span
        style={{
          background: "#F1F5F9",
          color: "#475569",
          borderRadius: 6,
          padding: "2px 8px",
          fontSize: 11,
          fontWeight: 700,
          fontFamily: "monospace",
        }}
      >
        {row.ref_id ?? `REQ-${sid(row.id)}`}
      </span>
    ),
  },
  {
    field: "customer_name",
    header: "Customer",
    sortable: true,
    body: (row) => row.customer_name || "—",
  },
  {
    field: "pickup_address",
    header: "Pickup Address",
    body: (row) => row.pickup_address || "—",
  },
  {
    field: "created_at",
    header: "Date/Time",
    sortable: true,
    body: (row) =>
      row.created_at ? new Date(row.created_at).toLocaleString() : "—",
  },
  {
    field: "status",
    header: "Status",
    sortable: true,
    body: (row) => (
      <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
    ),
  },
  {
    field: "owner_name",
    header: "Accepted Owner",
    sortable: true,
    body: (row) => row.owner_name || "—",
  },
];

export function RequestsPage() {
  const [status, setStatus] = useState("All");
  const [date, setDate] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [liveEvents, setLiveEvents] = useState<string[]>([]);

  useEffect(() => {
    const token = authStore.read()?.accessToken;
    const socket = createRealtimeSocket(token);

    socket.on("tracking:updated", (payload) => {
      setLiveEvents((prev) =>
        [`Tracking ping: JOB-${sid(payload.job_id)}`, ...prev].slice(0, 6),
      );
    });
    socket.on("job:status_changed", (payload) => {
      setLiveEvents((prev) =>
        [`JOB-${sid(payload.jobId)} → ${payload.status}`, ...prev].slice(0, 6),
      );
    });
    socket.on("request:accepted", (payload) => {
      setLiveEvents((prev) =>
        [`Request accepted: REQ-${sid(payload.id)}`, ...prev].slice(0, 6),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    api
      .get("/admin/requests")
      .then((res) => setRows(res.data?.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  // AppDataTable handles text search; we only pre-filter by status and date
  const filtered = useMemo(
    () =>
      rows
        .filter((row) => (status === "All" ? true : row.status === status))
        .filter((row) => {
          if (!date) return true;
          if (!row.created_at) return false;
          return new Date(row.created_at).toISOString().slice(0, 10) === date;
        }),
    [rows, status, date],
  );

  return (
    <Card>
      <CardContent>
        {liveEvents.length ? (
          <div
            style={{
              border: "1px solid #E2E8F0",
              borderRadius: 10,
              padding: 10,
              marginBottom: 12,
              background: "#F8FAFC",
            }}
          >
            <strong style={{ display: "block", marginBottom: 4 }}>
              Live Ops Feed
            </strong>
            {liveEvents.map((item) => (
              <div key={item} style={{ fontSize: 13, color: "#334155" }}>
                {item}
              </div>
            ))}
          </div>
        ) : null}

        <AppDataTable
          data={filtered}
          columns={columns}
          loading={loading}
          onRowClick={setSelected}
          searchable
          searchPlaceholder="Search ID, customer, address…"
          searchFields={["ref_id", "customer_name", "pickup_address", "owner_name", "status"]}
          filters={
            <>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: 140, minHeight: 36, fontSize: 13 }}
              >
                <option>All</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: 140, minHeight: 36, fontSize: 13 }}
              />
            </>
          }
          emptyMessage="No requests found."
        />

        <Modal
          open={Boolean(selected)}
          title="Request Details"
          onClose={() => setSelected(null)}
        >
          {selected && (
            <div style={{ display: "grid", gap: 12 }}>
              <strong style={{ color: "#0A2540" }}>
                <span
                  style={{
                    background: "#F1F5F9",
                    color: "#475569",
                    borderRadius: 6,
                    padding: "2px 8px",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "monospace",
                    marginRight: 8,
                  }}
                >
                  {selected.ref_id ?? `REQ-${sid(selected.id)}`}
                </span>
                {selected.customer_name || "Customer"}
              </strong>
              <div style={{ color: "#334155", fontSize: 14 }}>
                Required Capacity:{" "}
                {selected.required_capacity_tons
                  ? `${selected.required_capacity_tons} tons`
                  : "—"}
              </div>
              <div style={{ color: "#334155", fontSize: 14 }}>
                Pickup: {selected.pickup_address || "—"}
              </div>
              <div style={{ color: "#334155", fontSize: 14 }}>
                Status: {selected.status}
              </div>
              <div
                style={{
                  border: "1px dashed #CBD5E1",
                  borderRadius: 10,
                  height: 180,
                  display: "grid",
                  placeItems: "center",
                  color: "#64748B",
                  background: "#F8FAFC",
                }}
              >
                Map Preview - {selected.pickup_address || "Location"}
              </div>
            </div>
          )}
        </Modal>
      </CardContent>
    </Card>
  );
}
