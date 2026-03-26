import { MapPin, MoveRight, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { createRealtimeSocket } from "../lib/realtime";
import { api } from "../lib/api";

export function DispatchPage() {
  const [events, setEvents] = useState<string[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selection, setSelection] = useState<Record<string, { driverId?: string; craneRegistration?: string }>>({});

  useEffect(() => {
    const socket = createRealtimeSocket();

    socket.on("dispatch:job_assigned", (payload) => {
      setEvents((prev) => [`Assigned: ${payload.request_id || payload.id}`, ...prev].slice(0, 5));
    });

    socket.on("job:status_changed", (payload) => {
      setEvents((prev) => [`${payload.jobId} status -> ${payload.status}`, ...prev].slice(0, 5));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    Promise.all([
      api.get("/owner/accepted-requests"),
      api.get("/owner/drivers"),
      api.get("/owner/fleet")
    ])
      .then(([reqRes, driverRes, fleetRes]) => {
        setRequests(reqRes.data?.data || []);
        setDrivers(driverRes.data?.data || []);
        setFleet(fleetRes.data?.data || []);
      })
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load dispatch data."),
      )
      .finally(() => setLoading(false));
  }, []);

  const driverOptions = useMemo(
    () =>
      drivers.map((d: any) => ({
        id: d.id,
        label: `${d.name || "Driver"} (${d.phone || "no phone"})`
      })),
    [drivers]
  );

  const fleetOptions = useMemo(
    () =>
      fleet.map((f: any) => ({
        registration: f.registration,
        label: `${f.name} (${f.registration || "no reg"})`
      })),
    [fleet]
  );

  const handleAssign = async (requestId: string) => {
    const choice = selection[requestId] || {};
    if (!choice.driverId || !choice.craneRegistration) {
      setError("Select driver and crane before dispatch.");
      return;
    }
    try {
      await api.post("/owner/assign-driver", {
        requestId,
        driverId: choice.driverId,
        craneRegistration: choice.craneRegistration
      });
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to assign driver.");
    }
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1>Dispatch Board</h1>
      <p style={{ margin: 0, color: "#64748B" }}>
        Assign drivers/operators and push tasks to driver-pwa for live execution updates.
      </p>
      {loading ? <small style={{ color: "#64748B" }}>Loading...</small> : null}
      {error ? <small style={{ color: "#DC2626" }}>{error}</small> : null}

      {events.length ? (
        <Card>
          <CardContent style={{ display: "grid", gap: 6 }}>
            <strong>Realtime Feed</strong>
            {events.map((event) => (
              <small key={event}>{event}</small>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {requests.map((job) => (
        <Card key={job.id}>
          <CardContent style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0" }}>
                  {job.required_capacity_tons ? `${job.required_capacity_tons}T` : "Crane"} Request
                </h3>
                <p style={{ margin: 0, color: "#64748B" }}>{job.id}</p>
              </div>
              <Badge variant="warning">Accepted</Badge>
            </div>

            <p style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <MapPin size={14} /> {job.pickup_address} <MoveRight size={14} /> {job.drop_address || "Pickup only"}
            </p>
            <p style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <UserRound size={14} /> Assign Driver & Crane
            </p>

            <div style={{ display: "grid", gap: 8 }}>
              <select
                value={selection[job.id]?.driverId || ""}
                onChange={(e) =>
                  setSelection((prev) => ({
                    ...prev,
                    [job.id]: { ...prev[job.id], driverId: e.target.value }
                  }))
                }
                style={{ padding: "10px", borderRadius: 10, border: "1px solid #E2E8F0" }}
              >
                <option value="">Select driver</option>
                {driverOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
              <select
                value={selection[job.id]?.craneRegistration || ""}
                onChange={(e) =>
                  setSelection((prev) => ({
                    ...prev,
                    [job.id]: { ...prev[job.id], craneRegistration: e.target.value }
                  }))
                }
                style={{ padding: "10px", borderRadius: 10, border: "1px solid #E2E8F0" }}
              >
                <option value="">Select crane</option>
                {fleetOptions.map((f) => (
                  <option key={f.registration || f.label} value={f.registration || ""}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button onClick={() => handleAssign(job.id)}>Dispatch Now</Button>
              <Link to={`/tracking/${job.id}`}>
                <Button variant="outline">Open Live Tracking</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
