import type { ReactNode } from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  z-index: 50;
  padding: 16px;
`;

const Dialog = styled.div`
  width: min(560px, 100%);
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 18px;
`;

export function Modal({
  open,
  children,
  onClose
}: {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>{children}</Dialog>
    </Overlay>
  );
}
