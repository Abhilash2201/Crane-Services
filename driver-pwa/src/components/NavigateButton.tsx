import { useNavigate } from "react-router-dom";
import { Action } from "../styles/shared";

type Props = {
  to: string;
  children: React.ReactNode;
};

export function NavigateButton({ to, children }: Props) {
  const navigate = useNavigate();
  return <Action onClick={() => navigate(to)}>{children}</Action>;
}
