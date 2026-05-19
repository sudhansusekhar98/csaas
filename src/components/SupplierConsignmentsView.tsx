import { useState } from 'react';
import { Plus, X, TrainFront, ShieldCheck, Activity, Search, Settings, Mountain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProcessBreadcrumb from './layout/ProcessBreadcrumb';
import type { ViewType } from '../types';
import { script } from 'motion/react-client';

interface SupplierConsignmentsViewProps {
  onNavigate: (view: ViewType) => void;
}

const DVC_MINES = [
  'Bermo Mine / Kargali (Bokaro, Jharkhand) — Captive',
  'Tubed Block (Latehar, Jharkhand)',
  'Barjora (North) Block (Bankura, West Bengal)',
  'Khagra Joydev Block (Birbhum, West Bengal)',
  'Gondulpara Block (Hazaribagh, Jharkhand) — Joint with TVNL',
  'Saharpur-Jamarpani Block (Dumka, Jharkhand)',
  'Pirpainti Barahar (Jharkhand/Bihar border)',
  'Dhulia North (Jharkhand)',
  'Mandakini-B via CIL (Odisha)',
];

const DVC_PLANTS = [
  'Mejia TPS (Bankura, West Bengal)',
  'Bodor TPS - A (Bokaro, Jharkhand)',
  'Bodor TPS - B (Bokaro, Jharkhand)',
  'Chandrapura TPS (Bokaro, Jharkhand)',
  'Durgapur Steel TPS / Andal TPS (Paschim Bardhaman, West Bengal)',
  'Koderma TPS (Koderma, Jharkhand)',
  'Raghunathpur TPS (Purulia, West Bengal)',
];

const SOURCE_MINE_OPTIONS = [
  "ROM",
  "Washed",
  "Crushed",
  "Mixed Grade",
];

const SAMPLING_AGENCIES = ['Third Party (CIMFR)', 'Third Party (NABL)', 'Self-Sampling', 'DVC Inspection'];

const mockConsignments = [
  { id: 'CNS-4401-A', mine: 'Bermo Mine / Kargali, Bokaro',       plant: 'Bodor TPS - A',      contract: 'DVC-CTR-2024-081', rackId: 'RCK-9901-A', wagons: 58, grade: 'G10', gcv: 3840, agency: 'Third Party (CIMFR)', status: 'UNLOADING'  as const },
  { id: 'CNS-4402-B', mine: 'Barjora (North) Block, Bankura',      plant: 'Mejia TPS',           contract: 'DVC-CTR-2024-076', rackId: 'RCK-9902-B', wagons: 62, grade: 'G11', gcv: 3340, agency: 'DVC Inspection',       status: 'IN_TRANSIT' as const },
  { id: 'CNS-4403-X', mine: 'Gondulpara Block, Hazaribagh',        plant: 'Raghunathpur TPS',    contract: 'DVC-CTR-2024-069', rackId: 'RCK-9903-X', wagons: 54, grade: 'G9',  gcv: 3780, agency: 'Third Party (NABL)', status: 'QUEUED'     as const },
  { id: 'CNS-4404-L', mine: 'Mandakini-B via CIL, Odisha',        plant: 'Chandrapura TPS',     contract: 'DVC-CTR-2024-055', rackId: 'RCK-9904-L', wagons: 60, grade: 'G10', gcv: 3560, agency: 'Third Party (CIMFR)', status: 'READY'      as const },
];

const statusStyles = {
  UNLOADING:  'bg-primary-indigo text-white',
  IN_TRANSIT: 'bg-slate-100 text-text-slate-400',
  QUEUED:     'bg-warning-amber/10 text-warning-amber',
  READY:      'bg-success-emerald/10 text-success-emerald',
};

export default function SupplierConsignmentsView({ onNavigate }: SupplierConsignmentsViewProps) {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProcessBreadcrumb currentStep={1} onNavigate={onNavigate} />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Mountain size={18} className="text-text-slate-400" />
            <span className="text-[10px] font-bold text-text-slate-400 uppercase tracking-widest">DVC Captive &amp; Allocated Mine Sources</span>
          </div>
          <h1 className="text-4xl font-bold text-text-slate-900 tracking-tight">Consignment Registration</h1>
          <p className="text-text-slate-500 mt-1 font-medium">Register and manage inbound coal from DVC captive mines, allocated blocks, and CIL subsidiaries.</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-5 py-2.5 bg-primary-indigo text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-100 hover:brightness-110 transition-all flex items-center gap-2"
        >
          {/* <Plus size={16} /> Register Consignment */}
          Register Consignment
        </button>
      </header>

      {/* New Consignment Modal */}
      <AnimatePresence>
        {showNew && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNew(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-border-slate flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-border-slate bg-slate-50/50 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <TrainFront size={20} className="text-primary-indigo" /> Register DVC Consignment
                  </h2>
                  <p className="text-[10px] text-text-slate-400 font-bold uppercase tracking-widest mt-1">Captive Mine / Allocated Block / CIL Subsidiary</p>
                </div>
                <button onClick={() => setShowNew(false)} className="p-2 hover:bg-slate-200 rounded-lg text-text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                {/* Source */}
                {/* <section className="space-y-5">
                  <h3 className="font-bold text-[10px] text-text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Source Details</h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5 col-span-2">
                      <label className="label-caps">Source Mine</label>
                      <select className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none">
                        <option value="">Select source mine...</option>
                        {DVC_MINES.map((m) => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="label-caps">Contract Reference No.</label>
                      <input type="text" placeholder="DVC-CTR-2024-XXX" className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none placeholder:text-slate-300" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label-caps">DVC Receiving Plant</label>
                      <select className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none">
                        <option value="">Select receiving plant...</option>
                        {DVC_PLANTS.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                </section> */}

                <section className="space-y-5">
                    <h3 className="font-bold text-[10px] text-text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                      Source Details
                    </h3>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="label-caps">Source Mine</label>
                        <select className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none">
                          <option value="">Select source mine...</option>
                          {DVC_MINES.map((m) => (
                            <option key={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="label-caps">Source Mine Options</label>
                        <select className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none">
                          <option value="">Select option...</option>
                          {SOURCE_MINE_OPTIONS.map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5 col-span-2">
                        <label className="label-caps">DVC Receiving Plant</label>
                        <select className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none">
                          <option value="">Select receiving plant...</option>
                          {DVC_PLANTS.map((p) => (
                            <option key={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </section>

                {/* Quality */}
                <section className="space-y-5">
                  <h3 className="font-bold text-[10px] text-text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Quality Specifications</h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="label-caps">Declared Grade</label>
                      <select className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none">
                        <option value="">Select grade...</option>
                        {['G6','G7','G8','G9','G10','G11','G12','G13','G14','G15','G16','G17'].map((g) => (
                          <option key={g}>Grade {g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="label-caps">Declared GCV (kCal/kg)</label>
                      <input type="number" defaultValue={3600} className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none" />
                    </div>
                    {/* <div className="space-y-1.5 col-span-2">
                      <label className="label-caps">Sampling Agency</label>
                      <select className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none">
                        <option value="">Select agency...</option>
                        {SAMPLING_AGENCIES.map((a) => <option key={a}>{a}</option>)}
                      </select>
                    </div> */}
                  </div>
                </section>

                {/* Logistics */}
                <section className="space-y-5">
                  <h3 className="font-bold text-[10px] text-text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Logistics Manifest</h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="label-caps">Rack ID</label>
                      <input type="text" placeholder="RCK-XXXX-X" className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none placeholder:text-slate-300" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="label-caps">Total Wagon Count</label>
                      <input type="number" defaultValue={58} className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none" />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="label-caps">ETA</label>
                      <input type="datetime-local" className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none" />
                    </div>
                    {/* <div className="space-y-1.5">
                      <label className="label-caps">DVC Plant</label>
                      <select className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none">
                        <option value="">Select destination plant...</option>
                        {DVC_PLANTS.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div> */}
                  </div>
                </section>
              </div>

              <div className="p-8 border-t border-border-slate bg-slate-50/50 flex gap-4 shrink-0">
                <button onClick={() => setShowNew(false)} className="flex-1 py-3 bg-white border border-border-slate rounded-xl text-[10px] font-bold label-caps hover:bg-slate-100 transition-all">Cancel</button>
                <button onClick={() => setShowNew(false)} className="flex-1 px-5 py-2.5 bg-primary-indigo text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-100 hover:brightness-110 transition-all">Register Consignment</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Racks',        val: '04',    icon: TrainFront,  color: 'text-primary-indigo', bg: 'bg-indigo-50' },
          { label: 'Pending Discharge',   val: '02',    icon: TrainFront,  color: 'text-warning-amber',  bg: 'bg-amber-50' },
          { label: 'Verified Wagons',     val: '234',   icon: ShieldCheck, color: 'text-success-emerald',bg: 'bg-emerald-50' },
          { label: 'Avg GCV (kCal/kg)',   val: '3,630', icon: Activity,    color: 'text-purple-600',     bg: 'bg-purple-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-text-slate-400 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-text-slate-900">{stat.val}</div>
          </div>
        ))}
      </div>

      {/* Consignment table */}
      <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Inbound Consignment Ledger</h3>
            <p className="text-[10px] text-text-slate-400 font-medium mt-0.5">DVC captive mines, allocated blocks, and CIL subsidiary coal.</p>
          </div>
          <div className="flex gap-3">
            <button className="p-2 hover:bg-slate-100 rounded-lg text-text-slate-400 transition-colors"><Search size={16} /></button>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-text-slate-400 transition-colors"><Settings size={16} /></button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
            <tr>
              <th className="px-6 py-4">Consignment ID</th>
              <th className="px-6 py-4">Source Mine</th>
              <th className="px-6 py-4">Contract No.</th>
              <th className="px-6 py-4">DVC Plant</th>
              <th className="px-6 py-4">Rack / Wagons</th>
              <th className="px-6 py-4">Grade / GCV</th>
              <th className="px-6 py-4">Sampling</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockConsignments.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-text-slate-400 group-hover:bg-primary-indigo group-hover:text-white transition-all shadow-sm">
                      <TrainFront size={15} />
                    </div>
                    <span className="data-mono font-bold text-sm text-text-slate-900">{row.id}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-semibold text-text-slate-700">{row.mine}</td>
                <td className="px-6 py-5 data-mono text-xs text-text-slate-500">{row.contract}</td>
                <td className="px-6 py-5 text-xs font-bold text-text-slate-700">{row.plant}</td>
                <td className="px-6 py-5">
                  <p className="data-mono text-xs font-bold text-text-slate-700">{row.rackId}</p>
                  <p className="text-[10px] text-text-slate-400">{row.wagons} wagons</p>
                </td>
                <td className="px-6 py-5">
                  <p className="text-xs font-bold text-text-slate-700">{row.grade}</p>
                  <p className="text-[10px] text-text-slate-400">{row.gcv.toLocaleString()} kCal/kg</p>
                </td>
                <td className="px-6 py-5 text-xs text-text-slate-500 font-medium">{row.agency}</td>
                <td className="px-6 py-5 text-right">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest ${statusStyles[row.status]}`}>
                    {row.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
