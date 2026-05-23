# Implementation Plan: Location Assignment Integration, Child Nomenclature & Reprint in Tracking

**Branch**: `009-tracking-stepper-map` | **Date**: 2026-05-22 | **Spec**: [spec.md](spec.md)

**Input**: User request — three targeted changes to `SplittingStationView` and `ChildSamplePanel`:
1. Move location/dispatch assignment into the same panel where weight and responsible persons are selected (no separate card below the grid).
2. Update child sample bag labels to include the parent sample ID.
3. Add QR reprint request functionality to the Child Samples panel in Sample Tracking (same `ReprintRequestModal` flow already live in Sample Collection and Division Station).

---

## Summary

All three changes are scoped to existing components. No new views, routes, or data shapes are required. The reprint wiring for `SampleTrackingView` follows the identical prop-drilling pattern already used by `SampleCollectionView` and `SplittingStationView`.

---

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 (Vite)

**Primary Dependencies**: `motion/react`, `lucide-react`, Tailwind CSS (existing)

**Storage**: In-memory React state; `reprintRequests` lifted to `App.tsx`

**Testing**: Manual browser verification (prototype — no unit test suite)

**Target Platform**: Desktop browser, 1440×900 primary viewport

**Project Type**: Web application (single-page prototype)

**Performance Goals**: View transitions < 400 ms (SC-003, existing)

**Constraints**: No new views, no new npm packages, no new `ViewType` values

**Scale/Scope**: 4 files modified, 1 prop interface extended, 0 new files

---

## Constitution Check

The project constitution file is the blank template — no project-specific gates are defined. No violations to report.

---

## Project Structure

### Documentation (this feature)

```text
specs/009-tracking-stepper-map/
├── plan.md              # This file
├── research.md          # Updated with findings for this batch
├── data-model.md        # Unchanged — no new TypeScript shapes needed
├── quickstart.md        # Updated with new test flows
├── contracts/
│   └── screen-contract.md   # Updated with new panel layout
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (files changed)

```text
src/
├── App.tsx                                      # Pass reprintRequests/setReprintRequests into SampleTrackingView
├── components/
│   ├── SplittingStationView.tsx                 # Changes A1 (location in-panel) + A2 (nomenclature)
│   └── sample-tracking/
│       └── ChildSamplePanel.tsx                 # Change B1 (reprint buttons)
└── (SampleTrackingView.tsx — prop thread only)  # Change B2 (thread reprint props)
```

---

## Change Set A — SplittingStationView

### A1: Location Assignment Moved Inside SmallBaggingPanel

**Current behaviour**: After all bags are sealed, an `AllocationCard` appears as a `col-span-12` card *below* the 12-column grid (outside `SmallBaggingPanel`). The "Finalise Division Session" button is inside `SmallBaggingPanel`, so the operator must seal → scroll down → confirm dispatch → scroll back up → finalise — a fragmented flow.

**Target behaviour**: The `AllocationCard` renders *inside* `SmallBaggingPanel`, replacing the "Finalise Division Session" button until dispatch is confirmed. After the operator clicks "Confirm Dispatch", the allocation summary appears and the "Finalise" button becomes available — all within the same right-column panel. The `col-span-12` card below the grid is removed entirely.

**Implementation**:

1. Add props to `SmallBaggingPanelProps`:
   ```ts
   dispatchLocations: DispatchLocation[];
   confirmedAllocation: BagAllocation[] | null;
   onConfirmAllocation: (allocs: BagAllocation[]) => void;
   ```

2. Inside `SmallBaggingPanel`, when `allSealed && activeStatus !== 'COMPLETED'`:
   - If `confirmedAllocation === null` → render `<AllocationCard>` (with the passed `dispatchLocations` and `parentId`-aware labels).
   - If `confirmedAllocation !== null` → render a compact read-only allocation summary + the "Finalise Division Session" button.

3. Remove the external `col-span-12` block in `SplittingStationView` (lines ~597–628 in current file).

4. Pass `bagAllocations[selectedSession.id]` and `setBagAllocations` callback down as the new props.

5. `AllocationCard` also needs `parentId` to build the new nomenclature (see A2).

**Key invariant**: The `allBagsSealed` guard remains unchanged — allocation only appears when every active bag type has `sealed: true`.

---

### A2: Child Sample Nomenclature Includes Parent ID

**Current behaviour**: Bag labels are generic — "Sample A", "Sample B", "Referee", "Sample D", "Sample E" (from `BAG_LABEL_SEQUENCE`). The allocation summary shows "Sample -01 (Bag A)", "Sample -02 (Bag B)".

**Target behaviour**: Labels include the parent sample ID so the child's lineage is immediately readable:
- Bag type `A` of parent `PRNT-8822-X` → label **`PRNT-8822-X-A`**
- Bag type `B` → **`PRNT-8822-X-B`**
- Bag type `R` → **`PRNT-8822-X-R`**
- etc.

**Implementation**:

```ts
// Replace BAG_LABEL_SEQUENCE usage wherever a label is displayed
function childLabel(parentId: string, bagType: BagType): string {
  return `${parentId}-${bagType}`;
}
```

Apply in:
- `SmallBaggingPanel` bag cards (the `bagLabel` variable, currently `BAG_LABEL_SEQUENCE[idx]`)
- `AllocationCard` rows ("Sample -01 (Bag A)" → `PRNT-8822-X-A`)
- Completed session bag list in `SmallBaggingPanel`
- The session list table column "Splits" tooltip (minor — currently just shows bag count, no label change needed)

The `BAG_LABEL_SEQUENCE` constant can be kept for the seal-verified overlay tooltip (`'Sample A, Sample B, …'` listed under the child count input) since that overlay doesn't have the parentId in context — or pass `parentId` in if the overlay is open while a session is selected (it is: `selectedSession` is available). Both options are acceptable; passing `parentId` is preferred for consistency.

---

## Change Set B — QR Reprint in Child Samples Panel (Sample Tracking)

### B1: Reprint Buttons in ChildSamplePanel

**Current behaviour**: `ChildSamplePanel` shows each lab-bound child sample row with division badge, ID, current step name, and three step-pip indicators. No reprint affordance exists.

**Target behaviour**: Each child row gains a "Request Reprint" / "Reprint Pending" / "Reprint Approved" control identical in pattern to the one already in `SplittingStationView`'s `SmallBaggingPanel` (lines ~950–962).

**New props for `ChildSamplePanel`**:
```ts
onRequestReprint: (sampleId: string) => void;
approvedReprintIds: Set<string>;
pendingReprintIds: Set<string>;
```

Each child `<li>` row adds (below the step pips):
```tsx
{pendingReprintIds.has(child.id)
  ? <span …>Reprint Pending</span>
  : approvedReprintIds.has(child.id)
  ? <span …>Reprint Approved — Print Now</span>
  : <button onClick={() => onRequestReprint(child.id)} …>Request Reprint</button>
}
```

### B2: Thread Reprint Props Through SampleTrackingView

`SampleTrackingView` currently receives no reprint props (App.tsx line 82: `<SampleTrackingView onNavigate={setActiveView} />`).

**App.tsx change**:
```tsx
case 'tracking':
  return <SampleTrackingView
    onNavigate={setActiveView}
    reprintRequests={reprintRequests}
    setReprintRequests={setReprintRequests}
  />;
```

**SampleTrackingView** adds:
```ts
interface SampleTrackingViewProps {
  onNavigate: (view: ViewType) => void;
  reprintRequests: ReprintRequest[];
  setReprintRequests: React.Dispatch<React.SetStateAction<ReprintRequest[]>>;
}
```

Inside `SampleTrackingView`, derive the same sets used elsewhere:
```ts
const approvedReprintIds = new Set(reprintRequests.filter(r => r.status === 'approved').map(r => r.sampleId));
const pendingReprintIds  = new Set(reprintRequests.filter(r => r.status === 'pending').map(r => r.sampleId));
```

Add `reprintModalSampleId: string | null` state. Pass `onRequestReprint`, `approvedReprintIds`, `pendingReprintIds` into `ChildSamplePanel`. Render `<ReprintRequestModal>` when `reprintModalSampleId !== null`, with `qrType="child"` and the active operator from the selected sample's most recent event.

---

## Implementation Order

1. **A2 first** — `childLabel()` helper is pure and affects how labels render in A1's new `AllocationCard` placement. Define it once, import everywhere.
2. **A1** — Move `AllocationCard` inside `SmallBaggingPanel`; update prop interface; remove external card.
3. **B1** — Extend `ChildSamplePanel` props and add reprint controls to each row.
4. **B2** — Thread `reprintRequests` / `setReprintRequests` into `SampleTrackingView` → `ChildSamplePanel`; add modal.

No migrations, no DB changes, no new npm packages.

---

## Complexity Tracking

No constitution violations. No new complexity to justify.
