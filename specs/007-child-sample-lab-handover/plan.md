# Implementation Plan: Child Sample Count, Operator Assignment & Lab Receive Confirmation

**Branch**: `007-child-sample-lab-handover` | **Date**: 2026-05-16
**Spec**: specs/007-child-sample-lab-handover/spec.md

---

## Summary

Three targeted improvements to the Division Station and Lab Receiving screens:

1. **Child sample count prompt** — Small Bagging step gets a dynamic count input (1–5) that controls how many child bag cards are rendered, replacing the hardcoded 3-bag layout.
2. **Operator assignment per child bag** — Each child bag card gets an "Assigned Operator" dropdown (the handover operator who will carry the bag to the lab). "Seal All Child Bags" requires all operators to be selected.
3. **Lab Receiving confirmation button** — The currently inert "Receive Batch" button is replaced with a stateful "Confirm Receipt" button gated on all three receipt fields (receiver + acceptance status + visual condition), which marks the scanned item as Received on click.

---

## Technical Context

**Language/Version**: TypeScript 5 + React 18
**Primary Dependencies**: Tailwind CSS, Framer Motion (`motion/react`), Lucide React
**Storage**: React state only (prototype — no backend)
**Testing**: Visual / manual (no test framework)
**Target Platform**: Browser (Vite dev server)
**Project Type**: Web application (React SPA prototype)
**Performance Goals**: Instant UI response; no async operations
**Constraints**: Zero new npm packages; inline SVG only; no TypeScript `any`
**Scale/Scope**: 2 component files changed

---

## Constitution Check

No external dependencies added. No new files — changes are contained to existing components. No breaking changes to `ViewType` or routing. Complexity is minimal (state additions only).

**Gate status**: PASS — no violations.

---

## Project Structure

### Documentation (this feature)

```text
specs/007-child-sample-lab-handover/
├── plan.md         ← this file
├── spec.md
├── research.md
├── data-model.md
└── quickstart.md
```

### Source Code Changed

```text
src/components/
├── SplittingStationView.tsx   ← child count prompt + operator assignment per bag
└── LabReceivingView.tsx       ← confirm receipt button with canConfirm gate
```

---

## Change 1: SplittingStationView — Child Count Prompt

### Where
Small Bagging section (Step 04), rendered when `pulvData[sessionId]?.marked === true`.

### What to add

**New state** (top of component):
```typescript
// Child bag count per session (default 3)
const [childCount, setChildCount] = useState<Record<string, number>>({});
```

**New type additions**:
```typescript
type BagType = 'A' | 'B' | 'R' | 'D' | 'E';  // extend from 'A' | 'B' | 'R'
const BAG_TYPE_SEQUENCE: BagType[] = ['A', 'B', 'R', 'D', 'E'];
const BAG_LABEL_MAP: Record<BagType, string> = {
  A: 'Sample A', B: 'Sample B', R: 'Referee', D: 'Sample D', E: 'Sample E'
};
const BAG_TARGET_MAP: Record<BagType, string> = {
  A: '2.00', B: '5.00', R: '8.20', D: '2.00', E: '2.00'
};
```

**Update BagRecord** to include assignedOperator:
```typescript
interface BagRecord { weight: string; sealed: boolean; sealId: string; assignedOperator: string }
```

**Update mock data** (`baggingData` initial state): add `assignedOperator: ''` to all existing records; for the completed session `DIV-8818-B` set `assignedOperator: 'OPR-774 (J. Doe)'`.

**Count prompt UI** (appears before bag cards, only when bags not yet sealed):
```tsx
<div className="flex items-center gap-4 mb-6">
  <label className="label-caps">Number of Child Bags</label>
  <input type="number" min={1} max={5}
    value={childCount[selectedSessionId] ?? 3}
    onChange={(e) => {
      const n = Math.min(5, Math.max(1, Number(e.target.value)));
      setChildCount((prev) => ({ ...prev, [selectedSessionId]: n }));
      // Reset bagging data for new count
      setBaggingData((prev) => { ... rebuild with new types ... });
    }}
    className="w-20 bg-slate-50 border border-border-slate rounded-xl p-2 text-xs data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none text-center"
  />
  <span className="text-xs text-text-slate-400 font-medium">bags (1–5)</span>
</div>
```

**Active bag types** derived:
```typescript
const count = childCount[selectedSessionId] ?? 3;
const activeBagTypes = BAG_TYPE_SEQUENCE.slice(0, count);
```

**Operator dropdown** inside each bag card (unsealed state):
```tsx
<div className="space-y-1 mt-2">
  <label className="label-caps">Assigned Operator</label>
  <select
    value={bag.assignedOperator}
    onChange={(e) => handleBagOperatorChange(type, e.target.value)}
    className="w-full bg-slate-50 border border-border-slate rounded-xl p-2 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none"
  >
    <option value="">Select operator...</option>
    {OPERATORS.map((op) => <option key={op}>{op}</option>)}
  </select>
</div>
```

**New handler**:
```typescript
const handleBagOperatorChange = (type: BagType, operator: string) => {
  if (!selectedSessionId) return;
  setBaggingData((prev) => ({
    ...prev,
    [selectedSessionId]: {
      ...prev[selectedSessionId],
      [type]: { ...prev[selectedSessionId][type], assignedOperator: operator },
    },
  }));
};
```

**Updated canSealAll gate**:
```typescript
const canSealAll = activeBagTypes.every(
  (t) => (bags[t]?.weight ?? '') !== '' && (bags[t]?.assignedOperator ?? '') !== ''
);
```

**Sealed bag summary** — show assigned operator under the seal ID:
```tsx
<p className="text-[10px] text-text-slate-400">{bag.weight} kg · QR Sealed · {bag.assignedOperator}</p>
```

---

## Change 2: LabReceivingView — Confirm Receipt Button

### Where
`LabReceivingView.tsx` — Batch Verification panel and the "Receive Batch" button.

### What to change

**Add state** for pending items (currently hardcoded JSX; make it state-managed):
```typescript
interface PendingItem { id: string; parent: string; weight: string; status: string; type: 'pending' | 'alert' | 'done' }
const [pendingItems, setPendingItems] = useState<PendingItem[]>([
  { id: 'SUB-M-8820-A', parent: 'PRNT-8820-A', weight: '1.2 kg', status: 'In Transit', type: 'pending' },
  { id: 'SUB-C-8820-A', parent: 'PRNT-8820-A', weight: '0.8 kg', status: 'In Transit', type: 'pending' },
  { id: 'SUB-M-8819-X', parent: 'PRNT-8819-X', weight: '1.0 kg', status: 'Flagged',    type: 'alert'   },
  { id: 'SUB-C-8819-X', parent: 'PRNT-8819-X', weight: '0.8 kg', status: 'Received',   type: 'done'    },
]);
const [confirmedId, setConfirmedId] = useState<string | null>(null);
```

**Derived gate**:
```typescript
const canConfirm = !!(
  receiptRecord.receiver &&
  receiptRecord.acceptanceStatus &&
  receiptRecord.visualCondition
);
```

**Confirm handler**:
```typescript
const handleConfirmReceipt = () => {
  // Mark the first pending item as done
  const firstPending = pendingItems.find((i) => i.type === 'pending');
  if (!firstPending) return;
  setConfirmedId(firstPending.id);
  setPendingItems((prev) =>
    prev.map((i) => i.id === firstPending.id ? { ...i, status: 'Received', type: 'done' } : i)
  );
  setReceiptRecord({ receiver: '', acceptanceStatus: '', visualCondition: '' });
  setTimeout(() => setConfirmedId(null), 3000);
};
```

**Replace the header button**:
```tsx
// Before: <button className="...">Receive Batch</button>
// After:
<button
  disabled={!canConfirm}
  onClick={handleConfirmReceipt}
  className="px-5 py-2 bg-primary-indigo text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-100 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
>
  Confirm Receipt
</button>
```

**Success toast** (shown when `confirmedId` is not null):
```tsx
{confirmedId && (
  <motion.div
    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
    className="bg-success-emerald text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg"
  >
    <CheckCircle2 size={16} /> Receipt confirmed: {confirmedId}
  </motion.div>
)}
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/SplittingStationView.tsx` | Child count state + active bag types derived from count; `assignedOperator` on `BagRecord`; operator dropdown per bag; `canSealAll` gate updated |
| `src/components/LabReceivingView.tsx` | `pendingItems` state; `canConfirm` gate; `handleConfirmReceipt`; "Confirm Receipt" button; success toast via `AnimatePresence` |
