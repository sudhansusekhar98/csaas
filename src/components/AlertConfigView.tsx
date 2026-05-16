import { Scale, ShieldAlert, ToggleRight, Edit2, UserPlus, Clock, Activity } from 'lucide-react';

export default function AlertConfigView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-border-slate pb-6" id="alert-config-header">
        <div>
          <h1 className="text-4xl font-bold text-text-slate-900 tracking-tight">Parametric Logic Gates</h1>
          <p className="text-sm text-text-slate-500 mt-1 font-medium">Define industrial exception thresholds and systemic escalation pathways.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 border border-border-slate text-text-slate-900 font-bold label-caps rounded-xl hover:bg-slate-50 transition-all">Discard Changes</button>
          <button className="px-10 py-3 bg-primary-indigo text-white font-bold label-caps rounded-xl shadow-lg shadow-indigo-100 hover:brightness-110 transition-all">Synchronize Logic</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           <h3 className="font-bold text-xs uppercase tracking-widest text-text-slate-900 border-b border-slate-50 pb-4">Active Decision Matrix</h3>

           {[
             { title: 'Mass Discrepancy Protocol', icon: Scale, desc: 'Variance threshold trigger at weighbridge vs colliery manifest.', severity: 'STRICT', threshold: '15' },
             { title: 'RFID Seal Integrity', icon: ShieldAlert, desc: 'Consignment tracking compromised or tampered en route.', severity: 'CRITICAL', threshold: '0' },
           ].map((rule, i) => (
             <div key={i} className="bg-white border border-border-slate rounded-2xl p-8 shadow-sm group hover:border-primary-indigo hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-8">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary-indigo group-hover:bg-primary-indigo group-hover:text-white transition-all shadow-inner">
                         <rule.icon size={28} />
                      </div>
                      <div>
                         <h4 className="font-bold text-lg text-text-slate-900 leading-tight group-hover:text-primary-indigo transition-colors">{rule.title}</h4>
                         <p className="text-xs text-text-slate-400 font-medium mt-1 leading-relaxed">{rule.desc}</p>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-3">
                      <span className="px-3 py-1 bg-warning-amber text-white shadow-sm rounded-lg text-[10px] font-bold uppercase tracking-widest">{rule.severity}</span>
                      <ToggleRight className="text-success-emerald cursor-pointer hover:brightness-90 active:scale-95 transition-all" size={36} />
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-border-slate shadow-inner transform group-hover:bg-white transition-all">
                   <div className="space-y-2">
                      <label className="label-caps">Tolerance Threshold</label>
                      <input type="number" defaultValue={rule.threshold} className="w-full bg-white border border-border-slate rounded-xl p-3 text-xs data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="label-caps">Classification</label>
                      <select className="w-full bg-white border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none transition-all"><option>Strict Compliance</option><option>Informational</option></select>
                   </div>
                   <div className="space-y-2">
                      <label className="label-caps">Escalation Target</label>
                      <select className="w-full bg-white border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none transition-all"><option>Shift Lead</option><option>Site Director</option></select>
                   </div>
                </div>
             </div>
           ))}
        </div>

        <div className="space-y-8 flex flex-col h-full">
           <div className="bg-white border border-border-slate rounded-2xl p-8 shadow-sm">
             <h3 className="font-bold text-xs uppercase tracking-widest text-text-slate-900 mb-6 border-b border-slate-50 pb-4">Engine Telemetry</h3>
             <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-border-slate shadow-inner">
                <div className="w-3 h-3 rounded-full bg-success-emerald animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                <p className="text-[10px] font-bold text-text-slate-900 uppercase tracking-widest">Logic Engine Online</p>
                <span className="ml-auto data-mono text-xs font-bold text-primary-indigo bg-white px-3 py-1 rounded-lg border border-border-slate shadow-sm">12 GATES</span>
             </div>
           </div>

           <div className="bg-white border border-border-slate rounded-2xl p-8 shadow-sm flex-1 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-xs uppercase tracking-widest text-text-slate-500 mb-8 border-b border-slate-50 pb-4">Transactional Log</h3>
                <div className="space-y-6 overflow-y-auto max-h-[350px] pr-2 scrollbar-hide">
                   {[
                     { user: 'Marcus Thorne', action: 'Modified Threshold: Weight Mismatch', time: '14:32:01 UTC', icon: Edit2 },
                     { user: 'SYS_DAEMON', action: 'Disabled: Idle_Gate (Maintenance)', time: '09:00:00 UTC', icon: ToggleRight },
                     { user: 'Lead Admin Vance', action: 'Added Site Director to RFID Targets', time: '16:15:44 UTC', icon: UserPlus },
                   ].map((log, i) => (
                     <div key={i} className="flex gap-4 items-start border-b border-slate-50 pb-6 last:border-0">
                        <div className="mt-1 text-primary-indigo p-1.5 bg-indigo-50 rounded-lg group-hover:bg-primary-indigo group-hover:text-white transition-all"><log.icon size={16} /></div>
                        <div>
                           <p className="text-xs text-text-slate-900 leading-relaxed font-medium"><strong>{log.user}</strong> <span className="text-text-slate-400">{log.action}</span></p>
                           <p className="text-[10px] data-mono text-text-slate-500 mt-2 font-bold flex items-center gap-1.5"><Clock size={10}/>{log.time}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
              <button className="w-full mt-10 py-3 bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all border border-slate-100">Audit Protocol History</button>
           </div>
        </div>
      </div>
    </div>
  );
}
