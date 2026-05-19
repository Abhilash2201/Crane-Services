import { Tag } from "primereact/tag";
import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "outline";

export function Badge({
  children,
  variant = "default",
  style,
  className,
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant; children?: React.ReactNode }) {
  if (variant === "outline") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          border: "1px solid #e2e8f0",
          color: "#0A2540",
          borderRadius: "999px",
          padding: "4px 10px",
          fontSize: "12px",
          fontWeight: 700,
          ...style,
        }}
        className={className}
      >
        {children}
      </span>
    );
  }

  if (variant === "default") {
    return (
      <Tag
        value={typeof children === "string" ? children : undefined}
        style={{ background: "#ffedd5", color: "#FF6200", borderRadius: "999px", ...style }}
        className={className}
      >
        {typeof children !== "string" ? children : null}
      </Tag>
    );
  }

  const severityMap = { success: "success", warning: "warning", danger: "danger" } as const;

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
