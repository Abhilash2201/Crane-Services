import { Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { createRealtimeSocket } from "../lib/realtime";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

function tone(status: string) {
  if (status === "working" || status === "en_route") return "warning";
  if (status === "completed") return "success";
  return "default";
}

export function ActiveJobsPage() {
  const [liveEvents, setLiveEvents] = useState<string[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const socket = createRealtimeSocket();

    socket.on("dispatch:job_assigned", (payload) => {
      setLiveEvents((prev) => [`Driver assigned for ${payload.request_id || payload.id}`, ...prev].slice(0, 5));
    });

    socket.on("job:status_changed", (payload) => {
      setLiveEvents((prev) => [`${payload.jobId} changed to ${payload.status}`, ...prev].slice(0, 5));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    api
      .get("/owner/jobs")
      .then((res) => setJobs(res.data?.data || []))
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load jobs."),
      )
      .finally(() => setLoading(false));
  }, []);

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
              <small key={event} style={{ color: "#334155" }}>{event}</small>
            ))}
          </CardContent>
        </Card>
      ) : null}
      {jobs.map((job) => (
        <Card key={job.id}>
          <CardContent style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0" }}>{job.request_id}</h3>
                <p style={{ margin: 0, color: "#64748B" }}>
                  {job.pickup_address} {job.drop_address ? `→ ${job.drop_address}` : ""}
                </p>
              </div>
              <Badge variant={tone(job.status) as "success" | "warning" | "default"}>{job.status}</Badge>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button variant="outline"><Phone size={16} /> Call Customer</Button>
              <Link to={`/tracking/${job.request_id}`}>
                <Button variant="outline">Open Tracking</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
