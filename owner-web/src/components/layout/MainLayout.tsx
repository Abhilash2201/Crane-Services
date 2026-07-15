import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ChartColumnBig,
  ClipboardList,
  Truck,
  Users,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { Spinner } from "../ui/spinner";
import { api, authStore } from "../../lib/api";

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

const Hook = styled.span`
  width: 28px;
  height: 28px;
  border: 4px solid #ff6200;
  border-top-color: transparent;
  border-radius: 0 0 50% 50%;
  transform: rotate(20deg);
  flex-shrink: 0;
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
  cursor: default;
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
  { to: "/dashboard",    label: "Overview",       icon: BriefcaseBusiness },
  { to: "/live-requests", label: "Live Requests",  icon: ClipboardList },
  { to: "/fleet",        label: "My Fleet",        icon: Truck },
  { to: "/dispatch",     label: "Dispatch Board",  icon: Building2 },
  { to: "/active-jobs",  label: "Active Jobs",     icon: Workflow },
  { to: "/drivers",      label: "Drivers",         icon: Users },
  { to: "/reports",      label: "Earnings",        icon: ChartColumnBig },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const auth = authStore.read();
  const userName = auth?.user?.name || auth?.user?.email || "Owner";

  const activePage = navItems.find(({ to }) =>
    location.pathname === to || location.pathname.startsWith(to + "/"),
  );

  const handleLogout = async () => {
    setLoggingOut(true);
    const stored = authStore.read();
    try {
      if (stored?.refreshToken) {
        await api.post("/auth/logout", { refreshToken: stored.refreshToken });
      }
    } catch {
      // ignore
    } finally {
      authStore.write(null);
      navigate("/auth", { replace: true });
    }
  };

  return (
    <Shell>
      <Sidebar>
        <Brand>
          <Hook />
          <strong>CraneHub</strong>
        </Brand>

        <NavList>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavItem key={to} to={to}>
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
            <Profile>
              <strong>{userName}</strong>
              <span>owner</span>
            </Profile>
            <Button size="sm" variant="outline" onClick={() => setConfirmLogout(true)}>
              Logout
            </Button>
          </Right>
        </Topbar>

        <Body>{children}</Body>
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
            <Button variant="outline" onClick={() => setConfirmLogout(false)} disabled={loggingOut}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleLogout}
              disabled={loggingOut}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              {loggingOut ? <><Spinner size={14} /> Logging out…</> : "Logout"}
            </Button>
          </div>
        </div>
      </Modal>
    </Shell>
  );
}
