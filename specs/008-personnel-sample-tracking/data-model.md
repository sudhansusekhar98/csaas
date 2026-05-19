# Data Model: Personnel Sample Activity Tracking

## Existing Entity: Personnel (unchanged)

```typescript
interface Personnel {
  n: string;       // Full name
  id: string;      // USR-XXXX
  r: string;       // Operational role
  st: string;      // 'Active' | 'Suspended'
  fe: string;      // 'Enrolled' | 'Pending' | 'Revoked'
  ok: boolean;     // Biometrics enrolled
}
```

## New Entities: Activity Records

```typescript
interface ParentSampleActivity {
  sampleId: string;    // PRNT-XXXX-X
  sealId: string;      // QRL-SEC-...
  colliery: string;
  timestamp: string;   // '14:20 UTC'
  weight: string;      // '15.20 kg'
}

interface ChildSampleActivity {
  childId: string;     // BAG-A-XXXX-X or SUB-M-XXXX
  parentId: string;    // PRNT-XXXX-X
  step: string;        // 'Small Bagging' | 'Prep Room'
  timestamp: string;
}

interface LabReceiptActivity {
  sampleId: string;    // SUB-M-XXXX or BAG-A-XXXX
  parentId: string;
  status: 'Accepted' | 'Conditional' | 'Rejected';
  receiptTime: string;
}

interface NcrActivity {
  ncrId: string;       // NCR-XXXX
  stage: string;       // 'COLLECTION' | 'TRANSIT' | 'PREP' | 'DIVISION' | 'LAB'
  sampleId: string;
  reason: string;      // short summary
  filedAt: string;
}

interface OperatorActivity {
  parentSamples: ParentSampleActivity[];
  childSamples: ChildSampleActivity[];
  labReceipts: LabReceiptActivity[];
  ncrFilings: NcrActivity[];
}

// Top-level lookup keyed by operator ID
const SAMPLE_ACTIVITY: Record<string, OperatorActivity> = { ... };
```

## New UI State

```typescript
const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
const [activityTab, setActivityTab] = useState<'parent' | 'child' | 'lab' | 'ncr'>('parent');
```

## Derived counts (for registry chips)

```typescript
function activityCounts(id: string) {
  const a = SAMPLE_ACTIVITY[id];
  if (!a) return { parent: 0, child: 0, lab: 0, ncr: 0 };
  return {
    parent: a.parentSamples.length,
    child:  a.childSamples.length,
    lab:    a.labReceipts.length,
    ncr:    a.ncrFilings.length,
  };
}
```
