import styled from "styled-components";

const Wrap = styled.button<{ $checked: boolean }>`
  width: 44px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid ${({ theme, $checked }) => ($checked ? theme.colors.success : theme.colors.border)};
  background: ${({ $checked }) => ($checked ? "#dcfce7" : "#e2e8f0")};
  padding: 2px;
  cursor: pointer;
  position: relative;
  transition: 0.2s ease;
`;

const Knob = styled.span<{ $checked: boolean }>`
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${({ theme, $checked }) => ($checked ? theme.colors.success : theme.colors.white)};
  transform: translateX(${({ $checked }) => ($checked ? "19px" : "0")});
  transition: 0.2s ease;
`;

export function Switch({
  checked,
  onCheckedChange,
  ariaLabel
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <Wrap
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      $checked={checked}
      onClick={() => onCheckedChange(!checked)}
    >
      <Knob $checked={checked} />
    </Wrap>
  );
}
