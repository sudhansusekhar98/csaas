# Quickstart: Sample Tracking — Snake Stepper, Child Visibility & GPS Map View

**Feature**: `009-tracking-stepper-map`
**Date**: 2026-05-19

This is the manual-demo verification path for the feature once `/speckit-tasks` and `/speckit-implement` are complete. It maps directly to the acceptance scenarios in `spec.md` (US1 / US2 / US3).

## 0. Pre-requisites

```powershell
git checkout 009-tracking-stepper-map
npm install                 # installs react-leaflet + leaflet
npm run dev                 # starts Vite on http://localhost:3000
```

Open `http://localhost:3000` and navigate to **Sample Tracking** via the sidebar.

## 1. US1 — Snake-wise horizontal stepper (P1)

1. With the viewport sized to **1440×900** (Chrome DevTools "Responsive" preset), select sample `PRNT-8820-A` (currently at step 6) from the active-sample dropdown.
2. Confirm:
   - All 12 step nodes are visible on screen at once (no scrolling).
   - Steps 1–5 are emerald (completed), step 6 is indigo and pulsing (current), steps 7–12 are slate-grey outlined (pending).
   - A continuous indigo / slate connector path zig-zags through the 12 nodes including the 180° turn arcs at the row ends.
3. Click step 4 (a completed node). The existing step detail popup opens with the SYSTEM "Parent ID Issuance" event. Close it.
4. Resize the viewport to **768×900**. The stepper re-flows to fewer steps per row but remains horizontal. No vertical scroll.
5. Resize to **400×900**. The stepper degrades to a single vertical column (acceptable fallback below 480px).

✅ US1 passes when all four behaviours above hold.

## 2. US2 — Child sample lifecycle visibility (P2)

1. Back at 1440×900, select sample `PRNT-8810-D` (currently at step 11).
2. Below the snake stepper, the **Child Samples** panel is visible, listing children (e.g., `CHLD-8810-D-A`, `CHLD-8810-D-B`) with their division-badge letters and three step pips for steps 10 / 11 / 12.
3. Click `CHLD-8810-D-A`. The stepper's pre-division portion (steps 1–8) dims; steps 9–12 stay vivid and re-render with the child's status (e.g., child A may be at step 11 with step 12 still pending while parent shows step 11).
4. Click step 11 in the highlighted region. The popup opens with the **child's** operator/location event, not the parent's. The footer shows `Sample: CHLD-8810-D-A`.
5. Click `CHLD-8810-D-B`. Highlighted segment updates to that child's status without a page reload.
6. Switch to `PRNT-8820-A` (step 6, pre-division). The Child Samples panel disappears.

✅ US2 passes when the panel appears/disappears at the right threshold and child-scoped clicks reveal child-scoped events.

## 3. US3 — GPS Map View (P3)

1. Still on `PRNT-8810-D`, click the **Map** segment in the new header toggle.
2. The Leaflet map renders centred over the notional coal-handling site (approx 17.54° N, 78.50° E). Numbered indigo pins mark each completed step's GPS coordinate. An indigo polyline connects them in step order.
3. Two child routes (emerald and amber, distinct from indigo) branch off after the Division Station pin (step 9), each ending at slightly offset lab pins.
4. The bottom-left legend reports pin status colours, parent/child route colours, and "2 steps without GPS coordinates" (the two SYSTEM steps 4 and 10).
5. Click pin **#5** on the map. The same step detail popup that the stepper uses opens, with the VMS Path Tracking event. Close it.
6. Click **Stepper** to switch back. The same sample (`PRNT-8810-D`) and the previously active child remain selected; the dim/highlight state is preserved. The toggle transition is visually under 400 ms.

✅ US3 passes when pins render, both parent and child routes show, the popup is shared with the stepper, and toggling preserves state.

## 4. Regression checks (must remain green)

- "Scan Next Phase" button still opens the simulated scanner overlay and advances the parent sample's step when verified.
- The right-column "Biometric Verification" and "Chain of Custody Data" cards are unchanged.
- The `ProcessBreadcrumb` at the top of the page still shows step 2 ("Sample Tracking") highlighted.
- `npm run lint` (TypeScript `tsc --noEmit`) returns no errors.

## 5. Known acceptable gaps for v1

- Manual visual testing only (no automated test suite is configured for this prototype).
- Map tiles require internet access; no offline fallback (per assumption in spec).
- Mobile viewports below 480px fall back to vertical stack (per spec).
