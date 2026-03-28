import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export function DisputesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Disputes</CardTitle>
      </CardHeader>
      <CardContent>
        <p style={{ color: "#64748B" }}>
          Disputes are not wired yet. Add admin endpoints for ticket creation,
          resolution, and refunds to activate this page.
        </p>
      </CardContent>
    </Card>
  );
}
