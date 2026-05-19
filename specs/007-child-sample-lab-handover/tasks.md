# Tasks: Child Sample Count, Operator Assignment & Lab Receive Confirmation

**Input**: Design documents from `/specs/007-child-sample-lab-handover/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story. US1 and US2 both modify `SplittingStationView.tsx`; US3 modifies `LabReceivingView.tsx`. US1 and US3 can proceed in parallel; US2 depends on US1 (same file, overlapping state).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend shared types to support the new bag types needed by US1 and US2.

- [x] T001 Extend `BagType` union in `src/components/SplittingStationView.tsx` from `'A' | 'B' | 'R'` to `'A' | 'B' | 'R' | 'D' | 'E'` and add `BAG_TYPE_SEQUENCE` + `BAG_LABEL_SEQUENCE` constants

**Checkpoint**: `BagType` covers 5 bag slots — no other changes yet

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update `BagRecord` to carry `assignedOperator` — this field is required by both US1 (gate logic) and US2 (display). Must be done before either story's UI work begins.

- [x] T002 Add `assignedOperator: string` field to the `BagRecord` interface in `src/components/SplittingStationView.tsx`
- [x] T003 Add `assignedOperator: ''` to every existing `BagRecord` initializer in `baggingData` initial state in `src/components/SplittingStationView.tsx`

**Checkpoint**: `BagRecord` has `assignedOperator`; TypeScript compiles cleanly — US1 and US2 implementation can now begin

---

## Phase 3: User Story 1 — Dynamic Child Sample Count (Priority: P1) 🎯 MVP

**Goal**: Operator can set how many child bags (1–5) to create before sealing; bag cards render dynamically based on that count.

**Independent Test**: Open Division Station → open an IN_PROGRESS session → mark pulverisation → change child count input to 4 → verify a 4th "Sample D" bag card appears; change to 2 → verify only "Sample A" and "Sample B" cards show.

### Implementation for User Story 1

- [x] T004 [US1] Add `childCount: Record<string, number>` state (default per-session value of 3) to `SplittingStationView` in `src/components/SplittingStationView.tsx`
- [x] T005 [US1] Add a `handleChildCountChange(sessionId: string, count: number)` handler that clamps the value to 1–5 and updates `childCount` state in `src/components/SplittingStationView.tsx`
- [x] T006 [US1] Derive `activeBagTypes` from `BAG_TYPE_SEQUENCE.slice(0, childCount[selectedSessionId] ?? 3)` at render time in `src/components/SplittingStationView.tsx`
- [x] T007 [US1] Render a labelled number input (min=1, max=5, step=1) above the bag cards grid in the Small Bagging section (section `04`) in `src/components/SplittingStationView.tsx`; input is disabled once all bags are sealed
- [x] T008 [US1] Replace the hardcoded `['A','B','R']` iteration in the bag cards grid with `activeBagTypes`, and derive display labels from `BAG_LABEL_SEQUENCE` in `src/components/SplittingStationView.tsx`
- [x] T009 [US1] Update `handleMarkPulverised` to initialize `baggingData` for all 5 possible bag slots (A–E) with empty `BagRecord` values so dynamic count changes don't hit missing keys in `src/components/SplittingStationView.tsx`
- [x] T010 [US1] Update `allSealed` derived boolean to check only `activeBagTypes` (not the hardcoded 3) in `src/components/SplittingStationView.tsx`
- [x] T011 [US1] Update `handleSealAllBags` to iterate over `activeBagTypes` (not hardcoded `['A','B','R']`) in `src/components/SplittingStationView.tsx`

**Checkpoint**: Child count input works end-to-end; bag cards render correctly for counts 1–5; Seal All button iterates the correct bag set

---

## Phase 4: User Story 2 — Operator Assignment per Child Sample (Priority: P1)

**Goal**: Each bag card shows an "Assigned Operator" dropdown; "Seal All Child Bags" is disabled until every active bag has both a weight and an operator assigned.

**Independent Test**: Open Small Bagging with 3 bags → fill all weights → leave one operator unselected → "Seal All" stays disabled → select all operators → "Seal All" enables → click → sealed summary shows assigned operator under each bag's seal ID.

### Implementation for User Story 2

- [x] T012 [US2] Add `handleBagOperatorChange(type: BagType, operator: string)` handler that updates `assignedOperator` in `baggingData` for the given bag in `src/components/SplittingStationView.tsx`
- [x] T013 [US2] Inside each un-sealed bag card, add an "Assigned Operator" `<select>` using the `OPERATORS` array; bind to `bag.assignedOperator` and call `handleBagOperatorChange` on change in `src/components/SplittingStationView.tsx`
- [x] T014 [US2] Update the `allSealed` / `canSeal` gate: derive `canSealAll` as `activeBagTypes.every(t => bags[t].weight && bags[t].assignedOperator)` and bind the "Seal All Child Bags" button's `disabled` prop to `!canSealAll` in `src/components/SplittingStationView.tsx`
- [x] T015 [US2] In the sealed bag card summary view, render `bag.assignedOperator` as a labelled row below the seal ID in `src/components/SplittingStationView.tsx`

**Checkpoint**: Seal All button correctly requires both weight and operator on every active bag; sealed summary shows the operator for each bag

---

## Phase 5: User Story 3 — Lab Receiving Confirmation Button (Priority: P1)

**Goal**: "Receive Batch" becomes "Confirm Receipt" and is disabled until receiver, acceptance status, and visual condition are all filled; clicking it marks the first pending item as Received and resets the form.

**Independent Test**: Open Lab Receiving → leave form incomplete → "Confirm Receipt" is disabled → fill all three fields → button enables → click → first pending row changes to "Received" status, form clears, success banner appears briefly.

### Implementation for User Story 3

- [x] T016 [P] [US3] Extract the inline pending items array from JSX into a `pendingItems` state using `useState<PendingItem[]>` in `src/components/LabReceivingView.tsx`; define the `PendingItem` interface (`id`, `parent`, `weight`, `status`, `type: 'pending' | 'alert' | 'done'`)
- [x] T017 [US3] Derive `canConfirm` boolean: `!!(receiptRecord.receiver && receiptRecord.acceptanceStatus && receiptRecord.visualCondition)` in `src/components/LabReceivingView.tsx`
- [x] T018 [US3] Add `showSuccess` state (`useState<boolean>(false)`) for the post-confirm success banner in `src/components/LabReceivingView.tsx`
- [x] T019 [US3] Implement `handleConfirmReceipt`: (1) find the first `pending` item and set its `type` to `done` and `status` to `'Received'`; (2) reset `receiptRecord` to all-empty; (3) set `showSuccess = true` then clear it with `setTimeout(..., 2000)` in `src/components/LabReceivingView.tsx`
- [x] T020 [US3] Rename the header button from "Receive Batch" to "Confirm Receipt", bind `disabled={!canConfirm}` and `onClick={handleConfirmReceipt}`, and add disabled styling (opacity-40, cursor-not-allowed) in `src/components/LabReceivingView.tsx`
- [x] T021 [US3] Replace the static table `map` with `pendingItems.map(...)` so state-driven status changes render in the Pending Receipts table in `src/components/LabReceivingView.tsx`
- [x] T022 [US3] Render an inline success banner (emerald, `CheckCircle2` icon) below the Receipt Record form when `showSuccess` is true in `src/components/LabReceivingView.tsx`

**Checkpoint**: All three US3 acceptance criteria pass end-to-end; button gate, receipt mutation, and success feedback all work

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T023 Run the three quickstart.md scenarios manually in the browser to validate all user stories end-to-end
- [x] T024 [P] Verify TypeScript compiles cleanly (`tsc --noEmit` or Vite dev server shows no type errors) after all changes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1
- **Phase 3 (US1)**: Depends on Phase 2 — can start in parallel with Phase 5
- **Phase 4 (US2)**: Depends on Phase 3 (same file, shares `activeBagTypes` and `baggingData`)
- **Phase 5 (US3)**: Depends on Phase 2 — can run in parallel with Phase 3
- **Phase 6 (Polish)**: Depends on Phases 3, 4, and 5 all complete

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 — no dependency on US2 or US3
- **US2 (P1)**: Starts after US1 completes (same file; builds on `activeBagTypes` and `BagRecord`)
- **US3 (P1)**: Starts after Phase 2 — fully independent of US1 and US2 (different file)

### Parallel Opportunities

- Phases 3 and 5 can proceed in parallel (different files)
- T016 (US3 state extraction) can start as soon as Phase 2 is done, while US1 work is in progress
- T023 and T024 in Phase 6 can run in parallel

---

## Parallel Example: US1 + US3

```
# While one developer works on US1 in SplittingStationView.tsx:
Tasks: T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011

# Another developer (or same, in parallel) works on US3 in LabReceivingView.tsx:
Tasks: T016 → T017 → T018 → T019 → T020 → T021 → T022
```

---

## Implementation Strategy

### MVP (All three P1 stories — deliver together)

1. Complete Phase 1 + Phase 2 (type extensions, BagRecord update)
2. Complete Phase 3 (US1 — dynamic count)
3. Complete Phase 4 (US2 — operator assignment, builds on US1)
4. Complete Phase 5 (US3 — lab confirm; can run in parallel with Phases 3–4)
5. Phase 6 polish + quickstart validation
6. All three acceptance criteria verified before PR

### Incremental Delivery (if splitting work)

- **Increment 1**: Phases 1–3 → US1 working (dynamic bag count visible, no operator gate yet)
- **Increment 2**: Phase 4 → US2 adds operator assignment + gate
- **Increment 3**: Phase 5 → US3 lab confirm independent of US1/US2

---

## Notes

- `[P]` = can run in parallel (different files or no shared state dependency)
- `[USn]` = maps directly to user story n in spec.md
- US1 and US2 share `SplittingStationView.tsx` — do not edit simultaneously
- US3 is fully isolated in `LabReceivingView.tsx`
- No new files required — all changes are in-place edits to existing components
