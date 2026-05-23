import { useState } from 'react';
import { Search, ChevronRight, CheckCircle2, FlaskConical, ScanLine } from 'lucide-react';
import ProcessBreadcrumb from './layout/ProcessBreadcrumb';
import DummyQrWidget from './lab-receiving/DummyQrWidget';
import type { ViewType } from '../types';

const LAB_RECEIVERS = ['S. Reddy (OPR-956)', 'K. Nair (OPR-901)', 'R. Iyer (OPR-802)'];

interface PendingItem {
  id: string;
  parent: string;
  divisionLabel: string;
  weight: string;
  sealStatus: 'intact' | 'damaged';
  status: string;
  type: 'pending' | 'alert' | 'received' | 'completed';
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

  const [pendingItems, setPendingItems] = useState<PendingItem[]>([
    { id: 'PRNT-8820-A-A', parent: 'PRNT-8820-A', divisionLabel: 'Sample A', weight: '1.2 kg', sealStatus: 'intact',  status: 'In Transit', type: 'pending'   },
    { id: 'PRNT-8822-X-A', parent: 'PRNT-8822-X', divisionLabel: 'Sample A', weight: '1.1 kg', sealStatus: 'intact',  status: 'In Transit', type: 'pending'   },
    { id: 'PRNT-8815-K-A', parent: 'PRNT-8815-K', divisionLabel: 'Sample A', weight: '1.0 kg', sealStatus: 'damaged', status: 'Flagged',    type: 'alert'    },
    { id: 'PRNT-8811-B-A', parent: 'PRNT-8811-B', divisionLabel: 'Sample A', weight: '0.9 kg', sealStatus: 'intact',  status: 'Received',   type: 'received' },
    { id: 'PRNT-8807-Z-A', parent: 'PRNT-8807-Z', divisionLabel: 'Sample A', weight: '1.1 kg', sealStatus: 'intact',  status: 'Completed',  type: 'completed'},
  ]);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState<'found' | 'not-found' | null>(null);

  const receiptTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' UTC';
  const selectedItem = pendingItems.find((i) => i.id === selectedItemId) ?? null;

  const canConfirm = !!(
    selectedItem?.type === 'pending' &&
    receiptRecord.receiver &&
    receiptRecord.acceptanceStatus &&
    receiptRecord.visualCondition
  );

  const flash = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Scan-first handler: identifies the sample from a scanned/entered ID
  const handleScanResult = (id: string) => {
    const item = pendingItems.find(i => i.id === id && i.type === 'pending');
    if (!item) {
      setScanFeedback('not-found');
      setTimeout(() => setScanFeedback(null), 2000);
      return;
    }
    setSelectedItemId(id);
    setReceiptRecord({
      receiver: '',
      acceptanceStatus: item.sealStatus === 'intact' ? 'accepted' : 'conditional',
      visualCondition: item.sealStatus === 'intact' ? 'intact' : 'seal-damaged',
    });
    setScanFeedback('found');
    setTimeout(() => setScanFeedback(null), 1500);
    setScanInput('');
  };

  const handleManualSearch = () => {
    if (scanInput.trim()) handleScanResult(scanInput.trim());
  };

  const handleConfirmReceipt = () => {
    if (!selectedItemId) return;
    setPendingItems((prev) =>
      prev.map((item) =>
        item.id === selectedItemId
          ? { ...item, type: 'received', status: 'Received' }
          : item
      )
    );
    setReceiptRecord({ receiver: '', acceptanceStatus: '', visualCondition: '' });
    setSelectedItemId(null);
    flash();
  };

  const handleMarkCompleted = (id: string) => {
    setPendingItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, type: 'completed', status: 'Completed' } : item
      )
    );
    setSelectedItemId(null);
    flash();
  };

  const pendingIds = pendingItems.filter(i => i.type === 'pending').map(i => i.id);
  const transitCount  = pendingItems.filter((i) => i.type === 'pending').length;
  const receivedCount = pendingItems.filter((i) => i.type === 'received' || i.type === 'completed').length;
  const flaggedCount  = pendingItems.filter((i) => i.type === 'alert').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProcessBreadcrumb currentStep={5} onNavigate={_onNavigate} />
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-slate-900 tracking-tight">Lab Receiving & Authentication</h2>
          <p className="text-text-slate-500 mt-1 text-sm">Scan a sub-sample QR code to identify and receive it.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleConfirmReceipt}
            disabled={!canConfirm}
            className="px-5 py-2 bg-primary-indigo text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-100 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Mark as Received
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
          <p className="label-caps mb-4">Samples in Transit</p>
          <div className="text-4xl font-bold text-text-slate-900">{transitCount}</div>
        </div>
        <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
          <p className="label-caps mb-4 text-success-emerald">Received Today</p>
          <div className="text-4xl font-bold text-text-slate-900">{receivedCount}</div>
        </div>
        <div className="bg-white border border-warning-amber/30 rounded-2xl p-6 shadow-sm bg-warning-amber/5">
          <p className="label-caps text-warning-amber font-bold mb-4">Flagged Exceptions</p>
          <div className="text-4xl font-bold text-warning-amber">
            {String(flaggedCount).padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* QR Scan Panel — always shown, scan-first entry point */}
          <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <ScanLine size={18} className="text-primary-indigo" />
              <h3 className="font-bold text-lg text-text-slate-900">Scan to Receive</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-text-slate-400 uppercase tracking-widest mb-2">Enter ID Manually</label>
                <div className="flex gap-2">
                  <input
                    value={scanInput}
                    onChange={e => setScanInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
                    className="flex-1 bg-slate-50 border border-border-slate rounded-lg px-3 py-2 data-mono text-text-slate-900 focus:ring-2 focus:ring-primary-indigo transition-all outline-none"
                    placeholder="e.g. PRNT-8820-A-A"
                  />
                  <button
                    onClick={handleManualSearch}
                    className="bg-primary-indigo text-white p-2 rounded-lg hover:brightness-110 shadow-md shadow-indigo-100"
                  >
                    <Search size={20}/>
                  </button>
                </div>
              </div>

              {/* Scan feedback */}
              {scanFeedback === 'found' && (
                <div className="flex items-center gap-2 text-success-emerald text-xs font-bold bg-success-emerald/10 border border-success-emerald/20 rounded-xl px-3 py-2">
                  <CheckCircle2 size={14} /> Sample identified — review details below
                </div>
              )}
              {scanFeedback === 'not-found' && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  <span className="text-red-500">✗</span> No pending sample found for that ID
                </div>
              )}

              <DummyQrWidget pendingIds={pendingIds} onScan={handleScanResult} />
            </div>
          </div>

          {/* Identified sample detail card — appears after scan */}
          {selectedItem && (
            <div className="bg-white border-2 border-primary-indigo/30 rounded-2xl p-6 shadow-sm">
              <p className="label-caps text-primary-indigo mb-4">Identified Sub-Sample</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-slate-400 font-medium">Sample ID</span>
                  <span className="data-mono font-bold text-text-slate-900">{selectedItem.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-slate-400 font-medium">Parent ID</span>
                  <span className="data-mono font-bold text-text-slate-700">{selectedItem.parent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-slate-400 font-medium">Division Label</span>
                  <span className="font-semibold text-text-slate-700">{selectedItem.divisionLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-slate-400 font-medium">Weight</span>
                  <span className="font-bold text-text-slate-900">{selectedItem.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-slate-400 font-medium">Seal</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    selectedItem.sealStatus === 'intact'
                      ? 'bg-success-emerald/10 text-success-emerald'
                      : 'bg-warning-amber/20 text-warning-amber'
                  }`}>{selectedItem.sealStatus}</span>
                </div>
              </div>

              {selectedItem.type === 'received' && (
                <button
                  onClick={() => handleMarkCompleted(selectedItem.id)}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success-emerald text-white text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-sm"
                >
                  <FlaskConical size={14} /> Mark as Completed
                </button>
              )}

              {selectedItem.type === 'completed' && (
                <div className="mt-4 flex items-center gap-2 text-success-emerald text-xs font-bold">
                  <CheckCircle2 size={14} /> Lab analysis complete
                </div>
              )}
            </div>
          )}

          {/* Receipt Record form — shown when a pending sample is identified */}
          {selectedItem?.type === 'pending' && (
            <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
              <div className="space-y-3">
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

                {showSuccess && (
                  <div className="bg-success-emerald/10 border border-success-emerald/30 rounded-xl p-3 flex items-center gap-2 text-success-emerald text-xs font-bold">
                    <CheckCircle2 size={15} /> Action confirmed successfully.
                  </div>
                )}
              </div>
            </div>
          )}

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

        {/* Right panel — status table (read-only for pending rows) */}
        <div className="lg:col-span-8 bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Sample Status</h3>
            <span className="bg-indigo-50 px-2 py-1 rounded text-[10px] font-bold text-primary-indigo">{transitCount} IN TRANSIT</span>
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
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    item.id === selectedItemId
                      ? 'bg-indigo-50/60 ring-inset ring-1 ring-primary-indigo/20'
                      : item.type === 'alert'
                      ? 'bg-amber-50/50'
                      : item.type === 'received'
                      ? 'bg-emerald-50/30'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-6 py-4 data-mono text-sm font-bold text-text-slate-900">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-text-slate-500 font-medium">{item.parent}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-text-slate-700">{item.weight}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                      item.type === 'pending'   ? 'bg-slate-100 text-text-slate-500' :
                      item.type === 'alert'     ? 'bg-warning-amber text-white shadow-sm' :
                      item.type === 'received'  ? 'bg-success-emerald/10 text-success-emerald' :
                      'bg-success-emerald/20 text-success-emerald'
                    }`}>{item.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.type === 'pending' && (
                      <span className="text-[10px] text-text-slate-300 font-medium italic">Scan to receive</span>
                    )}
                    {item.type === 'alert' && (
                      <button className="text-warning-amber font-bold text-[10px] uppercase tracking-widest hover:underline">Resolve</button>
                    )}
                    {item.type === 'received' && (
                      <button
                        onClick={() => { setSelectedItemId(item.id); }}
                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-success-emerald/10 text-success-emerald hover:bg-success-emerald hover:text-white transition-all"
                      >
                        Mark Completed
                      </button>
                    )}
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
