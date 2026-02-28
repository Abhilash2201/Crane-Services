import { Bell, MapPin, Menu, Search } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const Shell = styled.div`min-height: 100vh;`;
const Header = styled.header`
  position: sticky; top: 0; z-index: 20; background: rgba(248,250,252,0.92);
  backdrop-filter: blur(8px); border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const HeaderInner = styled.div`
  max-width: 1200px; margin: 0 auto; padding: 12px 16px; display: grid; gap: 12px;
  @media (min-width: 900px) { grid-template-columns: auto 1fr auto; align-items: center; }
`;
const Brand = styled(Link)`display: inline-flex; align-items: center; gap: 10px; font-weight: 800; color: ${({ theme }) => theme.colors.navy};`;
const Hook = styled.span`
  width: 28px; height: 28px; border: 4px solid ${({ theme }) => theme.colors.primary}; border-top-color: transparent; border-radius: 0 0 50% 50%; transform: rotate(20deg);
`;
const SearchRow = styled.div`display: grid; grid-template-columns: 1fr; gap: 8px; @media (min-width: 900px) { grid-template-columns: 160px 1fr; }`;
const Nav = styled.nav<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? "flex" : "none")}; flex-wrap: wrap; gap: 8px;
  @media (min-width: 900px) { display: flex; align-items: center; justify-content: flex-end; }
`;
const NavItem = styled(NavLink)`
  padding: 8px 10px; border-radius: 10px; color: ${({ theme }) => theme.colors.muted};
  &.active { color: ${({ theme }) => theme.colors.navy}; background: #e2e8f0; }
`;
const Content = styled.main`max-width: 1200px; margin: 0 auto; padding: 20px 16px 34px;`;

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Shell>
      <Header>
        <HeaderInner>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Brand to="/"><Hook />CraneHub</Brand>
            <Button variant="ghost" size="sm" onClick={() => setOpen((s) => !s)}><Menu size={18} /></Button>
          </div>
          <SearchRow>
            <Button variant="outline"><MapPin size={16} /> Bengaluru</Button>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 10, top: 14, color: "#64748B" }} />
              <Input placeholder="Search crane variant, capacity, owner" style={{ paddingLeft: 32 }} />
            </div>
          </SearchRow>
          <Nav $open={open}>
            <NavItem to="/">How it Works</NavItem>
            <NavItem to="/dashboard">For Owners</NavItem>
            <NavItem to="/new-request">New Request</NavItem>
            <NavItem to="/tracking/REQ-DEL-4432">Live Tracking</NavItem>
            <Link to="/auth"><Button size="sm">Login</Button></Link>
            <Button variant="ghost" size="sm"><Bell size={16} /></Button>
          </Nav>
        </HeaderInner>
      </Header>
      <Content>{children}</Content>
    </Shell>
  );
}
