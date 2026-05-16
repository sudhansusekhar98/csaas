# Implementation Plan: Sample Tracking Page Enhancements

**Branch**: `002-sample-tracking-enhancements` | **Date**: 2026-05-16 | **Spec**: specs/002-sample-tracking-enhancements/

**Input**: User feedback on `SampleTrackingView.tsx` — three discrete UX gaps identified

---

## Summary

Enhance the Sample Tracking ("End-to-End Tracking") page with three targeted improvements: (1) a sample selector dropdown so operators can switch between active parent samples, (2) a full animated scan overlay for the "Scan Next Phase" button with verified/compromised states and step advancement, and (3) a sticky page header so sample context is always visible while scrolling through the 12-step stepper.

All changes are confined to `src/components/SampleTrackingView.tsx`. No new dependencies, no backend changes.

---

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: React 18, Tailwind CSS, Lucide React, Framer Motion (`motion/react`), Vite  
**Storage**: Client-side state only  
**Testing**: Manual UI verification via `npm run dev`  
**Target Platform**: Desktop browser (1280px+)  
**Project Type**: Web application (frontend prototype)  
**Constraints**: Must not add new npm packages; use only existing design tokens and component patterns

---

## Constitution Check

Constitution is a blank template — no gates to enforce. All decisions in research.md.

---

## Problem Analysis

### Current `SampleTrackingView.tsx` state

```
src/components/SampleTrackingView.tsx
└── SampleTrackingView({ onNavigate })
    ├── useState: showSealScanner       ← SET but never rendered
    ├── useState: scanStatus            ← SET but never rendered
    ├── useState: scanProgress          ← SET but never rendered
    ├── handleSimulateScan()            ← wired to button but no visual output
    ├── ProcessBreadcrumb (step 2)
    ├── <header>                        ← scrolls away; hardcoded PRNT-8822-X
    │   ├── "Scan Next Phase" button    ← triggers handleSimulateScan but nothing shows
    │   └── Active Parent chip: PRNT-8822-X (hardcoded)
    ├── 12-step stepper (left col)      ← step 5 hardcoded as "current"
    └── Right col: biometric + CoC     ← hardcoded PRNT-8822-X data
```

### Gap 1: No sample selector
- Active Parent chip shows `PRNT-8822-X` as plain text — not interactive
- No dropdown, no list, no way to switch

### Gap 2: Scan overlay never renders
- `showSealScanner` controls visibility but nothing renders when `true`
- `scanStatus` transitions `idle → scanning → verified/compromised` but drives no UI
- `scanProgress` (0–100) drives no progress bar

### Gap 3: Header scrolls away
- The `<header>` element is inside the scrollable `<main>` with no sticky positioning
- Users lose sample ID context after scrolling ~3 steps down

---

## Solution Design

### Feature 1: Sample Selector Dropdown

Add a `selectedSample` state initialized to `'PRNT-8822-X'`. Define a `samples` lookup with the 5 mock parent samples. Replace the static "Active Parent" chip with a `<select>` (styled to match the existing design system).

When sample changes:
- Reset `scanStatus` to `'idle'`
- Reset step display — each sample has a `currentStep` property that determines which step is `'current'` vs `'completed'` vs `'pending'`

**Sample data shape**:
```typescript
interface SampleOption {
  id: string;           // PRNT-8822-X
  sealId: string;       // QRL-SEC-8822-HY77-1
  currentStepIndex: number; // 0-based, which step is 'current'
}
```

The 12-step `steps` array becomes a pure render function driven by `selectedSample.currentStepIndex` — no hardcoded `status` strings in the array definition.

### Feature 2: Scan Overlay

Render an absolutely-positioned overlay when `showSealScanner === true`. Three visual states:

**State 1 — Scanning** (`scanStatus === 'scanning'`):
```
[Dark overlay with centered card]
  [Animated QR scan icon — spinning/pulsing in indigo]
  "Verifying QR Seal..."
  [PRNT-XXXX-X label]
  [Progress bar: 0 → 100%]
  [Scanline animation sweeping across]
```

**State 2 — Verified** (`scanStatus === 'verified'`):
```
[Overlay with green tinted card]
  [Large green ShieldCheck icon — scales in with spring animation]
  "Seal Authenticated"
  "Chain of custody confirmed. Proceeding to next phase."
  [Sample ID badge]
  [Button: "Advance to Next Phase" — indigo, closes overlay + advances step]
```

**State 3 — Compromised** (`scanStatus === 'compromised'`):
```
[Overlay with red tinted card]
  [Large red AlertTriangle icon — shakes animation]
  "Seal Breach Detected"
  "Security violation logged. Supervisor notification sent."
  [Two buttons: "Raise NCR" (amber) | "Close" (ghost)]
```

**Step advancement logic**: On "Advance to Next Phase":
- Find the current step index in the selected sample
- If `currentStepIndex < 11`: increment by 1 (update the selected sample's step)
- Close the overlay

### Feature 3: Sticky Header

Restructure the page layout:

```
<div className="flex flex-col h-full">
  {/* ProcessBreadcrumb — not sticky, appears once at top */}
  <ProcessBreadcrumb ... />

  {/* Sticky header — remains visible during scroll */}
  <div className="sticky top-0 z-30 -mx-8 px-8 py-4 bg-white/95 backdrop-blur-sm border-b border-border-slate mb-6">
    [title + sample selector + scan button + VMS status chip]
  </div>

  {/* Scrollable content */}
  <div className="flex-1">
    [12-step stepper grid]
  </div>
</div>
```

The `-mx-8 px-8` trick counteracts the `p-8` from App.tsx's main wrapper, letting the sticky header span the full width without a gap on sides.

---

## Project Structure

### Documentation (this feature)
```text
specs/002-sample-tracking-enhancements/
├── plan.md              ← This file
├── research.md          ← Phase 0 decisions
└── contracts/           ← UI contracts
```

### Source Changes
```text
src/components/SampleTrackingView.tsx   ← sole file modified
```

No new files required. All UI is self-contained in this one component.

---

## Key Interaction Flows

### Flow A: Switch Sample
1. User opens "Sample Tracking" screen (lands on PRNT-8822-X at step 5)
2. Clicks the sample selector dropdown → sees 5 active samples with step labels
3. Selects "PRNT-8818-B (Pulverization)" → stepper updates: steps 1–7 completed, step 8 current, 9–12 pending
4. Right panel updates: Chain of Custody shows PRNT-8818-B's seal ID

### Flow B: Successful Scan
1. User is on PRNT-8822-X (step 5 — VMS Path Tracking)
2. Clicks "Scan Next Phase" → overlay appears, scanning animation runs ~2 seconds
3. Overlay transitions to "Seal Authenticated" (green)
4. User clicks "Advance to Next Phase" → overlay closes, step 5 becomes completed, step 6 ("Prep Room Receipt") becomes current
5. Sample selector chip now shows step 6 label next to PRNT-8822-X

### Flow C: Compromised Scan
1. Same trigger but overlay shows "Seal Breach Detected" (red)
2. "Raise NCR" button → triggers onFlagIssue callback (same as header Flag Issue button) → closes overlay
3. "Close" dismisses overlay; step does NOT advance

### Flow D: Scroll
1. User scrolls to see step 9 (Splitting Logic) in the stepper
2. Page title "End-to-End Tracking" and sample selector stay pinned at the top
3. Sample ID always visible; user never loses context

---

## Out of Scope
- Persisting step state across page navigation
- Real QR code scanning hardware integration
- Multiple samples selected simultaneously
- Mobile layout
