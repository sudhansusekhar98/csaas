# Quickstart: QR Reprint, Dispatch Portal, Sample Allocation & Lab QR Scan

**Feature**: `009-tracking-stepper-map` (multi-feature batch)
**Date**: 2026-05-20

## 0. Pre-requisites

```powershell
git checkout 009-tracking-stepper-map
npm install
npm run dev   # http://localhost:3001 (or 3000 if free)
```

## 1. QR Code Reprint Request

1. Navigate to **Sample Collection** in the sidebar.
2. Find any collection record with a printed QR code. Click **Request Reprint**.
3. Modal appears pre-filled with the Sample ID. Select reason "Label damaged" → click **Submit Request**.
4. Navigate to **Personnel** (admin). A badge `(1)` should appear on the "Reprint Requests" tab.
5. Open the tab. See the pending request. Click **Approve**.
6. Return to Sample Collection. The "Print QR" button is now re-enabled for that sample.
7. Repeat with **Division Station** for a child bag QR — same flow.

✅ Pass: requests visible in admin, print re-enabled after approval.

## 2. Administrator Dispatch Portal

1. Navigate to **Dispatch Portal** in the Administration sidebar section.
2. Add a new location: Name = "NABL Lab Hyderabad", Code = "NLH", Address = "Banjara Hills, Hyderabad". Click **Add Location**.
3. Use ↑/↓ arrows to move it to sequence position 2.
4. Verify the sequence table updates: Bag B now maps to "NABL Lab Hyderabad".

✅ Pass: location added, sequence updated, table reflects new assignment.

## 3. Sample Allocation to Lab (updated — in-panel flow)

1. Navigate to **Division Station**. Open a session where all bags are **not yet** sealed (e.g., DIV-8822-X / IN_PROGRESS).
2. Complete bagging — enter weight + assign operator for each bag, then click **Seal All Child Bags**.
3. After all bags are sealed, verify the **Sample Allocation** section appears **inside the right panel** (no separate card below the grid, no scrolling required).
4. Verify the allocation labels include the parent ID — e.g., **PRNT-8822-X-A** → Lab Dispatch, **PRNT-8822-X-B** → CIL Central Lab, **PRNT-8822-X-R** → CIMFR Testing Centre. No dropdown shown.
5. Click **Confirm Dispatch**. The right panel updates to show the read-only allocation summary and the **Finalise Division Session** button, all in the same panel.
6. Click **Finalise Division Session**. Session status becomes COMPLETED.
7. Navigate to **Lab Receiving**. Confirm only the `-A` (lab-bound) child sample appears in the pending queue (not B or R).

✅ Pass: allocation appears inline in right panel; labels include parent ID; non-lab children absent from Lab Receiver.

## 4. Lab Receiver QR Scan Widget

1. Navigate to **Lab Receiving**.
2. Click **Receive** on a pending row (e.g., SUB-M-8820-A). The QR widget updates to show that sample's ID pattern.
3. Click **Simulate Scan**. Brief ring animation plays on the QR grid, then the form auto-fills and the sample advances to "Received".
4. Verify the stat chip "Received Today" increments.

✅ Pass: scan simulation auto-fills and confirms receipt without manual form entry.

## 5. QR Reprint from Child Samples (Sample Tracking)

1. Navigate to **Sample Tracking**. Select sample `PRNT-8810-D` (step 11 — past division).
2. The **Child Samples** panel is visible, listing `CHLD-8810-D-01` (lab-bound child).
3. On the child row, click **Request Reprint**. The `ReprintRequestModal` opens with the child sample ID pre-filled and `qrType: 'child'`.
4. Select reason "Scan failure" → click **Submit Request**. Modal closes. The child row now shows "Reprint Pending".
5. Navigate to **Personnel** → **Reprint Requests** tab. Verify the new child sample reprint request appears in the list.
6. Click **Approve**. Return to Sample Tracking → same sample. The child row now shows "Reprint Approved".

✅ Pass: reprint request submitted from tracking, visible in admin, approval reflected back in tracking panel.

## 6. Regression checks

- Existing Lab Receiving receipt flow (manual form fill) still works.
- Splitting Station seal/unseal logic unchanged.
- Sample Collection generate-QR flow unchanged.
- Personnel operator list and activity tabs unchanged.
- `npm run lint` returns zero errors.

---

## APPENDIX — Previous Quickstart: Sample Tracking Snake Stepper + Map (2026-05-19)

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
