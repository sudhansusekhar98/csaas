import { TrainFront, Box, ShieldCheck, Activity, Search, Settings, ChevronRight } from 'lucide-react';
import ProcessBreadcrumb from './layout/ProcessBreadcrumb';
import type { ViewType } from '../types';

interface ConsignmentsViewProps {
  onNavigate: (view: ViewType) => void;
}

export default function ConsignmentsView({ onNavigate }: ConsignmentsViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProcessBreadcrumb currentStep={1} onNavigate={onNavigate} />
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold text-text-slate-900 tracking-tight">DVC Consignments</h1>
          <p className="text-text-slate-500 mt-1 font-medium">
            Inbound coal from DVC captive mines, allocated blocks, and CIL subsidiaries.
          </p>
        </div>
        {/* Registration happens in Supplier Consignments */}
        <button
          onClick={() => onNavigate('supplier-consignments')}
          className="px-5 py-2.5 bg-white border border-primary-indigo text-primary-indigo text-[10px] font-bold label-caps rounded-xl hover:bg-indigo-50 transition-all flex items-center gap-2"
        >
          Register Consignment <ChevronRight size={14} />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Racks',       val: '08',   icon: TrainFront, color: 'text-primary-indigo', bg: 'bg-indigo-50' },
          { label: 'Pending Discharge',  val: '03',   icon: Box,        color: 'text-warning-amber',  bg: 'bg-amber-50' },
          { label: 'Verified Wagons',    val: '432',  icon: ShieldCheck,color: 'text-success-emerald',bg: 'bg-emerald-50' },
          { label: 'Avg GCV (kCal/kg)',  val: '3,840',icon: Activity,   color: 'text-purple-600',     bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-text-slate-400 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-text-slate-900 leading-none">{stat.val}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Inbound Manifest Ledger</h3>
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
              <th className="px-8 py-4">Wagon Number</th>
              <th className="px-8 py-4">Source Mine</th>
              <th className="px-8 py-4">DVC Plant</th>
              <th className="px-8 py-4">ETA / Arrival</th>
              <th className="px-8 py-4">Wagons</th>
              <th className="px-8 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { id: 'RCK-9901-A', origin: 'Bermo Mine / Kargali, Bokaro',    plant: 'Bodor TPS-A',         time: '14:32 (Arrived)',    count: '58', status: 'UNLOADING' },
              { id: 'RCK-9902-B', origin: 'Barjora (North) Block, Bankura',   plant: 'Mejia TPS',           time: '16:00 (Scheduled)',  count: '62', status: 'IN_TRANSIT' },
              { id: 'RCK-9903-X', origin: 'Gondulpara Block, Hazaribagh',     plant: 'Raghunathpur TPS',    time: '18:45 (Delayed)',    count: '54', status: 'QUEUED' },
              { id: 'RCK-9904-L', origin: 'Mandakini-B via CIL, Odisha',      plant: 'Chandrapura TPS',     time: '10:15 (Arrived)',    count: '60', status: 'READY' },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-text-slate-400 group-hover:bg-primary-indigo group-hover:text-white transition-all shadow-sm">
                      <TrainFront size={16} />
                    </div>
                    <span className="data-mono font-bold text-sm text-text-slate-900 leading-none">{row.id}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-sm font-semibold text-text-slate-600">{row.origin}</td>
                <td className="px-8 py-5 text-xs font-bold text-text-slate-700">{row.plant}</td>
                <td className="px-8 py-5 text-xs data-mono text-text-slate-400">{row.time}</td>
                <td className="px-8 py-5 font-bold text-text-slate-700 text-sm">{row.count} <span className="text-[10px] text-text-slate-400 font-normal ml-1 uppercase">Units</span></td>
                <td className="px-8 py-5 text-right">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest ${
                    row.status === 'UNLOADING' ? 'bg-primary-indigo text-white' :
                    row.status === 'READY'     ? 'bg-success-emerald/10 text-success-emerald' :
                    row.status === 'QUEUED'    ? 'bg-warning-amber/10 text-warning-amber' :
                    'bg-slate-100 text-text-slate-400'
                  }`}>
                    {row.status}
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
