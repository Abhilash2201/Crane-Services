import { forwardRef, type TextareaHTMLAttributes } from "react";
import styled from "styled-components";

const StyledTextarea = styled.textarea`
  width: 100%; min-height: 96px; border: 1px solid ${({ theme }) => theme.colors.border}; border-radius: 12px; padding: 10px 12px;
  background: ${({ theme }) => theme.colors.white}; font: inherit; resize: vertical;
  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; box-shadow: 0 0 0 3px rgba(255,98,0,.12); }
`;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => <StyledTextarea ref={ref} {...props} />);
Textarea.displayName = "Textarea";
