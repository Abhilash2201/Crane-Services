import { MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { api } from "../lib/api";

export function LiveRequestsPage() {
  const [variant, setVariant] = useState("All");
  const [distance, setDistance] = useState("25");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/owner/incoming-requests")
      .then((res) => setRequests(res.data?.data || []))
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load requests.")
      )
      .finally(() => setLoading(false));
  }, []);

  const variantOptions = useMemo(() => {
    const labels = requests
      .map((r) => r.variant_name)
      .filter((value): value is string => Boolean(value));
    return ["All", ...Array.from(new Set(labels))];
  }, [requests]);

  const filtered = useMemo(
    () =>
      requests.filter(
        (r) =>
          (variant === "All" || r.variant_name === variant) &&
          (!r.distance || r.distance <= Number(distance))
      ),
    [variant, distance, requests]
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
          <select
            value={variant}
            onChange={(event) => setVariant(event.target.value)}
            style={{
              width: "100%",
              minHeight: 40,
              border: "1px solid #CBD5E1",
              borderRadius: 10,
              padding: "0 10px",
              background: "#fff",
              marginTop: 4,
            }}
          >
            {variantOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <small>Distance (km)</small>
          <Input
            value={distance}
            onChange={(e) => setDistance(e.target.value.replace(/\D/g, ""))}
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
                <b>Variant:</b> {item.variant_name || "-"}
              </span>
              <span>
                <b>Required Capacity:</b> {item.required_capacity_tons || "-"}T
              </span>
              <span>
                <b>Date/Time:</b>{" "}
                {item.scheduled_at
                  ? new Date(item.scheduled_at).toLocaleString()
                  : "ASAP"}
              </span>
              <span>
                <b>Notes:</b> {item.notes || "-"}
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
                        prev.filter((r) => r.id !== item.id)
                      );
                    })
                    .catch((err) =>
                      setError(
                        err?.response?.data?.message ||
                          "Unable to accept request."
                      )
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

