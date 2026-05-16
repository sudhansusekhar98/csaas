import { Package, ShieldCheck, BellRing, Plus, ArrowRight, ChevronRight } from 'lucide-react';
import type { ViewType } from '../types';

interface DashboardViewProps {
  setActiveView: (view: ViewType) => void;
}

const pipelineStages: { label: string; sublabel: string; count: number; view: ViewType; color: string; bg: string }[] = [
  { label: 'Consignments', sublabel: 'Inbound racks', count: 8, view: 'consignments', color: 'text-primary-indigo', bg: 'bg-indigo-50 hover:bg-indigo-100' },
  { label: 'In Preparation', sublabel: 'Pulverisation queue', count: 14, view: 'tracking', color: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100' },
  { label: 'Division Station', sublabel: 'Active sessions', count: 3, view: 'division-station', color: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100' },
  { label: 'Lab Queue', sublabel: 'Awaiting receipt', count: 6, view: 'lab-receiving', color: 'text-teal-600', bg: 'bg-teal-50 hover:bg-teal-100' },
  { label: 'Completed', sublabel: 'Today\'s throughput', count: 42, view: 'audit', color: 'text-success-emerald', bg: 'bg-emerald-50 hover:bg-emerald-100' },
];

const activeNcrs = [
  { id: 'NCR-2024-031', stage: 'DIVISION', category: 'Seal Integrity Compromised', reportedAt: '11:42 AM', status: 'OPEN' },
  { id: 'NCR-2024-030', stage: 'TRANSIT', category: 'Mass Variance', reportedAt: '09:15 AM', status: 'UNDER REVIEW' },
  { id: 'NCR-2024-029', stage: 'LAB', category: 'Administrative Error', reportedAt: 'Yesterday', status: 'OPEN' },
];

export default function DashboardView({ setActiveView }: DashboardViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold text-text-slate-900 tracking-tight">Live Pipeline</h1>
          <p className="text-text-slate-500 mt-1">Shift status across the full chain of custody</p>
        </div>
        <button
          onClick={() => setActiveView('consignments')}
          className="px-5 py-2 bg-primary-indigo text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-100 hover:brightness-110 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Register Consignment
        </button>
      </header>

      {/* Pipeline Status Bar */}
      <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
        <p className="text-[10px] font-bold text-text-slate-400 uppercase tracking-widest mb-5">Pipeline Status — Current Shift</p>
        <div className="flex items-stretch gap-2 flex-wrap lg:flex-nowrap">
          {pipelineStages.map((stage, idx) => (
            <div key={stage.view} className="flex items-center gap-2 flex-1 min-w-[140px]">
              <button
                onClick={() => setActiveView(stage.view)}
                className={`flex-1 ${stage.bg} rounded-2xl p-5 text-left transition-all cursor-pointer border border-transparent hover:border-slate-200 group`}
              >
                <div className={`text-3xl font-bold ${stage.color} leading-none mb-2`}>{stage.count}</div>
                <div className="text-xs font-bold text-text-slate-900">{stage.label}</div>
                <div className="text-[10px] text-text-slate-400 mt-0.5">{stage.sublabel}</div>
              </button>
              {idx < pipelineStages.length - 1 && (
                <ArrowRight size={18} className="text-slate-200 shrink-0 hidden lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom grid: NCRs + Throughput */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Active NCRs */}
        <div className="lg:col-span-2 bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <BellRing size={16} className="text-warning-amber" />
              <h2 className="font-bold text-text-slate-900 text-sm">Active Non-Conformances</h2>
              <span className="bg-warning-amber/10 text-warning-amber text-[10px] font-bold px-2 py-0.5 rounded-full">{activeNcrs.length} OPEN</span>
            </div>
            <button
              onClick={() => setActiveView('non-conformance')}
              className="text-xs font-bold text-primary-indigo hover:underline uppercase tracking-widest transition-all flex items-center gap-1"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
                <th className="px-6 py-3">NCR ID</th>
                <th className="px-6 py-3">Stage</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeNcrs.map((ncr) => (
                <tr key={ncr.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 data-mono text-sm font-bold text-warning-amber">{ncr.id}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-text-slate-600 px-2 py-0.5 rounded">{ncr.stage}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-text-slate-600">{ncr.category}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                      ncr.status === 'OPEN' ? 'bg-warning-amber text-white' : 'bg-slate-100 text-text-slate-600'
                    }`}>{ncr.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Today's Throughput */}
        <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-success-emerald">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xs font-bold text-text-slate-600 uppercase tracking-wider">Today's Throughput</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-5xl font-bold text-text-slate-900">42</span>
              <span className="text-text-slate-400 text-sm font-medium">samples</span>
            </div>
            <p className="text-xs text-text-slate-400 font-medium mb-6">Daily quota: 200 samples</p>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
              <div className="bg-success-emerald h-2.5 rounded-full transition-all" style={{ width: '21%' }} />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-text-slate-400 uppercase tracking-widest">
              <span>21% complete</span>
              <span>Shift ends 18:00</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border-slate">
            <div className="flex items-center gap-3">
              <Package size={16} className="text-primary-indigo" />
              <span className="text-xs font-bold text-text-slate-600">Consignment batches today</span>
              <span className="ml-auto font-bold text-text-slate-900">6</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
