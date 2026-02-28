import { Clock3, MapPin, MoveRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs } from "../components/ui/tabs";
import { useState } from "react";

const leads = [
  {
    id: "LEAD-BLR-2201",
    crane: "50T Rough Terrain",
    city: "Bengaluru",
    customer: "Prakash Buildcon",
    budget: "₹48,000 - ₹60,000",
    etaWindow: "12 mins left",
    priority: "high"
  },
  {
    id: "LEAD-MUM-9082",
    crane: "Tower Crane",
    city: "Mumbai",
    customer: "Apex Infratech",
    budget: "₹1,20,000 - ₹1,45,000",
    etaWindow: "29 mins left",
    priority: "normal"
  },
  {
    id: "LEAD-DEL-7710",
    crane: "100T Crawler",
    city: "Delhi",
    customer: "Shivam Steel Works",
    budget: "₹92,000 - ₹1,18,000",
    etaWindow: "8 mins left",
    priority: "high"
  }
];

export function IncomingRequestsPage() {
  const [tab, setTab] = useState("All");

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1>Incoming Leads</h1>
      <Tabs options={["All", "Priority", "Quoted", "Missed"]} value={tab} onChange={setTab} />

      {leads.map((lead) => (
        <Card key={lead.id}>
          <CardContent style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0" }}>{lead.crane}</h3>
                <p style={{ margin: 0, color: "#64748B" }}>
                  {lead.customer} | {lead.id}
                </p>
              </div>
              <Badge variant={lead.priority === "high" ? "warning" : "outline"}>
                {lead.priority === "high" ? "Priority Lead" : "Standard Lead"}
              </Badge>
            </div>

            <div style={{ display: "flex", gap: 12, color: "#64748B", flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <MapPin size={14} /> {lead.city}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Clock3 size={14} /> SLA: {lead.etaWindow}
              </span>
              <span>Budget: {lead.budget}</span>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link to={`/quote/${lead.id}`}>
                <Button>
                  Send Quote <MoveRight size={16} />
                </Button>
              </Link>
              <Button variant="outline">Decline</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
