import { Clock3, MapPin, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-hot-toast";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs } from "../components/ui/tabs";
import { api } from "../lib/api";

const List = styled.div`
  display: grid;
  gap: 12px;
`;
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
`;

type RequestItem = {
  id: string | number;
  ref_id?: string | null;
  pickup_address: string;
  drop_address?: string | null;
  status: string;
  scheduled_at?: string | null;
  created_at: string;
  job_status?: string | null;
};

const statusSteps = ["Pending", "Accepted", "In Progress", "Completed"];

const mapStatus = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "completed") return { label: "Completed", bucket: "Completed", index: 3 };
  if (normalized === "cancelled" || normalized === "canceled") {
    return { label: "Cancelled", bucket: "Cancelled", index: 0 };
  }
  if (normalized === "accepted") return { label: "Accepted", bucket: "Active", index: 1 };
  if (normalized === "in_progress" || normalized === "in progress") {
    return { label: "In Progress", bucket: "Active", index: 2 };
  }
  return { label: "Pending", bucket: "Active", index: 0 };
};

export function DashboardPage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(() => {
    const t = searchParams.get("tab");
    return t === "Cancelled" || t === "Completed" ? t : "Active";
  });
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{
    pending_requests?: number;
    accepted_requests?: number;
    completed_requests?: number;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const mapped = mapStatus(item.status);
        return mapped.bucket === tab;
      }),
    [items, tab],
  );

  useEffect(() => {
    let accessToken: string | undefined;
    try {
      const raw = localStorage.getItem("auth");
      const parsed = raw ? JSON.parse(raw) : null;
      accessToken = parsed?.accessToken;
    } catch {
      accessToken = undefined;
    }

    if (!accessToken) {
      setLoading(false);
      setSummaryLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${accessToken}` };

    api
      .get("/customer/requests", { headers })
      .then((res) => {
        setItems(res.data?.data || []);
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message ||
            "Unable to load requests. Please try again.",
        );
      })
      .finally(() => setLoading(false));

    api
      .get("/customer/dashboard", { headers })
      .then((res) => {
        setSummary(res.data?.data?.summary || null);
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message ||
            "Unable to load summary. Please try again.",
        );
      })
      .finally(() => setSummaryLoading(false));
  }, []);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <h1>My Requests Dashboard</h1>
      <SummaryGrid>
        <Card>
          <CardContent style={{ display: "grid", gap: 6 }}>
            <small style={{ color: "#64748B" }}>Pending</small>
            <strong style={{ fontSize: 22 }}>
              {summaryLoading ? "—" : summary?.pending_requests ?? 0}
            </strong>
          </CardContent>
        </Card>
        <Card>
          <CardContent style={{ display: "grid", gap: 6 }}>
            <small style={{ color: "#64748B" }}>Accepted</small>
            <strong style={{ fontSize: 22 }}>
              {summaryLoading ? "—" : summary?.accepted_requests ?? 0}
            </strong>
          </CardContent>
        </Card>
        <Card>
          <CardContent style={{ display: "grid", gap: 6 }}>
            <small style={{ color: "#64748B" }}>Completed</small>
            <strong style={{ fontSize: 22 }}>
              {summaryLoading ? "—" : summary?.completed_requests ?? 0}
            </strong>
          </CardContent>
        </Card>
      </SummaryGrid>
      <Tabs
        options={["Active", "Completed", "Cancelled"]}
        value={tab}
        onChange={setTab}
      />
      <List>
        {loading ? <small style={{ color: "#64748B" }}>Loading...</small> : null}
        {!loading && filtered.length === 0 ? (
          <small style={{ color: "#64748B" }}>No requests yet.</small>
        ) : null}
        {filtered.map((item) => {
          const mapped = mapStatus(item.status);
          return (
            <Card key={item.id}>
              <CardContent style={{ display: "grid", gap: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 6px 0" }}>
                      {item.pickup_address}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        color: "#64748B",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>
                        <MapPin size={14} />{" "}
                        {item.drop_address || "Pickup only"}
                      </span>
                      <span>
                        <Clock3 size={14} />{" "}
                        {item.scheduled_at
                          ? `Scheduled ${new Date(
                              item.scheduled_at,
                            ).toLocaleString()}`
                          : `Requested ${new Date(
                              item.created_at,
                            ).toLocaleString()}`}
                      </span>
                      <span>
                        <Truck size={14} /> {item.ref_id ?? item.id}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      mapped.label === "In Progress"
                        ? "warning"
                        : mapped.label === "Completed"
                          ? "success"
                          : "default"
                    }
                  >
                    {mapped.label}
                  </Badge>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(80px, 1fr))",
                    gap: 8,
                  }}
                >
                  {statusSteps.map((step, index) => (
                    <div
                      key={step}
                      style={{
                        padding: "8px",
                        borderRadius: 10,
                        fontSize: 12,
                        textAlign: "center",
                        background:
                          index <= mapped.index ? "#fff3ec" : "#f1f5f9",
                        color:
                          index <= mapped.index ? "#C2410C" : "#64748B",
                      }}
                    >
                      {step}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link to={`/tracking/${item.id}`}>
                    <Button>
                      {mapped.label === "Cancelled" ? "View Details" : "View Live Tracking"}
                    </Button>
                  </Link>
                  {tab === "Completed" ? (
                    <Button variant="outline">Download Invoice</Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </List>
    </div>
  );
}
