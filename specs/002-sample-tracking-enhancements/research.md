# Research: Sample Tracking Page Enhancements

## Three Problems Being Solved

### Problem 1: No Sample Selector
The screen is hardcoded to `PRNT-8822-X` with no way to switch between samples. Operators managing multiple simultaneous samples have no visibility into other in-progress parent samples from this screen.

**Decision**: Dropdown selector in the page header area showing all active parent samples.  
**Rationale**: Dropdown keeps the UI compact. The active sample list is short in practice (typically 3–8 samples per shift). A dropdown with ID + status badge is the fastest interaction — one click to switch context. No separate "list" screen is needed because the Division Station already has the session list pattern; this screen is about lifecycle detail.  
**Alternatives considered**:
- Sidebar list panel — too much space; conflicts with the existing right-panel layout
- Tab bar — works only if samples are few and consistently named; not scalable
- Separate "select sample" step before this screen — adds friction; operators need to switch mid-task

**Mock data** (5 active parent samples for the prototype):
```
PRNT-8822-X — VMS Path Tracking (step 5) — current default
PRNT-8820-A — Prep Room Receipt (step 6)
PRNT-8818-B — Pulverization (step 8)
PRNT-8815-C — Sealing Sequence (step 3)
PRNT-8810-D — Lab Dispatch (step 11)
```

---

### Problem 2: Scan Next Phase — No Visual UX
`handleSimulateScan` correctly manages state (`showSealScanner`, `scanStatus`, `scanProgress`) but no UI is rendered for those states. The button clicks but nothing visible happens.

**Decision**: Full-screen overlay modal with a 3-phase animated experience: Scanning → Result (Verified or Compromised).  
**Rationale**: A full overlay (not a small toast) is appropriate because scanning is a security-critical action. The operator needs to clearly see the result before proceeding. The overlay also creates a natural "pause" that feels like a real scan event.

**Overlay phases**:
1. **Scanning** (animated): QR code scan animation + progress bar + "Scanning QR seal..." text
2. **Verified** (green): Shield check icon + "Seal Authenticated" + sample ID confirmed + "Advance to Next Phase" button (which closes overlay and advances the step)
3. **Compromised** (red): Alert icon + "Seal Breach Detected" + "Raise NCR" button + "Close" button

**Step advancement**: On successful scan, the current step in the stepper advances by one (the `steps` array transitions: `current` → `completed`, next `pending` → `current`). This makes the demo tangible — every scan click moves the sample forward.

**Alternatives considered**:
- Toast notification — too subtle for a security verification event
- Progress bar in header — doesn't convey the "security gate" nature of the scan
- Inline result in the stepper — too small to read comfortably under time pressure

---

### Problem 3: Heading Disappears on Scroll
When a user scrolls down to see lower steps in the 12-step stepper (steps 8–12), the page title and sample ID context scrolls out of view. The operator loses track of which sample they are looking at.

**Decision**: Sticky page header using CSS `position: sticky` + `top-0` with a white background and bottom border, so the sample ID and page title remain visible at all times.

**Implementation detail**:
- The scrollable container is `<main>` in App.tsx with `overflow-y-auto`
- The page wrapper in App.tsx adds `p-8` padding
- The sticky header needs `sticky top-0 z-30 -mx-8 px-8 py-4 bg-white/95 backdrop-blur-sm border-b border-border-slate` to break out of the `space-y-10` gap and adhere to the scroll container's top edge
- ProcessBreadcrumb goes above the sticky zone (it only appears at the very top when arriving at the page)

**Alternatives considered**:
- Duplicate header at bottom of screen — creates confusion about which is authoritative
- Floating chip showing sample ID — too minimal; doesn't solve the full context loss problem

---

## Implementation Decisions Summary

| # | Problem | Solution |
|---|---------|----------|
| 1 | Hardcoded sample | Dropdown selector — 5 mock samples, switching resets step display |
| 2 | No scan UX | Full-screen overlay: scanning animation → verified (green) / compromised (red) → advance step |
| 3 | Header disappears | `sticky top-0` header bar with backdrop blur |
