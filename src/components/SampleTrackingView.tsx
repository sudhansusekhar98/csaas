import { useState, useMemo } from 'react';
import {
  QrCode, ShieldCheck, MapPin,
  Clock, Activity, ChevronRight, AlertTriangle, X, User, Calendar,
  Map, LayoutList,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProcessBreadcrumb from './layout/ProcessBreadcrumb';
import type { ViewType, StepEvent, ViewMode } from '../types';
import {
  SAMPLES, STEP_DEFINITIONS, STEP_EVENTS, CHILD_SAMPLES,
  buildParentRoute, buildChildRoutes,
} from '../data/sample-tracking-mock';
import SnakeStepper, { buildStepperNodes } from './sample-tracking/SnakeStepper';
import ChildSamplePanel from './sample-tracking/ChildSamplePanel';
import SampleMapView from './sample-tracking/SampleMapView';

// ── Component ─────────────────────────────────────────────────────────────────

interface SampleTrackingViewProps {
  onNavigate: (view: ViewType) => void;
}

export default function SampleTrackingView({ onNavigate }: SampleTrackingViewProps) {
  const [selectedSampleId, setSelectedSampleId] = useState<string>('PRNT-8822-X');
  const [stepOffsets, setStepOffsets] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('stepper');
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  // Scan overlay state
  const [showSealScanner, setShowSealScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'verified' | 'compromised'>('idle');
  const [scanProgress, setScanProgress] = useState(0);

  // Step detail popup state
  const [activeStep, setActiveStep] = useState<{ event: StepEvent; def: typeof STEP_DEFINITIONS[0]; stepNum: number; sampleId: string } | null>(null);

  const selectedSample = SAMPLES.find((s) => s.id === selectedSampleId) ?? SAMPLES[0];
  const effectiveStepIndex = selectedSample.currentStepIndex + (stepOffsets[selectedSampleId] ?? 0);

  const activeChild = CHILD_SAMPLES.find((c) => c.parentId === selectedSampleId && c.id === activeChildId);
  const parentChildren = CHILD_SAMPLES.filter((c) => c.parentId === selectedSampleId);

  const stepperNodes = useMemo(
    () => buildStepperNodes(effectiveStepIndex),
    [effectiveStepIndex]
  );

  const parentRoute = useMemo(() => buildParentRoute(selectedSampleId), [selectedSampleId, effectiveStepIndex]);
  const childRoutes = useMemo(() => buildChildRoutes(selectedSampleId), [selectedSampleId]);

  const advanceStep = () => {
    if (effectiveStepIndex < 11) {
      setStepOffsets((prev) => ({
        ...prev,
        [selectedSampleId]: (prev[selectedSampleId] ?? 0) + 1,
      }));
    }
    setShowSealScanner(false);
    setScanStatus('idle');
    setScanProgress(0);
  };

  const handleSimulateScan = () => {
    if (scanStatus === 'scanning') return;
    setShowSealScanner(true);
    setScanStatus('scanning');
    setScanProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        setScanProgress(100);
        setScanStatus(Math.random() > 0.15 ? 'verified' : 'compromised');
        clearInterval(interval);
      } else {
        setScanProgress(Math.min(progress, 99));
      }
    }, 200);
  };

  const handleSampleChange = (newId: string) => {
    setSelectedSampleId(newId);
    setActiveChildId(null);
    setScanStatus('idle');
    setShowSealScanner(false);
    setScanProgress(0);
    setActiveStep(null);
  };

  const handleStepClick = (idx: number) => {
    let event: StepEvent | undefined;
    if (activeChild && idx >= 9) {
      event = activeChild.events[idx - 9];
    } else {
      event = STEP_EVENTS[selectedSampleId]?.[idx];
    }
    if (!event) return;
    const contextSampleId = activeChild && idx >= 9 ? activeChild.id : selectedSampleId;
    setActiveStep({ event, def: STEP_DEFINITIONS[idx], stepNum: idx + 1, sampleId: contextSampleId });
  };

  const handleMapPinClick = (sampleId: string, stepIdx: number) => {
    const child = CHILD_SAMPLES.find((c) => c.id === sampleId);
    let event: StepEvent | undefined;
    if (child) {
      event = child.events[stepIdx - 9];
    } else {
      event = STEP_EVENTS[sampleId]?.[stepIdx];
    }
    if (!event) return;
    setActiveStep({ event, def: STEP_DEFINITIONS[stepIdx], stepNum: stepIdx + 1, sampleId });
  };

  // Operator initials for avatar
  const initials = (name: string) =>
    name === 'SYSTEM' ? 'SYS'
    : name.split(' ').map((n) => n[0]).join('').toUpperCase();

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProcessBreadcrumb currentStep={2} onNavigate={onNavigate} />

      {/* Sticky header */}
      <div className="sticky top-0 z-30 -mx-8 px-8 py-5 bg-white/95 backdrop-blur-sm border-b border-border-slate mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-[1440px] mx-auto">
          <div>
            <div className="flex items-center gap-2 text-text-slate-400 mb-1 text-[10px] font-bold uppercase tracking-widest">
              <span>Operational Continuity</span>
              <ChevronRight size={12} />
              <span className="text-primary-indigo">Live Lifecycle</span>
            </div>
            <h1 className="text-3xl font-bold text-text-slate-900 tracking-tight">End-to-End Tracking</h1>
            <p className="text-text-slate-500 text-sm font-medium italic">Immutable lifecycle monitoring from extraction to chemical analysis.</p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <button
              onClick={handleSimulateScan}
              disabled={scanStatus === 'scanning'}
              className="px-5 py-2.5 bg-white border border-border-slate text-text-slate-900 text-[10px] font-bold label-caps rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <QrCode size={16} /> Scan Next Phase
            </button>

            {/* View mode toggle */}
            <div className="flex rounded-xl overflow-hidden border border-border-slate shadow-sm">
              <button
                onClick={() => setViewMode('stepper')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-bold label-caps transition-all ${
                  viewMode === 'stepper' ? 'bg-primary-indigo text-white' : 'bg-slate-50 text-text-slate-700 hover:bg-slate-100'
                }`}
              >
                <LayoutList size={13} /> Stepper
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-bold label-caps transition-all ${
                  viewMode === 'map' ? 'bg-primary-indigo text-white' : 'bg-slate-50 text-text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Map size={13} /> Map
              </button>
            </div>

            <div className="flex gap-3 p-3 bg-white border border-border-slate rounded-2xl shadow-sm items-center">
              <div className="flex items-center gap-2.5 pr-3 border-r border-border-slate">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-primary-indigo shrink-0">
                  <QrCode size={16} />
                </div>
                <div>
                  <p className="label-caps text-[9px] mb-0.5">Active Sample</p>
                  <select
                    value={selectedSampleId}
                    onChange={(e) => handleSampleChange(e.target.value)}
                    className="data-mono font-bold text-text-slate-900 text-xs bg-transparent border-none outline-none cursor-pointer hover:text-primary-indigo transition-colors"
                  >
                    {SAMPLES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} — Step {s.currentStepIndex + (stepOffsets[s.id] ?? 0) + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <p className="label-caps text-[9px] mb-0.5 text-success-emerald">VMS Security</p>
                  <p className="font-bold text-text-slate-900 text-[10px]">ENCRYPTED FEED</p>
                </div>
                <div className="w-2.5 h-2.5 bg-success-emerald rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-10">
        <div className="grid grid-cols-12 gap-10">
          {/* Left: snake stepper or map (col-span-8) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">

            {/* ── Stepper card (hidden when map mode) ─────────────────────── */}
            <div className={viewMode === 'stepper' ? '' : 'hidden'}>
              <div className="bg-white border border-border-slate rounded-2xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Activity size={180} />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-widest text-text-slate-900 mb-4 border-b border-slate-50 pb-6 flex items-center gap-2">
                  <Clock size={16} className="text-primary-indigo" /> Process Protocol Stepper
                </h3>
                {effectiveStepIndex > 0 && (
                  <p className="text-[10px] text-text-slate-400 font-medium mb-6 flex items-center gap-1.5">
                    <User size={11} /> Click any completed step to view operator &amp; collection details
                  </p>
                )}
                <SnakeStepper
                  steps={stepperNodes}
                  onStepClick={handleStepClick}
                  highlightRange={activeChildId ? { from: 9, to: 11 } : null}
                />
              </div>

              {/* Child samples panel (only when parent is past Division Logic) */}
              {effectiveStepIndex >= 9 && (
                <ChildSamplePanel
                  parentId={selectedSampleId}
                  children={parentChildren}
                  activeChildId={activeChildId}
                  onSelectChild={setActiveChildId}
                />
              )}
            </div>

            {/* ── Map card (hidden when stepper mode, kept mounted) ────────── */}
            <div className={viewMode === 'map' ? '' : 'hidden'}>
              <SampleMapView
                parentRoute={parentRoute}
                childRoutes={childRoutes}
                onPinClick={handleMapPinClick}
              />
            </div>
          </div>

          {/* Right column */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-white border border-border-slate rounded-2xl p-8 shadow-sm group overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="font-bold text-xs uppercase tracking-widest text-text-slate-900 mb-8 border-b border-slate-50 pb-4">Biometric Verification</h3>
                <div className="aspect-video bg-slate-950 rounded-2xl shadow-inner relative overflow-hidden flex items-center justify-center p-6 border-2 border-slate-900 group-hover:border-primary-indigo transition-all duration-500">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAusVLjgyMEPhqIUohKcNCJckgO8RiFkioBGLbw7X1RNmZLgR-b3pWJCrxb5jc__DN-W-FpQVFVVTXwNChn4pys9-zSb4T_pDAJeWV2ON9T1LDoknY1INqisVnPvxM1oDzDMduWyQs_NviSrjsWgDrU60fK966k2V-iMkSfMGu5FmrBomsTfLVVZB7xO9eiyQdTyrCdpobL-qdOPfUtUjc6_FgzddB2brGRJbnBI5KpJsbHq5_i1ZlQnzg06o-hxykSrzAbLtFyC-gs" className="w-full h-full object-cover opacity-60 mix-blend-overlay grayscale group-hover:grayscale-0 transition-all duration-700" alt="Face Analytics" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 border border-primary-indigo/80 m-4 rounded relative shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary-indigo" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary-indigo" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary-indigo" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary-indigo" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 text-[9px] font-bold text-white uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">MATCH: 99.1% (V. Admin)</div>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-slate-400">OPERATOR DESIGNATION</span>
                    <span className="font-bold text-text-slate-900 tracking-tight">LOGISTICS LEAD</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-text-slate-400">ACCESS PROTOCOL</span>
                    <span className="font-bold text-success-emerald uppercase tracking-widest">AUTHORIZED</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary-indigo rounded-2xl p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full" />
              <div className="relative z-10">
                <h3 className="font-bold text-xs uppercase tracking-widest opacity-80 mb-6">Chain of Custody Data</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Parent Sample ID</p>
                    <p className="data-mono text-lg font-bold">{selectedSample.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Main Bag QR Seal</p>
                    <p className="data-mono text-sm font-bold truncate">{selectedSample.sealId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Current Phase</p>
                    <p className="text-sm font-bold">{STEP_DEFINITIONS[effectiveStepIndex]?.title ?? 'Complete'}</p>
                  </div>
                  {activeChild && (
                    <div>
                      <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Active Child</p>
                      <p className="data-mono text-sm font-bold">{activeChild.id}</p>
                    </div>
                  )}
                </div>
              </div>
              <button className="w-full mt-10 py-3 bg-white text-primary-indigo text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-lg relative z-10">
                Generate Forensic Receipt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Step detail popup ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveStep(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-border-slate"
            >
              {/* Header */}
              <div className="p-6 border-b border-border-slate bg-success-emerald/5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-success-emerald text-white flex items-center justify-center shadow-md shrink-0">
                    <activeStep.def.icon size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-success-emerald uppercase tracking-widest bg-success-emerald/10 px-2 py-0.5 rounded">
                        Step {activeStep.stepNum} — Completed
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-text-slate-900">{activeStep.def.title}</h2>
                    <p className="text-xs text-text-slate-500 font-medium">{activeStep.def.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveStep(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-text-slate-400 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Timestamp banner */}
              <div className="px-6 py-3 bg-slate-50 border-b border-border-slate flex items-center gap-2">
                <Calendar size={14} className="text-text-slate-400" />
                <span className="text-xs font-bold text-text-slate-600 uppercase tracking-widest">Completed</span>
                <span className="data-mono text-xs text-text-slate-900 font-bold ml-1">{activeStep.event.completedAt}</span>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Operator card with FRS face capture */}
                <div>
                  <p className="label-caps mb-3">Operator — CCTV FRS Capture</p>

                  {activeStep.event.operator.frsPhotoUrl ? (
                    <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner relative">
                      <div className="relative">
                        <img
                          src={activeStep.event.operator.frsPhotoUrl}
                          alt="FRS Capture"
                          className="w-full h-80 object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-60 h-60 border border-success-emerald/80 relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            <div className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-success-emerald" />
                            <div className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-success-emerald" />
                            <div className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-success-emerald" />
                            <div className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-success-emerald" />
                            <div className="absolute -top-10 left-0 right-0 text-center">
                              <span className="bg-success-emerald text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest">
                                MATCH {activeStep.event.operator.biometricMatch}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                            {activeStep.event.operator.cameraId} · LIVE FRS
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-3 py-2 flex justify-between items-center">
                          <span className="text-[9px] text-white font-bold uppercase tracking-widest">FRS CAPTURED</span>
                          <span className="text-[9px] text-success-emerald font-bold uppercase tracking-widest">IDENTITY CONFIRMED</span>
                        </div>
                      </div>
                      <div className="p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-indigo flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                          {initials(activeStep.event.operator.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-xs">{activeStep.event.operator.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{activeStep.event.operator.role} · <span className="data-mono">{activeStep.event.operator.badgeId}</span></p>
                        </div>
                        <div className="flex items-center gap-1 text-success-emerald shrink-0">
                          <ShieldCheck size={14} />
                          <span className="text-[10px] font-bold uppercase">Verified</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-border-slate">
                      <div className="w-12 h-12 rounded-xl bg-primary-indigo/10 border-2 border-primary-indigo/20 flex items-center justify-center text-primary-indigo font-bold text-xs shrink-0">
                        {initials(activeStep.event.operator.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-text-slate-900 text-sm">{activeStep.event.operator.name}</p>
                        <p className="text-xs text-text-slate-500 font-medium">{activeStep.event.operator.role}</p>
                        <p className="data-mono text-[10px] text-text-slate-400 mt-0.5">{activeStep.event.operator.badgeId}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 justify-end text-primary-indigo mb-0.5">
                          <ShieldCheck size={13} />
                          <span className="text-[10px] font-bold uppercase">Auto</span>
                        </div>
                        <p className="text-[10px] text-text-slate-400 font-bold">System Process</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location + Verification */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-4 border border-border-slate">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin size={12} className="text-text-slate-400" />
                      <p className="label-caps text-[9px]">Location</p>
                    </div>
                    <p className="text-sm font-bold text-text-slate-900 leading-snug">{activeStep.event.location}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-border-slate">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ShieldCheck size={12} className="text-text-slate-400" />
                      <p className="label-caps text-[9px]">Verification</p>
                    </div>
                    <p className="text-sm font-bold text-text-slate-900 leading-snug">{activeStep.event.verificationMethod}</p>
                  </div>
                </div>

                {/* Notes */}
                {activeStep.event.notes && (
                  <div className="bg-amber-50 border border-warning-amber/20 rounded-xl p-4">
                    <p className="label-caps text-[9px] text-warning-amber mb-1">Notes</p>
                    <p className="text-xs text-text-slate-700 font-medium leading-relaxed">{activeStep.event.notes}</p>
                  </div>
                )}

                {/* Sample context */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="font-bold text-text-slate-400 uppercase tracking-widest">Sample</span>
                  <span className="data-mono font-bold text-text-slate-900">{activeStep.sampleId}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => setActiveStep(null)}
                  className="w-full py-3 border border-border-slate rounded-xl text-sm font-bold text-text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-widest"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scan overlay ──────────────────────────────────────────────────── */}
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
              {scanStatus === 'scanning' && (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                    <QrCode size={64} className="text-primary-indigo" />
                  </motion.div>
                  <div className="w-full">
                    <p className="label-caps text-primary-indigo mb-2">Verifying QR Seal</p>
                    <p className="data-mono font-bold text-text-slate-900 text-sm mb-4">{selectedSample.id}</p>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-2 bg-primary-indigo rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${scanProgress}%` }}
                        transition={{ ease: 'linear', duration: 0.1 }}
                      />
                    </div>
                    <p className="text-xs text-text-slate-400 mt-3 font-medium">Authenticating seal integrity...</p>
                  </div>
                </>
              )}
              {scanStatus === 'verified' && (
                <>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, stiffness: 200 }}>
                    <ShieldCheck size={72} className="text-success-emerald" />
                  </motion.div>
                  <div>
                    <p className="label-caps text-success-emerald mb-2">Seal Authenticated</p>
                    <p className="text-sm text-text-slate-500 font-medium">Chain of custody confirmed. Proceeding to next phase.</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl px-4 py-3 w-full text-left">
                    <p className="data-mono font-bold text-text-slate-900 text-sm">{selectedSample.id}</p>
                    <p className="data-mono text-xs text-text-slate-400 truncate mt-0.5">{selectedSample.sealId}</p>
                  </div>
                  <button
                    onClick={advanceStep}
                    className="w-full py-3 bg-primary-indigo text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-100 hover:brightness-110 transition-all"
                  >
                    Advance to Next Phase
                  </button>
                </>
              )}
              {scanStatus === 'compromised' && (
                <>
                  <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: [0, -10, 10, -10, 10, -6, 6, 0] }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <AlertTriangle size={72} className="text-red-500" />
                  </motion.div>
                  <div>
                    <p className="label-caps text-red-500 mb-2">Seal Breach Detected</p>
                    <p className="text-sm text-text-slate-500 font-medium">Security violation logged. Supervisor notification sent.</p>
                  </div>
                  <div className="bg-red-50 rounded-xl px-4 py-3 w-full text-left">
                    <p className="data-mono font-bold text-text-slate-900 text-sm">{selectedSample.id}</p>
                    <p className="text-xs text-red-400 font-bold mt-0.5 uppercase tracking-widest">BREACH RECORDED — {new Date().toLocaleTimeString()}</p>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => { setShowSealScanner(false); setScanStatus('idle'); }}
                      className="flex-1 py-3 bg-warning-amber text-white font-bold text-xs rounded-xl shadow-lg hover:brightness-110 transition-all uppercase tracking-widest"
                    >
                      Raise NCR
                    </button>
                    <button
                      onClick={() => { setShowSealScanner(false); setScanStatus('idle'); }}
                      className="flex-1 py-3 border border-border-slate text-text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest"
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
    </div>
  );
}
