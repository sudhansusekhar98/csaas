import type { StepEvent, ChildSample, SampleRoute, Coord } from '../types';
import {
  Box, Fingerprint, QrCode, Database, Truck, MapPin, ShieldCheck,
  Microscope, SquareSplitVertical, ArrowRight, FlaskConical,
} from 'lucide-react';

// ── Shared FRS face image (prototype demo) ────────────────────────────────────
export const FRS_FACE_URL = '/frs-face-coal-collected.png';

// ── Samples ───────────────────────────────────────────────────────────────────
export interface SampleOption {
  id: string;
  sealId: string;
  currentStepIndex: number;
}

export const SAMPLES: SampleOption[] = [
  { id: 'PRNT-8822-X', sealId: 'QRL-SEC-8822-HY77-1', currentStepIndex: 4 },
  { id: 'PRNT-8820-A', sealId: 'QRL-SEC-8820-KL42-2', currentStepIndex: 5 },
  { id: 'PRNT-8818-B', sealId: 'QRL-SEC-8818-MN91-3', currentStepIndex: 7 },
  { id: 'PRNT-8815-C', sealId: 'QRL-SEC-8815-PQ55-4', currentStepIndex: 2 },
  { id: 'PRNT-8810-D', sealId: 'QRL-SEC-8810-RS73-5', currentStepIndex: 10 },
];

// ── Step definitions ──────────────────────────────────────────────────────────
export const STEP_DEFINITIONS = [
  { id: 1,  title: 'Sample Collection',      desc: 'Track Hopper / Wagon Tippler',   icon: Box },
  { id: 2,  title: 'Identity Capture',       desc: 'ID Scan & Face Analytics',       icon: Fingerprint },
  { id: 3,  title: 'Sealing Sequence',       desc: 'Tamper-Evident QR Lock',         icon: QrCode },
  { id: 4,  title: 'Parent ID Issuance',     desc: 'Registry Entry Logged',          icon: Database },
  { id: 5,  title: 'VMS Path Tracking',      desc: 'Approved Logistics Route',       icon: Truck },
  { id: 6,  title: 'Prep Room Receipt',      desc: 'Face ID + Scan In',              icon: MapPin },
  { id: 7,  title: 'Integrity Verification', desc: 'Visual Seal Audit',              icon: ShieldCheck },
  { id: 8,  title: 'Pulverisation',          desc: 'CCTV Monitored Grinding',        icon: Microscope },
  { id: 9,  title: 'Division Logic',         desc: 'Sub-Sample Generation',          icon: SquareSplitVertical },
  { id: 10, title: 'ID Linkage',             desc: 'Relational Database Sync',       icon: Database },
  { id: 11, title: 'Lab Dispatch',           desc: 'Scanned for Quality Control',    icon: ArrowRight },
  { id: 12, title: 'Lab Authentication',     desc: 'Incoming Verification',          icon: FlaskConical },
];

// ── GPS demo coordinates (anchored ~17.545°N, 78.505°E) ──────────────────────
const STEP_COORDS: (Coord | null)[] = [
  { lat: 17.5412, lng: 78.4992 }, // Step 1 — Track Hopper
  { lat: 17.5418, lng: 78.5008 }, // Step 2 — Weighbridge Gate
  { lat: 17.5425, lng: 78.5021 }, // Step 3 — Sealing Bay
  null,                            // Step 4 — Central Registry (SYSTEM)
  { lat: 17.5440, lng: 78.5035 }, // Step 5 — VMS Control Room
  { lat: 17.5451, lng: 78.5048 }, // Step 6 — Prep Room Gate
  { lat: 17.5454, lng: 78.5051 }, // Step 7 — Prep Room Station A
  { lat: 17.5460, lng: 78.5059 }, // Step 8 — Pulveriser Unit
  { lat: 17.5465, lng: 78.5063 }, // Step 9 — Division Station
  null,                            // Step 10 — ID Linkage (SYSTEM)
  { lat: 17.5472, lng: 78.5070 }, // Step 11 — Lab Dispatch
  { lat: 17.5476, lng: 78.5074 }, // Step 12 — Lab Reception
];

// ── Step event templates ──────────────────────────────────────────────────────
export const STEP_TEMPLATES: Omit<StepEvent, 'completedAt'>[] = [
  { operator: { name: 'R. Kumar',  role: 'Yard Operator',     badgeId: 'OPR-312', biometricMatch: 98.7, frsPhotoUrl: FRS_FACE_URL, cameraId: 'CAM-01' }, location: 'Track Hopper TH-07',    verificationMethod: 'CCTV + Manual Entry',                coord: STEP_COORDS[0] },
  { operator: { name: 'R. Kumar',  role: 'Yard Operator',     badgeId: 'OPR-312', biometricMatch: 98.7, frsPhotoUrl: FRS_FACE_URL, cameraId: 'CAM-01' }, location: 'Weighbridge Gate 1',    verificationMethod: 'Face ID Scan',                       coord: STEP_COORDS[1] },
  { operator: { name: 'J. Doe',    role: 'Yard Supervisor',   badgeId: 'OPR-774', biometricMatch: 99.1, frsPhotoUrl: FRS_FACE_URL, cameraId: 'CAM-02' }, location: 'Sealing Bay 2',         verificationMethod: 'QR Application + Visual',            coord: STEP_COORDS[2] },
  { operator: { name: 'SYSTEM',    role: 'Auto-Registration', badgeId: 'SYS-001', biometricMatch: 100.0 }, location: 'Central Registry DB',  verificationMethod: 'Automated ID Issuance', notes: 'Auto-generated Parent ID with cryptographic hash.', coord: STEP_COORDS[3] },
  { operator: { name: 'A. Singh',  role: 'Logistics Lead',    badgeId: 'OPR-445', biometricMatch: 97.4, frsPhotoUrl: FRS_FACE_URL, cameraId: 'CAM-03' }, location: 'VMS Control Room',      verificationMethod: 'VMS Encrypted Feed',                 coord: STEP_COORDS[4] },
  { operator: { name: 'M. Patel',  role: 'Prep Technician',   badgeId: 'OPR-881', biometricMatch: 99.3, frsPhotoUrl: FRS_FACE_URL, cameraId: 'CAM-04' }, location: 'Prep Room Gate 2',      verificationMethod: 'Face ID + QR Scan In',               coord: STEP_COORDS[5] },
  { operator: { name: 'M. Patel',  role: 'Prep Technician',   badgeId: 'OPR-881', biometricMatch: 99.3, frsPhotoUrl: FRS_FACE_URL, cameraId: 'CAM-04' }, location: 'Prep Room — Station A', verificationMethod: 'Visual Inspection + QR Audit', notes: 'Seal confirmed intact. No mass variance detected.',   coord: STEP_COORDS[6] },
  { operator: { name: 'M. Patel',  role: 'Prep Technician',   badgeId: 'OPR-881', biometricMatch: 99.3, frsPhotoUrl: FRS_FACE_URL, cameraId: 'CAM-04' }, location: 'Pulveriser Unit PU-03', verificationMethod: 'CCTV Monitored (CAM-04)',             coord: STEP_COORDS[7] },
  { operator: { name: 'M. Patel',  role: 'Prep Technician',   badgeId: 'OPR-881', biometricMatch: 99.3, frsPhotoUrl: FRS_FACE_URL, cameraId: 'CAM-04' }, location: 'Division Station DS-1', verificationMethod: 'CCTV + Manual Sub-sample Tag',       coord: STEP_COORDS[8] },
  { operator: { name: 'SYSTEM',    role: 'DB Sync Service',   badgeId: 'SYS-002', biometricMatch: 100.0 }, location: 'Central Laboratory DB', verificationMethod: 'Relational DB Sync', notes: 'Parent-child ID linkage committed to ledger.',        coord: STEP_COORDS[9] },
  { operator: { name: 'S. Reddy',  role: 'Lab Analyst',       badgeId: 'OPR-956', biometricMatch: 98.2, frsPhotoUrl: FRS_FACE_URL, cameraId: 'CAM-05' }, location: 'Lab Dispatch Counter',  verificationMethod: 'QR Scan + Manifest Check',           coord: STEP_COORDS[10] },
  { operator: { name: 'S. Reddy',  role: 'Lab Analyst',       badgeId: 'OPR-956', biometricMatch: 98.2, frsPhotoUrl: FRS_FACE_URL, cameraId: 'CAM-05' }, location: 'Lab Reception Desk',    verificationMethod: 'Face ID + QR Authentication',        coord: STEP_COORDS[11] },
];

// ── Per-sample timestamps ─────────────────────────────────────────────────────
export const SAMPLE_BASE_TIMES: Record<string, string[]> = {
  'PRNT-8822-X': ['10:02', '10:09', '10:17', '10:24'],
  'PRNT-8820-A': ['09:45', '09:51', '09:58', '10:06', '10:14'],
  'PRNT-8818-B': ['09:10', '09:17', '09:25', '09:33', '09:42', '09:55', '10:03'],
  'PRNT-8815-C': ['11:30', '11:37'],
  'PRNT-8810-D': ['07:15', '07:22', '07:30', '07:38', '07:46', '07:58', '08:11', '08:24', '08:37', '08:45'],
};

export function buildStepEvents(sampleId: string): StepEvent[] {
  const times = SAMPLE_BASE_TIMES[sampleId] ?? [];
  return times.map((time, idx) => ({
    completedAt: `2026-05-16  ${time} UTC`,
    ...STEP_TEMPLATES[idx],
  }));
}

export const STEP_EVENTS: Record<string, StepEvent[]> = Object.fromEntries(
  SAMPLES.map((s) => [s.id, buildStepEvents(s.id)])
);

// ── Child samples (post-division, step index 9+) ──────────────────────────────
export const CHILD_SAMPLES: ChildSample[] = [
  {
    id: 'CHLD-8810-D-A',
    parentId: 'PRNT-8810-D',
    divisionLabel: 'A',
    currentStepIndex: 10, // completed ID Linkage (idx 9) + Lab Dispatch (idx 10), Lab Auth pending
    events: [
      {
        completedAt: '2026-05-16  08:50 UTC',
        operator: { name: 'SYSTEM', role: 'DB Sync Service', badgeId: 'SYS-002', biometricMatch: 100.0 },
        location: 'Central Laboratory DB',
        verificationMethod: 'Relational DB Sync',
        notes: 'Child A linkage to PRNT-8810-D committed.',
        coord: null,
      },
      {
        completedAt: '2026-05-16  09:05 UTC',
        operator: { name: 'S. Reddy', role: 'Lab Analyst', badgeId: 'OPR-956', biometricMatch: 98.2, frsPhotoUrl: FRS_FACE_URL, cameraId: 'CAM-05' },
        location: 'Lab Dispatch Counter',
        verificationMethod: 'QR Scan + Manifest Check',
        coord: { lat: 17.5474, lng: 78.5068 },
      },
    ],
  },
  {
    id: 'CHLD-8810-D-B',
    parentId: 'PRNT-8810-D',
    divisionLabel: 'B',
    currentStepIndex: 9, // completed ID Linkage only (idx 9), Lab Dispatch pending
    events: [
      {
        completedAt: '2026-05-16  08:52 UTC',
        operator: { name: 'SYSTEM', role: 'DB Sync Service', badgeId: 'SYS-002', biometricMatch: 100.0 },
        location: 'Central Laboratory DB',
        verificationMethod: 'Relational DB Sync',
        notes: 'Child B linkage to PRNT-8810-D committed.',
        coord: null,
      },
    ],
  },
];

// ── Route builders (for Map View) ─────────────────────────────────────────────
export function buildParentRoute(sampleId: string): SampleRoute {
  const events = STEP_EVENTS[sampleId] ?? [];
  const pins: SampleRoute['pins'] = [];
  const polyline: Coord[] = [];

  events.forEach((evt, idx) => {
    if (evt.coord) {
      pins.push({ stepNum: idx + 1, coord: evt.coord, status: 'completed', eventRef: evt });
      polyline.push(evt.coord);
    }
  });

  return { sampleId, kind: 'parent', polyline, pins };
}

export function buildChildRoutes(parentId: string): SampleRoute[] {
  return CHILD_SAMPLES.filter((c) => c.parentId === parentId).map((child) => {
    const pins: SampleRoute['pins'] = [];
    const polyline: Coord[] = [];

    child.events.forEach((evt, idx) => {
      if (evt.coord) {
        const stepNum = 9 + idx + 1;
        pins.push({ stepNum, coord: evt.coord, status: 'completed', eventRef: evt });
        polyline.push(evt.coord);
      }
    });

    return { sampleId: child.id, kind: 'child', polyline, pins };
  });
}
