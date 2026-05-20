import styled from "styled-components";

export const Header = styled.div`
  background: linear-gradient(135deg, #0A2540 0%, #0e3460 100%);
  padding: 20px 16px 40px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

export const HeaderTitle = styled.div`
  color: #94b4d4;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
`;

export const HeaderName = styled.div`
  color: #ffffff;
  font-size: 20px;
  font-weight: 800;
`;

export const HeaderSub = styled.div`
  color: #7fa8c9;
  font-size: 12px;
  margin-top: 4px;
`;

export const RefreshBtn = styled.button`
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 10px;
  color: #fff;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  &:active { opacity: 0.7; }
`;

export const Body = styled.div`
  background: #F8FAFC;
  border-radius: 20px 20px 0 0;
  margin-top: -20px;
  padding: 16px 14px 100px;
  display: grid;
  gap: 12px;
  position: relative;
  z-index: 1;
`;

export const TabRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 4px;
  gap: 0;
`;

export const TabBtn = styled.button<{ $active: boolean }>`
  min-height: 38px;
  border-radius: 9px;
  border: none;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.18s;
  background: ${({ $active }) => ($active ? "#FF6200" : "transparent")};
  color: ${({ $active }) => ($active ? "#fff" : "#64748b")};
  box-shadow: ${({ $active }) => ($active ? "0 2px 8px rgba(255,98,0,0.3)" : "none")};
`;

export const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 0 2px;
`;

export const JobCard = styled.div<{ $clickable?: boolean; $locked?: boolean }>`
  background: #fff;
  border: 1px solid ${({ $locked }) => ($locked ? "#fde68a" : "#e2e8f0")};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(10,37,64,0.06);
  cursor: ${({ $clickable, $locked }) => ($locked ? "not-allowed" : $clickable ? "pointer" : "default")};
  opacity: ${({ $locked }) => ($locked ? 0.75 : 1)};
  &:active {
    opacity: ${({ $clickable, $locked }) => ($clickable && !$locked ? 0.92 : 1)};
  }
`;

export const JobCardHeader = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #f1f5f9;
  background: ${({ $status }) => {
    if ($status === "in_progress" || $status === "working") return "#fff8f3";
    if ($status === "assigned" || $status === "en_route") return "#f0fdf4";
    if ($status === "completed") return "#f0f9ff";
    return "#f8fafc";
  }};
`;

export const JobCardBody = styled.div`
  padding: 12px 14px;
  display: grid;
  gap: 8px;
`;

export const JobField = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

export const JobFieldIcon = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
`;

export const JobFieldLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const JobFieldValue = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  margin-top: 1px;
  line-height: 1.4;
`;

export const IdPill = styled.span`
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  font-family: monospace;
`;

export const StatusPill = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  background: ${({ $status }) => {
    if ($status === "in_progress" || $status === "working") return "#fef9c3";
    if ($status === "assigned" || $status === "en_route") return "#dcfce7";
    if ($status === "completed") return "#e0f2fe";
    if ($status === "rejected" || $status === "cancelled") return "#fee2e2";
    return "#f1f5f9";
  }};
  color: ${({ $status }) => {
    if ($status === "in_progress" || $status === "working") return "#92400e";
    if ($status === "assigned" || $status === "en_route") return "#166534";
    if ($status === "completed") return "#0369a1";
    if ($status === "rejected" || $status === "cancelled") return "#dc2626";
    return "#475569";
  }};
`;

export const LockedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fef9c3;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #92400e;
`;

export const OpenBtn = styled.button<{ $active?: boolean }>`
  width: 100%;
  min-height: 42px;
  background: ${({ $active }) => ($active ? "#FF6200" : "#0A2540")};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.15s;
  &:active { opacity: 0.85; }
`;

export const EarningsBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 700;
  color: #166534;
  background: #dcfce7;
  border-radius: 8px;
  padding: 4px 10px;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 20px;
  color: #94a3b8;
  text-align: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
`;
