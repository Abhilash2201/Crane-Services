import { Tag } from "primereact/tag";
import type { HTMLAttributes } from "react";

type Variant = "default" | "success" | "danger" | "warning" | "info";

const severityMap: Record<
  Exclude<Variant, "default">,
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

export function Badge({
  variant = "default",
  children,
  style,
  className,
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
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
