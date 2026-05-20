import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Truck,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { sid } from "../../lib/sid";
import type { Job } from "../../types";
import { ScreenWithNav } from "../../components/ScreenWithNav";
import {
  ActionStack,
  Body,
  CheckIcon,
  ChecklistCard,
  ChecklistItem,
  CheckText,
  ContactBtn,
  ContactRow,
  DangerBtn,
  EmptyState,
  GoOnlineBtn,
  Header,
  HeaderTop,
  IdPill,
  InfoCard,
  InfoIcon,
  InfoLabel,
  InfoRow,
  InfoValue,
  JobMeta,
  NavLink,
  OfflineBar,
  Overlay,
  PrimaryBtn,
  SectionLabel,
  Sheet,
  SheetActions,
  SheetBody,
  SheetHandle,
  SheetTitle,
  StatusBadge,
  SuccessBtn,
  TimerDisplay,
  TimerLabel,
  Toast,
  UploadBtn,
  VariantPill,
} from "./styles";

type Props = {
  online: boolean;
  isOffline: boolean;
  job?: Job;
  onReached: (jobId: string) => void;
  onStarted: (jobId: string, internalJobId?: string) => void;
  onUpload: (jobId: string, internalJobId?: string, files?: File[]) => Promise<void>;
  onComplete: (jobId: string, internalJobId?: string) => void;
  onToggleOnline: () => void;
};

function fmtStatus(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ActiveJobScreen({
  online,
  isOffline,
  job,
  onReached,
  onStarted,
  onUpload,
  onComplete,
  onToggleOnline,
}: Props) {
  const [seconds, setSeconds] = useState(0);
  const [toast, setToast] = useState<{ msg: string; type?: "success" | "error" } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [confirm, setConfirm] = useState<null | "start" | "complete">(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg: string, type?: "success" | "error") => {
    setToast({ msg, type });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2500);
  };

  useEffect(() => () => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
  }, []);

  if (!job) {
    return (
      <ScreenWithNav active="map">
        <Header>
          <HeaderTop>
            <div style={{ color: "#94b4d4", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              CraneHub Driver
            </div>
          </HeaderTop>
        </Header>
        <Body>
          <EmptyState>
            <Truck size={40} strokeWidth={1.3} />
            <div style={{ fontWeight: 700, fontSize: 15, color: "#475569" }}>No active job</div>
            <div style={{ fontSize: 13 }}>Accept a job from the notifications screen</div>
          </EmptyState>
        </Body>
      </ScreenWithNav>
    );
  }

  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const disabled = !online || isOffline;

  const mapsUrl = job.location
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.location)}`
    : null;

  const checklist = [
    { label: "Helmet + PPE verified", done: job.reached },
    { label: "Outrigger ground check done", done: job.started },
    { label: "Site supervisor briefing", done: job.started },
    { label: "Proof photo uploaded", done: job.proofCount > 0 },
  ];
  const checklistDone = checklist.filter((c) => c.done).length;

  return (
    <ScreenWithNav active="map">
      {/* ── Toast ─────────────────────────────── */}
      {toast ? (
        <Toast $type={toast.type}>
          {toast.type === "error" ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
          {toast.msg}
        </Toast>
      ) : null}

      {/* ── Confirm bottom sheet ──────────────── */}
      {confirm ? (
        <>
          <Overlay onClick={() => setConfirm(null)} />
          <Sheet>
            <SheetHandle />
            <SheetTitle>
              {confirm === "start" ? "Start Work?" : "Complete Job?"}
            </SheetTitle>
            <SheetBody>
              {confirm === "start"
                ? "This will mark the job as in progress and start the work timer."
                : "This will finalise the job, stop tracking, and mark it as completed."}
            </SheetBody>
            <SheetActions>
              <DangerBtn
                style={confirm === "start" ? { background: "#16a34a", boxShadow: "0 4px 14px rgba(22,163,74,0.3)" } : {}}
                onClick={() => {
                  if (confirm === "start") {
                    onStarted(job.id, job.jobId);
                    showToast("Work started.", "success");
                  } else {
                    onComplete(job.id, job.jobId);
                    showToast("Job completed.", "success");
                  }
                  setConfirm(null);
                }}
              >
                {confirm === "start" ? "Yes, Start Work" : "Yes, Complete Job"}
              </DangerBtn>
              <PrimaryBtn
                style={{ background: "transparent", border: "1.5px solid #e2e8f0", color: "#64748b" }}
                onClick={() => setConfirm(null)}
              >
                Cancel
              </PrimaryBtn>
            </SheetActions>
          </Sheet>
        </>
      ) : null}

      {/* ── Header ──────────────────────────────── */}
      <Header>
        <HeaderTop>
          <JobMeta>
            <IdPill>{job.jobRefId ?? `JOB-${sid(job.id)}`}</IdPill>
            <VariantPill>{job.variant}</VariantPill>
            <StatusBadge $status={job.status}>{fmtStatus(job.status)}</StatusBadge>
          </JobMeta>
        </HeaderTop>
        <TimerLabel>Live Timer</TimerLabel>
        <TimerDisplay>
          {hh}:{mm}:{ss}
        </TimerDisplay>
      </Header>

      {/* ── Body ────────────────────────────────── */}
      <Body>
        {disabled ? (
          <OfflineBar>
            <WifiOff size={14} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>You&apos;re offline — actions disabled</span>
            <GoOnlineBtn onClick={onToggleOnline}>Go Online</GoOnlineBtn>
          </OfflineBar>
        ) : null}

        {/* ── Job details ── */}
        <SectionLabel>Job Details</SectionLabel>
        <InfoCard>
          <InfoRow>
            <InfoIcon><Truck size={14} color="#FF6200" /></InfoIcon>
            <div>
              <InfoLabel>Crane</InfoLabel>
              <InfoValue>{job.variant}</InfoValue>
            </div>
          </InfoRow>
          {job.location ? (
            <InfoRow>
              <InfoIcon><MapPin size={14} color="#FF6200" /></InfoIcon>
              <div>
                <InfoLabel>Pickup Location</InfoLabel>
                <InfoValue>{job.location}</InfoValue>
                {mapsUrl ? (
                  <NavLink href={mapsUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation size={11} /> Open in Maps
                    <ExternalLink size={10} />
                  </NavLink>
                ) : null}
              </div>
            </InfoRow>
          ) : null}
        </InfoCard>

        {/* ── Contact ── */}
        <ContactRow>
          <ContactBtn>
            <Phone size={15} /> Call Customer
          </ContactBtn>
          <ContactBtn $tone="green">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </ContactBtn>
        </ContactRow>

        {/* ── Safety checklist ── */}
        <SectionLabel>Safety Checklist ({checklistDone}/{checklist.length})</SectionLabel>
        <ChecklistCard>
          {checklist.map((item) => (
            <ChecklistItem key={item.label} $done={item.done}>
              <CheckIcon $done={item.done}>
                {item.done ? <CheckCircle2 size={12} color="#fff" strokeWidth={3} /> : null}
              </CheckIcon>
              <CheckText $done={item.done}>{item.label}</CheckText>
            </ChecklistItem>
          ))}
        </ChecklistCard>

        {/* ── Actions ── */}
        <SectionLabel>Actions</SectionLabel>
        <ActionStack>
          <PrimaryBtn
            disabled={disabled}
            onClick={() => {
              onReached(job.id);
              showToast("Marked as reached site.", "success");
            }}
          >
            <MapPin size={16} /> I&apos;ve Reached Site
          </PrimaryBtn>

          <SuccessBtn
            disabled={disabled}
            onClick={() => setConfirm("start")}
          >
            <CheckCircle2 size={16} /> Work Started
          </SuccessBtn>

          <UploadBtn
            disabled={disabled || uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={16} color="#FF6200" />
            {uploading
              ? "Uploading..."
              : `Upload Proof Photos${job.proofCount > 0 ? ` (${job.proofCount})` : ""}`}
          </UploadBtn>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={async (e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              if (!files.length) return;
              setUploading(true);
              try {
                await onUpload(job.id, job.jobId, files);
                showToast("Proof photos uploaded.", "success");
              } catch {
                showToast("Upload failed. Try again.", "error");
              } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }
            }}
          />

          <DangerBtn
            disabled={disabled}
            onClick={() => setConfirm("complete")}
          >
            <X size={17} /> Job Completed
          </DangerBtn>
        </ActionStack>
      </Body>
    </ScreenWithNav>
  );
}
