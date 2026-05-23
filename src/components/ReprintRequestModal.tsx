import { useState } from 'react';
import { X, PrinterCheck } from 'lucide-react';
import type { ReprintRequest, ReprintReason, QrCodeType } from '../types';

const REPRINT_REASONS: ReprintReason[] = [
  'Label damaged',
  'Scan failure',
  'QR code faded',
  'Seal mismatch',
  'Lost/misplaced',
  'Other',
];

interface ReprintRequestModalProps {
  sampleId: string;
  qrType: QrCodeType;
  requestedBy: string;
  onSubmit: (req: ReprintRequest) => void;
  onClose: () => void;
}

export default function ReprintRequestModal({ sampleId, qrType, requestedBy, onSubmit, onClose }: ReprintRequestModalProps) {
  const [reason, setReason] = useState<ReprintReason | ''>('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!reason) return;
    const req: ReprintRequest = {
      id: `REQ-${Date.now()}`,
      sampleId,
      qrType,
      reason: reason as ReprintReason,
      notes: notes.trim() || undefined,
      requestedBy,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    onSubmit(req);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-indigo/10 flex items-center justify-center">
              <PrinterCheck size={18} className="text-primary-indigo" />
            </div>
            <div>
              <h3 className="font-bold text-text-slate-900">Request QR Reprint</h3>
              <p className="text-[10px] text-text-slate-400 font-medium uppercase tracking-widest">{qrType === 'parent' ? 'Parent QR' : 'Child Bag QR'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label-caps mb-1.5 block">Sample ID</label>
            <div className="px-3 py-2.5 bg-slate-50 border border-border-slate rounded-xl text-sm data-mono font-bold text-text-slate-500">{sampleId}</div>
          </div>

          <div>
            <label className="label-caps mb-1.5 block">Reason for Reprint *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReprintReason)}
              className="w-full bg-slate-50 border border-border-slate rounded-xl p-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary-indigo outline-none"
            >
              <option value="">Select reason...</option>
              {REPRINT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {reason === 'Other' && (
            <div>
              <label className="label-caps mb-1.5 block">Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Describe the issue..."
                className="w-full bg-slate-50 border border-border-slate rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary-indigo outline-none resize-none"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border-slate text-sm font-semibold text-text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!reason}
              className="flex-1 py-2.5 rounded-xl bg-primary-indigo text-white text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
