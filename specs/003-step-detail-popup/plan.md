# Implementation Plan: Step Detail Popup — Sample Tracking Page

**Branch**: `003-step-detail-popup` | **Date**: 2026-05-16 | **Spec**: specs/003-step-detail-popup/

**Input**: User request — clicking a completed step in the Sample Tracking stepper shows a popup with the operator details and timestamp for that step.

---

## Summary

Add a click handler to completed steps in the 12-step stepper on `SampleTrackingView.tsx`. Clicking opens a modal popup showing the operator who completed that step, the timestamp, location, and verification method. Each step has its own mock event record keyed by sample ID and step index. The popup follows the existing `AnimatePresence` modal pattern in the codebase.

---

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: React 18, Tailwind CSS, Lucide React, Framer Motion (`motion/react`)  
**Storage**: Client-side state only  
**Constraints**: Single file change (`SampleTrackingView.tsx`); no new dependencies  
**Target Platform**: Desktop browser

---

## What Changes

**File**: `src/components/SampleTrackingView.tsx` only.

### 1. New data structure: `StepEvent`

```typescript
interface StepEvent {
  stepIndex: number;
  completedAt: string;
  operator: {
    name: string;
    role: string;
    badgeId: string;
    biometricMatch: number;
  };
  location: string;
  verificationMethod: string;
  notes?: string;
}
```

### 2. New constant: `STEP_EVENTS`

A lookup `Record<string, StepEvent[]>` keyed by sample ID. Each array entry maps to a step index (index 0 = step 1). Only completed steps have entries; the array is sparse (entries only up to `currentStepIndex - 1`).

To keep the data concise, define a base event template per step index and override the sample ID in the operator badge. Each sample's events share the same operator roster but the timestamps differ slightly.

### 3. New state: `activeStepEvent`

```typescript
const [activeStepEvent, setActiveStepEvent] = useState<{ event: StepEvent; stepDef: typeof STEP_DEFINITIONS[0] } | null>(null);
```

### 4. Step click handler

Only completed steps get an `onClick`:
```tsx
onClick={step.status === 'completed'
  ? () => {
      const event = STEP_EVENTS[selectedSampleId]?.[idx];
      if (event) setActiveStepEvent({ event, stepDef: STEP_DEFINITIONS[idx] });
    }
  : undefined}
```

Completed steps also get `cursor-pointer` class and a subtle `hover:bg-slate-50` ring to signal interactivity.

### 5. Popup modal

Positioned consistently with the existing scan overlay (fixed + z-50 + backdrop). Card width: `max-w-md`. Structure:

```
Header:   [Step icon in colored circle]  [Step N: Title]      [×]
          [green "Completed" badge]  [timestamp]

Section 1: OPERATOR
  [Initials avatar]  Name (bold)
                     Role
                     Badge ID (data-mono)
  [Shield check]  Biometric match: 99.1% — VERIFIED

Section 2: Two-column grid
  Location | Verification Method

Section 3: Notes (if any)

Footer: [Close] button
```

---

## Interaction Details

- **Clickable area**: entire step row (the `flex gap-6 group` div) for completed steps — large touch target
- **Visual affordance**: completed steps get `hover:bg-indigo-50/50 rounded-xl px-2 -mx-2 transition-all` on hover
- **Dismiss**: click backdrop OR the X button in the popup header
- **Switching samples**: if `selectedSampleId` changes while popup is open, close the popup (add effect or handle in the sample change handler)

---

## Out of Scope

- Real database event records
- Filtering/searching events
- Exporting the event log (that belongs in Audit History)
- Current/pending steps showing partial data
