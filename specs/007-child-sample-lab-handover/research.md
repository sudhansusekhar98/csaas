# Research: Child Sample Count, Operator Assignment & Lab Receive Confirmation

## Decision 1: Dynamic Child Bag Count
- **Decision**: Add a `childCount` state (number, 1–5) rendered before Small Bagging cards. Derive bag type labels from count using a fixed ordered array: `['A','B','R','D','E']`.
- **Rationale**: The physical process can require fewer or more bags depending on sample volume. Three is the common case but not universal.
- **Alternatives considered**: Always 3 bags (current) — rejected because not flexible enough; free-form bag creation — rejected as too complex for this prototype stage.

## Decision 2: Operator Assignment Per Bag
- **Decision**: Add `assignedOperator: string` to `BagRecord`. Each bag card shows a dropdown using the existing `OPERATORS` array. The "Seal All Child Bags" button checks all bags have `weight` and `assignedOperator` set.
- **Rationale**: Chain of custody requires knowing who physically transports each child sample to the lab. Assigning at sealing time captures the handover commitment.
- **Alternatives considered**: Single operator for all bags — rejected because different bags can go to different labs/analysts; assigning at dispatch time — rejected because this is a sealed chain-of-custody system.

## Decision 3: Lab Receiving Confirmation Button
- **Decision**: Rename "Receive Batch" to "Confirm Receipt". Derive `canConfirm` boolean from `receiptRecord` state (receiver + acceptanceStatus + visualCondition all non-empty). On click: mark the first pending item in the table as `done`, reset the form, and show a brief inline success message.
- **Rationale**: The button currently has no enabled/disabled logic and clicking it does nothing visible. Adding a `canConfirm` gate mirrors the pattern already used in PrepRoomView (`canAccept`).
- **Alternatives considered**: Modal confirmation — rejected as over-engineered for a prototype; separate confirm step — rejected as unnecessary extra click.
