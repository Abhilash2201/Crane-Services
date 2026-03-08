import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { serviceRequests } from "../data/mockData";
import { Badge } from "../components/ui/badge";
import { Modal } from "../components/ui/modal";
import { createRealtimeSocket } from "../lib/realtime";

const statusVariant = (status: string) => {
  if (status === "Completed") return "success" as const;
  if (status === "Open") return "warning" as const;
  if (status === "In Progress") return "info" as const;
  if (status === "Confirmed") return "default" as const;
  return "warning" as const;
};

export function RequestsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [variant, setVariant] = useState("All");
  const [city, setCity] = useState("All");
  const [selected, setSelected] = useState<null | (typeof serviceRequests)[number]>(null);
  const [liveEvents, setLiveEvents] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token") || undefined;
    const socket = createRealtimeSocket(token);

    socket.on("tracking:updated", (payload) => {
      setLiveEvents((prev) => [`Tracking ping: ${payload.job_id}`, ...prev].slice(0, 6));
    });
    socket.on("job:status_changed", (payload) => {
      setLiveEvents((prev) => [`${payload.jobId} -> ${payload.status}`, ...prev].slice(0, 6));
    });
    socket.on("request:accepted", (payload) => {
      setLiveEvents((prev) => [`Request accepted: ${payload.id}`, ...prev].slice(0, 6));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filtered = useMemo(
    () =>
      serviceRequests
        .filter((row) => `${row.id} ${row.customer}`.toLowerCase().includes(query.toLowerCase()))
        .filter((row) => (status === "All" ? true : row.status === status))
        .filter((row) => (variant === "All" ? true : row.variant === variant))
        .filter((row) => (city === "All" ? true : row.location.includes(city))),
    [query, status, variant, city]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Service Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          <Input placeholder="Search Request ID or Customer" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All</option>
            <option>Open</option>
            <option>Accepted</option>
            <option>Confirmed</option>
            <option>In Progress</option>
            <option>Completed</option>
          </Select>
          <Input type="date" />
          <Select value={variant} onChange={(event) => setVariant(event.target.value)}>
            <option>All</option>
            {Array.from(new Set(serviceRequests.map((row) => row.variant))).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
          <Select value={city} onChange={(event) => setCity(event.target.value)}>
            <option>All</option>
            <option>Bengaluru</option>
            <option>Mumbai</option>
            <option>Delhi</option>
          </Select>
        </div>

        {liveEvents.length ? (
          <div style={{ border: "1px solid #E2E8F0", borderRadius: 10, padding: 10, marginBottom: 12, background: "#F8FAFC" }}>
            <strong style={{ display: "block", marginBottom: 4 }}>Live Ops Feed</strong>
            {liveEvents.map((item) => (
              <div key={item} style={{ fontSize: 13, color: "#334155" }}>{item}</div>
            ))}
          </div>
        ) : null}

        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Request ID", "Customer", "Required Variant", "Location", "Date/Time", "Status", "Accepted Owner", "Assigned Driver"].map((head) => (
                  <th key={head} style={{ textAlign: "left", borderBottom: "1px solid #E2E8F0", padding: 10, fontSize: 12, color: "#64748B" }}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} style={{ cursor: "pointer" }} onClick={() => setSelected(row)}>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{row.id}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{row.customer}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{row.variant}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{row.location}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{row.time}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                    <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{row.owner}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{row.driver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal open={Boolean(selected)} title="Request Details" onClose={() => setSelected(null)}>
          {selected && (
            <div style={{ display: "grid", gap: 12 }}>
              <strong style={{ color: "#0A2540" }}>{selected.id} - {selected.customer}</strong>
              <div style={{ color: "#334155", fontSize: 14 }}>Variant: {selected.variant}</div>
              <div style={{ color: "#334155", fontSize: 14 }}>Location: {selected.location}</div>
              <div style={{ color: "#334155", fontSize: 14 }}>Timeline: Opened 08:45 AM - Owner Accepted 09:03 AM - Driver Assigned 09:08 AM - {selected.status}</div>
              <div style={{ border: "1px dashed #CBD5E1", borderRadius: 10, height: 180, display: "grid", placeItems: "center", color: "#64748B", background: "#F8FAFC" }}>
                Map Preview - {selected.location}
              </div>
            </div>
          )}
        </Modal>
      </CardContent>
    </Card>
  );
}
