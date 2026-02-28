import {
  BellRing,
  Camera,
  CheckCircle2,
  Home,
  MapPinned,
  Phone,
  Power,
  UserRound,
  Wallet,
  Waypoints,
  WifiOff
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

type JobStatus = "new" | "assigned" | "in_progress" | "completed" | "rejected";
type Job = {
  id: string;
  variant: string;
  capacity: string;
  customer: string;
  mobile: string;
  location: string;
  distanceKm: number;
  schedule: string;
  load: string;
  amount: number;
  status: JobStatus;
  reached: boolean;
  started: boolean;
  proofCount: number;
};

const seedJobs: Job[] = [
  {
    id: "REQ-BLR-9910",
    variant: "50T Rough Terrain",
    capacity: "50T",
    customer: "Brigade Infra Projects",
    mobile: "+91 98100 77120",
    location: "EPIP, Whitefield, Bengaluru",
    distanceKm: 2.4,
    schedule: "03 Mar 2026, 09:30 AM",
    load: "22-ton DG set rooftop lift",
    amount: 3200,
    status: "new",
    reached: false,
    started: false,
    proofCount: 0
  },
  {
    id: "REQ-BLR-8812",
    variant: "25T Mobile",
    capacity: "25T",
    customer: "Kaveri Structures",
    mobile: "+91 98866 22011",
    location: "Hebbal, Bengaluru",
    distanceKm: 6.8,
    schedule: "03 Mar 2026, 01:00 PM",
    load: "Steel frame positioning",
    amount: 2600,
    status: "assigned",
    reached: true,
    started: false,
    proofCount: 0
  },
  {
    id: "REQ-BLR-7701",
    variant: "Tower Crane",
    capacity: "80T",
    customer: "SRS Buildwell",
    mobile: "+91 93456 77102",
    location: "Peenya, Bengaluru",
    distanceKm: 9.2,
    schedule: "02 Mar 2026, 08:30 AM",
    load: "Precast slab placement",
    amount: 4500,
    status: "completed",
    reached: true,
    started: true,
    proofCount: 3
  }
];

type DriverState = {
  isLoggedIn: boolean;
  phone: string;
  online: boolean;
  dismissedInstall: boolean;
  jobs: Job[];
};

const STORAGE_KEY = "cranehub_driver_state_v1";

function loadState(): DriverState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        isLoggedIn: false,
        phone: "",
        online: true,
        dismissedInstall: false,
        jobs: seedJobs
      };
    }
    const parsed = JSON.parse(raw) as DriverState;
    return parsed;
  } catch {
    return {
      isLoggedIn: false,
      phone: "",
      online: true,
      dismissedInstall: false,
      jobs: seedJobs
    };
  }
}

function saveState(state: DriverState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function App() {
  const [state, setState] = useState<DriverState>(() => loadState());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => saveState(state), [state]);
  useEffect(() => {
    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const derived = useMemo(() => {
    const active = state.jobs.find((j) => j.status === "in_progress" || j.status === "assigned");
    const newest = state.jobs.find((j) => j.status === "new");
    const completed = state.jobs.filter((j) => j.status === "completed");
    const todaysEarnings = completed.reduce((sum, j) => sum + j.amount, 0);
    return { active, newest, completed, todaysEarnings };
  }, [state.jobs]);

  const actions = {
    login: (phone: string) => setState((s) => ({ ...s, isLoggedIn: true, phone })),
    logout: () =>
      setState((s) => ({
        ...s,
        isLoggedIn: false,
        phone: "",
        online: false
      })),
    toggleOnline: () => setState((s) => ({ ...s, online: !s.online })),
    dismissInstall: () => setState((s) => ({ ...s, dismissedInstall: true })),
    acceptJob: (jobId: string) =>
      setState((s) => ({
        ...s,
        jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, status: "assigned" } : j))
      })),
    rejectJob: (jobId: string) =>
      setState((s) => ({
        ...s,
        jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, status: "rejected" } : j))
      })),
    markReached: (jobId: string) =>
      setState((s) => ({
        ...s,
        jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, reached: true } : j))
      })),
    workStarted: (jobId: string) =>
      setState((s) => ({
        ...s,
        jobs: s.jobs.map((j) =>
          j.id === jobId ? { ...j, started: true, status: "in_progress" } : j
        )
      })),
    uploadProof: (jobId: string) =>
      setState((s) => ({
        ...s,
        jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, proofCount: j.proofCount + 1 } : j))
      })),
    complete: (jobId: string) =>
      setState((s) => ({
        ...s,
        jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, status: "completed" } : j))
      }))
  };

  return (
    <AppViewport $offline={isOffline}>
      <Routes>
        <Route
          path="/login"
          element={
            state.isLoggedIn ? (
              <Navigate to="/home" replace />
            ) : (
              <LoginScreen onLogin={actions.login} />
            )
          }
        />
        <Route
          path="/*"
          element={
            state.isLoggedIn ? (
              <AppShell
                state={state}
                isOffline={isOffline}
                derived={derived}
                actions={actions}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </AppViewport>
  );
}

function AppShell({
  state,
  isOffline,
  derived,
  actions
}: {
  state: DriverState;
  isOffline: boolean;
  derived: {
    active?: Job;
    newest?: Job;
    completed: Job[];
    todaysEarnings: number;
  };
  actions: {
    logout: () => void;
    toggleOnline: () => void;
    dismissInstall: () => void;
    acceptJob: (jobId: string) => void;
    rejectJob: (jobId: string) => void;
    markReached: (jobId: string) => void;
    workStarted: (jobId: string) => void;
    uploadProof: (jobId: string) => void;
    complete: (jobId: string) => void;
  };
}) {
  return (
    <Routes>
      <Route
        path="/home"
        element={
          <HomeScreen
            phone={state.phone}
            online={state.online}
            isOffline={isOffline}
            active={derived.active}
            todaysEarnings={derived.todaysEarnings}
            showInstall={!state.dismissedInstall}
            onDismissInstall={actions.dismissInstall}
            onToggleOnline={actions.toggleOnline}
          />
        }
      />
      <Route
        path="/job-alert"
        element={
          <JobAlertScreen
            online={state.online}
            isOffline={isOffline}
            job={derived.newest}
            onAccept={actions.acceptJob}
            onReject={actions.rejectJob}
          />
        }
      />
      <Route
        path="/active-job"
        element={
          <ActiveJobScreen
            online={state.online}
            isOffline={isOffline}
            job={derived.active}
            onReached={actions.markReached}
            onStarted={actions.workStarted}
            onUpload={actions.uploadProof}
            onComplete={actions.complete}
          />
        }
      />
      <Route path="/jobs" element={<JobsScreen jobs={state.jobs} />} />
      <Route
        path="/map"
        element={
          <MapScreen online={state.online} isOffline={isOffline} active={derived.active} />
        }
      />
      <Route
        path="/profile"
        element={
          <ProfileScreen
            phone={state.phone}
            earnings={derived.todaysEarnings}
            completed={derived.completed.length}
            onLogout={actions.logout}
          />
        }
      />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

function LoginScreen({ onLogin }: { onLogin: (phone: string) => void }) {
  const [phone, setPhone] = useState("9886622410");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("427591");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const sendOtp = () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setMessage("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setStep("otp");
    setMessage(`Demo OTP: ${code}`);
  };

  const verify = () => {
    if (otp.join("") !== generatedOtp) {
      setMessage("Invalid OTP. Try again.");
      return;
    }
    onLogin(phone);
    navigate("/home");
  };

  return (
    <SafeArea>
      <h2 style={{ margin: "2px 0 0", color: "#0A2540" }}>Driver Login</h2>
      <small style={{ color: "#64748B" }}>CraneHub Operator Access</small>
      <Card>
        {step === "phone" ? (
          <>
            <label>Mobile Number</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />
            <Action style={{ marginTop: 10 }} onClick={sendOtp}>
              Send OTP
            </Action>
          </>
        ) : (
          <>
            <label>Enter 6-digit OTP</label>
            <Grid6>
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  value={digit}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "").slice(0, 1);
                    setOtp((prev) => {
                      const next = [...prev];
                      next[index] = clean;
                      return next;
                    });
                  }}
                />
              ))}
            </Grid6>
            <Action style={{ marginTop: 10 }} onClick={verify}>
              Verify
            </Action>
          </>
        )}
      </Card>
      <small style={{ color: message.includes("Invalid") ? "#b91c1c" : "#334155" }}>{message}</small>
    </SafeArea>
  );
}

function HomeScreen({
  phone,
  online,
  isOffline,
  active,
  todaysEarnings,
  showInstall,
  onDismissInstall,
  onToggleOnline
}: {
  phone: string;
  online: boolean;
  isOffline: boolean;
  active?: Job;
  todaysEarnings: number;
  showInstall: boolean;
  onDismissInstall: () => void;
  onToggleOnline: () => void;
}) {
  return (
    <ScreenWithNav active="home">
      <SafeArea>
        {showInstall ? (
          <InstallBanner>
            <span style={{ fontSize: 13 }}>Install app for offline sync</span>
            <ActionMini onClick={onDismissInstall}>Dismiss</ActionMini>
          </InstallBanner>
        ) : null}
        {isOffline ? (
          <OfflineBar>
            <WifiOff size={14} /> Device offline. Actions will sync later.
          </OfflineBar>
        ) : null}
        <Row>
          <div>
            <strong style={{ color: "#0A2540" }}>Hi, {phone.slice(-4)} Driver</strong>
            <p style={{ margin: 0, color: "#64748B", fontSize: 13 }}>Bengaluru Central</p>
          </div>
          <Toggle $on={online && !isOffline} onClick={onToggleOnline}>
            <Power size={14} /> {online && !isOffline ? "Online" : "Offline"}
          </Toggle>
        </Row>
        <Card>
          <small style={{ color: "#64748B" }}>Today&apos;s earnings</small>
          <h2 style={{ margin: "4px 0" }}>₹{todaysEarnings.toLocaleString("en-IN")}</h2>
        </Card>
        <Card>
          <strong>Current job</strong>
          {active ? (
            <>
              <p style={{ margin: "6px 0", color: "#334155" }}>
                {active.id} | {active.variant} | {active.location}
              </p>
              <NavigateButton to="/active-job">Open active job</NavigateButton>
            </>
          ) : (
            <p style={{ margin: "6px 0", color: "#64748B" }}>Waiting for new assignment</p>
          )}
        </Card>
        <NavigateButton to="/job-alert">Check new job notification</NavigateButton>
      </SafeArea>
    </ScreenWithNav>
  );
}

function JobAlertScreen({
  online,
  isOffline,
  job,
  onAccept,
  onReject
}: {
  online: boolean;
  isOffline: boolean;
  job?: Job;
  onAccept: (jobId: string) => void;
  onReject: (jobId: string) => void;
}) {
  const navigate = useNavigate();
  if (!job) {
    return (
      <ScreenWithNav active="jobs">
        <SafeArea>
          <Card>No new assignments right now.</Card>
        </SafeArea>
      </ScreenWithNav>
    );
  }

  const disabled = !online || isOffline;
  return (
    <ScreenWithNav active="jobs">
      <SafeArea>
        <NotifyBanner>
          <BellRing size={16} />
          New Assignment Nearby ({job.distanceKm} km)
        </NotifyBanner>
        <Card>
          <h3 style={{ margin: "0 0 6px" }}>{job.id}</h3>
          <p style={{ margin: "4px 0" }}><b>Variant:</b> {job.variant} ({job.capacity})</p>
          <p style={{ margin: "4px 0" }}><b>Customer:</b> {job.customer} | {job.mobile}</p>
          <p style={{ margin: "4px 0" }}><b>Location:</b> {job.location}</p>
          <p style={{ margin: "4px 0" }}><b>Schedule:</b> {job.schedule}</p>
          <p style={{ margin: "4px 0" }}><b>Load:</b> {job.load}</p>
          <MapBox>Map snippet</MapBox>
        </Card>
        <Action
          $tone="success"
          disabled={disabled}
          onClick={() => {
            onAccept(job.id);
            navigate("/active-job");
          }}
        >
          Accept Job
        </Action>
        <Action
          $tone="danger"
          disabled={disabled}
          onClick={() => {
            onReject(job.id);
            navigate("/home");
          }}
        >
          Reject
        </Action>
        {disabled ? <small style={{ color: "#b45309" }}>Go online to respond to new jobs.</small> : null}
      </SafeArea>
    </ScreenWithNav>
  );
}

function ActiveJobScreen({
  online,
  isOffline,
  job,
  onReached,
  onStarted,
  onUpload,
  onComplete
}: {
  online: boolean;
  isOffline: boolean;
  job?: Job;
  onReached: (jobId: string) => void;
  onStarted: (jobId: string) => void;
  onUpload: (jobId: string) => void;
  onComplete: (jobId: string) => void;
}) {
  const [seconds, setSeconds] = useState(6140);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (!job) {
    return (
      <ScreenWithNav active="map">
        <SafeArea>
          <Card>No active job at the moment.</Card>
        </SafeArea>
      </ScreenWithNav>
    );
  }

  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const disabled = !online || isOffline;

  return (
    <ScreenWithNav active="map">
      <SafeArea>
        {isOffline ? (
          <OfflineBar>
            <WifiOff size={14} /> Offline mode. Buttons are disabled.
          </OfflineBar>
        ) : null}
        <Card>
          <small style={{ color: "#64748B" }}>Live timer</small>
          <h2 style={{ margin: "4px 0" }}>{hh}:{mm}:{ss}</h2>
          <small>{job.id} | {job.variant}</small>
        </Card>
        <TwoCol>
          <Action><Phone size={16} /> Call</Action>
          <Action $tone="success"><Waypoints size={16} /> WhatsApp</Action>
        </TwoCol>
        <Action disabled={disabled} onClick={() => onReached(job.id)}>I&apos;ve Reached Site</Action>
        <Action disabled={disabled} onClick={() => onStarted(job.id)}>Work Started</Action>
        <Action disabled={disabled} onClick={() => onUpload(job.id)}><Camera size={16} /> Upload Proof Photos ({job.proofCount})</Action>
        <Action $tone="danger" disabled={disabled} onClick={() => onComplete(job.id)}>Job Completed</Action>
        <Card>
          <strong>Safety checklist</strong>
          <ListItem done={job.reached}>Helmet + PPE verified</ListItem>
          <ListItem done={job.started}>Outrigger ground check done</ListItem>
          <ListItem done={job.started}>Site supervisor briefing</ListItem>
          <ListItem done={job.proofCount > 0}>Proof photo uploaded</ListItem>
        </Card>
      </SafeArea>
    </ScreenWithNav>
  );
}

function JobsScreen({ jobs }: { jobs: Job[] }) {
  const [tab, setTab] = useState<"assigned" | "completed">("assigned");
  const filtered = jobs.filter((j) =>
    tab === "assigned" ? j.status === "assigned" || j.status === "in_progress" : j.status === "completed"
  );
  return (
    <ScreenWithNav active="jobs">
      <SafeArea>
        <TabRow>
          <TabBtn $active={tab === "assigned"} onClick={() => setTab("assigned")}>Assigned</TabBtn>
          <TabBtn $active={tab === "completed"} onClick={() => setTab("completed")}>Completed</TabBtn>
        </TabRow>
        {filtered.map((job) => (
          <Card key={job.id}>
            <strong>{job.id}</strong>
            <p style={{ margin: "4px 0" }}>{job.location}</p>
            <small style={{ color: "#64748B" }}>{job.variant} | ₹{job.amount.toLocaleString("en-IN")}</small>
          </Card>
        ))}
      </SafeArea>
    </ScreenWithNav>
  );
}

function MapScreen({
  online,
  isOffline,
  active
}: {
  online: boolean;
  isOffline: boolean;
  active?: Job;
}) {
  return (
    <ScreenWithNav active="map">
      <SafeArea>
        <Card>
          <strong>Live map</strong>
          <MapBox>
            {active ? `${active.id} route: Yard to ${active.location}` : "No active route"}
          </MapBox>
        </Card>
        <small style={{ color: "#64748B" }}>
          Status: {online && !isOffline ? "Online & tracking active" : "Offline - map updates paused"}
        </small>
      </SafeArea>
    </ScreenWithNav>
  );
}

function ProfileScreen({
  phone,
  earnings,
  completed,
  onLogout
}: {
  phone: string;
  earnings: number;
  completed: number;
  onLogout: () => void;
}) {
  return (
    <ScreenWithNav active="profile">
      <SafeArea>
        <Card>
          <Row>
            <Avatar />
            <div>
              <strong>Irfan Khan</strong>
              <p style={{ margin: 0, color: "#64748B", fontSize: 13 }}>Driver ID: DRV-2042</p>
            </div>
          </Row>
          <p style={{ margin: "8px 0 0" }}><b>Phone:</b> +91 {phone}</p>
          <p style={{ margin: "4px 0 0" }}><b>Assigned crane:</b> 50T Rough Terrain | KA-53-MR-2281</p>
          <p style={{ margin: "4px 0 0" }}><b>Today&apos;s earnings:</b> ₹{earnings.toLocaleString("en-IN")}</p>
          <p style={{ margin: "4px 0 0" }}><b>Rating:</b> 4.8 (Completed jobs today: {completed})</p>
          <Action $tone="danger" style={{ marginTop: 10 }} onClick={onLogout}>Logout</Action>
        </Card>
      </SafeArea>
    </ScreenWithNav>
  );
}

function ScreenWithNav({
  active,
  children
}: {
  active: "home" | "jobs" | "map" | "profile";
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const links = {
    home: "/home",
    jobs: "/jobs",
    map: "/map",
    profile: "/profile"
  };
  return (
    <>
      {children}
      <BottomNav>
        <NavItem $active={active === "home"} onClick={() => navigate(links.home)}>
          <Home size={18} />
          Home
        </NavItem>
        <NavItem $active={active === "jobs"} onClick={() => navigate(links.jobs)}>
          <Wallet size={18} />
          Jobs
        </NavItem>
        <NavItem $active={active === "map"} onClick={() => navigate(links.map)}>
          <MapPinned size={18} />
          Map
        </NavItem>
        <NavItem $active={active === "profile"} onClick={() => navigate(links.profile)}>
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

function ListItem({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 6, color: done ? "#166534" : "#475569" }}>
      <CheckCircle2 size={15} color={done ? "#22C55E" : "#94a3b8"} />
      {children}
    </span>
  );
}

function NavigateButton({ to, children }: { to: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  return <Action onClick={() => navigate(to)}>{children}</Action>;
}

const AppViewport = styled.div<{ $offline?: boolean }>`
  min-height: 100vh;
  max-width: 430px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.neutralBg};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  filter: ${({ $offline }) => ($offline ? "grayscale(0.2)" : "none")};
`;

const SafeArea = styled.div`
  padding: 16px 14px 12px;
  display: grid;
  gap: 10px;
  min-height: 0;
`;

const Card = styled.div`
  ${({ theme }) => theme.mixins.card};
  padding: 12px;
`;

const InstallBanner = styled.div`
  border: 1px dashed #fdba74;
  background: #fff7ed;
  border-radius: 12px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActionMini = styled.button`
  border: 0;
  border-radius: 10px;
  background: #0a2540;
  color: #fff;
  min-height: 30px;
  padding: 0 10px;
  font-weight: 700;
`;

const OfflineBar = styled.div`
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #475569;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const Toggle = styled.button<{ $on: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${({ $on }) => ($on ? "#dcfce7" : "#fee2e2")};
  color: ${({ $on }) => ($on ? "#166534" : "#991b1b")};
`;

const Action = styled.button<{ $tone?: "success" | "danger" | "primary" }>`
  width: 100%;
  min-height: 54px;
  border: 0;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #fff;
  background: ${({ $tone, theme }) => {
    if ($tone === "success") return theme.colors.success;
    if ($tone === "danger") return theme.colors.danger;
    return theme.colors.primary;
  }};
  opacity: ${({ disabled }) => (disabled ? 0.45 : 1)};
`;

const Input = styled.input`
  width: 100%;
  min-height: 46px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 10px;
`;

const Grid6 = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
`;

const NotifyBanner = styled.div`
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #c2410c;
  font-weight: 700;
`;

const MapBox = styled.div`
  border-radius: 10px;
  height: 120px;
  background: linear-gradient(120deg, #dbeafe, #e2e8f0);
  display: grid;
  place-items: center;
  margin-top: 8px;
  color: #334155;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const BottomNav = styled.div`
  margin-top: auto;
  background: #fff;
  border-top: 1px solid #e2e8f0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  min-height: 76px;
`;

const NavItem = styled.button<{ $active?: boolean }>`
  border: 0;
  background: transparent;
  display: grid;
  place-items: center;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : "#64748B")};
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
`;

const TabRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const TabBtn = styled.button<{ $active: boolean }>`
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? "#FF6200" : "#E2E8F0")};
  background: ${({ $active }) => ($active ? "#fff3ec" : "#fff")};
  font-weight: 700;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 999px;
  background: #cbd5e1;
`;

const FloatingBtn = styled.button`
  position: absolute;
  right: 14px;
  bottom: 90px;
  border: 0;
  border-radius: 999px;
  width: 46px;
  height: 46px;
  background: #0a2540;
  color: #fff;
  display: grid;
  place-items: center;
`;
