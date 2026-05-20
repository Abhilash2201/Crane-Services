import { ArrowRight, BellRing, Briefcase, MapPin, Power, Truck, WifiOff } from "lucide-react";
import type { Job } from "../../types";
import { sid } from "../../lib/sid";
import { useNavigate } from "react-router-dom";
import { ScreenWithNav } from "../../components/ScreenWithNav";
import {
  ActionMini,
  AlertBtn,
  AlertBtnIcon,
  Body,
  DriverName,
  EmptyJob,
  Greeting,
  Header,
  HeaderTop,
  IdPill,
  InstallBanner,
  JobCard,
  JobCardBody,
  JobCardHeader,
  JobField,
  JobFieldIcon,
  JobFieldLabel,
  JobFieldValue,
  LocationRow,
  MetricCard,
  MetricLabel,
  MetricRow,
  MetricSub,
  MetricValue,
  OfflineBar,
  OnlineToggle,
  OpenJobBtn,
  SectionLabel,
  StatusDot,
  StatusPill,
} from "./styles";

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

function fmtStatus(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

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
  const navigate = useNavigate();
  const displayName = name || (phone ? phone.slice(-4) : "Driver");
  const locationLabel = location || active?.location || "Bengaluru";
  const isOnline = online && !isOffline;

  return (
    <ScreenWithNav active="home">
      {/* ── Header ─────────────────────────────────── */}
      <Header>
        <HeaderTop>
          <div>
            <Greeting>CraneHub Driver</Greeting>
            <DriverName>Hi, {displayName}</DriverName>
            <LocationRow>
              <MapPin size={11} />
              {locationLabel}
            </LocationRow>
          </div>
          <OnlineToggle $on={isOnline} onClick={onToggleOnline}>
            <StatusDot $on={isOnline} />
            <Power size={13} />
            {isOnline ? "Online" : "Offline"}
          </OnlineToggle>
        </HeaderTop>
      </Header>

      {/* ── Body ───────────────────────────────────── */}
      <Body>
        {showInstall ? (
          <InstallBanner>
            <span>Install app for offline sync</span>
            <ActionMini onClick={onDismissInstall}>Dismiss</ActionMini>
          </InstallBanner>
        ) : null}

        {isOffline ? (
          <OfflineBar>
            <WifiOff size={14} />
            Device offline — actions will sync when reconnected.
          </OfflineBar>
        ) : null}

        {/* ── Metrics ── */}
        <MetricRow>
          <MetricCard>
            <MetricLabel>Today&apos;s Earnings</MetricLabel>
            <MetricValue>₹{todaysEarnings.toLocaleString("en-IN")}</MetricValue>
            <MetricSub>Completed jobs</MetricSub>
          </MetricCard>
          <MetricCard>
            <MetricLabel>Status</MetricLabel>
            <MetricValue style={{ fontSize: 16, marginTop: 4 }}>
              <StatusDot $on={isOnline} style={{ display: "inline-block", marginRight: 6 }} />
              {isOnline ? "Online" : "Offline"}
            </MetricValue>
            <MetricSub>{active ? "Job in progress" : "Available"}</MetricSub>
          </MetricCard>
        </MetricRow>

        {/* ── Active Job ── */}
        <SectionLabel>Active Job</SectionLabel>
        <JobCard>
          <JobCardHeader $active={Boolean(active)}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Briefcase size={14} color={active ? "#FF6200" : "#94a3b8"} />
              <span style={{ fontWeight: 700, fontSize: 13, color: active ? "#0A2540" : "#94a3b8" }}>
                {active ? "In Progress" : "No Active Job"}
              </span>
            </div>
            {active ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <IdPill>{active.jobRefId ?? `JOB-${sid(active.jobId)}`}</IdPill>
                <StatusPill $status={active.status}>{fmtStatus(active.status)}</StatusPill>
              </div>
            ) : null}
          </JobCardHeader>

          <JobCardBody>
            {active ? (
              <>
                <JobField>
                  <JobFieldIcon>
                    <Truck size={14} color="#FF6200" />
                  </JobFieldIcon>
                  <div>
                    <JobFieldLabel>Crane</JobFieldLabel>
                    <JobFieldValue>{active.variant}</JobFieldValue>
                  </div>
                </JobField>

                <JobField>
                  <JobFieldIcon>
                    <MapPin size={14} color="#FF6200" />
                  </JobFieldIcon>
                  <div>
                    <JobFieldLabel>Pickup Location</JobFieldLabel>
                    <JobFieldValue>{active.location}</JobFieldValue>
                  </div>
                </JobField>

                <OpenJobBtn onClick={() => navigate(`/active-job/${active.id}`)}>
                  Open Active Job <ArrowRight size={16} />
                </OpenJobBtn>
              </>
            ) : (
              <EmptyJob>
                <Briefcase size={28} strokeWidth={1.5} />
                <span>Waiting for assignment</span>
                <span style={{ fontSize: 11, color: "#cbd5e1" }}>
                  Go online to receive job alerts
                </span>
              </EmptyJob>
            )}
          </JobCardBody>
        </JobCard>

        {/* ── Quick Actions ── */}
        <SectionLabel>Quick Actions</SectionLabel>
        <AlertBtn onClick={() => navigate("/job-alert")}>
          <AlertBtnIcon>
            <BellRing size={17} />
          </AlertBtnIcon>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540" }}>
              Job Notifications
            </div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
              Check new assignments
            </div>
          </div>
          <ArrowRight size={16} color="#94a3b8" />
        </AlertBtn>
      </Body>
    </ScreenWithNav>
  );
}
