import { useState } from 'react';
import {
  Box, Fingerprint, QrCode, Database, Truck, MapPin, ShieldCheck,
  Microscope, SquareSplitVertical, ArrowRight, FlaskConical, Clock, Activity, ChevronRight,
} from 'lucide-react';

export default function SampleTrackingView() {
  const [showSealScanner, setShowSealScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'verified' | 'compromised'>('idle');
  const [scanProgress, setScanProgress] = useState(0);

  const steps = [
    { id: 1, title: 'Sample Collection', desc: 'Track Hopper / Wagon Tippler', icon: Box, status: 'completed' },
    { id: 2, title: 'Identity Capture', desc: 'ID Scan & Face Analytics', icon: Fingerprint, status: 'completed' },
    { id: 3, title: 'Sealing Sequence', desc: 'Tamper-Evident QR Lock', icon: QrCode, status: 'completed' },
    { id: 4, title: 'Parent ID Issuance', desc: 'Registry Entry Logged', icon: Database, status: 'completed' },
    { id: 5, title: 'VMS Path Tracking', desc: 'Approved Logistics Route', icon: Truck, status: 'current' },
    { id: 6, title: 'Prep Room Receipt', desc: 'Face ID + Scan In', icon: MapPin, status: 'pending' },
    { id: 7, title: 'Integrity Verification', desc: 'Visual Seal Audit', icon: ShieldCheck, status: 'pending' },
    { id: 8, title: 'Pulverization', desc: 'CCTV Monitored Grinding', icon: Microscope, status: 'pending' },
    { id: 9, title: 'Splitting Logic', desc: 'Child Sample Generation', icon: SquareSplitVertical, status: 'pending' },
    { id: 10, title: 'ID Linkage', desc: 'Relational Database Sync', icon: Database, status: 'pending' },
    { id: 11, title: 'Lab Dispatch', desc: 'Scanned for Quality Control', icon: ArrowRight, status: 'pending' },
    { id: 12, title: 'Lab Authentication', desc: 'Incoming Verification', icon: FlaskConical, status: 'pending' },
  ];

  const handleSimulateScan = () => {
    setShowSealScanner(true);
    setScanStatus('scanning');
    setScanProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        setScanProgress(100);
        setScanStatus(Math.random() > 0.1 ? 'verified' : 'compromised');
        clearInterval(interval);
      } else {
        setScanProgress(progress);
      }
    }, 200);
  };

  // suppress unused warning — wired up for future scanner modal
  void showSealScanner;
  void scanStatus;
  void scanProgress;
  void handleSimulateScan;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
       <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-text-slate-400 mb-2 text-[10px] font-bold uppercase tracking-widest">
            <span>Operational Continuity</span>
            <ChevronRight size={12} />
            <span className="text-primary-indigo">Live Lifecycle</span>
          </div>
          <h1 className="text-4xl font-bold text-text-slate-900 tracking-tight">End-to-End Tracking</h1>
          <p className="text-text-slate-500 mt-1 font-medium italic">Immutable lifecycle monitoring from extraction to chemical analysis.</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-2.5 bg-white border border-border-slate text-text-slate-900 text-[10px] font-bold label-caps rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
             <QrCode size={16} /> Scan Next Phase
           </button>
           <div className="flex gap-4 p-4 bg-white border border-border-slate rounded-2xl shadow-sm">
           <div className="flex items-center gap-3 pr-4 border-r border-border-slate">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-primary-indigo">
                 <QrCode size={20} />
              </div>
              <div>
                 <p className="label-caps text-[9px] mb-1">Active Parent</p>
                 <p className="data-mono font-bold text-text-slate-900 text-sm">PRNT-8822-X</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div>
                 <p className="label-caps text-[9px] mb-1 text-success-emerald">VMS Security</p>
                 <p className="font-bold text-text-slate-900 text-xs">ENCRYPTED FEED</p>
              </div>
              <div className="w-3 h-3 bg-success-emerald rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
           </div>
        </div>
      </div>
     </header>

      <div className="grid grid-cols-12 gap-10">
         <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-border-slate rounded-3xl p-10 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Activity size={180} />
               </div>

               <h3 className="font-bold text-xs uppercase tracking-widest text-text-slate-900 mb-10 border-b border-slate-50 pb-6 flex items-center gap-2">
                 <Clock size={16} className="text-primary-indigo" /> Process Protocol Stepper
               </h3>

               <div className="relative">
                  <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100" />

                  <div className="space-y-8 relative z-10">
                     {steps.map((step) => (
                       <div key={step.id} className={`flex gap-6 group ${step.status === 'pending' ? 'opacity-40 grayscale' : ''}`}>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all duration-500 shadow-sm ${
                            step.status === 'completed' ? 'bg-success-emerald border-success-emerald text-white' :
                            step.status === 'current' ? 'bg-white border-primary-indigo text-primary-indigo animate-pulse scale-110 shadow-indigo-100 shadow-xl' :
                            'bg-white border-border-slate text-text-slate-300'
                          }`}>
                            <step.icon size={22} />
                          </div>
                          <div className="flex flex-col justify-center">
                             <div className="flex items-center gap-3">
                                <h4 className={`font-bold tracking-tight ${step.status === 'current' ? 'text-text-slate-900 text-lg' : 'text-text-slate-700'}`}>
                                  {step.id}. {step.title}
                                </h4>
                                {step.status === 'completed' && <ShieldCheck size={14} className="text-success-emerald" />}
                             </div>
                             <p className="text-xs text-text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                          </div>
                          {step.status === 'current' && (
                             <div className="ml-auto self-center">
                                <span className="bg-primary-indigo text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-200">Processing...</span>
                             </div>
                          )}
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-white border border-border-slate rounded-3xl p-8 shadow-sm group overflow-hidden relative">
               <div className="relative z-10">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-text-slate-900 mb-8 border-b border-slate-50 pb-4">Biometric Verification</h3>
                  <div className="aspect-video bg-slate-950 rounded-2xl shadow-inner relative overflow-hidden flex items-center justify-center p-6 border-2 border-slate-900 group-hover:border-primary-indigo transition-all duration-500">
                     <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAusVLjgyMEPhqIUohKcNCJckgO8RiFkioBGLbw7X1RNmZLgR-b3pWJCrxb5jc__DN-W-FpQVFVVTXwNChn4pys9-zSb4T_pDAJeWV2ON9T1LDoknY1INqisVnPvxM1oDzDMduWyQs_NviSrjsWgDrU60fK966k2V-iMkSfMGu5FmrBomsTfLVVZB7xO9eiyQdTyrCdpobL-qdOPfUtUjc6_FgzddB2brGRJbnBI5KpJsbHq5_i1ZlQnzg06o-hxykSrzAbLtFyC-gs" className="w-full h-full object-cover opacity-60 mix-blend-overlay grayscale group-hover:grayscale-0 transition-all duration-700" alt="Face Analytics" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-40 h-40 border border-primary-indigo/80 m-4 rounded relative shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                           <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary-indigo" />
                           <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary-indigo" />
                           <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary-indigo" />
                           <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary-indigo" />
                        </div>
                     </div>
                     <div className="absolute bottom-4 right-4 text-[9px] font-bold text-white uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">MATCH: 99.1% (V. Admin)</div>
                  </div>
                  <div className="mt-8 space-y-4">
                     <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-text-slate-400">OPERATOR DESIGNATION</span>
                        <span className="font-bold text-text-slate-900 tracking-tight">LOGISTICS LEAD</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-text-slate-400">ACCESS PROTOCOL</span>
                        <span className="font-bold text-success-emerald uppercase tracking-widest">AUTHORIZED</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-primary-indigo rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between overflow-hidden relative">
               <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full" />
               <div className="relative z-10">
                  <h3 className="font-bold text-xs uppercase tracking-widest opacity-80 mb-6">Chain of Custody Data</h3>
                  <div className="space-y-4">
                     <div>
                        <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Parent Sample ID</p>
                        <p className="data-mono text-lg font-bold">PRNT-8822-X</p>
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Main Bag QR Seal</p>
                        <p className="data-mono text-sm font-bold truncate">QRL-SEC-8822-HY77-1</p>
                     </div>
                  </div>
               </div>
               <button className="w-full mt-10 py-3 bg-white text-primary-indigo text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-lg relative z-10">
                  Generate Forensic Receipt
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
