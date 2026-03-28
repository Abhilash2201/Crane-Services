import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { api } from "../lib/api";

type AnalyticsPayload = {
  requestsLast7Days: { day: string; requests: number }[];
  revenueLast7Days: { day: string; revenue: number }[];
  requestsByStatus: { status: string; count: number }[];
  topOwners: { id: string; name: string; total_jobs: number }[];
};

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/analytics")
      .then((res) => setData(res.data?.data || null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <small style={{ color: "#64748B" }}>Loading analytics...</small>
          ) : null}
          {!loading && !data ? (
            <small style={{ color: "#DC2626" }}>Unable to load analytics.</small>
          ) : null}
        </CardContent>
      </Card>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Requests (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 6 }}>Day</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Requests</th>
                </tr>
              </thead>
              <tbody>
                {data?.requestsLast7Days?.map((row) => (
                  <tr key={row.day}>
                    <td style={{ padding: 6 }}>{row.day}</td>
                    <td style={{ padding: 6 }}>{row.requests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 6 }}>Day</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data?.revenueLast7Days?.map((row) => (
                  <tr key={row.day}>
                    <td style={{ padding: 6 }}>{row.day}</td>
                    <td style={{ padding: 6 }}>
                      ₹{Number(row.revenue || 0).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requests by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 6 }}>Status</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Count</th>
                </tr>
              </thead>
              <tbody>
                {data?.requestsByStatus?.map((row) => (
                  <tr key={row.status}>
                    <td style={{ padding: 6 }}>{row.status}</td>
                    <td style={{ padding: 6 }}>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Owners (Jobs)</CardTitle>
          </CardHeader>
          <CardContent>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 6 }}>Owner</th>
                  <th style={{ textAlign: "left", padding: 6 }}>Jobs</th>
                </tr>
              </thead>
              <tbody>
                {data?.topOwners?.map((row) => (
                  <tr key={row.id}>
                    <td style={{ padding: 6 }}>{row.name}</td>
                    <td style={{ padding: 6 }}>{row.total_jobs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
