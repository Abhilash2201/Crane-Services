import { Dialog } from "primereact/dialog";
import type { ReactNode } from "react";

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Dialog
      visible={open}
      onHide={onClose}
      header={title}
      style={{ width: "min(840px, calc(100vw - 24px))" }}
      dismissableMask
      draggable={false}
      resizable={false}
    >
      {children}
    </Dialog>
  );
}
