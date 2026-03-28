import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { DriverState, Job, JobStatus } from "../types";

type SocketType = {
  on: (event: string, cb: (payload: any) => void) => void;
  off: (event: string, cb?: (payload: any) => void) => void;
};

type SetState = Dispatch<SetStateAction<DriverState>>;

export function useJobRealtime(
  socket: SocketType | null,
  setState: SetState,
) {
  useEffect(() => {
    if (!socket) return;

    const onDispatch = (payload: any) => {
      setState((prev: any) => {
        const requestId = payload?.request_id || payload?.requestId;
        const jobId = payload?.id;
        const displayId = requestId || jobId;
        if (!displayId) return prev;
        const exists = prev.jobs.some(
          (job: Job) => job.jobId === jobId || job.id === displayId,
        );
        if (exists) return prev;

        const nextJob: Job = {
          id: displayId,
          requestId,
          jobId,
          variant: payload?.crane_registration || "Assigned Crane",
          capacity: "NA",
          customer: "Customer",
          mobile: "N/A",
          location: "Live location pending",
          distanceKm: 0,
          schedule: new Date().toLocaleString(),
          load: "N/A",
          amount: 0,
          status: "new",
          reached: false,
          started: false,
          proofCount: 0,
        };

        // Push new jobs to the top when dispatch happens.
        return { ...prev, jobs: [nextJob, ...prev.jobs] };
      });
    };

    const onStatus = (payload: any) => {
      if (!payload?.jobId) return;
      const statusMap: Record<string, JobStatus> = {
        assigned: "assigned",
        en_route: "assigned",
        working: "in_progress",
        completed: "completed",
        cancelled: "rejected",
      };

      setState((prev: any) => ({
        ...prev,
        jobs: prev.jobs.map((job: Job) =>
          job.jobId === payload.jobId
            ? { ...job, status: statusMap[payload.status] || job.status }
            : job,
        ),
      }));
    };

    socket.on("dispatch:job_assigned", onDispatch);
    socket.on("job:status_changed", onStatus);

    return () => {
      socket.off("dispatch:job_assigned", onDispatch);
      socket.off("job:status_changed", onStatus);
    };
  }, [socket, setState]);
}
