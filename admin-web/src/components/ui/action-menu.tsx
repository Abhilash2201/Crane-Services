import { MoreVertical } from "lucide-react";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import { useRef } from "react";

export function ActionMenu({ items }: { items: MenuItem[] }) {
  const menuRef = useRef<Menu>(null);

  return (
    <>
      <button
        type="button"
        className="table-action-btn"
        aria-label="More actions"
        onClick={(e) => menuRef.current?.toggle(e)}
      >
        <MoreVertical size={14} />
      </button>
      <Menu model={items} popup ref={menuRef} popupAlignment="right" />
    </>
  );
}
