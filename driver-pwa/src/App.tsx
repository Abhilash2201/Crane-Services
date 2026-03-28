import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import type { DriverState, Job } from "./types";
import { ActiveJobRoute } from "./components/ActiveJobRoute";
import { AppViewport } from "./styles/shared";
import { useDerivedJobs } from "./hooks/useDerivedJobs";
import { useDriverApi } from "./hooks/useDriverApi";
import { useDriverState } from "./hooks/useDriverState";
import { useGps } from "./hooks/useGps";
import { useJobRealtime } from "./hooks/useJobRealtime";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import { useRealtimeSocket } from "./hooks/useRealtimeSocket";
import { useTrackingEmitter } from "./hooks/useTrackingEmitter";
import { JobAlertScreen } from "./screens/JobAlertScreen";
import { JobsScreen } from "./screens/JobsScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { MapScreen } from "./screens/MapScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { HomeScreen } from "./screens/HomeScreen";

export default function App() {
  const { state, setState } = useDriverState();
  const isOffline = useNetworkStatus();
  const { gpsPosition, hasGps } = useGps();
  const socket = useRealtimeSocket();
  const { loadProfile, loadJobs, actions } = useDriverApi(setState);
  const derived = useDerivedJobs(state.jobs);

  // Wire real-time updates (dispatch + status changes) into local state.
  useJobRealtime(socket, setState);

  // Push driver GPS to the backend when a job is active.
  useTrackingEmitter({
    socket,
    active: derived.active,
    online: state.online,
    isOffline,
    gpsPosition,
    hasGps,
    onTrackingSent: () =>
      setState((s) => ({ ...s, lastTrackingAt: new Date().toISOString() })),
  });

  useEffect(() => {
    if (state.isLoggedIn) {
      loadProfile();
      loadJobs();
    }
  }, [state.isLoggedIn, loadProfile, loadJobs]);

  return (
    <AppViewport $offline={isOffline}>
      <Routes>
        <Route
          path="/login"
          element={
            state.isLoggedIn ? (
              <Navigate to="/home" replace />
            ) : (
              <LoginScreen
                onLogin={(auth) => {
                  actions.login(auth);
                  loadProfile();
                  loadJobs();
                }}
              />
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
                gpsPosition={gpsPosition}
                hasGps={hasGps}
                actions={actions}
                onRefreshJobs={loadJobs}
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

type AppShellProps = {
  state: DriverState;
  isOffline: boolean;
  derived: {
    active?: Job;
    newest?: Job;
    completed: Job[];
    todaysEarnings: number;
  };
  gpsPosition: [number, number];
  hasGps: boolean;
  actions: {
    logout: () => void;
    toggleOnline: () => void;
    dismissInstall: () => void;
    acceptJob: (jobId: string, internalJobId?: string) => void;
    rejectJob: (jobId: string, internalJobId?: string) => void;
    markReached: (jobId: string) => void;
    workStarted: (jobId: string, internalJobId?: string) => void;
    uploadProof: (jobId: string) => void;
    complete: (jobId: string, internalJobId?: string) => void;
    login: (auth: { user: any }) => void;
  };
  onRefreshJobs: () => void;
};

function AppShell({
  state,
  isOffline,
  derived,
  gpsPosition,
  hasGps,
  actions,
  onRefreshJobs,
}: AppShellProps) {
  return (
    <Routes>
      <Route
        path="/home"
        element={
          <HomeScreen
            phone={state.user?.phone || ""}
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
        path="/active-job/:jobId"
        element={
          <ActiveJobRoute
            online={state.online}
            isOffline={isOffline}
            jobs={state.jobs}
            onReached={actions.markReached}
            onStarted={actions.workStarted}
            onUpload={actions.uploadProof}
            onComplete={actions.complete}
          />
        }
      />
      <Route
        path="/active-job"
        element={
          <ActiveJobRoute
            online={state.online}
            isOffline={isOffline}
            jobs={state.jobs}
            onReached={actions.markReached}
            onStarted={actions.workStarted}
            onUpload={actions.uploadProof}
            onComplete={actions.complete}
          />
        }
      />
      <Route
        path="/jobs"
        element={<JobsScreen jobs={state.jobs} onRefresh={onRefreshJobs} />}
      />
      <Route
        path="/map"
        element={
          <MapScreen
            online={state.online}
            isOffline={isOffline}
            active={derived.active}
            position={gpsPosition}
            hasLocation={hasGps}
          />
        }
      />
      <Route
        path="/profile"
        element={
          <ProfileScreen
            user={state.user}
            earnings={derived.todaysEarnings}
            completed={derived.completed.length}
            onLogout={actions.logout}
            activeJob={derived.active}
            lastTrackingAt={state.lastTrackingAt}
          />
        }
      />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
