import { TabMenu } from "primereact/tabmenu";
import type { MenuItem } from "primereact/menuitem";

export function Tabs({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const model: MenuItem[] = options.map((label) => ({ label }));
  const activeIndex = Math.max(options.indexOf(value), 0);

  return (
    <TabMenu
      model={model}
      activeIndex={activeIndex}
      onTabChange={(e) => onChange(options[e.index])}
    />
  );
}
