import styled from "styled-components";

export const TabRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

export const TabBtn = styled.button<{ $active: boolean }>`
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? "#FF6200" : "#E2E8F0")};
  background: ${({ $active }) => ($active ? "#fff3ec" : "#fff")};
  font-weight: 700;
`;
