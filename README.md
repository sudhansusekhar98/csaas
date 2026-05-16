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
