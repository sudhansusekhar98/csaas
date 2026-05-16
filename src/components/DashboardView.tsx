import { Package, ShieldCheck, BellRing, Plus, Activity } from 'lucide-react';
import type { ExtendedViewType } from '../types';

interface DashboardViewProps {
  setActiveView: (view: ExtendedViewType) => void;
}

export default function DashboardView({ setActiveView }: DashboardViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold text-text-slate-900 tracking-tight">Preparation Overview</h1>
          <p className="text-text-slate-500 mt-1">Industrial Intelligence & Operations Center</p>
        </div>
        <div className="flex gap-2">
          <button style={{ color: '#ffffff' }} className="px-4 py-2 border border-border-slate rounded-xl text-sm font-semibold bg-white hover:bg-slate-50 transition-colors shadow-sm">Export Data</button>
          <button
            onClick={() => setActiveView('consignments')}
            className="px-5 py-2 bg-primary-indigo text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-100 hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Register Consignment
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm group hover:border-primary-indigo transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-primary-indigo">
              <Package size={24} />
            </div>
            <span className="text-text-slate-600 font-semibold uppercase tracking-wider text-xs">Pending Splitting</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-slate-900">24</span>
            <span className="text-text-slate-400 text-sm font-medium">Bags</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-success-emerald font-bold text-xs">
             <span className="px-2 py-0.5 bg-success-emerald/10 rounded">↓ 12.5%</span>
             <span className="text-text-slate-400 font-normal">vs last shift</span>
          </div>
        </div>

        <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm group hover:border-primary-indigo transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-success-emerald">
              <ShieldCheck size={24} />
            </div>
            <span className="text-text-slate-600 font-semibold uppercase tracking-wider text-xs">Samples Prepared</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-slate-900">156</span>
            <span className="text-text-slate-400 text-sm font-medium">Units</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-primary-indigo font-bold text-xs">
             <span className="px-2 py-0.5 bg-indigo-50 rounded">On Target</span>
             <span className="text-text-slate-400 font-normal">Daily quota: 200</span>
          </div>
        </div>

        <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm group hover:border-warning-amber transition-colors">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-warning-amber">
              <BellRing size={24} />
            </div>
            <span className="text-text-slate-600 font-semibold uppercase tracking-wider text-xs">Active Exceptions</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-slate-900">03</span>
            <span className="text-text-slate-400 text-sm font-medium">Critical</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-warning-amber font-bold text-xs">
             <span className="px-2 py-0.5 bg-amber-50 rounded">At Risk</span>
             <span className="text-text-slate-400 font-normal">Response time: 4m</span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
          <h2 className="font-bold text-text-slate-900">Recent Shipments</h2>
          <button className="text-xs font-bold text-primary-indigo hover:underline uppercase tracking-widest transition-all">View All Activity</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
                <th className="px-6 py-4">Sample Identifier</th>
                <th className="px-6 py-4">Site Origin</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Current Phase</th>
                <th className="px-6 py-4 text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { id: 'PB-2023-8891', weight: '25.4kg', source: 'Colliery Alpha', time: '10:45 AM', type: 'normal', phase: 'Prep Received', status: 'In Progress' },
                { id: 'PB-2023-8892', weight: '24.8kg', source: 'Colliery Beta', time: '11:15 AM', type: 'normal', phase: 'In Transit', status: 'Dispatched' },
                { id: 'PB-2023-8893', weight: '26.1kg', source: 'Weighbridge 2', time: '11:30 AM', type: 'normal', phase: 'Wait for Prep', status: 'Queued' },
                { id: 'PB-2023-8894', weight: '--', source: 'Unknown Handler', time: '11:45 AM', type: 'exception', phase: 'Flagged', status: 'Unauthorized' },
              ].map((row) => (
                <tr key={row.id} className={`hover:bg-slate-50 transition-colors ${row.type === 'exception' ? 'bg-amber-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`data-mono font-bold ${row.type === 'exception' ? 'text-warning-amber' : 'text-primary-indigo'}`}>{row.id}</span>
                      <span className="text-[10px] text-text-slate-400">Weight: {row.weight}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-text-slate-700">{row.source}</td>
                  <td className="px-6 py-4 text-xs data-mono text-text-slate-500">{row.time}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-text-slate-900 uppercase tracking-widest">{row.phase}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${row.type === 'exception' ? 'bg-warning-amber text-white' : 'bg-success-emerald/10 text-success-emerald'}`}>
                      {row.status}
                    </span>
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
