import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export function ApprovalsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner & Crane Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        <p style={{ color: "#64748B" }}>
          Approval workflows are not wired to the backend yet. Add admin
          endpoints for owner/crane document review to enable this section.
        </p>
      </CardContent>
    </Card>
  );
}
