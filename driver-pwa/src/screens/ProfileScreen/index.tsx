import { Briefcase, LogOut, Mail, Phone, Star, Truck } from "lucide-react";
import { useState } from "react";
import { sid } from "../../lib/sid";
import type { Job } from "../../types";
import { ScreenWithNav } from "../../components/ScreenWithNav";
import {
  ActiveJobBanner,
  ActiveJobIcon,
  AvatarRing,
  Body,
  Header,
  HeaderBadge,
  HeaderBadgeRow,
  IdPill,
  InfoCard,
  InfoIcon,
  InfoLabel,
  InfoRow,
  InfoValue,
  InfoValueMono,
  LogoutBtn,
  Overlay,
  ProfileId,
  ProfileName,
  SectionLabel,
  Sheet,
  SheetActions,
  SheetBody,
  SheetCancelBtn,
  SheetConfirmBtn,
  SheetHandle,
  SheetTitle,
  StatCard,
  StatLabel,
  StatRow,
  StatValue,
  StatusPill,
} from "./styles";

const fmtStatus = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

type Props = {
  user: { id?: string; name?: string; email?: string; phone?: string } | null;
  earnings: number;
  completed: number;
  onLogout: () => void;
  activeJob?: Job;
  lastTrackingAt?: string | null;
};

function initials(name?: string): string {
  if (!name) return "D";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ProfileScreen({
  user,
  earnings,
  completed,
  onLogout,
  activeJob,
}: Props) {
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <ScreenWithNav active="profile">
      {/* ── Logout confirm sheet ─────────────────── */}
      {confirmLogout ? (
        <>
          <Overlay onClick={() => setConfirmLogout(false)} />
          <Sheet>
            <SheetHandle />
            <SheetTitle>Log out?</SheetTitle>
            <SheetBody>
              You&apos;ll be signed out of CraneHub Driver. Any active job will remain assigned to you.
            </SheetBody>
            <SheetActions>
              <SheetConfirmBtn onClick={() => { setConfirmLogout(false); onLogout(); }}>
                Yes, Log Out
              </SheetConfirmBtn>
              <SheetCancelBtn onClick={() => setConfirmLogout(false)}>
                Cancel
              </SheetCancelBtn>
            </SheetActions>
          </Sheet>
        </>
      ) : null}

      {/* ── Header ──────────────────────────────── */}
      <Header>
        <AvatarRing>{initials(user?.name)}</AvatarRing>
        <ProfileName>{user?.name || "Driver"}</ProfileName>
        <ProfileId>DRV-{sid(user?.id)}</ProfileId>
        <HeaderBadgeRow>
          <HeaderBadge $tone="blue">Driver</HeaderBadge>
          <HeaderBadge $tone="orange"><Star size={10} /> 4.8</HeaderBadge>
          {activeJob ? (
            <HeaderBadge $tone="green">On Job</HeaderBadge>
          ) : null}
        </HeaderBadgeRow>
      </Header>

      {/* ── Body ────────────────────────────────── */}
      <Body>
        {/* ── Stats ── */}
        <StatRow>
          <StatCard>
            <StatValue>₹{earnings >= 1000 ? `${(earnings / 1000).toFixed(1)}k` : earnings}</StatValue>
            <StatLabel>Earnings</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{completed}</StatValue>
            <StatLabel>Jobs Done</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>4.8</StatValue>
            <StatLabel>Rating</StatLabel>
          </StatCard>
        </StatRow>

        {/* ── Active job banner ── */}
        {activeJob ? (
          <>
            <SectionLabel>Active Job</SectionLabel>
            <ActiveJobBanner>
              <ActiveJobIcon>
                <Truck size={18} color="#FF6200" />
              </ActiveJobIcon>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9a3412", marginBottom: 3 }}>
                  Currently On Job
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <IdPill>{activeJob.jobRefId ?? `JOB-${sid(activeJob.id)}`}</IdPill>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{activeJob.variant}</span>
                  <StatusPill $status={activeJob.status}>{fmtStatus(activeJob.status)}</StatusPill>
                </div>
              </div>
            </ActiveJobBanner>
          </>
        ) : null}

        {/* ── Contact info ── */}
        <SectionLabel>Contact Info</SectionLabel>
        <InfoCard>
          <InfoRow>
            <InfoIcon><Phone size={14} color="#FF6200" /></InfoIcon>
            <div>
              <InfoLabel>Phone</InfoLabel>
              <InfoValue>{user?.phone || "—"}</InfoValue>
            </div>
          </InfoRow>
          <InfoRow>
            <InfoIcon><Mail size={14} color="#FF6200" /></InfoIcon>
            <div>
              <InfoLabel>Email</InfoLabel>
              <InfoValue>{user?.email || "—"}</InfoValue>
            </div>
          </InfoRow>
          <InfoRow>
            <InfoIcon><Briefcase size={14} color="#FF6200" /></InfoIcon>
            <div>
              <InfoLabel>Driver ID</InfoLabel>
              <InfoValueMono>DRV-{sid(user?.id)}</InfoValueMono>
            </div>
          </InfoRow>
        </InfoCard>

        {/* ── Logout ── */}
        <LogoutBtn onClick={() => setConfirmLogout(true)}>
          <LogOut size={16} /> Log Out
        </LogoutBtn>
      </Body>
    </ScreenWithNav>
  );
}
