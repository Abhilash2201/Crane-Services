import { css } from "styled-components";

export const theme = {
  colors: {
    primary: "#FF6200",
    navy: "#0A2540",
    success: "#22C55E",
    danger: "#EF4444",
    neutralBg: "#F8FAFC",
    text: "#0F172A",
    muted: "#64748B",
    white: "#FFFFFF",
    border: "#E2E8F0",
    warning: "#F59E0B"
  },
  shadows: {
    sm: "0 2px 10px rgba(10, 37, 64, 0.08)",
    md: "0 12px 30px rgba(10, 37, 64, 0.12)",
    lg: "0 20px 40px rgba(10, 37, 64, 0.15)"
  },
  mixins: {
    card: css`
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      box-shadow: 0 2px 10px rgba(10, 37, 64, 0.08);
    `
  }
};
