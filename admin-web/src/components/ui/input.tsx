import type { InputHTMLAttributes } from "react";
import styled from "styled-components";

const StyledInput = styled.input`
  width: 100%;
  min-height: 40px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0 12px;
  font-size: 14px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: 2px solid rgba(255, 98, 0, 0.15);
  }
`;

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <StyledInput {...props} />;
}
