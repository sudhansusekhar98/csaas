# Implementation Plan: Division Station Improvements

**Branch**: `005-division-station-improvements` | **Date**: 2026-05-16
**Spec**: specs/005-division-station-improvements/

**Input**: Three UX gaps in SplittingStationView:
1. Detail view is static — doesn't reflect actual session status (AWAITING_SPLIT vs IN_PROGRESS)
2. Sample nomenclature is inconsistent with the rest of the app
3. "Start New Session" button has no UI — clicking does nothing

---

## Summary

Rebuild `SplittingStationView.tsx` to be fully dynamic: session detail adapts to status, sub-sample IDs follow the `PRNT` → `SUB` naming pattern used everywhere else, and "Start New Session" opens a modal to select an eligible parent sample and create a new division session.

---

## Problem 1: Sample Nomenclature

### Current inconsistencies

| Screen | ID Format | Issue |
|--------|-----------|-------|
| SampleTracking | `PRNT-8822-X` | ✓ Correct |
| PrepRoom | `PRNT-8824-Z` | ✓ Correct |
| SplittingStation — sessions | `SPL-29384` | ✗ Session ID not linked to parent |
| SplittingStation — OCR result | `SPL-29384` | ✗ Should show parent ID |
| SplittingStation — sub-samples | `CHLD-M-29384` | ✗ Not derived from parent ID |
| LabReceiving — child samples | `CS-M-4412` | ✗ Inconsistent prefix |
| LabReceiving — parent ref | `PR-8820` | ✗ Missing leading `NT` |

### Standardized nomenclature

| Entity | Format | Example |
|--------|--------|---------|
| Parent sample | `PRNT-NNNN-X` | `PRNT-8822-X` |
| Division session | `DIV-NNNN-X` | `DIV-8822-X` (derived from parent) |
| Sub-sample (Moisture) | `SUB-M-NNNN-X` | `SUB-M-8822-X` |
| Sub-sample (Calorific) | `SUB-C-NNNN-X` | `SUB-C-8822-X` |
| Sub-sample (Reserve) | `SUB-R-NNNN-X` | `SUB-R-8822-X` |

The `DIV-NNNN-X` session ID makes it obvious which parent it belongs to. OCR result in CCTV panel shows the parent ID (`PRNT-8822-X`). Sub-sample IDs follow the parent number, making cross-screen tracing trivial.

### Updated session data

```typescript
const SESSIONS = [
  {
    id: 'DIV-8822-X', parentId: 'PRNT-8822-X',
    sealId: 'QRL-SEC-8822-HY77-1',
    weight: '15.20 kg', operator: 'OPR-774 (J. Doe)',
    collectedAt: '14:20 UTC', status: 'IN_PROGRESS',
    colliery: 'Alpha-1 Mining Complex',
    extractedSubSamples: ['M'],  // Moisture already extracted
  },
  {
    id: 'DIV-8820-A', parentId: 'PRNT-8820-A',
    sealId: 'QRL-SEC-8820-KL42-2',
    weight: '14.80 kg', operator: 'OPR-312 (R. Kumar)',
    collectedAt: '13:05 UTC', status: 'AWAITING_SPLIT',
    colliery: 'Beta Sector Colliery',
    extractedSubSamples: [],
  },
  {
    id: 'DIV-8818-B', parentId: 'PRNT-8818-B',
    sealId: 'QRL-SEC-8818-MN91-3',
    weight: '15.60 kg', operator: 'OPR-774 (J. Doe)',
    collectedAt: '11:30 UTC', status: 'COMPLETED',
    colliery: 'Alpha-1 Mining Complex',
    extractedSubSamples: ['M', 'C', 'R'],  // All extracted
  },
];
```

---

## Problem 2: Dynamic Detail View per Status

### Current: one static view for all sessions

The detail view is identical regardless of whether a session is `AWAITING_SPLIT`, `IN_PROGRESS`, or `COMPLETED`. It always shows:
- CCTV seal panel with match %
- All sub-sample cards with "ready" or "pending" status
- Disabled "Finalise" button

### Proposed: three state-appropriate views

#### AWAITING_SPLIT state
```
[!] Seal Verification Required
┌─────────────────────────────────┐
│ AWAITING SEAL SCAN              │
│ [Dark panel, dashed border]     │
│ [QrCode icon, pulsing]          │
│ Scan the parent bag QR to       │
│ initiate the division session   │
│ [Scan Seal Now] button          │
└─────────────────────────────────┘

Sub-sample cards: all LOCKED (greyed, Extract & Tag disabled)
"Cannot begin division until seal is verified"
```

#### IN_PROGRESS state (current, but improved)
- Shows CCTV panel with OCR = parent ID
- Sub-samples reflect `extractedSubSamples` array:
  - If type in array → status = 'extracted' (green, disabled Extract & Tag, shows checkmark)
  - Otherwise → status = 'ready'
- Finalise enabled only when all 3 types are in extractedSubSamples
- "Extract & Tag" click → adds type to extractedSubSamples

#### COMPLETED state (read-only)
- CCTV panel shows final verification
- All sub-sample cards show "EXTRACTED" with green checkmark
- "Finalise" shows as "Session Completed" (green, disabled)
- A "View Lab Dispatch" link appears

---

## Problem 3: New Session Modal

### Current: button does nothing
"Start New Session" has no onClick handler, no modal.

### Proposed modal
A centered overlay (consistent with ConsignmentsView new-consignment modal pattern):

```
┌─────────────────────────────────────────────┐
│  [SquareSplitVertical]  Start Division Session │  [×]
│  Select a parent sample ready for division   │
├─────────────────────────────────────────────┤
│  AVAILABLE PARENT SAMPLES                    │
│  (those that completed Pulverisation step)   │
│                                              │
│  ○ PRNT-8824-Z   Alpha-1   15.1 kg   ●ready │
│  ○ PRNT-8823-Y   Beta      14.6 kg   ●ready │
│                                              │
│  OPERATOR                                    │
│  [select dropdown: OPR-774, OPR-312, ...]   │
│                                              │
│  DIVISION PROTOCOL                           │
│  Auto (3 sub-samples: M / C / R)            │
├─────────────────────────────────────────────┤
│          [Cancel]  [Begin Division Session]  │
└─────────────────────────────────────────────┘
```

Clicking "Begin Division Session":
- Creates a new session object in `SESSIONS` state
- Status = `AWAITING_SPLIT`
- Navigates directly to the new session's detail view

---

## LabReceivingView nomenclature sync

Update `LabReceivingView.tsx` mock data to use consistent IDs:

```typescript
// Before
{ id: 'CS-M-4412', parent: 'PR-8820', ... }
{ id: 'CS-C-4413', parent: 'PR-8820', ... }

// After  
{ id: 'SUB-M-8820-A', parent: 'PRNT-8820-A', ... }
{ id: 'SUB-C-8820-A', parent: 'PRNT-8820-A', ... }
{ id: 'SUB-M-8819-X', parent: 'PRNT-8819-X', ... }
{ id: 'SUB-C-8819-X', parent: 'PRNT-8819-X', ... }
```

---

## Files changed

| File | Change |
|------|--------|
| `src/components/SplittingStationView.tsx` | Full rebuild — nomenclature, dynamic states, new session modal |
| `src/components/LabReceivingView.tsx` | Update mock data IDs only |

No new files, no new dependencies.
