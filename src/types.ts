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
  | 'alert-config';

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
  divisionLabel: string;
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
