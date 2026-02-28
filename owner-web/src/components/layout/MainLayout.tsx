import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ChartColumnBig,
  ChevronsLeftRightEllipsis,
  CircleUserRound,
  ClipboardList,
  Truck,
  Users
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../ui/button";

const Shell = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: auto 1fr;
  background: ${({ theme }) => theme.colors.neutralBg};
`;

const Sidebar = styled.aside<{ $collapsed: boolean }>`
  width: ${({ $collapsed }) => ($collapsed ? "86px" : "252px")};
  transition: width 0.2s ease;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.navy};
  color: #dbeafe;
  padding: 14px 10px;
  position: sticky;
  top: 0;
  height: 100vh;
`;

const Brand = styled(Link)<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  font-weight: 800;
  color: #ffffff;
  justify-content: ${({ $collapsed }) => ($collapsed ? "center" : "flex-start")};
`;

const Hook = styled.span`
  width: 24px;
  height: 24px;
  border: 4px solid #ff6200;
  border-top-color: transparent;
  border-radius: 0 0 50% 50%;
  transform: rotate(20deg);
`;

const SideItem = styled(NavLink)<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  margin-bottom: 6px;
  border-radius: 10px;
  color: #cbd5e1;
  padding: 0 ${({ $collapsed }) => ($collapsed ? "10px" : "12px")};
  justify-content: ${({ $collapsed }) => ($collapsed ? "center" : "flex-start")};
  &.active {
    background: rgba(255, 98, 0, 0.16);
    color: #ffffff;
  }
`;

const Main = styled.div`
  min-width: 0;
`;

const Header = styled.header`
  height: 70px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TopLeft = styled.div`
  display: grid;
`;

const ProfileWrap = styled.div`
  position: relative;
`;

const Drop = styled.div`
  position: absolute;
  top: 48px;
  right: 0;
  width: 200px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 8px;
  display: grid;
  gap: 6px;
`;

const DropItem = styled.button`
  border: 0;
  min-height: 36px;
  text-align: left;
  padding: 0 10px;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  &:hover {
    background: #f1f5f9;
  }
`;

const Content = styled.main`
  padding: 18px 16px 28px;
`;

const links = [
  { to: "/dashboard", label: "Overview", icon: BriefcaseBusiness },
  { to: "/live-requests", label: "Live Requests", icon: ClipboardList },
  { to: "/fleet", label: "My Fleet", icon: Truck },
  { to: "/active-jobs", label: "Active Jobs", icon: Building2 },
  { to: "/drivers", label: "Drivers", icon: Users },
  { to: "/reports", label: "Earnings", icon: ChartColumnBig }
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <Shell>
      <Sidebar $collapsed={collapsed}>
        <Brand to="/dashboard" $collapsed={collapsed}>
          <Hook />
          {!collapsed ? "CraneHub Owner" : null}
        </Brand>

        {links.map((link) => {
          const Icon = link.icon;
          return (
            <SideItem key={link.to} to={link.to} $collapsed={collapsed}>
              <Icon size={17} />
              {!collapsed ? link.label : null}
            </SideItem>
          );
        })}

        <div style={{ marginTop: 10 }}>
          <Button
            variant="outline"
            size="sm"
            style={{ width: "100%" }}
            onClick={() => setCollapsed((s) => !s)}
          >
            <ChevronsLeftRightEllipsis size={16} />
            {!collapsed ? "Collapse" : null}
          </Button>
        </div>
      </Sidebar>

      <Main>
        <Header>
          <TopLeft>
            <strong style={{ color: "#0A2540" }}>Rajesh Crane Services Pvt Ltd</strong>
            <small style={{ color: "#64748B" }}>Owner Console | Bengaluru Region</small>
          </TopLeft>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Button variant="ghost" size="sm">
              <Bell size={16} />
            </Button>
            <ProfileWrap>
              <Button variant="outline" size="sm" onClick={() => setProfileOpen((s) => !s)}>
                <CircleUserRound size={16} /> Rajesh N
              </Button>
              {profileOpen ? (
                <Drop>
                  <DropItem>Company Profile</DropItem>
                  <DropItem>Billing Settings</DropItem>
                  <DropItem>Logout</DropItem>
                </Drop>
              ) : null}
            </ProfileWrap>
          </div>
        </Header>
        <Content>{children}</Content>
      </Main>
    </Shell>
  );
}
