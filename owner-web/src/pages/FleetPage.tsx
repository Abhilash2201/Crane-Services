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
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalError, setModalError] = useState("");
  const [form, setForm] = useState({
    name: "",
    type: "",
    variantId: "",
    capacityTons: "",
    registration: ""
  });

  useEffect(() => {
    Promise.all([
      api.get("/owner/fleet"),
      api.get("/variants", { params: { active: true } }),
    ])
      .then(([fleetRes, variantsRes]) => {
        setFleet(fleetRes.data?.data || []);
        setVariants(variantsRes.data?.data || []);
      })
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load fleet.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1>My Cranes / Fleet Management</h1>
      {loading ? <small style={{ color: "#64748B" }}>Loading...</small> : null}
      {error ? <small style={{ color: "#DC2626" }}>{error}</small> : null}
      <div style={{ display: "flex", gap: 10 }}>
        <Button onClick={() => { setEditingId(null); setOpen(true); }}>Add Crane</Button>
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
              <p style={{ margin: 0, color: "#64748B" }}><b>Variant:</b> {crane.variant_name || "-"}</p>
              <p style={{ margin: 0, color: "#64748B" }}><b>Capacity:</b> {crane.capacity_tons || "-"}T</p>
              <p style={{ margin: 0, color: "#64748B" }}><b>Reg No:</b> {crane.registration || "-"}</p>
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
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(crane.id);
                    setForm({
                      name: crane.name || "",
                      type: crane.type || "",
                      variantId: crane.variant_id || "",
                      capacityTons: crane.capacity_tons ? String(crane.capacity_tons) : "",
                      registration: crane.registration || ""
                    });
                    setOpen(true);
                  }}
                >
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setModalError(""); }}>
        <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Crane" : "Add Crane"}</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <label>Name</label>
          <small style={{ color: "#64748B" }}>Required</small>
          <Input
            placeholder="50T Rough Terrain"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <label>Type</label>
          <small style={{ color: "#64748B" }}>Optional</small>
          <Input
            placeholder="Rough Terrain"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
          />
          <label>Crane Variant</label>
          <small style={{ color: "#64748B" }}>Required for request matching</small>
          <select
            value={form.variantId}
            onChange={(e) => setForm((prev) => ({ ...prev, variantId: e.target.value }))}
            style={{
              minHeight: 40,
              border: "1px solid #CBD5E1",
              borderRadius: 10,
              padding: "0 10px",
              background: "#fff",
            }}
          >
            <option value="">Select variant</option>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name}
              </option>
            ))}
          </select>
          <label>Capacity (tons)</label>
          <small style={{ color: "#64748B" }}>Optional</small>
          <Input
            placeholder="50"
            value={form.capacityTons}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, capacityTons: e.target.value.replace(/[^\d.]/g, "") }))
            }
          />
          <label>Registration</label>
          <small style={{ color: "#64748B" }}>Optional (must be unique)</small>
          <Input
            placeholder="KA-53-MR-2281"
            value={form.registration}
            onChange={(e) => setForm((prev) => ({ ...prev, registration: e.target.value }))}
          />
          {modalError ? <small style={{ color: "#DC2626" }}>{modalError}</small> : null}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Button variant="outline" onClick={() => { setOpen(false); setModalError(""); }}>Cancel</Button>
            <Button
              onClick={() => {
                setModalError("");
                if (!form.name.trim()) {
                  setModalError("Crane name is required.");
                  return;
                }
                if (!form.variantId) {
                  setModalError("Crane variant is required.");
                  return;
                }
                const reg = form.registration.trim();
                if (reg) {
                  const duplicate = fleet.some(
                    (item) =>
                      item.registration &&
                      item.registration.toLowerCase() === reg.toLowerCase() &&
                      item.id !== editingId
                  );
                  if (duplicate) {
                    setModalError("Registration number already exists.");
                    return;
                  }
                }
                const payload = {
                  name: form.name.trim(),
                  type: form.type.trim() || undefined,
                  variantId: form.variantId,
                  capacityTons: form.capacityTons ? Number(form.capacityTons) : undefined,
                  registration: reg || undefined
                };
                const request = editingId
                  ? api.patch(`/owner/fleet/${editingId}`, payload)
                  : api.post("/owner/fleet", payload);
                request
                  .then((res) => {
                    const next = res.data?.data;
                    setFleet((prev) =>
                      editingId
                        ? prev.map((item) => (item.id === editingId ? next : item))
                        : [next, ...prev],
                    );
                    setForm({ name: "", type: "", variantId: "", capacityTons: "", registration: "" });
                    setEditingId(null);
                    setOpen(false);
                    setModalError("");
                  })
                  .catch((err) =>
                    setModalError(
                      err?.response?.data?.message ||
                        (editingId ? "Unable to update crane." : "Unable to add crane."),
                    ),
                  );
              }}
            >
              {editingId ? "Save Changes" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

