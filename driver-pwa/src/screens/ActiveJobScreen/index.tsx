import { Camera, CheckCircle2, Phone, Waypoints, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import type { Job } from "../../types";
import { ScreenWithNav } from "../../components/ScreenWithNav";
import { Action, Card, SafeArea, TwoCol } from "../../styles/shared";
import { OfflineBar, Toast } from "./styles";

type Props = {
  online: boolean;
  isOffline: boolean;
  job?: Job;
  onReached: (jobId: string) => void;
  onStarted: (jobId: string, internalJobId?: string) => void;
  onUpload: (jobId: string) => void;
  onComplete: (jobId: string, internalJobId?: string) => void;
};

function ListItem({
  done,
  children,
}: {
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        marginTop: 6,
        color: done ? "#166534" : "#475569",
      }}
    >
      <CheckCircle2 size={15} color={done ? "#22C55E" : "#94a3b8"} />
      {children}
    </span>
  );
}

export function ActiveJobScreen({
  online,
  isOffline,
  job,
  onReached,
  onStarted,
  onUpload,
  onComplete,
}: Props) {
  const [seconds, setSeconds] = useState(6140);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [confirm, setConfirm] = useState<null | "start" | "complete">(null);
  const theme = useTheme();

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2200);
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, [toast]);

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
        {toast ? <Toast>{toast}</Toast> : null}
        {isOffline ? (
          <OfflineBar>
            <WifiOff size={14} /> Offline mode. Buttons are disabled.
          </OfflineBar>
        ) : null}
        <Card>
          <small style={{ color: "#64748B" }}>Live timer</small>
          <h2 style={{ margin: "4px 0" }}>
            {hh}:{mm}:{ss}
          </h2>
          <small>
            {job.id} | {job.variant}
          </small>
        </Card>
        <TwoCol>
          <Action>
            <Phone size={16} /> Call
          </Action>
          <Action $tone="success">
            <Waypoints size={16} /> WhatsApp
          </Action>
        </TwoCol>
        <Action
          disabled={disabled}
          onClick={() => {
            onReached(job.id);
            setToast("Marked as reached site.");
          }}
        >
          I&apos;ve Reached Site
        </Action>
        <Action
          disabled={disabled}
          onClick={() => {
            setConfirm("start");
          }}
        >
          Work Started
        </Action>
        <Action disabled={disabled} onClick={() => onUpload(job.id)}>
          <Camera size={16} /> Upload Proof Photos ({job.proofCount})
        </Action>
        <Action
          $tone="danger"
          disabled={disabled}
          onClick={() => {
            setConfirm("complete");
          }}
        >
          Job Completed
        </Action>
        <Card>
          <strong>Safety checklist</strong>
          <ListItem done={job.reached}>Helmet + PPE verified</ListItem>
          <ListItem done={job.started}>Outrigger ground check done</ListItem>
          <ListItem done={job.started}>Site supervisor briefing</ListItem>
          <ListItem done={job.proofCount > 0}>Proof photo uploaded</ListItem>
        </Card>
        <Dialog
          open={confirm !== null}
          onClose={() => setConfirm(null)}
          aria-labelledby="job-confirm-title"
          PaperProps={{
            sx: {
              borderRadius: 2,
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.shadows.sm,
              backgroundColor: theme.colors.white,
              color: theme.colors.text,
            },
          }}
        >
          <DialogTitle id="job-confirm-title">
            {confirm === "start" ? "Start Work?" : "Complete Job?"}
          </DialogTitle>
          <DialogContent sx={{ color: theme.colors.muted }}>
            {confirm === "start"
              ? "This will mark the job as in progress."
              : "This will finalize the job and stop tracking."}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setConfirm(null)}
              sx={{ color: theme.colors.muted }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: theme.colors.primary,
                "&:hover": { backgroundColor: theme.colors.navy },
                borderRadius: 12,
                textTransform: "none",
                fontWeight: 700,
              }}
              onClick={() => {
                if (confirm === "start") {
                  onStarted(job.id, job.jobId);
                  setToast("Work started.");
                }
                if (confirm === "complete") {
                  onComplete(job.id, job.jobId);
                  setToast("Job completed.");
                }
                setConfirm(null);
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </SafeArea>
    </ScreenWithNav>
  );
}
