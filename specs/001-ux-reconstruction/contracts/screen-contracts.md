# Screen Contracts: CSAAS UX Reconstruction

Defines the UI contract for each screen — what it must show, what actions it exposes, and what navigates to/from it.

---

## 1. Dashboard (`/dashboard`)

**Purpose**: Live pipeline overview for shift supervisors.

**Must display**:
- Pipeline status bar: count of samples at each of the 5 pipeline stages
- Active NCR count with severity breakdown
- Samples completed today vs. daily target
- Last 5 audit events (minimal, time + action only)

**Actions**:
- Click any pipeline stage count → navigates to that stage's screen
- Click NCR count → navigates to Non-Conformance screen
- "Register Consignment" CTA → navigates to Consignments

**Navigation context**: No breadcrumb (dashboard is the home view)

---

## 2. Consignments (`/consignments`)

**Purpose**: Register and monitor inbound coal consignments (train racks).

**Must display**:
- 4 KPI cards: Active Racks, Pending Discharge, Verified Wagons, Avg GCV
- Inbound manifest table: Rack ID, Colliery, Arrival, Wagon Count, Status
- "Register New Consignment" CTA

**Actions**:
- Register new consignment (modal form)
- Click table row → view consignment detail (future: detail panel)

**Modal fields**: CIL Subsidiary, Colliery, Declared Grade, Declared GCV, Rack ID, Wagon Count

**Navigation context**: Process breadcrumb showing step 1 active

---

## 3. Sample Tracking (`/tracking`)

**Purpose**: End-to-end lifecycle view of a parent sample.

**Must display**:
- 12-step process stepper (vertical, left column)
- Current step highlighted with active pulse animation
- Completed steps in green with checkmark
- Right column: Biometric verification panel + Chain of Custody data card
- Active Parent ID and VMS status in header

**Actions**:
- "Scan Next Phase" button → advances current step (simulation)
- Click completed step → shows step detail tooltip
- "Generate Forensic Receipt" → PDF export trigger (stub in prototype)

**Navigation context**: Process breadcrumb showing step 2 active

---

## 4. Division Station (`/division-station`)

**Purpose**: Record pulverisation and splitting of parent samples into sub-samples.

**Must display**:

**Session List View** (shown when no session selected):
- Table of active splitting sessions: Parent ID, Weight, Status, Operator
- "Start New Session" CTA

**Session Detail View** (selected session):
- Parent seal integrity panel (CCTV feed mockup, OCR result, verification status)
- Sub-sample downstream logic panel (3 child types: Moisture, Calorific Value, Reserve)
- Each sub-sample card: ID, target weight, status, "Extract & Tag" action
- "Finalize Splitting Session" button (enabled when all sub-samples extracted)

**Actions**:
- "Extract & Tag" per sub-sample → marks sub-sample as EXTRACTED
- "Finalize Splitting Session" → marks parent as SPLIT, enables lab dispatch

**Navigation context**: Process breadcrumb showing step 3 active

---

## 5. Lab Receiving (`/lab-receiving`)

**Purpose**: Verify and receive sub-samples arriving at the analytical lab.

**Must display**:
- 3 KPI cards: Samples in Transit, Received Today, Flagged (NCR)
- Batch verification panel: scan/enter sub-sample ID
- Pending receipts table: Child ID, Parent ID, Weight, Status, Action
- Quick Actions: Weight Mismatch shortcut, Damaged Seal shortcut

**Actions**:
- Scan/Enter ID → pulls up sub-sample details for confirmation
- "Receive" individual sub-sample → status → LAB_RECEIVED
- "Receive Batch" → bulk receive all in-transit sub-samples
- Quick action buttons → pre-fill NCR modal with category

**Navigation context**: Process breadcrumb showing step 5 active (steps 3–4 are pulverisation/division, completed before this screen)

---

## 6. Non-Conformance (`/non-conformance`)

**Purpose**: Log and manage non-conformance reports (NCRs) at any process stage.

**Must display**:
- NCR form: Consignment ID (auto-filled if context available), Stage, Category, Mass variance fields, Description, Evidence upload
- Recent NCRs list (below form or in split layout): ID, Stage, Category, Status, Reported by, Date

**Actions**:
- Submit NCR → creates record, notifies supervisor
- Inline "Flag Issue" trigger (from any operational screen header) → opens compact modal version of this form

**Compact modal variant** (triggered from any screen):
- Stage: pre-filled from calling screen
- Sample ID: pre-filled from active sample context
- Category: required dropdown
- Description: required text
- "Submit NCR" button

---

## 7. Audit History (`/audit`)

**Purpose**: Immutable read-only event log for compliance review.

**Must display**:
- Filterable event table: Timestamp, Entity Type, Entity ID, Action, Actor, From State, To State
- Filter controls: date range, entity type, actor

**Actions**: Read-only. Export to CSV (stub in prototype).

---

## 8. Reports (`/report-builder`)

**Purpose**: Generate and export operational reports.

**Must display**: (existing ReportBuilderView — no changes in this phase)

---

## 9. Personnel (`/personnel`)

**Purpose**: Manage staff accounts, roles, and biometric enrollment.

**Must display**: (existing PersonnelManagementView — no changes in this phase)

---

## 10. System Health (`/system-health`)

**Purpose**: Monitor equipment status (weighbridges, CCTV, VMS, scanners).

**Must display**: (existing SystemHealthView — no changes in this phase)

---

## 11. Alerts (`/alert-config`)

**Purpose**: Configure notification rules and thresholds.

**Must display**: (existing AlertConfigView — no changes in this phase)

---

## Process Breadcrumb Contract

Shown on all screens in the Operations group (Consignments, Tracking, Division Station, Lab Receiving).

```
[ 1. Consignment ] → [ 2. Sample Tracking ] → [ 3. Division ] → [ 4. Lab ]
```

- Current step: indigo text + indigo dot indicator
- Completed steps: green text + checkmark
- Future steps: grey text
- Clicking a completed step: navigates to that screen
- Clicking a future step: no action (visual only)

Component props:
```typescript
interface ProcessBreadcrumbProps {
  currentStep: 1 | 2 | 3 | 4;
  onNavigate: (view: ViewType) => void;
}
```