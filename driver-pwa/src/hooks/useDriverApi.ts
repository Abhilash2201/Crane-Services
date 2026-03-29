import { useCallback, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { api, authStore } from "../lib/api";
import type { DriverState, Job, JobStatus } from "../types";

type SetState = Dispatch<SetStateAction<DriverState>>;

export function useDriverApi(setState: SetState) {
  const mapStatus = useCallback((status: string): JobStatus => {
    const statusMap: Record<string, JobStatus> = {
      assigned: "assigned",
      en_route: "assigned",
      working: "in_progress",
      completed: "completed",
      cancelled: "rejected",
    };
    return statusMap[status] || "assigned";
  }, []);

  const loadProfile = useCallback(() => {
    api
      .get("/auth/me")
      .then((res) => {
        const data = res.data?.data;
        if (!data) return;
        setState((s) => ({
          ...s,
          isLoggedIn: true,
          user: {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            location_address: data.location_address || data.locationAddress,
          },
        }));
      })
      .catch(() => {
        // Ignore profile load errors.
      });
  }, [setState]);

  const loadJobs = useCallback(() => {
    api
      .get("/driver/jobs")
      .then((res) => {
        const rows = res.data?.data || [];
        // Normalize backend job payloads into the UI-friendly shape.
        const mapped: Job[] = rows.map((job: any) => ({
          id: job.request_id || job.id,
          requestId: job.request_id,
          jobId: job.id,
          variant: job.crane_registration || "Assigned Crane",
          capacity: "NA",
          customer: "Customer",
          mobile: "N/A",
          location: job.pickup_address || "Location pending",
          distanceKm: 0,
          schedule: job.created_at
            ? new Date(job.created_at).toLocaleString()
            : new Date().toLocaleString(),
          load: "N/A",
          amount: 0,
          status: mapStatus(job.status),
          reached: job.status === "en_route" || job.status === "working",
          started: job.status === "working" || job.status === "completed",
          proofCount: 0,
        }));
        setState((s) => ({ ...s, jobs: mapped }));
      })
      .catch(() => {
        // Keep existing jobs on failure.
      });
  }, [mapStatus, setState]);

  const updateJobStatus = useCallback((jobId?: string, status?: string) => {
    if (!jobId || !status) return;
    api.patch(`/driver/jobs/${jobId}/status`, { status }).catch(() => {});
  }, []);

  const actions = useMemo(
    () => ({
      login: (auth: { user: any }) =>
        setState((s) => ({ ...s, isLoggedIn: true, user: auth.user })),
      logout: () => {
        const auth = authStore.read();
        const refreshToken = auth?.refreshToken;
        if (refreshToken) {
          api.post("/auth/logout", { refreshToken }).catch(() => {});
        }
        authStore.write(null);
        setState((s) => ({
          ...s,
          isLoggedIn: false,
          user: null,
          online: false,
        }));
      },
      toggleOnline: () => setState((s) => ({ ...s, online: !s.online })),
      dismissInstall: () =>
        setState((s) => ({ ...s, dismissedInstall: true })),
      acceptJob: (jobId: string, internalJobId?: string) => {
        updateJobStatus(internalJobId, "en_route");
        setState((s) => ({
          ...s,
          jobs: s.jobs.map((j) =>
            j.id === jobId ? { ...j, status: "assigned", reached: true } : j,
          ),
        }));
      },
      rejectJob: (jobId: string, internalJobId?: string) => {
        updateJobStatus(internalJobId, "cancelled");
        setState((s) => ({
          ...s,
          jobs: s.jobs.map((j) =>
            j.id === jobId ? { ...j, status: "rejected" } : j,
          ),
        }));
      },
      markReached: (jobId: string) =>
        setState((s) => ({
          ...s,
          jobs: s.jobs.map((j) =>
            j.id === jobId ? { ...j, reached: true } : j,
          ),
        })),
      workStarted: (jobId: string, internalJobId?: string) => {
        updateJobStatus(internalJobId, "working");
        setState((s) => ({
          ...s,
          jobs: s.jobs.map((j) =>
            j.id === jobId
              ? { ...j, started: true, status: "in_progress" }
              : j,
          ),
        }));
      },
      uploadProof: async (jobId: string, internalJobId?: string, files?: File[]) => {
        if (!internalJobId || !files || files.length === 0) return;
        const form = new FormData();
        files.forEach((file) => form.append("photos", file));
        await api.post(`/driver/jobs/${internalJobId}/proofs`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setState((s) => ({
          ...s,
          jobs: s.jobs.map((j) =>
            j.id === jobId ? { ...j, proofCount: j.proofCount + files.length } : j,
          ),
        }));
      },
      complete: (jobId: string, internalJobId?: string) => {
        updateJobStatus(internalJobId, "completed");
        setState((s) => ({
          ...s,
          jobs: s.jobs.map((j) =>
            j.id === jobId ? { ...j, status: "completed" } : j,
          ),
        }));
      },
    }),
    [setState, updateJobStatus],
  );

  return { loadProfile, loadJobs, actions };
}
