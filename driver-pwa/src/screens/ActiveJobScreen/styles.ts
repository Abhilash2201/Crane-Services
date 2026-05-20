import styled, { keyframes } from "styled-components";

const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const toastIn = keyframes`
  from { transform: translateY(-12px); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
`;

// ── Header ─────────────────────────────────────────────────
export const Header = styled.div`
  background: linear-gradient(135deg, #0A2540 0%, #0e3460 100%);
  padding: 20px 16px 40px;
`;

export const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const JobMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
`;

export const IdPill = styled.span`
  background: rgba(255,255,255,0.12);
  color: #e2e8f0;
  border-radius: 6px;
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 700;
  font-family: monospace;
  border: 1px solid rgba(255,255,255,0.15);
`;

export const VariantPill = styled.span`
  background: rgba(255,98,0,0.2);
  color: #fdba74;
  border-radius: 6px;
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid rgba(255,98,0,0.3);
`;

export const StatusBadge = styled.span<{ $status: string }>`
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  background: ${({ $status }) => {
    if ($status === "in_progress" || $status === "working") return "rgba(251,191,36,0.2)";
    if ($status === "assigned" || $status === "en_route") return "rgba(34,197,94,0.2)";
    return "rgba(148,163,184,0.2)";
  }};
  color: ${({ $status }) => {
    if ($status === "in_progress" || $status === "working") return "#fbbf24";
    if ($status === "assigned" || $status === "en_route") return "#4ade80";
    return "#94a3b8";
  }};
  border: 1px solid ${({ $status }) => {
    if ($status === "in_progress" || $status === "working") return "rgba(251,191,36,0.35)";
    if ($status === "assigned" || $status === "en_route") return "rgba(34,197,94,0.35)";
    return "rgba(148,163,184,0.2)";
  }};
`;

export const TimerLabel = styled.div`
  color: #7fa8c9;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 12px;
  margin-bottom: 4px;
`;

export const TimerDisplay = styled.div`
  color: #ffffff;
  font-size: 38px;
  font-weight: 800;
  font-family: monospace;
  letter-spacing: 0.04em;
  line-height: 1;
`;

// ── Body ───────────────────────────────────────────────────
export const Body = styled.div`
  background: #F8FAFC;
  border-radius: 20px 20px 0 0;
  margin-top: -20px;
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
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  &:last-child { border-bottom: none; }
`;

export const InfoIcon = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const InfoLabel = styled.div`
  font-size: 10px;
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
  line-height: 1.4;
`;

export const NavLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #FF6200;
  text-decoration: none;
`;

// ── Contact buttons ────────────────────────────────────────
export const ContactRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

export const ContactBtn = styled.button<{ $tone?: "green" }>`
  min-height: 48px;
  border-radius: 12px;
  border: 1.5px solid ${({ $tone }) => ($tone === "green" ? "#bbf7d0" : "#e2e8f0")};
  background: ${({ $tone }) => ($tone === "green" ? "#f0fdf4" : "#fff")};
  color: ${({ $tone }) => ($tone === "green" ? "#166534" : "#0A2540")};
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
  &:active { opacity: 0.8; }
`;

// ── Checklist ──────────────────────────────────────────────
export const ChecklistCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 2px 8px rgba(10,37,64,0.06);
`;

export const ChecklistItem = styled.div<{ $done: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f8fafc;
  &:last-child { border-bottom: none; }
  opacity: ${({ $done }) => ($done ? 1 : 0.6)};
`;

export const CheckIcon = styled.div<{ $done: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid ${({ $done }) => ($done ? "#22c55e" : "#cbd5e1")};
  background: ${({ $done }) => ($done ? "#22c55e" : "transparent")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
`;

export const CheckText = styled.div<{ $done: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $done }) => ($done ? "#166534" : "#64748b")};
  text-decoration: ${({ $done }) => ($done ? "none" : "none")};
`;

// ── Action buttons ─────────────────────────────────────────
export const ActionStack = styled.div`
  display: grid;
  gap: 8px;
`;

export const PrimaryBtn = styled.button`
  width: 100%;
  min-height: 50px;
  background: #0A2540;
  color: #fff;
  border: none;
  border-radius: 13px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
  &:active:not(:disabled) { opacity: 0.85; }
`;

export const SuccessBtn = styled(PrimaryBtn)`
  background: #16a34a;
`;

export const UploadBtn = styled(PrimaryBtn)`
  background: #fff;
  border: 1.5px solid #e2e8f0;
  color: #0A2540;
  box-shadow: 0 2px 6px rgba(10,37,64,0.06);
`;

export const DangerBtn = styled(PrimaryBtn)`
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  min-height: 54px;
  font-size: 15px;
  box-shadow: 0 4px 14px rgba(220,38,38,0.3);
`;

export const GoOnlineBtn = styled.button`
  background: #0A2540;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
`;

// ── Offline bar ────────────────────────────────────────────
export const OfflineBar = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
`;

// ── Toast ──────────────────────────────────────────────────
export const Toast = styled.div<{ $type?: "success" | "error" }>`
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  background: ${({ $type }) => ($type === "error" ? "#dc2626" : "#0f172a")};
  color: #fff;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  animation: ${toastIn} 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ── Confirm bottom sheet ───────────────────────────────────
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

// ── Empty state ────────────────────────────────────────────
export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 20px;
  color: #94a3b8;
  text-align: center;
`;
