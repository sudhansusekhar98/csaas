# Screen Contract: QR Reprint, Dispatch Portal, Sample Allocation & Lab QR Scan

**Feature**: `009-tracking-stepper-map` (multi-feature batch)
**Date**: 2026-05-20

---

## Contract A: QR Code Reprint Request Modal

**Trigger surfaces**: `SampleCollectionView` (parent QR cards), `SplittingStationView` (child bag seal cards), `ChildSamplePanel` in `SampleTrackingView` (child sample rows)

```
┌─────────────────────────────────────────┐
│ Request QR Reprint                    ✕ │
│ Sample ID: PRNT-8820-A (Parent QR)      │
├─────────────────────────────────────────┤
│ Reason *                                │
│ [dropdown: Label damaged ▼]             │
│                                         │
│ Additional Notes (optional)             │
│ [textarea]                              │
│                                         │
│ [Cancel]          [Submit Request]      │
└─────────────────────────────────────────┘
```

| Interaction | Precondition | Result |
|---|---|---|
| Click "Request Reprint" on any QR card | Any | Modal opens pre-filled with sampleId |
| Select reason + submit | Reason selected | Request added with `status: 'pending'`; modal closes; admin badge increments |
| Admin approves request | Admin is on Personnel/Reprint tab | `status → 'approved'`; Print button re-enabled in originating view |
| Admin rejects request | Admin is on Personnel/Reprint tab | `status → 'rejected'`; Print button stays disabled |

---

## Contract B: Administrator Dispatch Portal

**Surface**: `DispatchPortalView` (`ViewType: 'dispatch-portal'`)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Dispatch Portal                                                      │
│ Manage dispatch locations and child sample sequence assignments      │
├────────────────────────┬─────────────────────────────────────────────┤
│ DISPATCH LOCATIONS     │ ADD LOCATION                                │
│ (sorted by sequence)   │ Name: [_____________]                       │
│                        │ Code: [____] Address: [________________]    │
│ 1. CIL Central Lab     │ [Add Location]                              │
│    CCL · Dhanbad       │                                             │
│    [↑][↓][Remove]      ├─────────────────────────────────────────────┤
│                        │ SEQUENCE → BAG TYPE ASSIGNMENT              │
│ 2. CIMFR Testing       │                                             │
│    CTC · Dhanbad       │ Seq 1: CIL Central Lab  → [Lab bound / A]  │
│    [↑][↓][Remove]      │ Seq 2: CIMFR Testing    → Bag B            │
│                        │ Seq 3: State Quality Lab → Bag R            │
│ 3. State Quality Lab   │                                             │
│    SQL · Ranchi         │                                             │
│    [↑][↓][Remove]      │                                             │
└────────────────────────┴─────────────────────────────────────────────┘
```

| Interaction | Result |
|---|---|
| Add location with name/code/address | New `DispatchLocation` appended with next sequence number |
| Click ↑/↓ on a location | Swaps sequence numbers with neighbour; table re-sorts |
| Click Remove | Location removed; remaining sequences renumbered |

---

## Contract C: Sample Allocation (SplittingStationView — updated 2026-05-22)

**When shown**: After all bags are sealed (`allBagsSealed === true`), the `AllocationCard` renders **inside `SmallBaggingPanel`** (right column), replacing the "Finalise Division Session" button. After the operator confirms, a compact read-only summary + "Finalise" button appear in the same panel.

The external `col-span-12` card below the grid is **removed** — no scrolling required.

```
SmallBaggingPanel (right column, col-span-5)
┌──────────────────────────────────────────────┐
│  02  Small Bagging             All Bags Sealed│
│                                              │
│  [Bag cards — sealed, read-only]             │
│                                              │
│  SAMPLE ALLOCATION                           │
│  Assignments are automatic.                  │
│                                              │
│  ● PRNT-8822-X-A  → LAB DISPATCH [LAB]      │
│    PRNT-8822-X-B  → CIL Central Lab (CCL)   │
│    PRNT-8822-X-R  → CIMFR Testing (CTC)     │
│    (non-lab: not tracked beyond dispatch)    │
│                                              │
│  [Confirm Dispatch]                          │
│                                              │
│  ─ (after confirm) ──────────────────────── │
│  [Finalise Division Session]                 │
└──────────────────────────────────────────────┘
```

Child sample label format: `{parentId}-{bagType}` (e.g., `PRNT-8822-X-A`, `PRNT-8822-X-B`).

| Interaction | Result |
|---|---|
| All bags sealed | `AllocationCard` renders inline in `SmallBaggingPanel` (no col-12 card) |
| Card renders | Labels show `{parentId}-{bagType}`; lab-bound row has indigo badge; dispatch rows show location name; no editable fields |
| Confirm Dispatch | Compact summary + "Finalise Division Session" button appear in same panel |
| Finalise | Session status → `COMPLETED` |

**Key rule**: `isLabBound` is always `true` for child index 0. Non-lab children never appear in the stepper Child Samples panel, the GPS map, or the Lab Receiver queue.

---

## Contract D: Lab Receiver QR Scan Widget (LabReceivingView — updated)

**Replaces**: "Awaiting scanner input" dashed placeholder in Batch Verification card

```
┌────────────────────────────────────┐
│ SCAN SUB-SAMPLE QR CODE            │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  ▓▓▓  ░▓░▓  ░░  ▓▓▓░░▓▓▓  │  │
│  │  (21×21 SVG QR-like grid)   │  │
│  │  SUB-M-8820-A               │  │
│  └──────────────────────────────┘  │
│                                    │
│  [Simulate Scan]                   │
│  (enabled when pending item        │
│   is selected)                     │
└────────────────────────────────────┘
```

| Interaction | Precondition | Result |
|---|---|---|
| Select a `pending` row | Any | QR widget shows that item's ID pattern |
| Click "Simulate Scan" | `pending` item selected | 600ms ring animation → auto-fills form → calls confirm receipt |
| No item selected | — | QR widget shows placeholder pattern; Simulate Scan disabled |

---

## Contract E: Admin Reprint Requests Panel (PersonnelManagementView tab)

**New tab**: "Reprint Requests" tab added to `PersonnelManagementView` alongside existing operator list.

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Registry] [Sample Activity] [Reprint Requests (2)]                 │
├─────────────────────────────────────────────────────────────────────┤
│ Sample ID     | Type   | Reason          | Operator    | Status     │
│ PRNT-8820-A   | Parent | Label damaged   | OPR-774     | [Pending]  │
│                                          [Approve] [Reject]         │
│ SUB-M-8819-X  | Child  | Scan failure    | OPR-312     | [Pending]  │
│                                          [Approve] [Reject]         │
│ PRNT-8818-B   | Parent | QR code faded   | OPR-881     | Approved ✓ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## APPENDIX — Previous: Lab Receiving Screen Contract (2026-05-20)

**Surface**: `src/components/LabReceivingView.tsx` (`LabReceivingView` exported component, route key `"lab-receiving"`)

---

## Lab Receiving Screen Contract

### 1. Page anatomy (post-change)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header                                                              │
│   "Lab Receiving & Authentication"          [Confirm Receipt (gated)]│
├──────────────────────────────────────────────────────────────────────┤
│ Stat chips row                                                      │
│   [Samples in Transit: N]  [Received Today: N]  [Flagged: N]       │
├─────────────────────────┬───────────────────────────────────────────┤
│ LEFT COLUMN (col-span-4)│ RIGHT COLUMN (col-span-8)                │
│                         │                                           │
│ [Selected Item Card]    │ Table: Pending Receipts                  │
│   (visible when row     │   Sub-Sample ID | Parent ID | Weight |   │
│    selected)            │   Status | Action                        │
│   - Child Sample ID     │                                           │
│   - Parent ID           │   Row states:                            │
│   - Division Label      │   pending → [Receive] button             │
│   - Weight              │   alert   → [Resolve] button             │
│   - Seal status         │   received→ [Mark Completed] button      │
│   [Mark Completed]      │   completed→ (no action)                 │
│   (shown if received)   │                                           │
│                         │                                           │
│ [Batch Verification]    │                                           │
│   Scan input            │                                           │
│   Receipt Record form   │                                           │
│   [Confirm Receipt]     │                                           │
│                         │                                           │
│ [Quick Actions]         │                                           │
└─────────────────────────┴───────────────────────────────────────────┘
```

### 2. State transitions

```
PendingItem.type:

pending ──[click Receive + fill form + Confirm Receipt]──► received
received ──[click Mark Completed in detail card]──────────► completed
alert ──[click Resolve]──────────────────────────────────► (NCR modal, out of scope)
```

### 3. Interaction contracts

| Interaction | Precondition | Result |
|---|---|---|
| Click "Receive" button on a `pending` row | Any | Row selected; left panel scrolls to detail card; Receipt Record form is scoped to this item |
| Fill receiver + acceptance + visual condition, click "Confirm Receipt" | `canConfirm === true` AND `selectedItemId !== null` | Selected item promoted to `received`; form reset; success banner shown; stat chips update |
| Click "Mark Completed" in detail card | Selected item `type === 'received'` | Selected item promoted to `completed`; success banner shown |
| Click a different row while one is selected | Any | Detail card updates to new row; form values reset |
| Click "Confirm Receipt" with no row selected | — | Button disabled; no action |
| Stat chip "Received Today" | — | Counts `type === 'received' || type === 'completed'` |
| Stat chip "Samples in Transit" | — | Counts `type === 'pending'` only |

### 4. Visual states per row

| type | Row background | Status chip | Action button |
|---|---|---|---|
| `pending` | white | slate "In Transit" | indigo "Receive" |
| `alert` | amber-50/50 | amber "Flagged" | amber "Resolve" text |
| `received` | emerald-50/30 | emerald "Received" | emerald "Mark Completed" |
| `completed` | white | emerald "Completed" | — |

---

## APPENDIX — Previous: Sample Tracking Screen Contract

**Surface**: `src/components/SampleTrackingView.tsx` (`SampleTrackingView` exported component, route key `"sample-tracking"`)

This contract defines the externally observable UI behaviour. It is the acceptance surface for `/speckit-tasks` and the manual demo run in `quickstart.md`.

## 1. Page anatomy (post-change)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Sticky header                                                        │
│   Title · subtitle    [Scan Next Phase] [Stepper | Map] [Active Sample│
│                                                          dropdown]   │
├──────────────────────────────────────────────────────────────────────┤
│ Main canvas (mode-switched)                                          │
│                                                                      │
│   Mode = STEPPER:                                                    │
│     ┌──────────────────────────────────────────┐ ┌────────────────┐  │
│     │ Snake stepper (cols 1–8 on lg)           │ │ Right column    │ │
│     │  Row 0 → 1 → 2 → 3 → 4 → 5 → 6 ┐         │ │ (existing       │ │
│     │  Row 1 ← 7 ← 8 ← 9 ← 10 ← 11 ← 12        │ │  biometric +    │ │
│     └──────────────────────────────────────────┘ │  custody cards) │ │
│     ┌──────────────────────────────────────────┐ └────────────────┘  │
│     │ Child Samples panel (only if parent      │                     │
│     │ currentStepIndex >= 9)                   │                     │
│     └──────────────────────────────────────────┘                     │
│                                                                      │
│   Mode = MAP:                                                        │
│     ┌──────────────────────────────────────────┐ ┌────────────────┐  │
│     │ Leaflet map (cols 1–8)                   │ │ Right column    │ │
│     │  Pins + parent route + child routes      │ │ (same as above) │ │
│     │  Legend panel                            │ │                 │ │
│     └──────────────────────────────────────────┘ └────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

## 2. Component contracts

### 2.1 `SnakeStepper` (new)

**Props**:

```ts
interface SnakeStepperProps {
  steps: ProcessStepNode[];                 // already laid out (row/col/direction set)
  onStepClick: (stepIdx: number) => void;
  highlightRange?: { from: number; to: number } | null;   // child scoping: dim outside this range
}
```

**Behaviour**:

- Renders a CSS Grid with `stepsPerRow` derived from container width (6 / 4 / 3 / 1).
- Odd rows render right-to-left.
- Row-end connector arcs render in an absolute SVG overlay, coloured by the lesser-progressed of the two joined steps.
- Each node is a `<button>` with `aria-current="step"` when status is `current`, `aria-disabled` when `pending`.
- Clicking a `completed` (or `breach`) node calls `onStepClick(stepIdx)`. Pending nodes are non-interactive.
- When `highlightRange` is set, nodes outside `[from..to]` get `opacity-50` and `pointer-events-none`.

### 2.2 `ChildSamplePanel` (new)

**Props**:

```ts
interface ChildSamplePanelProps {
  parentId: string;
  children: ChildSample[];                  // already filtered for this parent
  activeChildId: string | null;
  onSelectChild: (childId: string | null) => void;  // null = back to parent scope
}
```

**Behaviour**:

- Rendered only when `parent.currentStepIndex >= 9` and the lab-bound child (`isLabBound: true`) exists.
- Shows **exactly one row** — the `-01` lab-bound child. Non-lab children are never shown here.
- The row shows: child ID (mono, e.g. `CHLD-8810-D-01`), a "LAB" badge (indigo), current step name, and three compact pip indicators for steps 10/11/12 (filled emerald when completed, indigo pulse when current, slate-100 outline when pending).
- Selecting the row sets `activeChildId`; clicking again deselects (returns to parent scope).
- Empty state (parent past step 9 but dispatch not yet confirmed): info card "Lab sample not yet dispatched."

### 2.3 `SampleMapView` (new)

**Props**:

```ts
interface SampleMapViewProps {
  parentRoute: SampleRoute;
  childRoutes: SampleRoute[];
  onPinClick: (sampleId: string, stepIdx: number) => void;
}
```

**Behaviour**:

- Renders a `<MapContainer>` at fixed height `h-[520px]`, centered on the parent route's centroid; default zoom level chosen to fit all pins (auto-fit on mount and on parent-route change).
- Parent route: indigo polyline + indigo numbered pins.
- Child routes: each in a distinct hue (emerald, amber, violet rotating).
- Pins for `breach`-status events are red regardless of route colour.
- Clicking a pin calls `onPinClick(sampleId, stepIdx)` which triggers the same popup the stepper uses.
- Legend (bottom-left absolute card): pin status colours, parent/child route colours, "N steps without GPS coordinates" count.
- On view-mode toggle FROM map, the `<MapContainer>` is hidden via `display: none` (not unmounted) so tiles stay warm. `map.invalidateSize()` is called when toggling back.

### 2.4 `SampleTrackingView` (modified)

**New state**:

```ts
const [viewMode, setViewMode]       = useState<ViewMode>('stepper');
const [activeChildId, setActiveChildId] = useState<string | null>(null);
```

**Header segmented control**:

- Two buttons "Stepper" / "Map" with label-caps styling, primary-indigo background on the active button, slate-100 on the inactive.
- Sits between "Scan Next Phase" and the active-sample card.

**Sample dropdown change** must reset `activeChildId` to `null` (a different parent has different children).

## 3. Step detail popup contract (UNCHANGED interface)

The existing popup (`activeStep` state + the conditional `<AnimatePresence>` block) keeps its current shape. New behaviour:

- When a child is active and the clicked step is `>= 9`, the popup pulls the step event from `child.events[stepIdx - 9]` (with step 9 itself pulled from the parent's Division Logic event).
- Otherwise it pulls from the parent's `STEP_EVENTS[selectedSampleId][stepIdx]` as today.
- The popup gains a small "Sample: PRNT-… / CHLD-…" identifier in the existing footer-context row (already present, just data-driven).

## 4. Routing / navigation contract

No new routes. The view-mode toggle is in-page state. `ProcessBreadcrumb` (current step prop `currentStep={2}`) is unchanged.

## 5. External dependencies introduced

- `react-leaflet@^4.2`
- `leaflet@^1.9`
- `@types/leaflet@^1.9` (dev dep)
- `leaflet/dist/leaflet.css` imported once in `src/main.tsx`.

## 6. Demo data contract

- `STEP_TEMPLATES` array gains `coord` field as defined in `data-model.md`.
- A new `CHILD_SAMPLES` array is exported from `src/data/sample-tracking-mock.ts`.
- All existing exports remain (no breaking renames).

## 7. Accessibility contract

- All interactive elements reachable by keyboard (Tab through stepper nodes, child rows, map pins).
- `aria-current="step"` on the current stepper node.
- Map pins carry a descriptive `title` attribute.
- Connector arcs and decorative SVGs are `aria-hidden="true"`.
