import { ShieldCheck, Video, User } from 'lucide-react';

export default function PersonnelManagementView() {
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
        <div className="col-span-12 xl:col-span-8 bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
           <div className="p-5 border-b border-border-slate bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Personnel Registry</h3>
              <div className="flex gap-3">
                 <select className="p-2 px-4 bg-white border border-border-slate rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-primary-indigo"><option>Operational Role</option></select>
                 <select className="p-2 px-4 bg-white border border-border-slate rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-primary-indigo"><option>Authority Status</option></select>
              </div>
           </div>
           <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
                 <tr>
                    <th className="px-6 py-4">Identity / Designation</th>
                    <th className="px-6 py-4">Assigned Protocol</th>
                    <th className="px-6 py-4">Active Logic</th>
                    <th className="px-6 py-4 text-right">Face Metrics</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-text-slate-700">
                 {[
                   { n: 'Marcus Thorne', id: 'USR-8821', r: 'Lead Processor', st: 'Active', fe: 'Enrolled', ok: true },
                   { n: 'Elena Rodriguez', id: 'USR-9044', r: 'Collection Handler', st: 'Active', fe: 'Pending', ok: false },
                   { n: 'David Kim', id: 'USR-7732', r: 'Lab Specialist', st: 'Suspended', fe: 'Revoked', ok: false },
                 ].map((u, i) => (
                   <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                         <p className="font-bold text-sm tracking-tight text-text-slate-900 group-hover:text-primary-indigo transition-colors">{u.n}</p>
                         <p className="data-mono text-[9px] text-text-slate-400 font-bold mt-1">UUID: {u.id}</p>
                      </td>
                      <td className="px-6 py-4"><span className="bg-slate-100 text-text-slate-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase border border-slate-200">{u.r}</span></td>
                      <td className="px-6 py-4 font-bold"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${u.st === 'Active' ? 'bg-success-emerald shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} />{u.st}</div></td>
                      <td className="px-6 py-4 text-right">
                         <span className={`font-bold tracking-widest text-[9px] uppercase inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${u.fe === 'Enrolled' ? 'bg-success-emerald/10 text-success-emerald border-success-emerald/20' : u.fe === 'Pending' ? 'bg-warning-amber/10 text-warning-amber border-warning-amber/20' : 'bg-slate-100 text-text-slate-400 border-slate-200'}`}>
                            {u.fe === 'Enrolled' && <ShieldCheck size={12} />}
                            {u.fe}
                         </span>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>

        <div className="col-span-12 xl:col-span-4 flex flex-col gap-8">
           <div className="bg-white border border-border-slate rounded-2xl p-8 shadow-sm overflow-hidden bg-gradient-to-br from-white to-slate-50/50">
              <h3 className="font-bold text-xs uppercase tracking-widest text-text-slate-900 mb-8 border-b border-slate-100 pb-4 flex items-center gap-2"><Video size={14} className="text-primary-indigo" /> VMS Biometrics</h3>
              <div className="mb-6">
                 <p className="font-bold text-sm text-text-slate-900">Elena Rodriguez</p>
                 <p className="text-text-slate-400 text-[10px] data-mono font-bold mt-1">ID_REF: USR-9044 | HANDLER</p>
              </div>
              <div className="aspect-square bg-slate-950 rounded-3xl border-2 border-dashed border-border-slate flex flex-col items-center justify-center text-center p-8 hover:border-primary-indigo cursor-pointer transition-all relative overflow-hidden group shadow-inner">
                 <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGvsXgqD9o7CA1bxKfbsmEvKkbrdbkKrnP0DFUWtwHgoEIGF11yuJ5xc7aqOlZJcDQLeZokZZMn3m91FbBZk-kngnqygrCI-ZPEqsmoH079AkUYCAYtFmkVEZRZ8Adh0umhSeeW3FQ4iu2wjhKlMx6-LLVwOL5lrzDGRq9-lZxuA_CNeyNFbdgi8Q_p1KUqGS32RgplYuBqeA46z21oaqtJvwJ0uH1qpmI1YN9OM0UUzdKpy-aequJUCnfXKc1NzZ8OcAUGC3eUNBY" className="w-full h-full object-cover mix-blend-overlay scale-110 group-hover:scale-100 transition-transform duration-700" alt="Biometric Scan" />
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
               <button className="w-full mt-8 py-3 bg-white border border-border-slate rounded-xl text-[10px] font-bold label-caps tracking-widest hover:border-primary-indigo hover:text-primary-indigo transition-all shadow-sm">Capture Biometric Basis</button>
           </div>

           <div className="bg-white border border-border-slate rounded-2xl p-8 shadow-sm flex-1 flex flex-col">
              <h3 className="font-bold text-xs uppercase tracking-widest text-text-slate-900 mb-6 border-b border-slate-100 pb-4">Security Permission Matrix</h3>
              <div className="space-y-4 flex-1">
                 {[
                   { label: 'Weighbridge Registry', ok: true },
                   { label: 'Sample Extraction Logic', ok: true },
                   { label: 'Industrial Ledger Write', ok: false },
                   { label: 'System Telemetry Edit', ok: false },
                 ].map((p, i) => (
                   <div key={i} className="flex justify-between items-center text-xs border-b border-slate-50 pb-3">
                      <span className="font-bold text-text-slate-500">{p.label}</span>
                      {p.ok ? <ShieldCheck size={18} className="text-success-emerald" /> : <div className="w-4 h-4 border border-slate-100 rounded" />}
                   </div>
                 ))}
              </div>
              <button className="w-full pt-8 text-[10px] font-bold text-primary-indigo hover:underline uppercase tracking-widest">Override Policy Manifest</button>
           </div>
        </div>
      </div>
    </div>
  );
}
