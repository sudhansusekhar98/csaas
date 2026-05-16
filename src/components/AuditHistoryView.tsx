import { Search, ShieldCheck } from 'lucide-react';

export default function AuditHistoryView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-slate-900 tracking-tight">Chain of Custody</h2>
          <p className="text-sm text-text-slate-500 mt-1">Immutable ledger of industrial transactions and unique sample lifecycle events.</p>
        </div>
        <div className="flex gap-4">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-slate-400 group-hover:text-primary-indigo transition-colors" size={16} />
              <input className="pl-10 pr-4 py-2 bg-white border border-border-slate rounded-xl text-xs font-semibold placeholder:text-text-slate-400 outline-none focus:ring-2 focus:ring-primary-indigo w-64 shadow-sm transition-all" placeholder="Search Parent or Child ID..." />
           </div>
           <button className="bg-primary-indigo text-white px-6 py-2.5 rounded-xl text-[10px] font-bold label-caps shadow-lg shadow-indigo-100 hover:brightness-110 transition-all">Export Immutable Ledger</button>
        </div>
      </header>

      <div className="bg-white border border-border-slate rounded-2xl p-4 flex gap-6 items-center shadow-sm">
        <div className="flex gap-4 items-center">
           <label className="text-[10px] font-bold text-text-slate-400 uppercase tracking-widest">Protocol Filters</label>
           <div className="flex gap-2">
              <input type="date" className="p-2 bg-slate-50 border border-border-slate rounded-xl text-xs font-semibold data-mono outline-none focus:ring-2 focus:ring-primary-indigo transition-all" />
              <input type="date" className="p-2 bg-slate-50 border border-border-slate rounded-xl text-xs font-semibold data-mono outline-none focus:ring-2 focus:ring-primary-indigo transition-all" />
              <select className="p-2 bg-slate-50 border border-border-slate rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-indigo transition-all"><option>Registry Status</option></select>
           </div>
        </div>
      </div>

      <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Ledger Entries</h3>
            <span className="flex items-center gap-2 text-[10px] font-bold text-success-emerald"><ShieldCheck size={14} /> SHA-256 INTEGRITY VERIFIED</span>
          </div>
         <table className="w-full text-left">
           <thead className="bg-surface text-[10px] font-bold text-secondary uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Parent ID</th>
                <th className="px-6 py-4">Date / Time</th>
                <th className="px-6 py-4">Children Generated</th>
                <th className="px-6 py-4">Operator</th>
                <th className="px-6 py-4">Status</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-border-subtle text-xs">
              {[
                { p: 'PRNT-8492-A', dt: '24 Oct, 14:32', ch: ['CHLD-8492-A1', 'CHLD-8492-A2'], op: 'OP-294', st: 'Completed' },
                { p: 'PRNT-8493-B', dt: '24 Oct, 15:10', ch: ['CHLD-8493-B1', 'CHLD-8493-B2 (Alert)'], op: 'OP-112', st: 'Flagged', alert: true },
                { p: 'PRNT-8495-D', dt: '24 Oct, 17:01', ch: ['Processing...'], op: 'OP-301', st: 'Pending' },
              ].map((r, i) => (
                <tr key={i} className={`hover:bg-surface transition-colors ${r.alert ? 'bg-error/5' : ''}`}>
                   <td className="px-6 py-4 data-mono font-bold">{r.p}</td>
                   <td className="px-6 py-4 text-on-surface-variant">{r.dt}</td>
                   <td className="px-6 py-4">
                      <div className="flex gap-1">
                         {r.ch.map((c, j) => (
                           <span key={j} className="bg-surface-container-high px-1.5 py-0.5 rounded text-[9px] data-mono">{c}</span>
                         ))}
                      </div>
                   </td>
                   <td className="px-6 py-4 font-medium">{r.op}</td>
                   <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase ${r.alert ? 'bg-error text-white' : 'bg-secondary/10 text-secondary'}`}>
                        {r.st}
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
