# Implementation Plan: Consignment Dropdown in Sample Collection & Seal Generation

**Branch**: `007-child-sample-lab-handover` | **Date**: 2026-05-19

## Summary

Add a Consignment selector dropdown as the first field in the "Collection Details" form of `SampleCollectionView.tsx`. When the operator begins generating a parent QR seal, they must first select the consignment from which this sample is being collected. The selection links the generated parent sample to the consignment ledger and appears on the printed label and in the Recent Collections table.

## Changes

**File**: `src/components/SampleCollectionView.tsx` only

### 1. New mock data — CONSIGNMENTS

```typescript
interface Consignment {
  id: string;         // CNS-2024-001
  rackId: string;     // RCK-9901-A (correlates with existing RACK_IDS)
  origin: string;     // 'Bermo Mine / Kargali, Bokaro'
  plant: string;      // 'Bodor TPS-A'
  status: 'ACTIVE' | 'IN_TRANSIT' | 'QUEUED';
}
```

Four entries matching the consignments visible in ConsignmentsView (same rack IDs).

### 2. CollectionRecord — add consignmentId

```typescript
interface CollectionRecord {
  ...
  consignmentId: string;  // NEW — e.g. 'CNS-2024-001'
}
```

### 3. Form field — Consignment dropdown (first field)

Position: above "Sample Source Type". Required (`*`). Shows:
- Placeholder: "Select consignment..."
- Option format: `{id} — {origin} → {plant}` with status badge
- On selection: auto-populates `rackId` from the selected consignment's `rackId`

### 4. isFormValid — include consignmentId

```typescript
const isFormValid = consignmentId && equipmentId && rackId && wagonNum && collector && sealNum && rfidTag;
```

### 5. Label preview footer — show Consignment row

Add "Consignment" row to the 4-cell footer grid.

### 6. Recent Collections table — add Consignment column

Add Consignment ID column between Parent ID and Source.

## Constraints

Single file: `src/components/SampleCollectionView.tsx`
