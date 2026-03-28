import type { Job } from "../../types";
import { ScreenWithNav } from "../../components/ScreenWithNav";
import { Action, Card, Row, SafeArea } from "../../styles/shared";
import { Avatar } from "./styles";

type Props = {
  user: { id?: string; name?: string; email?: string; phone?: string } | null;
  earnings: number;
  completed: number;
  onLogout: () => void;
  activeJob?: Job;
  lastTrackingAt?: string | null;
};

export function ProfileScreen({
  user,
  earnings,
  completed,
  onLogout,
  activeJob,
  lastTrackingAt,
}: Props) {
  return (
    <ScreenWithNav active="profile">
      <SafeArea>
        <Card>
          <Row>
            <Avatar />
            <div>
              <strong>{user?.name || "Driver"}</strong>
              <p style={{ margin: 0, color: "#64748B", fontSize: 13 }}>
                Driver ID: {user?.id || "—"}
              </p>
            </div>
          </Row>
          <p style={{ margin: "8px 0 0" }}>
            <b>Phone:</b> {user?.phone || "—"}
          </p>
          <p style={{ margin: "4px 0 0" }}>
            <b>Email:</b> {user?.email || "—"}
          </p>
          <p style={{ margin: "4px 0 0" }}>
            <b>Assigned crane:</b>{" "}
            {activeJob?.variant
              ? `${activeJob.variant}${activeJob.jobId ? ` | ${activeJob.jobId}` : ""}`
              : "—"}
          </p>
          <p style={{ margin: "4px 0 0" }}>
            <b>Current status:</b> {activeJob?.status || "—"}
          </p>
          <p style={{ margin: "4px 0 0" }}>
            <b>Last tracking:</b>{" "}
            {lastTrackingAt ? new Date(lastTrackingAt).toLocaleString() : "—"}
          </p>
          <p style={{ margin: "4px 0 0" }}>
            <b>Today&apos;s earnings:</b> ₹{earnings.toLocaleString("en-IN")}
          </p>
          <p style={{ margin: "4px 0 0" }}>
            <b>Rating:</b> 4.8 (Completed jobs today: {completed})
          </p>
          <Action $tone="danger" style={{ marginTop: 10 }} onClick={onLogout}>
            Logout
          </Action>
        </Card>
      </SafeArea>
    </ScreenWithNav>
  );
}
