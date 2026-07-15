import { Tag } from "primereact/tag";
import type { HTMLAttributes } from "react";

type Variant = "default" | "success" | "danger" | "warning" | "info" | "teal";

const severityMap: Record<
  Exclude<Variant, "default" | "teal">,
  "success" | "info" | "warning" | "danger"
> = {
  success: "success",
  danger: "danger",
  warning: "warning",
  info: "info",
};

const defaultStyle = {
  background: "#eef2f7",
  color: "#334155",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
  padding: "4px 10px",
} as const;

const tealStyle = {
  background: "#CCFBF1",
  color: "#0D9488",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
  padding: "4px 10px",
} as const;

export function Badge({
  variant = "default",
  children,
  style,
  className,
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  if (variant === "teal") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", ...tealStyle, ...style }} className={className}>
        {children}
      </span>
    );
  }

  if (variant === "default") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", ...defaultStyle, ...style }} className={className}>
        {children}
      </span>
    );
  }

  return (
    <Tag
      severity={severityMap[variant]}
      value={typeof children === "string" ? children : undefined}
      style={{ borderRadius: "999px", ...style }}
      className={className}
    >
      {typeof children !== "string" ? children : null}
    </Tag>
  );
}
