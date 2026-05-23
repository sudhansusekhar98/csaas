# Tasks: Location Assignment Integration, Child Nomenclature & Reprint in Tracking

**Feature branch**: `009-tracking-stepper-map`
**Input**: `specs/009-tracking-stepper-map/plan.md`, `spec.md`, `research.md`, `contracts/screen-contract.md`, `quickstart.md`
**No tests requested** — prototype; manual verification via `quickstart.md`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no cross-task dependency)
- **[US1]**: SplittingStationView — location in-panel + child nomenclature
- **[US2]**: ChildSamplePanel — QR reprint request flow

---

## Phase 1: Foundation (blocking prerequisite)

**Purpose**: Define the `childLabel()` helper used by both US1 changes before modifying any render sites.

- [x] T001 Add `childLabel(parentId: string, bagType: BagType): string` pure function inside `src/components/SplittingStationView.tsx`, returning `${parentId}-${bagType}` (e.g. `PRNT-8822-X-A`). Place it near the existing `bagSealId` helper at the top of the file. No other changes.

**Checkpoint**: `childLabel('PRNT-8822-X', 'A')` returns `'PRNT-8822-X-A'`.

---

## Phase 2: User Story 1 — SplittingStationView changes (P1)

**Goal**: (A1) `AllocationCard` moves inside `SmallBaggingPanel` so the operator never has to scroll; (A2) all child bag labels include the parent sample ID.

**Independent Test** (quickstart.md §3): Open DIV-8822-X in Division Station → seal all bags → verify the Sample Allocation section appears in the right panel with labels `PRNT-8822-X-A / B / R` → confirm dispatch → see Finalise button in same panel → finalise → session COMPLETED.

### A2 — Nomenclature (runs first; other tasks depend on childLabel)

- [x] T002 [US1] In `SmallBaggingPanel` in `src/components/SplittingStationView.tsx`: add `parentId: string` to `SmallBaggingPanelProps`. Replace the `const bagLabel = BAG_LABEL_SEQUENCE[idx]` assignment inside the `activeBagTypes.map()` call (line ~928) with `const bagLabel = childLabel(parentId, type)`. Apply the same replacement in the COMPLETED bag list (the second `.map()` over `activeBagTypes` at line ~1020).

- [x] T003 [US1] In `AllocationCard` in `src/components/SplittingStationView.tsx`: add `parentId: string` to `AllocationCardProps`. Replace `Sample -{String(a.childIndex + 1).padStart(2, '0')} (Bag {labBag.bagType})` with `childLabel(parentId, labBag.bagType)` in the lab-bound row. Replace `Sample -{String(a.childIndex + 1).padStart(2, '0')} (Bag {a.bagType})` with `childLabel(parentId, a.bagType)` in the dispatch rows.

- [x] T004 [US1] In the seal-verified overlay inside `src/components/SplittingStationView.tsx` (the `sealScanPhase === 'verified'` block): replace `BAG_LABEL_SEQUENCE.slice(0, pendingChildCount).join(', ')` with `BAG_TYPE_SEQUENCE.slice(0, pendingChildCount).map(t => childLabel(selectedSession?.parentId ?? '', t)).join(', ')`. This ensures the child count tooltip also shows parent-qualified labels.

### A1 — Move AllocationCard inside SmallBaggingPanel

- [x] T005 [US1] Extend `SmallBaggingPanelProps` in `src/components/SplittingStationView.tsx` with three new fields:
  ```ts
  dispatchLocations: DispatchLocation[];
  confirmedAllocation: BagAllocation[] | null;
  onConfirmAllocation: (allocs: BagAllocation[]) => void;
  ```
  Add these to the destructured parameters of `SmallBaggingPanel`.

- [x] T006 [US1] Inside `SmallBaggingPanel` in the `IN_PROGRESS && pulvMarked` branch of `src/components/SplittingStationView.tsx`: after the existing `{!allSealed && <button>Seal All Child Bags</button>}` block, add a new conditional block that shows `<AllocationCard>` when `allSealed && !confirmedAllocation`, and shows a read-only allocation summary + "Finalise Division Session" button when `allSealed && confirmedAllocation`. Remove the existing standalone "Finalise Division Session" button from this branch (it now only appears after allocation is confirmed).

  The read-only summary mirrors the existing AllocationCard confirmed view: for each allocation, show `childLabel(parentId, a.bagType)` on the left and the dispatch label (Lab or location name) on the right, using the same indigo/slate styling as the external card did.

- [x] T007 [US1] In the `SplittingStationView` session-detail section of `src/components/SplittingStationView.tsx`: update the `<SmallBaggingPanel>` call site to pass the four new props:
  ```tsx
  parentId={selectedSession.parentId}
  dispatchLocations={dispatchLocations}
  confirmedAllocation={bagAllocations[selectedSession.id] ?? null}
  onConfirmAllocation={(allocs) => setBagAllocations(prev => ({ ...prev, [selectedSession.id]: allocs }))}
  ```

- [x] T008 [US1] In `src/components/SplittingStationView.tsx`: remove the entire external allocation block — the `col-span-12` element that conditionally renders `<AllocationCard>` outside `SmallBaggingPanel` (the IIFE block starting with `{(() => { const sessionBags = baggingData[selectedSession.id]...`). Delete the whole block including the wrapping `<div className="col-span-12 ...">`.

**Checkpoint**: Division Station — open a session → seal all bags → Sample Allocation (with parent-qualified labels like `PRNT-8822-X-A`) appears in the right panel without scrolling → Confirm Dispatch → Finalise in same panel → session COMPLETED.

---

## Phase 3: User Story 2 — QR Reprint in Child Samples Panel (P2)

**Goal**: Operators can request a QR reprint for any tracked child sample directly from the Sample Tracking view. Requests flow to the admin via the existing `reprintRequests` state in `App.tsx`.

**Independent Test** (quickstart.md §5): Navigate to Sample Tracking → select `PRNT-8810-D` (step 11) → in the Child Samples panel, click **Request Reprint** on `CHLD-8810-D-01` → submit reason → row shows "Reprint Pending" → Personnel → Reprint Requests tab shows new request → Approve → return to tracking → row shows "Reprint Approved".

### B1 — ChildSamplePanel props + reprint controls

- [x] T009 [US2] In `src/components/sample-tracking/ChildSamplePanel.tsx`: add three props to `ChildSamplePanelProps`:
  ```ts
  onRequestReprint: (sampleId: string) => void;
  approvedReprintIds: Set<string>;
  pendingReprintIds: Set<string>;
  ```
  Destructure them in the component signature.

- [x] T010 [US2] In `src/components/sample-tracking/ChildSamplePanel.tsx`: inside the `children.map()` list item, below the step pips `<div>`, add a reprint control row:
  - If `pendingReprintIds.has(child.id)`: show a `<span>` with text "Reprint Pending" in `text-warning-amber`.
  - If `approvedReprintIds.has(child.id)`: show a `<span>` with `<QrCode size={10} />` icon and "Reprint Approved" in `text-success-emerald`.
  - Otherwise: show a `<button>` that calls `onRequestReprint(child.id)` with `e.stopPropagation()` to prevent the row selection toggle from firing. Style it `text-[9px] font-bold text-text-slate-400 hover:text-warning-amber uppercase tracking-widest`.
  Add `QrCode` to the lucide-react import at the top of the file.

### B2 — Thread reprintRequests through SampleTrackingView

- [x] T011 [US2] Locate `src/components/SampleTrackingView.tsx`. Add `ReprintRequest` to its type imports from `../types`. Add to `SampleTrackingViewProps`:
  ```ts
  reprintRequests: ReprintRequest[];
  setReprintRequests: React.Dispatch<React.SetStateAction<ReprintRequest[]>>;
  ```

- [x] T012 [US2] In `src/components/SampleTrackingView.tsx`: add the following derived state and modal state near the top of the component body (after existing `useState` calls):
  ```ts
  const approvedReprintIds = new Set(reprintRequests.filter(r => r.status === 'approved').map(r => r.sampleId));
  const pendingReprintIds  = new Set(reprintRequests.filter(r => r.status === 'pending').map(r => r.sampleId));
  const [reprintModalSampleId, setReprintModalSampleId] = useState<string | null>(null);
  ```

- [x] T013 [US2] In `src/components/SampleTrackingView.tsx`: find the `<ChildSamplePanel>` render call and add the three new props:
  ```tsx
  onRequestReprint={setReprintModalSampleId}
  approvedReprintIds={approvedReprintIds}
  pendingReprintIds={pendingReprintIds}
  ```

- [x] T014 [US2] In `src/components/SampleTrackingView.tsx`: at the end of the JSX return, before the closing root `</div>`, add the `ReprintRequestModal`:
  ```tsx
  {reprintModalSampleId && (
    <ReprintRequestModal
      sampleId={reprintModalSampleId}
      qrType="child"
      requestedBy="OPR-774 (J. Doe)"
      onSubmit={(req) => setReprintRequests(prev => [...prev, req])}
      onClose={() => setReprintModalSampleId(null)}
    />
  )}
  ```
  Add `ReprintRequestModal` to the component imports at the top of the file (import from `'./ReprintRequestModal'`).

- [x] T015 [US2] In `src/App.tsx`: update the `case 'tracking':` render call (line ~82) from:
  ```tsx
  return <SampleTrackingView onNavigate={setActiveView} />;
  ```
  to:
  ```tsx
  return <SampleTrackingView
    onNavigate={setActiveView}
    reprintRequests={reprintRequests}
    setReprintRequests={setReprintRequests}
  />;
  ```

**Checkpoint**: Sample Tracking → `PRNT-8810-D` → child row shows "Request Reprint" button → click → modal opens with child sample ID → submit reason → row shows "Reprint Pending" → Personnel admin approves → row shows "Reprint Approved". Sidebar badge count increments on submit.

---

## Phase 4: Polish & Verification

- [x] T016 [P] Run `npx tsc --noEmit` from the project root. Fix any TypeScript errors introduced by the new props — common sources: `SmallBaggingPanel` call sites missing `parentId`, `AllocationCard` call sites missing `parentId`, `SampleTrackingView` call sites missing `reprintRequests`.

- [x] T017 [P] Verify no duplicate `BagType` import conflicts: `SplittingStationView.tsx` defines a local `type BagType` (line ~15) which takes scope precedence over the global in `types.ts`. Confirm all usages within the file resolve to the local type. No change needed if already working.

- [x] T018 Run the full quickstart.md verification flow:
  - §1: Sample Collection reprint (regression)
  - §2: Dispatch Portal (regression)
  - §3: Division Station — allocation in right panel, parent-qualified labels, no scrolling
  - §4: Lab Receiver scan widget (regression)
  - §5: Child Samples reprint from tracking
  - §6: Lint passes, no TypeScript errors

---

## Dependencies & Execution Order

### Phase dependencies

| Phase | Depends on | Notes |
|---|---|---|
| Phase 1 (T001) | Nothing | Start immediately |
| Phase 2 (T002–T004) | T001 | T002, T003, T004 can run in parallel |
| Phase 2 (T005–T008) | T002–T004 complete | Must follow nomenclature tasks; T007, T008 after T005–T006 |
| Phase 3 (T009–T015) | T001 only | Entirely independent of Phase 2; can start after T001 |
| Phase 4 (T016–T018) | All implementation done | |

### Parallel opportunities

**Within Phase 2**: T002, T003, T004 touch different sections of the same file — sequential is safest for a single agent; a multi-agent setup could split them.

**Phases 2 and 3**: Can run in parallel — Phase 2 changes `SplittingStationView.tsx`, Phase 3 changes `ChildSamplePanel.tsx`, `SampleTrackingView.tsx`, and `App.tsx`. No file conflicts.

---

## Implementation Strategy

### MVP (fastest demo-able path)

1. T001 (childLabel helper)
2. T002, T003 (nomenclature labels visible in UI)
3. T009, T010 (reprint buttons in ChildSamplePanel)
4. T011–T015 (wire reprint through SampleTrackingView + App.tsx)
5. **STOP and demo**: labels updated, reprint flow works from tracking
6. Complete T004–T008 (move allocation in-panel) as a follow-up

### Full delivery (recommended — sequential, single agent)

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014 → T015 → T016 → T017 → T018

---

## Summary

| Phase | Tasks | Story | Files touched |
|---|---|---|---|
| Foundation | T001 | — | `SplittingStationView.tsx` |
| US1 nomenclature | T002–T004 | US1 | `SplittingStationView.tsx` |
| US1 inline allocation | T005–T008 | US1 | `SplittingStationView.tsx` |
| US2 panel props | T009–T010 | US2 | `ChildSamplePanel.tsx` |
| US2 wiring | T011–T015 | US2 | `SampleTrackingView.tsx`, `App.tsx` |
| Polish | T016–T018 | — | All |

**Total**: 18 tasks · 4 files · 0 new files · 0 new packages
