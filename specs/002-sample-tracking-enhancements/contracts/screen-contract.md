# Screen Contract: Sample Tracking (Enhanced)

## Route: `/tracking`

**Component**: `src/components/SampleTrackingView.tsx`

---

## Layout Structure

```
<div class="flex flex-col">
  <ProcessBreadcrumb currentStep={2} />          ← above sticky zone
  <sticky header>                                 ← stays at top on scroll
    [Title] [Sample Selector] [Scan Button] [VMS Status]
  </sticky>
  <scrollable content>
    [12-step stepper (col-span-8)] [Right panels (col-span-4)]
  </scrollable>
</div>
```

---

## Sticky Header Contract

**Trigger**: Always visible; sticks to top of scrollable `<main>` area.

**Contents** (left to right):
1. Title block: "End-to-End Tracking" (h1) + "Immutable lifecycle monitoring..." (subtitle)
2. Sample selector dropdown (right-aligned):
   - Label: "Active Sample"
   - Options: 5 samples (ID + current step label)
   - On change: update stepper + CoC panel + reset scan state

3. "Scan Next Phase" button:
   - Icon: QrCode
   - Disabled when `scanStatus === 'scanning'`
   - On click: trigger scan overlay

4. VMS Status chip:
   - "ENCRYPTED FEED" + green pulse dot

---

## Sample Selector Contract

**State**: `selectedSampleId: string` (initialized to `'PRNT-8822-X'`)

**Sample list** (mock data):

| ID | Current Step | Step Label | Seal ID |
|----|-------------|------------|---------|
| PRNT-8822-X | 5 | VMS Path Tracking | QRL-SEC-8822-HY77-1 |
| PRNT-8820-A | 6 | Prep Room Receipt | QRL-SEC-8820-KL42-2 |
| PRNT-8818-B | 8 | Pulverisation | QRL-SEC-8818-MN91-3 |
| PRNT-8815-C | 3 | Sealing Sequence | QRL-SEC-8815-PQ55-4 |
| PRNT-8810-D | 11 | Lab Dispatch | QRL-SEC-8810-RS73-5 |

**Dropdown option format**: `PRNT-XXXX-X — Step N: [Label]`

**On change**:
- Update `selectedSampleId`
- Derive step statuses from `sample.currentStepIndex`
- Reset `scanStatus` → `'idle'`
- Reset `showSealScanner` → `false`

---

## 12-Step Stepper Contract

Steps are derived from `selectedSample.currentStepIndex` at render time:

```typescript
steps.map((step, idx) => ({
  ...step,
  status: idx < currentStepIndex ? 'completed'
        : idx === currentStepIndex ? 'current'
        : 'pending'
}))
```

Visual rules (unchanged from current implementation):
- completed: green filled background, shield-check badge
- current: white background, indigo border, animate-pulse, "Processing..." badge
- pending: opacity-40, grayscale

---

## Scan Overlay Contract

**Trigger**: "Scan Next Phase" button click → `handleSimulateScan()`

**Overlay**: Fixed full-screen, z-50, `bg-slate-950/60 backdrop-blur-md`, centers a card.

### State: Scanning

```
Card (white, rounded-3xl, p-10, w-96):
  - Centered QR code icon (size 64, text-primary-indigo, animate-spin slow)
  - Below: "VERIFYING QR SEAL" (label-caps)
  - Sample ID: data-mono font-bold
  - Progress bar: h-2 bg-slate-100 rounded-full
    - Inner: h-2 bg-primary-indigo rounded-full, width = scanProgress%
    - Animated fill from 0 → 100 over ~2s
  - Status text: "Authenticating seal integrity..."
```

### State: Verified

```
Card (white with green top border accent, rounded-3xl, p-10, w-96):
  - ShieldCheck icon (size 64, text-success-emerald) — motion.div: scale 0→1 spring
  - "SEAL AUTHENTICATED" (label-caps, text-success-emerald)
  - "Chain of custody confirmed." (text-sm)
  - Sample ID badge (bg-emerald-50)
  - Seal ID (data-mono, small)
  - Button: "Advance to Next Phase" (full-width, bg-primary-indigo, text-white)
    → onClick: advanceStep() + closeOverlay()
```

### State: Compromised

```
Card (white with red top border accent, rounded-3xl, p-10, w-96):
  - AlertTriangle icon (size 64, text-red-500) — motion.div: x shake animation
  - "SEAL BREACH DETECTED" (label-caps, text-red-500)
  - "Security violation logged. Supervisor notification sent." (text-sm)
  - Sample ID badge (bg-red-50)
  - Two buttons (side by side):
    - "Raise NCR" (bg-warning-amber, text-white) → triggers NCR context
    - "Close" (border, ghost) → closeOverlay()
```

**Step advancement** (`advanceStep`):
```typescript
// Increment selectedSample.currentStepIndex by 1 (if < 11)
// Update the sample in the samples array
// Close overlay (setShowSealScanner(false), setScanStatus('idle'))
```

---

## Right Panel Contract

The "Chain of Custody Data" card (indigo) must update reactively when `selectedSampleId` changes:

- Parent Sample ID: `selectedSample.id`
- Main Bag QR Seal: `selectedSample.sealId`

The Biometric Verification card (face ID image) is static — not sample-specific.

---

## Acceptance Criteria

| # | Criterion |
|---|-----------|
| AC1 | Sample selector dropdown shows 5 options in the header area |
| AC2 | Selecting a sample updates the stepper (correct step marked current) |
| AC3 | Selecting a sample updates the Chain of Custody panel |
| AC4 | "Scan Next Phase" click shows an animated scanning overlay |
| AC5 | Scanning progress bar fills from 0→100% over ~2 seconds |
| AC6 | On verified result: green overlay shown with "Advance to Next Phase" button |
| AC7 | Clicking "Advance to Next Phase" closes overlay and advances the current step by 1 |
| AC8 | On compromised result: red overlay shown with "Raise NCR" and "Close" buttons |
| AC9 | Page title "End-to-End Tracking" and sample selector stay visible while scrolling |
| AC10 | ProcessBreadcrumb appears above the sticky header (not sticky itself) |
| AC11 | Zero TypeScript errors after changes |
