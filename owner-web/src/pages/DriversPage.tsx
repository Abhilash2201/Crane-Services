import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Modal } from "../components/ui/modal";
import { api } from "../lib/api";

export function DriversPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [createInfo, setCreateInfo] = useState("");

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
          <strong>Add Driver (Owned by You)</strong>
          <small style={{ color: "#64748B" }}>Create a driver account and link to your organization.</small>
          <Button onClick={() => { setOpenCreate(true); setCreateInfo(""); }}>
            Add Driver
          </Button>
          {createInfo ? <small style={{ color: "#16A34A" }}>{createInfo}</small> : null}
        </CardContent>
      </Card>
      <Modal open={openCreate} onClose={() => { setOpenCreate(false); setCreateInfo(""); }}>
        <h3 style={{ marginTop: 0 }}>Add Driver</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <label>Full Name</label>
          <Input
            placeholder="Driver name"
            value={createForm.name}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <label>Email</label>
          <Input
            type="email"
            placeholder="driver@company.com"
            value={createForm.email}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <label>Phone</label>
          <Input
            placeholder="98XXXXXXXX"
            value={createForm.phone}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, "").slice(0, 15) }))}
          />
          <label>Password (optional)</label>
          <Input
            type="password"
            placeholder="Leave blank to auto-generate"
            value={createForm.password}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Button variant="outline" onClick={() => { setOpenCreate(false); setCreateInfo(""); }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setError("");
                setCreateInfo("");
                if (!createForm.name.trim()) {
                  setError("Driver name is required.");
                  return;
                }
                if (!createForm.email.trim()) {
                  setError("Driver email is required.");
                  return;
                }
                if (!createForm.phone.trim()) {
                  setError("Driver phone is required.");
                  return;
                }
                api
                  .post("/owner/drivers/create", {
                    name: createForm.name.trim(),
                    email: createForm.email.trim().toLowerCase(),
                    phone: createForm.phone.trim(),
                    password: createForm.password.trim() || undefined
                  })
                  .then((res) => {
                    const tempPassword = res.data?.data?.tempPassword;
                    if (tempPassword) {
                      setCreateInfo(`Temporary password: ${tempPassword}`);
                    } else {
                      setCreateInfo("Driver created.");
                    }
                    return api.get("/owner/drivers");
                  })
                  .then((res) => {
                    setDrivers(res.data?.data || []);
                    setCreateForm({ name: "", email: "", phone: "", password: "" });
                    setOpenCreate(false);
                  })
                  .catch((err) =>
                    setError(
                      err?.response?.data?.message ||
                        "Unable to create driver.",
                    ),
                  );
              }}
            >
              Create Driver
            </Button>
          </div>
        </div>
      </Modal>
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
