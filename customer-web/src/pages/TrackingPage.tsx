import { MessageSquare, Phone, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-hot-toast";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { api, socket } from "../lib/api";

const Wrap = styled.div`
  display: grid;
  gap: 14px;
  @media (min-width: 950px) {
    grid-template-columns: 1.2fr 0.8fr;
  }
`;

type RequestItem = {
  id: string | number;
  ref_id?: string | null;
  pickup_address: string;
  drop_address?: string | null;
  status: string;
  scheduled_at?: string | null;
  created_at: string;
  owner_id?: string | null;
};

type TrackingPayload = {
  request: RequestItem;
  owner: { id: string; name: string; phone?: string | null } | null;
  driver: { id: string; name: string; phone?: string | null } | null;
  job: {
    id: string;
    status: string;
    craneRegistration?: string | null;
    startedAt?: string | null;
    completedAt?: string | null;
  } | null;
  lastEvent: {
    latitude: number;
    longitude: number;
    speed_kmph?: number | null;
    heading?: number | null;
    captured_at: string;
  } | null;
};

const statusSteps = ["Pending", "Accepted", "In Progress", "Completed"];

const mapStatus = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "completed") return { label: "Completed", index: 3 };
  if (normalized === "cancelled" || normalized === "canceled") {
    return { label: "Cancelled", index: 0 };
  }
  if (normalized === "accepted") return { label: "Accepted", index: 1 };
  if (normalized === "in_progress" || normalized === "in progress") {
    return { label: "In Progress", index: 2 };
  }
  return { label: "Pending", index: 0 };
};

export function TrackingPage() {
  const { id } = useParams();
  const [payload, setPayload] = useState<TrackingPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const trackingIdPromise =
      id === "latest"
        ? api
            .get("/customer/requests")
            .then((res) => {
              const rows: { id: string }[] = res.data?.data || [];
              return rows.length ? rows[0].id : null;
            })
            .catch(() => null)
        : Promise.resolve(id);

    trackingIdPromise
      .then((trackingId) => {
        if (!trackingId) {
          setPayload(null);
          return null;
        }
        return api.get(`/customer/requests/${trackingId}/tracking`);
      })
      .then((res) => {
        if (!res) return;
        setPayload(res.data?.data || null);
        const jobId = res.data?.data?.job?.id;
        if (jobId) {
          socket.connect();
          socket.emit("join:job", jobId);
        }
      })
      .then((res) => {
        return res;
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message ||
            "Unable to load tracking data. Please try again.",
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!apiKey) return;
    if ((window as any).google?.maps) {
      setMapsReady(true);
      return;
    }

    const scriptId = "google-maps-core";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      const onLoad = () => setMapsReady(true);
      existing.addEventListener("load", onLoad);
      return () => existing.removeEventListener("load", onLoad);
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    const onLoad = () => setMapsReady(true);
    script.addEventListener("load", onLoad);
    document.head.appendChild(script);
    return () => script.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (!mapsReady || !mapRef.current || !payload?.lastEvent) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    const position = {
      lat: payload.lastEvent.latitude,
      lng: payload.lastEvent.longitude,
    };

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: position,
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
      });
    } else {
      mapInstanceRef.current.setCenter(position);
    }

    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
      });
    } else {
      markerRef.current.setPosition(position);
    }
  }, [mapsReady, payload?.lastEvent]);

  useEffect(() => {
    const onTrackingUpdated = (event: TrackingPayload["lastEvent"]) => {
      if (!event) return;
      setPayload((prev) =>
        prev
          ? {
              ...prev,
              lastEvent: event
            }
          : prev,
      );
    };

    const onJobStatusChanged = (event: { jobId: string; requestId: string; status: string }) => {
      setPayload((prev) =>
        prev && prev.job?.id === event.jobId
          ? {
              ...prev,
              job: { ...prev.job, status: event.status },
              request: { ...prev.request, status: event.status === "completed" ? "completed" : prev.request.status }
            }
          : prev,
      );
    };

    socket.on("tracking:updated", onTrackingUpdated);
    socket.on("job:status_changed", onJobStatusChanged);
    return () => {
      socket.off("tracking:updated", onTrackingUpdated);
      socket.off("job:status_changed", onJobStatusChanged);
      if (payload?.job?.id) socket.emit("leave:job", payload.job.id);
    };
  }, [payload?.job?.id]);

  const statusMeta = useMemo(
    () => mapStatus(payload?.request?.status || "pending"),
    [payload],
  );
  const canCancel =
    statusMeta.label === "Pending" ||
    statusMeta.label === "Accepted" ||
    statusMeta.label === "In Progress";

  const handleCancel = () => {
    if (!id || cancelling) return;
    setCancelling(true);
    api
      .patch(`/customer/requests/${id}/cancel`)
      .then((res) => {
        const next = res.data?.data;
        if (next && payload?.request) {
          setPayload({
            ...payload,
            request: { ...payload.request, status: next.status },
          });
        }
        toast.success("Request cancelled.");
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message ||
            "Unable to cancel request. Please try again.",
        );
      })
      .finally(() => setCancelling(false));
  };

  return (
    <Wrap>
      <Card>
        <CardContent style={{ display: "grid", gap: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <h1 style={{ margin: 0 }}>
              Request Detail: {payload?.request?.ref_id ?? id}
            </h1>
            <Badge
              variant={
                statusMeta.label === "In Progress"
                  ? "warning"
                  : statusMeta.label === "Completed"
                    ? "success"
                    : "default"
              }
            >
              {statusMeta.label}
            </Badge>
          </div>

          {loading ? (
            <small style={{ color: "#64748B" }}>Loading...</small>
          ) : payload?.request ? (
            <>
              <div style={{ display: "grid", gap: 6 }}>
                <div>
                  <b>Pickup:</b> {payload.request.pickup_address}
                </div>
                <div>
                  <b>Drop:</b> {payload.request.drop_address || "Pickup only"}
                </div>
                <div>
                  <b>Scheduled:</b>{" "}
                  {payload.request.scheduled_at
                    ? new Date(payload.request.scheduled_at).toLocaleString()
                    : "Not scheduled"}
                </div>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <h3 style={{ marginBottom: 0 }}>Status Timeline</h3>
                {statusSteps.map((step, index) => (
                  <div
                    key={step}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "20px 1fr",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        marginTop: 4,
                        borderRadius: "50%",
                        background:
                          index <= statusMeta.index ? "#22C55E" : "#E2E8F0",
                      }}
                    />
                    <div
                      style={{
                        borderLeft: "2px solid #E2E8F0",
                        paddingLeft: 10,
                        paddingBottom: 10,
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: 700 }}>{step}</p>
                      <small style={{ color: "#64748B" }}>
                        {index === 0
                          ? new Date(payload.request.created_at).toLocaleString()
                          : index === statusMeta.index
                            ? "Current status"
                            : ""}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{ marginBottom: 8 }}>Live Map Preview</h3>
                <div
                  style={{
                    height: 260,
                    borderRadius: 14,
                    border: "1px solid #E2E8F0",
                    background: "linear-gradient(130deg,#dbeafe,#e2e8f0)",
                    overflow: "hidden",
                  }}
                >
                  {payload.lastEvent && mapsReady ? (
                    <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {payload.lastEvent
                        ? `Lat ${payload.lastEvent.latitude.toFixed(5)}, Lng ${payload.lastEvent.longitude.toFixed(5)}`
                        : "Live tracking will appear here once dispatch starts."}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <small style={{ color: "#64748B" }}>
              No tracking data available for this request.
            </small>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent style={{ display: "grid", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Assigned Owner & Driver</h3>
          <p style={{ margin: 0 }}>
            <b>Owner:</b>{" "}
            {payload?.owner
              ? `${payload.owner.name}${payload.owner.phone ? ` (${payload.owner.phone})` : ""}`
              : "Assigned after confirmation"}
          </p>
          <p style={{ margin: 0 }}>
            <b>Driver:</b>{" "}
            {payload?.driver
              ? `${payload.driver.name}${payload.driver.phone ? ` (${payload.driver.phone})` : ""}`
              : "Assigned after confirmation"}
          </p>
          <p style={{ margin: 0 }}>
            <b>Safety:</b> <ShieldCheck size={14} /> Verified documents +
            insurance active
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            <Button disabled>
              <Phone size={16} /> Call Driver
            </Button>
            <Button variant="outline" disabled>
              <MessageSquare size={16} /> Chat Support
            </Button>
            {canCancel ? (
              <Button
                variant="ghost"
                style={{ color: "#DC2626" }}
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel Request"}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Wrap>
  );
}
