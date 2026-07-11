import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import styled, { css } from "styled-components";

const buttonVariants = cva("button", {
  variants: {
    variant: {
      default: "default",
      outline: "outline",
      ghost: "ghost",
      success: "success",
    },
    size: { sm: "sm", default: "default", lg: "lg" },
  },
  defaultVariants: { variant: "default", size: "default" },
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const StyledButton = styled.button<ButtonProps>`
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
  ${({ size }) =>
    size === "sm"
      ? css`
          padding: 6px 12px;
          min-height: 34px;
          font-size: 0.82rem;
        `
      : size === "lg"
        ? css`
            padding: 13px 18px;
            min-height: 48px;
            @media (max-width: 899px) {
              padding: 10px 14px;
              min-height: 42px;
              font-size: 0.9rem;
            }
          `
        : css`
            padding: 10px 14px;
            min-height: 40px;
            @media (max-width: 899px) {
              padding: 8px 12px;
              min-height: 36px;
            }
          `}
  ${({ theme, variant }) => {
    if (variant === "outline")
      return css`
        background: ${theme.colors.white};
        color: ${theme.colors.navy};
        border-color: ${theme.colors.border};
        &:hover {
          border-color: ${theme.colors.primary};
        }
      `;
    if (variant === "ghost")
      return css`
        background: transparent;
        color: ${theme.colors.navy};
        &:hover {
          background: #eef2ff;
        }
      `;
    if (variant === "success")
      return css`
        background: ${theme.colors.success};
        color: ${theme.colors.white};
        &:hover {
          filter: brightness(0.95);
        }
      `;
    return css`
      background: ${theme.colors.primary};
      color: ${theme.colors.white};
      &:hover {
        transform: translateY(-1px);
        box-shadow: ${theme.shadows.sm};
      }
    `;
  }}
`;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className: _className, variant, size, ...props }, ref) => {
    buttonVariants({ variant, size });
    return <StyledButton ref={ref} variant={variant} size={size} {...props} />;
  },
);
Button.displayName = "Button";
