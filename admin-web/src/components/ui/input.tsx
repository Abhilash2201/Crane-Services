import { InputText } from "primereact/inputtext";
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => (
    <InputText
      ref={ref as React.Ref<HTMLInputElement>}
      {...(props as React.ComponentProps<typeof InputText>)}
    />
  ),
);
Input.displayName = "Input";
