# Research: UX Reconstruction for Coal Sample Anti-Adulteration System (CSAAS)

## Phase 0 Research Findings

---

### Decision: Navigation Architecture Pattern
**Decision**: Process-flow-first sidebar with secondary administrative grouping  
**Rationale**: The existing prototype splits "Main Navigation" and "Modules & Controls" in a way that fragments the 12-step operational process. Users working in coal sample preparation need to follow a sequential chain-of-custody; navigating by "module" forces them to mentally map screens to process steps. A process-flow-first nav makes the path of a sample the primary mental model.  
**Alternatives considered**:
- Role-based nav (e.g., Yard Operator vs. Lab Technician views) — rejected because most users span multiple steps and role-switching would add friction
- Flat single-level nav — rejected because 11+ screens at one level with no grouping is cognitively expensive

---

### Decision: Terminology Standardization
**Decision**: Adopt operational terminology consistent with coal quality testing standards  
**Rationale**: Current prototype mixes multiple naming conventions — "Prep Room Receipt" vs. "Lab Receiving", "Consignment" vs. "Rack", "Parent Sample" vs. "Main Bag". Inconsistency confuses operators who use specific terms from the IS 436 coal sampling standards.

| Current (inconsistent)        | Standardized Term           |
|-------------------------------|----------------------------|
| Prep Room Receipt             | Sample Prep Receiving       |
| Main Bag / Parent Sample      | Parent Sample (consistent)  |
| Rack / Consignment / Shipment | Consignment (top-level)     |
| Child Sample                  | Sub-sample                  |
| Exception Log                 | Non-Conformance Report (NCR)|
| Splitting Station             | Sample Division Station     |
| Pulverization                 | Sample Pulverisation        |

---

### Decision: Process Step Navigation (Contextual Wayfinding)
**Decision**: Add a process-step breadcrumb/stepper at the top of each operational screen  
**Rationale**: Operators need to know where in the 12-step chain a current action sits. A persistent step indicator (similar to an e-commerce checkout) provides spatial context without requiring a map screen.  
**Alternatives considered**:
- Full timeline always visible in sidebar — rejected because it takes too much space and most steps are not simultaneously active
- Pop-up overlay status panel — rejected because it hides the current screen context

---

### Decision: Dashboard Redesign
**Decision**: Replace generic "Preparation Overview" with a live pipeline dashboard  
**Rationale**: The current dashboard has 3 KPI cards (Pending Splitting, Samples Prepared, Active Exceptions) and a "Recent Shipments" table. This doesn't tell an operator the state of the current shift's pipeline. A pipeline view showing how many samples are at each stage — Yard → Prep → Division → Lab — provides actionable situational awareness.  
**Alternatives considered**:
- Keep as-is and just fix nav — rejected because the dashboard is the first thing a supervisor sees; it should reflect the process, not be a generic report

---

### Decision: Exception Logging Placement
**Decision**: Exception logging accessible via contextual "Flag" action on each process screen AND as standalone nav item  
**Rationale**: Currently, exception logging is only a nav item under "Modules & Controls". Operators who discover a seal breach at the Splitting Station have to leave that screen to log it. Inline flagging keeps evidence (which screen, which sample) intact.  
**Alternatives considered**:
- Remove the standalone exception log nav — rejected because supervisors need to review all exceptions in one place

---

### Decision: Lab Receiving Elevation
**Decision**: Move Lab Receiving to the main process navigation, not under "Modules & Controls"  
**Rationale**: Lab Receiving is the final validation step in the chain of custody — receiving the sub-sample in the lab confirms anti-adulteration success. Burying it under secondary navigation underweights its importance. Lab staff only operate this one screen; it should be the first thing they see at login.  
**Alternatives considered**:
- Role-based default view — possible future enhancement but not needed for the reconstruction

---

### Decision: Component Consistency
**Decision**: Standardize all card, table, badge, and button patterns from the existing design system  
**Rationale**: Current prototype has slight inconsistencies — DashboardView uses `rounded-2xl` tables, ConsignmentsView uses `rounded-3xl` modals, LabReceivingView uses `rounded-2xl` panels, SplittingStationView uses mixed sizing. The Tailwind utility classes are consistent in color tokens but not in corner radius and spacing rhythm.  
**Alternatives considered**: Full design system migration — out of scope; standardize within existing tokens

---

### Unknowns Resolved

| Was NEEDS CLARIFICATION | Resolution |
|--------------------------|------------|
| Who are the primary users? | Yard operators, sample prep technicians, lab analysts, supervisors |
| Is real-time data needed? | Yes — VMS feed and seal scan are live; dashboard KPIs are near-real-time (polling acceptable) |
| Mobile requirement? | No — industrial control room workstations; tablet support is a future phase |
| Authentication system? | Biometric (face ID) + QR scan, not username/password for field operators; supervisors use standard login |
| Print/PDF needed? | Forensic receipt and NCR reports need PDF export |
