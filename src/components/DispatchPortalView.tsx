import { useState } from 'react';
import { Plus, ArrowUp, ArrowDown, Trash2, SendToBack } from 'lucide-react';
import type { DispatchLocation, ViewType } from '../types';

const BAG_TYPE_LABELS: Record<number, string> = {
  1: 'Bag A (Sample A)',
  2: 'Bag B (Sample B)',
  3: 'Bag R (Referee)',
  4: 'Bag D (Sample D)',
  5: 'Bag E (Sample E)',
};

interface DispatchPortalViewProps {
  dispatchLocations: DispatchLocation[];
  setDispatchLocations: React.Dispatch<React.SetStateAction<DispatchLocation[]>>;
  onNavigate: (view: ViewType) => void;
}

export default function DispatchPortalView({ dispatchLocations, setDispatchLocations, onNavigate: _onNavigate }: DispatchPortalViewProps) {
  const [form, setForm] = useState({ name: '', code: '', addressLine: '' });

  const sorted = [...dispatchLocations].sort((a, b) => a.sequence - b.sequence);

  const handleAdd = () => {
    if (!form.name.trim() || !form.code.trim()) return;
    const nextSeq = sorted.length > 0 ? sorted[sorted.length - 1].sequence + 1 : 1;
    const newLoc: DispatchLocation = {
      id: `LOC-${Date.now()}`,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      addressLine: form.addressLine.trim(),
      sequence: nextSeq,
    };
    setDispatchLocations(prev => [...prev, newLoc]);
    setForm({ name: '', code: '', addressLine: '' });
  };

  const handleMoveUp = (id: string) => {
    setDispatchLocations(prev => {
      const items = [...prev].sort((a, b) => a.sequence - b.sequence);
      const idx = items.findIndex(l => l.id === id);
      if (idx <= 0) return prev;
      const updated = items.map(l => ({ ...l }));
      const tmp = updated[idx].sequence;
      updated[idx].sequence = updated[idx - 1].sequence;
      updated[idx - 1].sequence = tmp;
      return updated;
    });
  };

  const handleMoveDown = (id: string) => {
    setDispatchLocations(prev => {
      const items = [...prev].sort((a, b) => a.sequence - b.sequence);
      const idx = items.findIndex(l => l.id === id);
      if (idx < 0 || idx >= items.length - 1) return prev;
      const updated = items.map(l => ({ ...l }));
      const tmp = updated[idx].sequence;
      updated[idx].sequence = updated[idx + 1].sequence;
      updated[idx + 1].sequence = tmp;
      return updated;
    });
  };

  const handleRemove = (id: string) => {
    setDispatchLocations(prev => {
      const filtered = prev.filter(l => l.id !== id).sort((a, b) => a.sequence - b.sequence);
      return filtered.map((l, i) => ({ ...l, sequence: i + 1 }));
    });
  };

  const canAdd = form.name.trim() && form.code.trim();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary-indigo/10 flex items-center justify-center">
              <SendToBack size={18} className="text-primary-indigo" />
            </div>
            <h2 className="text-3xl font-bold text-text-slate-900 tracking-tight">Dispatch Portal</h2>
          </div>
          <p className="text-text-slate-500 mt-1 text-sm">Manage dispatch locations and child sample sequence assignments.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT — Location List */}
        <div className="lg:col-span-5 bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border-slate bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Dispatch Locations</h3>
            <span className="bg-indigo-50 px-2 py-1 rounded text-[10px] font-bold text-primary-indigo">{sorted.length} LOCATIONS</span>
          </div>

          {sorted.length === 0 ? (
            <div className="p-8 text-center text-text-slate-400 text-sm font-medium flex-1">No locations defined. Add one using the form →</div>
          ) : (
            <ul className="divide-y divide-slate-100 flex-1">
              {sorted.map((loc, idx) => (
                <li key={loc.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-primary-indigo/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary-indigo">{loc.sequence}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text-slate-900 text-sm truncate">{loc.name}</p>
                    <p className="text-[10px] text-text-slate-400 font-medium truncate">{loc.code} · {loc.addressLine || '—'}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveUp(loc.id)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      <ArrowUp size={13} className="text-text-slate-500" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(loc.id)}
                      disabled={idx === sorted.length - 1}
                      className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      <ArrowDown size={13} className="text-text-slate-500" />
                    </button>
                    <button
                      onClick={() => handleRemove(loc.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RIGHT — Add Form + Sequence Table */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Add Location Form */}
          <div className="bg-white border border-border-slate rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-text-slate-900 text-sm uppercase tracking-widest mb-5">Add Dispatch Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-caps mb-1.5 block">Location Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. CIL Central Lab"
                  className="w-full bg-slate-50 border border-border-slate rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-indigo outline-none"
                />
              </div>
              <div>
                <label className="label-caps mb-1.5 block">Short Code *</label>
                <input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="e.g. CCL"
                  maxLength={6}
                  className="w-full bg-slate-50 border border-border-slate rounded-xl px-3 py-2.5 text-sm data-mono font-bold focus:ring-2 focus:ring-primary-indigo outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-caps mb-1.5 block">Address</label>
                <input
                  value={form.addressLine}
                  onChange={e => setForm(f => ({ ...f, addressLine: e.target.value }))}
                  placeholder="e.g. Sector 12, Dhanbad"
                  className="w-full bg-slate-50 border border-border-slate rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-indigo outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary-indigo text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
            >
              <Plus size={16} /> Add Location
            </button>
          </div>

          {/* Sequence → Bag Assignment Table */}
          <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-slate bg-slate-50/50">
              <h3 className="font-bold text-text-slate-900 uppercase tracking-widest text-xs">Sequence → Child Bag Assignment</h3>
              <p className="text-[10px] text-text-slate-400 mt-1">Sequence 1 is allocated to the lab. Remaining sequences map to child bag types in order.</p>
            </div>
            {sorted.length === 0 ? (
              <div className="p-6 text-center text-text-slate-400 text-sm">Add locations to see the assignment table.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
                  <tr>
                    <th className="px-5 py-3">Seq</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Bag Assignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sorted.map((loc) => (
                    <tr key={loc.id} className={loc.sequence === 1 ? 'bg-indigo-50/40' : 'hover:bg-slate-50'}>
                      <td className="px-5 py-3">
                        <span className="w-6 h-6 rounded-md bg-primary-indigo/10 text-primary-indigo font-bold text-xs flex items-center justify-center">{loc.sequence}</span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-sm text-text-slate-900">{loc.name}</p>
                        <p className="text-[10px] text-text-slate-400 data-mono">{loc.code}</p>
                      </td>
                      <td className="px-5 py-3">
                        {loc.sequence === 1 ? (
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-primary-indigo/10 text-primary-indigo uppercase tracking-widest">Lab Allocation</span>
                        ) : (
                          <span className="text-sm font-semibold text-text-slate-700">
                            {BAG_TYPE_LABELS[loc.sequence] ?? `Bag ${loc.sequence}`}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
