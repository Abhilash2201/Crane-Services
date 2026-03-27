import { MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs } from "../components/ui/tabs";
import { api } from "../lib/api";

export function LiveRequestsPage() {
  const [variant, setVariant] = useState("All");
  const [urgency, setUrgency] = useState("All");
  const [distance, setDistance] = useState("25");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/owner/incoming-requests")
      .then((res) => setRequests(res.data?.data || []))
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load requests."),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      requests.filter(
        (r) =>
          (variant === "All" ||
            String(r.required_capacity_tons || "").includes(variant)) &&
          (urgency === "All" || r.urgency === urgency) &&
          (!r.distance || r.distance <= Number(distance)),
      ),
    [variant, urgency, distance],
  );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1>Live Requests</h1>
      {loading ? <small style={{ color: "#64748B" }}>Loading...</small> : null}
      {error ? <small style={{ color: "#DC2626" }}>{error}</small> : null}
      <div
        style={{
          display: "grid",
          gap: 10,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <div>
          <small>Variant</small>
          <Tabs
            options={["All", "25T", "50T", "100T", "Tower"]}
            value={variant}
            onChange={setVariant}
          />
        </div>
        <div>
          <small>Distance (km)</small>
          <Input
            value={distance}
            onChange={(e) => setDistance(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        <div>
          <small>Urgency</small>
          <Tabs
            options={["All", "High", "Medium", "Low"]}
            value={urgency}
            onChange={setUrgency}
          />
        </div>
      </div>

      {filtered.map((item) => (
        <Card key={item.id}>
          <CardContent style={{ display: "grid", gap: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 4px 0" }}>{item.id}</h3>
                <p style={{ margin: 0, color: "#64748B" }}>
                  Customer #{String(item.customer_id).slice(0, 8)}
                </p>
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>
            <p
              style={{
                margin: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <MapPin size={14} /> {item.pickup_address}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 8,
                color: "#334155",
              }}
            >
              <span>
                <b>Required Capacity:</b> {item.required_capacity_tons || "—"}T
              </span>
              <span>
                <b>Date/Time:</b>{" "}
                {item.scheduled_at
                  ? new Date(item.scheduled_at).toLocaleString()
                  : "ASAP"}
              </span>
              <span>
                <b>Notes:</b> {item.notes || "—"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <Button
                size="lg"
                style={{ minWidth: 190 }}
                onClick={() => {
                  api
                    .post("/owner/accept-request", {
                      requestId: item.id
                    })
                    .then(() => {
                      setRequests((prev) =>
                        prev.filter((r) => r.id !== item.id),
                      );
                    })
                    .catch((err) =>
                      setError(
                        err?.response?.data?.message ||
                          "Unable to accept request.",
                      ),
                    );
                }}
              >
                Accept Request
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
