# Implementation Plan: Domain Expansion — DVC/Supplier Split, Sample Collection, and Process Record Fields

**Branch**: `006-domain-expansion` | **Date**: 2026-05-16
**Spec**: specs/006-domain-expansion/

---

## Summary

Six coordinated changes that expand the prototype to reflect the full coal sample anti-adulteration workflow more accurately:

1. **DVC vs Supplier consignment split** — two separate nav items/pages with distinct data
2. **Sample Collection page** — new screen for QR seal/barcode generation at the yard
3. **Prep Room record fields** — add receiving person, seal condition, video reference to the verified scan panel
4. **Division Station: Pulverisation step** — add opening time, operator, CCTV clip ID fields
5. **Division Station: Small Bagging step** — add child QR seal generation, bag count, bag types (Sample A / Sample B / Referee)
6. **Lab Receiving: receipt records** — add lab receiver, receipt time, acceptance status fields

---

## Change 1: DVC vs Supplier Consignments

### Context
DVC (Damodar Valley Corporation) is the power utility that receives coal. It buys from CIL subsidiaries. Supplier consignments come from private mining companies under direct contracts.

### Proposed navigation
```
Operations:
  ├── DVC Consignments      (existing ConsignmentsView — renamed, updated data)
  ├── Supplier Consignments  (NEW SupplierConsignmentsView)
  ├── Sample Collection      (NEW — see Change 2)
  ├── Sample Tracking
  ├── Prep Room
  ├── Division Station
  └── Lab Receiving
```

### DVC Consignments (`consignments` — existing view, updated)
- Page title: "DVC Consignments — CIL Procurement"
- Subtitle: "Inbound coal from Coal India Limited subsidiaries"
- Register modal dropdown updates:
  - "CIL Subsidiary" → options: MCL, NCL, ECL, SECL, WCL, CCL, BCCL, NEC (all 8 CIL companies)
  - Add "DVC Receiving Plant" dropdown: Raghunathpur, Mejia, Chandrapura, Durgapur Steel Plant
  - Add "Purchase Order No." text field
- Table mock data: CIL-origin consignments with `DVC-PO-XXXX` purchase order numbers

### Supplier Consignments (`supplier-consignments` — NEW)
- Page title: "Supplier Consignments — Direct Contract"
- Subtitle: "Inbound coal from private/captive mining suppliers"
- Register modal fields:
  - Supplier Name (dropdown): Adani Enterprises, Jindal Steel, Vedanta, NTPC Mining, Singareni Collieries
  - Contract Reference No. (text input)
  - Origin Mine / Loading Point (text input)
  - Declared Grade (G6–G17)
  - Declared GCV (kCal/kg)
  - Rake ID, Wagon Count
  - Sampling Agency (Third Party / Self / DVC)
- Table mock data: 3–4 supplier consignments with contract numbers and different origins

---

## Change 2: Sample Collection Page (Barcode / QR Seal Generation)

### New view: `sample-collection`
This is the yard-level step where the operator physically collects a sample from the Track Hopper or Wagon Tippler and generates the parent QR seal.

### Page: "Sample Collection & Seal Generation"

**Two panels side by side:**

**Left panel — Collection Form:**
```
SAMPLE SOURCE
  Sample Source Type: [Track Hopper ▾] / [Wagon Tippler ▾]
  Equipment ID:        TH-07 / WT-03 / etc.

RAKE / WAGON DETAILS
  Rack ID:          [text input]   (links to DVC or Supplier consignment)
  Wagon Number:     [text input]   e.g. WGN-0034

COLLECTION DETAILS
  Collector:        [dropdown: OPR-774 (J. Doe), OPR-312 ...]
  Date / Time:      [auto-filled: 2026-05-16 14:20 UTC]

SEAL & RFID
  Seal Number:      [text input]   e.g. QRL-SEC-8825-XX-1
  RFID Tag No.:     [text input]   e.g. RFID-88250-TH7

[Generate Parent QR Seal] button
```

**Right panel — Generated QR Label Preview:**
Displayed after form submission. Shows:
- A large mock QR code (SVG grid pattern)
- Parent Sample ID: `PRNT-8825-X`
- Seal Number, RFID, Source, Collector, Date/Time
- "Print Label" button (stub)
- "Confirm & Register" button → saves the record and adds to Sample Tracking

**Recent collections table** (bottom): shows last 5 generated seals with status (Sealed / In Transit / Received).

---

## Change 3: Prep Room — Additional Record Fields

### Current state
The PrepRoomView verification overlay shows:
- Bag details (ID, source, consignment, weight, seal ID)
- "Capture Operator Biometric" + "Accept & Log to Queue"

### Updated verified overlay — additional fields
After the existing bag detail card, add a **"Prep Room Record"** section:

```
PREP ROOM RECORD
┌─────────────────────────────────────────┐
│ Receiving Person    [dropdown: Prep Technician list] │
│ Seal Condition      ○ Intact  ○ Damaged  ○ Missing  │
│ Video Reference     [text input: CCTV clip ID e.g. CAM-04-1432-001] │
└─────────────────────────────────────────┘
```

These fields are required before "Accept & Log to Queue" becomes active (in addition to biometric).

The Pending Bag Queue table also shows a new column: "Seal Condition" for received bags.

---

## Change 4: Division Station — Pulverisation Step Records

### Context
When the operator opens the parent sample bag at the pulveriser, the system must log this as an immutable custody event.

### Updated detail view — new "Pulverisation Log" section
Below the existing "Parent Seal Integrity" CCTV panel, add a collapsible "Pulverisation Record" card:

```
03  Pulverisation Log                         [CCTV Feed Active]
────────────────────────────────────────────
Authorized Workstation:   PU-03 (Pulveriser Unit 3)
Opening Time:             [auto-filled: current timestamp when "Mark as Opened" clicked]
Operator:                 [dropdown: OPR-774, OPR-312, OPR-881]
CCTV Clip ID:             [text input: auto-suggested e.g. CAM-04-1432-001]

[Mark Parent QR as Opened] button
→ Disabled until seal scan verified
→ Once clicked: records timestamp, shows "OPENED AT 14:32 UTC by OPR-774"
```

When the parent QR is marked as opened, the status indicator changes from "VMS Link Active" to "Parent Bag Opened — Pulverisation in Progress".

---

## Change 5: Division Station — Small Bagging Step

### Context
After pulverisation, the ground sample is distributed into 3 child bags with newly generated QR seals.

### Updated detail view — new "Small Bagging" section (below sub-sample cards)
Add a Step 03 panel that appears after pulverisation is marked:

```
03  Small Bagging — Child QR Seal Generation
────────────────────────────────────────────
Generated Child Bags:

  [Sample A]   SUB-A-8822-X  |  Weight: [input] kg  |  [Generate QR] 
  [Sample B]   SUB-B-8822-X  |  Weight: [input] kg  |  [Generate QR]
  [Referee]    SUB-R-8822-X  |  Weight: [input] kg  |  [Generate QR]

Child Bag Count:   3 bags
Total Weight:      15.18 kg

[Seal All Child Bags] button → generates all 3 QR codes
```

After sealing, each child bag shows a generated QR preview + seal ID. The existing "Sub-Sample Generation" panel (with Moisture, Calorific, Reserve) becomes the lab routing step that happens after physical bagging.

**Bag Type nomenclature update:**
- Sample A → replaces "Moisture Analysis" (physical bag label)
- Sample B → replaces "Calorific Value"
- Referee → replaces "Reserve Sample"

The `SUB-M`, `SUB-C`, `SUB-R` codes are internal lab analysis codes that map to the physical bag types A, B, Referee.

---

## Change 6: Lab Receiving — Receipt Record Fields

### Current state
Lab Receiving shows a pending receipts table with Child ID, Parent ID, Weight, Status, Action.

### Updated verified overlay (after scanning a sub-sample)
Add a "Receipt Record" section to the batch verification panel (currently just shows a scan input):

```
RECEIPT RECORD
────────────────────────────────────────────
Lab Receiver:        [dropdown: S. Reddy (OPR-956), K. Nair (OPR-901)]
Receipt Time:        [auto-filled: current UTC timestamp]
Acceptance Status:   ○ Accepted  ○ Conditional  ○ Rejected (Raise NCR)
Visual Condition:    ○ Seal Intact  ○ Seal Damaged  ○ Label Damaged
```

The pending receipts table gets two new columns: **Receiver** and **Receipt Time** (shown for received items).

The KPI card "Received Today: 42" remains but the 3-card row adds a 4th card for "Conditional Receipts" count.

---

## Updated Navigation & Breadcrumb

### New `ViewType` additions
```typescript
'supplier-consignments' | 'sample-collection'
```

### Updated Operations nav (Sidebar)
```
Operations
  ├─ DVC Consignments         (Package icon, view: 'consignments')
  ├─ Supplier Consignments    (Building icon, view: 'supplier-consignments')  ← NEW
  ├─ Sample Collection        (QrCode icon, view: 'sample-collection')        ← NEW
  ├─ Sample Tracking          (MapPin icon)
  ├─ Prep Room                (FlaskConical icon)
  ├─ Division Station         (SquareSplitVertical icon)
  └─ Lab Receiving            (Microscope icon)
```

### Updated ProcessBreadcrumb (5 steps, step 2 renamed)
```
[1. Consignment] → [2. Collection] → [3. Prep Room] → [4. Division] → [5. Lab]
```

Step 1 maps to both `consignments` AND `supplier-consignments` (both are step 1).
Step 2 now maps to `sample-collection` (was `tracking`).

All operational views get updated `currentStep` props accordingly.

---

## Files Changed

| File | Change |
|------|--------|
| `src/types.ts` | Add `'supplier-consignments'`, `'sample-collection'` |
| `src/components/layout/Sidebar.tsx` | Add 2 new nav items in Operations |
| `src/components/layout/ProcessBreadcrumb.tsx` | Update step 2 to Collection, step views mapping |
| `src/App.tsx` | Add routes for new views; update breadcrumb prop for `SampleCollectionView`|
| `src/components/ConsignmentsView.tsx` | Rename to DVC, expand dropdown + add plant/PO fields |
| `src/components/SupplierConsignmentsView.tsx` | NEW — supplier consignment page |
| `src/components/SampleCollectionView.tsx` | NEW — barcode/QR seal generation |
| `src/components/PrepRoomView.tsx` | Add receiving person, seal condition, video reference |
| `src/components/SplittingStationView.tsx` | Add pulverisation log + small bagging section |
| `src/components/LabReceivingView.tsx` | Add receipt record fields |
