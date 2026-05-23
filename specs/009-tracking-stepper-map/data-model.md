# Phase 1 Data Model: QR Reprint, Dispatch Portal, Sample Allocation & Lab QR Scan

**Feature**: `009-tracking-stepper-map` (multi-feature batch)
**Date**: 2026-05-20

All state is in-memory React. New TypeScript shapes go into `src/types.ts`; shared state is lifted to `App.tsx`.

---

## New Types (src/types.ts additions)

```typescript
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
  id: string;                        // REQ-{timestamp}
  sampleId: string;                  // PRNT-xxx or SUB-xxx
  qrType: QrCodeType;
  reason: ReprintReason;
  notes?: string;
  requestedBy: string;               // Operator ID/name
  requestedAt: string;               // ISO timestamp
  status: ReprintRequestStatus;
  reviewedBy?: string;               // Admin name if approved/rejected
  reviewedAt?: string;
}

// ── Feature: Dispatch Portal ──────────────────────────────────────────────────

export interface DispatchLocation {
  id: string;                        // LOC-001, LOC-002…
  name: string;                      // e.g. "CIL Central Lab"
  code: string;                      // Short code, e.g. "CCL"
  addressLine: string;               // e.g. "Sector 12, Dhanbad"
  sequence: number;                  // 1 = first child allocation slot
}

// ── Feature: Sample Allocation ────────────────────────────────────────────────

export type BagType = 'A' | 'B' | 'R' | 'D' | 'E';

export interface BagAllocation {
  bagType: BagType;
  childIndex: number;                // 0-based; index 0 = child -01 (always lab-bound)
  isLabBound: boolean;               // true only when childIndex === 0; computed, never user-set
  dispatchLocationId?: string;       // set when !isLabBound; derived from DispatchLocation sequence
}

// Rule: isLabBound is always derived as (childIndex === 0).
// The operator has no dropdown to override this. dispatchLocationId for child -02 onwards
// maps to the Nth DispatchLocation by sequence (childIndex - 1 after skipping the lab slot).
//
// Non-lab children (isLabBound === false) are tracked ONLY through the allocation summary —
// they do not enter the ChildSample tracking model, the stepper panel, or the Lab Receiver queue.
```

## State lifted to App.tsx

```typescript
// Shared reprint request state
const [reprintRequests, setReprintRequests] = useState<ReprintRequest[]>(INITIAL_REPRINT_REQUESTS);

// Shared dispatch locations state
const [dispatchLocations, setDispatchLocations] = useState<DispatchLocation[]>(INITIAL_DISPATCH_LOCATIONS);
```

## Canned Demo Data

```typescript
// src/data/reprintRequests.ts (or inline in App.tsx)
export const INITIAL_REPRINT_REQUESTS: ReprintRequest[] = [
  { id: 'REQ-001', sampleId: 'PRNT-8820-A', qrType: 'parent', reason: 'Label damaged',
    requestedBy: 'OPR-774 (J. Doe)', requestedAt: '2026-05-20T09:14:00Z', status: 'pending' },
  { id: 'REQ-002', sampleId: 'SUB-M-8819-X', qrType: 'child', reason: 'Scan failure',
    requestedBy: 'OPR-312 (R. Kumar)', requestedAt: '2026-05-20T10:02:00Z', status: 'pending' },
  { id: 'REQ-003', sampleId: 'PRNT-8818-B', qrType: 'parent', reason: 'QR code faded',
    requestedBy: 'OPR-881 (M. Patel)', requestedAt: '2026-05-19T15:30:00Z', status: 'approved',
    reviewedBy: 'Admin (USR-001)', reviewedAt: '2026-05-19T16:05:00Z' },
];

// src/data/dispatchLocations.ts (or inline in App.tsx)
export const INITIAL_DISPATCH_LOCATIONS: DispatchLocation[] = [
  { id: 'LOC-001', name: 'CIL Central Lab',      code: 'CCL', addressLine: 'Sector 12, Dhanbad',    sequence: 1 },
  { id: 'LOC-002', name: 'CIMFR Testing Centre', code: 'CTC', addressLine: 'Barwa Road, Dhanbad',    sequence: 2 },
  { id: 'LOC-003', name: 'State Quality Lab',    code: 'SQL', addressLine: 'Park Road, Ranchi',      sequence: 3 },
];
```

## State Transitions

### ReprintRequest
```
(raised by operator) → pending
pending → approved  (by admin)
pending → rejected  (by admin)
approved → (print button re-enabled in originating view)
```

### DispatchLocation sequence
```
sequence defines child bag assignment:
  seq 1 → bag A (or lab-bound bag — skip if allocated to lab)
  seq 2 → bag B
  seq 3 → bag R
  …
```

---

## APPENDIX — Previous: Sample Tracking Stepper + Map Data Model (2026-05-19)

The prototype has no backing database; "the model" is a set of TypeScript shapes and the canned mock arrays that conform to them. New shapes go into `src/types.ts`; new and modified canned data lives in `src/data/sample-tracking-mock.ts`.

## Entities

### Coord (NEW)

```ts
interface Coord {
  lat: number;   // -90 .. 90
  lng: number;   // -180 .. 180
}
```

Validation: both numeric, finite. `null` is allowed at the field level on a `StepEvent` to indicate "no GPS recorded" (system/auto steps, or missing-data edge case).

### StepEvent (MODIFIED)

```ts
interface StepEvent {
  completedAt: string;     // existing
  operator: OperatorInfo;  // existing
  location: string;        // existing
  verificationMethod: string;
  notes?: string;
  coord?: Coord | null;    // NEW — GPS at scan time; null for system/auto steps
}
```

Validation rules:

- `coord` MUST be present on every operator-driven step event (steps 1, 2, 3, 5, 6, 7, 8, 9, 11, 12 — i.e., all human-operator templates).
- `coord` MAY be `null` for the two SYSTEM steps (4 — Parent ID Issuance, 10 — ID Linkage).
- Pins for events with `coord === null` are omitted from the map and counted into the "N steps without GPS coordinates" legend entry (FR-013).

### SampleOption (EXISTING — unchanged shape)

```ts
interface SampleOption {
  id: string;              // parent ID, e.g. 'PRNT-8810-D'
  sealId: string;
  currentStepIndex: number;
}
```

### ChildSample (NEW — lab-bound child only)

> **Scope**: `ChildSample` records exist in the tracking system **only for the lab-bound child** (the `-01` child, `isLabBound: true`). Non-lab children are recorded in `BagAllocation` for the dispatch summary but are **never entered into `CHILD_SAMPLES`** and never appear in the stepper, map, or Lab Receiver.

```ts
interface ChildSample {
  id: string;                 // e.g. 'CHLD-8810-D-01' (always the -01 suffix)
  parentId: string;           // foreign key → SampleOption.id
  divisionLabel: string;      // 'LAB' badge — only one child is tracked per parent
  isLabBound: true;           // always true; non-lab children are not ChildSample records
  currentStepIndex: number;   // 9..11 (zero-based; 9 = ID Linkage = step 10 in 1-based UI)
  events: StepEvent[];        // events for steps 10..12 (indices 9..11); pre-division inherited from parent
}
```

Validation rules:

- `currentStepIndex >= 9` always (children exist only post Step 9 — Division Logic).
- `currentStepIndex <= 11`.
- `parentId` MUST exist in `SAMPLES`.
- **At most one** `ChildSample` record per `parentId` — the `-01` lab child. Attempting to add a second is a data error.
- `events.length === currentStepIndex - 9` (one event per completed post-division step).
- Each child's pre-division (`stepIdx < 9`) events are read from the parent at render time; never duplicated in storage.

### Sample (DERIVED — view-only union)

```ts
type Sample =
  | { kind: 'parent'; parent: SampleOption }
  | { kind: 'child';  parent: SampleOption; child: ChildSample };
```

Used internally by `SampleTrackingView` when computing the active route and the active step events list. Not persisted.

### ProcessStepNode (DERIVED — render-only)

```ts
interface ProcessStepNode {
  id: number;                 // 1..12
  title: string;
  desc: string;
  icon: LucideIcon;
  status: 'completed' | 'current' | 'pending' | 'breach';
  // snake layout placement
  row: number;                // 0-based row index
  col: number;                // 0-based column within row
  direction: 'ltr' | 'rtl';   // row direction
  isRowEnd: boolean;          // last node in its row (used by connector arcs)
}
```

Computed by `SnakeStepper` from `STEP_DEFINITIONS`, the effective `currentStepIndex`, and the responsive `stepsPerRow`.

### SampleRoute (DERIVED — Map View)

```ts
interface SampleRoute {
  sampleId: string;
  kind: 'parent' | 'child';
  polyline: Coord[];          // ordered, chronological, only steps with coord !== null
  pins: Array<{
    stepNum: number;          // 1..12
    coord: Coord;
    status: 'completed' | 'breach';
    eventRef: StepEvent;      // for popup reuse
  }>;
}
```

Validation: `polyline` order MUST match `pins[*].stepNum` ascending. Polyline may be empty (legend reports "No GPS data for this sample").

### ViewMode (NEW)

```ts
type ViewMode = 'stepper' | 'map';
```

## State transitions

### Parent sample step progression (EXISTING — unchanged)

`pending → current → completed`, advanced by the existing `advanceStep()` flow following a successful seal scan.

### Child sample step progression (NEW)

```
created (at parent step 9)
   → ID Linkage pending → current → completed
   → Lab Dispatch pending → current → completed
   → Lab Authentication pending → current → completed (terminal)
```

Each transition is driven by a child-specific scan event; v1 ships static (no `advanceChildStep` action — child step states are read from the canned mock data). Wire-up to scan flow is out of scope here and tracked separately under spec 007.

### View mode transition

```
stepper ⇄ map  (toggled by header segmented control; preserves selected sample, child, popup)
```

## Relationships

```
SampleOption (parent) 1 ──< ChildSample (0..n; only if currentStepIndex >= 9)
SampleOption  1 ──< StepEvent  (n = currentStepIndex events, indices 0..currentStepIndex-1)
ChildSample   1 ──< StepEvent  (n = currentStepIndex - 9 events, post-division only)
StepEvent     1 ── 0..1  Coord (null for SYSTEM steps)
```

## Canned data deltas (`src/data/sample-tracking-mock.ts`)

- All 12 entries in `STEP_TEMPLATES` gain `coord` (10 with values, 2 SYSTEM entries with `null`).
- New `CHILD_SAMPLES: ChildSample[]` array — **exactly one** lab-bound child (`-01`) per parent whose `currentStepIndex >= 9`:
  - `PRNT-8818-B` (parent step 9) → `CHLD-8818-B-01` at step 10 (ID Linkage complete)
  - `PRNT-8810-D` (parent step 11) → `CHLD-8810-D-01` at step 12 (at Lab Authentication)
  - `PRNT-8820-A` (parent step 6) → no child yet (pre-division)
- Non-lab children (`-02`, `-03`) exist only as `BagAllocation` entries inside `SplittingStationView` session state; they are **never** added to `CHILD_SAMPLES`.
- Existing `SAMPLES` array and `SAMPLE_BASE_TIMES` left intact.
