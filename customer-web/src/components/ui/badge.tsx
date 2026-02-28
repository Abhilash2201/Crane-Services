import styled, { css } from "styled-components";

type BadgeVariant = "default" | "success" | "warning" | "outline";
const StyledBadge = styled.span<{ $variant: BadgeVariant }>`
  display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700;
  ${({ theme, $variant }) => {
    if ($variant === "success") return css`background: #dcfce7; color: #166534;`;
    if ($variant === "warning") return css`background: #fef3c7; color: #92400e;`;
    if ($variant === "outline") return css`border: 1px solid ${theme.colors.border}; color: ${theme.colors.navy};`;
    return css`background: #ffedd5; color: ${theme.colors.primary};`;
  }}
`;

export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return <StyledBadge $variant={variant}>{children}</StyledBadge>;
}
