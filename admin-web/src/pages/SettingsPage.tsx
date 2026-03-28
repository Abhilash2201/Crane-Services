import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { api } from "../lib/api";

export function SettingsPage() {
  const [maintenance, setMaintenance] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [pricing, setPricing] = useState({
    baseCharge: "3000",
    baseHours: "3",
    overtimeRate: "1000",
  });
  const [pricingStatus, setPricingStatus] = useState("");

  useEffect(() => {
    api
      .get("/admin/pricing")
      .then((res) => {
        const data = res.data?.data;
        if (!data) return;
        setPricing({
          baseCharge: String(data.base_charge ?? 3000),
          baseHours: String(data.base_hours ?? 3),
          overtimeRate: String(data.overtime_rate ?? 1000),
        });
      })
      .catch(() => {
        // Keep defaults if API fails.
      });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ display: "grid", gap: 14 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, color: "#0A2540" }}>
              Pricing Rules (Customer Estimates)
            </span>
            <small style={{ color: "#64748B" }}>
              Base charge covers the first N hours. Overtime applies per hour after.
            </small>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
              <Input
                value={pricing.baseCharge}
                onChange={(e) =>
                  setPricing((p) => ({
                    ...p,
                    baseCharge: e.target.value.replace(/[^\d.]/g, ""),
                  }))
                }
                placeholder="Base charge (₹)"
              />
              <Input
                value={pricing.baseHours}
                onChange={(e) =>
                  setPricing((p) => ({
                    ...p,
                    baseHours: e.target.value.replace(/\D/g, ""),
                  }))
                }
                placeholder="Base hours"
              />
              <Input
                value={pricing.overtimeRate}
                onChange={(e) =>
                  setPricing((p) => ({
                    ...p,
                    overtimeRate: e.target.value.replace(/[^\d.]/g, ""),
                  }))
                }
                placeholder="Overtime rate (₹/hr)"
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                onClick={() => {
                  setPricingStatus("");
                  api
                    .put("/admin/pricing", {
                      baseCharge: Number(pricing.baseCharge || 3000),
                      baseHours: Number(pricing.baseHours || 3),
                      overtimeRate: Number(pricing.overtimeRate || 1000),
                    })
                    .then(() => setPricingStatus("Pricing updated."))
                    .catch((err) =>
                      setPricingStatus(
                        err?.response?.data?.message ||
                          "Unable to update pricing.",
                      ),
                    );
                }}
              >
                Save Pricing
              </Button>
              {pricingStatus ? (
                <small style={{ color: pricingStatus.includes("Unable") ? "#DC2626" : "#16A34A" }}>
                  {pricingStatus}
                </small>
              ) : null}
            </div>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, color: "#0A2540" }}>
              Commission Percentage
            </span>
            <Input defaultValue="15" />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, color: "#0A2540" }}>
              SMS Template
            </span>
            <Textarea defaultValue="Hi {{name}}, your crane booking {{request_id}} is now {{status}}." />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, color: "#0A2540" }}>
              Email Template
            </span>
            <Textarea defaultValue="Dear {{name}}, your request {{request_id}} has been accepted by {{owner_name}}." />
          </label>

          <div style={{ display: "grid", gap: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div>
                <strong style={{ color: "#0A2540" }}>Push Notifications</strong>
                <div style={{ fontSize: 13, color: "#64748B" }}>
                  Enable app alerts for request updates and disputes
                </div>
              </div>
              <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div>
                <strong style={{ color: "#0A2540" }}>Maintenance Mode</strong>
                <div style={{ fontSize: 13, color: "#64748B" }}>
                  Temporarily block new bookings while maintenance is active
                </div>
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
