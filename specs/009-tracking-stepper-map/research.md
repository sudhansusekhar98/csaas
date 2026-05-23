# Phase 0 Research: QR Reprint, Dispatch Portal, Sample Allocation & Lab QR Scan

**Feature**: `009-tracking-stepper-map` (multi-feature batch)
**Date**: 2026-05-20 (updated 2026-05-22 — location integration, nomenclature, tracking reprint)

---

## Batch 2 — 2026-05-22

### R-B2-001 — Where the AllocationCard must land (no new view)

- **Decision**: Move `AllocationCard` rendering from the external `col-span-12` card in `SplittingStationView` into `SmallBaggingPanel` as an inline step that appears when all bags are sealed. The "Finalise" button only appears after the operator clicks "Confirm Dispatch" inside the panel. The external card block is deleted.
- **Rationale**: User explicitly stated "No additional view page should be created" and wants location assignment in the same panel as weight/person selection. The right-column `SmallBaggingPanel` is the correct container — it already manages the per-bag sealed state that gates the allocation.
- **Alternatives considered**: Keep AllocationCard outside but visually anchor it — rejected; still requires the operator to scroll.

### R-B2-002 — Child sample label format including parent ID

- **Decision**: Child bag label format is `{parentId}-{bagType}` (e.g., `PRNT-8822-X-A`, `PRNT-8822-X-B`). `parentId` is already available as a prop in `SmallBaggingPanel`. `AllocationCard` receives it as a new required prop.
- **Rationale**: Directly encodes lineage without any new data shape. The dash-suffix convention (`-A`, `-B`) mirrors the existing seal ID pattern (`BAG-A-8822-X`). Consistent with how child tracking IDs are composed (`CHLD-8818-B-01`).
- **Alternatives considered**: `CHD-{numericPart}-{type}` — drops the full parent ID, loses traceability context. Rejected.

### R-B2-003 — Reprint flow for ChildSamplePanel (child samples in tracking)

- **Decision**: `SampleTrackingView` receives `reprintRequests` and `setReprintRequests` as new props threaded from `App.tsx`. `ChildSamplePanel` gets three new props (`onRequestReprint`, `approvedReprintIds`, `pendingReprintIds`) and renders the same three-state control already in `SmallBaggingPanel`. The existing `ReprintRequestModal` is reused with `qrType="child"`.
- **Rationale**: Zero new components needed. The reprint state is already managed at `App.tsx` level and the modal is already written. Only two prop interfaces and one App.tsx render call need updating.
- **Alternatives considered**: Separate reprint state local to SampleTrackingView — would lose cross-view pending count sync (the sidebar badge depends on the centralised state). Rejected.

### R-B2-004 — No changes needed to ReprintRequest type or PersonnelManagementView

- **Decision**: The `ReprintRequest` type already covers child sample IDs (any string). The admin reprint tab in `PersonnelManagementView` already renders all pending requests regardless of source view. No changes to either.
- **Rationale**: Verified by reading `types.ts` (`sampleId: string`), `ReprintRequestModal.tsx` (generic), and the personnel tab logic. New child sample reprint requests from tracking will automatically appear in the admin queue.

---

This document resolves unknowns for four new features. Findings derived from reading the existing component source files.

---

## Feature A: QR Code Reprint Requests

## R-A001 — Where QR codes are generated in the prototype

- **Decision**: Two trigger points — `SampleCollectionView` (parent QR, "Generate QR" step in collection record) and `SplittingStationView` (child bag QRs, "Seal All" / individual bag seal with `sealId`). Both get a companion "Request Reprint" button.
- **Rationale**: These are the only views that render or print QR codes per reading the components. PrepRoom and LabReceiving receive samples but do not generate new QR codes.

## R-A002 — Shared reprint request state location

- **Decision**: Lift `reprintRequests: ReprintRequest[]` and `setReprintRequests` to `App.tsx`, passed as props into `SampleCollectionView`, `SplittingStationView`, and the admin reprint panel.
- **Rationale**: React Context would be cleaner at scale but adds a provider/consumer pattern for a small prototype. Prop-drilling from App is simpler and consistent with how `onNavigate` is already passed.
- **Alternatives considered**: Module-level singleton array — not reactive, won't trigger re-renders. React Context — valid but overkill. Rejected both.

## R-A003 — Admin notification for pending reprint requests

- **Decision**: Display a numeric badge on the "Personnel" sidebar nav item showing the count of `status === 'pending'` reprint requests. The reprint request list is a new tab inside `PersonnelManagementView` (not a separate view) to avoid adding another `ViewType`.
- **Rationale**: Keeps admin navigation clean. Reprint requests are a personnel/admin concern already rooted in Personnel. A tab costs no new route.
- **Alternatives considered**: New sidebar item `'reprint-requests'` — adds clutter to the already-full admin nav. Rejected.

## R-A004 — Reprint reason options

- **Decision**: Dropdown with canned reasons: `['Label damaged', 'Scan failure', 'QR code faded', 'Seal mismatch', 'Lost/misplaced', 'Other']`. "Other" shows a freetext field.
- **Rationale**: Canned list speeds up operator entry and enables reporting by reason. "Other" covers edge cases.

---

## Feature B: Administrator Dispatch Portal

## R-B001 — Dispatch Portal as a new admin view

- **Decision**: New `ViewType: 'dispatch-portal'`, new component `DispatchPortalView.tsx`, added to `adminNav` in `Sidebar.tsx`.
- **Rationale**: Logically separate admin concern with its own CRUD-like interface. Embedding in Personnel or System Health would clutter both.

## R-B002 — Dispatch location sequence representation

- **Decision**: `DispatchLocation` array sorted by `sequence: number` (1, 2, 3…). The sequence defines which bag type maps to which location: sequence 1 = bag type A (Lab), sequence 2 = bag type B, etc. Up/down arrow buttons reorder sequences (drag-to-reorder out of scope for v1).
- **Rationale**: Simple numeric sequence is easy to understand and implement. Matches the language "define their sequences" in the requirement.

---

## Feature C: Sample Allocation to Lab

## R-C001 — Allocation is automatic — no operator choice

- **Decision**: Allocation is **automatic** — no operator choice. When all bags are sealed, the session detail shows a read-only "Sample Allocation" summary card (`allBagsSealed === true`). Child -01 is pre-assigned to the lab; all remaining children are pre-assigned to dispatch locations from the portal sequences. A single **Confirm Dispatch** button advances the session to `DISPATCHED`.
- **Rationale**: Removing the dropdown eliminates a class of operator errors (wrong bag sent to lab). The requirement is explicit: lab assignment is always the first child and is not configurable.
- **Alternatives considered**: Editable dropdown — rejected; the requirement states the lab sample is always child -01 and is not operator-configurable.

## R-C002 — Child -01 is always lab-bound; rest are dispatch-only and NOT tracked

- **Decision**: The first child produced in a division session (index 0, ID suffix `-01`) is **always** marked `isLabBound: true` and auto-assigned for lab dispatch. All subsequent children (`-02`, `-03`, etc.) are `isLabBound: false`, auto-assigned to dispatch locations by portal sequence order, and are **not tracked** further in the system — they do not appear in the stepper Child Samples panel, the GPS map, or the Lab Receiver queue.
- **Rationale**: Requirement states only the lab-bound child needs tracking. The non-lab children go to third-party locations outside the system boundary; the digital trail stops at dispatch confirmation.
- **Alternatives considered**: Tracking all children through separate stepper lanes — rejected. Letting the operator pick which child is lab-bound — rejected per requirement.

---

## Feature D: Lab Receiver QR Scan Widget

## R-D001 — QR code rendering without a library

- **Decision**: Render a static 21×21 SVG grid pattern that visually resembles a QR code. The pattern is deterministic based on the sample ID string (simple hash to fill cells) — makes each sample's QR visually distinct. No real QR encoding needed for demo.
- **Rationale**: Avoids a new dependency (`qrcode.react`). The prototype needs the interaction pattern (scan → receive), not a real scannable code.
- **Alternatives considered**: `qrcode.react` or `qrcode` npm package — adds ~30KB and encoding logic for zero demo benefit. Rejected.

## R-D002 — Scan simulation interaction

- **Decision**: "Simulate Scan" button below the QR widget. When clicked (with a `pending` item selected), it auto-fills the receipt form: sets receiver to the first operator, visual condition to "intact", acceptance status to "accepted", then calls `handleConfirmReceipt`. A scan animation (brief indigo ring flash on the QR grid) precedes the action by 600ms.
- **Rationale**: Makes the demo feel realistic — scan, brief pause, confirmation. Simple enough to implement without extra animation libraries.

## R-LAB-001 — Per-row selection is missing; confirm targets wrong item

- **Decision**: Track `selectedItemId: string | null` in state. All receipt form actions (receiver, acceptance status, visual condition, Confirm Receipt) apply only to the selected item.
- **Rationale**: `handleConfirmReceipt` currently calls `findIndex` for the first `type === 'pending'` item — if an operator selects `SUB-C-8820-A` on screen but another item is first in the array, the wrong item gets confirmed. The fix scopes every mutation to `selectedItemId`.
- **Alternatives considered**: Keep global confirm, add "scan to select" — adds complexity without fixing the root mismatch. Rejected.

## R-LAB-002 — Status lifecycle needs two post-receipt states

- **Decision**: Extend `PendingItem.type` union to `'pending' | 'alert' | 'received' | 'completed'`. Remove the conflated `'done'` state.
- **Rationale**: IS 436 distinguishes physical custody transfer (receipt) from analytical sign-off (completed). Currently both are `'done'`, making it impossible to know whether a sample is waiting for analysis or has cleared it.
- **Status label mapping**:
  - `pending` → "In Transit"
  - `alert` → "Flagged"
  - `received` → "Received"
  - `completed` → "Completed"

## R-LAB-003 — Detail panel pattern reuses existing left-column layout

- **Decision**: Add a selected-item info card above the existing Receipt Record form in the left column (`lg:col-span-4`). Shows: Child Sample ID, Parent ID, Division Label, Weight, Seal status.
- **Rationale**: The existing left column already holds the form. Inserting the detail card above it follows the same vertical card-stack pattern used elsewhere in the prototype. No new layout primitives needed.
- **Alternatives considered**: Right-side slide-over drawer — adds z-index/stacking complexity and hides the table. Rejected.

## R-LAB-004 — Mark Completed needs a guard but no extra form fields

- **Decision**: "Mark Completed" button appears in the detail panel only when the selected item is in `received` state. Single-click action — no additional fields required for v1.
- **Rationale**: Completion is an operator acknowledgement that lab analysis is done. A prototype does not need an analysis result entry. The guard (`type === 'received'`) prevents premature completion.
- **Alternatives considered**: Add analysis result field (out of scope for v1 prototype). Rejected.

## R-LAB-005 — Stat chips need updated count logic

- **Decision**: "Received Today" chip counts `type === 'received' || type === 'completed'`. "Samples in Transit" chip counts only `type === 'pending'`.
- **Rationale**: With the new states, both received and completed represent samples that have cleared the intake gate. The old `type === 'done'` count is replaced.

## R-LAB-006 — Per-row action buttons replace dead ChevronRight

- **Decision**: Replace the `{item.type === 'pending' && <ChevronRight>}` button with a labelled "Receive" button that selects that row and scrolls the left panel into view.
- **Rationale**: The ChevronRight currently has no `onClick` handler — it's dead UI. Replacing it with a clear CTA removes confusion without adding affordances.
- **Alternatives considered**: Keep ChevronRight as a detail trigger and add a second "Receive" button — doubles affordances for no gain. Rejected.

## R-001 — Snake-wise horizontal stepper rendering approach

- **Decision**: Render the 12 steps as a CSS Grid with a fixed step-card width and a configurable `stepsPerRow` (default 6 on ≥1440px, 4 on 1024–1440px, 3 on 768–1024px, 1 below 480px). For odd-indexed rows, reverse the visual order via `flex-direction: row-reverse` so that the chronological flow zig-zags. Connector elements (short horizontal lines between cells, plus 180° elbow connectors at the end of each row) are rendered as positioned pseudo-elements / absolutely-positioned SVG arcs.
- **Rationale**: Pure CSS — no extra dependency, no virtual DOM trickery, predictable responsive behaviour via `@container` or `min-width` breakpoints. Allows `motion/react` to animate per-node state transitions identically to today.
- **Alternatives considered**:
  - **Single SVG drawn from a path generator** (e.g. d3-shape's curve interpolators). Rejected: overkill, adds dependency, makes accessible click targets and hover styles harder.
  - **Horizontal scroll with no wrapping**. Rejected: violates the user's "no scrolling" requirement.
  - **Stepper UI library (e.g. MUI Stepper)**. Rejected: doesn't support snake/zig-zag layout, would introduce a foreign design system into a Tailwind-styled prototype.

## R-002 — Connector visual for row-end 180° turns

- **Decision**: Render row-end turns as a half-pill SVG arc (radius equal to half the step-card height) coloured by the **lesser-progressed** of the two steps it joins (i.e., emerald if both completed, indigo if it crosses the current step, slate-200 if both pending). The arc lives in a single overlay SVG positioned absolutely behind the grid; it has no pointer events.
- **Rationale**: A clean continuous flow line beats per-cell border tricks; computing it once for the overlay is simpler than getting CSS borders to look right at the turn. Keeps node markup clean for clickability.
- **Alternatives considered**: Right-angle elbows (less elegant, looks like a flowchart, not a custody trail). Per-row separate trailing arcs as part of each step card (visually inconsistent across browsers).

## R-003 — Child sample data model & how it relates to the parent step events

- **Decision**: Children are independent sample records keyed by their own ID (e.g., `CHLD-8810-D-A`), each carrying `parentId`, `currentStepIndex` (10–12, since they only exist after Division at step 9), and their own `STEP_EVENTS` array for steps 10–12. Pre-division steps 1–9 of a child are *not* stored separately — they are inherited from the parent (same operator, same FRS, same GPS coords). The Step 9 (Division Logic) event itself is logged once on the parent and surfaces to each child via the same shared reference.
- **Rationale**: Matches spec 007's child handover model. Avoids data duplication for the common pre-division path. Keeps the post-division divergence visible: each child can be at a different step independently.
- **Alternatives considered**: Fully independent child event arrays from step 1 (would balloon demo data and create false divergence pre-division); embedded child status flags inside parent step events (couples model to UI, harder to extend).

## R-004 — Map library choice for the GPS Map View

- **Decision**: `react-leaflet@^4.2` over `leaflet@^1.9`, with OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) as the default tile source.
- **Rationale**: BSD-licensed, no API key, ~140 KB gzipped runtime, plays nicely with React 19, large community, and the OSM tile policy is acceptable for an internal prototype demo. Built-in `Marker`, `Popup`, and `Polyline` cover everything we need without extra plugins.
- **Alternatives considered**:
  - **Mapbox GL JS / Maplibre GL**: nicer rendering but require a tile-server account (Mapbox) or self-hosting (Maplibre). Friction for a demo.
  - **Google Maps**: API key + billing setup, ToS friction.
  - **SVG/illustrated facility map**: would short-circuit the user's explicit request for an actual GPS-based map and remove the option of swapping in real device coordinates later.

## R-005 — Demo GPS coordinates for the 12 steps

- **Decision**: Anchor all coordinates around a notional Indian coal-handling site (Singareni / SECL-like facility). Use a hand-authored set of 12 coordinates within a ~3 km radius around `17.5450° N, 78.5050° E` (Telangana plateau, away from any real-world facility to avoid implying real surveillance). Each `STEP_TEMPLATE` gains a `coord: { lat: number; lng: number } | null` field (null for system/auto steps 4 and 10). Children at steps 11–12 get slightly offset coordinates from the parent's lab pins so child routes don't overlap.
- **Rationale**: A plausible cluster of locations gives the route polyline shape and visual variety; avoiding real coordinates dodges "is this surveillance of a real plant?" questions. ~3 km radius mirrors a realistic coal-handling site footprint.
- **Alternatives considered**: Random global coordinates (route would visually span continents — nonsense); using the dev's actual office coordinates (privacy concerns and demo-irrelevant).

## R-006 — View-mode state management & toggle UX

- **Decision**: Add a single `viewMode: 'stepper' | 'map'` piece of `useState` to `SampleTrackingView`. Render a segmented control in the existing sticky header next to the "Scan Next Phase" button. Switching mode preserves `selectedSampleId`, `stepOffsets`, and `activeChildId`. The step detail popup state (`activeStep`) is also preserved across toggles.
- **Rationale**: Minimal state, lifts directly into the component that already owns related state. Segmented control matches the existing label-caps typographic system. No new context provider needed.
- **Alternatives considered**: Routes (`/sample-tracking/map`) — the prototype uses a single-app view switcher already; adding routing for one toggle is disproportionate. Two-pane "stepper + map side by side" — won't fit at 1440×900 without shrinking both.

## R-007 — Step detail popup reuse from map pins

- **Decision**: Extract the popup's open-with-step-event call into the existing handler (`handleStepClick`) that already accepts an event + step def + step number. Map pins invoke the same handler with the matching `STEP_EVENTS[sampleId][stepIdx]`. No structural change to the popup component itself.
- **Rationale**: Spec FR-004 and FR-010 require the same popup from both surfaces; sharing the handler guarantees parity and avoids drift.
- **Alternatives considered**: Two separate popups (rejected — guaranteed divergence and double maintenance).

## R-008 — Performance & memoisation strategy

- **Decision**: Memoise the derived `routes` (parent + per-child polyline coordinates), `stepperNodes` (with status), and `legendCounts` (GPS-missing tally) via `useMemo` keyed by `selectedSampleId` and `activeChildId`. Leaflet `MapContainer` is mounted once and `<Marker>` / `<Polyline>` children re-render on sample change — but the map instance is not torn down on view-mode toggle (use CSS `display: none` instead of unmounting, so tile state is preserved → SC-003 < 400 ms transition).
- **Rationale**: Avoids re-initialising Leaflet on every toggle, which is the main perf trap with `react-leaflet`. Memoisation prevents unnecessary marker re-renders.
- **Alternatives considered**: Tear-down on toggle (cleaner unmount but flashes white and re-fetches tiles — bad SC-003). Heavy memoisation everywhere (premature; only these three derivations are non-trivial).

## R-009 — Best practices for `react-leaflet` v4 with React 19

- **Decision**: Use the v4 hook-based API (`useMap`, `<MapContainer>`, `<TileLayer>`, `<Marker>`, `<Polyline>`, `<Tooltip>`). Set a fixed `MapContainer` height via Tailwind (`h-[520px]`) so Leaflet's mandatory size invalidation doesn't fight flexbox. Provide a `whenReady` callback that calls `map.invalidateSize()` after the parent transitions in. Import Leaflet's default CSS once at the entry (`src/main.tsx`) — its assets package ships with the marker icon URL trickery already, but we'll override the default icon to a colour-tinted SVG so the prototype's brand stays consistent.
- **Rationale**: Captures the known sharp edges (mount sizing, default icon path issue) up front so the implementer doesn't rediscover them.
- **Alternatives considered**: `react-leaflet` v5 (still in beta during the spec window — risky for a prototype). Imperative Leaflet without the React wrapper (more boilerplate, no obvious win).

## R-010 — Accessibility considerations

- **Decision**: Snake stepper exposes each step node as a `<button>` with `aria-current="step"` on the current node and `aria-label` describing the step number, title, and status. Connector arcs are `aria-hidden`. Child rows are a `<ul>` with `<li><button>` items. Map pins use Leaflet's default keyboard focus (provided by Leaflet ≥ 1.7) plus a `title` attribute carrying the step number and operator name.
- **Rationale**: Honours the spec's "no colour-only reliance" (FR-002) at the AT level too. Keeps the implementation light — full WCAG 2.1 AA audit is out of scope for v1 but the foundations are in place.
- **Alternatives considered**: Skip A11y entirely (rejected — adds no cost to do it right while building).
