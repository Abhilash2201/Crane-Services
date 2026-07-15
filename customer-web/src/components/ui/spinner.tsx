import styled, { keyframes } from "styled-components";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Ring = styled.span<{ $size: number }>`
  display: inline-block;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.65s linear infinite;
  flex-shrink: 0;
`;

export function Spinner({ size = 18 }: { size?: number }) {
  return <Ring $size={size} />;
}
