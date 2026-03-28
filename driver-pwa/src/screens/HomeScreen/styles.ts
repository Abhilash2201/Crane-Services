import styled from "styled-components";

export const InstallBanner = styled.div`
  border: 1px dashed #fdba74;
  background: #fff7ed;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ActionMini = styled.button`
  border: 0;
  border-radius: 10px;
  background: #0a2540;
  color: #fff;
  min-height: 30px;
  padding: 0 10px;
  font-weight: 700;
`;

export const OfflineBar = styled.div`
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #475569;
`;

export const Toggle = styled.button<{ $on: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${({ $on }) => ($on ? "#dcfce7" : "#fee2e2")};
  color: ${({ $on }) => ($on ? "#166534" : "#991b1b")};
`;
