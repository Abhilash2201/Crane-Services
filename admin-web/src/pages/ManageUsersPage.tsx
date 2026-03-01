import { useMemo, useState } from "react";
import styled from "styled-components";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { users } from "../data/mockData";

const Filters = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
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
  const [city, setCity] = useState("All");
  const [verified, setVerified] = useState("All");

  const filtered = useMemo(() => {
    return users
      .filter((user) => user.role === tab)
      .filter((user) =>
        `${user.name} ${user.phone} ${user.email}`.toLowerCase().includes(query.toLowerCase())
      )
      .filter((user) => (status === "All" ? true : status === "Active" ? user.status : !user.status))
      .filter((user) => (city === "All" ? true : user.city === city))
      .filter((user) => {
        if (verified === "All") {
          return true;
        }

        return verified === "Verified" ? user.verified : !user.verified;
      });
  }, [tab, query, status, city, verified]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs options={["Customers", "Crane Owners", "Drivers"]} value={tab} onChange={setTab} />

        <Filters style={{ marginTop: 12 }}>
          <Input placeholder="Search by name, phone, email" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </Select>
          <Select value={city} onChange={(event) => setCity(event.target.value)}>
            <option>All</option>
            <option>Bengaluru</option>
            <option>Mumbai</option>
            <option>Delhi</option>
          </Select>
          <Select value={verified} onChange={(event) => setVerified(event.target.value)}>
            <option>All</option>
            <option>Verified</option>
            <option>Unverified</option>
          </Select>
        </Filters>

        <div style={{ marginBottom: 10, display: "flex", gap: 8 }}>
          <Button size="sm" variant="outline">Bulk Activate</Button>
          <Button size="sm" variant="outline">Bulk Suspend</Button>
          <Button size="sm" variant="danger">Bulk Delete</Button>
        </div>

        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Joined Date</th>
                <th>Verified</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.email}>
                  <td>{user.name}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.city}</td>
                  <td>{user.joined}</td>
                  <td>
                    <Badge variant={user.verified ? "success" : "warning"}>
                      {user.verified ? "Verified" : "Pending"}
                    </Badge>
                  </td>
                  <td>
                    <Switch checked={user.status} onCheckedChange={() => undefined} ariaLabel="status" />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="outline">Suspend</Button>
                      <Button size="sm" variant="danger">Delete</Button>
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
