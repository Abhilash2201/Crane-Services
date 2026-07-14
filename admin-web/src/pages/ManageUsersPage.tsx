import { Eye, EyeOff, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Card, CardContent } from "../components/ui/card";
import { Tabs } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Modal } from "../components/ui/modal";
import { ActionMenu } from "../components/ui/action-menu";
import { AppDataTable } from "../components/ui/datatable";
import type { ColumnDef } from "../components/ui/datatable";
import { api } from "../lib/api";

const EMPTY_OWNER_FORM = { name: "", email: "", phone: "", password: "" };

// Used only by the Drivers grouped table
const Filters = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 10px;
  margin: 12px 0;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const TableWrap = styled.div`
  overflow: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding: 10px;
    text-align: left;
    font-size: 14px;
    white-space: nowrap;
  }

  th {
    color: ${({ theme }) => theme.colors.muted};
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.2px;
  }

  tr:hover {
    background: #fff8f3;
  }
`;

function StatusBadge({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={active ? "Click to suspend" : "Click to activate"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 20,
        border: "none",
        background: active ? "#DCFCE7" : "#F1F5F9",
        color: active ? "#16A34A" : "#94A3B8",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.2px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "currentColor",
          flexShrink: 0,
        }}
      />
      {active ? "Active" : "Inactive"}
    </button>
  );
}

function UserRow({
  user,
  showOwner,
  onToggle,
}: {
  user: any;
  showOwner: boolean;
  onToggle: (id: string, next: boolean) => void;
}) {
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.phone || "—"}</td>
      <td>{user.email}</td>
      {showOwner ? (
        <td style={{ color: "#64748B", fontSize: 13 }}>
          {user.owner_name || "—"}
        </td>
      ) : null}
      <td>
        {user.created_at
          ? new Date(user.created_at).toLocaleDateString()
          : "—"}
      </td>
      <td>
        <StatusBadge
          active={Boolean(user.is_active)}
          onClick={() => onToggle(user.id, !user.is_active)}
        />
      </td>
      <td>
        <ActionMenu
          items={[
            { label: "View", icon: "pi pi-eye" },
            {
              label: user.is_active ? "Suspend" : "Activate",
              icon: "pi pi-ban",
              command: () => onToggle(user.id, !user.is_active),
            },
            { separator: true },
            { label: "Delete", icon: "pi pi-trash", className: "menu-item-danger" },
          ]}
        />
      </td>
    </tr>
  );
}

export function ManageUsersPage() {
  const [tab, setTab] = useState("Customers");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_OWNER_FORM);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [tempPassword, setTempPassword] = useState<{ password: string; email: string } | null>(null);
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  useEffect(() => {
    api
      .get("/admin/users")
      .then((res) => setRows(res.data?.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const roleMap: Record<string, string> = {
    Customers: "customer",
    "Crane Owners": "owner",
    Drivers: "driver",
  };

  const handleToggle = useCallback(
    (id: string, next: boolean) => {
      api
        .patch(`/admin/users/${id}/status`, { isActive: next })
        .then((res) => {
          const updated = res.data?.data;
          if (!updated) return;
          setRows((prev) =>
            prev.map((row) =>
              row.id === id ? { ...row, is_active: updated.is_active } : row,
            ),
          );
        })
        .catch(() => {});
    },
    [],
  );

  // Data for AppDataTable (Customers / Crane Owners) — filtered by role + status
  // AppDataTable handles text search internally
  const tableData = useMemo(
    () =>
      rows
        .filter((user) => user.role === roleMap[tab])
        .filter((user) =>
          status === "All"
            ? true
            : status === "Active"
              ? user.is_active
              : !user.is_active,
        ),
    [rows, tab, status],
  );

  // Data for Drivers tab — filtered by role + query + status (custom grouped table)
  const driversFiltered = useMemo(
    () =>
      rows
        .filter((user) => user.role === "driver")
        .filter((user) =>
          `${user.name} ${user.phone} ${user.email}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .filter((user) =>
          status === "All"
            ? true
            : status === "Active"
              ? user.is_active
              : !user.is_active,
        ),
    [rows, query, status],
  );

  const driverGroups = useMemo(() => {
    const groups: Record<string, { ownerName: string; drivers: any[] }> = {};
    for (const user of driversFiltered) {
      const key = user.owner_id || "__unassigned__";
      if (!groups[key]) {
        groups[key] = {
          ownerName: user.owner_name || "Unassigned",
          drivers: [],
        };
      }
      groups[key].drivers.push(user);
    }
    return Object.entries(groups).sort(([a], [b]) =>
      a === "__unassigned__" ? 1 : b === "__unassigned__" ? -1 : 0,
    );
  }, [driversFiltered]);

  const userColumns: ColumnDef[] = useMemo(
    () => [
      { field: "name", header: "Name", sortable: true },
      { field: "phone", header: "Phone", body: (row) => row.phone || "—" },
      { field: "email", header: "Email", sortable: true },
      {
        field: "created_at",
        header: "Joined Date",
        sortable: true,
        body: (row) =>
          row.created_at ? new Date(row.created_at).toLocaleDateString() : "—",
      },
      {
        field: "is_active",
        header: "Status",
        body: (row) => (
          <StatusBadge
            active={Boolean(row.is_active)}
            onClick={() => handleToggle(row.id, !row.is_active)}
          />
        ),
      },
      {
        field: "actions",
        header: "Actions",
        width: "52px",
        align: "center" as const,
        body: (row) => (
          <ActionMenu
            items={[
              { label: "View", icon: "pi pi-eye" },
              {
                label: row.is_active ? "Suspend" : "Activate",
                icon: "pi pi-ban",
                command: () => handleToggle(row.id, !row.is_active),
              },
              { separator: true },
              { label: "Delete", icon: "pi pi-trash", className: "menu-item-danger" },
            ]}
          />
        ),
      },
    ],
    [handleToggle],
  );

  const handleCreateOwner = async () => {
    setCreateError("");
    if (!createForm.name.trim()) { setCreateError("Name is required."); return; }
    if (!/[a-zA-Z]/.test(createForm.name)) { setCreateError("Enter a valid name."); return; }
    if (!createForm.email.trim()) { setCreateError("Email is required."); return; }

    if (createForm.password && createForm.password.length < 6) {
      setCreateError("Password must be at least 6 characters.");
      return;
    }

    setCreating(true);
    try {
      const res = await api.post("/admin/owners/create", {
        name: createForm.name.trim(),
        email: createForm.email.trim().toLowerCase(),
        phone: createForm.phone.trim() || undefined,
        password: createForm.password.trim() || undefined,
      });
      const { owner, tempPassword: tp } = res.data.data;
      setRows((prev) => [owner, ...prev]);
      setCreateForm(EMPTY_OWNER_FORM);
      setOpenCreate(false);
      if (tp) setTempPassword({ password: tp, email: owner.email });
      setTab("Crane Owners");
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || "Unable to create owner.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Tabs options={["Customers", "Crane Owners", "Drivers"]} value={tab} onChange={setTab} />

        {tempPassword && (
          <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#15803D", margin: "12px 0", display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <strong>Owner account created successfully.</strong>
              <button onClick={() => setTempPassword(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#15803D", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
            </div>
            <div>A welcome email with login credentials has been sent to <strong>{tempPassword.email}</strong>.</div>
            <div style={{ background: "#DCFCE7", borderRadius: 6, padding: "6px 10px", fontFamily: "monospace", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#64748B" }}>Temp password:</span>
              <strong style={{ letterSpacing: 1 }}>{tempPassword.password}</strong>
              <span style={{ color: "#94A3B8", fontSize: 11 }}>(save this — shown only once)</span>
            </div>
          </div>
        )}

        {tab === "Drivers" ? (
          <>
            <Filters>
              <div style={{ position: "relative" }}>
                <Input
                  placeholder="Search by name, phone, email"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  style={{ width: "100%", paddingRight: 32 }}
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "grid",
                      placeItems: "center",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "#64748b",
                    }}
                  >
                    <X size={16} />
                  </button>
                ) : null}
              </div>
              <Select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
              </Select>
            </Filters>

            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Owner</th>
                    <th>Joined Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 12 }}>Loading drivers...</td>
                    </tr>
                  ) : null}
                  {!loading && driversFiltered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 12 }}>No drivers found.</td>
                    </tr>
                  ) : null}
                  {driverGroups.map(([key, group]) => (
                    <>
                      <tr key={`group-${key}`}>
                        <td
                          colSpan={7}
                          style={{
                            background: "#F1F5F9",
                            color: "#0A2540",
                            fontWeight: 700,
                            fontSize: 12,
                            padding: "6px 10px",
                            letterSpacing: "0.3px",
                          }}
                        >
                          {key === "__unassigned__" ? "Unassigned" : `Owner: ${group.ownerName}`}
                          <span style={{ marginLeft: 8, color: "#64748B", fontWeight: 400 }}>
                            ({group.drivers.length} driver{group.drivers.length !== 1 ? "s" : ""})
                          </span>
                        </td>
                      </tr>
                      {group.drivers.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          showOwner
                          onToggle={handleToggle}
                        />
                      ))}
                    </>
                  ))}
                </tbody>
              </Table>
            </TableWrap>
          </>
        ) : (
          <AppDataTable
            data={tableData}
            columns={userColumns}
            loading={loading}
            searchable
            searchPlaceholder="Search by name, phone, email"
            searchFields={["name", "phone", "email"]}
            filters={
              <Select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                style={{ width: 120, minHeight: 36, fontSize: 13 }}
              >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
              </Select>
            }
            actions={
              tab === "Crane Owners" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setOpenCreate(true);
                    setCreateError("");
                    setCreateForm(EMPTY_OWNER_FORM);
                    setShowCreatePassword(false);
                  }}
                >
                  + Create Owner
                </Button>
              ) : undefined
            }
            emptyMessage="No users found."
          />
        )}
      </CardContent>

      <Modal
        open={openCreate}
        title="Create Owner Account"
        onClose={() => { setOpenCreate(false); setCreateError(""); setShowCreatePassword(false); }}
      >
        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <label style={{ fontSize: 13, color: "#64748B", display: "block", marginBottom: 4 }}>
              Full Name <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <Input
              placeholder="e.g. Ravi Constructions"
              value={createForm.name}
              onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value.replace(/[^a-zA-Z\s.,'&-]/g, "") }))}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#64748B", display: "block", marginBottom: 4 }}>
              Email <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <Input
              type="email"
              placeholder="owner@company.com"
              value={createForm.email}
              onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#64748B", display: "block", marginBottom: 4 }}>
              Phone <span style={{ color: "#94A3B8", fontWeight: 400 }}>(optional)</span>
            </label>
            <Input
              placeholder="98XXXXXXXX"
              value={createForm.phone}
              onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#64748B", display: "block", marginBottom: 4 }}>
              Password <span style={{ color: "#94A3B8", fontWeight: 400 }}>(leave blank to auto-generate)</span>
            </label>
            <div style={{ position: "relative" }}>
              <Input
                type={showCreatePassword ? "text" : "password"}
                placeholder="Optional — min 6 characters if set"
                value={createForm.password}
                onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                style={{
                  paddingRight: 38,
                  borderColor: createForm.password && createForm.password.length < 6 ? "#DC2626" : undefined,
                }}
              />
              <button
                type="button"
                onClick={() => setShowCreatePassword((v) => !v)}
                aria-label={showCreatePassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94A3B8",
                  display: "flex",
                  padding: 0,
                }}
              >
                {showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {createForm.password && createForm.password.length < 6 ? (
              <small style={{ color: "#DC2626", marginTop: 4, display: "block" }}>
                Password must be at least 6 characters.
              </small>
            ) : (
              <small style={{ color: "#94A3B8", marginTop: 4, display: "block" }}>
                Leave blank to auto-generate and email credentials to the owner.
              </small>
            )}
          </div>

          {createError && <small style={{ color: "#DC2626" }}>{createError}</small>}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <Button
              variant="outline"
              onClick={() => { setOpenCreate(false); setCreateError(""); setShowCreatePassword(false); }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOwner} disabled={creating}>
              {creating ? "Creating..." : "Create Owner"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
