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
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <Switch
                      checked={Boolean(user.is_active)}
                      onCheckedChange={(next) => {
                        api
                          .patch(`/admin/users/${user.id}/status`, {
                            isActive: next,
                          })
                          .then((res) => {
                            const updated = res.data?.data;
                            if (!updated) return;
                            setRows((prev) =>
                              prev.map((row) =>
                                row.id === user.id
                                  ? { ...row, is_active: updated.is_active }
                                  : row,
                              ),
                            );
                          })
                          .catch(() => {});
                      }}
                      ariaLabel="status"
                    />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        Suspend
                      </Button>
                      <Button size="sm" variant="danger">
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      </CardContent>
    </Card>
  );
}
