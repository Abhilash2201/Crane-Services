import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";

export function SettingsPage() {
  const [maintenance, setMaintenance] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ display: "grid", gap: 14 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, color: "#0A2540" }}>Commission Percentage</span>
            <Input defaultValue="15" />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, color: "#0A2540" }}>SMS Template</span>
            <Textarea defaultValue="Hi {{name}}, your crane booking {{request_id}} is now {{status}}." />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, color: "#0A2540" }}>Email Template</span>
            <Textarea defaultValue="Dear {{name}}, your request {{request_id}} has been accepted by {{owner_name}}." />
          </label>

          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #E2E8F0", borderRadius: 10, padding: 12 }}>
              <div>
                <strong style={{ color: "#0A2540" }}>Push Notifications</strong>
                <div style={{ fontSize: 13, color: "#64748B" }}>Enable app alerts for request updates and disputes</div>
              </div>
              <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #E2E8F0", borderRadius: 10, padding: 12 }}>
              <div>
                <strong style={{ color: "#0A2540" }}>Maintenance Mode</strong>
                <div style={{ fontSize: 13, color: "#64748B" }}>Temporarily block new bookings while maintenance is active</div>
              </div>
              <Switch checked={maintenance} onCheckedChange={setMaintenance} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button>Save Configuration</Button>
            <Button variant="outline">Discard Changes</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
