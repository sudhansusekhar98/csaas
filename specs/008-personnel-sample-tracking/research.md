# Research: Personnel Sample Activity Tracking

## Decision 1: Layout for Activity Panel

- **Decision**: Render the Sample Activity panel as a collapsible/expandable section below the two existing right-column panels (VMS Biometrics and Security Permission Matrix), spanning the full 12-column grid when an operator is selected.
- **Rationale**: The current right column is already tall. Adding a full-width section below both panels avoids cramping the layout and gives enough horizontal space for four tabbed sections.
- **Alternatives considered**: Inline row expansion (too cramped with existing 4 columns), replacing the biometrics panel (loses existing functionality), separate detail page (over-engineered for a prototype).

## Decision 2: Tab vs Card layout for Activity Sections

- **Decision**: Use four pill tabs (Parent Samples | Child Samples | Lab Receipts | NCR Filings) that switch the visible table. Default active tab is "Parent Samples".
- **Rationale**: Tabs keep all four categories accessible without vertical scrolling through four tables. Each category has a different schema so separate tables make the structure clear.
- **Alternatives considered**: Accordion sections (all visible at once) — rejected because it creates too much vertical scroll with sample data; grid of 4 cards — rejected because tabular data per category needs table columns.

## Decision 3: Mock Data Structure

- **Decision**: Define a `SAMPLE_ACTIVITY` constant keyed by operator ID (`USR-XXXX`), containing arrays for each of the four activity types.
- **Rationale**: Keeps all mock data co-located in the component file, consistent with the pattern used in other views (SplittingStationView, LabReceivingView). No external state needed.
- **Alternatives considered**: Separate data file — rejected as unnecessary for prototype scope.

## Decision 4: Activity Count Chips in Registry Table

- **Decision**: Add a "Sample Activity" column to the Personnel Registry table showing four small count chips per operator.
- **Rationale**: Gives supervisors an at-a-glance overview without needing to open each operator. Zero counts display as `—` in muted style.
- **Alternatives considered**: Tooltip on hover — rejected because chips are always visible and scannable.
