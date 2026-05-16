# Implementation Plan: Professional SaaS Dashboard

**Branch**: `004-professional-dashboard` | **Date**: 2026-05-16
**Spec**: specs/004-professional-dashboard/

**Input**: Dashboard is too basic; no charts; needs professional SaaS look with all data in one view.

---

## Summary

Redesign `DashboardView.tsx` into a full professional SaaS dashboard. Uses pure inline SVG for all charts — no new npm packages. Adds 6 KPI cards, an hourly throughput bar chart, a pipeline donut chart, a coal grade distribution chart, a live activity feed, and an enhanced NCR table — all derived from the existing mock data in the prototype.

---

## Technical Context

**Language/Version**: TypeScript 5.x
**Charts**: Inline SVG (no recharts/chart.js — zero new dependencies)
**Styling**: Tailwind CSS with existing design tokens
**Constraints**: Single file — `src/components/DashboardView.tsx`

---

## Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER: "Live Pipeline"  [date/shift]  [+ Register Consignment] │
├──────────┬──────────┬──────────┬──────────┬──────────┬───────────┤
│ Wagons   │ Active   │Completed │Compliance│ Avg GCV  │ Open NCRs │
│  432     │  73      │  42      │  96.4%   │ 4218     │     3     │
├────────────────────────────┬─────────────────────────────────────┤
│  Hourly Throughput         │  Sample Distribution (Donut)        │
│  [SVG bar chart — 8h]      │  [SVG ring + legend]                │
├────────────────┬───────────┴──────────────┬─────────────────────┤
│ Coal Grade     │ Pipeline Flow            │ Shift Performance   │
│ Distribution   │ [enhanced 5-stage bar]   │ [progress + quota]  │
│ [horiz bars]   │                          │                     │
├────────────────┴──────────────────────────┴─────────────────────┤
│  Recent Activity Feed (5 items)  │  Active NCRs (3 items)       │
└──────────────────────────────────┴──────────────────────────────┘
```

---

## Charts (all pure SVG)

### 1. Hourly Throughput Bar Chart
- X-axis: 8 hourly labels (08:00–15:00)
- Y-axis: 0–10 samples, 5 gridlines
- Bars: `<rect>` filled indigo with hover tooltip
- Data: `[4, 7, 6, 8, 5, 6, 4, 2]` (current hour partial)
- Current hour bar: lighter indigo with striped pattern

### 2. Sample Distribution Ring (Donut) Chart
- SVG `<circle>` with `stroke-dasharray` / `stroke-dashoffset`
- 5 segments: Consignments (8), In Prep (14), Division (3), Lab Queue (6), Completed (42)
- Center label: total count "73 active"
- Legend: colored dots + labels + counts, right of chart

### 3. Coal Grade Distribution (Horizontal Bars)
- 5 rows: G9 (12), G10 (24), G11 (18), G12 (9), G13 (4)
- Each row: grade label + filled bar + count
- Bar widths proportional to max (G10=24)
- Color: gradient from indigo (G9) to purple (G13)

### 4. Shift Performance Panel
- Large radial arc showing 21% of daily quota (42/200)
- SVG semi-circle arc using `<path>` with stroke
- Time remaining indicator
- Consignment batch count

### 5. Pipeline Flow (Enhanced)
- 5 stage boxes connected with animated arrows
- Count + trend indicator (↑↓) per stage
- Click → navigate to that screen

---

## All Mock Data

### KPI Cards
| Metric | Value | Trend | Color |
|--------|-------|-------|-------|
| Total Wagons | 432 | ↑ 8 vs yesterday | indigo |
| Active Samples | 73 | — | purple |
| Completed Today | 42 | ↑ 12.5% | emerald |
| Compliance Rate | 96.4% | ↓ 0.8% | teal |
| Avg GCV | 4,218 kCal/kg | ↑ 42 | orange |
| Open NCRs | 3 | ↑ 1 new | amber |

### Hourly Throughput
```
08:00→4  09:00→7  10:00→6  11:00→8  12:00→5  13:00→6  14:00→4  15:00→2
```

### Ring Chart Segments
```
Completed: 42 (57.5%) — emerald
In Prep:   14 (19.2%) — purple
Consign:    8 (11.0%) — indigo
Lab Queue:  6 (8.2%)  — teal
Division:   3 (4.1%)  — orange
Total:     73
```

### Coal Grade Distribution
```
G9:  12 wagons  ████████████████████████░░░░░░░░
G10: 24 wagons  ████████████████████████████████
G11: 18 wagons  ████████████████████████░░░░░░░░
G12:  9 wagons  ████████████░░░░░░░░░░░░░░░░░░░░
G13:  4 wagons  █████░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

### Recent Activity Feed
```
14:35  PRNT-8824-Z  Received at Prep Room Gate 2         [green]
14:22  PRNT-8823-Y  Sealed — Sealing Bay 2               [green]
14:18  PRNT-8822-X  VMS Transit — Approved route active  [indigo]
14:05  NCR-2024-031 Raised at Division Station           [amber]
13:58  RCK-9902-B   Consignment arrived — 62 wagons      [slate]
```

---

## Implementation Notes

- All charts are self-contained SVG blocks inside the component
- `viewBox` ensures charts scale with container width
- Hover states use CSS `group` + `group-hover` on SVG elements
- Donut chart uses a helper function `polarToCartesian` to position segment start/end
- No state required — all data is static mock data
- `setActiveView` prop threads through to pipeline stage clicks and NCR "View All"
