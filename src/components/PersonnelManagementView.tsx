import { useState } from 'react';
import { ShieldCheck, Video, User, X, Package, TestTube2, AlertTriangle, ClipboardList, CheckCircle2 } from 'lucide-react';
import type { ReprintRequest } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PersonnelRecord {
  n: string;
  id: string;
  r: string;
  st: string;
  fe: string;
  ok: boolean;
}

interface ParentSampleActivity {
  sampleId: string;
  sealId: string;
  colliery: string;
  weight: string;
  timestamp: string;
}

interface ChildSampleActivity {
  childId: string;
  parentId: string;
  step: string;
  timestamp: string;
}

interface LabReceiptActivity {
  sampleId: string;
  parentId: string;
  status: 'Accepted' | 'Conditional' | 'Rejected';
  receiptTime: string;
}

interface NcrActivity {
  ncrId: string;
  stage: string;
  sampleId: string;
  reason: string;
  filedAt: string;
}

interface OperatorActivity {
  parentSamples: ParentSampleActivity[];
  childSamples: ChildSampleActivity[];
  labReceipts: LabReceiptActivity[];
  ncrFilings: NcrActivity[];
}

type ActivityTab = 'parent' | 'child' | 'lab' | 'ncr';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const PERSONNEL: PersonnelRecord[] = [
  { n: 'Marcus Thorne',    id: 'USR-8821', r: 'Lead Processor',      st: 'Active',    fe: 'Enrolled', ok: true  },
  { n: 'Elena Rodriguez',  id: 'USR-9044', r: 'Collection Handler',  st: 'Active',    fe: 'Pending',  ok: false },
  { n: 'David Kim',        id: 'USR-7732', r: 'Lab Specialist',      st: 'Suspended', fe: 'Revoked',  ok: false },
];

const SAMPLE_ACTIVITY: Record<string, OperatorActivity> = {
  'USR-8821': {
    parentSamples: [
      { sampleId: 'PRNT-8822-X', sealId: 'QRL-SEC-8822-HY77-1', colliery: 'Alpha-1 Mining Complex', weight: '15.20 kg', timestamp: '14:20 UTC' },
      { sampleId: 'PRNT-8818-B', sealId: 'QRL-SEC-8818-MN91-3', colliery: 'Alpha-1 Mining Complex', weight: '15.60 kg', timestamp: '11:30 UTC' },
    ],
    childSamples: [
      { childId: 'BAG-A-8822-X', parentId: 'PRNT-8822-X', step: 'Small Bagging',  timestamp: '14:55 UTC' },
      { childId: 'BAG-B-8818-B', parentId: 'PRNT-8818-B', step: 'Small Bagging',  timestamp: '12:10 UTC' },
      { childId: 'SUB-M-8818-B', parentId: 'PRNT-8818-B', step: 'Division Station', timestamp: '12:30 UTC' },
    ],
    labReceipts: [
      { sampleId: 'SUB-C-8819-X', parentId: 'PRNT-8819-X', status: 'Accepted',    receiptTime: '10:45 UTC' },
    ],
    ncrFilings: [],
  },
  'USR-9044': {
    parentSamples: [],
    childSamples: [
      { childId: 'BAG-R-8820-A', parentId: 'PRNT-8820-A', step: 'Small Bagging',  timestamp: '13:30 UTC' },
      { childId: 'SUB-C-8820-A', parentId: 'PRNT-8820-A', step: 'Division Station', timestamp: '13:50 UTC' },
    ],
    labReceipts: [
      { sampleId: 'SUB-M-8820-A', parentId: 'PRNT-8820-A', status: 'Accepted',    receiptTime: '14:05 UTC' },
      { sampleId: 'SUB-C-8820-A', parentId: 'PRNT-8820-A', status: 'Conditional', receiptTime: '14:08 UTC' },
    ],
    ncrFilings: [
      { ncrId: 'NCR-0041', stage: 'TRANSIT', sampleId: 'PRNT-8820-A', reason: 'Seal tamper evidence on bag exterior', filedAt: '13:15 UTC' },
    ],
  },
  'USR-7732': {
    parentSamples: [
      { sampleId: 'PRNT-8815-K', sealId: 'QRL-SEC-8815-RT22-1', colliery: 'Beta Sector Colliery', weight: '14.40 kg', timestamp: '09:10 UTC' },
    ],
    childSamples: [],
    labReceipts: [
      { sampleId: 'SUB-M-8815-K', parentId: 'PRNT-8815-K', status: 'Accepted',  receiptTime: '09:55 UTC' },
      { sampleId: 'SUB-C-8815-K', parentId: 'PRNT-8815-K', status: 'Accepted',  receiptTime: '09:57 UTC' },
      { sampleId: 'SUB-R-8815-K', parentId: 'PRNT-8815-K', status: 'Rejected',  receiptTime: '10:02 UTC' },
      { sampleId: 'SUB-M-8816-Z', parentId: 'PRNT-8816-Z', status: 'Conditional', receiptTime: '10:20 UTC' },
    ],
    ncrFilings: [
      { ncrId: 'NCR-0038', stage: 'LAB', sampleId: 'SUB-R-8815-K', reason: 'Sample weight below minimum threshold at receipt', filedAt: '10:05 UTC' },
    ],
  },
};

function activityCounts(id: string) {
  const a = SAMPLE_ACTIVITY[id];
  if (!a) return { parent: 0, child: 0, lab: 0, ncr: 0 };
  return {
    parent: a.parentSamples.length,
    child:  a.childSamples.length,
    lab:    a.labReceipts.length,
    ncr:    a.ncrFilings.length,
  };
}

const RECEIPT_STATUS_STYLES: Record<LabReceiptActivity['status'], string> = {
  Accepted:    'bg-success-emerald/10 text-success-emerald border border-success-emerald/20',
  Conditional: 'bg-warning-amber/10 text-warning-amber border border-warning-amber/20',
  Rejected:    'bg-red-50 text-red-600 border border-red-200',
};

const STAGE_STYLES: Record<string, string> = {
  CONSIGNMENT: 'bg-slate-100 text-text-slate-600',
  COLLECTION:  'bg-indigo-50 text-primary-indigo',
  TRANSIT:     'bg-amber-50 text-amber-600',
  PREP:        'bg-orange-50 text-orange-600',
  DIVISION:    'bg-purple-50 text-purple-600',
  LAB:         'bg-emerald-50 text-success-emerald',
};

const TAB_DEFS: { id: ActivityTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'parent', label: 'Parent Samples',  icon: Package },
  { id: 'child',  label: 'Child Samples',   icon: TestTube2 },
  { id: 'lab',    label: 'Lab Receipts',    icon: ClipboardList },
  { id: 'ncr',    label: 'NCR Filings',     icon: AlertTriangle },
];

// ── Component ──────────────────────────────────────────────────────────────────

interface PersonnelManagementViewProps {
  reprintRequests: ReprintRequest[];
  setReprintRequests: React.Dispatch<React.SetStateAction<ReprintRequest[]>>;
}

export default function PersonnelManagementView({ reprintRequests, setReprintRequests }: PersonnelManagementViewProps) {
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
  const [activityTab, setActivityTab] = useState<ActivityTab>('parent');

  const selectedOperator = PERSONNEL.find((p) => p.id === selectedOperatorId) ?? null;
  const activity = selectedOperatorId ? SAMPLE_ACTIVITY[selectedOperatorId] : null;

  const handleSelectOperator = (id: string) => {
    if (selectedOperatorId === id) {
      setSelectedOperatorId(null);
    } else {
      setSelectedOperatorId(id);
      setActivityTab('parent');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-slate-900 tracking-tight">Authority & Logistics</h2>
          <p className="text-text-slate-500 mt-1 text-sm font-medium">Manage operational access, role-based security, and biometric verification enrollment.</p>
        </div>
        <button className="bg-primary-indigo text-white px-8 py-3 rounded-xl text-sm font-bold label-caps shadow-lg shadow-indigo-100 hover:brightness-110 transition-all">Enroll New Personnel</button>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* ── Personnel Registry ─────────────────────────────────────────── */}
        <div className="col-span-12 xl:col-span-8 bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border-slate bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Personnel Registry</h3>
            <div className="flex gap-3">
              <select className="p-2 px-4 bg-white border border-border-slate rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-primary-indigo">
                <option>Operational Role</option>
              </select>
              <select className="p-2 px-4 bg-white border border-border-slate rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-primary-indigo">
                <option>Authority Status</option>
              </select>
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
              <tr>
                <th className="px-6 py-4">Identity / Designation</th>
                <th className="px-6 py-4">Assigned Protocol</th>
                <th className="px-6 py-4">Active Logic</th>
                <th className="px-6 py-4">Sample Activity</th>
                <th className="px-6 py-4 text-right">Face Metrics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-text-slate-700">
              {PERSONNEL.map((u) => {
                const counts = activityCounts(u.id);
                const isSelected = selectedOperatorId === u.id;
                return (
                  <tr
                    key={u.id}
                    onClick={() => handleSelectOperator(u.id)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer group ${isSelected ? 'bg-indigo-50 border-l-2 border-primary-indigo' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <p className={`font-bold text-sm tracking-tight transition-colors ${isSelected ? 'text-primary-indigo' : 'text-text-slate-900 group-hover:text-primary-indigo'}`}>{u.n}</p>
                      <p className="data-mono text-[9px] text-text-slate-400 font-bold mt-1">UUID: {u.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-text-slate-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase border border-slate-200">{u.r}</span>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${u.st === 'Active' ? 'bg-success-emerald shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} />
                        {u.st}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { key: 'P', val: counts.parent, color: 'bg-indigo-50 text-primary-indigo border-indigo-100' },
                          { key: 'C', val: counts.child,  color: 'bg-purple-50 text-purple-600 border-purple-100' },
                          { key: 'L', val: counts.lab,    color: 'bg-emerald-50 text-success-emerald border-emerald-100' },
                          { key: 'N', val: counts.ncr,    color: 'bg-amber-50 text-warning-amber border-amber-100' },
                        ].map((chip) => (
                          <span
                            key={chip.key}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-bold ${chip.val > 0 ? chip.color : 'bg-slate-50 text-text-slate-300 border-slate-100'}`}
                          >
                            {chip.key} {chip.val > 0 ? chip.val : '—'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold tracking-widest text-[9px] uppercase inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                        u.fe === 'Enrolled' ? 'bg-success-emerald/10 text-success-emerald border-success-emerald/20'
                        : u.fe === 'Pending' ? 'bg-warning-amber/10 text-warning-amber border-warning-amber/20'
                        : 'bg-slate-100 text-text-slate-400 border-slate-200'
                      }`}>
                        {u.fe === 'Enrolled' && <ShieldCheck size={12} />}
                        {u.fe}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Right column ───────────────────────────────────────────────── */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-8">
          <div className="bg-white border border-border-slate rounded-2xl p-8 shadow-sm overflow-hidden bg-gradient-to-br from-white to-slate-50/50">
            <h3 className="font-bold text-xs uppercase tracking-widest text-text-slate-900 mb-8 border-b border-slate-100 pb-4 flex items-center gap-2">
              <Video size={14} className="text-primary-indigo" /> VMS Biometrics
            </h3>
            <div className="mb-6">
              <p className="font-bold text-sm text-text-slate-900">Elena Rodriguez</p>
              <p className="text-text-slate-400 text-[10px] data-mono font-bold mt-1">ID_REF: USR-9044 | HANDLER</p>
            </div>
            <div className="aspect-square bg-slate-950 rounded-3xl border-2 border-dashed border-border-slate flex flex-col items-center justify-center text-center p-8 hover:border-primary-indigo cursor-pointer transition-all relative overflow-hidden group shadow-inner">
              <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGvsXgqD9o7CA1bxKfbsmEvKkbrdbkKrnP0DFUWtwHgoEIGF11yuJ5xc7aqOlZJcDQLeZokZZMn3m91FbBZk-kngnqygrCI-ZPEqsmoH079AkUYCAYtFmkVEZRZ8Adh0umhSeeW3FQ4iu2wjhKlMx6-LLVwOL5lrzDGRq9-lZxuA_CNeyNFbdgi8Q_p1KUqGS32RgplYuBqeA46z21oaqtJvwJ0uH1qpmI1YN9OM0UUzdKpy-aequJUCnfXKc1NzZ8OcAUGC3eUNBY"
                  className="w-full h-full object-cover mix-blend-overlay scale-110 group-hover:scale-100 transition-transform duration-700"
                  alt="Biometric Scan"
                />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-primary-indigo/10 flex items-center justify-center text-primary-indigo mb-4 border border-primary-indigo/20 shadow-lg backdrop-blur-md">
                  <User size={32} />
                </div>
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">Connect Live Frame</p>
              </div>
              <div className="absolute top-4 left-4 flex gap-1 items-center">
                <div className="w-1 h-1 rounded-full bg-primary-indigo" />
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <div className="w-1 h-1 rounded-full bg-white/20" />
              </div>
            </div>
            <button className="w-full mt-8 py-3 bg-white border border-border-slate rounded-xl text-[10px] font-bold label-caps tracking-widest hover:border-primary-indigo hover:text-primary-indigo transition-all shadow-sm">
              Capture Biometric Basis
            </button>
          </div>

          <div className="bg-white border border-border-slate rounded-2xl p-8 shadow-sm flex-1 flex flex-col">
            <h3 className="font-bold text-xs uppercase tracking-widest text-text-slate-900 mb-6 border-b border-slate-100 pb-4">Security Permission Matrix</h3>
            <div className="space-y-4 flex-1">
              {[
                { label: 'Weighbridge Registry',     ok: true  },
                { label: 'Sample Extraction Logic',  ok: true  },
                { label: 'Industrial Ledger Write',  ok: false },
                { label: 'System Telemetry Edit',    ok: false },
              ].map((p, i) => (
                <div key={i} className="flex justify-between items-center text-xs border-b border-slate-50 pb-3">
                  <span className="font-bold text-text-slate-500">{p.label}</span>
                  {p.ok ? <ShieldCheck size={18} className="text-success-emerald" /> : <div className="w-4 h-4 border border-slate-100 rounded" />}
                </div>
              ))}
            </div>
            <button className="w-full pt-8 text-[10px] font-bold text-primary-indigo hover:underline uppercase tracking-widest">
              Override Policy Manifest
            </button>
          </div>
        </div>
      </div>

      {/* ── Sample Activity Panel ─────────────────────────────────────────── */}
      {selectedOperator && activity && (
        <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden">
          {/* Panel header */}
          <div className="p-6 border-b border-border-slate bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-2.5 h-2.5 rounded-full ${selectedOperator.st === 'Active' ? 'bg-success-emerald shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} />
                <h2 className="font-bold text-lg text-text-slate-900">{selectedOperator.n}</h2>
                <span className="bg-slate-100 text-text-slate-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase border border-slate-200">{selectedOperator.r}</span>
                <span className="data-mono text-[10px] text-text-slate-400 font-bold">{selectedOperator.id}</span>
              </div>
              <p className="text-xs text-text-slate-500 font-medium">Sample Custodianship History</p>
            </div>

            {/* Summary count chips */}
            <div className="flex items-center gap-3">
              {[
                { label: 'Parent', val: activity.parentSamples.length,  color: 'bg-indigo-50 text-primary-indigo border-indigo-200' },
                { label: 'Child',  val: activity.childSamples.length,   color: 'bg-purple-50 text-purple-600 border-purple-200' },
                { label: 'Lab',    val: activity.labReceipts.length,     color: 'bg-emerald-50 text-success-emerald border-emerald-200' },
                { label: 'NCR',    val: activity.ncrFilings.length,      color: 'bg-amber-50 text-warning-amber border-amber-200' },
              ].map((chip) => (
                <div key={chip.label} className={`flex flex-col items-center px-4 py-2 rounded-xl border text-center ${chip.val > 0 ? chip.color : 'bg-slate-50 text-text-slate-300 border-slate-100'}`}>
                  <span className="text-xl font-bold">{chip.val}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest">{chip.label}</span>
                </div>
              ))}
              <button
                onClick={() => setSelectedOperatorId(null)}
                className="ml-2 p-2 rounded-xl text-text-slate-400 hover:bg-slate-100 hover:text-text-slate-700 transition-colors"
                aria-label="Close activity panel"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="px-6 pt-4 border-b border-border-slate flex gap-2 overflow-x-auto">
            {TAB_DEFS.map((tab) => {
              const count = tab.id === 'parent' ? activity.parentSamples.length
                          : tab.id === 'child'  ? activity.childSamples.length
                          : tab.id === 'lab'    ? activity.labReceipts.length
                          : activity.ncrFilings.length;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivityTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
                    activityTab === tab.id
                      ? 'text-primary-indigo border-primary-indigo bg-indigo-50/50'
                      : 'text-text-slate-400 border-transparent hover:text-text-slate-700 hover:border-slate-200'
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}
                  <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${count > 0 ? 'bg-primary-indigo/10 text-primary-indigo' : 'bg-slate-100 text-text-slate-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="overflow-x-auto">

            {/* Parent Samples */}
            {activityTab === 'parent' && (
              activity.parentSamples.length === 0 ? (
                <EmptyState message="No parent sample QR generation activity on record for this operator." />
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
                    <tr>
                      <th className="px-6 py-4">Sample ID</th>
                      <th className="px-6 py-4">Seal ID</th>
                      <th className="px-6 py-4">Colliery</th>
                      <th className="px-6 py-4">Weight</th>
                      <th className="px-6 py-4 text-right">QR Generated At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activity.parentSamples.map((s) => (
                      <tr key={s.sampleId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 data-mono font-bold text-sm text-primary-indigo">{s.sampleId}</td>
                        <td className="px-6 py-4 data-mono text-xs text-text-slate-500 truncate max-w-[180px]">{s.sealId}</td>
                        <td className="px-6 py-4 text-xs text-text-slate-600 font-medium">{s.colliery}</td>
                        <td className="px-6 py-4 text-sm font-bold text-text-slate-700">{s.weight}</td>
                        <td className="px-6 py-4 text-right data-mono text-xs font-bold text-text-slate-500">{s.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* Child Samples */}
            {activityTab === 'child' && (
              activity.childSamples.length === 0 ? (
                <EmptyState message="No child sample handling activity on record for this operator." />
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
                    <tr>
                      <th className="px-6 py-4">Child Sample ID</th>
                      <th className="px-6 py-4">Parent ID</th>
                      <th className="px-6 py-4">Step</th>
                      <th className="px-6 py-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activity.childSamples.map((s) => (
                      <tr key={s.childId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 data-mono font-bold text-sm text-purple-600">{s.childId}</td>
                        <td className="px-6 py-4 data-mono text-sm text-primary-indigo font-semibold">{s.parentId}</td>
                        <td className="px-6 py-4">
                          <span className="bg-purple-50 text-purple-600 border border-purple-100 px-3 py-1 rounded-lg text-[9px] font-bold uppercase">{s.step}</span>
                        </td>
                        <td className="px-6 py-4 text-right data-mono text-xs font-bold text-text-slate-500">{s.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* Lab Receipts */}
            {activityTab === 'lab' && (
              activity.labReceipts.length === 0 ? (
                <EmptyState message="No lab receipt confirmations on record for this operator." />
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
                    <tr>
                      <th className="px-6 py-4">Sample ID</th>
                      <th className="px-6 py-4">Parent ID</th>
                      <th className="px-6 py-4">Acceptance Status</th>
                      <th className="px-6 py-4 text-right">Receipt Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activity.labReceipts.map((s) => (
                      <tr key={s.sampleId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 data-mono font-bold text-sm text-success-emerald">{s.sampleId}</td>
                        <td className="px-6 py-4 data-mono text-sm text-primary-indigo font-semibold">{s.parentId}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase ${RECEIPT_STATUS_STYLES[s.status]}`}>{s.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right data-mono text-xs font-bold text-text-slate-500">{s.receiptTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* NCR Filings */}
            {activityTab === 'ncr' && (
              activity.ncrFilings.length === 0 ? (
                <EmptyState message="No NCR filings on record for this operator." />
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
                    <tr>
                      <th className="px-6 py-4">NCR ID</th>
                      <th className="px-6 py-4">Stage</th>
                      <th className="px-6 py-4">Sample ID</th>
                      <th className="px-6 py-4">Reason</th>
                      <th className="px-6 py-4 text-right">Filed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activity.ncrFilings.map((s) => (
                      <tr key={s.ncrId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 data-mono font-bold text-sm text-warning-amber">{s.ncrId}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase ${STAGE_STYLES[s.stage] ?? 'bg-slate-100 text-text-slate-500'}`}>{s.stage}</span>
                        </td>
                        <td className="px-6 py-4 data-mono text-sm text-primary-indigo font-semibold">{s.sampleId}</td>
                        <td className="px-6 py-4 text-xs text-text-slate-600 font-medium max-w-[280px]">{s.reason}</td>
                        <td className="px-6 py-4 text-right data-mono text-xs font-bold text-text-slate-500">{s.filedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

          </div>
        </div>
      )}

      {/* ── QR Reprint Requests Panel ─────────────────────────────────────── */}
      <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border-slate bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">QR Reprint Requests</h3>
            {reprintRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="bg-primary-indigo text-white text-[9px] font-bold rounded-full px-2 py-0.5">
                {reprintRequests.filter(r => r.status === 'pending').length} pending
              </span>
            )}
          </div>
          <span className="text-[10px] text-text-slate-400 font-medium">{reprintRequests.length} total</span>
        </div>
        {reprintRequests.length === 0 ? (
          <div className="p-8 text-center text-text-slate-400 text-sm font-medium">No reprint requests filed.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
              <tr>
                <th className="px-6 py-3">Sample ID</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3">Operator</th>
                <th className="px-6 py-3">Requested</th>
                <th className="px-6 py-3 text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reprintRequests.map((req) => (
                <tr key={req.id} className={`transition-colors ${req.status === 'pending' ? 'bg-amber-50/30' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4 data-mono text-sm font-bold text-text-slate-900">{req.sampleId}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${req.qrType === 'parent' ? 'bg-indigo-50 text-primary-indigo' : 'bg-purple-50 text-purple-600'}`}>
                      {req.qrType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-slate-600">{req.reason}</td>
                  <td className="px-6 py-4 text-sm text-text-slate-500">{req.requestedBy}</td>
                  <td className="px-6 py-4 text-xs text-text-slate-400 data-mono">{new Date(req.requestedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setReprintRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved', reviewedBy: 'Admin', reviewedAt: new Date().toISOString() } : r))}
                          className="px-3 py-1.5 rounded-lg bg-success-emerald text-white text-[10px] font-bold hover:brightness-110 transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setReprintRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected', reviewedBy: 'Admin', reviewedAt: new Date().toISOString() } : r))}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100 text-[10px] font-bold hover:bg-red-100 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    ) : req.status === 'approved' ? (
                      <div className="flex items-center justify-end gap-1.5 text-success-emerald">
                        <CheckCircle2 size={13} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Approved</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Rejected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-8">
      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <ClipboardList size={24} className="text-text-slate-300" />
      </div>
      <p className="text-sm font-medium text-text-slate-400 max-w-sm">{message}</p>
    </div>
  );
}
