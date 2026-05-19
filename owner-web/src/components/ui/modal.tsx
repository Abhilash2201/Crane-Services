import { Dialog } from "primereact/dialog";
import type { ReactNode } from "react";

export function Modal({
  open,
  children,
  onClose,
}: {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Dialog
      visible={open}
      onHide={onClose}
      style={{ width: "min(560px, calc(100vw - 24px))" }}
      dismissableMask
      draggable={false}
      resizable={false}
    >
      {children}
    </Dialog>
  );
}
