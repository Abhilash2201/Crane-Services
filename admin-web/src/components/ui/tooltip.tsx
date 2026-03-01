import { type ReactNode } from "react";
import styled from "styled-components";

const Wrap = styled.span`
  position: relative;
  display: inline-flex;

  &:hover > span {
    opacity: 1;
    transform: translate(-50%, -4px);
  }
`;

const Bubble = styled.span`
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translate(-50%, 0);
  background: #0f172a;
  color: #fff;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: 0.15s ease;
  z-index: 20;
`;

export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  return (
    <Wrap>
      {children}
      <Bubble>{content}</Bubble>
    </Wrap>
  );
}
