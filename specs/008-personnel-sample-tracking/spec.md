# Feature Spec: Personnel Sample Activity Tracking

**Branch**: `008-personnel-sample-tracking` | **Date**: 2026-05-19

## Overview

Extend the Personnel Management view so that each registered operator's sample custody history is visible — who collected which parent sample at the Wagon/Tripper, who handled which child samples in the Prep Room, which lab technician confirmed receipt, and who filed a Non-Conformance Report (NCR) against a sample.

## User Stories

### US1 — Per-Operator Sample Activity Panel (P1)
As a supervisor or compliance auditor, when I select an operator in the Personnel Registry, I want to see a "Sample Activity" section showing their complete sample custody history, so I can trace chain-of-custody responsibility per person.

**Acceptance criteria**:
- Clicking a row in the Personnel Registry selects that operator and highlights the row
- A "Sample Activity" panel appears below (or beside) the existing biometric/permissions panels
- The panel has four sections (tabs or cards):
  1. **Parent Samples** — samples where this operator generated the QR code at the Wagon/Tripper (shows Sample ID, Seal ID, Colliery, Timestamp)
  2. **Child Samples** — samples where this operator handled bagging in the Prep Room (shows Child Sample ID, Parent ID, Step, Timestamp)
  3. **Lab Receipts** — samples where this operator confirmed receipt as Lab Technician (shows Sample ID, Status, Receipt Time)
  4. **NCR Filings** — NCRs filed by this operator (shows NCR ID, Stage, Sample ID, Reason summary, Filed At)
- Each section shows "No activity" when the operator has no records in that category
- Summary counts (4 small stat chips) appear in the operator's row in the registry table

### US2 — Activity Count Summary in Registry (P2)
As a supervisor, I want to see at a glance how many samples each operator has touched, so I can identify who is most/least active.

**Acceptance criteria**:
- Each row in the Personnel Registry table shows four count chips: Parent, Child, Lab, NCR
- Counts are derived from the mock activity data
- Zero counts are shown as `—` (em-dash) in a muted style
