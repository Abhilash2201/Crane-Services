import styled, { css } from "styled-components";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva("button", {
  variants: {
    variant: {
      default: "default",
      outline: "outline",
      ghost: "ghost",
      success: "success",
      danger: "danger"
    },
    size: {
      sm: "sm",
      default: "default",
      lg: "lg",
      icon: "icon"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

const StyledButton = styled.button<ButtonProps>`
  border-radius: 10px;
  border: 1px solid transparent;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  ${({ size }) => {
    if (size === "sm") return css`padding: 7px 12px; min-height: 34px;`;
    if (size === "lg") return css`padding: 13px 18px; min-height: 46px;`;
    if (size === "icon") return css`width: 38px; height: 38px; padding: 0;`;
    return css`padding: 10px 14px; min-height: 40px;`;
  }}

  ${({ theme, variant }) => {
    if (variant === "outline") {
      return css`
        background: ${theme.colors.white};
        color: ${theme.colors.navy};
        border-color: ${theme.colors.border};

        &:hover {
          border-color: ${theme.colors.primary};
          background: #fff8f3;
        }
      `;
    }

    if (variant === "ghost") {
      return css`
        background: transparent;
        color: ${theme.colors.navy};

        &:hover {
          background: #edf2f7;
        }
      `;
    }

    if (variant === "success") {
      return css`
        background: ${theme.colors.success};
        color: ${theme.colors.white};

        &:hover {
          filter: brightness(0.96);
        }
      `;
    }

    if (variant === "danger") {
      return css`
        background: ${theme.colors.danger};
        color: ${theme.colors.white};

        &:hover {
          filter: brightness(0.96);
        }
      `;
    }

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
  }
);

Button.displayName = "Button";
