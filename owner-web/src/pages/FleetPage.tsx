import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";

const fleet = [
  { id: "KA-53-MR-2281", variant: "50T Rough Terrain", capacity: "50T", status: "Available" },
  { id: "MH-04-CX-8102", variant: "25T Mobile", capacity: "25T", status: "Busy" },
  { id: "DL-1L-9902", variant: "100T Crawler", capacity: "100T", status: "Maintenance" },
  { id: "KA-02-TR-6614", variant: "Tower Crane", capacity: "80T", status: "Available" },
  { id: "MH-01-AT-1240", variant: "All Terrain 80T", capacity: "80T", status: "Busy" }
];

function statusBadge(status: string) {
  if (status === "Available") return "success";
  if (status === "Busy") return "warning";
  return "outline";
}

export function FleetPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(fleet.map((f) => [f.id, f.status !== "Maintenance"]))
  );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1>My Cranes / Fleet Management</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
        {fleet.map((crane, idx) => (
          <Card key={crane.id}>
            <div
              style={{
                height: 120,
                borderBottom: "1px solid #E2E8F0",
                background: `linear-gradient(120deg, #0A2540, #1d4ed8 ${42 + idx * 3}%)`,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontWeight: 700
              }}
            >
              {crane.variant}
            </div>
            <CardContent style={{ display: "grid", gap: 8 }}>
              <h3 style={{ margin: 0 }}>{crane.variant}</h3>
              <p style={{ margin: 0, color: "#64748B" }}><b>Capacity:</b> {crane.capacity}</p>
              <p style={{ margin: 0, color: "#64748B" }}><b>Reg No:</b> {crane.id}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Badge variant={statusBadge(crane.status) as "success" | "warning" | "outline"}>{crane.status}</Badge>
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <small style={{ color: "#64748B" }}>{enabled[crane.id] ? "Enabled" : "Disabled"}</small>
                  <input
                    type="checkbox"
                    checked={enabled[crane.id]}
                    onChange={() => setEnabled((prev) => ({ ...prev, [crane.id]: !prev[crane.id] }))}
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
