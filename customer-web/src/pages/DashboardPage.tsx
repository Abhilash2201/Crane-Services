import { Clock3, MapPin, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs } from "../components/ui/tabs";

const List = styled.div`display: grid; gap: 12px;`;
const items = [
  { id: "REQ-BLR-9382", title: "50T Rough Terrain for HVAC Lift", city: "Bengaluru", status: "Owner Accepted", bucket: "Active", progress: ["Open", "Owner Accepted", "Confirmed", "In Progress", "Completed"], activeIndex: 1 },
  { id: "REQ-MUM-5521", title: "Tower Crane Setup for Powai Site", city: "Mumbai", status: "In Progress", bucket: "Active", progress: ["Open", "Owner Accepted", "Confirmed", "In Progress", "Completed"], activeIndex: 3 },
  { id: "REQ-DEL-1162", title: "All Terrain 80T for Plant Relocation", city: "Delhi", status: "Completed", bucket: "Completed", progress: ["Open", "Owner Accepted", "Confirmed", "In Progress", "Completed"], activeIndex: 4 },
  { id: "REQ-BLR-4410", title: "25T Mobile Crane for Utility Pole Lift", city: "Bengaluru", status: "Cancelled", bucket: "Cancelled", progress: ["Open", "Cancelled"], activeIndex: 1 }
];

export function DashboardPage() {
  const [tab, setTab] = useState("Active");
  const filtered = useMemo(() => items.filter((item) => item.bucket === tab), [tab]);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1>My Requests Dashboard</h1>
      <Tabs options={["Active", "Completed", "Cancelled"]} value={tab} onChange={setTab} />
      <List>
        {filtered.map((item) => (
          <Card key={item.id}><CardContent style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 6px 0" }}>{item.title}</h3>
                <div style={{ display: "flex", gap: 12, color: "#64748B", flexWrap: "wrap" }}>
                  <span><MapPin size={14} /> {item.city}</span>
                  <span><Clock3 size={14} /> Requested 28 Feb 2026</span>
                  <span><Truck size={14} /> {item.id}</span>
                </div>
              </div>
              <Badge variant={item.status === "In Progress" ? "warning" : item.status === "Completed" ? "success" : "default"}>{item.status}</Badge>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(80px, 1fr))", gap: 8 }}>
              {item.progress.map((step, index) => <div key={step} style={{ padding: "8px", borderRadius: 10, fontSize: 12, textAlign: "center", background: index <= item.activeIndex ? "#fff3ec" : "#f1f5f9", color: index <= item.activeIndex ? "#C2410C" : "#64748B" }}>{step}</div>)}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link to={`/tracking/${item.id}`}><Button>View Live Tracking</Button></Link>
              {tab === "Completed" ? <Button variant="outline">Download Invoice</Button> : null}
            </div>
          </CardContent></Card>
        ))}
      </List>
    </div>
  );
}
