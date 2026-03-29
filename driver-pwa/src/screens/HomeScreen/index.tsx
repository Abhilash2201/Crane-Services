import { BellRing, Power, WifiOff } from "lucide-react";
import type { Job } from "../../types";
import { NavigateButton } from "../../components/NavigateButton";
import { ScreenWithNav } from "../../components/ScreenWithNav";
import { Card, Row, SafeArea } from "../../styles/shared";
import { ActionMini, InstallBanner, OfflineBar, Toggle } from "./styles";

type Props = {
  phone: string;
  name: string;
  location: string;
  online: boolean;
  isOffline: boolean;
  active?: Job;
  todaysEarnings: number;
  showInstall: boolean;
  onDismissInstall: () => void;
  onToggleOnline: () => void;
};

export function HomeScreen({
  phone,
  name,
  location,
  online,
  isOffline,
  active,
  todaysEarnings,
  showInstall,
  onDismissInstall,
  onToggleOnline,
}: Props) {
  const shortId = phone ? phone.slice(-4) : "Driver";
  const displayName = name || shortId;
  const locationLabel = location || active?.location || "Bengaluru Central";
  const nameLabel = `Hi, ${displayName}`;

  return (
    <ScreenWithNav active="home">
      <SafeArea>
        {showInstall ? (
          <InstallBanner>
            <span style={{ fontSize: 13 }}>Install app for offline sync</span>
            <ActionMini onClick={onDismissInstall}>Dismiss</ActionMini>
          </InstallBanner>
        ) : null}
        {isOffline ? (
          <OfflineBar>
            <WifiOff size={14} /> Device offline. Actions will sync later.
          </OfflineBar>
        ) : null}
        <Row>
          <div>
            <strong style={{ color: "#0A2540" }}>
              {nameLabel}
            </strong>
            <p style={{ margin: 0, color: "#64748B", fontSize: 13 }}>
              {locationLabel}
            </p>
          </div>
          <Toggle $on={online && !isOffline} onClick={onToggleOnline}>
            <Power size={14} /> {online && !isOffline ? "Online" : "Offline"}
          </Toggle>
        </Row>
        <Card>
          <small style={{ color: "#64748B" }}>Today&apos;s earnings</small>
          <h2 style={{ margin: "4px 0" }}>
            ₹{todaysEarnings.toLocaleString("en-IN")}
          </h2>
        </Card>
        <Card>
          <strong>Current job</strong>
          {active ? (
            <>
              <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
                <div style={{ fontWeight: 700, color: "#0A2540" }}>
                  Crane: {active.variant}
                </div>
                <div style={{ color: "#334155", fontSize: 13 }}>
                  Registration: {active.jobId || "—"}
                </div>
                <div style={{ color: "#64748B", fontSize: 13 }}>
                  Pickup: {active.location}
                </div>
                <div style={{ color: "#64748B", fontSize: 13 }}>
                  Status: {active.status.replace("_", " ")}
                </div>
              </div>
              <NavigateButton to={`/active-job/${active.id}`}>
                Open active job
              </NavigateButton>
            </>
          ) : (
            <p style={{ margin: "6px 0", color: "#64748B" }}>
              Waiting for new assignment
            </p>
          )}
        </Card>
        <NavigateButton to="/job-alert">
          <BellRing size={16} /> Check new job notification
        </NavigateButton>
      </SafeArea>
    </ScreenWithNav>
  );
}
