# Data Model: CSAAS UX Reconstruction

## Entity Map

### Consignment
The top-level record representing an inbound coal shipment.

| Field             | Type     | Notes                                          |
|-------------------|----------|------------------------------------------------|
| id                | string   | e.g. RCK-9901-A                               |
| cilSubsidiary     | enum     | MCL, NCL, ECL, SECL, WCL, CCL, BCCL, NEC     |
| colliery          | string   | Source mine name                               |
| declaredGrade     | enum     | G6–G17 (BIS classification)                   |
| declaredGCV       | number   | kCal/kg                                        |
| rackId            | string   | Train rack identifier                          |
| wagonCount        | number   |                                                |
| arrivalTime       | datetime |                                                |
| status            | enum     | IN_TRANSIT, ARRIVED, UNLOADING, DISCHARGED     |

---

### ParentSample
Created during sample collection at the yard. One parent per consignment lot.

| Field             | Type     | Notes                                          |
|-------------------|----------|------------------------------------------------|
| id                | string   | e.g. PRNT-8822-X                              |
| consignmentId     | ref      | → Consignment                                 |
| collectedBy       | ref      | → Personnel (operator)                        |
| collectionTime    | datetime |                                                |
| weightKg          | number   | Gross sample weight                            |
| sealId            | string   | Tamper-evident QR seal code                   |
| biometricRef      | string   | Face-ID capture reference                     |
| status            | enum     | COLLECTED, SEALED, IN_TRANSIT, PREP_RECEIVED, PULVERISED, SPLIT |

**State Transitions**:
```
COLLECTED → SEALED → IN_TRANSIT → PREP_RECEIVED → PULVERISED → SPLIT
```

---

### SubSample (Child Sample)
Generated during splitting. Multiple sub-samples per parent.

| Field             | Type     | Notes                                          |
|-------------------|----------|------------------------------------------------|
| id                | string   | e.g. CHLD-M-29384                             |
| parentId          | ref      | → ParentSample                                |
| type              | enum     | MOISTURE, CALORIFIC_VALUE, RESERVE            |
| targetWeightKg    | number   |                                                |
| actualWeightKg    | number   |                                                |
| sealId            | string   | New QR seal for sub-sample                    |
| status            | enum     | EXTRACTED, SEALED, DISPATCHED, LAB_RECEIVED   |

---

### NonConformanceReport (NCR)
Formerly "Exception Log". Raised at any stage when a discrepancy is found.

| Field             | Type     | Notes                                          |
|-------------------|----------|------------------------------------------------|
| id                | string   | e.g. NCR-2024-001                             |
| stage             | enum     | CONSIGNMENT, COLLECTION, TRANSIT, PREP, DIVISION, LAB |
| relatedSampleId   | ref      | → ParentSample or SubSample                   |
| category          | enum     | SEAL_BREACH, MASS_VARIANCE, CONTAMINATION, ADMIN_ERROR |
| manifestedMassKg  | number   |                                                |
| measuredMassKg    | number   |                                                |
| description       | text     |                                                |
| evidenceUrls      | string[] | Photo/video attachments                        |
| reportedBy        | ref      | → Personnel                                   |
| reportedAt        | datetime |                                                |
| status            | enum     | OPEN, UNDER_REVIEW, CLOSED                     |
| resolvedBy        | ref      | → Personnel (supervisor)                      |

---

### Personnel
Operators, technicians, lab analysts, supervisors.

| Field         | Type   | Notes                                            |
|---------------|--------|--------------------------------------------------|
| id            | string | e.g. OPR-774                                    |
| name          | string |                                                  |
| role          | enum   | YARD_OPERATOR, PREP_TECHNICIAN, LAB_ANALYST, SUPERVISOR |
| biometricRef  | string | Face-ID enrollment reference                    |
| badgeId       | string |                                                  |
| isActive      | bool   |                                                  |

---

### AuditEvent
Immutable log of every state change across all entities.

| Field       | Type     | Notes                            |
|-------------|----------|----------------------------------|
| id          | string   |                                  |
| entityType  | enum     | CONSIGNMENT, PARENT_SAMPLE, SUB_SAMPLE, NCR |
| entityId    | string   |                                  |
| action      | string   | e.g. "STATE_CHANGE", "SCAN"      |
| fromState   | string   |                                  |
| toState     | string   |                                  |
| actorId     | ref      | → Personnel                      |
| timestamp   | datetime |                                  |
| metadata    | object   | Additional context                |

---

## Screen-to-Entity Mapping

| Screen                  | Primary Entity       | Actions                              |
|-------------------------|----------------------|--------------------------------------|
| Consignments            | Consignment          | Register, view, update status        |
| Sample Tracking         | ParentSample         | View lifecycle, scan phase           |
| Sample Division Station | ParentSample + SubSample | Execute split, tag child samples |
| Lab Receiving           | SubSample            | Scan in, verify, flag                |
| Non-Conformance Reports | NCR                  | Create, review, resolve              |
| Audit History           | AuditEvent           | Read-only timeline                   |
| Personnel               | Personnel            | CRUD, biometric enrollment           |

---

## Process Flow State Machine

```
CONSIGNMENT (arrived)
    ↓
PARENT SAMPLE created + sealed
    ↓
IN_TRANSIT (VMS tracked)
    ↓
PREP_RECEIVED (face ID scan at prep room)
    ↓
PULVERISED (CCTV monitored)
    ↓
SPLIT → generates SUB_SAMPLES
    ↓ (each sub-sample)
DISPATCHED → LAB_RECEIVED
```

At any stage, an NCR can be raised → pauses the sample pending supervisor review.
