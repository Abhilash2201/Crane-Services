import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Modal } from "../components/ui/modal";

const drivers = [
  { name: "Nadeem Shaikh", phone: "+91 98761 22018", city: "Mumbai", status: "Available" },
  { name: "Irfan Khan", phone: "+91 99100 77120", city: "Delhi", status: "On Job" },
  { name: "Rakesh N", phone: "+91 98450 44109", city: "Bengaluru", status: "Available" },
  { name: "Sanjay Patil", phone: "+91 90082 66331", city: "Bengaluru", status: "Off Duty" }
];

function tone(status: string) {
  if (status === "Available") return "success";
  if (status === "On Job") return "warning";
  return "outline";
}

export function DriversPage() {
  const [open, setOpen] = useState(false);
  const [driverName, setDriverName] = useState("");

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1>Drivers Management</h1>
      {drivers.map((driver) => (
        <Card key={driver.name}>
          <CardContent style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: "0 0 4px 0" }}>{driver.name}</h3>
              <p style={{ margin: 0, color: "#64748B" }}>{driver.phone} | {driver.city}</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Badge variant={tone(driver.status) as "success" | "warning" | "outline"}>{driver.status}</Badge>
              <Button
                onClick={() => {
                  setDriverName(driver.name);
                  setOpen(true);
                }}
              >
                Assign Job
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 style={{ marginTop: 0 }}>Assign Job to {driverName}</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <label>Request ID</label>
          <Input placeholder="REQ-BLR-9910" />
          <label>Crane</label>
          <Input placeholder="50T Rough Terrain | KA-53-MR-2281" />
          <label>Pickup to Drop</label>
          <Input placeholder="Peenya Yard -> Whitefield Site" />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => setOpen(false)}>Assign Task</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
