import { X, FileWarning } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

type NcrStage = 'CONSIGNMENT' | 'COLLECTION' | 'TRANSIT' | 'PREP' | 'DIVISION' | 'LAB';

interface NonConformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage: NcrStage;
  sampleId?: string;
}

const stageLabels: Record<NcrStage, string> = {
  CONSIGNMENT: 'Consignment Receipt',
  COLLECTION: 'Sample Collection',
  TRANSIT: 'In Transit',
  PREP: 'Sample Preparation',
  DIVISION: 'Division Station',
  LAB: 'Lab Receiving',
};

export default function NonConformanceModal({ isOpen, onClose, stage, sampleId }: NonConformanceModalProps) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    setCategory('');
    setDescription('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-border-slate"
          >
            {/* Header */}
            <div className="p-6 border-b border-border-slate bg-amber-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning-amber/10 flex items-center justify-center text-warning-amber">
                  <FileWarning size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-slate-900">Flag Non-Conformance</h2>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-warning-amber bg-warning-amber/10 px-2 py-0.5 rounded">
                    {stageLabels[stage]}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg text-text-slate-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="label-caps">Stage</label>
                  <div className="p-3 bg-slate-50 rounded-xl text-xs font-bold text-text-slate-600 border border-border-slate">
                    {stageLabels[stage]}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="label-caps">Sample ID</label>
                  <input
                    defaultValue={sampleId ?? ''}
                    placeholder="e.g. PRNT-8822-X"
                    className="w-full p-3 bg-slate-50 border border-border-slate rounded-xl text-xs data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="label-caps">NCR Category <span className="text-red-500">*</span></label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 bg-white border border-border-slate rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-indigo outline-none"
                >
                  <option value="">Select category...</option>
                  <option>Seal Integrity Compromised</option>
                  <option>Mass Variance (Exceeds Threshold)</option>
                  <option>Foreign Material Contamination</option>
                  <option>Administrative Error</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="label-caps">Description <span className="text-red-500">*</span></label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the discrepancy for the audit trail..."
                  className="w-full p-3 bg-white border border-border-slate rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-indigo h-28 transition-all font-medium resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border-slate bg-slate-50/50 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-white border border-border-slate rounded-xl text-xs font-bold label-caps hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!category || !description}
                className="flex-1 py-2.5 bg-warning-amber text-white rounded-xl text-xs font-bold label-caps shadow-lg hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit NCR
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
