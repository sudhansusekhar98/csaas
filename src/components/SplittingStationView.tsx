import { useState } from 'react';
import { ChevronRight, ShieldCheck, Settings, ArrowLeft, Plus, Clock, User } from 'lucide-react';
import ProcessBreadcrumb from './layout/ProcessBreadcrumb';
import type { ViewType } from '../types';

interface SplittingStationViewProps {
  onNavigate: (view: ViewType) => void;
}

const sessions = [
  { id: 'SPL-29384', parentId: 'PRNT-8822-X', weight: '15.20 kg', operator: 'OPR-774 (J. Doe)', collectedAt: '14:20 UTC', status: 'IN_PROGRESS' as const },
  { id: 'SPL-29383', parentId: 'PRNT-8820-A', weight: '14.80 kg', operator: 'OPR-312 (R. Kumar)', collectedAt: '13:05 UTC', status: 'AWAITING_SPLIT' as const },
  { id: 'SPL-29382', parentId: 'PRNT-8818-B', weight: '15.60 kg', operator: 'OPR-774 (J. Doe)', collectedAt: '11:30 UTC', status: 'COMPLETED' as const },
];

const statusStyles = {
  IN_PROGRESS: 'bg-primary-indigo text-white',
  AWAITING_SPLIT: 'bg-warning-amber/10 text-warning-amber',
  COMPLETED: 'bg-success-emerald/10 text-success-emerald',
};

export default function SplittingStationView({ onNavigate }: SplittingStationViewProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) ?? null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProcessBreadcrumb currentStep={4} onNavigate={onNavigate} />

      {!selectedSession ? (
        /* ── Session List View ── */
        <>
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl font-bold text-text-slate-900 tracking-tight">Sample Division Station</h1>
              <p className="text-text-slate-500 mt-1 font-medium">Pulverisation and child sample splitting sessions.</p>
            </div>
            <button className="px-6 py-2.5 bg-primary-indigo text-white text-[10px] font-bold label-caps rounded-xl shadow-lg shadow-indigo-100 hover:brightness-110 transition-all flex items-center gap-2 border border-primary-indigo/20">
              <Plus size={16} /> Start New Session
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Active Sessions', val: '1', color: 'text-primary-indigo', bg: 'bg-indigo-50' },
              { label: 'Completed Today', val: '8', color: 'text-success-emerald', bg: 'bg-emerald-50' },
              { label: 'Awaiting Split', val: '1', color: 'text-warning-amber', bg: 'bg-amber-50' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Clock size={20} />
                </div>
                <p className="text-[10px] font-bold text-text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.val}</div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Division Sessions</h3>
              <span className="bg-indigo-50 px-2 py-1 rounded text-[10px] font-bold text-primary-indigo">{sessions.length} SESSIONS</span>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
                <tr>
                  <th className="px-6 py-4">Session ID</th>
                  <th className="px-6 py-4">Parent Sample</th>
                  <th className="px-6 py-4">Weight</th>
                  <th className="px-6 py-4">Operator</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 data-mono font-bold text-sm text-text-slate-900">{session.id}</td>
                    <td className="px-6 py-4 data-mono text-sm text-primary-indigo font-semibold">{session.parentId}</td>
                    <td className="px-6 py-4 text-sm font-bold text-text-slate-700">{session.weight}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-text-slate-600">
                        <User size={14} className="text-text-slate-400" /> {session.operator}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest ${statusStyles[session.status]}`}>
                        {session.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {session.status !== 'COMPLETED' && (
                        <button
                          onClick={() => setSelectedSessionId(session.id)}
                          className="flex items-center gap-1 ml-auto text-[10px] font-bold text-primary-indigo hover:underline uppercase tracking-widest"
                        >
                          Open Session <ChevronRight size={12} />
                        </button>
                      )}
                      {session.status === 'COMPLETED' && (
                        <span className="text-[10px] text-text-slate-300 font-bold uppercase">Complete</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* ── Session Detail View ── */
        <>
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <button
                onClick={() => setSelectedSessionId(null)}
                className="flex items-center gap-2 text-text-slate-500 hover:text-primary-indigo transition-colors text-sm font-bold mb-3"
              >
                <ArrowLeft size={16} /> All Sessions
              </button>
              <div className="flex items-center gap-2 text-text-slate-400 mb-2 text-xs font-bold uppercase tracking-widest">
                <span>Division</span>
                <ChevronRight size={12} />
                <span className="text-primary-indigo">{selectedSession.id}</span>
              </div>
              <h1 className="text-4xl font-bold text-text-slate-900 tracking-tight">Sample Division Station</h1>
            </div>
            <div className="text-right">
              <p className="label-caps mb-1">Parent Aggregate</p>
              <p className="data-mono text-2xl font-bold text-text-slate-900">{selectedSession.weight} <span className="text-sm font-medium text-text-slate-400 uppercase tracking-widest ml-1"></span></p>
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
                    <p className="data-mono font-bold text-lg text-text-slate-900">{selectedSession.id}</p>
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
                    Sub-Sample Generation
                  </h2>
                  <button className="p-2 text-text-slate-400 hover:text-primary-indigo transition-colors"><Settings size={18} /></button>
                </div>
                <div className="space-y-4 flex-1">
                  {[
                    { label: 'Moisture Analysis', id: `CHLD-M-${selectedSession.id.split('-')[1]}`, target: '2.00 kg', status: 'ready' as const },
                    { label: 'Calorific Value', id: `CHLD-C-${selectedSession.id.split('-')[1]}`, target: '5.00 kg', status: 'ready' as const },
                    { label: 'Reserve Sample', id: `CHLD-R-${selectedSession.id.split('-')[1]}`, target: '8.20 kg', status: 'pending' as const },
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
                  Finalise Division Session
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
