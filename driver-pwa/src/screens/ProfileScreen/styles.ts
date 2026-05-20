import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`;

// ── Header ─────────────────────────────────────────────────
export const Header = styled.div`
  background: linear-gradient(135deg, #0A2540 0%, #0e3460 100%);
  padding: 24px 16px 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

export const AvatarRing = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6200, #ff8c42);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(255,98,0,0.4);
  flex-shrink: 0;
`;

export const ProfileName = styled.div`
  color: #ffffff;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
`;

export const ProfileId = styled.div`
  color: #94b4d4;
  font-size: 12px;
  font-family: monospace;
  font-weight: 600;
  margin-top: 4px;
`;

export const HeaderBadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
  justify-content: center;
`;

export const HeaderBadge = styled.span<{ $tone?: "orange" | "green" | "blue" }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: ${({ $tone }) =>
    $tone === "orange" ? "rgba(255,98,0,0.2)" :
    $tone === "green"  ? "rgba(34,197,94,0.18)" :
    $tone === "blue"   ? "rgba(96,165,250,0.18)" :
    "rgba(255,255,255,0.1)"};
  color: ${({ $tone }) =>
    $tone === "orange" ? "#fdba74" :
    $tone === "green"  ? "#4ade80" :
    $tone === "blue"   ? "#93c5fd" :
    "#e2e8f0"};
  border: 1px solid ${({ $tone }) =>
    $tone === "orange" ? "rgba(255,98,0,0.3)" :
    $tone === "green"  ? "rgba(34,197,94,0.3)" :
    $tone === "blue"   ? "rgba(96,165,250,0.3)" :
    "rgba(255,255,255,0.15)"};
`;

// ── Body ───────────────────────────────────────────────────
export const Body = styled.div`
  background: #F8FAFC;
  border-radius: 20px 20px 0 0;
  margin-top: -24px;
  padding: 16px 14px 110px;
  display: grid;
  gap: 12px;
  position: relative;
  z-index: 1;
`;

export const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 0 2px;
`;

// ── Stat cards ─────────────────────────────────────────────
export const StatRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
`;

export const StatCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 10px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(10,37,64,0.05);
`;

export const StatValue = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #0A2540;
  line-height: 1.1;
`;

export const StatLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 3px;
`;

// ── Info card ──────────────────────────────────────────────
export const InfoCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(10,37,64,0.06);
`;

export const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  &:last-child { border-bottom: none; }
`;

export const InfoIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const InfoLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const InfoValue = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  margin-top: 2px;
`;

export const InfoValueMono = styled(InfoValue)`
  font-family: monospace;
`;

// ── Active job strip ───────────────────────────────────────
export const ActiveJobBanner = styled.div`
  background: #fff8f3;
  border: 1px solid #fed7aa;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ActiveJobIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #ffedd5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const IdPill = styled.span`
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
  padding: 2px 7px;
  font-size: 11px;
  font-weight: 700;
  font-family: monospace;
`;

export const StatusPill = styled.span<{ $status: string }>`
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  background: ${({ $status }) =>
    $status === "in_progress" || $status === "working" ? "#fef9c3" : "#dcfce7"};
  color: ${({ $status }) =>
    $status === "in_progress" || $status === "working" ? "#92400e" : "#166534"};
`;

// ── Logout ─────────────────────────────────────────────────
export const LogoutBtn = styled.button`
  width: 100%;
  min-height: 50px;
  background: #fff;
  border: 1.5px solid #fecaca;
  border-radius: 14px;
  color: #dc2626;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(220,38,38,0.08);
  &:active { background: #fef2f2; }
`;

// ── Confirm sheet ──────────────────────────────────────────
export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10,37,64,0.45);
  z-index: 50;
  animation: ${fadeIn} 0.18s ease;
`;

export const Sheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 430px;
  margin: 0 auto;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 24px 20px 40px;
  z-index: 51;
  animation: ${slideUp} 0.22s ease;
`;

export const SheetHandle = styled.div`
  width: 36px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 999px;
  margin: 0 auto 20px;
`;

export const SheetTitle = styled.div`
  font-size: 17px;
  font-weight: 800;
  color: #0A2540;
  margin-bottom: 6px;
`;

export const SheetBody = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 20px;
  line-height: 1.5;
`;

export const SheetActions = styled.div`
  display: grid;
  gap: 8px;
`;

export const SheetConfirmBtn = styled.button`
  width: 100%;
  min-height: 50px;
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  &:active { opacity: 0.85; }
`;

export const SheetCancelBtn = styled.button`
  width: 100%;
  min-height: 46px;
  background: transparent;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  color: #64748b;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
`;
