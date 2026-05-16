import { FileWarning, Activity } from 'lucide-react';

export default function NonConformanceView() {
  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-border-slate rounded-xl shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-slate">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning-amber/10 flex items-center justify-center text-warning-amber shrink-0">
              <FileWarning size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-text-slate-900 tracking-tight">
                Non-Conformance Report (NCR)
              </h1>

              <p className="text-sm text-text-slate-500 mt-0.5">
                Report systemic discrepancies discovered during process cycle.
              </p>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <form className="grid grid-cols-12 min-h-[650px]">
          
          {/* LEFT PANEL */}
          <div className="col-span-12 lg:col-span-7 p-6 border-r border-border-slate space-y-5">
            
            {/* Top Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label-caps">
                  Consignment ID
                </label>

                <div className="px-3 py-2.5 bg-slate-50 rounded-lg border border-border-slate data-mono font-semibold text-text-slate-900">
                  CSN-2023-8842-A
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label-caps">
                  Reporting Authority
                </label>

                <div className="px-3 py-2.5 bg-slate-50 rounded-lg border border-border-slate data-mono font-semibold text-text-slate-900">
                  OPR-774 (J. Doe)
                </div>
              </div>
            </div>

            {/* NCR Category */}
            <div className="space-y-1.5">
              <label className="label-caps text-text-slate-900">
                Non-Conformance Category{' '}
                <span className="text-red-500">*</span>
              </label>

              <select className="w-full h-10 px-3 bg-white border border-border-slate rounded-lg text-sm text-text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary-indigo/20 focus:border-primary-indigo transition-all">
                <option disabled selected>
                  Select Non-Conformance Category...
                </option>

                <option>Seal Integrity Compromised</option>
                <option>Mass Variance (Exceeds Threshold)</option>
                <option>Foreign Material Contamination</option>
                <option>Administrative Error</option>
              </select>
            </div>

            {/* Weight Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label-caps">
                  Manifested Mass (kg)
                </label>

                <div className="h-10 px-3 flex items-center bg-slate-50 rounded-lg border border-border-slate data-mono text-text-slate-500">
                  150.00
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label-caps text-text-slate-900">
                  Measured Mass (kg){' '}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full h-10 px-3 bg-white border border-primary-indigo/30 rounded-lg data-mono font-semibold text-text-slate-900 outline-none focus:ring-2 focus:ring-primary-indigo/20 focus:border-primary-indigo transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 flex-1">
              <label className="label-caps text-text-slate-900">
                Incident Documentation{' '}
                <span className="text-red-500">*</span>
              </label>

              <textarea
                placeholder="Describe the discrepancy in detail for the audit trail..."
                className="w-full h-[220px] px-3 py-3 bg-white border border-border-slate rounded-lg text-sm text-text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary-indigo/20 focus:border-primary-indigo transition-all resize-none"
              />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="col-span-12 lg:col-span-5 p-6 flex flex-col">
            
            {/* Upload */}
            <div className="space-y-1.5 flex-1">
              <label className="label-caps text-text-slate-900">
                Visual Evidence{' '}
                <span className="text-red-500">*</span>
              </label>

              <div className="h-full min-h-[420px] border-2 border-dashed border-border-slate rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 hover:border-primary-indigo transition-all group">
                <Activity
                  className="text-text-slate-400 mb-3 group-hover:text-primary-indigo transition-colors"
                  size={34}
                />

                <p className="text-sm font-semibold text-text-slate-900">
                  Submit Media Assets
                </p>

                <p className="text-xs text-text-slate-400 mt-1 px-6">
                  RAW, JPEG, or MP4 containers (Max 128MB)
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-5 mt-5 border-t border-border-slate flex justify-end gap-3">
              <button
                type="button"
                className="h-10 px-5 border border-border-slate rounded-lg text-xs font-bold uppercase tracking-[0.12em] text-text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel Report
              </button>

              <button
                type="button"
                className="h-10 px-6 bg-primary-indigo text-white rounded-lg text-xs font-bold uppercase tracking-[0.12em] shadow-sm hover:brightness-110 transition-all"
              >
                Submit NCR
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}