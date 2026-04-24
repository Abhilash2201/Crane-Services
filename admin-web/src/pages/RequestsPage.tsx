import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Modal } from "../components/ui/modal";
import { createRealtimeSocket } from "../lib/realtime";
import { api, authStore } from "../lib/api";

const sid = (id: string) => id.replace(/-/g, "").slice(0, 6).toUpperCase();

const statusVariant = (status: string) => {
  if (status === "completed") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "in_progress") return "info" as const;
  if (status === "accepted") return "default" as const;
  return "warning" as const;
};

export function RequestsPage() {
  const [query, setQuery] = useState("");
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

  const filtered = useMemo(
    () =>
      rows
        .filter((row) =>
          `${row.id} ${row.customer_name || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .filter((row) =>
          status === "All" ? true : row.status === status,
        )
        .filter((row) => {
          if (!date) return true;
          if (!row.created_at) return false;
          return new Date(row.created_at).toISOString().slice(0, 10) === date;
        }),
    [rows, query, status, date],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Service Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <Input
            placeholder="Search Request ID or Customer"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
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
            onChange={(event) => setDate(event.target.value)}
          />
        </div>

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

        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "Request ID",
                  "Customer",
                  "Pickup Address",
                  "Date/Time",
                  "Status",
                  "Accepted Owner",
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
                  <td colSpan={6} style={{ padding: 12 }}>
                    Loading requests...
                  </td>
                </tr>
              ) : null}
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 12 }}>
                    No requests found.
                  </td>
                </tr>
              ) : null}
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelected(row)}
                >
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}
                  >
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
                      REQ-{sid(row.id)}
                    </span>
                  </td>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}
                  >
                    {row.customer_name || "—"}
                  </td>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}
                  >
                    {row.pickup_address || "—"}
                  </td>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}
                  >
                    {row.created_at
                      ? new Date(row.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}
                  >
                    <Badge variant={statusVariant(row.status)}>
                      {row.status}
                    </Badge>
                  </td>
                  <td
                    style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}
                  >
                    {row.owner_name || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
                  REQ-{sid(selected.id)}
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
