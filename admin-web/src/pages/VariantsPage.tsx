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
import { AppDataTable } from "../components/ui/datatable";
import type { ColumnDef } from "../components/ui/datatable";
import { ActionMenu } from "../components/ui/action-menu";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
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
    setFieldErrors({});
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
    setFieldErrors({});
    setOpen(true);
  };

  const saveVariant = () => {
    setMessage("");

    const errors: Record<string, boolean> = {};
    if (!form.name.trim()) errors.name = true;
    if (!form.capacityTons || Number(form.capacityTons) <= 0) errors.capacityTons = true;
    if (!form.baseCharge || Number(form.baseCharge) <= 0) errors.baseCharge = true;
    if (!form.baseHours || Number(form.baseHours) <= 0) errors.baseHours = true;
    if (!form.overtimeRate || Number(form.overtimeRate) <= 0) errors.overtimeRate = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setMessage("Please fill in all required fields.");
      return;
    }
    setFieldErrors({});

    const payload = {
      name: form.name.trim(),
      capacityTons: Number(form.capacityTons),
      description: form.description.trim() || undefined,
      isActive: form.isActive,
      baseCharge: Number(form.baseCharge),
      baseHours: Number(form.baseHours),
      overtimeRate: Number(form.overtimeRate),
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

  const variantColumns: ColumnDef[] = [
    { field: "name", header: "Name", sortable: true },
    {
      field: "capacity_tons",
      header: "Capacity (tons)",
      body: (row) => row.capacity_tons ?? "—",
    },
    {
      field: "description",
      header: "Description",
      body: (row) => row.description || "—",
    },
    {
      field: "base_charge",
      header: "Base Charge",
      body: (row) => row.base_charge != null ? `₹${row.base_charge}` : "—",
    },
    {
      field: "base_hours",
      header: "Base Hours",
      body: (row) => row.base_hours ?? "—",
    },
    {
      field: "overtime_rate",
      header: "Overtime / hr",
      body: (row) => row.overtime_rate != null ? `₹${row.overtime_rate}` : "—",
    },
    {
      field: "is_active",
      header: "Status",
      sortable: true,
      body: (row) => (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: row.is_active ? "#16A34A" : "#94A3B8",
          }}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "created_at",
      header: "Created",
      sortable: true,
      body: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "—",
    },
    {
      field: "actions",
      header: "Actions",
      width: "52px",
      align: "center" as const,
      body: (row) => (
        <ActionMenu
          items={[
            { label: "Edit", icon: "pi pi-pencil", command: () => openEdit(row) },
            { separator: true },
            { label: "Delete", icon: "pi pi-trash", className: "menu-item-danger", command: () => deleteVariant(row.id) },
          ]}
        />
      ),
    },
  ];

  const requestColumns: ColumnDef[] = [
    {
      field: "owner_name",
      header: "Owner",
      sortable: true,
      body: (row) => row.owner_name || "—",
    },
    { field: "suggested_name", header: "Suggested Name", sortable: true },
    {
      field: "capacity_tons",
      header: "Capacity",
      body: (row) => row.capacity_tons ?? "—",
    },
    {
      field: "expected_base_charge",
      header: "Expected Base",
      body: (row) => row.expected_base_charge ?? "—",
    },
    {
      field: "expected_base_hours",
      header: "Expected Hours",
      body: (row) => row.expected_base_hours ?? "—",
    },
    {
      field: "expected_overtime_rate",
      header: "Expected Overtime",
      body: (row) => row.expected_overtime_rate ?? "—",
    },
    {
      field: "description",
      header: "Description",
      body: (row) => row.description || "—",
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      body: (row) => (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color:
              row.status === "approved"
                ? "#16A34A"
                : row.status === "rejected"
                  ? "#DC2626"
                  : "#D97706",
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      field: "created_at",
      header: "Created",
      sortable: true,
      body: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "—",
    },
    {
      field: "actions",
      header: "Actions",
      width: "52px",
      align: "center" as const,
      body: (row) =>
        row.status === "pending" ? (
          <ActionMenu
            items={[
              { label: "Approve", icon: "pi pi-check", command: () => processVariantRequest(row.id, "approved") },
              { separator: true },
              { label: "Reject", icon: "pi pi-times", className: "menu-item-danger", command: () => processVariantRequest(row.id, "rejected") },
            ]}
          />
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card>
        <CardContent>
          <AppDataTable
            data={rows}
            columns={variantColumns}
            loading={loading}
            searchable
            searchPlaceholder="Search variants…"
            searchFields={["name", "description"]}
            actions={<Button onClick={openCreate}>Add Variant</Button>}
            emptyMessage="No variants found."
          />
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
          <AppDataTable
            data={variantRequests}
            columns={requestColumns}
            searchable
            searchPlaceholder="Search by owner or variant name…"
            searchFields={["owner_name", "suggested_name", "status"]}
            emptyMessage="No variant requests."
          />
        </CardContent>
      </Card>

      <Modal
        open={open}
        title={form.id ? "Edit Variant" : "Add Variant"}
        onClose={() => setOpen(false)}
      >
        <div style={{ display: "grid", gap: 10 }}>
          {/* Row 1: Name + Capacity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10 }}>
            <label style={{ display: "grid", gap: 5 }}>
              <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
                Name <span style={{ color: "#DC2626" }}>*</span>
              </span>
              <Input
                value={form.name}
                onChange={(event) => {
                  setForm((prev) => ({ ...prev, name: event.target.value }));
                  setFieldErrors((prev) => ({ ...prev, name: false }));
                }}
                style={{ borderColor: fieldErrors.name ? "#DC2626" : undefined }}
              />
            </label>
            <label style={{ display: "grid", gap: 5 }}>
              <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
                Capacity (t) <span style={{ color: "#DC2626" }}>*</span>
              </span>
              <Input
                value={form.capacityTons}
                onChange={(event) => {
                  setForm((prev) => ({
                    ...prev,
                    capacityTons: event.target.value.replace(/[^\d.]/g, ""),
                  }));
                  setFieldErrors((prev) => ({ ...prev, capacityTons: false }));
                }}
                placeholder="10"
                style={{ borderColor: fieldErrors.capacityTons ? "#DC2626" : undefined }}
              />
            </label>
          </div>

          {/* Row 2: Pricing trio */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <label style={{ display: "grid", gap: 5 }}>
              <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
                Base Charge (₹) <span style={{ color: "#DC2626" }}>*</span>
              </span>
              <Input
                value={form.baseCharge}
                onChange={(event) => {
                  setForm((prev) => ({
                    ...prev,
                    baseCharge: event.target.value.replace(/[^\d.]/g, ""),
                  }));
                  setFieldErrors((prev) => ({ ...prev, baseCharge: false }));
                }}
                placeholder="3000"
                style={{ borderColor: fieldErrors.baseCharge ? "#DC2626" : undefined }}
              />
            </label>
            <label style={{ display: "grid", gap: 5 }}>
              <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
                Base Hours <span style={{ color: "#DC2626" }}>*</span>
              </span>
              <Input
                value={form.baseHours}
                onChange={(event) => {
                  setForm((prev) => ({
                    ...prev,
                    baseHours: event.target.value.replace(/[^\d.]/g, ""),
                  }));
                  setFieldErrors((prev) => ({ ...prev, baseHours: false }));
                }}
                placeholder="3"
                style={{ borderColor: fieldErrors.baseHours ? "#DC2626" : undefined }}
              />
            </label>
            <label style={{ display: "grid", gap: 5 }}>
              <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
                Overtime/hr (₹) <span style={{ color: "#DC2626" }}>*</span>
              </span>
              <Input
                value={form.overtimeRate}
                onChange={(event) => {
                  setForm((prev) => ({
                    ...prev,
                    overtimeRate: event.target.value.replace(/[^\d.]/g, ""),
                  }));
                  setFieldErrors((prev) => ({ ...prev, overtimeRate: false }));
                }}
                placeholder="1000"
                style={{ borderColor: fieldErrors.overtimeRate ? "#DC2626" : undefined }}
              />
            </label>
          </div>

          {/* Row 3: Description */}
          <label style={{ display: "grid", gap: 5 }}>
            <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
              Description <span style={{ color: "#94A3B8", fontWeight: 400 }}>(optional)</span>
            </span>
            <Textarea
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </label>

          {/* Row 4: Active + error + buttons on same line */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
            <Switch
              checked={form.isActive}
              onCheckedChange={(next) =>
                setForm((prev) => ({ ...prev, isActive: next }))
              }
            />
            <span style={{ fontSize: 13, color: "#475569" }}>Active</span>
            {message ? (
              <small style={{ color: "#DC2626", marginLeft: 4 }}>{message}</small>
            ) : null}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={saveVariant}>Save</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
