import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: ${({ theme }) => theme.colors.neutralBg};
    color: ${({ theme }) => theme.colors.text};
  }
  a { color: inherit; text-decoration: none; }
  img { max-width: 100%; display: block; }
`;
