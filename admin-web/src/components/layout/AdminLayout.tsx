import {
  Bell,
  Building2,
  ChartColumnBig,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  Settings,
  Truck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { authStore } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

const Shell = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: 100vh;
`;

const Sidebar = styled.aside`
  width: 200px;
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
`;

const Brand = styled.div`
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 10px;

  strong {
    font-size: 18px;
    letter-spacing: 0.2px;
  }
`;

const NavList = styled.nav`
  display: grid;
  gap: 6px;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #d9e1ea;
  min-height: 42px;
  border-radius: 10px;
  padding: 0 12px;

  &.active {
    background: rgba(255, 98, 0, 0.14);
    color: #fff;
    border: 1px solid rgba(255, 98, 0, 0.4);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  span {
    font-size: 13px;
    font-weight: 600;
  }
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Topbar = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  min-height: 56px;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 0 24px;
`;

const PageTitle = styled.strong`
  font-size: 17px;
  color: ${({ theme }) => theme.colors.navy};
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Profile = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  min-height: 40px;
  border-radius: 10px;
  padding: 0 12px;
  cursor: pointer;
  text-align: left;

  strong {
    display: block;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.navy};
  }

  span {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const Body = styled.div`
  padding: 14px 18px;
  background: ${({ theme }) => theme.colors.neutralBg};
  flex: 1;
`;

const navItems = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/users", label: "Manage Users", icon: Users },
  { to: "/approvals", label: "Approvals", icon: ClipboardCheck },
  { to: "/variants", label: "Crane Variants", icon: Truck },
  { to: "/requests", label: "Service Requests", icon: Building2 },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/disputes", label: "Disputes", icon: CircleHelp },
  { to: "/analytics", label: "Analytics", icon: ChartColumnBig },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AdminLayout() {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const userName = auth?.user?.name || "Admin";
  const userRole = auth?.user?.role || "admin";
  const activePage = navItems.find(({ to }) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to),
  );

  return (
    <Shell>
      <Sidebar>
        <Brand>
          <img
            alt="CraneHub"
            src="https://cdn-icons-png.flaticon.com/512/2784/2784487.png"
            width="32"
            height="32"
          />
          <strong>CraneHub</strong>
        </Brand>

        <NavList>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavItem key={to} to={to} end={to === "/"}>
              <Icon size={17} />
              <span>{label}</span>
            </NavItem>
          ))}
        </NavList>
      </Sidebar>

      <Main>
        <Topbar>
          <PageTitle>{activePage?.label || "CraneHub"}</PageTitle>

          <Right>
            <Button size="icon" variant="outline" aria-label="notifications">
              <Bell size={17} />
            </Button>
            <Profile onClick={() => navigate("/settings")}>
              <strong>{userName}</strong>
              <span>{userRole}</span>
            </Profile>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmLogout(true)}
            >
              Logout
            </Button>
          </Right>
        </Topbar>

        <Body>
          <Outlet key={location.pathname} />
        </Body>
      </Main>

      <Modal
        open={confirmLogout}
        title="Log out"
        onClose={() => setConfirmLogout(false)}
        width={380}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <span>Are you sure you want to log out?</span>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button variant="outline" onClick={() => setConfirmLogout(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                authStore.write(null);
                navigate("/login");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </Modal>
    </Shell>
  );
}
