import { useState } from 'react';
import {
  QrCode, Printer, CheckCircle2, ChevronRight, Clock, User,
  ArrowRight, Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProcessBreadcrumb from './layout/ProcessBreadcrumb';
import type { ViewType } from '../types';

interface SampleCollectionViewProps {
  onNavigate: (view: ViewType) => void;
}

const COLLECTORS = [
  'OPR-774 (J. Doe)',
  'OPR-312 (R. Kumar)',
  'OPR-881 (M. Patel)',
  'OPR-445 (A. Singh)',
];

const RACK_IDS = ['RCK-9901-A', 'RCK-9902-B', 'RCK-9903-X', 'RCK-9904-L'];

type SourceType = 'TRACK_HOPPER' | 'WAGON_TIPPLER';

interface CollectionRecord {
  parentId: string;
  sourceType: SourceType;
  equipmentId: string;
  rackId: string;
  wagonNum: string;
  collector: string;
  collectedAt: string;
  sealNum: string;
  rfidTag: string;
  status: 'SEALED' | 'IN_TRANSIT';
}

const INITIAL_RECORDS: CollectionRecord[] = [
  { parentId: 'PRNT-8822-X', sourceType: 'TRACK_HOPPER', equipmentId: 'TH-07', rackId: 'RCK-9901-A', wagonNum: 'WGN-0034', collector: 'OPR-774 (J. Doe)',    collectedAt: '14:20 UTC', sealNum: 'QRL-SEC-8822-HY77-1', rfidTag: 'RFID-88220-TH7', status: 'IN_TRANSIT' },
  { parentId: 'PRNT-8820-A', sourceType: 'WAGON_TIPPLER', equipmentId: 'WT-03', rackId: 'RCK-9901-A', wagonNum: 'WGN-0028', collector: 'OPR-312 (R. Kumar)', collectedAt: '13:05 UTC', sealNum: 'QRL-SEC-8820-KL42-2', rfidTag: 'RFID-88200-WT3', status: 'IN_TRANSIT' },
  { parentId: 'PRNT-8818-B', sourceType: 'TRACK_HOPPER', equipmentId: 'TH-02', rackId: 'RCK-9902-B', wagonNum: 'WGN-0012', collector: 'OPR-774 (J. Doe)',    collectedAt: '11:30 UTC', sealNum: 'QRL-SEC-8818-MN91-3', rfidTag: 'RFID-88180-TH2', status: 'IN_TRANSIT' },
];

// Generate next parent ID (simple counter)
let parentCounter = 8825;
function nextParentId(): string {
  return `PRNT-${parentCounter++}-Z`;
}

export default function SampleCollectionView({ onNavigate }: SampleCollectionViewProps) {
  const [sourceType, setSourceType] = useState<SourceType>('TRACK_HOPPER');
  const [equipmentId, setEquipmentId] = useState('');
  const [rackId, setRackId] = useState('');
  const [wagonNum, setWagonNum] = useState('');
  const [collector, setCollector] = useState('');
  const [sealNum, setSealNum] = useState('');
  const [rfidTag, setRfidTag] = useState('');

  const [generatedRecord, setGeneratedRecord] = useState<CollectionRecord | null>(null);
  const [records, setRecords] = useState<CollectionRecord[]>(INITIAL_RECORDS);
  const [confirmed, setConfirmed] = useState(false);

  const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' UTC';

  const isFormValid = equipmentId && rackId && wagonNum && collector && sealNum && rfidTag;

  const handleGenerate = () => {
    const record: CollectionRecord = {
      parentId: nextParentId(),
      sourceType,
      equipmentId,
      rackId,
      wagonNum,
      collector,
      collectedAt: now,
      sealNum,
      rfidTag,
      status: 'SEALED',
    };
    setGeneratedRecord(record);
    setConfirmed(false);
  };

  const handleConfirm = () => {
    if (!generatedRecord) return;
    setRecords((prev) => [generatedRecord, ...prev]);
    setGeneratedRecord(null);
    setConfirmed(true);
    // Reset form
    setEquipmentId('');
    setRackId('');
    setWagonNum('');
    setCollector('');
    setSealNum('');
    setRfidTag('');
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProcessBreadcrumb currentStep={2} onNavigate={onNavigate} />

      {/* Sticky header */}
      <div className="sticky top-0 z-30 -mx-8 px-8 py-5 bg-white/95 backdrop-blur-sm border-b border-border-slate mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 max-w-[1440px] mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-text-slate-900 tracking-tight">Sample Collection & Seal Generation</h1>
            <p className="text-text-slate-500 text-sm font-medium mt-0.5">
              Register yard sample collection and generate parent QR seal / RFID tag.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-border-slate rounded-xl px-4 py-2 text-center">
              <p className="label-caps text-[9px] mb-0.5">Generated Today</p>
              <p className="text-lg font-bold text-text-slate-900">{records.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Left: Collection Form ────────────────────────────────── */}
          <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-slate bg-slate-50/50">
              <h3 className="font-bold text-text-slate-900 text-sm uppercase tracking-widest">Collection Details</h3>
              <p className="text-[10px] text-text-slate-400 mt-0.5">Fill all fields to generate the parent QR seal</p>
            </div>
            <div className="p-6 space-y-5">

              {/* Sample Source */}
              <div className="space-y-2">
                <label className="label-caps">Sample Source Type <span className="text-red-500">*</span></label>
                <div className="flex gap-3">
                  {(['TRACK_HOPPER', 'WAGON_TIPPLER'] as SourceType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSourceType(t)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        sourceType === t
                          ? 'bg-primary-indigo text-white border-primary-indigo shadow-md shadow-indigo-100'
                          : 'bg-white text-text-slate-600 border-border-slate hover:border-primary-indigo'
                      }`}
                    >
                      {t === 'TRACK_HOPPER' ? 'Track Hopper' : 'Wagon Tippler'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment ID */}
              <div className="space-y-1.5">
                <label className="label-caps">Equipment ID <span className="text-red-500">*</span></label>
                <input
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(e.target.value)}
                  placeholder={sourceType === 'TRACK_HOPPER' ? 'e.g. TH-07' : 'e.g. WT-03'}
                  className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none placeholder:text-slate-300"
                />
              </div>

              {/* Rake / Wagon */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="label-caps">Rack ID <span className="text-red-500">*</span></label>
                  <select
                    value={rackId}
                    onChange={(e) => setRackId(e.target.value)}
                    className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none"
                  >
                    <option value="">Select rack...</option>
                    {RACK_IDS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="label-caps">Wagon Number <span className="text-red-500">*</span></label>
                  <input
                    value={wagonNum}
                    onChange={(e) => setWagonNum(e.target.value)}
                    placeholder="e.g. WGN-0034"
                    className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Collector */}
              <div className="space-y-1.5">
                <label className="label-caps">Collector (Operator) <span className="text-red-500">*</span></label>
                <select
                  value={collector}
                  onChange={(e) => setCollector(e.target.value)}
                  className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none"
                >
                  <option value="">Select collector...</option>
                  {COLLECTORS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Date/Time */}
              <div className="space-y-1.5">
                <label className="label-caps">Date / Time</label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-border-slate rounded-xl text-xs data-mono font-bold text-text-slate-500">
                  <Clock size={14} className="text-text-slate-400" />
                  {now} — auto-captured
                </div>
              </div>

              {/* Seal & RFID */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-slate">
                <div className="space-y-1.5">
                  <label className="label-caps">Seal Number <span className="text-red-500">*</span></label>
                  <input
                    value={sealNum}
                    onChange={(e) => setSealNum(e.target.value)}
                    placeholder="QRL-SEC-XXXX"
                    className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="label-caps">RFID Tag No. <span className="text-red-500">*</span></label>
                  <input
                    value={rfidTag}
                    onChange={(e) => setRfidTag(e.target.value)}
                    placeholder="RFID-XXXXX-XX"
                    className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!isFormValid}
                className="w-full py-3 bg-primary-indigo text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-100 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <QrCode size={18} /> Generate Parent QR Seal
              </button>
            </div>
          </div>

          {/* ── Right: QR Label Preview ──────────────────────────────── */}
          <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border-slate bg-slate-50/50">
              <h3 className="font-bold text-text-slate-900 text-sm uppercase tracking-widest">QR Label Preview</h3>
              <p className="text-[10px] text-text-slate-400 mt-0.5">Generated seal label ready for print and RFID encoding</p>
            </div>

            <div className="flex-1 flex items-center justify-center p-8">
              <AnimatePresence mode="wait">
                {!generatedRecord && !confirmed ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                      <QrCode size={40} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-text-slate-400">Fill the form and click</p>
                    <p className="text-sm font-bold text-text-slate-400">"Generate Parent QR Seal"</p>
                  </motion.div>
                ) : confirmed ? (
                  <motion.div
                    key="confirmed"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center gap-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-success-emerald flex items-center justify-center shadow-xl shadow-emerald-100">
                      <CheckCircle2 size={40} className="text-white" />
                    </div>
                    <p className="text-lg font-bold text-success-emerald">Registered Successfully</p>
                    <p className="text-sm text-text-slate-500">Sample added to the collection queue.<br />Proceed to Sample Tracking.</p>
                    <button
                      onClick={() => onNavigate('tracking')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary-indigo text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-indigo-100"
                    >
                      View in Sample Tracking <ArrowRight size={16} />
                    </button>
                  </motion.div>
                ) : generatedRecord && (
                  <motion.div
                    key="label"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-xs"
                  >
                    {/* Label card (simulates a physical label) */}
                    <div className="border-2 border-slate-800 rounded-2xl overflow-hidden bg-white shadow-xl">
                      {/* Label header */}
                      <div className="bg-slate-950 px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">CSAAS</p>
                          <p className="text-white font-bold text-xs">Parent Sample Seal</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest">Damodar Valley Corporation</p>
                        </div>
                      </div>

                      {/* QR visual */}
                      <div className="px-6 py-5 flex items-start gap-5">
                        <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-center shrink-0 relative">
                          <QrCode size={72} className="text-slate-900" />
                          {/* Corner brackets */}
                          <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-primary-indigo" />
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-primary-indigo" />
                          <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-primary-indigo" />
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-primary-indigo" />
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest">Parent Sample ID</p>
                            <p className="data-mono font-bold text-text-slate-900">{generatedRecord.parentId}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest">Seal No.</p>
                            <p className="data-mono text-[10px] font-bold text-text-slate-700 truncate">{generatedRecord.sealNum}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest">RFID</p>
                            <p className="data-mono text-[10px] font-bold text-text-slate-700">{generatedRecord.rfidTag}</p>
                          </div>
                        </div>
                      </div>

                      {/* Label footer */}
                      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 grid grid-cols-2 gap-2 text-[9px]">
                        <div>
                          <p className="text-slate-400 uppercase tracking-widest">Source</p>
                          <p className="font-bold text-slate-700">{generatedRecord.sourceType.replace('_', ' ')} {generatedRecord.equipmentId}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase tracking-widest">Rack / Wagon</p>
                          <p className="font-bold text-slate-700">{generatedRecord.rackId} / {generatedRecord.wagonNum}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase tracking-widest">Collector</p>
                          <p className="font-bold text-slate-700">{generatedRecord.collector.split(' (')[0]}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase tracking-widest">Time</p>
                          <p className="font-bold text-slate-700">{generatedRecord.collectedAt}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4">
                      <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border-slate rounded-xl text-xs font-bold text-text-slate-600 hover:bg-slate-50 transition-all">
                        <Printer size={14} /> Print Label
                      </button>
                      <button
                        onClick={handleConfirm}
                        className="flex-1 py-2.5 bg-success-emerald text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-lg"
                      >
                        Confirm & Register
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Recent collections table */}
        <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-bold text-text-slate-900 text-sm uppercase tracking-widest">Recent Collections</h3>
              <p className="text-[10px] text-text-slate-400 mt-0.5">Parent QR seals generated this shift</p>
            </div>
            <span className="bg-indigo-50 text-primary-indigo text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">{records.length} SEALS</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
              <tr>
                <th className="px-6 py-3">Parent ID</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">Rack / Wagon</th>
                <th className="px-6 py-3">Collector</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">RFID</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((rec) => (
                <tr key={rec.parentId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 data-mono font-bold text-sm text-primary-indigo">{rec.parentId}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-text-slate-600 font-medium">
                      <Package size={13} className="text-text-slate-400" />
                      {rec.sourceType.replace('_', ' ')} {rec.equipmentId}
                    </div>
                  </td>
                  <td className="px-6 py-4 data-mono text-xs text-text-slate-600">{rec.rackId} / {rec.wagonNum}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-text-slate-600">
                      <User size={13} className="text-text-slate-400" /> {rec.collector.split(' (')[0]}
                    </div>
                  </td>
                  <td className="px-6 py-4 data-mono text-xs text-text-slate-400">{rec.collectedAt}</td>
                  <td className="px-6 py-4 data-mono text-[10px] text-text-slate-400">{rec.rfidTag}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest ${
                      rec.status === 'IN_TRANSIT' ? 'bg-primary-indigo/10 text-primary-indigo' : 'bg-success-emerald/10 text-success-emerald'
                    }`}>{rec.status.replace('_', ' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
