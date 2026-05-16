import { Search, ChevronRight } from 'lucide-react';
import ProcessBreadcrumb from './layout/ProcessBreadcrumb';
import type { ViewType } from '../types';

interface LabReceivingViewProps {
  onNavigate: (view: ViewType) => void;
}

export default function LabReceivingView({ onNavigate }: LabReceivingViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProcessBreadcrumb currentStep={5} onNavigate={onNavigate} />
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-slate-900 tracking-tight">Lab Receiving & Authentication</h2>
          <p className="text-text-slate-500 mt-1 text-sm">Verify and log incoming sub-samples from the Division Station.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-5 py-2 bg-primary-indigo text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-100 hover:brightness-110 transition-all">Receive Batch</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
          <p className="label-caps mb-4">Samples in Transit</p>
          <div className="text-4xl font-bold text-text-slate-900">14</div>
        </div>
        <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
          <p className="label-caps mb-4 text-success-emerald">Received Today</p>
          <div className="text-4xl font-bold text-text-slate-900">42</div>
        </div>
        <div className="bg-white border border-warning-amber/30 rounded-2xl p-6 shadow-sm bg-warning-amber/5">
          <p className="label-caps text-warning-amber font-bold mb-4">Flagged Exceptions</p>
          <div className="text-4xl font-bold text-warning-amber">02</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg text-text-slate-900 mb-6">Batch Verification</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-text-slate-400 uppercase tracking-widest mb-2">Scan or Enter ID</label>
                <div className="flex gap-2">
                  <input className="flex-1 bg-slate-50 border border-border-slate rounded-lg px-3 py-2 data-mono text-text-slate-900 focus:ring-2 focus:ring-primary-indigo transition-all outline-none" placeholder="e.g. BTH-9921-X" />
                   <button className="bg-primary-indigo text-white p-2 rounded-lg hover:brightness-110 shadow-md shadow-indigo-100"><Search size={20}/></button>
                </div>
              </div>
              <div className="border-2 border-dashed border-border-slate rounded-xl h-32 flex flex-col items-center justify-center text-text-slate-400 text-sm font-medium">
                <p>Awaiting scanner input...</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
             <h3 className="font-bold text-lg text-text-slate-900 mb-4">Quick Actions</h3>
             <div className="space-y-2">
               <button className="w-full flex items-center justify-between border border-border-slate p-3 rounded-xl text-sm font-semibold text-text-slate-700 hover:border-primary-indigo hover:bg-indigo-50 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-warning-amber" /> Weight Mismatch
                  </div>
                  <ChevronRight size={16} className="text-text-slate-400" />
               </button>
               <button className="w-full flex items-center justify-between border border-border-slate p-3 rounded-xl text-sm font-semibold text-text-slate-700 hover:border-primary-indigo hover:bg-indigo-50 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-indigo" /> Damaged Seal
                  </div>
                  <ChevronRight size={16} className="text-text-slate-400" />
               </button>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Pending Receipts</h3>
            <span className="bg-indigo-50 px-2 py-1 rounded text-[10px] font-bold text-primary-indigo">14 ITEMS</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
              <tr>
                <th className="px-6 py-4">Child ID</th>
                <th className="px-6 py-4">Parent ID</th>
                <th className="px-6 py-4 text-right">Weight</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {[
                 { id: 'CS-M-4412', parent: 'PR-8820', weight: '1.2 kg', status: 'In Transit', type: 'pending' },
                 { id: 'CS-C-4413', parent: 'PR-8820', weight: '0.8 kg', status: 'In Transit', type: 'pending' },
                 { id: 'CS-M-4409', parent: 'PR-8819', weight: '1.0 kg', status: 'Flagged', type: 'alert' },
                 { id: 'CS-C-4410', parent: 'PR-8819', weight: '0.8 kg', status: 'Received', type: 'done' },
               ].map((item, i) => (
                 <tr key={i} className={`hover:bg-slate-50 transition-colors ${item.type === 'alert' ? 'bg-amber-50/50' : ''}`}>
                    <td className="px-6 py-4 data-mono text-sm font-bold text-text-slate-900">{item.id}</td>
                    <td className="px-6 py-4 text-sm text-text-slate-500 font-medium">{item.parent}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-text-slate-700">{item.weight}</td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                         item.type === 'pending' ? 'bg-slate-100 text-text-slate-500' :
                         item.type === 'alert' ? 'bg-warning-amber text-white shadow-sm' :
                         'bg-success-emerald/10 text-success-emerald'
                       }`}>{item.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       {item.type === 'pending' && <button className="text-text-slate-400 hover:text-primary-indigo transition-colors"><ChevronRight size={20}/></button>}
                       {item.type === 'alert' && <button className="text-warning-amber font-bold text-[10px] uppercase tracking-widest hover:underline">Resolve</button>}
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
