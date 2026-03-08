import { MessageSquare, Phone, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { createRealtimeSocket } from "../lib/realtime";

const Wrap = styled.div`display: grid; gap: 14px; @media (min-width: 950px) { grid-template-columns: 1.2fr 0.8fr; }`;
const timelines: Record<string, string[][]> = {
  "REQ-BLR-9382": [["Lead", "28 Feb 2026, 09:05 AM"], ["Quoted", "28 Feb 2026, 09:14 AM"], ["Accepted", "28 Feb 2026, 09:26 AM"], ["Confirmed", "28 Feb 2026, 09:48 AM"]],
  "REQ-MUM-5521": [["Lead", "28 Feb 2026, 08:42 AM"], ["Quoted", "28 Feb 2026, 08:58 AM"], ["Accepted", "28 Feb 2026, 09:20 AM"], ["Confirmed", "28 Feb 2026, 10:05 AM"], ["In Progress", "28 Feb 2026, 02:10 PM"]],
  "REQ-DEL-4432": [["Lead", "28 Feb 2026, 11:10 AM"], ["Quoted", "28 Feb 2026, 11:24 AM"], ["Accepted", "28 Feb 2026, 11:56 AM"], ["Confirmed", "28 Feb 2026, 12:40 PM"]]
};

export function TrackingPage() {
  const { id } = useParams();
  const timeline = timelines[id ?? ""] ?? timelines["REQ-MUM-5521"];
  const currentStatus = timeline[timeline.length - 1][0];
  const [lastTracking, setLastTracking] = useState<null | {
    latitude: number;
    longitude: number;
    captured_at: string;
  }>(null);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token") || undefined;
    const socket = createRealtimeSocket(token);
    if (id) socket.emit("join:job", id);

    socket.on("tracking:updated", (event) => {
      if (!event?.job_id) return;
      if (id && event.job_id !== id) return;
      setLastTracking(event);
    });

    socket.on("job:status_changed", (event) => {
      if (!event?.requestId && !event?.jobId) return;
      if (id && event.requestId !== id && event.jobId !== id) return;
      setLiveStatus(event.status);
    });

    return () => {
      if (id) socket.emit("leave:job", id);
      socket.disconnect();
    };
  }, [id]);

  const resolvedStatus = useMemo(() => liveStatus || currentStatus, [liveStatus, currentStatus]);
  const canCancel = resolvedStatus === "Confirmed";
  const canComplete = resolvedStatus === "In Progress";

  return (
    <Wrap>
      <Card><CardContent style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}><h1 style={{ margin: 0 }}>Request Detail: {id}</h1><Badge variant={resolvedStatus === "In Progress" ? "warning" : "default"}>{resolvedStatus}</Badge></div>
        <div style={{ display: "grid", gap: 10 }}>
          <h3 style={{ marginBottom: 0 }}>Status Timeline</h3>
          {timeline.map(([title, stamp], index) => (
            <div key={title} style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 10 }}>
              <div style={{ width: 14, height: 14, marginTop: 4, borderRadius: "50%", background: index === timeline.length - 1 ? "#22C55E" : "#FF6200" }} />
              <div style={{ borderLeft: "2px solid #E2E8F0", paddingLeft: 10, paddingBottom: 10 }}><p style={{ margin: 0, fontWeight: 700 }}>{title}</p><small style={{ color: "#64748B" }}>{stamp}</small></div>
            </div>
          ))}
        </div>
        <div>
          <h3 style={{ marginBottom: 8 }}>Live Map Preview</h3>
          <div style={{ height: 260, borderRadius: 14, border: "1px solid #E2E8F0", background: "linear-gradient(130deg,#dbeafe,#e2e8f0)", display: "grid", placeItems: "center", padding: 12, textAlign: "center" }}>
            {lastTracking ? (
              <div>
                <div>Live coordinates</div>
                <strong>{lastTracking.latitude.toFixed(5)}, {lastTracking.longitude.toFixed(5)}</strong>
                <div style={{ color: "#475569", marginTop: 4 }}>Updated: {new Date(lastTracking.captured_at).toLocaleTimeString()}</div>
              </div>
            ) : (
              "Waiting for driver tracking signal"
            )}
          </div>
        </div>
      </CardContent></Card>

      <Card><CardContent style={{ display: "grid", gap: 12 }}>
        <h3 style={{ margin: 0 }}>Assigned Owner & Driver</h3>
        <p style={{ margin: 0 }}><b>Owner:</b> Sandeep Yadav (Yadav Crane Services)</p>
        <p style={{ margin: 0 }}><b>Driver:</b> Irfan Khan | <Truck size={14} /> DL 1LX 8821</p>
        <p style={{ margin: 0 }}><b>Safety:</b> <ShieldCheck size={14} /> Verified documents + insurance active</p>
        <div style={{ display: "grid", gap: 10 }}>
          <Button><Phone size={16} /> Call Driver</Button>
          <Button variant="outline"><MessageSquare size={16} /> Chat Support</Button>
          {canComplete ? <Button variant="success">Mark Job Completed</Button> : null}
          {canCancel ? <Button variant="ghost" style={{ color: "#DC2626" }}>Cancel Before Dispatch</Button> : null}
        </div>
      </CardContent></Card>
    </Wrap>
  );
}
