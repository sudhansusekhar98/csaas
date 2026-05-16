# Tasks: CSAAS UX Reconstruction

**Input**: Design documents from `specs/001-ux-reconstruction/`

**Prerequisites**: plan.md ✓ | research.md ✓ | data-model.md ✓ | contracts/screen-contracts.md ✓

**Tests**: Not requested — this is a UI prototype reconstruction. Visual verification via `npm run dev`.

**Organization**: Tasks grouped by user story. Each story is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story label (US1–US6)

---

## User Stories

| ID  | Priority | Title                              | Goal                                                        |
|-----|----------|------------------------------------|-------------------------------------------------------------|
| US1 | P1       | Process-Flow Navigation            | Sidebar reorganized to match the physical sample journey    |
| US2 | P1       | Pipeline Dashboard                 | Dashboard shows live counts at each process stage           |
| US3 | P1       | Process Breadcrumb Wayfinding      | Operational screens show contextual step indicator          |
| US4 | P2       | Division Station Session List      | Splitting screen has session list before detail view        |
| US5 | P2       | Inline NCR Trigger                 | Flag-Issue button available on all operational screens      |
| US6 | P2       | Terminology & Type System Cleanup  | All labels consistent; `ExtendedViewType` hack removed      |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish layout component structure. No behavioral changes.

- [X] T001 Create `src/components/layout/` directory and move layout concerns out of `src/App.tsx`
- [X] T002 [P] Create empty `src/components/layout/Sidebar.tsx` — exports `<Sidebar activeView onNavigate isSidebarOpen onToggle />`
- [X] T003 [P] Create empty `src/components/layout/Header.tsx` — exports `<Header onToggleSidebar activeView />`

**Checkpoint**: Layout files exist; `App.tsx` still renders everything directly (not wired yet).

---

## Phase 2: Foundational (Type System — Blocks All Stories)

**Purpose**: Fix `ViewType` so all stories work against a clean, unified type. Must complete before any navigation changes.

**⚠️ CRITICAL**: Every story that touches navigation depends on this being correct first.

- [X] T004 Update `src/types.ts`: merge `ExtendedViewType` into `ViewType`; rename `'splitting-station'` → `'division-station'`; rename `'exception-logging'` → `'non-conformance'`; remove `ExtendedViewType` export
- [X] T005 Update `src/App.tsx` import: replace `ExtendedViewType` with `ViewType` in all imports and state type; update `renderView()` cases for renamed view IDs (`division-station`, `non-conformance`)
- [X] T006 Rename `src/components/ExceptionLoggingView.tsx` → `src/components/NonConformanceView.tsx`; update the import in `App.tsx`
- [X] T007 Update page title inside `NonConformanceView.tsx`: "Industrial Exception Ledger" → "Non-Conformance Report (NCR)"

**Checkpoint**: `npm run dev` starts without TypeScript errors. Navigating to exception-logging screen now uses `/non-conformance` ID. App is functionally identical to before.

---

## Phase 3: User Story 1 — Process-Flow Navigation (P1) 🎯 MVP

**Goal**: Sidebar reflects the physical process journey, grouped into Operations / Quality & Compliance / Administration.

**Independent Test**: Open the app → sidebar shows three labeled groups with correct items in each → clicking each nav item loads the correct screen → sidebar collapses/expands correctly.

### Implementation

- [X] T008 [US1] Implement `src/components/layout/Sidebar.tsx` — three nav groups:
  - **Operations** (in order): Consignments, Sample Tracking, Division Station, Lab Receiving
  - **Quality & Compliance**: Non-Conformance, Audit History, Reports
  - **Administration**: Personnel, System Health, Alerts
  - Remove the "Monitoring 84 Units" promo card at the bottom
  - Keep collapse/expand toggle behavior identical to current `App.tsx` sidebar
  - Props: `activeView: ViewType`, `onNavigate: (v: ViewType) => void`, `isSidebarOpen: boolean`, `onToggle: () => void`

- [X] T009 [US1] Implement `src/components/layout/Header.tsx` — extract header markup from `App.tsx` verbatim (search bar, bell, help, user avatar); add `onToggleSidebar` and `onFlagIssue` (stub, used in US5) props; no behavioral changes yet

- [X] T010 [US1] Wire `Sidebar` and `Header` into `src/App.tsx`: replace inline sidebar markup with `<Sidebar>`, replace inline header with `<Header>`; pass all props from existing `useState` hooks; verify render is identical to before refactor

- [X] T011 [US1] Update nav item label in `App.tsx` data arrays (or in `Sidebar.tsx` nav config): "Splitting Station" → "Division Station"; "Exception Log" → "Non-Conformance"

**Checkpoint**: App renders identically. Three sidebar groups visible. Nav item labels updated. No console errors.

---

## Phase 4: User Story 2 — Pipeline Dashboard (P1)

**Goal**: Dashboard shows a pipeline status bar (sample counts per stage) instead of generic KPI cards. Supervisors see shift health at a glance.

**Independent Test**: Load Dashboard → see 5 pipeline stage boxes each with a sample count → clicking a stage box navigates to that stage's screen → Active NCR count shown → "Register Consignment" CTA works.

### Implementation

- [X] T012 [US2] Redesign `src/components/DashboardView.tsx`:

  **Replace** the 3-card stat grid (Pending Splitting / Samples Prepared / Active Exceptions) with a **Pipeline Status Bar** — 5 connected boxes in a horizontal flow:
  ```
  [① Consignments: 8] →→ [② In Prep: 14] →→ [③ Division: 3] →→ [④ Lab Queue: 6] →→ [✓ Completed: 42]
  ```
  Each box: stage name, count in large text, arrow connector between boxes (except last), hover state, clicking navigates to that screen via `setActiveView`.

  **Replace** the "Recent Shipments" table with two side-by-side panels:
  - **Active NCRs** (left, 4-col span): table of open non-conformance reports — ID, Stage, Category, Reported At, Status badge. "View All" link → navigates to `non-conformance`.
  - **Today's Throughput** (right, 2-col span): single large number for samples completed today, daily target progress bar, and shift time remaining.

  **Keep**: Page title area and "Register Consignment" CTA button (navigates to `consignments`).
  **Remove**: "Export Data" button (not meaningful in prototype).

  Change page title from "Preparation Overview" → "Live Pipeline".

**Checkpoint**: Dashboard loads with pipeline bar. Clicking stage boxes navigates correctly. NCR panel and throughput panel render. No broken imports.

---

## Phase 5: User Story 3 — Process Breadcrumb Wayfinding (P1)

**Goal**: All four operational screens (Consignments, Sample Tracking, Division Station, Lab Receiving) display a horizontal process breadcrumb showing where they sit in the 5-stage chain.

**Independent Test**: Navigate to each of the four operational screens → breadcrumb shows correct active step → completed steps are visually distinct → clicking a completed step navigates to that screen.

### Implementation

- [X] T013 [US3] Create `src/components/layout/ProcessBreadcrumb.tsx`:

  Props:
  ```typescript
  interface ProcessBreadcrumbProps {
    currentStep: 1 | 2 | 3 | 4;
    onNavigate: (view: ViewType) => void;
  }
  ```

  Render 4 steps in a horizontal row with chevron separators:
  ```
  [① Consignments] › [② Sample Tracking] › [③ Division Station] › [④ Lab Receiving]
  ```
  - **Current step**: indigo label + indigo filled circle dot, text bold
  - **Completed step** (step number < currentStep): emerald label + checkmark icon, cursor-pointer, onClick → `onNavigate`
  - **Future step** (step number > currentStep): slate-400 text, not clickable
  - Step-to-view mapping: 1→`consignments`, 2→`tracking`, 3→`division-station`, 4→`lab-receiving`

- [X] T014 [US3] Add `<ProcessBreadcrumb>` to `src/components/ConsignmentsView.tsx`:
  - Insert below the page header, above the stats grid
  - Pass `currentStep={1}` and `onNavigate` (thread via prop from App, or use a shared context — keep it simple: pass as prop for prototype)
  - Add `onNavigate: (view: ViewType) => void` to `ConsignmentsView` props

- [X] T015 [P] [US3] Add `<ProcessBreadcrumb>` to `src/components/SampleTrackingView.tsx`:
  - Insert below the page header
  - Pass `currentStep={2}` and `onNavigate` prop

- [X] T016 [P] [US3] Add `<ProcessBreadcrumb>` to `src/components/SplittingStationView.tsx` (now Division Station):
  - Insert below the page header
  - Pass `currentStep={3}` and `onNavigate` prop

- [X] T017 [P] [US3] Add `<ProcessBreadcrumb>` to `src/components/LabReceivingView.tsx`:
  - Insert below the page header
  - Pass `currentStep={4}` and `onNavigate` prop

- [X] T018 [US3] Update `src/App.tsx` `renderView()` to pass `onNavigate` (i.e., `setActiveView`) down to all four operational views

**Checkpoint**: Navigate to Consignments → breadcrumb shows step 1 active, steps 2–4 greyed. Navigate to Lab Receiving → steps 1–3 green with checkmarks, step 4 active in indigo.

---

## Phase 6: User Story 4 — Division Station Session List (P2)

**Goal**: The Division Station screen shows a session list when first opened, allowing navigation to individual splitting sessions. Matches the pattern used in ConsignmentsView.

**Independent Test**: Navigate to Division Station → session list table shows 3 sample sessions with status badges → clicking a row enters the detail view → "Back to Sessions" link returns to the list.

### Implementation

- [X] T019 [US4] Update `src/components/SplittingStationView.tsx` to add session list view:

  Add `useState<string | null>` for `selectedSession` (null = list view, string = detail view).

  **Session List View** (when `selectedSession === null`):
  - Page title: "Sample Division Station" (was "Splitting Control Station")
  - Stats row: 3 small cards — Active Sessions, Completed Today, Awaiting Dispatch
  - Table: Parent ID, Collected At, Weight (kg), Operator, Status (AWAITING_SPLIT / IN_PROGRESS / COMPLETED), Action column "Open Session" button
  - Mock data: 3 sessions — SPL-29384 (IN_PROGRESS), SPL-29383 (AWAITING_SPLIT), SPL-29382 (COMPLETED)
  - "Start New Session" button in header (stub — no modal needed for prototype)

  **Session Detail View** (when `selectedSession !== null`):
  - Add a back link at top: `← All Sessions` button → `setSelectedSession(null)`
  - Render existing detail UI (Parent Seal Integrity + Downstream Logic panels) unchanged
  - Breadcrumb still visible at top (above the back link)

**Checkpoint**: Division Station opens to session list. Clicking "Open Session" on SPL-29384 shows the existing detail UI. "← All Sessions" returns to list. `ProcessBreadcrumb` visible throughout.

---

## Phase 7: User Story 5 — Inline NCR Trigger (P2)

**Goal**: A "Flag Issue" button in the header of each operational screen opens a compact NCR modal pre-filled with the current stage. Operators never leave their working screen to log an exception.

**Independent Test**: On Consignments screen → click "Flag Issue" → compact NCR modal opens with Stage pre-set to "CONSIGNMENT" → fill Category + Description → "Submit NCR" closes modal → no navigation change.

### Implementation

- [X] T020 [US5] Create `src/components/NonConformanceModal.tsx` — compact inline NCR form:

  Props:
  ```typescript
  interface NonConformanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    stage: 'CONSIGNMENT' | 'COLLECTION' | 'TRANSIT' | 'PREP' | 'DIVISION' | 'LAB';
    sampleId?: string;
  }
  ```

  Renders as a centered modal overlay (same pattern as `ConsignmentsView` new-consignment modal):
  - Header: "Flag Non-Conformance" + current `stage` badge + X close button
  - Body fields:
    - Stage (read-only display, pre-filled from prop)
    - Sample ID (pre-filled from prop if provided, else empty text input)
    - NCR Category (dropdown: Seal Breach, Mass Variance, Contamination, Admin Error)
    - Description (textarea, required)
  - Footer: "Cancel" + "Submit NCR" buttons (Submit closes modal for prototype)

- [X] T021 [US5] Add "Flag Issue" trigger to `src/components/layout/Header.tsx`:
  - Add amber `FileWarning` icon button in the right action cluster (between bell and help icons)
  - Wire to `onFlagIssue` prop (stub was added in T009)
  - Tooltip text: "Flag Non-Conformance"

- [X] T022 [US5] Wire `NonConformanceModal` in `src/App.tsx`:
  - Add `useState<boolean>` for `isNcrModalOpen`
  - Add `useState<ViewType>` to derive stage from `activeView` (mapping: `consignments`→`CONSIGNMENT`, `tracking`→`TRANSIT`, `division-station`→`DIVISION`, `lab-receiving`→`LAB`, others→`ADMIN_ERROR` category)
  - Pass `onFlagIssue={() => setIsNcrModalOpen(true)}` to `<Header>`
  - Render `<NonConformanceModal>` at root level with `isOpen`, `onClose`, `stage` derived from `activeView`

**Checkpoint**: Click "Flag Issue" on any screen → amber modal opens with correct Stage pre-filled → "Cancel" or "Submit NCR" closes it → user remains on the same screen.

---

## Phase 8: User Story 6 — Terminology & Final Cleanup (P2)

**Goal**: All visible labels match research.md terminology table. No `ExtendedViewType` leftovers. Sidebar promo card removed.

**Independent Test**: Audit all visible text in the app against the terminology table in research.md. No mismatches. TypeScript compiles with zero errors.

### Implementation

- [X] T023 [P] [US6] Update `src/components/ConsignmentsView.tsx` page subtitle: "Monitoring inbound train racks and wagon manifests." → "Register and monitor inbound coal consignments." (clearer for new users)

- [X] T024 [P] [US6] Update `src/components/SplittingStationView.tsx` all remaining label text from research.md table:
  - Section header "Downstream Logic" → "Sub-Sample Generation"
  - Child sample type labels: keep "Moisture Analysis", "Calorific Value", "Reserve Sample" (these are already correct IS 436 terms)
  - "Finalize Splitting Session" → "Finalise Division Session" (British English consistent with Indian standards documents)

- [X] T025 [P] [US6] Update `src/components/LabReceivingView.tsx` page heading: "Lab Sample Receiving" → "Lab Receiving & Authentication" (matches plan.md terminology)

- [X] T026 [P] [US6] Confirm `src/types.ts` has no remaining `ExtendedViewType` references (completed in T004 but verify no other file imports it); check with grep across `src/`

- [X] T027 [US6] Final compile check: run `npx tsc --noEmit` and fix any remaining type errors introduced during the reconstruction

- [X] T028 [US6] Visual smoke test: launch `npm run dev`, navigate to every screen in the new nav order, confirm no blank screens, no console errors, ProcessBreadcrumb appears on all 4 operational screens, NCR modal triggers from header

**Checkpoint**: Zero TypeScript errors. All 11 screens load. Terminology consistent throughout.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Cohesion and visual consistency improvements affecting multiple user stories.

- [X] T029 [P] Audit corner radius consistency: operational screens should use `rounded-2xl` for cards uniformly (SampleTrackingView uses `rounded-3xl` for some panels — align to `rounded-2xl` per plan.md)
- [X] T030 [P] Remove `void showSealScanner; void scanStatus; void scanProgress; void handleSimulateScan;` suppression comments in `SampleTrackingView.tsx` — wire the scan button to actually show the scanner modal (the state and handler already exist; connect them)
- [X] T031 Update `README.md` title from generic Gemini AI Studio template to "CSAAS — Coal Sample Anti-Adulteration System" and update run instructions to remove Gemini API key requirement (prototype doesn't use it)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Type System) ← BLOCKS everything below
    ↓
Phase 3 (US1: Nav)     Phase 4 (US2: Dashboard)    [both can start after Phase 2]
    ↓                       ↓
Phase 5 (US3: Breadcrumb) ← depends on Phase 3 (Sidebar/Header wire-up done)
    ↓
Phase 6 (US4: Division Station) ←┐ can run in parallel
Phase 7 (US5: NCR Modal)      ←──┘ after Phase 5
    ↓
Phase 8 (US6: Cleanup) ← after all US complete
    ↓
Phase 9 (Polish)
```

### User Story Dependencies

- **US1 (Nav)**: Depends on Phase 2 (type system). No story dependencies.
- **US2 (Dashboard)**: Depends on Phase 2. No story dependencies. Can parallel with US1.
- **US3 (Breadcrumb)**: Depends on US1 (Header/App wire-up complete so `onNavigate` threading exists).
- **US4 (Division Station)**: Depends on Phase 2 (view ID rename). Independent of US1–US3 component-wise.
- **US5 (NCR Modal)**: Depends on US1 (Header component exists with `onFlagIssue` prop slot).
- **US6 (Cleanup)**: Depends on all prior stories (verifies their outputs).

### Parallel Opportunities

Within Phase 3 (US1): T008, T009 can be built in parallel (different files), T010 wires them after.

Within Phase 5 (US3): T014, T015, T016, T017 can all be done in parallel (different component files).

Within Phase 8 (US6): T023, T024, T025, T026 can all be done in parallel.

---

## Parallel Execution Examples

### US3 (Breadcrumb — 4 components, all independent)

```
Task: Add ProcessBreadcrumb to ConsignmentsView (T014) — src/components/ConsignmentsView.tsx
Task: Add ProcessBreadcrumb to SampleTrackingView (T015) — src/components/SampleTrackingView.tsx
Task: Add ProcessBreadcrumb to SplittingStationView (T016) — src/components/SplittingStationView.tsx
Task: Add ProcessBreadcrumb to LabReceivingView (T017) — src/components/LabReceivingView.tsx
```

All four tasks touch different files. Run together after T013 (ProcessBreadcrumb component) is done.

### US6 (Terminology cleanup — 4 components, all independent)

```
Task: Update ConsignmentsView subtitle (T023)
Task: Update SplittingStationView labels (T024)
Task: Update LabReceivingView heading (T025)
Task: Verify type cleanup (T026)
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 — navigation + dashboard + wayfinding)

1. Complete Phase 1: Setup (create layout files)
2. Complete Phase 2: Type system cleanup (CRITICAL — 4 tasks)
3. Complete Phase 3: US1 — New sidebar navigation
4. Complete Phase 4: US2 — Pipeline dashboard
5. Complete Phase 5: US3 — Process breadcrumb
6. **STOP AND VALIDATE**: All operational screens navigable, breadcrumb works, dashboard shows pipeline
7. Demo to stakeholders at this point — core UX improvement is visible

### Incremental Delivery

8. Add Phase 6: US4 — Division Station session list
9. Add Phase 7: US5 — Inline NCR trigger
10. Add Phase 8: US6 — Terminology cleanup + TypeScript validation
11. Add Phase 9: Polish

### Total Task Count

| Phase | Story | Tasks |
|-------|-------|-------|
| Phase 1 (Setup)       | —   | 3  |
| Phase 2 (Foundation)  | —   | 4  |
| Phase 3 (Nav)         | US1 | 4  |
| Phase 4 (Dashboard)   | US2 | 1  |
| Phase 5 (Breadcrumb)  | US3 | 6  |
| Phase 6 (Division)    | US4 | 1  |
| Phase 7 (NCR Modal)   | US5 | 3  |
| Phase 8 (Cleanup)     | US6 | 6  |
| Phase 9 (Polish)      | —   | 3  |
| **Total**             |     | **31** |

---

## Notes

- All tasks are UI-only — no backend integration, no new `npm` packages required
- Run `npm run dev` after each checkpoint to verify visually
- Run `npx tsc --noEmit` after Phase 2 and again at Phase 8 to catch type errors early
- The `motion/react` animation pattern used in `ConsignmentsView` (modal) should be reused in `NonConformanceModal` (T020) for consistency
- Existing CCTV mockup image URLs in `SplittingStationView` are fine as-is for the prototype
