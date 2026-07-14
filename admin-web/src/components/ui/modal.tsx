import { Dialog } from "primereact/dialog";
import type { ReactNode } from "react";

export function Modal({
  open,
  title,
  children,
  onClose,
  width = 480,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  width?: number;
}) {
  return (
    <Dialog
      visible={open}
      onHide={onClose}
      header={title}
      style={{ width: `min(${width}px, calc(100vw - 24px))` }}
      dismissableMask
      draggable={false}
      resizable={false}
    >
      {children}
    </Dialog>
  );
}
