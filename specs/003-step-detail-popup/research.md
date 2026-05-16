# Research: Step Detail Popup — Sample Tracking Page

## Feature Description
When a user clicks on a completed step in the 12-step stepper on the Sample Tracking page, a popup appears showing:
- Who completed that step (name, role, badge ID)
- When it was completed (date + time + timezone)
- Where / on what device (location, equipment ID)
- How it was verified (biometric, QR scan, CCTV, etc.)

---

## Decision: What is clickable

**Decision**: Only **completed** steps (green, status = 'completed') are clickable. The **current** step shows an "In Progress" indicator and is not clickable (no completed event yet). **Pending** steps are not clickable.

**Rationale**: The popup shows a completed event record. The current step has no completion timestamp yet. Pending steps have no data at all. Clicking a non-completed step would either show empty data (confusing) or have no response (unexpected for a clickable element).

**Cursor treatment**: completed steps → `cursor-pointer`; current/pending → `cursor-default` (no change needed, they already have `opacity-40 grayscale`)

---

## Decision: Popup style

**Decision**: A centered modal overlay using `AnimatePresence` + `motion.div`, consistent with the existing scan overlay in `SampleTrackingView.tsx` and the consignment modal in `ConsignmentsView.tsx`.

**Rationale**: Reuse the established modal pattern (fixed inset backdrop + centered card). A tooltip or side panel would be too small to show the full operator detail. A modal puts the focus on the event record and is easy to dismiss (click backdrop or X).

**Alternatives considered**:
- Inline expand (accordion row) — disrupts the stepper layout flow
- Side drawer — overkill for 4–5 data fields
- Tooltip — too small for operator photo area, accessibility issues on hover-only

---

## Decision: Mock data structure

Each step event record is keyed by **sample ID + step index**. This means each sample has its own event history, which is realistic (different operators handle different samples).

```typescript
interface StepEvent {
  stepIndex: number;
  completedAt: string;        // "2026-05-16 14:18 UTC"
  operator: {
    name: string;
    role: string;
    badgeId: string;
    biometricMatch: number;   // % confidence
  };
  location: string;           // "Track Hopper TH-07", "Prep Room Gate 2"
  verificationMethod: string; // "Face ID + QR Scan", "CCTV + Manual Entry"
  notes?: string;
}
```

Events are stored in a `STEP_EVENTS` lookup: `Record<sampleId, StepEvent[]>` where the array index maps to the step index.

---

## Decision: Popup content layout

```
┌─────────────────────────────────┐
│  [Step icon]  Step N: [Title]   │  [X]
│  Completed [timestamp]          │
├─────────────────────────────────┤
│  OPERATOR                       │
│  [Avatar initials]  Name        │
│                     Role        │
│                     Badge ID    │
│  Biometric: 99.1% match ✓      │
├─────────────────────────────────┤
│  LOCATION        VERIFICATION   │
│  Track Hopper    Face ID +      │
│  TH-07           QR Scan        │
├─────────────────────────────────┤
│  [Notes if any]                 │
│                        [Close]  │
└─────────────────────────────────┘
```

---

## Mock data coverage

For each sample, events are generated for all completed steps. Since `PRNT-8822-X` is at step index 4 (step 5 current), it has 4 completed events (steps 1–4). `PRNT-8810-D` is at step 11 (index 10), so it has 10 completed events.

Each step has a characteristic operator and verification method:
| Step | Typical Operator Role | Verification |
|------|-----------------------|-------------|
| 1. Sample Collection | Yard Operator | CCTV + Manual |
| 2. Identity Capture | Yard Operator | Face ID Scan |
| 3. Sealing Sequence | Yard Operator | QR Application |
| 4. Parent ID Issuance | System Auto | Auto-generated |
| 5. VMS Path Tracking | Logistics Lead | VMS Encrypted |
| 6. Prep Room Receipt | Prep Technician | Face ID + Scan |
| 7. Integrity Verification | Prep Technician | Visual + QR |
| 8. Pulverisation | Prep Technician | CCTV Monitored |
| 9. Division Logic | Prep Technician | CCTV + Manual |
| 10. ID Linkage | System Auto | DB Sync |
| 11. Lab Dispatch | Lab Analyst | QR Scan |
| 12. Lab Authentication | Lab Analyst | Face ID + QR |
