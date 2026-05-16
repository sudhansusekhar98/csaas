import { useState } from 'react';
import { Plus, X, TrainFront, Box, ShieldCheck, Activity, Search, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ProcessBreadcrumb from './layout/ProcessBreadcrumb';
import type { ViewType } from '../types';

interface ConsignmentsViewProps {
  onNavigate: (view: ViewType) => void;
}

export default function ConsignmentsView({ onNavigate }: ConsignmentsViewProps) {
  const [showNewConsignment, setShowNewConsignment] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProcessBreadcrumb currentStep={1} onNavigate={onNavigate} />
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold text-text-slate-900 tracking-tight">Bulk Consignments</h1>
          <p className="text-text-slate-500 mt-1 font-medium">Register and monitor inbound coal consignments.</p>
        </div>
        <div className="flex gap-3">
           <button
             onClick={() => setShowNewConsignment(true)}
             className="px-6 py-2.5 bg-primary-indigo text-white text-[10px] font-bold label-caps rounded-xl shadow-lg shadow-indigo-100 hover:brightness-110 transition-all flex items-center gap-2 border border-primary-indigo/20"
           >
             <Plus size={16} /> Register New Consignment
           </button>
        </div>
      </header>

      <AnimatePresence>
        {showNewConsignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewConsignment(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-border-slate flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-border-slate bg-slate-50/50 flex justify-between items-center shrink-0">
                <div>
                   <h2 className="text-xl font-bold text-text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <TrainFront size={20} className="text-primary-indigo" /> Register Dispatch Advice
                   </h2>
                   <p className="text-[10px] text-text-slate-400 font-bold uppercase tracking-widest mt-1">Official Entry Ledger Protocol</p>
                </div>
                <button
                  onClick={() => setShowNewConsignment(false)}
                  className="p-2 hover:bg-slate-200 rounded-lg text-text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                {/* Source Details */}
                <section className="space-y-6">
                  <h3 className="font-bold text-[10px] text-text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Shipment Source Details</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label-caps">CIL Subsidiary</label>
                      <select className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none">
                        <option>MCL (Mahanadi Coalfields)</option>
                        <option>NCL (Northern Coalfields)</option>
                        <option>ECL (Eastern Coalfields)</option>
                        <option>SECL (South Eastern Coalfields)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="label-caps">Source Mine (Colliery)</label>
                      <input type="text" placeholder="Enter Mine Designation" className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none placeholder:text-slate-300" />
                    </div>
                  </div>
                </section>

                {/* Quality Specifications */}
                <section className="space-y-6">
                   <h3 className="font-bold text-[10px] text-text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Quality Specifications</h3>
                   <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label-caps">Declared Grade</label>
                      <select className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none">
                        <option>Grade G9</option>
                        <option>Grade G10</option>
                        <option>Grade G11</option>
                        <option>Grade G12</option>
                        <option>Grade G13</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="label-caps">Declared GCV (kCal/kg)</label>
                      <input type="number" defaultValue={4200} className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none data-mono" />
                    </div>
                  </div>
                </section>

                {/* Transport Details */}
                <section className="space-y-6">
                   <h3 className="font-bold text-[10px] text-text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Logistics Manifest</h3>
                   <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label-caps">Rack ID / Number</label>
                      <input type="text" placeholder="RCK-XXXX-X" className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none data-mono placeholder:text-slate-300" />
                    </div>
                    <div className="space-y-2">
                      <label className="label-caps">Total Wagon Count</label>
                      <input type="number" defaultValue={58} className="w-full bg-slate-50 border border-border-slate rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none data-mono" />
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-8 border-t border-border-slate bg-slate-50/50 flex gap-4 shrink-0">
                <button
                  onClick={() => setShowNewConsignment(false)}
                  className="flex-1 py-3 bg-white border border-border-slate rounded-xl text-[10px] font-bold label-caps hover:bg-slate-100 transition-all uppercase tracking-widest"
                >
                  Cancel Entry
                </button>
                <button
                  onClick={() => setShowNewConsignment(false)}
                  className="flex-1 py-3 bg-primary-indigo text-white rounded-xl text-[10px] font-bold label-caps shadow-lg shadow-indigo-100 hover:brightness-110 transition-all uppercase tracking-widest"
                >
                  Finalize Registry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Racks', val: '08', icon: TrainFront, color: 'text-primary-indigo', bg: 'bg-indigo-50' },
          { label: 'Pending Discharge', val: '03', icon: Box, color: 'text-warning-amber', bg: 'bg-amber-50' },
          { label: 'Verified Wagons', val: '432', icon: ShieldCheck, color: 'text-success-emerald', bg: 'bg-emerald-50' },
          { label: 'Avg Quality (GCV)', val: '4200', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
               <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                 <stat.icon size={20} />
               </div>
               <span className="text-[10px] font-bold text-text-slate-400 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-text-slate-900 leading-none">{stat.val}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Inbound Manifest Ledger</h3>
              <p className="text-[10px] text-text-slate-400 font-medium mt-0.5">Real-time synchronization with CIL Subsidiary databases.</p>
            </div>
            <div className="flex gap-3">
               <button
                 onClick={() => setShowNewConsignment(true)}
                 className="flex items-center gap-2 px-4 py-1.5 bg-white border border-border-slate rounded-lg text-[10px] font-bold text-text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
               >
                 <Plus size={14} /> Add Shipment
               </button>
               <div className="w-px h-6 bg-slate-200 mx-1" />
               <button className="p-2 hover:bg-slate-100 rounded-lg text-text-slate-400 transition-colors"><Search size={16}/></button>
               <button className="p-2 hover:bg-slate-100 rounded-lg text-text-slate-400 transition-colors"><Settings size={16}/></button>
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
              <tr>
                <th className="px-8 py-4">Rack ID</th>
                <th className="px-8 py-4">Colliery Origin</th>
                <th className="px-8 py-4">ETA / Arrival</th>
                <th className="px-8 py-4">Wagon Count</th>
                <th className="px-8 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { id: 'RCK-9901-A', origin: 'Alpha-1 Mining Complex', time: '14:32 (Arrived)', count: '58', status: 'UNLOADING' },
                { id: 'RCK-9902-B', origin: 'Beta Sector Colliery', time: '16:00 (Scheduled)', count: '62', status: 'IN_TRANSIT' },
                { id: 'RCK-9903-X', origin: 'Central Basin Yard', time: '18:45 (Delayed)', count: '54', status: 'QUEUED' },
                { id: 'RCK-9904-L', origin: 'South Point Depot', time: '10:15 (Arrived)', count: '60', status: 'READY' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-text-slate-400 group-hover:bg-primary-indigo group-hover:text-white transition-all shadow-sm">
                         <TrainFront size={16} />
                       </div>
                       <span className="data-mono font-bold text-sm text-text-slate-900 leading-none">{row.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-semibold text-text-slate-600">{row.origin}</td>
                  <td className="px-8 py-5 text-xs data-mono text-text-slate-400">{row.time}</td>
                  <td className="px-8 py-5 font-bold text-text-slate-700 text-sm">{row.count} <span className="text-[10px] text-text-slate-400 font-normal ml-1 uppercase">Units</span></td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest ${
                      row.status === 'UNLOADING' ? 'bg-primary-indigo text-white' :
                      row.status === 'READY' ? 'bg-success-emerald/10 text-success-emerald' :
                      row.status === 'QUEUED' ? 'bg-warning-amber/10 text-warning-amber' :
                      'bg-slate-100 text-text-slate-400'
                    }`}>
                      {row.status}
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
