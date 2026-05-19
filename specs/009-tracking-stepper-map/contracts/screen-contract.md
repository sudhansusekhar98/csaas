# Screen Contract: Sample Tracking — Snake Stepper, Child Visibility & GPS Map View

**Feature**: `009-tracking-stepper-map`
**Surface**: `src/components/SampleTrackingView.tsx` (`SampleTrackingView` exported component, route key `"sample-tracking"`)

This contract defines the externally observable UI behaviour. It is the acceptance surface for `/speckit-tasks` and the manual demo run in `quickstart.md`.

## 1. Page anatomy (post-change)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Sticky header                                                        │
│   Title · subtitle    [Scan Next Phase] [Stepper | Map] [Active Sample│
│                                                          dropdown]   │
├──────────────────────────────────────────────────────────────────────┤
│ Main canvas (mode-switched)                                          │
│                                                                      │
│   Mode = STEPPER:                                                    │
│     ┌──────────────────────────────────────────┐ ┌────────────────┐  │
│     │ Snake stepper (cols 1–8 on lg)           │ │ Right column    │ │
│     │  Row 0 → 1 → 2 → 3 → 4 → 5 → 6 ┐         │ │ (existing       │ │
│     │  Row 1 ← 7 ← 8 ← 9 ← 10 ← 11 ← 12        │ │  biometric +    │ │
│     └──────────────────────────────────────────┘ │  custody cards) │ │
│     ┌──────────────────────────────────────────┐ └────────────────┘  │
│     │ Child Samples panel (only if parent      │                     │
│     │ currentStepIndex >= 9)                   │                     │
│     └──────────────────────────────────────────┘                     │
│                                                                      │
│   Mode = MAP:                                                        │
│     ┌──────────────────────────────────────────┐ ┌────────────────┐  │
│     │ Leaflet map (cols 1–8)                   │ │ Right column    │ │
│     │  Pins + parent route + child routes      │ │ (same as above) │ │
│     │  Legend panel                            │ │                 │ │
│     └──────────────────────────────────────────┘ └────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

## 2. Component contracts

### 2.1 `SnakeStepper` (new)

**Props**:

```ts
interface SnakeStepperProps {
  steps: ProcessStepNode[];                 // already laid out (row/col/direction set)
  onStepClick: (stepIdx: number) => void;
  highlightRange?: { from: number; to: number } | null;   // child scoping: dim outside this range
}
```

**Behaviour**:

- Renders a CSS Grid with `stepsPerRow` derived from container width (6 / 4 / 3 / 1).
- Odd rows render right-to-left.
- Row-end connector arcs render in an absolute SVG overlay, coloured by the lesser-progressed of the two joined steps.
- Each node is a `<button>` with `aria-current="step"` when status is `current`, `aria-disabled` when `pending`.
- Clicking a `completed` (or `breach`) node calls `onStepClick(stepIdx)`. Pending nodes are non-interactive.
- When `highlightRange` is set, nodes outside `[from..to]` get `opacity-50` and `pointer-events-none`.

### 2.2 `ChildSamplePanel` (new)

**Props**:

```ts
interface ChildSamplePanelProps {
  parentId: string;
  children: ChildSample[];                  // already filtered for this parent
  activeChildId: string | null;
  onSelectChild: (childId: string | null) => void;  // null = back to parent scope
}
```

**Behaviour**:

- Rendered only when `parent.currentStepIndex >= 9` and at least one child exists.
- Each row shows: child ID (mono), division badge (A/B/C), current step name, and three compact pip indicators for steps 10/11/12 (filled emerald when completed, indigo pulse when current, slate-100 outline when pending).
- Selecting a row sets `activeChildId`; clicking again deselects.
- Empty state (parent past step 9 but no children): info card "No child samples linked yet."

### 2.3 `SampleMapView` (new)

**Props**:

```ts
interface SampleMapViewProps {
  parentRoute: SampleRoute;
  childRoutes: SampleRoute[];
  onPinClick: (sampleId: string, stepIdx: number) => void;
}
```

**Behaviour**:

- Renders a `<MapContainer>` at fixed height `h-[520px]`, centered on the parent route's centroid; default zoom level chosen to fit all pins (auto-fit on mount and on parent-route change).
- Parent route: indigo polyline + indigo numbered pins.
- Child routes: each in a distinct hue (emerald, amber, violet rotating).
- Pins for `breach`-status events are red regardless of route colour.
- Clicking a pin calls `onPinClick(sampleId, stepIdx)` which triggers the same popup the stepper uses.
- Legend (bottom-left absolute card): pin status colours, parent/child route colours, "N steps without GPS coordinates" count.
- On view-mode toggle FROM map, the `<MapContainer>` is hidden via `display: none` (not unmounted) so tiles stay warm. `map.invalidateSize()` is called when toggling back.

### 2.4 `SampleTrackingView` (modified)

**New state**:

```ts
const [viewMode, setViewMode]       = useState<ViewMode>('stepper');
const [activeChildId, setActiveChildId] = useState<string | null>(null);
```

**Header segmented control**:

- Two buttons "Stepper" / "Map" with label-caps styling, primary-indigo background on the active button, slate-100 on the inactive.
- Sits between "Scan Next Phase" and the active-sample card.

**Sample dropdown change** must reset `activeChildId` to `null` (a different parent has different children).

## 3. Step detail popup contract (UNCHANGED interface)

The existing popup (`activeStep` state + the conditional `<AnimatePresence>` block) keeps its current shape. New behaviour:

- When a child is active and the clicked step is `>= 9`, the popup pulls the step event from `child.events[stepIdx - 9]` (with step 9 itself pulled from the parent's Division Logic event).
- Otherwise it pulls from the parent's `STEP_EVENTS[selectedSampleId][stepIdx]` as today.
- The popup gains a small "Sample: PRNT-… / CHLD-…" identifier in the existing footer-context row (already present, just data-driven).

## 4. Routing / navigation contract

No new routes. The view-mode toggle is in-page state. `ProcessBreadcrumb` (current step prop `currentStep={2}`) is unchanged.

## 5. External dependencies introduced

- `react-leaflet@^4.2`
- `leaflet@^1.9`
- `@types/leaflet@^1.9` (dev dep)
- `leaflet/dist/leaflet.css` imported once in `src/main.tsx`.

## 6. Demo data contract

- `STEP_TEMPLATES` array gains `coord` field as defined in `data-model.md`.
- A new `CHILD_SAMPLES` array is exported from `src/data/sample-tracking-mock.ts`.
- All existing exports remain (no breaking renames).

## 7. Accessibility contract

- All interactive elements reachable by keyboard (Tab through stepper nodes, child rows, map pins).
- `aria-current="step"` on the current stepper node.
- Map pins carry a descriptive `title` attribute.
- Connector arcs and decorative SVGs are `aria-hidden="true"`.
