import { MessageSquare, Phone, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-hot-toast";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { api } from "../lib/api";

const Wrap = styled.div`
  display: grid;
  gap: 14px;
  @media (min-width: 950px) {
    grid-template-columns: 1.2fr 0.8fr;
  }
`;

type RequestItem = {
  id: string | number;
  pickup_address: string;
  drop_address?: string | null;
  status: string;
  scheduled_at?: string | null;
  created_at: string;
  job_status?: string | null;
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
  const [item, setItem] = useState<RequestItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let accessToken: string | undefined;
    try {
      const raw = localStorage.getItem("auth");
      const parsed = raw ? JSON.parse(raw) : null;
      accessToken = parsed?.accessToken;
    } catch {
      accessToken = undefined;
    }

    if (!accessToken) {
      setLoading(false);
      return;
    }

    api
      .get("/customer/requests", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then((res) => {
        const rows = res.data?.data || [];
        const match = rows.find((row: RequestItem) => String(row.id) === String(id));
        if (!match) {
          toast.error("Request not found.");
        }
        setItem(match || null);
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message ||
            "Unable to load tracking data. Please try again.",
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  const statusMeta = useMemo(() => mapStatus(item?.status || "pending"), [item]);
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
        if (next) setItem(next);
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
              Request Detail: {id}
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
          ) : item ? (
            <>
              <div style={{ display: "grid", gap: 6 }}>
                <div>
                  <b>Pickup:</b> {item.pickup_address}
                </div>
                <div>
                  <b>Drop:</b> {item.drop_address || "Pickup only"}
                </div>
                <div>
                  <b>Scheduled:</b>{" "}
                  {item.scheduled_at
                    ? new Date(item.scheduled_at).toLocaleString()
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
                          ? new Date(item.created_at).toLocaleString()
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
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  Live tracking will appear here once dispatch starts.
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
            <b>Owner:</b> Assigned after confirmation
          </p>
          <p style={{ margin: 0 }}>
            <b>Driver:</b> Assigned after confirmation
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
