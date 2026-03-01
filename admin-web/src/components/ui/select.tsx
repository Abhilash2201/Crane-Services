import type { SelectHTMLAttributes } from "react";
import styled from "styled-components";

const StyledSelect = styled.select`
  width: 100%;
  min-height: 40px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0 10px;
  background: #fff;
  font-size: 14px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: 2px solid rgba(255, 98, 0, 0.15);
  }
`;

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <StyledSelect {...props} />;
}
