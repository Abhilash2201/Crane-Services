import styled from "styled-components";

export const Toast = styled.div`
  position: sticky;
  top: 6px;
  z-index: 10;
  background: #0f172a;
  color: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
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
