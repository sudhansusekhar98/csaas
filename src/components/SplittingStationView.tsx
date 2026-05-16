import { ChevronRight, ShieldCheck, Settings } from 'lucide-react';

export default function SplittingStationView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-text-slate-400 mb-2 text-xs font-bold uppercase tracking-widest">
            <span>Tracking</span>
            <ChevronRight size={14} />
            <span className="text-primary-indigo">SPL-29384</span>
          </div>
          <h1 className="text-4xl font-bold text-text-slate-900 tracking-tight">Splitting Control Station</h1>
        </div>
        <div className="text-right">
           <p className="label-caps mb-1">Parent Aggregate</p>
           <p className="data-mono text-2xl font-bold text-text-slate-900">15.20 <span className="text-sm font-medium text-text-slate-400 uppercase tracking-widest ml-1">kg</span></p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7 space-y-6">
           <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="font-bold text-xl text-text-slate-900 flex items-center gap-3">
                   <span className="w-8 h-8 rounded-xl bg-indigo-50 text-primary-indigo text-xs font-bold flex items-center justify-center">01</span>
                   Parent Seal Integrity
                 </h2>
                 <span className="text-[10px] font-bold text-success-emerald bg-success-emerald/10 px-3 py-1 rounded-full border border-success-emerald/20 uppercase tracking-widest">VMS Link Active</span>
              </div>
              <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                 <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGvsXgqD9o7CA1bxKfbsmEvKkbrdbkKrnP0DFUWtwHgoEIGF11yuJ5xc7aqOlZJcDQLeZokZZMn3m91FbBZk-kngnqygrCI-ZPEqsmoH079AkUYCAYtFmkVEZRZ8Adh0umhSeeW3FQ4iu2wjhKlMx6-LLVwOL5lrzDGRq9-lZxuA_CNeyNFbdgi8Q_p1KUqGS32RgplYuBqeA46z21oaqtJvwJ0uH1qpmI1YN9OM0UUzdKpy-aequJUCnfXKc1NzZ8OcAUGC3eUNBY" className="w-full h-full object-cover opacity-70 mix-blend-soft-light scale-105" alt="CCTV Feed" />
                 <div className="absolute inset-0 border-2 border-primary-indigo/60 m-[15%] rounded shadow-[0_0_20px_rgba(79,70,229,0.3)] pointer-events-none">
                    <div className="absolute -top-6 left-0 bg-primary-indigo text-white text-[10px] px-3 py-1 font-bold uppercase tracking-widest rounded-t shadow-lg">ID_MATCH: 98.4%</div>
                 </div>
                 <div className="absolute bottom-6 left-6 flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-black/60 text-white text-[10px] rounded-lg font-bold backdrop-blur-md border border-white/10 uppercase tracking-widest">CAM-04 Alpha | 14:32:05 UTC</div>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mt-8">
                 <div className="bg-slate-50 p-5 rounded-2xl border border-border-slate group hover:border-primary-indigo transition-colors cursor-default">
                    <p className="label-caps mb-1">OCR Result</p>
                    <p className="data-mono font-bold text-lg text-text-slate-900">SPL-29384</p>
                 </div>
                 <div className="bg-slate-50 p-5 rounded-2xl border border-border-slate group hover:border-primary-indigo transition-colors cursor-default">
                    <p className="label-caps mb-1">Verification</p>
                    <p className="text-sm font-bold text-success-emerald flex items-center gap-1.5 uppercase tracking-wide">
                       <ShieldCheck size={16} /> Seal Intact
                    </p>
                 </div>
              </div>
           </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
           <div className="bg-white border border-border-slate rounded-2xl p-8 shadow-sm flex flex-col h-full bg-gradient-to-b from-white to-slate-50/50">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-bold text-xl text-text-slate-900 flex items-center gap-3">
                   <span className="w-8 h-8 rounded-xl bg-indigo-50 text-primary-indigo text-xs font-bold flex items-center justify-center">02</span>
                   Downstream Logic
                 </h2>
                 <button className="p-2 text-text-slate-400 hover:text-primary-indigo transition-colors"><Settings size={18} /></button>
              </div>
              <div className="space-y-4 flex-1">
                 {[
                   { label: 'Moisture Analysis', id: 'CHLD-M-29384', target: '2.00 kg', status: 'ready' },
                   { label: 'Calorific Value', id: 'CHLD-C-29384', target: '5.00 kg', status: 'ready' },
                   { label: 'Reserve Sample', id: 'CHLD-R-29384', target: '8.20 kg', status: 'pending' },
                 ].map((sample, i) => (
                   <div key={i} className="border border-border-slate p-6 rounded-2xl bg-white hover:border-primary-indigo hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-6">
                         <div>
                            <p className="label-caps text-[9px] mb-1">{sample.label}</p>
                            <p className="data-mono font-bold text-text-slate-900">{sample.id}</p>
                         </div>
                         <div className="text-right">
                             <p className="label-caps text-[9px] mb-1">Quota Target</p>
                             <p className="data-mono font-bold text-text-slate-700">{sample.target}</p>
                         </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                         <span className="text-[10px] font-bold text-text-slate-400 flex items-center gap-1.5 uppercase tracking-widest group-hover:text-primary-indigo transition-colors">
                            <div className={`w-1.5 h-1.5 rounded-full ${sample.status === 'ready' ? 'bg-success-emerald' : 'bg-warning-amber animate-pulse'}`} /> {sample.status}
                         </span>
                         <button className="bg-primary-indigo text-white text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-100 hover:brightness-110 active:scale-95 transition-all">Extract & Tag</button>
                      </div>
                   </div>
                 ))}
              </div>
              <button disabled className="w-full mt-8 py-4 bg-slate-100 text-text-slate-400 font-bold text-sm rounded-xl uppercase tracking-widest cursor-not-allowed border border-border-slate">
                 Finalize Splitting Session
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
