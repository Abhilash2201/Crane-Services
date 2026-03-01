import { useEffect, type ReactNode } from "react";
import styled from "styled-components";
import { X } from "lucide-react";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(10, 37, 64, 0.4);
  display: grid;
  place-items: center;
  z-index: 50;
`;

const Panel = styled.div`
  width: min(840px, calc(100vw - 24px));
  max-height: calc(100vh - 24px);
  overflow: auto;
  border-radius: 16px;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Body = styled.div`
  padding: 16px;
`;

const IconButton = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.muted};
`;

export function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={(event) => event.stopPropagation()}>
        <Head>
          <strong>{title}</strong>
          <IconButton onClick={onClose} aria-label="Close">
            <X size={18} />
          </IconButton>
        </Head>
        <Body>{children}</Body>
      </Panel>
    </Overlay>
  );
}
