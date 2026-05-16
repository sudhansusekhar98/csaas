# Tasks: Sample Tracking Page Enhancements

**Input**: Design documents from `specs/002-sample-tracking-enhancements/`

**Prerequisites**: plan.md ✓ | research.md ✓ | contracts/screen-contract.md ✓

**Tests**: Not requested — UI prototype; verify visually via `npm run dev`.

**Single file scope**: All changes are confined to `src/components/SampleTrackingView.tsx`.

---

## User Stories

| ID  | Priority | Title                    | Goal                                                                 |
|-----|----------|--------------------------|----------------------------------------------------------------------|
| US1 | P1       | Sample Selector          | Dropdown in header lets user switch between 5 active parent samples  |
| US2 | P1       | Scan Next Phase UX       | "Scan Next Phase" button shows animated overlay with scan result     |
| US3 | P1       | Sticky Page Header       | Title + sample selector stay pinned when scrolling through 12 steps  |

---

## Phase 1: Setup (Foundational Data Structures)

**Purpose**: Define the shared data types and mock data that US1, US2, and US3 all depend on. Must be in place before any rendering work.

- [X] T001 Add `SampleOption` interface and `SAMPLES` mock array near the top of `src/components/SampleTrackingView.tsx`:

  ```typescript
  interface SampleOption {
    id: string;
    sealId: string;
    currentStepIndex: number; // 0-based (step 1 = index 0)
  }

  const SAMPLES: SampleOption[] = [
    { id: 'PRNT-8822-X', sealId: 'QRL-SEC-8822-HY77-1', currentStepIndex: 4 }, // step 5
    { id: 'PRNT-8820-A', sealId: 'QRL-SEC-8820-KL42-2', currentStepIndex: 5 }, // step 6
    { id: 'PRNT-8818-B', sealId: 'QRL-SEC-8818-MN91-3', currentStepIndex: 7 }, // step 8
    { id: 'PRNT-8815-C', sealId: 'QRL-SEC-8815-PQ55-4', currentStepIndex: 2 }, // step 3
    { id: 'PRNT-8810-D', sealId: 'QRL-SEC-8810-RS73-5', currentStepIndex: 10 }, // step 11
  ];
  ```

- [X] T002 Add `selectedSampleId` state (initialized to `'PRNT-8822-X'`) and a `selectedSample` derived value in `src/components/SampleTrackingView.tsx`:

  ```typescript
  const [selectedSampleId, setSelectedSampleId] = useState<string>('PRNT-8822-X');
  const selectedSample = SAMPLES.find(s => s.id === selectedSampleId) ?? SAMPLES[0];
  ```

- [X] T003 Convert the hardcoded `steps` array in `src/components/SampleTrackingView.tsx` from a plain `const` with baked-in `status` strings to a computed array derived from `selectedSample.currentStepIndex`:

  Remove the `status` field from the step definitions. Instead, derive status at render time:

  ```typescript
  const STEP_DEFINITIONS = [
    { id: 1, title: 'Sample Collection', desc: 'Track Hopper / Wagon Tippler', icon: Box },
    { id: 2, title: 'Identity Capture', desc: 'ID Scan & Face Analytics', icon: Fingerprint },
    { id: 3, title: 'Sealing Sequence', desc: 'Tamper-Evident QR Lock', icon: QrCode },
    { id: 4, title: 'Parent ID Issuance', desc: 'Registry Entry Logged', icon: Database },
    { id: 5, title: 'VMS Path Tracking', desc: 'Approved Logistics Route', icon: Truck },
    { id: 6, title: 'Prep Room Receipt', desc: 'Face ID + Scan In', icon: MapPin },
    { id: 7, title: 'Integrity Verification', desc: 'Visual Seal Audit', icon: ShieldCheck },
    { id: 8, title: 'Pulverisation', desc: 'CCTV Monitored Grinding', icon: Microscope },
    { id: 9, title: 'Division Logic', desc: 'Sub-Sample Generation', icon: SquareSplitVertical },
    { id: 10, title: 'ID Linkage', desc: 'Relational Database Sync', icon: Database },
    { id: 11, title: 'Lab Dispatch', desc: 'Scanned for Quality Control', icon: ArrowRight },
    { id: 12, title: 'Lab Authentication', desc: 'Incoming Verification', icon: FlaskConical },
  ];

  // Computed steps (re-derived whenever selectedSample or currentStepIndex changes)
  const steps = STEP_DEFINITIONS.map((step, idx) => ({
    ...step,
    status: idx < selectedSample.currentStepIndex ? 'completed'
           : idx === selectedSample.currentStepIndex ? 'current'
           : 'pending',
  }));
  ```

- [X] T004 Add `stepCounts` state to allow step advancement in `src/components/SampleTrackingView.tsx`:

  Replace the fixed `currentStepIndex` from `SAMPLES` with a mutable map so advancing works:

  ```typescript
  const [stepOffsets, setStepOffsets] = useState<Record<string, number>>({});

  // Effective step index = SAMPLES base + any advances made this session
  const effectiveStepIndex = (selectedSample.currentStepIndex + (stepOffsets[selectedSampleId] ?? 0));

  // Use effectiveStepIndex instead of selectedSample.currentStepIndex in steps computation
  ```

  And `advanceStep`:
  ```typescript
  const advanceStep = () => {
    if (effectiveStepIndex < 11) {
      setStepOffsets(prev => ({ ...prev, [selectedSampleId]: (prev[selectedSampleId] ?? 0) + 1 }));
    }
    setShowSealScanner(false);
    setScanStatus('idle');
    setScanProgress(0);
  };
  ```

**Checkpoint**: Data structures in place. Existing render output unchanged (steps still derive same values for PRNT-8822-X at index 4).

---

## Phase 2: User Story 1 — Sample Selector Dropdown (P1) 🎯 MVP

**Goal**: A styled dropdown in the header area lets operators switch between 5 active parent samples. Switching updates the stepper and Chain of Custody panel.

**Independent Test**: Open Sample Tracking → see dropdown with 5 options → select "PRNT-8818-B" → stepper shows steps 1–7 completed (green), step 8 current (pulsing indigo), steps 9–12 greyed → Chain of Custody card shows PRNT-8818-B and its seal ID.

### Implementation

- [X] T005 [US1] Replace the static "Active Parent" chip in the header of `src/components/SampleTrackingView.tsx` with a styled `<select>` dropdown:

  **Find** the div containing `<p className="label-caps text-[9px] mb-1">Active Parent</p>` and `<p className="data-mono font-bold text-text-slate-900 text-sm">PRNT-8822-X</p>`.

  **Replace** with:
  ```tsx
  <div>
    <p className="label-caps text-[9px] mb-1">Active Sample</p>
    <select
      value={selectedSampleId}
      onChange={(e) => {
        setSelectedSampleId(e.target.value);
        setScanStatus('idle');
        setShowSealScanner(false);
        setScanProgress(0);
      }}
      className="data-mono font-bold text-text-slate-900 text-sm bg-transparent border-none outline-none cursor-pointer hover:text-primary-indigo transition-colors"
    >
      {SAMPLES.map((s) => (
        <option key={s.id} value={s.id}>
          {s.id} — Step {s.currentStepIndex + 1}
        </option>
      ))}
    </select>
  </div>
  ```

- [X] T006 [US1] Update the Chain of Custody Data card (the indigo panel in the right column) in `src/components/SampleTrackingView.tsx` to use `selectedSample.id` and `selectedSample.sealId` instead of hardcoded strings:

  **Find** `<p className="data-mono text-lg font-bold">PRNT-8822-X</p>` → replace with `{selectedSample.id}`

  **Find** `<p className="data-mono text-sm font-bold truncate">QRL-SEC-8822-HY77-1</p>` → replace with `{selectedSample.sealId}`

**Checkpoint**: Dropdown visible. Switching samples drives the stepper and CoC panel correctly.

---

## Phase 3: User Story 2 — Scan Next Phase Overlay (P1)

**Goal**: Clicking "Scan Next Phase" shows an animated full-screen overlay with a progress bar during scanning, then transitions to a green "Verified" or red "Compromised" result screen. "Advance to Next Phase" actually moves the sample forward one step in the stepper.

**Independent Test**: Click "Scan Next Phase" → overlay appears with spinning QR icon + filling progress bar → after ~2 seconds transitions to result → if green: "Advance to Next Phase" closes overlay and current step advances by 1 in the stepper → if red: "Raise NCR" and "Close" buttons appear.

### Implementation

- [X] T007 [US2] Add the scan overlay rendering to `src/components/SampleTrackingView.tsx`. Insert the following JSX block just before the closing `</div>` of the top-level wrapper (or as the first child — place it at the end of the return's root div):

  Wrap in `<AnimatePresence>` and import `motion` from `motion/react` (already imported).

  Add `AlertTriangle` to the lucide-react import line.

  ```tsx
  {/* Scan Overlay */}
  <AnimatePresence>
    {showSealScanner && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`w-96 rounded-3xl p-10 shadow-2xl border-t-4 flex flex-col items-center text-center gap-6 bg-white ${
            scanStatus === 'verified' ? 'border-success-emerald' :
            scanStatus === 'compromised' ? 'border-red-500' :
            'border-primary-indigo'
          }`}
        >
          {/* Scanning state */}
          {scanStatus === 'scanning' && (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                <QrCode size={64} className="text-primary-indigo" />
              </motion.div>
              <div className="w-full">
                <p className="label-caps text-primary-indigo mb-2">Verifying QR Seal</p>
                <p className="data-mono font-bold text-text-slate-900 mb-4">{selectedSample.id}</p>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-2 bg-primary-indigo rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
                <p className="text-xs text-text-slate-400 mt-3 font-medium">Authenticating seal integrity...</p>
              </div>
            </>
          )}

          {/* Verified state */}
          {scanStatus === 'verified' && (
            <>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
                <ShieldCheck size={72} className="text-success-emerald" />
              </motion.div>
              <div>
                <p className="label-caps text-success-emerald mb-2">Seal Authenticated</p>
                <p className="text-sm text-text-slate-500 font-medium">Chain of custody confirmed. Proceeding to next phase.</p>
              </div>
              <div className="bg-emerald-50 rounded-xl px-4 py-2 w-full">
                <p className="data-mono font-bold text-text-slate-900 text-sm">{selectedSample.id}</p>
                <p className="data-mono text-xs text-text-slate-400 truncate">{selectedSample.sealId}</p>
              </div>
              <button
                onClick={advanceStep}
                className="w-full py-3 bg-primary-indigo text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-100 hover:brightness-110 transition-all"
              >
                Advance to Next Phase
              </button>
            </>
          )}

          {/* Compromised state */}
          {scanStatus === 'compromised' && (
            <>
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: [0, -8, 8, -8, 8, 0] }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <AlertTriangle size={72} className="text-red-500" />
              </motion.div>
              <div>
                <p className="label-caps text-red-500 mb-2">Seal Breach Detected</p>
                <p className="text-sm text-text-slate-500 font-medium">Security violation logged. Supervisor notification sent.</p>
              </div>
              <div className="bg-red-50 rounded-xl px-4 py-2 w-full">
                <p className="data-mono font-bold text-text-slate-900 text-sm">{selectedSample.id}</p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => { setShowSealScanner(false); setScanStatus('idle'); }}
                  className="flex-1 py-3 bg-warning-amber text-white font-bold text-sm rounded-xl shadow-lg hover:brightness-110 transition-all"
                >
                  Raise NCR
                </button>
                <button
                  onClick={() => { setShowSealScanner(false); setScanStatus('idle'); }}
                  className="flex-1 py-3 border border-border-slate text-text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  ```

**Checkpoint**: Clicking "Scan Next Phase" shows overlay with rotating QR icon + filling indigo progress bar. After ~2s: green shield with "Advance to Next Phase" (or red alert with two buttons). Advancing closes overlay and moves the current step indicator down by one.

---

## Phase 4: User Story 3 — Sticky Page Header (P1)

**Goal**: The page title "End-to-End Tracking" and the sample selector dropdown remain pinned to the top of the scroll area when the user scrolls through the 12-step stepper.

**Independent Test**: Navigate to Sample Tracking → scroll down until step 8 is visible → page title and sample selector still visible at top → ProcessBreadcrumb NOT visible (it scrolled away — this is correct, it only needs to appear when first landing on the page).

### Implementation

- [X] T008 [US3] Restructure the top-level wrapper and header in `src/components/SampleTrackingView.tsx`:

  **Change** the outer `<div className="space-y-10 ...">` to `<div className="flex flex-col gap-0 ...">` (removing `space-y-10` since we'll manage spacing manually for the sticky zone).

  **Keep** `<ProcessBreadcrumb>` as the first child with `className="mb-4"` (non-sticky).

  **Wrap** the existing `<header>` content in a new sticky container:
  ```tsx
  <div className="sticky top-0 z-30 -mx-8 px-8 py-5 bg-white/95 backdrop-blur-sm border-b border-border-slate mb-8">
    {/* existing header content (title block + scan button + sample selector chip) goes here */}
  </div>
  ```

  **Move** the existing `<header>` JSX (title div + flex gap-4 buttons div) inside this sticky div. Remove the `<header>` tag — it becomes the content of the sticky wrapper.

  **Add** `<div className="space-y-10">` around the grid below the sticky header to restore the content spacing.

**Checkpoint**: Scroll down on the Sample Tracking page → "End-to-End Tracking" title and sample dropdown stay fixed at the top → ProcessBreadcrumb scrolls away (correct) → no layout shift or overlap.

---

## Phase 5: Polish & Verification

- [X] T009 Verify no TypeScript errors: run `npx tsc --noEmit` in `D:\VL Access\Coal Project\Prototype` and fix any errors

- [X] T010 [P] Check that `AlertTriangle` is added to the lucide-react import in `src/components/SampleTrackingView.tsx` (needed for the compromised overlay state); also confirm `AnimatePresence` is imported from `motion/react` (it is used in the overlay)

- [X] T011 [P] Verify the "Scan Next Phase" button in the sticky header is disabled (or shows a loading cursor) while `scanStatus === 'scanning'` to prevent double-triggering. Add `disabled={scanStatus === 'scanning'}` to the button.

- [X] T012 Visual smoke test: `npm run dev` → navigate to Sample Tracking → (a) switch samples — stepper and CoC update; (b) click "Scan Next Phase" — overlay shows; (c) advance step — stepper moves; (d) scroll down — header stays pinned; (e) flag issue — NCR modal opens independently of scan overlay

---

## Dependencies & Execution Order

```
Phase 1 (T001–T004): Data structures — BLOCKS everything
    ↓
Phase 2 (T005–T006): US1 Sample Selector — depends on Phase 1
Phase 3 (T007):      US2 Scan Overlay   — depends on Phase 1 (uses selectedSample, advanceStep)
Phase 4 (T008):      US3 Sticky Header  — depends on Phase 2 (header contains selector)
    ↓
Phase 5 (T009–T012): Polish — depends on all above
```

US2 (Phase 3) and US1 (Phase 2) can technically start at the same time after Phase 1, but since they edit the same file sequentially, implement US1 first then US2.

---

## Parallel Opportunities

Within Phase 5:
- T010 (import check) and T011 (button disabled state) can both be done while T009 runs

---

## Implementation Strategy

### Complete in one pass (same file, 12 tasks)

Since all 12 tasks touch `SampleTrackingView.tsx`, the most efficient approach is:

1. Phase 1: Add interface + SAMPLES + state restructure (T001–T004)
2. Phase 2: Replace static chip with dropdown, wire CoC panel (T005–T006)
3. Phase 3: Add overlay JSX at bottom of return (T007)
4. Phase 4: Restructure layout for sticky header (T008)
5. Phase 5: TypeScript check + polish (T009–T012)

**Total task count: 12**

| Phase | Story | Tasks |
|-------|-------|-------|
| Phase 1 (Data) | — | 4 |
| Phase 2 | US1 | 2 |
| Phase 3 | US2 | 1 |
| Phase 4 | US3 | 1 |
| Phase 5 (Polish) | — | 4 |

---

## Acceptance Criteria Mapping

| AC | Task |
|----|------|
| AC1: Dropdown shows 5 samples | T005 |
| AC2: Switching sample updates stepper | T003, T005 |
| AC3: Switching sample updates CoC panel | T006 |
| AC4: Scan button shows overlay | T007 |
| AC5: Progress bar fills 0→100% | T007 |
| AC6: Verified state shown (green) | T007 |
| AC7: "Advance" closes overlay + steps forward | T004, T007 |
| AC8: Compromised state shown (red) | T007 |
| AC9: Title + selector stay visible on scroll | T008 |
| AC10: Breadcrumb above sticky zone | T008 |
| AC11: Zero TypeScript errors | T009 |
