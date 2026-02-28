import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs } from "../components/ui/tabs";

const requests = [
  { id: "REQ-BLR-9910", customer: "Brigade Infra Projects", location: "Whitefield, Bengaluru", variant: "50T Rough Terrain", time: "03 Mar 2026, 09:30 AM", distance: 8, urgency: "High" },
  { id: "REQ-MUM-7742", customer: "Arihant EPC Ltd", location: "Andheri East, Mumbai", variant: "25T Mobile", time: "03 Mar 2026, 11:00 AM", distance: 14, urgency: "Medium" },
  { id: "REQ-DEL-6651", customer: "Shree Steel Structurals", location: "Okhla Phase 2, Delhi", variant: "100T Crawler", time: "03 Mar 2026, 08:00 PM", distance: 21, urgency: "High" },
  { id: "REQ-BLR-8824", customer: "Kalyani Developers", location: "Yelahanka, Bengaluru", variant: "Tower Crane", time: "04 Mar 2026, 07:00 AM", distance: 18, urgency: "Low" }
];

export function LiveRequestsPage() {
  const [variant, setVariant] = useState("All");
  const [urgency, setUrgency] = useState("All");
  const [distance, setDistance] = useState("25");

  const filtered = useMemo(
    () =>
      requests.filter(
        (r) =>
          (variant === "All" || r.variant.includes(variant)) &&
          (urgency === "All" || r.urgency === urgency) &&
          r.distance <= Number(distance)
      ),
    [variant, urgency, distance]
  );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1>Live Requests</h1>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div>
          <small>Variant</small>
          <Tabs options={["All", "25T", "50T", "100T", "Tower"]} value={variant} onChange={setVariant} />
        </div>
        <div>
          <small>Distance (km)</small>
          <Input value={distance} onChange={(e) => setDistance(e.target.value.replace(/\D/g, ""))} />
        </div>
        <div>
          <small>Urgency</small>
          <Tabs options={["All", "High", "Medium", "Low"]} value={urgency} onChange={setUrgency} />
        </div>
      </div>

      {filtered.map((item) => (
        <Card key={item.id}>
          <CardContent style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0" }}>{item.id}</h3>
                <p style={{ margin: 0, color: "#64748B" }}>{item.customer}</p>
              </div>
              <Badge variant={item.urgency === "High" ? "warning" : "outline"}>{item.urgency} Urgency</Badge>
            </div>
            <p style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <MapPin size={14} /> {item.location}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, color: "#334155" }}>
              <span><b>Required Variant:</b> {item.variant}</span>
              <span><b>Date/Time:</b> {item.time}</span>
              <span><b>Distance:</b> {item.distance} km</span>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button size="lg" style={{ minWidth: 190 }}>Accept Request</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
