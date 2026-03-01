import { useMemo, useState } from "react";
import styled from "styled-components";
import { Tabs } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ownerApplications } from "../data/mockData";
import { Button } from "../components/ui/button";
import { Modal } from "../components/ui/modal";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";

const List = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 12px;
`;

const Item = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  text-align: left;
  cursor: pointer;
  display: grid;
  grid-template-columns: 56px 1fr auto;
  gap: 12px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

export function ApprovalsPage() {
  const [tab, setTab] = useState("Pending Owner Registration");
  const [selected, setSelected] = useState<null | (typeof ownerApplications)[number]>(null);
  const [reason, setReason] = useState("");

  const list = useMemo(() => ownerApplications, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner & Crane Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          options={["Pending Owner Registration", "Pending Crane Documents"]}
          value={tab}
          onChange={setTab}
        />

        <List>
          {list.map((owner) => (
            <Item key={owner.company} onClick={() => setSelected(owner)}>
              <img
                src={owner.photo}
                alt={owner.owner}
                width="56"
                height="56"
                style={{ borderRadius: 10, objectFit: "cover" }}
              />
              <div>
                <strong style={{ color: "#0A2540" }}>{owner.company}</strong>
                <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{owner.owner} • {owner.city}</div>
                <div style={{ fontSize: 13, color: "#334155", marginTop: 6 }}>GST: {owner.gst}</div>
                <div style={{ fontSize: 13, color: "#334155" }}>{owner.bank}</div>
              </div>
              <div style={{ alignSelf: "start" }}>
                <Badge variant="warning">Awaiting Review</Badge>
              </div>
            </Item>
          ))}
        </List>

        <Modal open={Boolean(selected)} title="Application Review" onClose={() => setSelected(null)}>
          {selected && (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <img src={selected.photo} alt={selected.owner} width="84" height="84" style={{ borderRadius: 12, objectFit: "cover" }} />
                <div>
                  <h3 style={{ margin: "0 0 4px", color: "#0A2540" }}>{selected.company}</h3>
                  <div style={{ color: "#64748B", fontSize: 14 }}>{selected.owner} • {selected.city}</div>
                  <div style={{ color: "#334155", fontSize: 14 }}>GST: {selected.gst}</div>
                  <div style={{ color: "#334155", fontSize: 14 }}>{selected.bank}</div>
                </div>
              </div>

              <div>
                <strong style={{ color: "#0A2540", display: "block", marginBottom: 8 }}>Uploaded Documents</strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selected.docs.map((doc) => (
                    <Badge key={doc} variant="info">{doc}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <strong style={{ display: "block", marginBottom: 6, color: "#0A2540" }}>Rejection Reason (if needed)</strong>
                <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Mention missing or invalid documents" />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Button variant="success" size="lg">Approve Owner & All Cranes</Button>
                <Button variant="danger" size="lg">Reject</Button>
              </div>
            </div>
          )}
        </Modal>
      </CardContent>
    </Card>
  );
}
