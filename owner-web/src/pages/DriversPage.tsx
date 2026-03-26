import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { api } from "../lib/api";

export function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [driverId, setDriverId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/owner/drivers")
      .then((res) => setDrivers(res.data?.data || []))
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load drivers."),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1>Drivers Management</h1>
      {loading ? <small style={{ color: "#64748B" }}>Loading...</small> : null}
      {error ? <small style={{ color: "#DC2626" }}>{error}</small> : null}
      <Card>
        <CardContent style={{ display: "grid", gap: 8 }}>
          <strong>Add Driver (by ID)</strong>
          <Input
            placeholder="Driver UUID"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
          />
          <Button
            onClick={() => {
              if (!driverId.trim()) {
                setError("Enter driver ID.");
                return;
              }
              api
                .post("/owner/drivers", { driverId: driverId.trim() })
                .then(() => api.get("/owner/drivers"))
                .then((res) => {
                  setDrivers(res.data?.data || []);
                  setDriverId("");
                })
                .catch((err) =>
                  setError(
                    err?.response?.data?.message || "Unable to add driver.",
                  ),
                );
            }}
          >
            Add Driver
          </Button>
        </CardContent>
      </Card>
      {drivers.map((driver) => (
        <Card key={driver.id}>
          <CardContent style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: "0 0 4px 0" }}>{driver.name || "Driver"}</h3>
              <p style={{ margin: 0, color: "#64748B" }}>
                {driver.phone || "No phone"} | {driver.email || "No email"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Badge variant={driver.is_active ? "success" : "outline"}>
                {driver.is_active ? "Active" : "Inactive"}
              </Badge>
              <Button
                variant="outline"
                onClick={() => {
                  api
                    .delete(`/owner/drivers/${driver.id}`)
                    .then(() =>
                      setDrivers((prev) =>
                        prev.filter((d) => d.id !== driver.id),
                      ),
                    )
                    .catch((err) =>
                      setError(
                        err?.response?.data?.message ||
                          "Unable to remove driver.",
                      ),
                    );
                }}
              >
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
