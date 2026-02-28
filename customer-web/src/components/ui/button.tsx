import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import styled, { css } from "styled-components";

const buttonVariants = cva("button", {
  variants: {
    variant: { default: "default", outline: "outline", ghost: "ghost", success: "success" },
    size: { sm: "sm", default: "default", lg: "lg" }
  },
  defaultVariants: { variant: "default", size: "default" }
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

const StyledButton = styled.button<ButtonProps>`
  border-radius: 12px; border: 1px solid transparent; font-weight: 600; cursor: pointer; transition: 0.2s;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  ${({ size }) => size === "sm" ? css`padding: 8px 12px; min-height: 36px;` : size === "lg" ? css`padding: 14px 18px; min-height: 50px;` : css`padding: 11px 14px; min-height: 42px;`}
  ${({ theme, variant }) => {
    if (variant === "outline") return css`background: ${theme.colors.white}; color: ${theme.colors.navy}; border-color: ${theme.colors.border}; &:hover { border-color: ${theme.colors.primary}; }`;
    if (variant === "ghost") return css`background: transparent; color: ${theme.colors.navy}; &:hover { background: #eef2ff; }`;
    if (variant === "success") return css`background: ${theme.colors.success}; color: ${theme.colors.white}; &:hover { filter: brightness(0.95); }`;
    return css`background: ${theme.colors.primary}; color: ${theme.colors.white}; &:hover { transform: translateY(-1px); box-shadow: ${theme.shadows.sm}; }`;
  }}
`;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className: _className, variant, size, ...props }, ref) => {
  buttonVariants({ variant, size });
  return <StyledButton ref={ref} variant={variant} size={size} {...props} />;
});
Button.displayName = "Button";
