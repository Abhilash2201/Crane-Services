import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Modal } from "../components/ui/modal";
import { api } from "../lib/api";

function statusBadge(status: string) {
  if (status === "active") return "success";
  if (status === "maintenance") return "warning";
  return "outline";
}

export function FleetPage() {
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "",
    capacityTons: "",
    registration: ""
  });

  useEffect(() => {
    api
      .get("/owner/fleet")
      .then((res) => setFleet(res.data?.data || []))
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load fleet."),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1>My Cranes / Fleet Management</h1>
      {loading ? <small style={{ color: "#64748B" }}>Loading...</small> : null}
      {error ? <small style={{ color: "#DC2626" }}>{error}</small> : null}
      <div style={{ display: "flex", gap: 10 }}>
        <Button onClick={() => setOpen(true)}>Add Crane</Button>
      </div>
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
              {crane.name}
            </div>
            <CardContent style={{ display: "grid", gap: 8 }}>
              <h3 style={{ margin: 0 }}>{crane.name}</h3>
              <p style={{ margin: 0, color: "#64748B" }}><b>Capacity:</b> {crane.capacity_tons || "—"}T</p>
              <p style={{ margin: 0, color: "#64748B" }}><b>Reg No:</b> {crane.registration || "—"}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Badge variant={statusBadge(crane.status) as "success" | "warning" | "outline"}>
                  {crane.status}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = crane.status === "active" ? "maintenance" : "active";
                    api
                      .patch(`/owner/fleet/${crane.id}`, { status: next })
                      .then((res) => {
                        const updated = res.data?.data;
                        setFleet((prev) =>
                          prev.map((item) => (item.id === crane.id ? updated : item)),
                        );
                      })
                      .catch((err) =>
                        setError(
                          err?.response?.data?.message ||
                            "Unable to update status.",
                        ),
                      );
                  }}
                >
                  {crane.status === "active" ? "Mark Maintenance" : "Activate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 style={{ marginTop: 0 }}>Add Crane</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <label>Name</label>
          <Input
            placeholder="50T Rough Terrain"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <label>Type</label>
          <Input
            placeholder="Rough Terrain"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
          />
          <label>Capacity (tons)</label>
          <Input
            placeholder="50"
            value={form.capacityTons}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, capacityTons: e.target.value.replace(/[^\d.]/g, "") }))
            }
          />
          <label>Registration</label>
          <Input
            placeholder="KA-53-MR-2281"
            value={form.registration}
            onChange={(e) => setForm((prev) => ({ ...prev, registration: e.target.value }))}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!form.name.trim()) {
                  setError("Enter crane name.");
                  return;
                }
                api
                  .post("/owner/fleet", {
                    name: form.name.trim(),
                    type: form.type.trim() || undefined,
                    capacityTons: form.capacityTons ? Number(form.capacityTons) : undefined,
                    registration: form.registration.trim() || undefined
                  })
                  .then((res) => {
                    setFleet((prev) => [res.data?.data, ...prev]);
                    setForm({ name: "", type: "", capacityTons: "", registration: "" });
                    setOpen(false);
                  })
                  .catch((err) =>
                    setError(
                      err?.response?.data?.message ||
                        "Unable to add crane.",
                    ),
                  );
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
