import type { HTMLAttributes } from "react";
import styled from "styled-components";

const Root = styled.div`${({ theme }) => theme.mixins.card};`;
const Header = styled.div`padding: 16px 18px; border-bottom: 1px solid ${({ theme }) => theme.colors.border};`;
const Title = styled.h3`margin: 0; font-size: 1rem; font-weight: 700; color: ${({ theme }) => theme.colors.navy};`;
const Content = styled.div`padding: 16px 18px;`;

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  return <Root {...props} />;
}

export function CardHeader(props: HTMLAttributes<HTMLDivElement>) {
  return <Header {...props} />;
}

export function CardTitle(props: HTMLAttributes<HTMLHeadingElement>) {
  return <Title {...props} />;
}

export function CardContent(props: HTMLAttributes<HTMLDivElement>) {
  return <Content {...props} />;
}
