# Phase 1 Data Model: Sample Tracking — Snake Stepper, Child Visibility & GPS Map View

**Feature**: `009-tracking-stepper-map`
**Date**: 2026-05-19

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

### ChildSample (NEW)

```ts
interface ChildSample {
  id: string;                 // e.g. 'CHLD-8810-D-A'
  parentId: string;           // foreign key → SampleOption.id
  divisionLabel: string;      // 'A' | 'B' | 'C' — visual badge in child row
  currentStepIndex: number;   // 9..11 (zero-based; 9 = ID Linkage = step 10 in 1-based UI)
  events: StepEvent[];        // events for steps 10..12 (indices 9..11); pre-division inherited from parent
}
```

Validation rules:

- `currentStepIndex >= 9` always (children exist only post Step 9 — Division Logic).
- `currentStepIndex <= 11`.
- `parentId` MUST exist in `SAMPLES`.
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
- New `CHILD_SAMPLES: ChildSample[]` array — at least 2 children per parent whose `currentStepIndex >= 9` (`PRNT-8818-B` at parent step 8 → children at step 10 max; `PRNT-8810-D` at parent step 11 → children at steps 11–12; `PRNT-8820-A` at parent step 6 → no children yet).
- Existing `SAMPLES` array and `SAMPLE_BASE_TIMES` left intact.
