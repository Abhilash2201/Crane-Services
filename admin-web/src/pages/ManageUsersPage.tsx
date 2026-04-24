import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Tabs } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { api } from "../lib/api";

const Filters = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 10px;
  margin-bottom: 12px;

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
        <Switch
          checked={Boolean(user.is_active)}
          onCheckedChange={(next) => onToggle(user.id, next)}
          ariaLabel="status"
        />
      </td>
      <td>
        <div style={{ display: "flex", gap: 6 }}>
          <Button size="sm" variant="outline">View</Button>
          <Button size="sm" variant="outline">Suspend</Button>
          <Button size="sm" variant="danger">Delete</Button>
        </div>
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

  const filtered = useMemo(() => {
    return rows
      .filter((user) => user.role === roleMap[tab])
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
      );
  }, [rows, tab, query, status]);

  // Group drivers by owner for the Drivers tab
  const driverGroups = useMemo(() => {
    if (tab !== "Drivers") return null;
    const groups: Record<string, { ownerName: string; drivers: any[] }> = {};
    for (const user of filtered) {
      const key = user.owner_id || "__unassigned__";
      if (!groups[key]) {
        groups[key] = {
          ownerName: user.owner_name || "Unassigned",
          drivers: [],
        };
      }
      groups[key].drivers.push(user);
    }
    // Unassigned last
    return Object.entries(groups).sort(([a], [b]) =>
      a === "__unassigned__" ? 1 : b === "__unassigned__" ? -1 : 0
    );
  }, [filtered, tab]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs options={["Customers", "Crane Owners", "Drivers"]} value={tab} onChange={setTab} />

        <Filters style={{ marginTop: 12 }}>
          <Input
            placeholder="Search by name, phone, email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </Select>
        </Filters>

        <div style={{ marginBottom: 10, display: "flex", gap: 8 }}>
          <Button size="sm" variant="outline" disabled>
            Bulk Activate
          </Button>
          <Button size="sm" variant="outline" disabled>
            Bulk Suspend
          </Button>
          <Button size="sm" variant="danger" disabled>
            Bulk Delete
          </Button>
        </div>

        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                {tab === "Drivers" ? <th>Owner</th> : null}
                <th>Joined Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 12 }}>
                    Loading users...
                  </td>
                </tr>
              ) : null}
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 12 }}>
                    No users found.
                  </td>
                </tr>
              ) : null}

              {/* Drivers tab — grouped by owner */}
              {tab === "Drivers" && driverGroups
                ? driverGroups.map(([key, group]) => (
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
                          <span
                            style={{
                              marginLeft: 8,
                              color: "#64748B",
                              fontWeight: 400,
                            }}
                          >
                            ({group.drivers.length} driver{group.drivers.length !== 1 ? "s" : ""})
                          </span>
                        </td>
                      </tr>
                      {group.drivers.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          showOwner
                          onToggle={(id, next) =>
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
                              .catch(() => {})
                          }
                        />
                      ))}
                    </>
                  ))
                : null}

              {/* Customers / Owners tabs — flat list */}
              {tab !== "Drivers"
                ? filtered.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      showOwner={false}
                      onToggle={(id, next) =>
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
                          .catch(() => {})
                      }
                    />
                  ))
                : null}
            </tbody>
          </Table>
        </TableWrap>
      </CardContent>
    </Card>
  );
}
