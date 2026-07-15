import { Button as PrButton } from "primereact/button";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva("", {
  variants: {
    variant: {
      default: "default",
      outline: "outline",
      ghost: "ghost",
      success: "success",
      danger: "danger",
    },
    size: {
      sm: "sm",
      default: "default",
      lg: "lg",
      icon: "icon",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { children?: ReactNode };

export function Button({
  variant = "default",
  size,
  children,
  disabled,
  onClick,
  type = "button",
  style,
  className,
}: ButtonProps) {
  const outlined = variant === "outline";
  const text = variant === "ghost";
  const severity = variant === "success" ? "success" : variant === "danger" ? "danger" : undefined;
  const prSize = size === "sm" ? "small" : size === "lg" ? "large" : undefined;
  const iconStyle = size === "icon" ? { width: 40, height: 40, padding: 0, ...style } : style;
  const label = typeof children === "string" ? children : undefined;

  return (
    <PrButton
      label={label}
      outlined={outlined}
      text={text}
      severity={severity as "success" | "danger" | undefined}
      size={prSize}
      disabled={disabled}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      type={(type ?? "button") as "button" | "submit" | "reset"}
      style={iconStyle}
      className={className}
    >
      {label === undefined ? children : null}
    </PrButton>
  );
}
