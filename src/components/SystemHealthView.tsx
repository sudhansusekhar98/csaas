import { ShieldCheck } from 'lucide-react';

export default function SystemHealthView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
       <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-text-slate-900 tracking-tight">System Infrastructure</h2>
          <p className="text-sm text-text-slate-500 mt-1">Real-time health telemetry across the industrial network.</p>
        </div>
        <div className="text-right">
           <p className="label-caps mb-1">Network Synchronization</p>
           <p className="data-mono text-sm font-bold text-text-slate-700">14:02:45 UTC</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Camera Connectivity', val: '24/26', sub: '2 Offline at Weighbridge B', type: 'alert' },
          { label: 'Scanner Status', val: '3/4', sub: 'SCN-04 Calibration Error', type: 'error' },
          { label: 'VMS Analytics', val: 'Operational', sub: 'Last Sync: 14:00:00 UTC', type: 'ok' },
          { label: 'Database Health', val: '99.9%', sub: 'Backup: 02:00 AM UTC', type: 'ok' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white border rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-md ${stat.type !== 'ok' ? 'border-warning-amber/50' : 'border-border-slate hover:border-primary-indigo'}`}>
             <div className="flex justify-between items-start mb-4">
                <p className="label-caps text-[9px]">{stat.label}</p>
                <div className={`w-2.5 h-2.5 rounded-full ${stat.type === 'ok' ? 'bg-success-emerald shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-warning-amber animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
             </div>
             <div className="text-3xl font-bold text-text-slate-900">{stat.val}</div>
             <p className={`text-[11px] mt-2 font-semibold ${stat.type !== 'ok' ? 'text-warning-amber' : 'text-text-slate-400'}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
         <div className="px-6 py-4 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Device Detail Registry</h3>
            <button className="text-[10px] font-bold text-primary-indigo uppercase tracking-wider hover:underline">Download Log</button>
         </div>
         <table className="w-full text-left">
           <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
             <tr>
               <th className="px-6 py-4">Device ID</th>
               <th className="px-6 py-4">Hardware Type</th>
               <th className="px-6 py-4">Location</th>
               <th className="px-6 py-4">Status</th>
               <th className="px-6 py-4 text-right">Uptime</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100 text-sm">
             {[
               { id: 'CAM-WB-01', type: 'PTZ Camera', loc: 'Weighbridge A - Entry', status: 'Online', time: '99.8%' },
               { id: 'CAM-WB-03', type: 'PTZ Camera', loc: 'Weighbridge B - Entry', status: 'Offline', time: '--', alert: true },
               { id: 'SCN-04', type: 'Quality Probe', loc: 'Prep Room Alpha', status: 'Error', time: '14.2%', alert: true },
             ].map((row, i) => (
               <tr key={i} className={`hover:bg-slate-50 transition-colors ${row.alert ? 'bg-amber-50/50' : ''}`}>
                 <td className="px-6 py-4 data-mono font-bold text-text-slate-900">{row.id}</td>
                 <td className="px-6 py-4 text-text-slate-500 font-medium">{row.type}</td>
                 <td className="px-6 py-4 text-text-slate-600">{row.loc}</td>
                 <td className="px-6 py-4 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${row.alert ? 'bg-warning-amber text-white' : 'bg-success-emerald/10 text-success-emerald'}`}>{row.status}</span>
                 </td>
                 <td className="px-6 py-4 text-right text-text-slate-400 data-mono text-xs">{row.time}</td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>
    </div>
  );
}
