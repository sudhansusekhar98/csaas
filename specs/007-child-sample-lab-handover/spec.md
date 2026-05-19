# Feature Spec: Child Sample Count, Operator Assignment & Lab Receive Confirmation

**Branch**: `007-child-sample-lab-handover` | **Date**: 2026-05-16

## User Stories

### US1 — Child Sample Count Prompt (P1)
As a Division Station operator, when I start the Small Bagging step I want to specify how many child sample bags to create (not always 3), so the system generates the correct number of QR-sealed child bags.

**Acceptance criteria**:
- A number input (min 1, max 5) prompts the operator before showing the child bag cards
- The bag cards render dynamically based on the entered count (always starts with Sample A, Sample B, Referee for 3; adds Sample D, Sample E for 4 and 5)
- The "Seal All Child Bags" button is only enabled when all bag weight fields are filled

### US2 — Operator Assignment per Child Sample (P1)
As a Division Station operator, each child sample bag must be assigned to the lab handover operator who will physically transport it to the Lab, so custody is traceable per bag.

**Acceptance criteria**:
- Each child bag card has an "Assigned Operator" dropdown (from the existing OPERATORS list)
- The "Seal All Child Bags" button requires all bags to have an operator assigned
- Sealed bag summary shows assigned operator per bag

### US3 — Lab Receiving Confirmation Button (P1)
As a Lab Receiver, after selecting the acceptance status and filling in all required receipt fields, I should be able to click a "Confirm Receipt" button that activates only when all required fields (receiver, acceptance status, visual condition) are filled.

**Acceptance criteria**:
- The "Receive Batch" button in LabReceivingView becomes "Confirm Receipt" and is disabled until: receiver selected, acceptance status chosen, visual condition chosen
- Clicking it marks the selected pending item as "Received" and clears the form
- A success toast or status update confirms the receipt
