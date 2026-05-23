# CSAAS — Coal Sample Anti-Adulteration System

A React + TypeScript prototype for managing the end-to-end chain of custody of coal samples from consignment receipt through laboratory analysis.

## Process Flow

```
Consignment Receipt → Sample Collection & Sealing → In Transit (VMS) →
Sample Preparation (Pulverisation) → Division Station (Splitting) → Lab Receiving & Authentication
```

## Run Locally

**Prerequisites**: Node.js 18+

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

> No API key or backend required — this is a UI prototype with mock data.

## Navigation Structure

| Group | Screens |
|-------|---------|
| **Operations** | Consignments → Sample Tracking → Division Station → Lab Receiving |
| **Quality & Compliance** | Non-Conformance Reports, Audit History, Reports |
| **Administration** | Personnel, System Health, Alerts |

## Key Features

- **Live Pipeline Dashboard** — shift-level sample counts at each process stage
- **Process Breadcrumb** — contextual wayfinding on all operational screens
- **Division Station Session List** — manage multiple splitting sessions
- **Inline NCR Trigger** — flag non-conformances without leaving the current screen
- **Chain of Custody Tracking** — 12-step lifecycle stepper with biometric verification mockup


Equipment ID refers to the specific machine unit that collected the coal sample — it identifies which physical equipment at the
  plant did the sampling.

  In this system there are two source types, and the Equipment ID distinguishes the exact unit:

  ┌───────────────┬──────────────────────┬───────────────────────┐
  │  Source Type  │ Equipment ID example │        Meaning        │
  ├───────────────┼──────────────────────┼───────────────────────┤
  │ Track Hopper  │ TH-07                │ Track Hopper unit #7  │
  ├───────────────┼──────────────────────┼───────────────────────┤
  │ Wagon Tippler │ WT-03                │ Wagon Tippler unit #3 │
  └───────────────┴──────────────────────┴───────────────────────┘

  Why it's needed:

  1. Traceability — if a sample later fails a quality test or is suspected of tampering, investigators need to know exactly which
  machine collected it, not just the type of machine.
  2. Equipment accountability — a plant may have multiple track hoppers or wagon tipplers running simultaneously. The Equipment ID
  pins the sample to one specific unit.
  3. QR code payload — it's embedded in the printed QR label as TRACK HOPPER TH-07 so any downstream station (splitting, lab,
  dispatch) can read it and know the full origin chain.

  Essentially, it's the same logic as tracking which production line made a product — not just that it came from "the factory."

   Rack ID and Wagon Number track where the coal came from — the physical shipment chain:

  ---
  Wagon Number (WGN-0034)
  - The specific railway wagon/railcar that carried the coal to the plant.
  - A consignment arrives as a rake (a train) made up of many individual wagons. Each wagon is numbered.
  - This tells you: which wagon in the delivery was this sample pulled from?
  - Critical for anti-adulteration — if a specific wagon's coal is found to be substandard or tampered with, you can isolate it by
  wagon number rather than rejecting the entire consignment.

  ---
  Rack ID (RCK-9901-A)
  - The sample storage rack where the collected sample jar/container is physically placed after collection.
  - Think of it as the "shelf address" inside the sample room — multiple samples from the same consignment go into the same rack.
  - This is a custody location field, not a coal origin field. It answers: where is this physical sample sitting right now?

  ---
  How they work together:
  Wagon Number (WGN-0034)
  - The specific railway wagon/railcar that carried the coal to the plant.
  - A consignment arrives as a rake (a train) made up of many individual wagons. Each wagon is numbered.
  - This tells you: which wagon in the delivery was this sample pulled from?
  - Critical for anti-adulteration — if a specific wagon's coal is found to be substandard or tampered with, you can isolate it by
  wagon number rather than rejecting the entire consignment.

  ---
  Rack ID (RCK-9901-A)
  - The sample storage rack where the collected sample jar/container is physically placed after collection.
  - Think of it as the "shelf address" inside the sample room — multiple samples from the same consignment go into the same rack.
  - This is a custody location field, not a coal origin field. It answers: where is this physical sample sitting right now?

  ---
  How they work together:

  Consignment CNS-2024-001
    └── Wagon WGN-0034  →  Sample collected by TH-07  →  Stored in Rack RCK-9901-A
    └── Wagon WGN-0028  →  Sample collected by WT-03  →  Stored in Rack RCK-9901-A

  Both fields end up embedded in the QR label so downstream stations (splitting, lab) can verify the sample's origin wagon and find it
   physically in the rack without searching.
