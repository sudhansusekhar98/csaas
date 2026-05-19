# Data Model: Child Sample Count, Operator Assignment & Lab Receive Confirmation

## Updated: BagRecord (SplittingStationView)

```typescript
interface BagRecord {
  weight: string;           // kg, entered by operator
  sealed: boolean;          // true after "Seal All" clicked
  sealId: string;           // BAG-{type}-{parentSuffix}
  assignedOperator: string; // NEW — operator who will handover to lab
}
```

## New State: childCount (SplittingStationView)

```typescript
// Per-session child bag count. Default 3.
const [childCount, setChildCount] = useState<Record<string, number>>({});

// Derived bag type sequence (indexed into):
const BAG_TYPE_SEQUENCE: BagType[] = ['A', 'B', 'R', 'D', 'E'];
const BAG_LABEL_SEQUENCE = ['Sample A', 'Sample B', 'Referee', 'Sample D', 'Sample E'];

// Active bag types for a session:
const activeBags = BAG_TYPE_SEQUENCE.slice(0, childCount[sessionId] ?? 3);
```

## Updated: ReceiptRecord (LabReceivingView)

```typescript
const [receiptRecord, setReceiptRecord] = useState({
  receiver: '',
  acceptanceStatus: '' as '' | 'accepted' | 'conditional' | 'rejected',
  visualCondition: '' as '' | 'intact' | 'seal-damaged' | 'label-damaged',
});

// Derived gate:
const canConfirm = !!(
  receiptRecord.receiver &&
  receiptRecord.acceptanceStatus &&
  receiptRecord.visualCondition
);
```

## Updated: Pending Items (LabReceivingView)

```typescript
interface PendingItem {
  id: string;
  parent: string;
  weight: string;
  status: string;
  type: 'pending' | 'alert' | 'done';
}

// State-managed so confirmation can mutate items:
const [pendingItems, setPendingItems] = useState<PendingItem[]>([ ... ]);
```
