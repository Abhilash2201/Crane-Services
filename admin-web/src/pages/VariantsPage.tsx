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
  baseCharge: string;
  baseHours: string;
  overtimeRate: string;
};

const emptyForm: VariantForm = {
  name: "",
  capacityTons: "",
  description: "",
  isActive: true,
  baseCharge: "",
  baseHours: "",
  overtimeRate: "",
};

export function VariantsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [variantRequests, setVariantRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<VariantForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [variantRequestMessage, setVariantRequestMessage] = useState("");

  const loadVariants = () => {
    api
      .get("/admin/variants")
      .then((res) => setRows(res.data?.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  const loadVariantRequests = () => {
    api
      .get("/admin/variant-requests")
      .then((res) => setVariantRequests(res.data?.data || []))
      .catch(() => setVariantRequests([]));
  };

  useEffect(() => {
    loadVariants();
    loadVariantRequests();
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
      baseCharge: row.base_charge ? String(row.base_charge) : "",
      baseHours: row.base_hours ? String(row.base_hours) : "",
      overtimeRate: row.overtime_rate ? String(row.overtime_rate) : "",
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
      baseCharge: form.baseCharge ? Number(form.baseCharge) : undefined,
      baseHours: form.baseHours ? Number(form.baseHours) : undefined,
      overtimeRate: form.overtimeRate ? Number(form.overtimeRate) : undefined,
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
        setMessage(err?.response?.data?.message || "Unable to save variant.")
      );
  };

  const deleteVariant = (variantId: string) => {
    if (!window.confirm("Delete this variant?")) return;
    api
      .delete(`/admin/variants/${variantId}`)
      .then(() => loadVariants())
      .catch(() => {});
  };

  const processVariantRequest = (variantRequestId: string, status: "approved" | "rejected") => {
    setVariantRequestMessage("");
    api
      .patch(`/admin/variant-requests/${variantRequestId}`, { status })
      .then(() => {
        setVariantRequestMessage(`Variant request ${status}.`);
        loadVariants();
        loadVariantRequests();
      })
      .catch((error) =>
        setVariantRequestMessage(
          error?.response?.data?.message || "Unable to update request."
        )
      );
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
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
                    "Base Charge",
                    "Base Hours",
                    "Overtime / hr",
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
                    <td colSpan={9} style={{ padding: 12 }}>
                      Loading variants...
                    </td>
                  </tr>
                ) : null}
                {!loading && rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: 12 }}>
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
                      {row.capacity_tons ?? "-"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.description || "-"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.base_charge ?? "-"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.base_hours ?? "-"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.overtime_rate ?? "-"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.is_active ? "Active" : "Inactive"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.created_at
                        ? new Date(row.created_at).toLocaleDateString()
                        : "-"}
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
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Owner Variant Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {variantRequestMessage ? (
            <small style={{ color: "#334155", display: "block", marginBottom: 10 }}>
              {variantRequestMessage}
            </small>
          ) : null}
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Owner",
                    "Suggested Name",
                    "Capacity",
                    "Expected Base",
                    "Expected Hours",
                    "Expected Overtime",
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
                {variantRequests.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: 12 }}>
                      No variant requests.
                    </td>
                  </tr>
                ) : null}
                {variantRequests.map((row) => (
                  <tr key={row.id}>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.owner_name || "-"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.suggested_name}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.capacity_tons ?? "-"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.expected_base_charge ?? "-"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.expected_base_hours ?? "-"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.expected_overtime_rate ?? "-"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.description || "-"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.status}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.created_at
                        ? new Date(row.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                      {row.status === "pending" ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <Button
                            size="sm"
                            onClick={() => processVariantRequest(row.id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => processVariantRequest(row.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 10,
            }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span>Base Charge</span>
              <Input
                value={form.baseCharge}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    baseCharge: event.target.value.replace(/[^\d.]/g, ""),
                  }))
                }
                placeholder="3000"
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Base Hours</span>
              <Input
                value={form.baseHours}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    baseHours: event.target.value.replace(/[^\d.]/g, ""),
                  }))
                }
                placeholder="3"
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Overtime / hr</span>
              <Input
                value={form.overtimeRate}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    overtimeRate: event.target.value.replace(/[^\d.]/g, ""),
                  }))
                }
                placeholder="1000"
              />
            </label>
          </div>
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
    </div>
  );
}

