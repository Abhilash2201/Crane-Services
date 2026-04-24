import { MapPin, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { createRealtimeSocket } from "../lib/realtime";
import { api } from "../lib/api";

const sid = (id: string) => id.replace(/-/g, "").slice(0, 6).toUpperCase();

function tone(status: string) {
  if (status === "working" || status === "en_route") return "warning";
  if (status === "completed") return "success";
  if (status === "cancelled") return "danger";
  return "default";
}

export function ActiveJobsPage() {
  const [liveEvents, setLiveEvents] = useState<string[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reassigning, setReassigning] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [selection, setSelection] = useState<
    Record<string, { driverId?: string; craneRegistration?: string }>
  >({});

  useEffect(() => {
    const socket = createRealtimeSocket();

    socket.on("dispatch:job_assigned", (payload) => {
      setLiveEvents((prev) =>
        [`Driver assigned: JOB-${sid(payload.request_id || payload.id)}`, ...prev].slice(0, 5)
      );
      setJobs((prev) =>
        prev.map((j) =>
          j.request_id === (payload.request_id || payload.id)
            ? { ...j, driver_id: payload.driver_id, crane_registration: payload.crane_registration }
            : j
        )
      );
    });

    socket.on("job:status_changed", (payload) => {
      setLiveEvents((prev) =>
        [`JOB-${sid(payload.jobId)} → ${payload.status}`, ...prev].slice(0, 5)
      );
      setJobs((prev) =>
        prev.map((j) => (j.id === payload.jobId ? { ...j, status: payload.status } : j))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    Promise.all([
      api.get("/owner/jobs"),
      api.get("/owner/drivers"),
      api.get("/owner/fleet"),
    ])
      .then(([jobRes, driverRes, fleetRes]) => {
        setJobs(jobRes.data?.data || []);
        setDrivers(driverRes.data?.data || []);
        setFleet(fleetRes.data?.data || []);
      })
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load jobs.")
      )
      .finally(() => setLoading(false));
  }, []);

  const driverOptions = useMemo(
    () =>
      drivers.map((d: any) => ({
        id: d.id,
        label: `${d.name || "Driver"} (${d.phone || "no phone"})`,
      })),
    [drivers]
  );

  const fleetOptions = useMemo(
    () =>
      fleet.map((f: any) => ({
        registration: f.registration,
        label: `${f.name} (${f.registration || "no reg"})`,
      })),
    [fleet]
  );

  const handleReassign = async (jobId: string, requestId: string) => {
    const choice = selection[jobId] || {};
    if (!choice.driverId || !choice.craneRegistration) {
      setError("Select a driver and crane to reassign.");
      return;
    }
    try {
      await api.post("/owner/assign-driver", {
        requestId,
        driverId: choice.driverId,
        craneRegistration: choice.craneRegistration,
      });
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                driver_id: choice.driverId,
                crane_registration: choice.craneRegistration,
                driver_name: drivers.find((d) => d.id === choice.driverId)?.name || "",
              }
            : j
        )
      );
      setReassigning(null);
      setSelection((prev) => { const next = { ...prev }; delete next[jobId]; return next; });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to reassign driver.");
    }
  };

  const handleCancel = async (jobId: string) => {
    try {
      await api.patch(`/owner/jobs/${jobId}/cancel`);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: "cancelled" } : j))
      );
      setCancelling(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to cancel job.");
    }
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1>My Active Jobs</h1>
      {loading ? <small style={{ color: "#64748B" }}>Loading...</small> : null}
      {error ? <small style={{ color: "#DC2626" }}>{error}</small> : null}

      {liveEvents.length ? (
        <Card>
          <CardContent style={{ display: "grid", gap: 6 }}>
            <strong>Live Updates</strong>
            {liveEvents.map((event) => (
              <small key={event} style={{ color: "#334155" }}>
                {event}
              </small>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {!loading && !jobs.length ? (
        <Card>
          <CardContent>
            <small style={{ color: "#64748B" }}>No jobs found.</small>
          </CardContent>
        </Card>
      ) : null}

      {jobs.map((job) => {
        const isAssigned = job.status === "assigned";
        const isReassigning = reassigning === job.id;
        const isCancelling = cancelling === job.id;

        return (
          <Card key={job.id}>
            <CardContent style={{ display: "grid", gap: 10 }}>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ display: "grid", gap: 4 }}>
                  <span
                    style={{
                      background: "#F1F5F9",
                      color: "#475569",
                      borderRadius: 6,
                      padding: "2px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "monospace",
                      display: "inline-block",
                    }}
                  >
                    JOB-{sid(job.id)}
                  </span>
                  <p style={{ margin: 0, color: "#64748B", fontSize: 13 }}>
                    <MapPin size={12} style={{ verticalAlign: "middle" }} />{" "}
                    {job.pickup_address || "—"}
                  </p>
                </div>
                <Badge variant={tone(job.status) as any}>{job.status.replace("_", " ")}</Badge>
              </div>

              {/* Driver + Crane info */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  fontSize: 13,
                  color: "#334155",
                }}
              >
                <span>
                  <UserRound size={13} style={{ verticalAlign: "middle" }} />{" "}
                  <b>Driver:</b> {job.driver_name || "—"}
                </span>
                <span>
                  <b>Crane:</b>{" "}
                  {job.crane_registration ? (
                    <span
                      style={{
                        background: "#FFF7ED",
                        color: "#9A3412",
                        borderRadius: 6,
                        padding: "1px 7px",
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: "monospace",
                        textTransform: "uppercase",
                      }}
                    >
                      {job.crane_registration}
                    </span>
                  ) : (
                    "—"
                  )}
                </span>
              </div>

              {/* Reassign form (inline, only when reassigning this job) */}
              {isReassigning ? (
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    padding: 12,
                    background: "#F8FAFC",
                    borderRadius: 10,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <strong style={{ fontSize: 13 }}>Reassign Driver</strong>
                  <select
                    value={selection[job.id]?.driverId || ""}
                    onChange={(e) =>
                      setSelection((prev) => ({
                        ...prev,
                        [job.id]: { ...prev[job.id], driverId: e.target.value },
                      }))
                    }
                    style={{
                      padding: "10px",
                      borderRadius: 10,
                      border: "1px solid #E2E8F0",
                      background: "#fff",
                    }}
                  >
                    <option value="">Select new driver</option>
                    {driverOptions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selection[job.id]?.craneRegistration || ""}
                    onChange={(e) =>
                      setSelection((prev) => ({
                        ...prev,
                        [job.id]: { ...prev[job.id], craneRegistration: e.target.value },
                      }))
                    }
                    style={{
                      padding: "10px",
                      borderRadius: 10,
                      border: "1px solid #E2E8F0",
                      background: "#fff",
                    }}
                  >
                    <option value="">Select crane</option>
                    {fleetOptions.map((f) => (
                      <option key={f.registration || f.label} value={f.registration || ""}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button onClick={() => handleReassign(job.id, job.request_id)}>
                      Confirm Reassign
                    </Button>
                    <Button variant="ghost" onClick={() => setReassigning(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* Cancel confirmation (inline) */}
              {isCancelling ? (
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    padding: 12,
                    background: "#FFF1F2",
                    borderRadius: 10,
                    border: "1px solid #FECDD3",
                  }}
                >
                  <strong style={{ fontSize: 13, color: "#9F1239" }}>
                    Cancel this job?
                  </strong>
                  <small style={{ color: "#64748B" }}>
                    This will mark the job as cancelled and notify the driver. Only possible while the driver hasn't started moving.
                  </small>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="outline" onClick={() => handleCancel(job.id)}>
                      Yes, Cancel Job
                    </Button>
                    <Button variant="ghost" onClick={() => setCancelling(null)}>
                      Keep Job
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link to={`/tracking/${job.request_id}`}>
                  <Button variant="outline">Open Tracking</Button>
                </Link>
                {isAssigned && !isReassigning && !isCancelling ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setReassigning(job.id);
                        setCancelling(null);
                      }}
                    >
                      Reassign Driver
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCancelling(job.id);
                        setReassigning(null);
                      }}
                      style={{ color: "#DC2626", borderColor: "#FECDD3" }}
                    >
                      Cancel Job
                    </Button>
                  </>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
