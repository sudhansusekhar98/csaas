import { useState } from 'react';
import {
  ChevronRight, ShieldCheck, ArrowLeft, Plus, Clock,
  User, QrCode, CheckCircle2, X, SquareSplitVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProcessBreadcrumb from './layout/ProcessBreadcrumb';
import type { ViewType } from '../types';

// ── Types ────────────────────────────────────────────────────────────────────

type SessionStatus = 'AWAITING_SPLIT' | 'IN_PROGRESS' | 'COMPLETED';
type BagType = 'A' | 'B' | 'R' | 'D' | 'E';

interface PulvRecord { marked: boolean; openedAt: string; operator: string; cctvClipId: string }
interface BagRecord  { weight: string; sealed: boolean; sealId: string; assignedOperator: string }

const BAG_TYPE_SEQUENCE: BagType[]  = ['A', 'B', 'R', 'D', 'E'];
const BAG_LABEL_SEQUENCE: string[]  = ['Sample A', 'Sample B', 'Referee', 'Sample D', 'Sample E'];

function bagSealId(parentId: string, type: BagType): string {
  return `BAG-${type}-${parentId.replace('PRNT-', '')}`;
}

function emptyBaggingRecord(): Record<BagType, BagRecord> {
  return Object.fromEntries(
    BAG_TYPE_SEQUENCE.map((t) => [t, { weight: '', sealed: false, sealId: '', assignedOperator: '' }])
  ) as Record<BagType, BagRecord>;
}

interface Session {
  id: string;
  parentId: string;
  sealId: string;
  weight: string;
  operator: string;
  collectedAt: string;
  colliery: string;
  status: SessionStatus;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_SESSIONS: Session[] = [
  {
    id: 'DIV-8822-X', parentId: 'PRNT-8822-X', sealId: 'QRL-SEC-8822-HY77-1',
    weight: '15.20 kg', operator: 'OPR-774 (J. Doe)', collectedAt: '14:20 UTC',
    colliery: 'Alpha-1 Mining Complex', status: 'IN_PROGRESS',
  },
  {
    id: 'DIV-8820-A', parentId: 'PRNT-8820-A', sealId: 'QRL-SEC-8820-KL42-2',
    weight: '14.80 kg', operator: 'OPR-312 (R. Kumar)', collectedAt: '13:05 UTC',
    colliery: 'Beta Sector Colliery', status: 'AWAITING_SPLIT',
  },
  {
    id: 'DIV-8818-B', parentId: 'PRNT-8818-B', sealId: 'QRL-SEC-8818-MN91-3',
    weight: '15.60 kg', operator: 'OPR-774 (J. Doe)', collectedAt: '11:30 UTC',
    colliery: 'Alpha-1 Mining Complex', status: 'COMPLETED',
  },
];

const AVAILABLE_SAMPLES = [
  { id: 'PRNT-8824-Z', sealId: 'QRL-SEC-8824-PL91-3', weight: '15.10 kg', colliery: 'Alpha-1 Mining Complex' },
  { id: 'PRNT-8823-Y', sealId: 'QRL-SEC-8823-KM44-2', weight: '14.60 kg', colliery: 'Beta Sector Colliery' },
];

const OPERATORS = ['OPR-774 (J. Doe)', 'OPR-312 (R. Kumar)', 'OPR-881 (M. Patel)', 'OPR-445 (A. Singh)'];

const STATUS_STYLES: Record<SessionStatus, string> = {
  IN_PROGRESS:    'bg-primary-indigo text-white',
  AWAITING_SPLIT: 'bg-warning-amber/10 text-warning-amber',
  COMPLETED:      'bg-success-emerald/10 text-success-emerald',
};

// ── Component ─────────────────────────────────────────────────────────────────

interface SplittingStationViewProps {
  onNavigate: (view: ViewType) => void;
}

export default function SplittingStationView({ onNavigate }: SplittingStationViewProps) {
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // New session modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSampleId, setNewSampleId] = useState('');
  const [newOperator, setNewOperator] = useState('');

  // Child count chosen in seal-verified overlay
  const [pendingChildCount, setPendingChildCount] = useState<number>(3);

  // Seal scan overlay
  const [sealScanPhase, setSealScanPhase] = useState<'idle' | 'scanning' | 'verified'>('idle');
  const [sealScanProgress, setSealScanProgress] = useState(0);

  // Pulverisation records per session
  const [pulvData, setPulvData] = useState<Record<string, PulvRecord>>({
    'DIV-8822-X': { marked: false, openedAt: '', operator: '', cctvClipId: '' },
    'DIV-8820-A': { marked: false, openedAt: '', operator: '', cctvClipId: '' },
    'DIV-8818-B': { marked: true,  openedAt: '11:45 UTC', operator: 'OPR-774 (J. Doe)', cctvClipId: 'CAM-04-1145-001' },
  });

  const [baggingData, setBaggingData] = useState<Record<string, Record<BagType, BagRecord>>>({
    'DIV-8822-X': emptyBaggingRecord(),
    'DIV-8820-A': emptyBaggingRecord(),
    'DIV-8818-B': {
      A: { weight: '2.10', sealed: true,  sealId: 'BAG-A-8818-B', assignedOperator: 'OPR-774 (J. Doe)'   },
      B: { weight: '5.20', sealed: true,  sealId: 'BAG-B-8818-B', assignedOperator: 'OPR-312 (R. Kumar)' },
      R: { weight: '7.90', sealed: true,  sealId: 'BAG-R-8818-B', assignedOperator: 'OPR-881 (M. Patel)' },
      D: { weight: '',     sealed: false, sealId: '', assignedOperator: '' },
      E: { weight: '',     sealed: false, sealId: '', assignedOperator: '' },
    },
  });

  // Per-session child bag count — set in seal-verified overlay, not at session creation
  const [childCount, setChildCount] = useState<Record<string, number>>({
    'DIV-8822-X': 3,
    'DIV-8818-B': 3,
    // DIV-8820-A: no count until seal is scanned
  });

  const [pulvOperator, setPulvOperator] = useState('');
  const [pulvCctv, setPulvCctv] = useState('');

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) ?? null;

  // ── Derived state ────────────────────────────────────────────────────────

  const activeStatus = selectedSession?.status ?? null;

  // Active bag types from the session's confirmed child count
  const activeBagTypes: BagType[] = selectedSessionId
    ? BAG_TYPE_SEQUENCE.slice(0, childCount[selectedSessionId] ?? 3)
    : [];

  const usedParentIds  = sessions.map((s) => s.parentId);
  const eligibleSamples = AVAILABLE_SAMPLES.filter((s) => !usedParentIds.includes(s.id));

  const inProgressCount = sessions.filter((s) => s.status === 'IN_PROGRESS').length;
  const completedCount  = sessions.filter((s) => s.status === 'COMPLETED').length;
  const awaitingCount   = sessions.filter((s) => s.status === 'AWAITING_SPLIT').length;

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleFinalise = () => {
    setSessions((prev) =>
      prev.map((s) => (s.id === selectedSessionId ? { ...s, status: 'COMPLETED' } : s))
    );
  };

  const handleScanSeal = () => {
    setSealScanPhase('scanning');
    setSealScanProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18;
      if (p >= 100) {
        setSealScanProgress(100);
        setSealScanPhase('verified');
        clearInterval(iv);
      } else {
        setSealScanProgress(Math.min(p, 99));
      }
    }, 150);
  };

  const handleSealConfirmed = (count: number) => {
    if (!selectedSessionId) return;
    setChildCount((prev) => ({ ...prev, [selectedSessionId]: count }));
    setSessions((prev) =>
      prev.map((s) => (s.id === selectedSessionId ? { ...s, status: 'IN_PROGRESS' } : s))
    );
    setSealScanPhase('idle');
    setSealScanProgress(0);
    setPendingChildCount(3);
  };

  const handleMarkPulverised = () => {
    if (!selectedSessionId) return;
    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' UTC';
    setPulvData((prev) => ({
      ...prev,
      [selectedSessionId]: {
        marked: true,
        openedAt: now,
        operator: pulvOperator || OPERATORS[0],
        cctvClipId: pulvCctv || `CAM-04-${now.replace(':', '').replace(' UTC', '')}-001`,
      },
    }));
    setBaggingData((prev) => ({
      ...prev,
      [selectedSessionId]: prev[selectedSessionId] ?? emptyBaggingRecord(),
    }));
  };

  const handleSealAllBags = () => {
    if (!selectedSessionId || !selectedSession) return;
    setBaggingData((prev) => {
      const updated = { ...prev[selectedSessionId] };
      activeBagTypes.forEach((t) => {
        updated[t] = { ...updated[t], sealed: true, sealId: bagSealId(selectedSession.parentId, t) };
      });
      return { ...prev, [selectedSessionId]: updated };
    });
  };

  const handleBagWeightChange = (type: BagType, weight: string) => {
    if (!selectedSessionId) return;
    setBaggingData((prev) => ({
      ...prev,
      [selectedSessionId]: {
        ...prev[selectedSessionId],
        [type]: { ...prev[selectedSessionId][type], weight },
      },
    }));
  };

  const handleBagOperatorChange = (type: BagType, operator: string) => {
    if (!selectedSessionId) return;
    setBaggingData((prev) => ({
      ...prev,
      [selectedSessionId]: {
        ...prev[selectedSessionId],
        [type]: { ...prev[selectedSessionId][type], assignedOperator: operator },
      },
    }));
  };

  const handleChildCountChange = (sessionId: string, count: number) => {
    if (isNaN(count) || count < 1) return;
    const clamped = Math.min(5, count);
    setChildCount((prev) => ({ ...prev, [sessionId]: clamped }));
  };

  const handleCreateSession = () => {
    const sample = AVAILABLE_SAMPLES.find((s) => s.id === newSampleId);
    if (!sample) return;
    const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' UTC';
    const newSession: Session = {
      id: `DIV-${sample.id.replace('PRNT-', '')}`,
      parentId: sample.id,
      sealId: sample.sealId,
      weight: sample.weight,
      operator: newOperator || OPERATORS[0],
      collectedAt: now,
      colliery: sample.colliery,
      status: 'AWAITING_SPLIT',
    };
    setSessions((prev) => [...prev, newSession]);
    setBaggingData((prev) => ({ ...prev, [newSession.id]: emptyBaggingRecord() }));
    setSelectedSessionId(newSession.id);
    setShowNewModal(false);
    setNewSampleId('');
    setNewOperator('');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProcessBreadcrumb currentStep={4} onNavigate={onNavigate} />

      {/* ══════════════════════════════════════════════════════════════════
          SESSION LIST VIEW
      ══════════════════════════════════════════════════════════════════ */}
      {!selectedSession ? (
        <>
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl font-bold text-text-slate-900 tracking-tight">Sample Division Station</h1>
              <p className="text-text-slate-500 mt-1 font-medium">Pulverisation and child sample bagging sessions.</p>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-6 py-2.5 bg-primary-indigo text-white font-bold rounded-xl flex items-center gap-2"
            >
              <Plus size={16} /> Start New Session
            </button>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Active Sessions', val: inProgressCount, color: 'text-primary-indigo',  bg: 'bg-indigo-50' },
              { label: 'Completed Today', val: completedCount,  color: 'text-success-emerald', bg: 'bg-emerald-50' },
              { label: 'Awaiting Seal',   val: awaitingCount,   color: 'text-warning-amber',   bg: 'bg-amber-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Clock size={20} />
                </div>
                <p className="text-[10px] font-bold text-text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.val}</div>
              </div>
            ))}
          </div>

          {/* Sessions table */}
          <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Division Sessions</h3>
              <span className="bg-indigo-50 px-2 py-1 rounded text-[10px] font-bold text-primary-indigo">{sessions.length} SESSIONS</span>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
                <tr>
                  <th className="px-6 py-4">Session ID</th>
                  <th className="px-6 py-4">Parent Sample</th>
                  <th className="px-6 py-4">Colliery</th>
                  <th className="px-6 py-4">Weight</th>
                  <th className="px-6 py-4">Operator</th>
                  <th className="px-6 py-4">Splits</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 data-mono font-bold text-sm text-text-slate-900">{session.id}</td>
                    <td className="px-6 py-4 data-mono text-sm text-primary-indigo font-semibold">{session.parentId}</td>
                    <td className="px-6 py-4 text-xs text-text-slate-500 font-medium">{session.colliery}</td>
                    <td className="px-6 py-4 text-sm font-bold text-text-slate-700">{session.weight}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-text-slate-600">
                        <User size={14} className="text-text-slate-400" /> {session.operator}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {childCount[session.id] != null ? (
                        <span className="text-xs font-bold text-text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                          {childCount[session.id]} bags
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-dashed border-border-slate">
                          — pending scan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest ${STATUS_STYLES[session.status]}`}>
                        {session.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedSessionId(session.id)}
                        className="flex items-center gap-1 ml-auto text-[10px] font-bold text-primary-indigo hover:underline uppercase tracking-widest"
                      >
                        {session.status === 'COMPLETED' ? 'View Summary' : 'Open Session'} <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (

      /* ══════════════════════════════════════════════════════════════════
          SESSION DETAIL VIEW
      ══════════════════════════════════════════════════════════════════ */
        <>
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <button
                onClick={() => setSelectedSessionId(null)}
                className="flex items-center gap-2 text-text-slate-500 hover:text-primary-indigo transition-colors text-sm font-bold mb-3"
              >
                <ArrowLeft size={16} /> All Sessions
              </button>
              <div className="flex items-center gap-2 text-text-slate-400 mb-2 text-xs font-bold uppercase tracking-widest">
                <span>Division</span>
                <ChevronRight size={12} />
                <span className="text-primary-indigo">{selectedSession.id}</span>
                <ChevronRight size={12} />
                <span className="text-primary-indigo">{selectedSession.parentId}</span>
              </div>
              <h1 className="text-4xl font-bold text-text-slate-900 tracking-tight">Sample Division Station</h1>
            </div>
            <div className="text-right">
              <p className="label-caps mb-1">Parent Aggregate</p>
              <p className="data-mono text-2xl font-bold text-text-slate-900">{selectedSession.weight}</p>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${STATUS_STYLES[selectedSession.status]}`}>
                {selectedSession.status.replace(/_/g, ' ')}
              </span>
            </div>
          </header>

          {/* ── Two-column grid: items-start prevents equal-height stretching ── */}
          <div className="grid grid-cols-12 gap-8 items-start">

            {/* LEFT col-7: Seal Integrity + Pulverisation Log stacked */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-xl text-text-slate-900 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 text-primary-indigo text-xs font-bold flex items-center justify-center">01</span>
                    Parent Seal Integrity
                  </h2>
                  {activeStatus !== 'AWAITING_SPLIT' && (
                    <span className="text-[10px] font-bold text-success-emerald bg-success-emerald/10 px-3 py-1 rounded-full border border-success-emerald/20 uppercase tracking-widest">VMS Link Active</span>
                  )}
                  {activeStatus === 'AWAITING_SPLIT' && (
                    <span className="text-[10px] font-bold text-warning-amber bg-warning-amber/10 px-3 py-1 rounded-full border border-warning-amber/20 uppercase tracking-widest">Awaiting Verification</span>
                  )}
                </div>

                {activeStatus === 'AWAITING_SPLIT' && (
                  <div className="bg-slate-950 rounded-2xl flex flex-col items-center justify-center text-center py-12 px-8 border-2 border-dashed border-slate-700">
                    <div className="w-16 h-16 rounded-2xl bg-warning-amber/10 border border-warning-amber/30 flex items-center justify-center mb-5">
                      <QrCode size={32} className="text-warning-amber" />
                    </div>
                    <p className="text-warning-amber font-bold text-sm uppercase tracking-widest mb-2">Seal Verification Required</p>
                    <p className="text-slate-400 text-xs font-medium mb-6 max-w-xs">
                      Scan the parent bag QR seal to verify chain of custody and set the number of child sample splits.
                    </p>
                    <div className="bg-slate-900 rounded-xl px-4 py-2 mb-6 text-left w-full max-w-xs">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Parent Sample</p>
                      <p className="data-mono text-white font-bold text-sm">{selectedSession.parentId}</p>
                      <p className="data-mono text-slate-400 text-[10px] truncate mt-0.5">{selectedSession.sealId}</p>
                    </div>
                    <button
                      onClick={handleScanSeal}
                      className="px-6 py-2.5 bg-warning-amber text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shadow-lg"
                    >
                      <QrCode size={16} /> Scan Seal Now
                    </button>
                  </div>
                )}

                {(activeStatus === 'IN_PROGRESS' || activeStatus === 'COMPLETED') && (
                  <>
                    <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGvsXgqD9o7CA1bxKfbsmEvKkbrdbkKrnP0DFUWtwHgoEIGF11yuJ5xc7aqOlZJcDQLeZokZZMn3m91FbBZk-kngnqygrCI-ZPEqsmoH079AkUYCAYtFmkVEZRZ8Adh0umhSeeW3FQ4iu2wjhKlMx6-LLVwOL5lrzDGRq9-lZxuA_CNeyNFbdgi8Q_p1KUqGS32RgplYuBqeA46z21oaqtJvwJ0uH1qpmI1YN9OM0UUzdKpy-aequJUCnfXKc1NzZ8OcAUGC3eUNBY"
                        className="w-full h-full object-cover opacity-70 mix-blend-soft-light scale-105"
                        alt="CCTV Feed"
                      />
                      <div className="absolute inset-0 border-2 border-primary-indigo/60 m-[15%] rounded shadow-[0_0_20px_rgba(79,70,229,0.3)] pointer-events-none">
                        <div className="absolute -top-6 left-0 bg-primary-indigo text-white text-[10px] px-3 py-1 font-bold uppercase tracking-widest rounded-t shadow-lg">
                          ID_MATCH: 98.4%
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        <div className="px-3 py-1.5 bg-black/60 text-white text-[10px] rounded-lg font-bold backdrop-blur-md border border-white/10 uppercase tracking-widest">
                          CAM-04 Alpha | 14:32:05 UTC
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 mt-6">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-border-slate cursor-default">
                        <p className="label-caps mb-1">OCR Result — Parent Sample</p>
                        <p className="data-mono font-bold text-lg text-text-slate-900">{selectedSession.parentId}</p>
                        <p className="data-mono text-[10px] text-text-slate-400 mt-0.5 truncate">{selectedSession.sealId}</p>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-border-slate cursor-default">
                        <p className="label-caps mb-1">Seal Verification</p>
                        <p className="text-sm font-bold text-success-emerald flex items-center gap-1.5 uppercase tracking-wide">
                          <ShieldCheck size={16} /> Intact
                        </p>
                        <p className="text-[10px] text-text-slate-400 mt-1 uppercase tracking-widest">{selectedSession.colliery}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ── Pulverisation Log (inside left column) ──────────────── */}
              {(activeStatus === 'IN_PROGRESS' || activeStatus === 'COMPLETED') && selectedSessionId && (() => {
                const pulv  = pulvData[selectedSessionId] ?? { marked: false, openedAt: '', operator: '', cctvClipId: '' };
                const count = childCount[selectedSessionId] ?? 3;
                const baseCctv = pulv.cctvClipId.replace(/-(\d{})$/, '');
                const puUnits = Array.from({ length: count }, (_, i) => ({
                  workstation: `PU-0${1 + i} (Pulveriser Unit ${1 + i})`,
                  openedAt:    pulv.openedAt,
                  operator:    pulv.operator,
                  cctvClipId:  `${baseCctv}-${String(i + 1).padStart(3, '0')}`,
                }));
                return (
                  <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="font-bold text-xl text-text-slate-900 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 text-xs font-bold flex items-center justify-center">02</span>
                        Pulverisation Log
                      </h2>
                      {pulv.marked && (
                        <span className="text-[10px] font-bold text-success-emerald bg-success-emerald/10 px-3 py-1 rounded-full border border-success-emerald/20 uppercase tracking-widest">
                          Parent Bag Opened
                        </span>
                      )}
                    </div>

                    {pulv.marked ? (
                      <>
                        {/* Shared metadata */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {[
                            { label: 'Opening Time', val: pulv.openedAt },
                            { label: 'Operator',     val: pulv.operator  },
                          ].map((row) => (
                            <div key={row.label} className="bg-slate-50 p-4 rounded-xl border border-border-slate">
                              <p className="label-caps text-[9px] mb-1">{row.label}</p>
                              <p className="data-mono text-xs font-bold text-text-slate-900">{row.val}</p>
                            </div>
                          ))}
                        </div>
                        {/* N dynamic pulveriser unit rows */}
                        <div className="space-y-2">
                          {puUnits.map((unit, i) => (
                            <div key={i} className="grid grid-cols-2 gap-4">
                              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                <p className="label-caps text-[9px] mb-1">Workstation</p>
                                <p className="data-mono text-xs font-bold text-orange-700">{unit.workstation}</p>
                              </div>
                              <div className="bg-slate-50 p-4 rounded-xl border border-border-slate">
                                <p className="label-caps text-[9px] mb-1">CCTV Clip ID</p>
                                <p className="data-mono text-xs font-bold text-text-slate-900">{unit.cctvClipId}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        {/* Planned units info */}
                        <div className="bg-orange-50/50 border border-orange-100 rounded-xl px-4 py-3 text-xs text-orange-700 font-medium">
                          <span className="font-bold">Planned: </span>
                          PU-01 to PU-0{0 + count} · {count} unit{count !== 1 ? 's' : ''} based on {count} child split{count !== 1 ? 's' : ''}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="label-caps">Operator <span className="text-red-500">*</span></label>
                            <select value={pulvOperator} onChange={(e) => setPulvOperator(e.target.value)}
                              className="w-full bg-slate-50 border border-border-slate rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none">
                              <option value="">Select operator...</option>
                              {OPERATORS.map((op) => <option key={op}>{op}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="label-caps">Base CCTV Clip ID</label>
                            <input value={pulvCctv} onChange={(e) => setPulvCctv(e.target.value)}
                              placeholder="auto-generated on mark"
                              className="w-full bg-slate-50 border border-border-slate rounded-xl p-2.5 text-xs data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none placeholder:text-slate-300" />
                          </div>
                        </div>
                        <div>
                          <button onClick={handleMarkPulverised}
                            className="px-6 py-2.5 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center gap-2">
                            Mark Parent QR as Opened — Pulverisation In Progress
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* RIGHT col-5: Small Bagging — Child QR Seal Generation */}
            <div className="col-span-12 lg:col-span-5">
              <SmallBaggingPanel
                sessionId={selectedSession.id}
                parentId={selectedSession.parentId}
                activeStatus={activeStatus}
                pulvMarked={pulvData[selectedSession.id]?.marked ?? false}
                bags={baggingData[selectedSession.id] ?? emptyBaggingRecord()}
                activeBagTypes={activeBagTypes}
                childCountValue={childCount[selectedSession.id] ?? 3}
                onChildCountChange={(v) => handleChildCountChange(selectedSession.id, v)}
                onWeightChange={handleBagWeightChange}
                onOperatorChange={handleBagOperatorChange}
                onSealAll={handleSealAllBags}
                onFinalise={handleFinalise}
                onNavigate={onNavigate}
                operators={OPERATORS}
              />
            </div>
          </div>

        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          NEW SESSION MODAL
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNewModal(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-border-slate"
            >
              <div className="p-6 border-b border-border-slate bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-indigo/10 flex items-center justify-center text-primary-indigo">
                    <SquareSplitVertical size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-slate-900">Start Division Session</h2>
                    <p className="text-xs text-text-slate-500">Select a pulverised parent sample to divide</p>
                  </div>
                </div>
                <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-slate-200 rounded-lg text-text-slate-400 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="label-caps">Available Parent Samples <span className="text-red-500">*</span></label>
                  {eligibleSamples.length === 0 ? (
                    <p className="text-xs text-text-slate-400 bg-slate-50 border border-border-slate rounded-xl p-4 text-center">
                      No samples are currently eligible for division.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {eligibleSamples.map((sample) => (
                        <button
                          key={sample.id}
                          onClick={() => setNewSampleId(sample.id)}
                          className={`w-full p-4 rounded-xl border text-left transition-all ${
                            newSampleId === sample.id
                              ? 'border-primary-indigo bg-primary-indigo/5'
                              : 'border-border-slate hover:border-primary-indigo hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="data-mono font-bold text-sm text-text-slate-900">{sample.id}</span>
                            <span className="text-[10px] font-bold text-success-emerald bg-success-emerald/10 px-2 py-0.5 rounded uppercase tracking-widest">Ready</span>
                          </div>
                          <div className="flex gap-4 text-[10px] text-text-slate-400 font-medium">
                            <span>{sample.colliery}</span><span>·</span>
                            <span>{sample.weight}</span><span>·</span>
                            <span className="truncate">{sample.sealId}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="label-caps">Operator</label>
                  <select
                    value={newOperator}
                    onChange={(e) => setNewOperator(e.target.value)}
                    className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none"
                  >
                    <option value="">Select operator...</option>
                    {OPERATORS.map((op) => <option key={op}>{op}</option>)}
                  </select>
                </div>

                <div className="bg-indigo-50 border border-primary-indigo/20 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-primary-indigo uppercase tracking-widest mb-1">Division Protocol</p>
                  <p className="text-xs text-text-slate-600 font-medium">
                    Child sample split count is set after QR seal authentication. Seal scan required before bagging begins.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-border-slate bg-slate-50/50 flex gap-3">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 py-3 border border-border-slate rounded-xl text-xs font-bold uppercase tracking-widest text-text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSession}
                  disabled={!newSampleId}
                  className="flex-1 py-3 bg-primary-indigo text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Begin Division Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          SEAL SCAN OVERLAY
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {sealScanPhase !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-96 rounded-3xl p-10 shadow-2xl border-t-4 flex flex-col items-center text-center gap-6 bg-white ${
                sealScanPhase === 'verified' ? 'border-success-emerald' : 'border-warning-amber'
              }`}
            >
              {sealScanPhase === 'scanning' && (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                    <QrCode size={64} className="text-warning-amber" />
                  </motion.div>
                  <div className="w-full">
                    <p className="label-caps text-warning-amber mb-2">Verifying QR Seal</p>
                    <p className="data-mono font-bold text-text-slate-900 text-sm mb-4">{selectedSession?.parentId}</p>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-2 bg-warning-amber rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${sealScanProgress}%` }}
                        transition={{ ease: 'linear', duration: 0.1 }}
                      />
                    </div>
                    <p className="text-xs text-text-slate-400 mt-3 font-medium">Authenticating seal integrity...</p>
                  </div>
                </>
              )}

              {sealScanPhase === 'verified' && (
                <>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10, stiffness: 200 }}>
                    <ShieldCheck size={72} className="text-success-emerald" />
                  </motion.div>
                  <div>
                    <p className="label-caps text-success-emerald mb-2">Seal Authenticated</p>
                    <p className="text-sm text-text-slate-500 font-medium">Seal intact. Set the number of child sample splits.</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl px-4 py-3 w-full text-left">
                    <p className="data-mono font-bold text-text-slate-900 text-sm">{selectedSession?.parentId}</p>
                    <p className="data-mono text-xs text-text-slate-400 truncate mt-0.5">{selectedSession?.sealId}</p>
                  </div>

                  <div className="w-full space-y-2">
                    <p className="label-caps text-center">Number of Child Sample Splits</p>
                    <div className="flex justify-center">
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={pendingChildCount}
                        autoFocus
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          if (!isNaN(v) && v >= 1 && v <= 5) setPendingChildCount(v);
                        }}
                        className="w-24 text-center bg-white border-2 border-success-emerald rounded-xl p-3 text-2xl font-bold data-mono focus:ring-2 focus:ring-success-emerald outline-none shadow-sm"
                      />
                    </div>
                    <p className="text-[10px] text-center text-text-slate-400 font-medium">
                      {BAG_LABEL_SEQUENCE.slice(0, pendingChildCount).join(', ')}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSealConfirmed(pendingChildCount)}
                    className="w-full py-3 bg-success-emerald text-white font-bold text-sm rounded-xl shadow-lg hover:brightness-110 transition-all"
                  >
                    Begin Bagging ({pendingChildCount} bags)
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SmallBaggingPanel (extracted sub-component) ───────────────────────────────

interface SmallBaggingPanelProps {
  sessionId: string;
  parentId: string;
  activeStatus: 'AWAITING_SPLIT' | 'IN_PROGRESS' | 'COMPLETED' | null;
  pulvMarked: boolean;
  bags: Record<BagType, BagRecord>;
  activeBagTypes: BagType[];
  childCountValue: number;
  onChildCountChange: (v: number) => void;
  onWeightChange: (type: BagType, weight: string) => void;
  onOperatorChange: (type: BagType, operator: string) => void;
  onSealAll: () => void;
  onFinalise: () => void;
  onNavigate: (view: ViewType) => void;
  operators: string[];
}

function SmallBaggingPanel({
  activeStatus, pulvMarked, bags, activeBagTypes, childCountValue,
  onChildCountChange, onWeightChange, onOperatorChange, onSealAll, onFinalise, onNavigate, operators,
}: SmallBaggingPanelProps) {
  const allSealed  = activeBagTypes.length > 0 && activeBagTypes.every((t) => bags[t].sealed);
  const canSealAll = activeBagTypes.every((t) => bags[t].weight && bags[t].assignedOperator);

  return (
    <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm flex flex-col h-full bg-gradient-to-b from-white to-slate-50/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-xl text-text-slate-900 flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 text-xs font-bold flex items-center justify-center">02</span>
          Small Bagging
        </h2>
        {allSealed && activeStatus !== 'COMPLETED' && (
          <span className="text-[10px] font-bold text-success-emerald bg-success-emerald/10 px-3 py-1 rounded-full border border-success-emerald/20 uppercase tracking-widest">All Bags Sealed</span>
        )}
        {activeStatus === 'COMPLETED' && (
          <span className="text-[10px] font-bold text-success-emerald bg-success-emerald/10 px-3 py-1 rounded-full border border-success-emerald/20 uppercase tracking-widest">Session Completed</span>
        )}
      </div>

      {/* AWAITING_SPLIT: locked placeholder */}
      {activeStatus === 'AWAITING_SPLIT' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-50">
          <QrCode size={40} className="text-text-slate-300 mb-4" />
          <p className="text-xs font-bold text-text-slate-400 uppercase tracking-widest">Seal verification required</p>
          <p className="text-[10px] text-text-slate-400 mt-1">Complete QR scan to begin bagging</p>
        </div>
      )}

      {/* IN_PROGRESS, pulv not marked: waiting placeholder */}
      {activeStatus === 'IN_PROGRESS' && !pulvMarked && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-60">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
            <span className="text-orange-600 font-bold text-lg">⚙</span>
          </div>
          <p className="text-xs font-bold text-text-slate-400 uppercase tracking-widest">Awaiting Pulverisation</p>
          <p className="text-[10px] text-text-slate-400 mt-1">Mark pulverisation below to begin bagging</p>
        </div>
      )}

      {/* IN_PROGRESS, pulv marked: active bagging UI */}
      {activeStatus === 'IN_PROGRESS' && pulvMarked && (
        <>
          {/* Child count input — adjustable until all sealed */}
          {!allSealed && (
            <div className="mb-4 flex items-center gap-4 bg-slate-50 border border-border-slate rounded-xl px-5 py-3">
              <div className="flex-1">
                <p className="label-caps mb-0.5">Number of Child Bags</p>
                <p className="text-[10px] text-text-slate-400 font-medium">Labels: {BAG_LABEL_SEQUENCE.slice(0, childCountValue).join(', ')}</p>
              </div>
              <input
                type="number"
                min={1}
                max={5}
                value={childCountValue}
                placeholder="1–5"
                onChange={(e) => onChildCountChange(parseInt(e.target.value, 10))}
                className="w-16 text-center bg-white border border-border-slate rounded-xl p-2 text-base font-bold data-mono focus:ring-2 focus:ring-primary-indigo outline-none"
              />
            </div>
          )}

          {/* Bag cards */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            {activeBagTypes.map((type, idx) => {
              const bag = bags[type];
              const bagLabel = BAG_LABEL_SEQUENCE[idx];
              return (
                <div key={type} className={`border rounded-2xl p-4 ${bag.sealed ? 'border-success-emerald/30 bg-emerald-50/30' : 'border-border-slate bg-white'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="label-caps text-[9px] mb-0.5">Bag</p>
                      <p className="font-bold text-text-slate-900 text-sm">{bagLabel}</p>
                    </div>
                    {bag.sealed && <CheckCircle2 size={18} className="text-success-emerald" />}
                  </div>
                  {bag.sealed ? (
                    <div className="space-y-1">
                      <p className="data-mono text-xs font-bold text-success-emerald">{bag.sealId}</p>
                      <p className="text-[10px] text-text-slate-400">{bag.weight} kg · QR Sealed</p>
                      {bag.assignedOperator && (
                        <p className="text-[10px] font-bold text-text-slate-500 flex items-center gap-1 pt-1 border-t border-emerald-100">
                          <User size={11} className="text-text-slate-400" /> {bag.assignedOperator}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <label className="label-caps text-[9px]">Weight (kg)</label>
                        <input
                          type="number" step="0.01" placeholder="0.00"
                          value={bag.weight}
                          onChange={(e) => onWeightChange(type, e.target.value)}
                          className="w-full mt-1 bg-slate-50 border border-border-slate rounded-xl p-2 text-xs data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none"
                        />
                      </div>
                      <div>
                        <label className="label-caps text-[9px]">Assigned Operator <span className="text-red-500">*</span></label>
                        <select
                          value={bag.assignedOperator}
                          onChange={(e) => onOperatorChange(type, e.target.value)}
                          className="w-full mt-1 bg-slate-50 border border-border-slate rounded-xl p-2 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none"
                        >
                          <option value="">Select operator...</option>
                          {operators.map((op) => <option key={op}>{op}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          {!allSealed && (
            <button
              onClick={onSealAll}
              disabled={!canSealAll}
              className="mt-4 w-full px-6 py-2.5 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <QrCode size={15} /> Seal All Child Bags
            </button>
          )}
          {allSealed && (
            <button
              onClick={onFinalise}
              className="mt-4 w-full py-4 font-bold text-sm rounded-xl uppercase tracking-widest bg-primary-indigo text-white shadow-lg shadow-indigo-100 hover:brightness-110 border-transparent transition-all"
            >
              Finalise Division Session
            </button>
          )}
        </>
      )}

      {/* COMPLETED */}
      {activeStatus === 'COMPLETED' && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="space-y-2 flex-1 overflow-y-auto">
            {activeBagTypes.map((type, idx) => {
              const bag = bags[type];
              const bagLabel = BAG_LABEL_SEQUENCE[idx];
              return (
                <div key={type} className="border border-success-emerald/30 bg-emerald-50/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-text-slate-900 text-sm">{bagLabel}</p>
                    <CheckCircle2 size={16} className="text-success-emerald" />
                  </div>
                  <p className="data-mono text-xs font-bold text-success-emerald">{bag.sealId}</p>
                  <p className="text-[10px] text-text-slate-400 mt-0.5">{bag.weight} kg · QR Sealed</p>
                  {bag.assignedOperator && (
                    <p className="text-[10px] font-bold text-text-slate-500 flex items-center gap-1 mt-1">
                      <User size={11} className="text-text-slate-400" /> {bag.assignedOperator}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="w-full py-3.5 bg-success-emerald text-white font-bold text-sm rounded-xl uppercase tracking-widest text-center flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> Session Completed
          </div>
          <button
            onClick={() => onNavigate('lab-receiving')}
            className="w-full py-3 border border-primary-indigo text-primary-indigo font-bold text-sm rounded-xl hover:bg-indigo-50 transition-all uppercase tracking-widest"
          >
            View Lab Dispatch →
          </button>
        </div>
      )}
    </div>
  );
}
