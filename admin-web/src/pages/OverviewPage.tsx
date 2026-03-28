import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../lib/api";

const Grid = styled.div`
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(4, minmax(0, 1fr));

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const KpiCard = styled(Card)`
  padding: 14px;

  h4 {
    margin: 0;
    color: ${({ theme }) => theme.colors.muted};
    font-size: 13px;
    font-weight: 600;
  }

  strong {
    display: block;
    margin-top: 4px;
    font-size: 26px;
    letter-spacing: 0.2px;
    color: ${({ theme }) => theme.colors.navy};
  }

  span {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

export function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<null | {
    users: {
      total_users: number;
      customers: number;
      owners: number;
      drivers: number;
    };
    requests: {
      total_requests: number;
      pending_requests: number;
      in_progress_requests: number;
      completed_requests: number;
    };
    revenue: { total_revenue: number };
  }>(null);

  useEffect(() => {
    api
      .get("/admin/overview")
      .then((res) => setOverview(res.data?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = useMemo(() => {
    if (!overview) return [];
    return [
      {
        label: "Total Users",
        value: overview.users.total_users,
        delta: `${overview.users.customers} customers`,
      },
      {
        label: "Total Requests",
        value: overview.requests.total_requests,
        delta: `${overview.requests.pending_requests} pending`,
      },
      {
        label: "Active Jobs",
        value: overview.requests.in_progress_requests,
        delta: `${overview.requests.completed_requests} completed`,
      },
      {
        label: "Total Revenue",
        value: `₹${Number(overview.revenue.total_revenue || 0).toLocaleString("en-IN")}`,
        delta: "Paid bookings only",
      },
    ];
  }, [overview]);

  return (
    <div>
      <h1 style={{ marginTop: 0, marginBottom: 12, color: "#0A2540" }}>
        Platform Overview
      </h1>
      {loading ? (
        <small style={{ color: "#64748B" }}>Loading metrics...</small>
      ) : null}
      <Grid>
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label}>
            <h4>{kpi.label}</h4>
            <strong>{kpi.value}</strong>
            <span>{kpi.delta}</span>
          </KpiCard>
        ))}
      </Grid>

      <Grid style={{ marginTop: 14 }}>
        <Card style={{ gridColumn: "span 4" }}>
          <CardHeader>
            <CardTitle>Operational Alerts</CardTitle>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 8 }}>
            <Badge variant="warning">
              Pending requests: {overview?.requests.pending_requests ?? 0}
            </Badge>
            <Badge variant="info">
              Active jobs: {overview?.requests.in_progress_requests ?? 0}
            </Badge>
            <Badge variant="success">
              Completed today: {overview?.requests.completed_requests ?? 0}
            </Badge>
          </CardContent>
        </Card>
      </Grid>
    </div>
  );
}
