import { css } from "styled-components";

export const theme = {
  colors: {
    primary: "#FF6200",
    navy: "#0A2540",
    success: "#22C55E",
    neutralBg: "#F8FAFC",
    danger: "#EF4444",
    text: "#0F172A",
    muted: "#64748B",
    border: "#E2E8F0",
    white: "#FFFFFF"
  },
  shadows: {
    sm: "0 3px 12px rgba(10, 37, 64, 0.12)",
    md: "0 14px 28px rgba(10, 37, 64, 0.16)"
  },
  mixins: {
    card: css`
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      box-shadow: 0 3px 12px rgba(10, 37, 64, 0.12);
    `
  }
};
