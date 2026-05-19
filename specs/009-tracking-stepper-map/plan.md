# Implementation Plan: Sample Tracking — Snake Stepper, Child Visibility & GPS Map View

**Branch**: `009-tracking-stepper-map` | **Date**: 2026-05-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-tracking-stepper-map/spec.md`

## Summary

Replace the vertical 12-step Process Protocol Stepper on the Sample Tracking page with a snake-wise horizontal layout that fits a 1440×900 viewport without scrolling, surface per-child lifecycle status from Step 9 (Division Logic) onward in a dedicated panel that re-scopes the stepper's post-division segment, and add a Map View toggle that plots each scan event on a geographic map using the GPS coordinate captured at scan time — reusing the existing step detail popup for both stepper-click and pin-click affordances.

Implementation is entirely a client-side React/TypeScript change on the existing single-page prototype, scoped to `src/components/SampleTrackingView.tsx` and a small number of new presentational components. The map uses `react-leaflet` with OpenStreetMap tiles (no API key); GPS coordinates are added as static demo data per step template, anchored around a notional Indian coal-handling facility. Parent–child sample shape is aligned with the data model already drafted in spec 007 (`child-sample-lab-handover`).

## Technical Context

**Language/Version**: TypeScript 5.8, React 19.0.1, ES2022 modules

**Primary Dependencies**: `react` 19, `motion/react` (12.23), `lucide-react` (0.546), Tailwind CSS 4.1, Vite 6.2 — all already present. New: `react-leaflet` (^4.2) + `leaflet` (^1.9) for the Map View.

**Storage**: None — in-memory React state on canned demo data structures (`SAMPLES`, `STEP_TEMPLATES`, new `CHILD_SAMPLES`).

**Testing**: Manual demo validation (per existing prototype convention); `tsc --noEmit` for type safety via `npm run lint`. No unit test framework is currently configured in this prototype, and adding one is out of scope.

**Target Platform**: Modern evergreen browsers (Chrome / Edge / Firefox / Safari) on desktop; primary demo target is a 1440×900 viewport. Tablet (≥768px) supported as graceful degradation; <480px allowed to fall back to vertical stack.

**Project Type**: Single-page web application (Vite + React) — `src/` only, no backend.

**Performance Goals**: View-mode toggle visible transition < 400 ms (matches SC-003). Map first paint with pins < 500 ms on a typical demo laptop. No re-fetch on toggle.

**Constraints**: Must not regress the existing step detail popup, sample dropdown, scan overlay, or process breadcrumb. Must not alter unrelated routes/views. Tile loading must work over standard internet (no offline requirement); a sensible empty-tile fallback acceptable for demo.

**Scale/Scope**: 5 canned parent samples (existing), 2–3 children per parent past Step 9 (new), 12 step nodes per sample, ≤ 12 GPS pins per parent route + ≤ 4 per child route. Total LOC delta target: ~600–900 lines in `SampleTrackingView.tsx` + 3 new files.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution at `.specify/memory/constitution.md` is currently a placeholder template with no ratified principles (sections still contain `[PRINCIPLE_N_NAME]` markers). No concrete gates can be evaluated, so this check is **informational only** and treated as passing by default. If/when the constitution is filled in (e.g., test-first, complexity caps, etc.), this plan should be re-evaluated against those principles.

Self-imposed gates we are honouring anyway:

- **No regressions** to existing Sample Tracking interactions (popup, scan overlay, dropdown).
- **Reuse over rewrite**: step detail popup is shared by stepper clicks and map pin clicks.
- **No new global state library**: stays on React's `useState` / derived state — same pattern as the rest of the prototype.
- **No new design tokens**: all new UI uses existing CSAAS Tailwind tokens (primary indigo, success emerald, slate scale, label-caps).

→ **GATE: PASS (informational)**.

## Project Structure

### Documentation (this feature)

```text
specs/009-tracking-stepper-map/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── screen-contract.md   # UI contract for the Sample Tracking screen
└── checklists/
    └── requirements.md      # From /speckit-specify
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── SampleTrackingView.tsx          # MODIFIED — adds snake stepper, child panel, view-mode toggle
│   └── sample-tracking/                # NEW subfolder for feature-scoped pieces
│       ├── SnakeStepper.tsx            # NEW — horizontal snake stepper with connectors
│       ├── ChildSamplePanel.tsx        # NEW — children list with mini-status indicators
│       └── SampleMapView.tsx           # NEW — react-leaflet map with parent+child routes
├── data/
│   └── sample-tracking-mock.ts         # NEW — extracted demo data: parents, children, step events, GPS coords
└── types.ts                            # MODIFIED — add Coord, ChildSample, SampleRoute, ViewMode types
```

**Structure Decision**: Single-project layout (the existing Vite SPA). All work lives under `src/`. New components nest under `src/components/sample-tracking/` to keep the feature surface coherent and avoid bloating the components root. Canned data is moved out of the component file into `src/data/sample-tracking-mock.ts` to keep `SampleTrackingView.tsx` focused on rendering and state.

## Complexity Tracking

No constitution violations to justify. One judgment call worth noting:

| Decision | Why | Alternative considered |
|---|---|---|
| Add `react-leaflet` + `leaflet` as new deps | The user explicitly asked for a "Map View … using the operator's GPS"; an SVG-fake of a facility map would not honour the request and forecloses any later swap to real device coords. Leaflet is BSD-licensed, key-free with OSM tiles, ~140 KB gzip — acceptable for a prototype. | SVG illustrated site-plan with positioned dots (no extra deps). Rejected because it can't pan/zoom and reviewers asked for an actual map. Mapbox GL / Google Maps rejected: require API keys, friction for a demo. |
