import { Bell, ChevronDown, MapPin, Menu, Search, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
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
  background: rgba(248, 250, 252, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
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
  color: ${({ theme }) => theme.colors.navy};
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
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  @media (min-width: 900px) {
    grid-template-columns: 200px 1fr auto;
    align-items: center;
  }
`;
const Nav = styled.nav<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? "flex" : "none")};
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
  color: ${({ theme }) => theme.colors.muted};
  &.active {
    color: ${({ theme }) => theme.colors.navy};
    background: #e2e8f0;
  }
`;
const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px 34px;
`;
const ProfileWrap = styled.div`
  position: relative;
`;
const ProfileButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #fff;
  border-radius: 999px;
  padding: 4px 10px 4px 6px;
  font-size: 0.9rem;
  cursor: pointer;
`;
const Avatar = styled.span`
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #0f172a;
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

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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

  const isAuthenticated = useMemo(
    () => Boolean(authPayload?.refreshToken),
    [authPayload],
  );
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen((s) => !s)}
            >
              <Menu size={18} />
            </Button>
          </div>
          <SearchRow>
            <Button variant="outline" onClick={handleUseMyLocation}>
              <MapPin size={16} />{" "}
              {locating
                ? "Locating..."
                : location?.address
                  ? location.address
                  : "Use my location"}
            </Button>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 10,
                  top: 14,
                  color: "#64748B",
                }}
              />
              <Input
                placeholder="Enter address or pincode"
                style={{ paddingLeft: 32 }}
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddressSave();
                  }
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddressSave}
              disabled={locating}
            >
              Save
            </Button>
          </SearchRow>
          <Nav $open={open}>
            <NavItem to="/">How it Works</NavItem>
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
                        handleLogout();
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
            <Button variant="ghost" size="sm">
              <Bell size={16} />
            </Button>
          </Nav>
        </HeaderInner>
      </Header>
      <Content>{children}</Content>
    </Shell>
  );
}
