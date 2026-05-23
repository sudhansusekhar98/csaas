/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ViewType =
  | 'dashboard'
  | 'consignments'
  | 'supplier-consignments'
  | 'sample-collection'
  | 'tracking'
  | 'prep-room'
  | 'division-station'
  | 'lab-receiving'
  | 'non-conformance'
  | 'audit'
  | 'report-builder'
  | 'personnel'
  | 'system-health'
  | 'alert-config'
  | 'dispatch-portal';

// ── Feature: QR Reprint Requests ─────────────────────────────────────────────

export type ReprintReason =
  | 'Label damaged'
  | 'Scan failure'
  | 'QR code faded'
  | 'Seal mismatch'
  | 'Lost/misplaced'
  | 'Other';

export type ReprintRequestStatus = 'pending' | 'approved' | 'rejected';

export type QrCodeType = 'parent' | 'child';

export interface ReprintRequest {
  id: string;
  sampleId: string;
  qrType: QrCodeType;
  reason: ReprintReason;
  notes?: string;
  requestedBy: string;
  requestedAt: string;
  status: ReprintRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}

// ── Feature: Dispatch Portal ──────────────────────────────────────────────────

export interface DispatchLocation {
  id: string;
  name: string;
  code: string;
  addressLine: string;
  sequence: number;
}

// ── Feature: Sample Allocation ────────────────────────────────────────────────

export type BagType = 'A' | 'B' | 'R' | 'D' | 'E';

export interface BagAllocation {
  bagType: BagType;
  childIndex: number;            // 0-based; index 0 = always lab-bound
  isLabBound: boolean;           // always true when childIndex === 0; computed, never user-set
  dispatchLocationId?: string;   // set when !isLabBound
}

export interface ViewDef {
  id: ViewType;
  label: string;
  icon: string;
}

// ── Feature 009: Sample Tracking Stepper + Map ────────────────────────────────

export interface Coord {
  lat: number;
  lng: number;
}

export interface OperatorInfo {
  name: string;
  role: string;
  badgeId: string;
  biometricMatch: number;
  frsPhotoUrl?: string;
  cameraId?: string;
}

export interface StepEvent {
  completedAt: string;
  operator: OperatorInfo;
  location: string;
  verificationMethod: string;
  notes?: string;
  coord?: Coord | null;
}

export interface ChildSample {
  id: string;
  parentId: string;
  divisionLabel: string;   // 'LAB' — only lab-bound children are tracked here
  isLabBound: true;        // always true; non-lab children are never in CHILD_SAMPLES
  currentStepIndex: number;
  events: StepEvent[];
}

export interface SampleRoute {
  sampleId: string;
  kind: 'parent' | 'child';
  polyline: Coord[];
  pins: Array<{
    stepNum: number;
    coord: Coord;
    status: 'completed' | 'breach';
    eventRef: StepEvent;
  }>;
}

export type ViewMode = 'stepper' | 'map';
