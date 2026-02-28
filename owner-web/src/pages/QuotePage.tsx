import { Calculator, IndianRupee, Truck } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

export function QuotePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [baseRate, setBaseRate] = useState("5200");
  const [hours, setHours] = useState("8");
  const [mobilization, setMobilization] = useState("9000");
  const [remarks, setRemarks] = useState("Operator included. Fuel up to 40 km included.");
  const total = Number(baseRate || 0) * Number(hours || 0) + Number(mobilization || 0);

  return (
    <div style={{ display: "grid", gap: 14, maxWidth: 900 }}>
      <h1>Quote Builder</h1>
      <Badge variant="outline">Lead ID: {id}</Badge>

      <Card>
        <CardContent style={{ display: "grid", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Commercial Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <div>
              <label>Crane & Operator</label>
              <Input defaultValue="50T Rough Terrain | Operator: Irfan Khan" />
            </div>
            <div>
              <label>Earliest Arrival</label>
              <Input defaultValue="03 Mar 2026, 08:30 AM" />
            </div>
            <div>
              <label>Base Hourly Rate (₹)</label>
              <Input value={baseRate} onChange={(e) => setBaseRate(e.target.value.replace(/\D/g, ""))} />
            </div>
            <div>
              <label>Minimum Billable Hours</label>
              <Input value={hours} onChange={(e) => setHours(e.target.value.replace(/\D/g, ""))} />
            </div>
            <div>
              <label>Mobilization Charge (₹)</label>
              <Input value={mobilization} onChange={(e) => setMobilization(e.target.value.replace(/\D/g, ""))} />
            </div>
            <div>
              <label>Estimated Total</label>
              <Input value={`₹${total.toLocaleString("en-IN")}`} disabled />
            </div>
          </div>

          <label>Terms / Notes</label>
          <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button>
              <Calculator size={16} /> Send Quote
            </Button>
            <Button variant="outline" onClick={() => navigate("/incoming")}>
              Save Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent style={{ display: "grid", gap: 8 }}>
          <h3 style={{ marginTop: 0 }}>After Customer Accepts</h3>
          <p style={{ margin: 0, color: "#64748B" }}>
            Move this job to dispatch and assign a driver/operator through driver-pwa.
          </p>
          <Button variant="success" onClick={() => navigate("/dispatch")}>
            <Truck size={16} /> Go To Dispatch
          </Button>
          <p style={{ margin: 0, color: "#64748B", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <IndianRupee size={14} /> Invoice is generated only after completion.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
