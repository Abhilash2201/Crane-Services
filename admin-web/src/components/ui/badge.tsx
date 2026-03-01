import type { HTMLAttributes } from "react";
import styled, { css } from "styled-components";

type Variant = "default" | "success" | "danger" | "warning" | "info";

const pillStyles = {
  default: css`background: #eef2f7; color: #334155;`,
  success: css`background: #e8fbe9; color: #15803d;`,
  danger: css`background: #fee2e2; color: #b91c1c;`,
  warning: css`background: #fef3c7; color: #b45309;`,
  info: css`background: #e0f2fe; color: #0c4a6e;`
};

const StyledBadge = styled.span<{ $variant: Variant }>`
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  ${({ $variant }) => pillStyles[$variant]}
`;

export function Badge({ variant = "default", ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return <StyledBadge $variant={variant} {...props} />;
}
