import styled from "styled-components";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { kpis, recentActivity, requestsByVariant, revenueTrend } from "../data/mockData";
import { Badge } from "../components/ui/badge";
import { BarChart, LineChart } from "../components/ui/charts";

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

const BottomGrid = styled.div`
  display: grid;
  gap: 14px;
  grid-template-columns: 2fr 1fr;
  margin-top: 14px;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const ActivityList = styled.ol`
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 10px;

  li {
    color: ${({ theme }) => theme.colors.navy};
    font-size: 14px;
  }
`;

const SidebarPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

const MiniSidebar = styled.div<{ $collapsed?: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  min-height: 130px;
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  padding: 10px;

  strong {
    display: block;
    margin-bottom: 10px;
    font-size: 12px;
    opacity: 0.9;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 6px;
  }

  li {
    height: 26px;
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.14);
    width: ${({ $collapsed }) => ($collapsed ? "30px" : "100%")} ;
  }
`;

export function OverviewPage() {
  return (
    <div>
      <h1 style={{ marginTop: 0, marginBottom: 12, color: "#0A2540" }}>Platform Overview</h1>
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
        <Card style={{ gridColumn: "span 2" }}>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={revenueTrend} />
          </CardContent>
        </Card>

        <Card style={{ gridColumn: "span 2" }}>
          <CardHeader>
            <CardTitle>Requests by Crane Variant</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={requestsByVariant} />
          </CardContent>
        </Card>
      </Grid>

      <BottomGrid>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityList>
              {recentActivity.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ActivityList>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sidebar States</CardTitle>
          </CardHeader>
          <CardContent>
            <SidebarPreview>
              <MiniSidebar>
                <strong>Full</strong>
                <ul>
                  <li />
                  <li />
                  <li />
                  <li />
                </ul>
              </MiniSidebar>
              <MiniSidebar $collapsed>
                <strong>Collapsed</strong>
                <ul>
                  <li />
                  <li />
                  <li />
                  <li />
                </ul>
              </MiniSidebar>
            </SidebarPreview>
            <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
              <Badge variant="warning">Pending Approvals: 37</Badge>
              <Badge variant="danger">Open Disputes: 9</Badge>
            </div>
          </CardContent>
        </Card>
      </BottomGrid>
    </div>
  );
}
