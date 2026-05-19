import { InputSwitch } from "primereact/inputswitch";

export function Switch({
  checked,
  onCheckedChange,
  ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <InputSwitch
      checked={checked}
      onChange={(e) => onCheckedChange(e.value)}
      aria-label={ariaLabel}
    />
  );
}
