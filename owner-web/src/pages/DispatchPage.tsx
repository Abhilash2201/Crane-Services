import { MapPin, MoveRight, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { createRealtimeSocket } from "../lib/realtime";

const readyJobs = [
  {
    id: "REQ-BLR-9382",
    crane: "50T Rough Terrain",
    pickup: "Peenya Yard, Bengaluru",
    drop: "Whitefield Site, Bengaluru",
    driver: "Rakesh N",
    status: "Ready To Dispatch"
  },
  {
    id: "REQ-MUM-5521",
    crane: "Tower Crane",
    pickup: "Navi Mumbai Depot",
    drop: "Powai Site, Mumbai",
    driver: "Nadeem Shaikh",
    status: "Driver Assigned"
  }
];

export function DispatchPage() {
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token") || undefined;
    const socket = createRealtimeSocket(token);

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

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1>Dispatch Board</h1>
      <p style={{ margin: 0, color: "#64748B" }}>
        Assign drivers/operators and push tasks to driver-pwa for live execution updates.
      </p>

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

      {readyJobs.map((job) => (
        <Card key={job.id}>
          <CardContent style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0" }}>{job.crane}</h3>
                <p style={{ margin: 0, color: "#64748B" }}>{job.id}</p>
              </div>
              <Badge variant={job.status === "Ready To Dispatch" ? "warning" : "success"}>{job.status}</Badge>
            </div>

            <p style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <MapPin size={14} /> {job.pickup} <MoveRight size={14} /> {job.drop}
            </p>
            <p style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <UserRound size={14} /> Driver: {job.driver}
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button>{job.status === "Ready To Dispatch" ? "Dispatch Now" : "Reassign Driver"}</Button>
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
