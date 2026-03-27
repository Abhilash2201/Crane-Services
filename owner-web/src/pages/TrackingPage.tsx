import { MessageSquare, Phone, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { createRealtimeSocket } from "../lib/realtime";
import { api } from "../lib/api";

const Wrap = styled.div`display: grid; gap: 14px; @media (min-width: 950px) { grid-template-columns: 1.2fr 0.8fr; }`;
export function TrackingPage() {
  const { id } = useParams();
  const [payload, setPayload] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastTracking, setLastTracking] = useState<null | {
    latitude: number;
    longitude: number;
    captured_at: string;
  }>(null);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);

  useEffect(() => {
    const socket = createRealtimeSocket();
    const jobId = payload?.job?.id;
    if (jobId) socket.emit("join:job", jobId);

    socket.on("tracking:updated", (event) => {
      if (!event?.job_id) return;
      if (jobId && event.job_id !== jobId) return;
      setLastTracking(event);
    });

    socket.on("job:status_changed", (event) => {
      if (!event?.requestId && !event?.jobId) return;
      if (jobId && event.jobId !== jobId) return;
      setLiveStatus(event.status);
    });

    return () => {
      if (jobId) socket.emit("leave:job", jobId);
      socket.disconnect();
    };
  }, [payload?.job?.id]);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/owner/requests/${id}/tracking`)
      .then((res) => {
        setPayload(res.data?.data || null);
        setLastTracking(res.data?.data?.lastEvent || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const resolvedStatus = useMemo(
    () => liveStatus || payload?.job?.status || payload?.request?.status || "pending",
    [liveStatus, payload],
  );
  const canCancel = resolvedStatus === "accepted" || resolvedStatus === "assigned";
  const canComplete = resolvedStatus === "working";

  return (
    <Wrap>
      <Card><CardContent style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}><h1 style={{ margin: 0 }}>Request Detail: {id}</h1><Badge variant={resolvedStatus === "working" ? "warning" : "default"}>{resolvedStatus}</Badge></div>
        {loading ? <small style={{ color: "#64748B" }}>Loading...</small> : null}
        <div style={{ display: "grid", gap: 10 }}>
          <h3 style={{ marginBottom: 0 }}>Status Timeline</h3>
          {[
            ["Pending", payload?.request?.created_at],
            ["Accepted", payload?.request?.updated_at],
            ["In Progress", payload?.job?.startedAt || payload?.job?.started_at],
            ["Completed", payload?.job?.completedAt || payload?.job?.completed_at]
          ].map(([title, stamp]) => (
            <div key={title} style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 10 }}>
              <div style={{ width: 14, height: 14, marginTop: 4, borderRadius: "50%", background: stamp ? "#22C55E" : "#FF6200" }} />
              <div style={{ borderLeft: "2px solid #E2E8F0", paddingLeft: 10, paddingBottom: 10 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{title}</p>
                <small style={{ color: "#64748B" }}>
                  {stamp ? new Date(stamp).toLocaleString() : "—"}
                </small>
              </div>
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
        <p style={{ margin: 0 }}><b>Owner:</b> {payload?.owner?.name || "—"}</p>
        <p style={{ margin: 0 }}><b>Driver:</b> {payload?.driver?.name || "—"} {payload?.job?.craneRegistration ? <>| <Truck size={14} /> {payload.job.craneRegistration}</> : null}</p>
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
