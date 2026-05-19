import { useState } from 'react';
import {
  QrCode, ShieldCheck, Fingerprint, X, AlertTriangle,
  TrainFront, Box, ArrowRight, CheckCircle2, Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProcessBreadcrumb from './layout/ProcessBreadcrumb';
import type { ViewType } from '../types';

interface PrepRoomViewProps {
  onNavigate: (view: ViewType) => void;
}

// Mock pending bags awaiting prep room receipt
const PENDING_BAGS = [
  { id: 'PRNT-8822-X', consignment: 'RCK-9901-A', colliery: 'Alpha-1 Mining Complex', source: 'Track Hopper TH-07', sealId: 'QRL-SEC-8822-HY77-1', weightKg: 15.2, arrivedAt: '14:18 UTC', status: 'pending' as const },
  { id: 'PRNT-8823-Y', consignment: 'RCK-9901-A', colliery: 'Alpha-1 Mining Complex', source: 'Wagon Tippler WT-03', sealId: 'QRL-SEC-8823-KM44-2', weightKg: 14.8, arrivedAt: '14:22 UTC', status: 'pending' as const },
  { id: 'PRNT-8824-Z', consignment: 'RCK-9902-B', colliery: 'Beta Sector Colliery',   source: 'Track Hopper TH-02', sealId: 'QRL-SEC-8824-PL91-3', weightKg: 15.6, arrivedAt: '14:35 UTC', status: 'pending' as const },
];

type ScanPhase = 'idle' | 'scanning' | 'verified' | 'failed';

const PREP_RECEIVERS = ['M. Patel (OPR-881)', 'K. Sharma (OPR-555)', 'L. Das (OPR-623)'];

export default function PrepRoomView({ onNavigate }: PrepRoomViewProps) {
  const [manualId, setManualId] = useState('');
  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedBag, setScannedBag] = useState<typeof PENDING_BAGS[0] | null>(null);
  const [receivedIds, setReceivedIds] = useState<Set<string>>(new Set());
  const [showBiometric, setShowBiometric] = useState(false);
  const [prepRecord, setPrepRecord] = useState({ receivingPerson: '', sealCondition: '', videoRef: '' });

  const triggerScan = (bagId?: string) => {
    const targetId = bagId ?? manualId.trim();
    const bag = PENDING_BAGS.find((b) => b.id === targetId || b.sealId === targetId);

    setScanPhase('scanning');
    setScanProgress(0);
    setScannedBag(bag ?? null);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        setScanProgress(100);
        setScanPhase(bag ? 'verified' : 'failed');
        clearInterval(interval);
      } else {
        setScanProgress(Math.min(progress, 99));
      }
    }, 150);
  };

  const canAccept = showBiometric && prepRecord.receivingPerson && prepRecord.sealCondition && prepRecord.videoRef;

  const acceptBag = () => {
    if (!canAccept) return;
    if (scannedBag) {
      setReceivedIds((prev) => new Set([...prev, scannedBag.id]));
    }
    setShowBiometric(false);
    setScanPhase('idle');
    setScanProgress(0);
    setScannedBag(null);
    setManualId('');
    setPrepRecord({ receivingPerson: '', sealCondition: '', videoRef: '' });
  };

  const resetScan = () => {
    setScanPhase('idle');
    setScanProgress(0);
    setScannedBag(null);
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProcessBreadcrumb currentStep={3} onNavigate={onNavigate} />

      {/* Sticky header */}
      <div className="sticky top-0 z-30 -mx-8 px-8 py-5 bg-white/95 backdrop-blur-sm border-b border-border-slate mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-[1440px] mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-text-slate-900 tracking-tight">Preparation Room</h1>
            <p className="text-text-slate-500 text-sm font-medium mt-0.5">Scan incoming raw coal bag QR to initiate the sample preparation process.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 border border-success-emerald/20 px-4 py-2 rounded-xl">
              <div className="w-2 h-2 bg-success-emerald rounded-full animate-pulse" />
              <span className="text-xs font-bold text-success-emerald uppercase tracking-widest">Prep Room Active</span>
            </div>
            <div className="bg-white border border-border-slate rounded-xl px-4 py-2 text-center">
              <p className="label-caps text-[9px] mb-0.5">Bags Received</p>
              <p className="text-lg font-bold text-text-slate-900">{receivedIds.size} <span className="text-xs text-text-slate-400 font-normal">/ {PENDING_BAGS.length}</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Awaiting Receipt',  val: PENDING_BAGS.length - receivedIds.size, color: 'text-warning-amber',     bg: 'bg-amber-50',   icon: Clock },
            { label: 'Received & Logged', val: receivedIds.size,                       color: 'text-success-emerald',  bg: 'bg-emerald-50', icon: CheckCircle2 },
            { label: 'Integrity Verified',val: receivedIds.size,                       color: 'text-primary-indigo',   bg: 'bg-indigo-50',  icon: ShieldCheck },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon size={20} />
              </div>
              <p className="text-[10px] font-bold text-text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.val}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scan panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-text-slate-900 text-sm uppercase tracking-widest mb-5">QR Bag Scanner</h3>

              {/* Manual entry */}
              <div className="space-y-3 mb-5">
                <label className="label-caps">Scan or Enter Bag / Seal ID</label>
                <div className="flex gap-2">
                  <input
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && manualId && triggerScan()}
                    placeholder="PRNT-XXXX-X or QRL-SEC-..."
                    className="flex-1 bg-slate-50 border border-border-slate rounded-xl px-3 py-2.5 data-mono text-xs text-text-slate-900 focus:ring-2 focus:ring-primary-indigo outline-none placeholder:text-slate-300"
                  />
                  <button
                    onClick={() => triggerScan()}
                    disabled={!manualId.trim() || scanPhase === 'scanning'}
                    className="bg-primary-indigo text-white p-2.5 rounded-xl hover:brightness-110 shadow-md shadow-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <QrCode size={20} />
                  </button>
                </div>
              </div>

              {/* Scan area */}
              <div
                className="border-2 border-dashed border-border-slate rounded-2xl h-36 flex flex-col items-center justify-center text-text-slate-400 cursor-pointer hover:border-primary-indigo hover:bg-indigo-50/30 transition-all group"
                onClick={() => triggerScan(PENDING_BAGS[0]?.id)}
              >
                <QrCode size={32} className="mb-2 group-hover:text-primary-indigo transition-colors" />
                <p className="text-xs font-bold text-text-slate-500 group-hover:text-primary-indigo transition-colors">Point scanner at bag QR code</p>
                <p className="text-[10px] text-text-slate-400 mt-1">or click to simulate scan</p>
              </div>
            </div>

            {/* Process info card */}
            <div className="bg-primary-indigo/5 border border-primary-indigo/20 rounded-2xl p-5">
              <h4 className="font-bold text-xs text-primary-indigo uppercase tracking-widest mb-3">Prep Room Protocol</h4>
              <ol className="space-y-2 text-xs text-text-slate-600">
                {[
                  'Scan incoming bag QR seal',
                  'Verify seal integrity & origin',
                  'Confirm Track Hopper / Wagon Tippler source',
                  'Capture operator biometric',
                  'Accept bag → initiate pulverisation queue',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary-indigo text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span className="font-medium">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Pending bags table */}
          <div className="lg:col-span-8 bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Pending Bag Queue</h3>
                <p className="text-[10px] text-text-slate-400 font-medium mt-0.5">Raw coal bags in transit from the yard to this prep room.</p>
              </div>
              <span className="bg-warning-amber/10 text-warning-amber text-[10px] font-bold px-2 py-1 rounded-full">
                {PENDING_BAGS.length - receivedIds.size} PENDING
              </span>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
                  <tr>
                    <th className="px-5 py-3">Bag ID</th>
                    <th className="px-5 py-3">Consignment</th>
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3">Weight</th>
                    <th className="px-5 py-3">Arrived</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PENDING_BAGS.map((bag) => {
                    const isReceived = receivedIds.has(bag.id);
                    return (
                      <tr key={bag.id} className={`transition-colors ${isReceived ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}`}>
                        <td className="px-5 py-4">
                          <p className="data-mono font-bold text-sm text-text-slate-900">{bag.id}</p>
                          <p className="data-mono text-[10px] text-text-slate-400 truncate max-w-[120px]">{bag.sealId}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <TrainFront size={14} className="text-text-slate-400 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-text-slate-900">{bag.consignment}</p>
                              <p className="text-[10px] text-text-slate-400 font-medium">{bag.colliery}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Box size={14} className="text-primary-indigo shrink-0" />
                            <span className="text-xs font-bold text-primary-indigo">{bag.source}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-text-slate-700">{bag.weightKg} <span className="text-[10px] text-text-slate-400 font-normal">kg</span></td>
                        <td className="px-5 py-4 text-xs data-mono text-text-slate-400">{bag.arrivedAt}</td>
                        <td className="px-5 py-4 text-right">
                          {isReceived ? (
                            <span className="flex items-center justify-end gap-1.5 text-success-emerald text-[10px] font-bold uppercase tracking-widest">
                              <CheckCircle2 size={14} /> Received
                            </span>
                          ) : (
                            <button
                              onClick={() => triggerScan(bag.id)}
                              className="flex items-center gap-1.5 ml-auto text-[10px] font-bold text-primary-indigo hover:underline uppercase tracking-widest"
                            >
                              Scan & Accept <ArrowRight size={12} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {receivedIds.size === PENDING_BAGS.length && PENDING_BAGS.length > 0 && (
              <div className="p-5 border-t border-border-slate bg-emerald-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-success-emerald" />
                  <span className="text-sm font-bold text-success-emerald">All bags received. Pulverisation queue ready.</span>
                </div>
                <button
                  onClick={() => onNavigate('division-station')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-indigo text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-100 hover:brightness-110 transition-all"
                >
                  Proceed to Division <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Scan result overlay ── */}
      <AnimatePresence>
        {scanPhase !== 'idle' && (
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
              className={`w-[420px] rounded-3xl p-8 shadow-2xl border-t-4 flex flex-col items-center text-center gap-5 bg-white ${
                scanPhase === 'verified' ? 'border-success-emerald' :
                scanPhase === 'failed'   ? 'border-red-500' :
                'border-primary-indigo'
              }`}
            >
              {/* Scanning */}
              {scanPhase === 'scanning' && (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                    <QrCode size={56} className="text-primary-indigo" />
                  </motion.div>
                  <div className="w-full">
                    <p className="label-caps text-primary-indigo mb-1">Scanning QR Seal</p>
                    <p className="text-xs text-text-slate-400 font-medium mb-4">Verifying bag origin and seal integrity...</p>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-2 bg-primary-indigo rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${scanProgress}%` }}
                        transition={{ ease: 'linear', duration: 0.1 }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Verified */}
              {scanPhase === 'verified' && scannedBag && (
                <>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10, stiffness: 200 }}>
                    <ShieldCheck size={64} className="text-success-emerald" />
                  </motion.div>
                  <div>
                    <p className="label-caps text-success-emerald mb-1">Bag Authenticated</p>
                    <p className="text-sm text-text-slate-500 font-medium">Seal intact. Origin verified.</p>
                  </div>

                  {/* Bag details */}
                  <div className="w-full bg-slate-50 rounded-2xl p-4 text-left space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-text-slate-400 uppercase tracking-widest">Bag ID</span>
                      <span className="data-mono font-bold text-text-slate-900">{scannedBag.id}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-text-slate-400 uppercase tracking-widest">Source</span>
                      <span className="font-bold text-primary-indigo flex items-center gap-1.5"><Box size={12} /> {scannedBag.source}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-text-slate-400 uppercase tracking-widest">Consignment</span>
                      <span className="data-mono font-bold text-text-slate-700">{scannedBag.consignment}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-text-slate-400 uppercase tracking-widest">Weight</span>
                      <span className="font-bold text-text-slate-900">{scannedBag.weightKg} kg</span>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                      <span className="font-bold text-text-slate-400 uppercase tracking-widest">QR Seal</span>
                      <span className="data-mono text-[10px] text-text-slate-500 truncate max-w-[160px]">{scannedBag.sealId}</span>
                    </div>
                  </div>

                  {/* Biometric prompt */}
                  {!showBiometric ? (
                    <button
                      onClick={() => setShowBiometric(true)}
                      className="w-full py-3 bg-slate-50 border border-border-slate text-text-slate-700 font-bold text-sm rounded-xl hover:bg-indigo-50 hover:border-primary-indigo transition-all flex items-center justify-center gap-2"
                    >
                      <Fingerprint size={18} className="text-primary-indigo" /> Capture Operator Biometric
                    </button>
                  ) : (
                    <div className="w-full bg-emerald-50 border border-success-emerald/30 rounded-xl p-3 flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-success-emerald shrink-0" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-success-emerald">Biometric Captured</p>
                        <p className="text-[10px] text-text-slate-500">OPR-774 (J. Doe) — AUTHORIZED</p>
                      </div>
                    </div>
                  )}

                  {/* Prep Room Record — required before Accept */}
                  <div className="w-full border border-border-slate rounded-2xl p-4 space-y-3 text-left bg-slate-50/50">
                    <p className="label-caps text-[10px] text-primary-indigo">Prep Room Record <span className="text-red-500">*</span></p>
                    <div className="space-y-1.5">
                      <label className="label-caps">Receiving Person</label>
                      <select
                        value={prepRecord.receivingPerson}
                        onChange={(e) => setPrepRecord((p) => ({ ...p, receivingPerson: e.target.value }))}
                        className="w-full bg-white border border-border-slate rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none"
                      >
                        <option value="">Select receiver...</option>
                        {PREP_RECEIVERS.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="label-caps">Seal Condition</label>
                      <div className="flex gap-3">
                        {(['intact', 'damaged', 'missing'] as const).map((cond) => (
                          <button
                            key={cond}
                            onClick={() => setPrepRecord((p) => ({ ...p, sealCondition: cond }))}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all capitalize ${
                              prepRecord.sealCondition === cond
                                ? cond === 'intact' ? 'bg-success-emerald text-white border-success-emerald'
                                  : 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-text-slate-500 border-border-slate hover:border-primary-indigo'
                            }`}
                          >
                            {cond}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="label-caps">Video Reference (CCTV Clip ID)</label>
                      <input
                        value={prepRecord.videoRef}
                        onChange={(e) => setPrepRecord((p) => ({ ...p, videoRef: e.target.value }))}
                        placeholder="e.g. CAM-04-1435-001"
                        className="w-full bg-white border border-border-slate rounded-xl p-2.5 text-xs data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <button
                    onClick={acceptBag}
                    disabled={!canAccept}
                    className="w-full py-3 bg-success-emerald text-white font-bold text-sm rounded-xl shadow-lg hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Accept & Log to Queue
                  </button>
                  <button onClick={resetScan} className="text-xs text-text-slate-400 hover:text-text-slate-600 transition-colors">Cancel</button>
                </>
              )}

              {/* Failed / not found */}
              {scanPhase === 'failed' && (
                <>
                  <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: [0, -8, 8, -8, 8, 0] }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <AlertTriangle size={64} className="text-red-500" />
                  </motion.div>
                  <div>
                    <p className="label-caps text-red-500 mb-1">Bag Not Recognised</p>
                    <p className="text-sm text-text-slate-500 font-medium">QR code does not match any pending consignment in the system.</p>
                  </div>
                  <div className="w-full bg-red-50 rounded-xl p-3 text-xs font-bold text-red-500 uppercase tracking-widest">
                    {manualId || 'Unknown ID'} — NOT FOUND
                  </div>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={resetScan}
                      className="flex-1 py-3 border border-border-slate text-text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={resetScan}
                      className="flex-1 py-3 bg-warning-amber text-white font-bold text-sm rounded-xl hover:brightness-110 transition-all"
                    >
                      Raise NCR
                    </button>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs text-text-slate-400 hover:text-text-slate-600 transition-colors" onClick={resetScan}>
                    <X size={12} /> Close
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
