import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Modal } from "../components/ui/modal";
import { api } from "../lib/api";

type VariantForm = {
  id?: string;
  name: string;
  capacityTons: string;
  description: string;
  isActive: boolean;
};

const emptyForm: VariantForm = {
  name: "",
  capacityTons: "",
  description: "",
  isActive: true,
};

export function VariantsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<VariantForm>(emptyForm);
  const [message, setMessage] = useState("");

  const loadVariants = () => {
    api
      .get("/admin/variants")
      .then((res) => setRows(res.data?.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVariants();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setMessage("");
    setOpen(true);
  };

  const openEdit = (row: any) => {
    setForm({
      id: row.id,
      name: row.name || "",
      capacityTons: row.capacity_tons ? String(row.capacity_tons) : "",
      description: row.description || "",
      isActive: Boolean(row.is_active),
    });
    setMessage("");
    setOpen(true);
  };

  const saveVariant = () => {
    setMessage("");
    if (!form.name.trim()) {
      setMessage("Name is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      capacityTons: form.capacityTons ? Number(form.capacityTons) : undefined,
      description: form.description.trim() || undefined,
      isActive: form.isActive,
    };

    const request = form.id
      ? api.patch(`/admin/variants/${form.id}`, payload)
      : api.post("/admin/variants", payload);

    request
      .then(() => {
        setOpen(false);
        loadVariants();
      })
      .catch((err) =>
        setMessage(err?.response?.data?.message || "Unable to save variant."),
      );
  };

  const deleteVariant = (variantId: string) => {
    if (!window.confirm("Delete this variant?")) return;
    api
      .delete(`/admin/variants/${variantId}`)
      .then(() => loadVariants())
      .catch(() => {});
  };

  return (
    <Card>
      <CardHeader>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <CardTitle>Crane Variants</CardTitle>
          <Button onClick={openCreate}>Add Variant</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "Name",
                  "Capacity (tons)",
                  "Description",
                  "Status",
                  "Created",
                  "Actions",
                ].map((head) => (
                  <th
                    key={head}
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #E2E8F0",
                      padding: 10,
                      fontSize: 12,
                      color: "#64748B",
                    }}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 12 }}>
                    Loading variants...
                  </td>
                </tr>
              ) : null}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 12 }}>
                    No variants found.
                  </td>
                </tr>
              ) : null}
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                    {row.name}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                    {row.capacity_tons ?? "—"}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                    {row.description || "—"}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                    {row.is_active ? "Active" : "Inactive"}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                    {row.created_at
                      ? new Date(row.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => deleteVariant(row.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      <Modal
        open={open}
        title={form.id ? "Edit Variant" : "Add Variant"}
        onClose={() => setOpen(false)}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Name *</span>
            <Input
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Capacity (tons)</span>
            <Input
              value={form.capacityTons}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  capacityTons: event.target.value.replace(/[^\d.]/g, ""),
                }))
              }
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Description</span>
            <Textarea
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Switch
              checked={form.isActive}
              onCheckedChange={(next) =>
                setForm((prev) => ({ ...prev, isActive: next }))
              }
            />
            <span>Active</span>
          </label>
          {message ? (
            <small style={{ color: "#DC2626" }}>{message}</small>
          ) : null}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveVariant}>Save</Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
