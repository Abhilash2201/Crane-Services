import { BellRing, Home, MapPinned, UserRound, Wallet } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { BottomNav, FloatingBtn, NavItem } from "../styles/nav";

type Props = {
  active: "home" | "jobs" | "map" | "profile";
  children: React.ReactNode;
};

export function ScreenWithNav({ active, children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const links = {
    home: "/home",
    jobs: "/jobs",
    map: "/map",
    profile: "/profile",
  };

  return (
    <>
      {children}
      <BottomNav>
        <NavItem
          $active={active === "home"}
          onClick={() => navigate(links.home)}
        >
          <Home size={18} />
          Home
        </NavItem>
        <NavItem
          $active={active === "jobs"}
          onClick={() => navigate(links.jobs)}
        >
          <Wallet size={18} />
          Jobs
        </NavItem>
        <NavItem $active={active === "map"} onClick={() => navigate(links.map)}>
          <MapPinned size={18} />
          Map
        </NavItem>
        <NavItem
          $active={active === "profile"}
          onClick={() => navigate(links.profile)}
        >
          <UserRound size={18} />
          Profile
        </NavItem>
      </BottomNav>
      {location.pathname === "/home" ? (
        <FloatingBtn onClick={() => navigate("/job-alert")}>
          <BellRing size={15} />
        </FloatingBtn>
      ) : null}
    </>
  );
}
