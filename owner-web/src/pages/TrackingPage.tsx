import { MessageSquare, Phone, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { createRealtimeSocket } from "../lib/realtime";
import { api } from "../lib/api";

const Wrap = styled.div`display: grid; gap: 14px; @media (min-width: 950px) { grid-template-columns: 1.2fr 0.8fr; }`;
const MapWrap = styled.div`height: 260px; border-radius: 14px; border: 1px solid #E2E8F0; overflow: hidden;`;
const driverIcon = L.icon({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
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
  const [autoCenter, setAutoCenter] = useState(true);

  useEffect(() => {
    const jobId = payload?.job?.id;
    if (!jobId) return;

    const socket = createRealtimeSocket();
    socket.emit("join:job", jobId);

    socket.on("tracking:updated", (event) => {
      if (!event?.job_id) return;
      if (event.job_id !== jobId) return;
      setLastTracking(event);
    });

    socket.on("job:status_changed", (event) => {
      if (!event?.requestId && !event?.jobId) return;
      if (event.jobId && event.jobId !== jobId) return;
      setLiveStatus(event.status);
    });

    return () => {
      socket.emit("leave:job", jobId);
      socket.disconnect();
    };
  }, [payload?.job?.id, payload?.request?.id]);

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
  const mapCenter = useMemo<[number, number]>(
    () =>
      lastTracking
        ? [lastTracking.latitude, lastTracking.longitude]
        : [12.9716, 77.5946],
    [lastTracking],
  );

  const FlyToPosition = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
      if (!autoCenter) return;
      map.setView(center, map.getZoom(), { animate: true });
    }, [center, map, autoCenter]);
    return null;
  };

  const MapInteractionWatcher = () => {
    useMapEvents({
      dragstart() {
        setAutoCenter(false);
      },
      zoomstart() {
        setAutoCenter(false);
      },
    });
    return null;
  };

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
          <MapWrap>
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FlyToPosition center={mapCenter} />
              <MapInteractionWatcher />
              {lastTracking ? (
                <Marker
                  position={[lastTracking.latitude, lastTracking.longitude]}
                  icon={driverIcon}
                />
              ) : null}
            </MapContainer>
          </MapWrap>
          <div style={{ marginTop: 8, color: "#475569" }}>
            {lastTracking ? (
              <>
                <div>Live coordinates</div>
                <strong>{lastTracking.latitude.toFixed(5)}, {lastTracking.longitude.toFixed(5)}</strong>
                <div style={{ marginTop: 4 }}>Updated: {new Date(lastTracking.captured_at).toLocaleTimeString()}</div>
              </>
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
