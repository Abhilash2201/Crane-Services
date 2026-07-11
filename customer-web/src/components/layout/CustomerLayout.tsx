import { Bell, ChevronDown, ClipboardList, Home, LogOut, MapPin, Navigation, Plus, Search, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-hot-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { api } from "../../lib/api";

const Shell = styled.div`
  min-height: 100vh;
`;
const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: #0A2540;
  box-shadow: 0 2px 12px rgba(10, 37, 64, 0.25);
`;
const HeaderInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 16px;
  display: grid;
  gap: 12px;
  @media (min-width: 900px) {
    grid-template-columns: auto 1fr auto;
    align-items: center;
  }
`;
const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  color: #fff;
`;
const Hook = styled.span`
  width: 28px;
  height: 28px;
  border: 4px solid ${({ theme }) => theme.colors.primary};
  border-top-color: transparent;
  border-radius: 0 0 50% 50%;
  transform: rotate(20deg);
`;
const SearchRow = styled.div`
  display: none;
  @media (min-width: 900px) {
    display: flex;
    align-items: center;
    position: relative;
  }
`;
const LocationPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 999px;
  padding: 6px 12px 6px 10px;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background 0.15s;
  &:hover {
    background: rgba(255, 255, 255, 0.18);
  }
`;
const LocationDrop = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  min-width: 320px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 12px 36px rgba(10, 37, 64, 0.18);
  padding: 14px;
  display: grid;
  gap: 10px;
  z-index: 60;
`;
const Nav = styled.nav`
  display: none;
  flex-wrap: wrap;
  gap: 8px;
  @media (min-width: 900px) {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
`;
const NavItem = styled(NavLink)`
  padding: 8px 10px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  transition: color 0.15s;
  &:hover {
    color: #fff;
  }
  &.active {
    color: #fff;
    background: rgba(255, 255, 255, 0.12);
  }
`;
const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px 34px;
  @media (max-width: 899px) {
    padding-bottom: 80px;
  }
`;
const ProfileWrap = styled.div`
  position: relative;
`;
const ProfileButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 999px;
  padding: 4px 10px 4px 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: rgba(255, 255, 255, 0.18);
  }
`;
const Avatar = styled.span`
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #FF6200;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
`;
const ProfileMenu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  min-width: 180px;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  padding: 6px;
  display: grid;
  gap: 4px;
  z-index: 50;
`;
const ProfileItem = styled(Link)`
  padding: 8px 10px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.navy};
  font-size: 0.9rem;
  &:hover {
    background: #f1f5f9;
  }
`;
const MobileRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  @media (min-width: 900px) {
    display: none;
  }
`;
const BottomBar = styled.nav`
  display: none;
  @media (max-width: 899px) {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    background: #fff;
    box-shadow: 0 -4px 20px rgba(10, 37, 64, 0.12);
    padding: 0 8px;
    padding-bottom: env(safe-area-inset-bottom);
    align-items: stretch;
  }
`;
const BotItem = styled(NavLink)<{ $primary?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 600;
  text-decoration: none;
  padding: 8px 0;
  color: ${({ $primary }) => ($primary ? "#fff" : "#94a3b8")};
  background: ${({ $primary }) => ($primary ? "#FF6200" : "transparent")};
  border-radius: ${({ $primary }) => ($primary ? "12px" : "0")};
  margin: ${({ $primary }) => ($primary ? "6px 4px" : "0")};
  transition: color 0.15s;
  &.active {
    color: ${({ $primary }) => ($primary ? "#fff" : "#FF6200")};
  }
`;
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;
const ModalCard = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 28px 24px 24px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.18);
  display: grid;
  gap: 20px;
`;
const ModalActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const routeLocation = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [authPayload, setAuthPayload] = useState<{
    refreshToken?: string;
    user?: { name?: string; email?: string };
  } | null>(null);
  const [location, setLocation] = useState<{
    address?: string;
    latitude?: number;
    longitude?: number;
  } | null>(null);
  const [locationInput, setLocationInput] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationDropOpen, setLocationDropOpen] = useState(false);

  const isAuthenticated = useMemo(
    () => Boolean(authPayload?.refreshToken),
    [authPayload],
  );

  const shortLocation = useMemo(() => {
    if (!location?.address) return null;
    const parts = location.address.split(",").map((s) => s.trim()).filter(Boolean);
    return parts[2] || parts[1] || parts[0] || null;
  }, [location?.address]);
  const displayName =
    authPayload?.user?.name ||
    authPayload?.user?.email ||
    "Account";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  useEffect(() => {
    const loadAuth = () => {
      try {
        const raw = localStorage.getItem("auth");
        setAuthPayload(raw ? JSON.parse(raw) : null);
      } catch {
        setAuthPayload(null);
      }
    };

    loadAuth();
    window.addEventListener("auth-changed", loadAuth);
    return () => window.removeEventListener("auth-changed", loadAuth);
  }, []);

  useEffect(() => {
    if (!locationDropOpen) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-location-drop]")) setLocationDropOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [locationDropOpen]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .get("/auth/me")
      .then((res) => {
        const data = res.data?.data;
        if (data?.location_address) {
          const next = {
            address: data.location_address,
            latitude: data.location_lat,
            longitude: data.location_lng,
          };
          setLocation(next);
          setLocationInput(data.location_address || "");
        }
      })
      .catch(() => {
        // Ignore for header display.
      });
  }, [isAuthenticated]);

  const handleLogout = async () => {
    if (!authPayload?.refreshToken) {
      localStorage.removeItem("auth");
      setAuthPayload(null);
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/");
      return;
    }
    try {
      await api.post("/auth/logout", {
        refreshToken: authPayload.refreshToken,
      });
    } catch {
      // Ignore logout errors and clear local session anyway.
    } finally {
      localStorage.removeItem("auth");
      setAuthPayload(null);
      window.dispatchEvent(new Event("auth-changed"));
      toast.success("Logged out.");
      navigate("/");
    }
  };

  const saveLocation = async (next: {
    address: string;
    latitude: number;
    longitude: number;
  }) => {
    setLocation(next);
    setLocationInput(next.address);
    if (!isAuthenticated) {
      toast.error("Login to save location.");
      return;
    }
    try {
      await api.put("/auth/location", next);
      toast.success("Location saved.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to save location. Please try again.",
      );
    }
  };

  const ensureMapsLoaded = async () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
      | string
      | undefined;
    if (!apiKey) throw new Error("Maps API key missing");
    if ((window as any).google?.maps?.Geocoder) return;

    const scriptId = "google-maps-geocoder";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      await new Promise<void>((resolve, reject) => {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Maps failed to load")), {
          once: true,
        });
      });
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", () => resolve());
      script.addEventListener("error", () => reject(new Error("Maps failed to load")));
      document.head.appendChild(script);
    });
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    await ensureMapsLoaded();
    const geocoder = new (window as any).google.maps.Geocoder();
    const results = await new Promise<any[]>((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (res: any, status: string) => {
        if (status !== "OK" || !res?.length) {
          reject(new Error("Unable to resolve address"));
          return;
        }
        resolve(res);
      });
    });
    return results[0].formatted_address as string;
  };

  const forwardGeocode = async (address: string) => {
    await ensureMapsLoaded();
    const geocoder = new (window as any).google.maps.Geocoder();
    const results = await new Promise<any[]>((resolve, reject) => {
      geocoder.geocode({ address }, (res: any, status: string) => {
        if (status !== "OK" || !res?.length) {
          reject(new Error("Address not found"));
          return;
        }
        resolve(res);
      });
    });
    const result = results[0];
    const location = result.geometry?.location;
    if (!location) throw new Error("Address not found");
    return {
      address: result.formatted_address as string,
      latitude: Number(location.lat()),
      longitude: Number(location.lng()),
    };
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const address = await reverseGeocode(lat, lng);
          await saveLocation({ address, latitude: lat, longitude: lng });
        } catch (error: any) {
          toast.error(error?.message || "Unable to get address.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        toast.error("Location permission denied.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleHowItWorks = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const scroll = () =>
      document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
    if (routeLocation.pathname === "/") {
      scroll();
    } else {
      navigate("/");
      setTimeout(scroll, 120);
    }
  };

  const handleAddressSave = async () => {
    const trimmed = locationInput.trim();
    if (trimmed.length < 3) {
      toast.error("Enter a valid address or pincode.");
      return;
    }
    try {
      const resolved = await forwardGeocode(trimmed);
      await saveLocation(resolved);
    } catch (error: any) {
      toast.error(error?.message || "Unable to find address.");
    }
  };

  return (
    <Shell>
      <Header>
        <HeaderInner>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Brand to="/">
              <Hook />
              CraneHub
            </Brand>
            <MobileRight>
              {isAuthenticated ? (
                <ProfileWrap>
                  <ProfileButton
                    onClick={() => setProfileOpen((prev) => !prev)}
                    aria-label="Open profile menu"
                  >
                    <Avatar>{initials || <User size={14} />}</Avatar>
                    <ChevronDown size={14} />
                  </ProfileButton>
                  {profileOpen ? (
                    <ProfileMenu>
                      <ProfileItem to="/profile">Profile</ProfileItem>
                      <button
                        onClick={() => { setProfileOpen(false); setShowLogoutConfirm(true); }}
                        style={{ textAlign: "left", padding: "8px 10px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", color: "#dc2626", fontSize: "0.9rem" }}
                      >
                        Logout
                      </button>
                    </ProfileMenu>
                  ) : null}
                </ProfileWrap>
              ) : (
                <Link to="/auth?mode=login">
                  <Button size="sm">Login</Button>
                </Link>
              )}
            </MobileRight>
          </div>
          <SearchRow data-location-drop>
            <LocationPill onClick={() => setLocationDropOpen((p) => !p)}>
              <MapPin size={13} />
              {locating ? "Locating..." : shortLocation ?? "Set location"}
              <ChevronDown size={12} style={{ opacity: 0.7, flexShrink: 0 }} />
            </LocationPill>
            {locationDropOpen && (
              <LocationDrop>
                {location?.address && (
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-start", color: "#64748B", fontSize: "0.82rem", lineHeight: 1.4 }}>
                    <MapPin size={13} style={{ marginTop: 2, flexShrink: 0, color: "#FF6200" }} />
                    {location.address}
                  </div>
                )}
                <div style={{ position: "relative" }}>
                  <Search size={14} style={{ position: "absolute", left: 10, top: 12, color: "#94a3b8" }} />
                  <Input
                    placeholder="Enter address or pincode"
                    style={{ paddingLeft: 30 }}
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleAddressSave(); setLocationDropOpen(false); }
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="outline" size="sm" style={{ flex: 1 }} onClick={handleUseMyLocation} disabled={locating}>
                    <MapPin size={13} /> {locating ? "Locating..." : "Use my location"}
                  </Button>
                  <Button size="sm" onClick={() => { handleAddressSave(); setLocationDropOpen(false); }} disabled={locating}>
                    Save
                  </Button>
                </div>
              </LocationDrop>
            )}
          </SearchRow>
          <Nav>
            <NavItem to="/#how-it-works" onClick={handleHowItWorks}>How it Works</NavItem>
            {isAuthenticated ? (
              <NavItem to="/dashboard">My Requests</NavItem>
            ) : null}
            <NavItem to="/new-request">New Request</NavItem>
            {isAuthenticated ? (
              <NavItem to="/tracking/latest">Live Tracking</NavItem>
            ) : null}
            {isAuthenticated ? (
              <ProfileWrap>
                <ProfileButton
                  onClick={() => setProfileOpen((prev) => !prev)}
                  aria-label="Open profile menu"
                >
                  <Avatar>{initials || <User size={14} />}</Avatar>
                  <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {displayName}
                  </span>
                  <ChevronDown size={14} />
                </ProfileButton>
                {profileOpen ? (
                  <ProfileMenu>
                    <ProfileItem to="/profile">Profile</ProfileItem>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "#dc2626",
                        fontSize: "0.9rem",
                      }}
                    >
                      Logout
                    </button>
                  </ProfileMenu>
                ) : null}
              </ProfileWrap>
            ) : (
              <>
                <Link to="/auth?mode=signup">
                  <Button variant="outline" size="sm">
                    Sign Up
                  </Button>
                </Link>
                <Link to="/auth?mode=login">
                  <Button size="sm">Login</Button>
                </Link>
              </>
            )}
            <Button variant="ghost" size="sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              <Bell size={16} />
            </Button>
          </Nav>
        </HeaderInner>
      </Header>
      <Content>{children}</Content>

      {showLogoutConfirm && (
        <Overlay onClick={() => setShowLogoutConfirm(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#FFF1F2", display: "grid", placeItems: "center" }}>
                <LogOut size={22} color="#DC2626" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>Logout?</div>
                <div style={{ color: "#64748B", fontSize: "0.9rem", marginTop: 4 }}>
                  You'll be signed out and returned to the home page.
                </div>
              </div>
            </div>
            <ModalActions>
              <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => { setShowLogoutConfirm(false); handleLogout(); }}
                style={{ background: "#DC2626", borderColor: "#DC2626" }}
              >
                Logout
              </Button>
            </ModalActions>
          </ModalCard>
        </Overlay>
      )}

      <BottomBar>
        <BotItem to="/" end>
          <Home size={20} />
          Home
        </BotItem>
        <BotItem to="/new-request" $primary>
          <Plus size={20} />
          Book
        </BotItem>
        {isAuthenticated ? (
          <BotItem to="/dashboard">
            <ClipboardList size={20} />
            Requests
          </BotItem>
        ) : null}
        {isAuthenticated ? (
          <BotItem to="/tracking/latest">
            <Navigation size={20} />
            Track
          </BotItem>
        ) : (
          <BotItem to="/auth?mode=login">
            <User size={20} />
            Login
          </BotItem>
        )}
      </BottomBar>
    </Shell>
  );
}
