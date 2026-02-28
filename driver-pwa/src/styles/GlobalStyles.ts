import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: radial-gradient(circle at 10% 10%, #fff0e5 0%, #f8fafc 42%, #e5e7eb 100%);
    color: ${({ theme }) => theme.colors.text};
  }
`;
