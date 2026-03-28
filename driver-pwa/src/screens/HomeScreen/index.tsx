import { BellRing, Power, WifiOff } from "lucide-react";
import type { Job } from "../../types";
import { NavigateButton } from "../../components/NavigateButton";
import { ScreenWithNav } from "../../components/ScreenWithNav";
import { Card, Row, SafeArea } from "../../styles/shared";
import { ActionMini, InstallBanner, OfflineBar, Toggle } from "./styles";

type Props = {
  phone: string;
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
  online,
  isOffline,
  active,
  todaysEarnings,
  showInstall,
  onDismissInstall,
  onToggleOnline,
}: Props) {
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
              Hi, {phone ? phone.slice(-4) : "Driver"}
            </strong>
            <p style={{ margin: 0, color: "#64748B", fontSize: 13 }}>
              Bengaluru Central
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
              <p style={{ margin: "6px 0", color: "#334155" }}>
                {active.id} | {active.variant} | {active.location}
              </p>
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
