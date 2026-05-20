import styled, { keyframes } from "styled-components";

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

export const Header = styled.div`
  background: linear-gradient(135deg, #0A2540 0%, #0e3460 100%);
  padding: 20px 16px 40px;
  position: relative;
`;

export const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const Greeting = styled.div`
  color: #94b4d4;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
`;

export const DriverName = styled.div`
  color: #ffffff;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
`;

export const LocationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  color: #7fa8c9;
  font-size: 12px;
`;

export const OnlineToggle = styled.button<{ $on: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  border: none;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ $on }) => ($on ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)")};
  color: ${({ $on }) => ($on ? "#4ade80" : "#f87171")};
  border: 1px solid ${({ $on }) => ($on ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)")};
`;

export const StatusDot = styled.span<{ $on: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ $on }) => ($on ? "#4ade80" : "#f87171")};
  animation: ${({ $on }) => ($on ? pulse : "none")} 2s infinite;
  flex-shrink: 0;
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

export const MetricRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

export const MetricCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 12px;
  box-shadow: 0 2px 8px rgba(10,37,64,0.06);
`;

export const MetricLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
`;

export const MetricValue = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: #0A2540;
  line-height: 1.1;
`;

export const MetricSub = styled.div`
  font-size: 11px;
  color: #64748B;
  margin-top: 3px;
`;

export const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 0 2px;
`;

export const JobCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(10,37,64,0.06);
`;

export const JobCardHeader = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  background: ${({ $active }) => ($active ? "#fff8f3" : "#f8fafc")};
`;

export const JobCardBody = styled.div`
  padding: 14px;
  display: grid;
  gap: 10px;
`;

export const JobField = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

export const JobFieldIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
`;

export const JobFieldLabel = styled.div`
  font-size: 11px;
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
  gap: 5px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
  background: ${({ $status }) => {
    if ($status === "in_progress" || $status === "working") return "#fef9c3";
    if ($status === "assigned" || $status === "en_route") return "#dcfce7";
    return "#f1f5f9";
  }};
  color: ${({ $status }) => {
    if ($status === "in_progress" || $status === "working") return "#92400e";
    if ($status === "assigned" || $status === "en_route") return "#166534";
    return "#475569";
  }};
`;

export const OpenJobBtn = styled.button`
  width: 100%;
  min-height: 46px;
  background: #FF6200;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.15s;
  &:active { opacity: 0.85; }
`;

export const EmptyJob = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 0 8px;
  color: #94a3b8;
  font-size: 13px;
`;

export const AlertBtn = styled.button`
  width: 100%;
  min-height: 52px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #0A2540;
  box-shadow: 0 2px 8px rgba(10,37,64,0.05);
  &:active { background: #f8fafc; }
`;

export const AlertBtnIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fff7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FF6200;
  flex-shrink: 0;
`;

export const InstallBanner = styled.div`
  background: #fff7ed;
  border: 1px dashed #fdba74;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #92400e;
`;

export const ActionMini = styled.button`
  border: 0;
  border-radius: 8px;
  background: #0a2540;
  color: #fff;
  min-height: 28px;
  padding: 0 10px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
`;

export const OfflineBar = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
`;
