import { useState } from 'react';
import { Search, ChevronRight, CheckCircle2 } from 'lucide-react';
import ProcessBreadcrumb from './layout/ProcessBreadcrumb';
import type { ViewType } from '../types';

const LAB_RECEIVERS = ['S. Reddy (OPR-956)', 'K. Nair (OPR-901)', 'R. Iyer (OPR-802)'];

// T016: PendingItem interface
interface PendingItem {
  id: string;
  parent: string;
  weight: string;
  status: string;
  type: 'pending' | 'alert' | 'done';
}

interface LabReceivingViewProps {
  onNavigate: (view: ViewType) => void;
}

export default function LabReceivingView({ onNavigate: _onNavigate }: LabReceivingViewProps) {
  const [receiptRecord, setReceiptRecord] = useState({
    receiver: '',
    acceptanceStatus: '' as '' | 'accepted' | 'conditional' | 'rejected',
    visualCondition: '' as '' | 'intact' | 'seal-damaged' | 'label-damaged',
  });

  // T016: pending items moved to state
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([
    { id: 'SUB-M-8820-A', parent: 'PRNT-8820-A', weight: '1.2 kg', status: 'In Transit', type: 'pending' },
    { id: 'SUB-C-8820-A', parent: 'PRNT-8820-A', weight: '0.8 kg', status: 'In Transit', type: 'pending' },
    { id: 'SUB-M-8819-X', parent: 'PRNT-8819-X', weight: '1.0 kg', status: 'Flagged',    type: 'alert'   },
    { id: 'SUB-C-8819-X', parent: 'PRNT-8819-X', weight: '0.8 kg', status: 'Received',   type: 'done'    },
  ]);

  // T18: success banner state
  const [showSuccess, setShowSuccess] = useState(false);

  const receiptTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' UTC';

  // T17: canConfirm gate
  const canConfirm = !!(
    receiptRecord.receiver &&
    receiptRecord.acceptanceStatus &&
    receiptRecord.visualCondition
  );

  // T19: confirm receipt handler
  const handleConfirmReceipt = () => {
    setPendingItems((prev) => {
      const firstPendingIdx = prev.findIndex((item) => item.type === 'pending');
      if (firstPendingIdx === -1) return prev;
      const updated = [...prev];
      updated[firstPendingIdx] = { ...updated[firstPendingIdx], type: 'done', status: 'Received' };
      return updated;
    });
    setReceiptRecord({ receiver: '', acceptanceStatus: '', visualCondition: '' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const pendingCount = pendingItems.filter((i) => i.type === 'pending').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProcessBreadcrumb currentStep={5} onNavigate={_onNavigate} />
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-slate-900 tracking-tight">Lab Receiving & Authentication</h2>
          <p className="text-text-slate-500 mt-1 text-sm">Verify and log incoming sub-samples from the Division Station.</p>
        </div>
        <div className="flex gap-2">
          {/* T20: renamed + gated Confirm Receipt button */}
          <button
            onClick={handleConfirmReceipt}
            disabled={!canConfirm}
            className="px-5 py-2 bg-primary-indigo text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-100 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Confirm Receipt
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
          <p className="label-caps mb-4">Samples in Transit</p>
          <div className="text-4xl font-bold text-text-slate-900">{pendingCount}</div>
        </div>
        <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
          <p className="label-caps mb-4 text-success-emerald">Received Today</p>
          <div className="text-4xl font-bold text-text-slate-900">
            {pendingItems.filter((i) => i.type === 'done').length}
          </div>
        </div>
        <div className="bg-white border border-warning-amber/30 rounded-2xl p-6 shadow-sm bg-warning-amber/5">
          <p className="label-caps text-warning-amber font-bold mb-4">Flagged Exceptions</p>
          <div className="text-4xl font-bold text-warning-amber">
            {String(pendingItems.filter((i) => i.type === 'alert').length).padStart(2, '0')}
          </div>
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
              <div className="border-2 border-dashed border-border-slate rounded-xl h-28 flex flex-col items-center justify-center text-text-slate-400 text-sm font-medium">
                <p>Awaiting scanner input...</p>
              </div>

              {/* Receipt Record */}
              <div className="pt-4 border-t border-border-slate space-y-3">
                <p className="text-[10px] font-bold text-primary-indigo uppercase tracking-widest">Receipt Record</p>
                <div className="space-y-1.5">
                  <label className="label-caps">Lab Receiver</label>
                  <select
                    value={receiptRecord.receiver}
                    onChange={(e) => setReceiptRecord((r) => ({ ...r, receiver: e.target.value }))}
                    className="w-full bg-slate-50 border border-border-slate rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-primary-indigo outline-none"
                  >
                    <option value="">Select receiver...</option>
                    {LAB_RECEIVERS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="label-caps">Receipt Time</label>
                  <div className="px-3 py-2.5 bg-slate-50 border border-border-slate rounded-xl text-xs data-mono font-bold text-text-slate-500">{receiptTime}</div>
                </div>
                <div className="space-y-1.5">
                  <label className="label-caps">Acceptance Status</label>
                  <div className="flex gap-2">
                    {(['accepted', 'conditional', 'rejected'] as const).map((s) => (
                      <button key={s}
                        onClick={() => setReceiptRecord((r) => ({ ...r, acceptanceStatus: s }))}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all capitalize ${
                          receiptRecord.acceptanceStatus === s
                            ? s === 'accepted' ? 'bg-success-emerald text-white border-success-emerald'
                              : s === 'conditional' ? 'bg-warning-amber text-white border-warning-amber'
                              : 'bg-red-500 text-white border-red-500'
                            : 'bg-white text-text-slate-500 border-border-slate hover:border-primary-indigo'
                        }`}
                      >{s}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="label-caps">Visual Condition</label>
                  <div className="flex gap-2 flex-wrap">
                    {(['intact', 'seal-damaged', 'label-damaged'] as const).map((c) => (
                      <button key={c}
                        onClick={() => setReceiptRecord((r) => ({ ...r, visualCondition: c }))}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                          receiptRecord.visualCondition === c
                            ? c === 'intact' ? 'bg-success-emerald text-white border-success-emerald'
                              : 'bg-warning-amber text-white border-warning-amber'
                            : 'bg-white text-text-slate-500 border-border-slate hover:border-primary-indigo'
                        }`}
                      >{c.replace('-', ' ')}</button>
                    ))}
                  </div>
                </div>

                {/* T22: inline success banner */}
                {showSuccess && (
                  <div className="bg-success-emerald/10 border border-success-emerald/30 rounded-xl p-3 flex items-center gap-2 text-success-emerald text-xs font-bold">
                    <CheckCircle2 size={15} /> Receipt confirmed successfully.
                  </div>
                )}
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

        {/* T21: table uses pendingItems state */}
        <div className="lg:col-span-8 bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Pending Receipts</h3>
            <span className="bg-indigo-50 px-2 py-1 rounded text-[10px] font-bold text-primary-indigo">{pendingCount} ITEMS</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
              <tr>
                <th className="px-6 py-4">Sub-Sample ID</th>
                <th className="px-6 py-4">Parent ID</th>
                <th className="px-6 py-4 text-right">Weight</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingItems.map((item) => (
                <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${item.type === 'alert' ? 'bg-amber-50/50' : ''}`}>
                  <td className="px-6 py-4 data-mono text-sm font-bold text-text-slate-900">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-text-slate-500 font-medium">{item.parent}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-text-slate-700">{item.weight}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                      item.type === 'pending' ? 'bg-slate-100 text-text-slate-500' :
                      item.type === 'alert'   ? 'bg-warning-amber text-white shadow-sm' :
                      'bg-success-emerald/10 text-success-emerald'
                    }`}>{item.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.type === 'pending' && <button className="text-text-slate-400 hover:text-primary-indigo transition-colors"><ChevronRight size={20}/></button>}
                    {item.type === 'alert'   && <button className="text-warning-amber font-bold text-[10px] uppercase tracking-widest hover:underline">Resolve</button>}
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
