# Tasks: Sample Tracking — Snake Stepper, Child Visibility & GPS Map View

**Input**: Design documents from `specs/009-tracking-stepper-map/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/screen-contract.md ✓, quickstart.md ✓

**Tests**: Not explicitly requested in spec; no test tasks generated. Manual verification via `quickstart.md`.

**Organization**: Tasks grouped by user story (US1 / US2 / US3) with Setup and Foundational phases blocking all stories.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no in-flight dependencies)
- **[Story]**: User story this task belongs to

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new dependencies and scaffold the feature's file structure before any component work begins.

- [x] T001 Install `react-leaflet@^4.2`, `leaflet@^1.9`, and `@types/leaflet@^1.9` via `npm install react-leaflet leaflet && npm install -D @types/leaflet` from the project root
- [x] T002 Add `import 'leaflet/dist/leaflet.css'` to `src/main.tsx` (after existing imports) so Leaflet styles are globally available
- [x] T003 Create empty file stubs for the four new source files: `src/components/sample-tracking/SnakeStepper.tsx`, `src/components/sample-tracking/ChildSamplePanel.tsx`, `src/components/sample-tracking/SampleMapView.tsx`, and `src/data/sample-tracking-mock.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extract and extend shared data/type foundations that US1, US2, and US3 all depend on. No user story component work may begin until this phase is complete.

**⚠️ CRITICAL**: All three user stories read from `src/types.ts` and `src/data/sample-tracking-mock.ts`. Those modules must be stable before component work starts.

- [x] T004 Add the following new TypeScript types/interfaces to `src/types.ts` (below the existing `ViewType` type): `Coord`, `StepEvent` (modified — add optional `coord?: Coord | null`), `ChildSample`, `SampleRoute`, `ViewMode`, and `ProcessStepNode` exactly as defined in `specs/009-tracking-stepper-map/data-model.md`; note that `StepEvent` is modified (not new) — extend the existing interface in `SampleTrackingView.tsx` by importing it from `src/types.ts` or by adding `coord` inline
- [x] T005 Create `src/data/sample-tracking-mock.ts`: move the `SAMPLES`, `STEP_DEFINITIONS`, `STEP_TEMPLATES` (extended — see T006), `SAMPLE_BASE_TIMES`, `buildStepEvents`, `STEP_EVENTS`, and `FRS_FACE_URL` constants out of `src/components/SampleTrackingView.tsx` and into this file, adding `export` to each; update `src/components/SampleTrackingView.tsx` to import them from the new file
- [x] T006 Add `coord` fields to each entry in `STEP_TEMPLATES` inside `src/data/sample-tracking-mock.ts`: use the 12 demo coordinates below (anchored ~3 km radius around `17.5450° N, 78.5050° E`; system steps 4 and 10 get `coord: null`):

  ```ts
  // Step 1 — Track Hopper
  { lat: 17.5412, lng: 78.4992 }
  // Step 2 — Weighbridge Gate
  { lat: 17.5418, lng: 78.5008 }
  // Step 3 — Sealing Bay
  { lat: 17.5425, lng: 78.5021 }
  // Step 4 — Central Registry (SYSTEM)
  null
  // Step 5 — VMS Control Room
  { lat: 17.5440, lng: 78.5035 }
  // Step 6 — Prep Room Gate
  { lat: 17.5451, lng: 78.5048 }
  // Step 7 — Prep Room Station A
  { lat: 17.5454, lng: 78.5051 }
  // Step 8 — Pulveriser Unit
  { lat: 17.5460, lng: 78.5059 }
  // Step 9 — Division Station
  { lat: 17.5465, lng: 78.5063 }
  // Step 10 — Central Lab DB (SYSTEM)
  null
  // Step 11 — Lab Dispatch
  { lat: 17.5472, lng: 78.5070 }
  // Step 12 — Lab Reception
  { lat: 17.5476, lng: 78.5074 }
  ```

- [x] T007 Add `CHILD_SAMPLES: ChildSample[]` array to `src/data/sample-tracking-mock.ts` with at least 2 children for each parent whose `currentStepIndex >= 9`; per `data-model.md`: `PRNT-8818-B` (step 8 → no children yet), `PRNT-8810-D` (step 10 → children `CHLD-8810-D-A` at step 10 completed, `CHLD-8810-D-B` at step 11 current), `PRNT-8820-A` (step 5 → no children); use slightly offset lab coordinates for child step-11 and step-12 events (`lat ± 0.0002`, `lng ± 0.0002` from parent step-11/12 coords) so child route polylines don't overlap the parent; export `CHILD_SAMPLES` from the file

**Checkpoint**: `npm run lint` must pass (zero TypeScript errors) before starting Phase 3.

---

## Phase 3: User Story 1 — Snake-wise horizontal stepper (Priority: P1) 🎯 MVP

**Goal**: Replace the vertical 12-step stepper with a snake-pattern CSS-Grid layout that shows all 12 nodes without scrolling on 1440×900. Existing step-click → popup behaviour is preserved.

**Independent Test**: Load `http://localhost:3000`, navigate to Sample Tracking, pick any sample — all 12 step nodes visible at once on a 1440×900 viewport, correct completed/current/pending styling, clicking a completed node opens the existing popup. Quickstart §1 is the full acceptance checklist.

### Implementation for User Story 1

- [x] T008 [US1] Implement `SnakeStepper` in `src/components/sample-tracking/SnakeStepper.tsx`: accept props `{ steps: ProcessStepNode[]; onStepClick: (stepIdx: number) => void; highlightRange?: { from: number; to: number } | null }` as defined in `specs/009-tracking-stepper-map/contracts/screen-contract.md §2.1`; render step nodes as a CSS Grid with `stepsPerRow` breakpoints (6 at ≥1440px via Tailwind `xl:grid-cols-6`, 4 at ≥1024px via `lg:grid-cols-4`, 3 at ≥768px via `md:grid-cols-3`, 1 below); odd-numbered rows (0-indexed) render their cells using `flex-direction: row-reverse` by wrapping in a div with `flex flex-row-reverse`; each step node is a `<button>` with the same icon, colour, and animation logic as the existing vertical stepper rows (emerald filled for completed, indigo pulsing for current, slate outlined for pending); reuse existing Tailwind classes from `SampleTrackingView.tsx` as closely as possible
- [x] T009 [US1] Add row-end connector arcs to `SnakeStepper.tsx`: after computing which cells are last-in-row (i.e., index is a multiple of `stepsPerRow - 1`), render a small absolutely-positioned half-pill `<div>` (height equal to the step icon size, `rounded-r-full border-r-2 border-b-2`, rotated 90°) on the right edge of each row-end cell in even rows and on the left edge of each row-end cell in odd rows; colour the arc border using the same logic as the lesser-progressed step (emerald if both sides completed, indigo if it spans the current step, `border-slate-200` if both pending); mark the arc `aria-hidden="true"`
- [x] T010 [US1] Add horizontal connector lines between adjacent step nodes within the same row in `SnakeStepper.tsx`: render a thin `<div className="h-0.5 flex-1">` between each pair of horizontally adjacent nodes; colour using the same lesser-progressed rule; mark `aria-hidden="true"`
- [x] T011 [US1] Add view-mode toggle to `src/components/SampleTrackingView.tsx`: add `const [viewMode, setViewMode] = useState<ViewMode>('stepper')` state; in the sticky header, add a segmented control between the "Scan Next Phase" button and the active-sample card — two `<button>` elements labelled "Stepper" and "Map" styled with label-caps, `bg-primary-indigo text-white` on the active one and `bg-slate-100 text-text-slate-700` on the inactive; wrap both in `<div className="flex rounded-xl overflow-hidden border border-border-slate shadow-sm">`
- [x] T012 [US1] Replace the vertical stepper `<div className="space-y-6 relative z-10">` block in `src/components/SampleTrackingView.tsx` with `<SnakeStepper steps={steps} onStepClick={handleStepClick} />` (import from `./sample-tracking/SnakeStepper`); remove the `absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100` vertical line div that is no longer needed; the `steps` derived array (already computed with status) is passed directly — no other changes to `steps` derivation logic
- [x] T013 [US1] Wrap the map canvas (`SampleMapView`, added in Phase 5) and the stepper card in a conditional render so only the active view mode's card is visible: `{viewMode === 'stepper' && <div className="bg-white border ...">...<SnakeStepper .../> ...</div>}` and `{viewMode === 'map' && <SampleMapView .../>}` — but keep the map DOM mounted at all times using `className={viewMode === 'map' ? '' : 'hidden'}` to preserve tile state (research R-008); this task is a placeholder layout wire-up — `SampleMapView` will be a stub `<div>` until Phase 5

**Checkpoint**: Snake stepper visible, all 12 nodes laid out, step-click popup works, lint passes. US1 independently testable per quickstart §1.

---

## Phase 4: User Story 2 — Child sample lifecycle visibility (Priority: P2)

**Goal**: Show a child-samples panel below the stepper whenever the selected parent is at Step 9+, listing each child's post-division status. Selecting a child scopes the stepper's highlighted segment (steps 9–12) to that child's progress and routes step-click events to child-specific events.

**Independent Test**: Select `PRNT-8810-D`, confirm Child Samples panel appears with 2 children and per-step pips (steps 10/11/12); click a child row and verify the stepper dims pre-division steps and updates its post-division colours; click a completed post-division step and confirm the popup shows the child's event, not the parent's. Quickstart §2 is the full checklist.

### Implementation for User Story 2

- [x] T014 [P] [US2] Implement `ChildSamplePanel` in `src/components/sample-tracking/ChildSamplePanel.tsx`: accept props `{ parentId: string; children: ChildSample[]; activeChildId: string | null; onSelectChild: (id: string | null) => void }` per `contracts/screen-contract.md §2.2`; render a `<section>` with heading "Child Samples" (same label-caps + Clock icon pattern as the stepper card header); render a `<ul>` where each `<li>` is a `<button>` showing: division badge (letter A/B/C in a small indigo circle), child ID in `data-mono`, current step name from `STEP_DEFINITIONS[child.currentStepIndex].title`, and three pip indicators for steps 10/11/12 — each pip is a `w-3 h-3 rounded-full` (emerald filled when completed, indigo with animate-pulse when current, `bg-slate-100` when pending); the active child row has `bg-indigo-50 ring-2 ring-primary-indigo` background; clicking a selected row calls `onSelectChild(null)` (deselects); render the "No child samples linked yet" empty state when `children.length === 0`
- [x] T015 [US2] Add child state to `src/components/SampleTrackingView.tsx`: add `const [activeChildId, setActiveChildId] = useState<string | null>(null)` and reset it to `null` inside `handleSampleChange`; derive `activeChild: ChildSample | undefined` by looking up `CHILD_SAMPLES.filter(c => c.parentId === selectedSampleId).find(c => c.id === activeChildId)`; derive `parentChildren: ChildSample[]` as `CHILD_SAMPLES.filter(c => c.parentId === selectedSampleId)`
- [x] T016 [US2] Render `ChildSamplePanel` in `src/components/SampleTrackingView.tsx` inside the stepper view-mode block (below the stepper card, in the left 8-column area): render only when `selectedSample.currentStepIndex >= 9`; pass `parentId={selectedSample.id}`, `children={parentChildren}`, `activeChildId={activeChildId}`, `onSelectChild={setActiveChildId}`
- [x] T017 [US2] Update the `SnakeStepper` call in `src/components/SampleTrackingView.tsx` to pass `highlightRange={activeChildId ? { from: 9, to: 11 } : null}` so that when a child is active, pre-division nodes (indices 0–8) receive `opacity-50 pointer-events-none` and post-division nodes (9–11) remain fully interactive (the `highlightRange` prop was included in `SnakeStepper` props in T008)
- [x] T018 [US2] Update `handleStepClick` in `src/components/SampleTrackingView.tsx` to be child-aware: when `activeChildId !== null` and `idx >= 9`, pull the step event from `activeChild.events[idx - 9]` (if `activeChild` is defined and has that event) instead of `STEP_EVENTS[selectedSampleId][idx]`; keep the existing parent-path for `idx < 9` unchanged; the popup's sample-context row (the `<div>` showing `selectedSample.id` in the footer) must display the active child ID when a child event is shown: pass a `contextLabel` to the popup or compute it inline as `activeChildId && idx >= 9 ? activeChildId : selectedSample.id`

**Checkpoint**: Child panel appears/disappears at correct step threshold, child selection scopes the stepper, child popup shows child-specific event. US2 independently testable per quickstart §2.

---

## Phase 5: User Story 3 — GPS Map View (Priority: P3)

**Goal**: Add a Leaflet map accessible via the "Map" toggle that plots parent and child GPS pins as coloured route polylines and shares the existing step detail popup via pin clicks.

**Independent Test**: Toggle to Map mode on `PRNT-8810-D` — indigo pins for parent steps 1–9 + 11–12 (2 SYSTEM pins absent), emerald + amber child routes from step 9 forward, legend present; click pin #5 → popup opens; toggle back to Stepper → same sample still selected, same child still active. Quickstart §3 is the full checklist.

### Implementation for User Story 3

- [x] T019 [P] [US3] Install Leaflet default icon workaround in `src/main.tsx`: after `import 'leaflet/dist/leaflet.css'` add the standard Leaflet-webpack/Vite icon-path fix — `import L from 'leaflet'; import iconUrl from 'leaflet/dist/images/marker-icon.png'; import iconShadow from 'leaflet/dist/images/marker-shadow.png'; L.Marker.prototype.options.icon = L.icon({ iconUrl, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] })` — this prevents broken marker images in Vite builds
- [x] T020 [US3] Add GPS route computation helpers to `src/data/sample-tracking-mock.ts`: export a function `buildParentRoute(sampleId: string): SampleRoute` that collects `{ stepNum, coord, status, eventRef }` for every completed step event that has a non-null coord, builds the polyline array, and returns a `SampleRoute` with `kind: 'parent'`; export a function `buildChildRoutes(parentId: string): SampleRoute[]` that does the same for each child in `CHILD_SAMPLES` with matching `parentId`, setting `kind: 'child'`; both functions must handle zero-coord steps gracefully (skip them in `pins` and `polyline`)
- [x] T021 [US3] Implement `SampleMapView` in `src/components/sample-tracking/SampleMapView.tsx`: import `{ MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap }` from `react-leaflet`; accept props `{ parentRoute: SampleRoute; childRoutes: SampleRoute[]; onPinClick: (sampleId: string, stepIdx: number) => void }` per `contracts/screen-contract.md §2.3`; render the map at `className="h-[520px] w-full rounded-2xl overflow-hidden border border-border-slate"` inside a wrapping div; use `<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />`; render parent route pins in indigo (`color: '#4F46E5'`), child routes cycling through `['#10B981', '#F59E0B', '#8B5CF6']` per child index; render a `<Polyline>` per route from the `polyline` coords array
- [x] T022 [US3] Add numbered pin markers to `SampleMapView.tsx`: for each pin in `parentRoute.pins` and each child route's pins, create a custom Leaflet `DivIcon` showing the step number in a small circle coloured by status (emerald for completed, red for breach); the `<Marker>` `eventHandlers.click` callback calls `onPinClick(route.sampleId, pin.stepNum - 1)` (converting 1-based stepNum to 0-based stepIdx for `handleStepClick`); add a `<Tooltip>` showing `Step ${pin.stepNum}: ${STEP_DEFINITIONS[pin.stepNum - 1].title}` so pin labels are visible on hover
- [x] T023 [US3] Add auto-fit-bounds to `SampleMapView.tsx`: implement a small inner component `FitBounds({ coords }: { coords: Coord[] })` that calls `useMap().fitBounds(coords.map(c => [c.lat, c.lng]))` inside a `useEffect` keyed to `coords`; render it inside `<MapContainer>` so the map auto-zooms to contain all parent + child pins whenever the selected sample changes
- [x] T024 [US3] Add the map legend to `SampleMapView.tsx`: position an absolutely placed card (bottom-left `absolute bottom-4 left-4 z-[1000]`) inside the map container showing: a row per route (colour swatch + label "Parent" / "Child A" etc.), a row for "Completed" (emerald) and "Breach" (red), and "Steps without GPS: N" derived from the total number of null-coord steps in the selected sample's event list; style using `bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-border-slate text-[10px] label-caps` and existing CSAAS tokens
- [x] T025 [US3] Wire `SampleMapView` into `src/components/SampleTrackingView.tsx`: derive `parentRoute = useMemo(() => buildParentRoute(selectedSampleId), [selectedSampleId, effectiveStepIndex])` and `childRoutes = useMemo(() => buildChildRoutes(selectedSampleId), [selectedSampleId])` (memoised per research R-008); in the map canvas area (the `className={viewMode === 'map' ? '' : 'hidden'}` div from T013), replace the stub div with `<SampleMapView parentRoute={parentRoute} childRoutes={childRoutes} onPinClick={(sampleId, stepIdx) => { const event = sampleId === selectedSampleId ? STEP_EVENTS[sampleId]?.[stepIdx] : CHILD_SAMPLES.find(c => c.id === sampleId)?.events[stepIdx - 9]; if (event) setActiveStep({ event, def: STEP_DEFINITIONS[stepIdx], stepNum: stepIdx + 1 }); }} />`

**Checkpoint**: Map renders with parent + child routes and shared popup. Switching back to Stepper preserves state. Lint passes. Full US3 testable per quickstart §3.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, accessibility pass, and regression checks across all three stories.

- [x] T026 [P] Run `npm run lint` (`tsc --noEmit`) and fix any TypeScript type errors introduced across `src/types.ts`, `src/data/sample-tracking-mock.ts`, `SampleTrackingView.tsx`, and the three new component files
- [x] T027 Verify aria attributes on new components: confirm `SnakeStepper` renders `aria-current="step"` on the current node, `aria-disabled="true"` on pending nodes, `aria-hidden="true"` on connector arcs and polylines; confirm `ChildSamplePanel` row buttons have descriptive `aria-label` attributes; confirm `SampleMapView` markers have a `title` attribute (via the `DivIcon` `className` containing a visible number)
- [ ] T028 Run the full `quickstart.md` regression checklist manually (pending user review at http://localhost:3001): US1 viewport test (§1), US2 child panel test (§2), US3 map view test (§3), and all four regression checks in §4 (scan overlay, biometric card, chain-of-custody card, process breadcrumb)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 (needs `ProcessStepNode` type, `STEP_DEFINITIONS` from mock)
- **US2 (Phase 4)**: Depends on Phase 2 (needs `ChildSample`, `CHILD_SAMPLES`) and Phase 3 (needs `SnakeStepper`'s `highlightRange` prop)
- **US3 (Phase 5)**: Depends on Phase 2 (needs `SampleRoute`, GPS coords, `buildParentRoute`) and Phase 3 (needs view-mode state + the `hidden` map mount from T013)
- **Polish (Phase 6)**: Depends on Phases 3, 4, 5

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 — independent MVP deliverable
- **US2 (P2)**: Starts after Phase 3 (needs `SnakeStepper` with `highlightRange`)
- **US3 (P3)**: Can start after Phase 3 (map component is independent of US2; view-mode stub from T013 is needed)

### Within Each Phase

- T008, T009, T010 can be drafted in one editing session on `SnakeStepper.tsx` (same file, sequential — no parallel marker)
- T014 (ChildSamplePanel) and T015 (SampleTrackingView state) can be worked in parallel [P] as they touch different files
- T019, T020, T021 in Phase 5 can be started in parallel [P] once Phase 3 is done

### Parallel Opportunities

```bash
# Phase 4 — US2 parallel start:
T014  # ChildSamplePanel.tsx (new file — independent of other US2 work)
T015  # SampleTrackingView.tsx state additions (different concern from T014)

# Phase 5 — US3 parallel start:
T019  # main.tsx icon fix (independent)
T020  # sample-tracking-mock.ts route builders (independent)
T021  # SampleMapView.tsx base map (independent)
```

---

## Implementation Strategy

### MVP First (US1 Only — Phases 1–3)

1. Phase 1: Setup (install deps, stubs)
2. Phase 2: Foundational (types + mock data extraction + GPS coords)
3. Phase 3: US1 (snake stepper + view toggle stub)
4. **STOP** → run quickstart §1 → confirm snake layout on 1440×900
5. Demo/review: the page is dramatically improved already

### Incremental Delivery

1. Phases 1–3 → **US1 MVP**: Snake stepper, no scroll, popup preserved
2. Phase 4 → **US2**: Child panel + scoped highlight → closes audit gap
3. Phase 5 → **US3**: Full GPS map view → additive demo layer
4. Phase 6 → Polish: A11y + regression hardening

---

## Notes

- Each task is scoped to a **single file or discrete concern** — implementer should not need to touch multiple unrelated areas in one task
- `SampleTrackingView.tsx` is touched in T005, T011, T012, T013, T015, T016, T017, T018, T025 — execute these sequentially or carefully merge edits
- Leaflet's CSS and icon-path fix (T002, T019) MUST be done before any map renders or the map will be blank / icons broken
- The `display:none` mount strategy (T013) is intentional per research R-008 — do NOT unmount the map on toggle
- GPS coordinates in T006 are the canonical source of truth; copy them exactly to avoid visual scatter on the demo map
