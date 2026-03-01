import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { craneVariants } from "../data/mockData";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Modal } from "../components/ui/modal";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";

export function VariantsPage() {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <CardTitle>Crane Variants Master</CardTitle>
          <Button onClick={() => setOpen(true)}>Add New Variant</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Variant Name", "Capacity (T)", "Type", "Typical Hourly Rate Range", "Icon/Image", "Status"].map((head) => (
                  <th key={head} style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #E2E8F0", fontSize: 12, color: "#64748B" }}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {craneVariants.map((variant) => (
                <tr key={variant.name}>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{variant.name}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{variant.capacity}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{variant.type}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{variant.rate}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>{variant.icon}</td>
                  <td style={{ padding: 10, borderBottom: "1px solid #E2E8F0" }}>
                    <Badge variant={variant.status ? "success" : "warning"}>{variant.status ? "Active" : "Inactive"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal open={open} title="Add New Crane Variant" onClose={() => setOpen(false)}>
          <div style={{ display: "grid", gap: 10 }}>
            <Input placeholder="Variant Name (e.g. 80T All Terrain)" />
            <Input placeholder="Capacity in Ton (e.g. 80)" />
            <Select>
              <option>Mobile</option>
              <option>Rough Terrain</option>
              <option>Crawler</option>
              <option>Tower</option>
            </Select>
            <Input placeholder="Typical hourly rate range" />
            <div style={{ display: "flex", gap: 8 }}>
              <Button>Add Variant</Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      </CardContent>
    </Card>
  );
}
