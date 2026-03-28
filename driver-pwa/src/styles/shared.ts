import styled from "styled-components";

export const AppViewport = styled.div<{ $offline?: boolean }>`
  min-height: 100vh;
  max-width: 430px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.neutralBg};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  filter: ${({ $offline }) => ($offline ? "grayscale(0.2)" : "none")};
`;

export const SafeArea = styled.div`
  padding: 16px 14px 12px;
  display: grid;
  gap: 10px;
  min-height: 0;
`;

export const Card = styled.div`
  ${({ theme }) => theme.mixins.card};
  padding: 12px;
`;

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

export const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

export const Action = styled.button<{ $tone?: "success" | "danger" | "primary" }>`
  width: 100%;
  min-height: 54px;
  border: 0;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #fff;
  background: ${({ $tone, theme }) => {
    if ($tone === "success") return theme.colors.success;
    if ($tone === "danger") return theme.colors.danger;
    return theme.colors.primary;
  }};
  opacity: ${({ disabled }) => (disabled ? 0.45 : 1)};
`;

export const Input = styled.input`
  width: 100%;
  min-height: 46px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 10px;
`;
