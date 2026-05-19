import { useEffect, useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Modal } from "../components/ui/modal";
import { AppDataTable, type ColumnDef } from "../components/ui/datatable";
import { api } from "../lib/api";

type Crane = {
  id: string;
  name: string;
  type: string | null;
  variant_id: string | null;
  variant_name: string | null;
  capacity_tons: number | null;
  registration: string | null;
  status: string;
};

type StatusVariant = "success" | "warning" | "outline";

function statusVariant(status: string): StatusVariant {
  if (status === "active") return "success";
  if (status === "maintenance") return "warning";
  return "outline";
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        fontSize: 14,
        gap: 12,
        padding: "6px 0",
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      <span style={{ color: "#64748B", flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#0A2540", fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

const RegPill = ({ reg }: { reg: string | null }) =>
  reg ? (
    <span
      style={{
        background: "#FFF7ED",
        color: "#9A3412",
        borderRadius: 6,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "monospace",
        textTransform: "uppercase",
      }}
    >
      {reg}
    </span>
  ) : (
    <span style={{ color: "#94A3B8" }}>—</span>
  );

const EMPTY_FORM = { name: "", type: "", variantId: "", capacityTons: "", registration: "" };
const selectStyle: React.CSSProperties = {
  minHeight: 40,
  width: "100%",
  border: "1px solid #CBD5E1",
  borderRadius: 10,
  padding: "0 10px",
  background: "#fff",
  fontSize: 14,
  color: "#0f172a",
};

export function FleetPage() {
  const [fleet, setFleet] = useState<Crane[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState<Crane | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);

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

  const handleOpenRow = (crane: Crane) => {
    setSelected(crane);
    setError("");
  };

  const handleToggleStatus = async () => {
    if (!selected) return;
    const next = selected.status === "active" ? "maintenance" : "active";
    setTogglingStatus(true);
    setError("");
    try {
      const res = await api.patch(`/owner/fleet/${selected.id}`, { status: next });
      const updated: Crane = res.data?.data;
      setFleet((prev) => prev.map((c) => (c.id === selected.id ? updated : c)));
      setSelected(updated);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to update status.");
    } finally {
      setTogglingStatus(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalError("");
    setOpen(true);
  };

  const openEditModal = (crane: Crane) => {
    setEditingId(crane.id);
    setForm({
      name: crane.name || "",
      type: crane.type || "",
      variantId: crane.variant_id || "",
      capacityTons: crane.capacity_tons ? String(crane.capacity_tons) : "",
      registration: crane.registration || "",
    });
    setModalError("");
    setOpen(true);
  };

  const handleSave = async () => {
    setModalError("");
    if (!form.name.trim()) { setModalError("Crane name is required."); return; }
    if (!form.variantId) { setModalError("Crane variant is required."); return; }

    const reg = form.registration.trim();
    if (reg) {
      const duplicate = fleet.some(
        (item) =>
          item.registration &&
          item.registration.toLowerCase() === reg.toLowerCase() &&
          item.id !== editingId
      );
      if (duplicate) { setModalError("Registration number already exists."); return; }
    }

    const payload = {
      name: form.name.trim(),
      type: form.type.trim() || undefined,
      variantId: form.variantId,
      capacityTons: form.capacityTons ? Number(form.capacityTons) : undefined,
      registration: reg || undefined,
    };

    setSaving(true);
    try {
      const res = editingId
        ? await api.patch(`/owner/fleet/${editingId}`, payload)
        : await api.post("/owner/fleet", payload);
      const next: Crane = res.data?.data;
      setFleet((prev) =>
        editingId
          ? prev.map((item) => (item.id === editingId ? next : item))
          : [next, ...prev]
      );
      // keep sidebar in sync if the edited crane is the selected one
      if (editingId && selected?.id === editingId) setSelected(next);
      setOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err: any) {
      setModalError(
        err?.response?.data?.message ||
          (editingId ? "Unable to update crane." : "Unable to add crane.")
      );
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnDef<Crane>[] = [
    {
      field: "name",
      header: "Crane Name",
      sortable: true,
      body: (row) => (
        <span style={{ fontWeight: 600, color: "#0A2540" }}>{row.name}</span>
      ),
    },
    {
      field: "variant_name",
      header: "Variant",
      sortable: true,
      body: (row) => row.variant_name || <span style={{ color: "#94A3B8" }}>—</span>,
    },
    {
      field: "capacity_tons",
      header: "Capacity",
      sortable: true,
      body: (row) =>
        row.capacity_tons ? `${row.capacity_tons} T` : <span style={{ color: "#94A3B8" }}>—</span>,
      align: "center",
      width: "100px",
    },
    {
      field: "registration",
      header: "Registration",
      body: (row) => <RegPill reg={row.registration} />,
      width: "150px",
    },
    {
      field: "type",
      header: "Type",
      body: (row) => row.type || <span style={{ color: "#94A3B8" }}>—</span>,
      width: "130px",
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      body: (row) => (
        <Badge variant={statusVariant(row.status)}>
          {row.status}
        </Badge>
      ),
      align: "center",
      width: "120px",
    },
  ];

  const sidebarHeader = selected ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <strong style={{ color: "#0A2540", fontSize: 15 }}>{selected.name}</strong>
      <Badge variant={statusVariant(selected.status)}>{selected.status}</Badge>
    </div>
  ) : null;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Fleet Management</h1>
      {error ? <small style={{ color: "#DC2626" }}>{error}</small> : null}

      <div
        style={{
          width: selected ? "calc(100% - 460px)" : "100%",
          transition: "width 0.3s ease",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <AppDataTable
          data={fleet}
          columns={columns}
          loading={loading}
          onRowClick={handleOpenRow}
          searchable
          searchPlaceholder="Search by name, variant, registration..."
          searchFields={["name", "variant_name", "registration", "type"]}
          emptyMessage="No cranes in your fleet yet. Add your first crane."
          pageSize={15}
          actions={
            <Button onClick={openAddModal}>Add Crane</Button>
          }
        />
      </div>

      {/* Crane detail sidebar */}
      <Sidebar
        visible={Boolean(selected)}
        onHide={() => setSelected(null)}
        position="right"
        style={{ width: "min(460px, 100vw)" }}
        header={sidebarHeader}
      >
        {selected ? (
          <div style={{ display: "grid", gap: 20, padding: "4px 0" }}>
            <section>
              <DetailRow label="Variant" value={selected.variant_name || "—"} />
              <DetailRow
                label="Capacity"
                value={selected.capacity_tons ? `${selected.capacity_tons} T` : "—"}
              />
              <DetailRow
                label="Registration"
                value={<RegPill reg={selected.registration} />}
              />
              <DetailRow label="Type" value={selected.type || "—"} />
            </section>

            {/* Status toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0A2540" }}>
                  Crane Status
                </div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                  {selected.status === "active"
                    ? "Currently available for dispatch"
                    : "Currently under maintenance"}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={togglingStatus}
                onClick={handleToggleStatus}
              >
                {togglingStatus
                  ? "Updating..."
                  : selected.status === "active"
                  ? "Mark Maintenance"
                  : "Activate"}
              </Button>
            </div>

            {/* Edit button */}
            <Button
              variant="outline"
              style={{ width: "100%" }}
              onClick={() => openEditModal(selected)}
            >
              Edit Crane Details
            </Button>
          </div>
        ) : null}
      </Sidebar>

      {/* Add / Edit Crane modal */}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setModalError("");
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", color: "#0A2540" }}>
          {editingId ? "Edit Crane" : "Add Crane"}
        </h3>
        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <label style={{ fontSize: 13, color: "#64748B", display: "block", marginBottom: 4 }}>
              Name <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <Input
              placeholder="e.g. 50T Rough Terrain"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: "#64748B", display: "block", marginBottom: 4 }}>
              Crane Variant <span style={{ color: "#DC2626" }}>*</span>
              <span style={{ color: "#94A3B8", fontWeight: 400, marginLeft: 4 }}>
                (used for request matching)
              </span>
            </label>
            <select
              value={form.variantId}
              onChange={(e) => setForm((prev) => ({ ...prev, variantId: e.target.value }))}
              style={selectStyle}
            >
              <option value="">Select variant</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 13, color: "#64748B", display: "block", marginBottom: 4 }}>
              Type{" "}
              <span style={{ color: "#94A3B8", fontWeight: 400 }}>(optional)</span>
            </label>
            <Input
              placeholder="e.g. Rough Terrain"
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: "#64748B", display: "block", marginBottom: 4 }}>
              Capacity (tons){" "}
              <span style={{ color: "#94A3B8", fontWeight: 400 }}>(optional)</span>
            </label>
            <Input
              placeholder="e.g. 50"
              value={form.capacityTons}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  capacityTons: e.target.value.replace(/[^\d.]/g, ""),
                }))
              }
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: "#64748B", display: "block", marginBottom: 4 }}>
              Registration No.{" "}
              <span style={{ color: "#94A3B8", fontWeight: 400 }}>(optional, must be unique)</span>
            </label>
            <Input
              placeholder="e.g. KA-53-MR-2281"
              value={form.registration}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, registration: e.target.value }))
              }
            />
          </div>

          {modalError ? (
            <small style={{ color: "#DC2626" }}>{modalError}</small>
          ) : null}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setModalError("");
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Crane"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
