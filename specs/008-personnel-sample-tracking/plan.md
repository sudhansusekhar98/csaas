# Implementation Plan: Sub-Sample Generation Dynamic Count Fix

**Branch**: `007-child-sample-lab-handover` | **Date**: 2026-05-19

## Summary

Bug fix: The Sub-Sample Generation panel (Section 02, "Extract & Tag" buttons) always renders exactly 3 sub-samples (M, C, R) regardless of the child count entered in the seal-verified overlay. This is because `SUB_DEFS.map(...)` iterates over a hardcoded 3-item array and never reads `childCount`. The fix extends `SubSampleType`, `SUB_DEFS`, and all dependent derived values to be driven by `childCount[selectedSessionId]`.

## Root Cause

```tsx
// Line 533 — never uses childCount:
{SUB_DEFS.map((def) => {

// Line 153 — always checks exactly M, C, R:
const allExtracted = ['M', 'C', 'R'].every((t) => extracted.includes(t as SubSampleType));

// Line 606 — always shows /3:
`Finalise Division Session (${extracted.length}/3)`
```

## Fix

**Step 1**: Extend `SubSampleType` to `'M' | 'C' | 'R' | 'D' | 'E'`

**Step 2**: Extend `SUB_DEFS` to 5 entries:
```tsx
const SUB_DEFS = [
  { type: 'M', label: 'Moisture Analysis', targetKg: '2.00 kg' },
  { type: 'C', label: 'Calorific Value',   targetKg: '5.00 kg' },
  { type: 'R', label: 'Reserve Sample',    targetKg: '8.20 kg' },
  { type: 'D', label: 'Sample D',          targetKg: '3.50 kg' },
  { type: 'E', label: 'Sample E',          targetKg: '2.00 kg' },
];
```

**Step 3**: Derive `activeSubDefs` from count at render time:
```tsx
const activeSubDefs = selectedSessionId
  ? SUB_DEFS.slice(0, childCount[selectedSessionId] ?? 3)
  : SUB_DEFS.slice(0, 3);
```

**Step 4**: Replace `SUB_DEFS.map(...)` with `activeSubDefs.map(...)`

**Step 5**: Fix `allExtracted`:
```tsx
const allExtracted = activeSubDefs.every((d) => extracted.includes(d.type as SubSampleType));
```

**Step 6**: Fix button counter:
```tsx
`Finalise Division Session (${extracted.length}/${activeSubDefs.length})`
```

**Constraints**: Single file — `src/components/SplittingStationView.tsx`
