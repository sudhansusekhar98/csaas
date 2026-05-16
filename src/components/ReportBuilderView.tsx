import { FileText, ChevronRight } from 'lucide-react';

export default function ReportBuilderView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
       <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-slate-900 tracking-tight">Compliance Engine</h2>
          <p className="text-sm text-text-slate-500 mt-1">Configure parameters to generate, preview, and export secure audit trails.</p>
        </div>
        <div className="flex gap-2">
           <button className="bg-white border border-border-slate px-5 py-2.5 rounded-xl text-[10px] font-bold label-caps shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"><FileText size={14}/> PDF</button>
           <button className="bg-white border border-border-slate px-5 py-2.5 rounded-xl text-[10px] font-bold label-caps shadow-sm hover:bg-slate-50 transition-all">CSV</button>
           <button className="bg-primary-indigo text-white px-8 py-2.5 rounded-xl text-[10px] font-bold label-caps shadow-lg shadow-indigo-100 hover:brightness-110 transition-all">Generate Ledger</button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8 min-h-[600px]">
        <div className="col-span-12 xl:col-span-3 space-y-6">
           <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold mb-6 text-xs uppercase tracking-widest text-text-slate-900 border-b border-slate-50 pb-4">Data Domain Filters</h3>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="label-caps">Temporal Range</label>
                    <div className="space-y-2">
                       <input type="date" defaultValue="2023-10-01" className="w-full text-xs font-semibold data-mono p-3 bg-slate-50 border border-border-slate rounded-xl outline-none focus:ring-2 focus:ring-primary-indigo transition-all" />
                       <input type="date" defaultValue="2023-10-15" className="w-full text-xs font-semibold data-mono p-3 bg-slate-50 border border-border-slate rounded-xl outline-none focus:ring-2 focus:ring-primary-indigo transition-all" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="label-caps">Production Site</label>
                    <select className="w-full text-xs font-semibold p-3 bg-slate-50 border border-border-slate rounded-xl outline-none focus:ring-2 focus:ring-primary-indigo transition-all"><option>All Mining Collieries</option></select>
                 </div>
                 <div className="space-y-2">
                    <label className="label-caps">Authority Entity</label>
                    <select className="w-full text-xs font-semibold p-3 bg-slate-50 border border-border-slate rounded-xl outline-none focus:ring-2 focus:ring-primary-indigo transition-all"><option>All Handlers</option></select>
                 </div>
                 <div className="space-y-2">
                    <label className="label-caps">Event Class</label>
                    <select className="w-full text-xs font-semibold p-3 bg-slate-50 border border-border-slate rounded-xl outline-none focus:ring-2 focus:ring-primary-indigo transition-all"><option>All System Events</option></select>
                 </div>
              </div>
           </div>

           <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm overflow-hidden">
              <h3 className="font-bold mb-4 text-xs uppercase tracking-widest text-text-slate-900 border-b border-slate-50 pb-4">Automated Delivery</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-text-slate-900 uppercase tracking-wide">Daily Snapshot</span>
                       <span className="text-[9px] text-text-slate-400 font-medium">Auto-export at 00:00 UTC</span>
                    </div>
                    <div className="w-8 h-4 bg-success-emerald rounded-full relative shadow-inner">
                       <div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
                    </div>
                 </div>
                 <button className="w-full py-2.5 bg-slate-50 text-[10px] font-bold text-primary-indigo uppercase tracking-widest border border-primary-indigo/10 rounded-xl hover:bg-indigo-50 transition-all">Add New Schedule</button>
              </div>
           </div>
        </div>

        <div className="col-span-12 xl:col-span-9 bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
           <div className="p-5 border-b border-border-slate bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Ledger Preview <span className="text-text-slate-400 font-medium normal-case ml-2">(TOP 5 RECORDS)</span></h3>
              <div className="flex gap-2">
                 <button className="p-1.5 border border-border-slate rounded-lg hover:bg-white transition-all text-text-slate-400 hover:text-primary-indigo"><ChevronRight className="rotate-180" size={16} /></button>
                 <button className="p-1.5 border border-border-slate rounded-lg hover:bg-white transition-all text-text-slate-400 hover:text-primary-indigo"><ChevronRight size={16} /></button>
              </div>
           </div>
           <div className="flex-1 overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
                 <tr>
                   <th className="px-6 py-4">Timestamp (UTC)</th>
                   <th className="px-6 py-4">Sample Identifier</th>
                   <th className="px-6 py-4">Transaction Class</th>
                   <th className="px-6 py-4">Authority Entity</th>
                   <th className="px-6 py-4 text-right">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 text-xs">
                 {[
                   { t: '23-10-14 08:12:44', s: 'SMP-8821', e: 'WEIGHBRIDGE_ENTRY', h: 'TRUCK-992-ALPHA', st: 'VERIFIED' },
                   { t: '23-10-14 10:15:22', s: 'SMP-8821', e: 'PREP_RECEIPT', h: 'UNKNOWN_HANDOVER', st: 'FLAGGED', alert: true },
                   { t: '23-10-14 11:30:10', s: 'SMP-8822', e: 'WEIGHBRIDGE_ENTRY', h: 'TRUCK-404-BETA', st: 'VERIFIED' },
                 ].map((r, i) => (
                   <tr key={i} className={`hover:bg-slate-50 transition-colors ${r.alert ? 'bg-amber-50/50' : ''}`}>
                      <td className="px-6 py-4 data-mono text-xs text-text-slate-500 font-medium">{r.t}</td>
                      <td className="px-6 py-4 font-bold text-text-slate-900 tracking-tight">{r.s}</td>
                      <td className="px-6 py-4">
                         <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-text-slate-600">{r.e}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-text-slate-700">{r.h}</td>
                      <td className="px-6 py-4 text-right">
                         <span className={`font-bold tracking-widest px-2 py-1 rounded text-[9px] shadow-sm ${r.alert ? 'bg-warning-amber text-white' : 'bg-success-emerald/10 text-success-emerald border border-success-emerald/20'}`}>
                           {r.st}
                         </span>
                      </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           <div className="p-4 bg-slate-50/50 text-[10px] text-text-slate-400 font-bold flex justify-between border-t border-border-slate items-center uppercase tracking-widest px-6">
              <span>Record Index 1-5 of 244 total</span>
              <span className="text-primary-indigo cursor-pointer hover:underline underline-offset-4">Jump to record...</span>
           </div>
        </div>
      </div>
    </div>
  );
}
