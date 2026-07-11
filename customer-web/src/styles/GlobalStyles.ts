import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; font-size: 15px; }
  body {
    margin: 0;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: ${({ theme }) => theme.colors.neutralBg};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.5;
  }
  h1, h2, h3, h4 { line-height: 1.25; margin: 0 0 8px; }
  h1 { font-size: 1.6rem; }
  h2 { font-size: 1.3rem; }
  h3 { font-size: 1.05rem; }
  p  { margin: 0 0 8px; }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }

  @media (max-width: 899px) {
    html { font-size: 14px; }
    h1   { font-size: 1.35rem; }
    h2   { font-size: 1.1rem; }
    h3   { font-size: 0.95rem; }
    p    { font-size: 0.9rem; }
    small { font-size: 0.78rem; }
  }
`;
