import { FileWarning, Activity } from 'lucide-react';

export default function NonConformanceView() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-warning-amber/10 flex items-center justify-center text-warning-amber">
            <FileWarning size={32} />
          </div>
          <h1 className="text-4xl font-bold text-text-slate-900 tracking-tight">Non-Conformance Report (NCR)</h1>
        </div>
        <p className="text-text-slate-500 font-medium text-lg">Report systemic discrepancies discovered during process cycle.</p>
      </header>

      <div className="bg-white border border-border-slate rounded-2xl p-10 shadow-sm">
        <form className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="label-caps">Consignment ID</label>
              <div className="p-4 bg-slate-50 rounded-xl data-mono text-text-slate-900 border border-border-slate font-bold">CSN-2023-8842-A</div>
            </div>
            <div className="space-y-2">
              <label className="label-caps">Reporting Authority</label>
              <div className="p-4 bg-slate-50 rounded-xl data-mono text-text-slate-900 border border-border-slate font-bold">OPR-774 (J. Doe)</div>
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t border-border-slate">
            <label className="label-caps text-text-slate-900">Non-Conformance Category <span className="text-red-500">*</span></label>
            <select className="w-full p-4 bg-white border border-border-slate rounded-xl text-sm text-text-slate-900 focus:ring-2 focus:ring-primary-indigo outline-none transition-all font-semibold">
              <option disabled>Select Non-Conformance Category...</option>
              <option>Seal Integrity Compromised</option>
              <option>Mass Variance (Exceeds Threshold)</option>
              <option>Foreign Material Contamination</option>
              <option>Administrative Error</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="label-caps">Manifested Mass (kg)</label>
              <div className="p-4 bg-slate-50 rounded-xl data-mono text-text-slate-500 border border-border-slate">150.00</div>
            </div>
            <div className="space-y-2">
              <label className="label-caps text-text-slate-900 font-bold">Measured Mass (kg) <span className="text-red-500">*</span></label>
              <input className="w-full p-4 bg-white border-2 border-primary-indigo/30 rounded-xl data-mono outline-none focus:ring-2 focus:ring-primary-indigo transition-all text-lg font-bold" placeholder="0.00" type="number" step="0.01" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="label-caps text-text-slate-900">Incident Documentation <span className="text-red-500">*</span></label>
            <textarea className="w-full p-4 bg-white border border-border-slate rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-indigo h-40 transition-all font-medium" placeholder="Describe the discrepancy in detail for the audit trail..." />
          </div>

          <div className="space-y-2">
            <label className="label-caps text-text-slate-900">Visual Evidence <span className="text-red-500">*</span></label>
            <div className="border-2 border-dashed border-border-slate rounded-2xl p-16 bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 hover:border-primary-indigo transition-all group">
              <Activity className="text-text-slate-400 mb-4 group-hover:text-primary-indigo transition-colors" size={48} />
              <p className="text-sm font-bold text-text-slate-900">Submit Media Assets</p>
              <p className="text-xs text-text-slate-400 mt-2">RAW, JPEG, or MP4 containers (Max 128MB)</p>
            </div>
          </div>

          <div className="pt-10 border-t border-border-slate flex justify-end gap-4">
            <button type="button" className="px-8 py-3 border border-border-slate text-sm font-bold label-caps rounded-xl hover:bg-slate-50 transition-all">Cancel Report</button>
            <button type="button" className="px-10 py-3 bg-primary-indigo text-white text-sm font-bold label-caps rounded-xl shadow-lg shadow-indigo-100 hover:brightness-110 transition-all">Submit NCR</button>
          </div>
        </form>
      </div>
    </div>
  );
}
