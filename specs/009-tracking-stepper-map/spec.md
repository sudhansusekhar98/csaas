# Feature Specification: Sample Tracking — Snake Stepper, Child Visibility & GPS Map View

**Feature Branch**: `009-tracking-stepper-map`

**Created**: 2026-05-19

**Status**: Draft

**Input**: User description: "In the Process Protocol Stepper of the Sample Tracking page, the sample status currently only shows updates for parent samples, while the child sample trackings are not displayed. Additionally, the status should be arranged in a snake-wise horizontal flow instead of a vertical alignment, as requiring users to scroll down is not an ideal UX design. We also need to add a Map View to track samples using the operator's GPS. Please create a UI/UX design for this enhancement."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Snake-wise horizontal stepper (Priority: P1)

A supervisor opens the Sample Tracking page and immediately sees the full 12-step Process Protocol laid out horizontally in a snake pattern (left-to-right, then right-to-left, etc.) that fits within the visible viewport on a standard desktop monitor, without scrolling. Step status (completed / current / pending) is recognizable at a glance through colour, icon state, and a flowing path that visually connects each step to the next.

**Why this priority**: This is the most-used view in the prototype demos. Forcing reviewers to scroll vertically through 12 large step cards breaks the "operational dashboard" perception the product is trying to convey. Fixing the layout delivers the largest perceived quality jump per unit of work, and is a prerequisite to fitting child rows + a map toggle on the same page.

**Independent Test**: Load `/sample-tracking` on a 1440×900 viewport, pick any sample from the dropdown, and confirm the entire 12-step path renders in the visible area (above the fold), with completed / current / pending states distinguishable without interaction. Clicking a completed step still opens the existing step detail popup.

**Acceptance Scenarios**:

1. **Given** the user has selected a parent sample at step 5, **When** the Process Protocol Stepper renders, **Then** all 12 steps are visible in a snake pattern within the viewport with no vertical scrolling required, steps 1–4 are styled "completed", step 5 is "current", and steps 6–12 are "pending".
2. **Given** the viewport is resized to a tablet width (~768px), **When** the stepper re-renders, **Then** the snake layout adapts (fewer steps per row, more rows) but never collapses back to a single vertical column unless the viewport is narrower than 480px.
3. **Given** the user clicks a completed step in the horizontal layout, **When** the click is registered, **Then** the existing step detail popup opens with the same operator / location / FRS data shown today.

---

### User Story 2 - Child sample lifecycle visibility (Priority: P2)

When a parent sample reaches Step 9 (Division Logic), it generates child sub-samples. From that point onward, an investigator can see — in the same Process Protocol view — not just the parent's status but the per-child status across the post-division steps (ID Linkage, Lab Dispatch, Lab Authentication). The interface makes the parent→children fan-out visually obvious without requiring a separate page or modal.

**Why this priority**: This closes a real gap in the audit story: today the view stops being useful once division happens, because every child travels independently to the lab. Investigators currently cannot answer "where is child 8822-X-A right now?" from this screen. It is P2 (not P1) because it is conceptually a larger change than the layout fix and depends on the snake layout (P1) to have room for child rows.

**Independent Test**: Pick a sample that has passed Step 9 (e.g., `PRNT-8810-D` at step 10+). Verify that a child-samples region appears below or alongside the parent snake, listing each child sample ID with its own mini-status (which of the post-division steps it has cleared). Clicking a child opens the same step detail popup but scoped to that child's events.

**Acceptance Scenarios**:

1. **Given** a parent sample whose current step is < 9 (pre-division), **When** the page renders, **Then** no child-samples region is shown, and the stepper behaves exactly as in User Story 1.
2. **Given** a parent sample whose current step is ≥ 9, **When** the page renders, **Then** a "Child Samples" panel appears showing each child sample's ID, current post-division phase, and a compact status indicator for each of steps 10, 11, 12.
3. **Given** a child sample row is displayed, **When** the user clicks it, **Then** the main stepper highlights the post-division portion (steps 9–12) reflecting that child's progress, and clicking a completed step opens the step detail popup for the child's own operator/location/FRS event (not the parent's).
4. **Given** two children of the same parent are at different steps (e.g., child A at step 11, child B at step 10), **When** the user toggles between them, **Then** the highlighted stepper segment updates without reloading the page.

---

### User Story 3 - GPS Map View of sample movement (Priority: P3)

An operations lead switches to a "Map View" tab on the Sample Tracking page and sees the geographic path each scanned sample has taken — pins for each step's capture location (yard, weighbridge, sealing bay, prep room, division station, lab) — anchored by GPS coordinates recorded when each operator's scan event was captured. The pins are colour-coded by step status, and a polyline connects them in chronological order to show the chain of custody as a route.

**Why this priority**: This is genuinely additive: it complements the stepper rather than replacing it. It is P3 because the snake layout (P1) and child visibility (P2) are corrections to a screen people already use; the map is new functionality whose value depends on the prior two being present. It also has the largest open-question surface (basemap provider, GPS-source assumptions) and the lowest immediate demo impact.

**Independent Test**: With User Stories 1 and 2 in place, click a "Map View" toggle in the Sample Tracking header. A map renders showing pins for each completed step's location with the operator's recorded GPS coordinates, connected by a route line in step order, and a legend explains the pin colours. Selecting a different sample updates the pin set.

**Acceptance Scenarios**:

1. **Given** the user is on Sample Tracking in "Stepper" mode, **When** they click "Map View", **Then** the stepper area is replaced by a map showing pins for every completed step of the currently selected sample, with each pin labelled by its step number.
2. **Given** a parent sample is selected on the map, **When** the parent's children also have movement events, **Then** the route of each child after division is rendered in a distinct colour so parent and child paths are visually separable.
3. **Given** the user clicks a pin on the map, **When** the pin's underlying step event is found, **Then** the same step detail popup used in the stepper opens — same FRS capture, operator, timestamp.
4. **Given** the user switches back to "Stepper" mode from the map, **When** the toggle is clicked, **Then** the same sample remains selected and its stepper state is preserved without re-fetching.

---

### Edge Cases

- **Pre-division sample on map**: When a sample has only pre-division steps logged (e.g., step 3), the map should show pins only for those locations, with no child routes rendered.
- **Compromised seal events**: If a step's FRS scan or seal verification recorded a breach, both the stepper node and the map pin must use the existing breach/danger styling (red), distinct from `completed` green.
- **Missing GPS coordinate for a legacy step**: If a step event has no recorded coordinate (older records pre-GPS-capture), the pin is omitted from the map but the step is still shown in the stepper, and the map's legend notes "N steps without GPS coordinates."
- **Very narrow viewport (<480px)**: Snake layout degrades gracefully to a single vertical column with anchor links between rows; child panel stacks beneath.
- **Sample with >12 events** (re-scans/exceptions): Stepper still shows exactly 12 nodes; extra events surface inside the step detail popup as an event history list, not as additional nodes.
- **No children even past Step 9** (data anomaly): If a parent is at step ≥ 9 but has zero linked children, the child panel renders an empty-state with a clear message; main stepper continues to show parent state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Process Protocol Stepper on the Sample Tracking view MUST render all 12 process steps in a single snake-wise horizontal layout (rows alternating left-to-right and right-to-left, joined at the ends) on viewports ≥ 1024px wide, with no vertical scrolling required to see step 12.
- **FR-002**: Each step node MUST visually convey its state (completed, current, pending, or breach) using both colour and an icon/shape variation, so that the state is distinguishable in a screenshot without colour-only reliance.
- **FR-003**: A connecting path (line or arrow flow) MUST visually link consecutive steps in the snake order, including the 180° turns at row ends, so that the chronological order of steps is unambiguous.
- **FR-004**: Clicking a completed step in the new horizontal layout MUST open the existing step detail popup with no regression in the operator / FRS / location data shown today.
- **FR-005**: When the active sample is at Step 9 or later, the page MUST display a "Child Samples" region listing every child sample derived from that parent, including each child's ID, current step name, and a compact indicator for each post-division step (10, 11, 12).
- **FR-006**: Selecting a child sample row MUST visually scope the post-division portion of the main stepper (steps 9–12) to that child's progress and rewire step-click events to surface that child's step detail records.
- **FR-007**: The page MUST offer a toggle (in the existing sticky header area) that switches the main visualization between "Stepper" mode and "Map View" mode without navigating away from the page.
- **FR-008**: In Map View, the page MUST render a geographic map showing one pin per completed step of the currently selected sample, positioned by the GPS coordinate recorded at scan time, labelled by step number, and coloured to match the stepper's status legend.
- **FR-009**: In Map View, consecutive pins of the same sample MUST be connected by a route polyline in chronological step order; child sample routes (post-division) MUST be drawn in a colour distinct from the parent route.
- **FR-010**: Clicking a map pin MUST open the same step detail popup used in the stepper, sourced from the same step-event record.
- **FR-011**: Switching between Stepper and Map View MUST preserve the currently selected sample, child selection, and recently-opened step popup state.
- **FR-012**: The system MUST record (or, in the prototype, simulate) a GPS coordinate for every operator scan event such that the Map View has a non-empty source for every step that has been completed by a human operator. System/auto steps (e.g., DB sync) MAY be omitted from the map but must remain in the stepper.
- **FR-013**: The Map View MUST show a legend explaining pin colours, parent vs. child route styling, and indicating how many of the current sample's events lacked GPS coordinates (if any).
- **FR-014**: All new UI elements MUST follow the existing CSAAS design tokens (primary indigo, success emerald, warning amber, slate text scale, label-caps typography) and reuse the existing `motion/react` transitions for state changes.

### Key Entities

- **Process Step Node**: A renderable node in the stepper representing one of the 12 protocol steps, with state (completed / current / pending / breach), a position in the snake layout (row, column, direction), an icon, and a link to its step-event record when completed.
- **Step Event**: An existing record tying a step to its operator, badge, FRS capture, location text, verification method, timestamp, and (newly) a GPS coordinate. Used by both stepper popup and map pin.
- **Child Sample**: A sub-sample produced at Step 9 (Division Logic), with its own ID, parent reference, current step index (10–12), and an independent series of post-division step events.
- **Sample Route**: An ordered list of step events for one sample (parent or child), used to render the chronological polyline in Map View.
- **View Mode**: The current visualization mode of the page, one of `stepper` or `map`, shared across the header toggle and main canvas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a 1440×900 desktop viewport, a user can identify the current step of any selected sample within 3 seconds of page load without scrolling.
- **SC-002**: For any sample past Step 9, a user can identify which child samples have reached the lab (Step 12) within 5 seconds of selecting that parent, without opening any popup.
- **SC-003**: Switching between Stepper and Map View completes a visible transition in under 400 ms on a typical demo laptop, and preserves the selected sample and child in 100% of switches.
- **SC-004**: In user-testing walkthroughs of the prototype, at least 4 of 5 reviewers can answer "where is child sample X right now, and what was the last location it was scanned at?" using only the Sample Tracking page, without help.
- **SC-005**: The Sample Tracking page produces zero new vertical-scroll events on a 1440×900 viewport for samples at any step from 1 to 12 (parents) or any post-division state (children).

## Assumptions

- The prototype operates on canned demo data (the existing `SAMPLES` / `STEP_TEMPLATES` arrays in `SampleTrackingView.tsx`); GPS coordinates will be added as static demo values to each step template, not sourced from a live device.
- Children created at Step 9 follow the parent's pre-division path (steps 1–8) and only diverge from Step 10 onward; this is consistent with the spec 007 (`child-sample-lab-handover`) data model.
- The Map View is read-only for v1: users can pan, zoom, click pins, and toggle layers, but cannot edit coordinates or routes from the UI.
- A web-mappable basemap (tiles or vector) acceptable for an internal prototype demo will be selected during planning; offline-only is not required.
- The existing step detail popup component is the canonical surface for step-event details and will be reused unchanged by both the new horizontal stepper and the new map pins.
- Mobile-narrow (<480px) is out of scope as a primary target for v1; the layout is allowed to fall back to a vertical stack at that width.
- "Operator's GPS" in the user's request is interpreted as the GPS coordinate captured at the moment the operator's scan event occurred — i.e., the location of the scan, not a live device-tracking feed.

## Dependencies

- The Sample Tracking view at `src/components/SampleTrackingView.tsx`, including the `STEP_DEFINITIONS`, `STEP_TEMPLATES`, `SAMPLES`, and `STEP_EVENTS` data structures, is the integration point.
- Spec 007 (`child-sample-lab-handover`) defines child sample IDs and the post-division lifecycle; child data shown in this feature must be consistent with that spec's child model.
- Existing design tokens (Tailwind config), `motion/react` animation library, and `lucide-react` icon set are reused; no new design system is introduced.
