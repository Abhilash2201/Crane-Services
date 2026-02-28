import { forwardRef, type InputHTMLAttributes } from "react";
import styled from "styled-components";

const StyledInput = styled.input`
  width: 100%; min-height: 44px; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 12px; padding: 0 12px;
  background: ${({ theme }) => theme.colors.white}; font: inherit;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; box-shadow: 0 0 0 3px rgba(255,98,0,.12); }
`;

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => <StyledInput ref={ref} {...props} />);
Input.displayName = "Input";
