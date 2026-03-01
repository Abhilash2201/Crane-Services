import type { TextareaHTMLAttributes } from "react";
import styled from "styled-components";

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 10px 12px;
  resize: vertical;
  font-size: 14px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: 2px solid rgba(255, 98, 0, 0.15);
  }
`;

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <StyledTextarea {...props} />;
}
