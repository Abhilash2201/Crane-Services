import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  * { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: ${({ theme }) => theme.colors.neutralBg};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.4;
  }

  #root {
    min-height: 100vh;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }
`;
