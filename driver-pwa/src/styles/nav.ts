import styled from "styled-components";

export const BottomNav = styled.div`
  margin-top: auto;
  background: #fff;
  border-top: 1px solid #e2e8f0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  min-height: 76px;
`;

export const NavItem = styled.button<{ $active?: boolean }>`
  border: 0;
  background: transparent;
  display: grid;
  place-items: center;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "#64748B"};
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
`;

export const FloatingBtn = styled.button`
  position: absolute;
  right: 14px;
  bottom: 90px;
  border: 0;
  border-radius: 999px;
  width: 46px;
  height: 46px;
  background: #0a2540;
  color: #fff;
  display: grid;
  place-items: center;
`;
