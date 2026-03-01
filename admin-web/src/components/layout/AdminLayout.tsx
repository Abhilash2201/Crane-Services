import { Bell, Building2, ChartColumnBig, CircleHelp, ClipboardCheck, CreditCard, LayoutDashboard, Menu, Search, Settings, Truck, Users } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tooltip } from "../ui/tooltip";

const Shell = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  min-height: 100vh;
`;

const Sidebar = styled.aside<{ $collapsed: boolean }>`
  width: ${({ $collapsed }) => ($collapsed ? "84px" : "260px")};
  background: ${({ theme }) => theme.colors.navy};
  color: #fff;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition: width 0.25s ease;
`;

const Brand = styled.div<{ $collapsed: boolean }>`
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 10px;

  strong {
    font-size: 20px;
    letter-spacing: 0.2px;
    display: ${({ $collapsed }) => ($collapsed ? "none" : "inline")};
  }
`;

const NavList = styled.nav`
  display: grid;
  gap: 6px;
`;

const NavItem = styled(NavLink)<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #d9e1ea;
  min-height: 44px;
  border-radius: 10px;
  padding: ${({ $collapsed }) => ($collapsed ? "0" : "0 12px")};
  justify-content: ${({ $collapsed }) => ($collapsed ? "center" : "flex-start")};

  &.active {
    background: rgba(255, 98, 0, 0.14);
    color: #fff;
    border: 1px solid rgba(255, 98, 0, 0.4);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  span {
    display: ${({ $collapsed }) => ($collapsed ? "none" : "inline")};
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
  min-height: 72px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(248, 250, 252, 0.92);
  backdrop-filter: blur(8px);
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 0 18px;
`;

const SearchWrap = styled.div`
  position: relative;
  max-width: 520px;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.muted};
  }

  input {
    padding-left: 36px;
  }
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
  padding: 18px;
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
  { to: "/settings", label: "Settings", icon: Settings }
];

export function AdminLayout({
  collapsed,
  setCollapsed
}: {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}) {
  const location = useLocation();

  return (
    <Shell>
      <Sidebar $collapsed={collapsed}>
        <Brand $collapsed={collapsed}>
          <img alt="CraneHub" src="https://cdn-icons-png.flaticon.com/512/2784/2784487.png" width="34" height="34" />
          <strong>CraneHub</strong>
        </Brand>

        <NavList>
          {navItems.map(({ to, label, icon: Icon }) => (
            <Tooltip key={to} content={collapsed ? label : ""}>
              <NavItem to={to} end={to === "/"} $collapsed={collapsed}>
                <Icon size={18} />
                <span>{label}</span>
              </NavItem>
            </Tooltip>
          ))}
        </NavList>
      </Sidebar>

      <Main>
        <Topbar>
          <Button size="icon" variant="outline" onClick={() => setCollapsed(!collapsed)}>
            <Menu size={18} />
          </Button>

          <SearchWrap>
            <Search size={16} />
            <Input placeholder="Search requests, users, jobs, payouts..." />
          </SearchWrap>

          <Right>
            <Button size="icon" variant="outline" aria-label="notifications">
              <Bell size={17} />
            </Button>
            <Profile>
              <strong>Aarav Sharma</strong>
              <span>Super Admin</span>
            </Profile>
          </Right>
        </Topbar>

        <Body>
          <Outlet key={location.pathname} />
        </Body>
      </Main>
    </Shell>
  );
}
