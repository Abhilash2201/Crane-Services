import { Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { createRealtimeSocket } from "../lib/realtime";
import { Modal } from "../components/ui/modal";

const jobs = [
  { id: "REQ-BLR-9910", customer: "Brigade Infra Projects", status: "Awaiting Customer Confirmation", variant: "50T Rough Terrain" },
  { id: "REQ-MUM-7742", customer: "Arihant EPC Ltd", status: "Confirmed", variant: "25T Mobile" },
  { id: "REQ-DEL-6651", customer: "Shree Steel Structurals", status: "Assigned to Driver", variant: "100T Crawler" },
  { id: "REQ-BLR-8824", customer: "Kalyani Developers", status: "In Progress", variant: "Tower Crane" }
];

function tone(status: string) {
  if (status === "In Progress") return "warning";
  if (status === "Confirmed" || status === "Assigned to Driver") return "success";
  return "default";
}

export function ActiveJobsPage() {
  const [open, setOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [liveEvents, setLiveEvents] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token") || undefined;
    const socket = createRealtimeSocket(token);

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

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1>My Active Jobs</h1>
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
                <h3 style={{ margin: "0 0 4px 0" }}>{job.id}</h3>
                <p style={{ margin: 0, color: "#64748B" }}>{job.customer} | {job.variant}</p>
              </div>
              <Badge variant={tone(job.status) as "success" | "warning" | "default"}>{job.status}</Badge>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button variant="outline"><Phone size={16} /> Call Customer</Button>
              <Button>Mark Confirmed</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedJob(job.id);
                  setOpen(true);
                }}
              >
                Assign Driver
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 style={{ marginTop: 0 }}>Assign Driver | {selectedJob}</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <label>Driver Name</label>
          <Input placeholder="Choose driver (e.g. Nadeem Shaikh)" />
          <label>Vehicle / Crane Reg No.</label>
          <Input placeholder="KA-53-MR-2281" />
          <label>Dispatch Notes</label>
          <Input placeholder="Entry gate 3, site contact: +91 98xxxxxx12" />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Assign & Notify Driver</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
