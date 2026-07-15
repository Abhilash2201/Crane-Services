import { useEffect, useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Modal } from "../components/ui/modal";
import { AppDataTable, type ColumnDef } from "../components/ui/datatable";
import { api } from "../lib/api";

type Driver = {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  license_url?: string | null;
  tpa_url?: string | null;
};

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

const EMPTY_FORM = { name: "", email: "", phone: "", password: "" };

export function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [selected, setSelected] = useState<Driver | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [tpaFile, setTpaFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const [docLicenseFile, setDocLicenseFile] = useState<File | null>(null);
  const [docTpaFile, setDocTpaFile] = useState<File | null>(null);
  const [docFileKey, setDocFileKey] = useState(0);
  const [updatingDocs, setUpdatingDocs] = useState(false);
  const [docError, setDocError] = useState("");

  useEffect(() => {
    api
      .get("/owner/drivers")
      .then((res) => setDrivers(res.data?.data || []))
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load drivers.")
      )
      .finally(() => setLoading(false));
  }, []);

  const resetDocFiles = () => {
    setDocLicenseFile(null);
    setDocTpaFile(null);
    setDocFileKey((k) => k + 1);
    setDocError("");
  };

  const handleOpenRow = (driver: Driver) => {
    setSelected(driver);
    setConfirmRemove(false);
    setError("");
    resetDocFiles();
  };

  const handleRemove = async () => {
    if (!selected) return;
    setRemoving(true);
    setError("");
    try {
      await api.delete(`/owner/drivers/${selected.id}`);
      setDrivers((prev) => prev.filter((d) => d.id !== selected.id));
      setSelected(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to remove driver.");
    } finally {
      setRemoving(false);
    }
  };

  const handleUpdateDocs = async () => {
    if (!selected || (!docLicenseFile && !docTpaFile)) return;
    setUpdatingDocs(true);
    setDocError("");
    try {
      const fd = new FormData();
      if (docLicenseFile) fd.append("license", docLicenseFile);
      if (docTpaFile) fd.append("tpa", docTpaFile);
      const res = await api.patch(`/owner/drivers/${selected.id}/docs`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { license_url, tpa_url } = res.data.data;
      const updated = { ...selected, license_url, tpa_url };
      setSelected(updated);
      setDrivers((prev) => prev.map((d) => (d.id === selected.id ? updated : d)));
      resetDocFiles();
    } catch (err: any) {
      setDocError(err?.response?.data?.message || "Unable to update documents.");
    } finally {
      setUpdatingDocs(false);
    }
  };

  const handleCreate = async () => {
    setCreateError("");
    if (!createForm.name.trim()) { setCreateError("Full name is required."); return; }
    if (!createForm.email.trim()) { setCreateError("Email is required."); return; }
    if (!createForm.phone.trim()) { setCreateError("Phone is required."); return; }

    setCreating(true);
    try {
      const fd = new FormData();
      fd.append("name", createForm.name.trim());
      fd.append("email", createForm.email.trim().toLowerCase());
      fd.append("phone", createForm.phone.trim());
      if (createForm.password.trim()) fd.append("password", createForm.password.trim());
      if (licenseFile) fd.append("license", licenseFile);
      if (tpaFile) fd.append("tpa", tpaFile);

      const res = await api.post("/owner/drivers/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const tempPassword = res.data?.data?.tempPassword;
      const listRes = await api.get("/owner/drivers");
      setDrivers(listRes.data?.data || []);
      setCreateForm(EMPTY_FORM);
      setLicenseFile(null);
      setTpaFile(null);
      setOpenCreate(false);
      if (tempPassword) {
        setSuccessMsg(`Driver created. Temporary password: ${tempPassword}`);
      }
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || "Unable to create driver.");
    } finally {
      setCreating(false);
    }
  };

  const columns: ColumnDef<Driver>[] = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      body: (row) => (
        <span style={{ fontWeight: 600, color: "#0A2540" }}>
          {row.name || "—"}
        </span>
      ),
    },
    {
      field: "phone",
      header: "Phone",
      body: (row) => row.phone || <span style={{ color: "#94A3B8" }}>—</span>,
    },
    {
      field: "email",
      header: "Email",
      sortable: true,
    },
    {
      field: "is_active",
      header: "Status",
      body: (row) => (
        <Badge variant={row.is_active ? "success" : "outline"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
      width: "110px",
      align: "center",
    },
    {
      field: "created_at",
      header: "Joined",
      sortable: true,
      body: (row) =>
        row.created_at
          ? new Date(row.created_at).toLocaleDateString()
          : "—",
      width: "110px",
    },
  ];

  const sidebarHeader = selected ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <strong style={{ color: "#0A2540", fontSize: 15 }}>
        {selected.name || "Driver"}
      </strong>
      <Badge variant={selected.is_active ? "success" : "outline"}>
        {selected.is_active ? "Active" : "Inactive"}
      </Badge>
    </div>
  ) : null;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {error ? <small style={{ color: "#DC2626" }}>{error}</small> : null}

      {successMsg ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            color: "#15803D",
          }}
        >
          <span>{successMsg}</span>
          <button
            onClick={() => setSuccessMsg("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#15803D",
              fontSize: 18,
              lineHeight: 1,
              padding: 0,
            }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ) : null}

      <div
        style={{
          width: selected ? "calc(100% - 460px)" : "100%",
          transition: "width 0.3s ease",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <AppDataTable
          data={drivers}
          columns={columns}
          loading={loading}
          onRowClick={handleOpenRow}
          searchable
          searchPlaceholder="Search by name, email, phone..."
          searchFields={["name", "email", "phone"]}
          emptyMessage="No drivers found. Add your first driver using the button above."
          pageSize={15}
          actions={
            <Button
              onClick={() => {
                setOpenCreate(true);
                setCreateError("");
                setCreateForm(EMPTY_FORM);
                setLicenseFile(null);
                setTpaFile(null);
                setFileInputKey((k) => k + 1);
              }}
            >
              Add Driver
            </Button>
          }
        />
      </div>

      {/* Driver detail sidebar */}
      <Sidebar
        visible={Boolean(selected)}
        onHide={() => {
          setSelected(null);
          setConfirmRemove(false);
          resetDocFiles();
        }}
        position="right"
        style={{ width: "min(460px, 100vw)" }}
        header={sidebarHeader}
      >
        {selected ? (
          <div style={{ display: "grid", gap: 20, padding: "4px 0" }}>
            <section>
              <DetailRow label="Email" value={selected.email || "—"} />
              <DetailRow label="Phone" value={selected.phone || "—"} />
              <DetailRow
                label="Joined"
                value={
                  selected.created_at
                    ? new Date(selected.created_at).toLocaleDateString()
                    : "—"
                }
              />
            </section>

            <section style={{ display: "grid", gap: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Documents
              </div>
              {[
                { label: "Driving License", url: selected.license_url, field: "license" as const, setter: setDocLicenseFile },
                { label: "TPA Document",    url: selected.tpa_url,     field: "tpa"     as const, setter: setDocTpaFile },
              ].map(({ label, url, field, setter }) => (
                <div key={field}>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2563EB", textDecoration: "none", marginBottom: 4 }}
                    >
                      <span>📄</span> {label} (view)
                    </a>
                  ) : (
                    <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 4 }}>{label} — not uploaded</div>
                  )}
                  <input
                    key={`${field}-${docFileKey}`}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setter(e.target.files?.[0] ?? null)}
                    style={{ fontSize: 12, width: "100%", cursor: "pointer" }}
                  />
                </div>
              ))}
              {docError && <small style={{ color: "#DC2626" }}>{docError}</small>}
              <Button
                disabled={(!docLicenseFile && !docTpaFile) || updatingDocs}
                onClick={handleUpdateDocs}
              >
                {updatingDocs ? "Saving..." : "Save Documents"}
              </Button>
            </section>

            {!confirmRemove ? (
              <Button
                variant="outline"
                style={{ color: "#DC2626", borderColor: "#FECDD3" }}
                onClick={() => setConfirmRemove(true)}
              >
                Remove Driver
              </Button>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  padding: 14,
                  background: "#FFF1F2",
                  borderRadius: 10,
                  border: "1px solid #FECDD3",
                }}
              >
                <strong style={{ fontSize: 13, color: "#9F1239" }}>
                  Remove this driver?
                </strong>
                <small style={{ color: "#64748B", lineHeight: 1.5 }}>
                  This will unlink {selected.name || "the driver"} from your
                  organization. Their account will remain but they'll lose
                  access to your jobs.
                </small>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant="outline"
                    style={{ flex: 1, color: "#DC2626", borderColor: "#FECDD3" }}
                    disabled={removing}
                    onClick={handleRemove}
                  >
                    {removing ? "Removing..." : "Yes, Remove"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmRemove(false)}
                    disabled={removing}
                  >
                    Keep Driver
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Sidebar>

      {/* Add Driver modal */}
      <Modal
        open={openCreate}
        title="Add Driver"
        onClose={() => {
          setOpenCreate(false);
          setCreateError("");
          setLicenseFile(null);
          setTpaFile(null);
          setFileInputKey((k) => k + 1);
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", color: "#0A2540" }}>Add Driver</h3>
        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <label style={{ fontSize: 13, color: "#64748B", display: "block", marginBottom: 4 }}>
              Full Name <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <Input
              placeholder="e.g. Ravi Kumar"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#64748B", display: "block", marginBottom: 4 }}>
              Email <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <Input
              type="email"
              placeholder="driver@company.com"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#64748B", display: "block", marginBottom: 4 }}>
              Phone <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <Input
              placeholder="98XXXXXXXX"
              value={createForm.phone}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  phone: e.target.value.replace(/\D/g, "").slice(0, 15),
                }))
              }
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#64748B", display: "block", marginBottom: 4 }}>
              Password{" "}
              <span style={{ color: "#94A3B8", fontWeight: 400 }}>
                (leave blank to auto-generate)
              </span>
            </label>
            <Input
              type="password"
              placeholder="Optional"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, password: e.target.value }))
              }
            />
          </div>

          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 10, display: "grid", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Documents{" "}
              <span style={{ color: "#94A3B8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                (optional · JPG / PNG / PDF, max 5 MB)
              </span>
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#64748B", display: "block", marginBottom: 4 }}>
                Driving License
              </label>
              <input
                key={`license-${fileInputKey}`}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setLicenseFile(e.target.files?.[0] ?? null)}
                style={{ fontSize: 13, width: "100%", cursor: "pointer" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#64748B", display: "block", marginBottom: 4 }}>
                TPA Document
              </label>
              <input
                key={`tpa-${fileInputKey}`}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setTpaFile(e.target.files?.[0] ?? null)}
                style={{ fontSize: 13, width: "100%", cursor: "pointer" }}
              />
            </div>
          </div>

          {createError ? (
            <small style={{ color: "#DC2626" }}>{createError}</small>
          ) : null}

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 4,
            }}
          >
            <Button
              variant="outline"
              onClick={() => {
                setOpenCreate(false);
                setCreateError("");
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Create Driver"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
