import {
  BellRing, Plus, ChevronRight, Activity, Zap, AlertTriangle,
  CheckCircle2, TrainFront, ShieldCheck, FlaskConical, MapPin,
  SquareSplitVertical,
} from 'lucide-react';
import type { ViewType } from '../types';

interface DashboardViewProps {
  setActiveView: (view: ViewType) => void;
}

// ── Mock data ────────────────────────────────────────────────────────────────

const HOURLY_DATA = [
  { label: '08:00', val: 4 },
  { label: '09:00', val: 7 },
  { label: '10:00', val: 6 },
  { label: '11:00', val: 8 },
  { label: '12:00', val: 5 },
  { label: '13:00', val: 6 },
  { label: '14:00', val: 4 },
  { label: '15:00', val: 2, current: true },
];

// Donut: r=52, circumference=326.73, segments pre-computed
const DONUT_C = 326.73;
const DONUT_SEGMENTS = [
  { label: 'Completed',      count: 42, pct: '57.5', color: '#10b981', dash: 187.87, offset: 0 },
  { label: 'In Preparation', count: 14, pct: '19.2', color: '#9333ea', dash: 62.64,  offset: -187.87 },
  { label: 'Consignment',    count: 8,  pct: '11.0', color: '#4f46e5', dash: 35.79,  offset: -250.51 },
  { label: 'Lab Queue',      count: 6,  pct: '8.2',  color: '#0d9488', dash: 26.84,  offset: -286.30 },
  { label: 'Division',       count: 3,  pct: '4.1',  color: '#ea580c', dash: 13.42,  offset: -313.14 },
];

const GRADE_DATA = [
  { grade: 'G9',  gcv: '3600–4200', count: 12, color: '#4f46e5' },
  { grade: 'G10', gcv: '3400–3600', count: 24, color: '#7c3aed' },
  { grade: 'G11', gcv: '3200–3400', count: 18, color: '#8b5cf6' },
  { grade: 'G12', gcv: '2900–3200', count: 9,  color: '#a78bfa' },
  { grade: 'G13', gcv: '2500–2900', count: 4,  color: '#c4b5fd' },
];

const PIPELINE_STAGES: { label: string; count: number; icon: React.ElementType; view: ViewType; color: string; dot: string }[] = [
  { label: 'Consignments',    count: 8,  icon: TrainFront,         view: 'consignments',    color: 'text-primary-indigo', dot: 'bg-primary-indigo' },
  { label: 'In Preparation',  count: 14, icon: Activity,           view: 'tracking',        color: 'text-purple-600',     dot: 'bg-purple-500' },
  { label: 'Prep Room',       count: 5,  icon: FlaskConical,       view: 'prep-room',       color: 'text-pink-600',       dot: 'bg-pink-500' },
  { label: 'Division Station',count: 3,  icon: SquareSplitVertical,view: 'division-station',color: 'text-orange-600',     dot: 'bg-orange-500' },
  { label: 'Lab Queue',       count: 6,  icon: MapPin,             view: 'lab-receiving',   color: 'text-teal-600',       dot: 'bg-teal-500' },
  { label: 'Completed',       count: 42, icon: CheckCircle2,       view: 'audit',           color: 'text-success-emerald',dot: 'bg-success-emerald' },
];

const ACTIVE_NCRS = [
  { id: 'NCR-2024-031', stage: 'DIVISION', category: 'Seal Integrity Compromised', status: 'OPEN' },
  { id: 'NCR-2024-030', stage: 'TRANSIT',  category: 'Mass Variance',              status: 'UNDER REVIEW' },
  { id: 'NCR-2024-029', stage: 'LAB',      category: 'Administrative Error',       status: 'OPEN' },
];

const ACTIVITY = [
  { time: '14:35', id: 'PRNT-8824-Z',  event: 'Received at Prep Room Gate 2',    dot: 'bg-success-emerald' },
  { time: '14:22', id: 'PRNT-8823-Y',  event: 'Sealed at Sealing Bay 2',         dot: 'bg-primary-indigo' },
  { time: '14:18', id: 'PRNT-8822-X',  event: 'VMS Transit — Route approved',    dot: 'bg-blue-500' },
  { time: '14:05', id: 'NCR-2024-031', event: 'NCR raised — Division Station',   dot: 'bg-warning-amber' },
  { time: '13:58', id: 'RCK-9902-B',   event: 'Consignment arrived — 62 wagons', dot: 'bg-slate-400' },
];

// Bar chart layout constants
const BC = {
  vb: '0 0 520 170',
  base: 142, top: 15, h: 127, maxVal: 10,
  x0: 42, x1: 512, slotW: (512 - 42) / 8, barW: 30,
};

// Gauge: ring progress (21% = 42/200)
const GR = 50;
const GC = 2 * Math.PI * GR;       // 314.16
const GD = (42 / 200) * GC;        // 65.97

// ── Component ────────────────────────────────────────────────────────────────

export default function DashboardView({ setActiveView }: DashboardViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-[10px] font-bold text-text-slate-400 uppercase tracking-widest mb-1">
            2026-05-16 · Shift A · 06:00 – 18:00 UTC
          </p>
          <h1 className="text-4xl font-bold text-text-slate-900 tracking-tight">Live Pipeline</h1>
          <p className="text-text-slate-500 mt-0.5 text-sm">Shift intelligence across the full coal sample chain of custody</p>
        </div>
        <button
          onClick={() => setActiveView('consignments')}
          className="px-5 py-2.5 bg-primary-indigo text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-100 hover:brightness-110 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Register Consignment
        </button>
      </header>

      {/* ── Row 1: 6 KPI cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {([
          { label: 'Total Wagons',   val: '432',   sub: 'today',     trend: '↑ 8 vs yesterday', up: true,  icon: TrainFront,   color: 'text-primary-indigo', bg: 'bg-indigo-50' },
          { label: 'Active Samples', val: '73',    sub: 'in pipeline',trend: null,              up: true,  icon: Activity,     color: 'text-purple-600',     bg: 'bg-purple-50' },
          { label: 'Completed',      val: '42',    sub: 'samples',   trend: '↑ 12.5%',         up: true,  icon: CheckCircle2, color: 'text-success-emerald', bg: 'bg-emerald-50' },
          { label: 'Compliance',     val: '96.4%', sub: 'rate',      trend: '↓ 0.8%',          up: false, icon: ShieldCheck,  color: 'text-teal-600',        bg: 'bg-teal-50' },
          { label: 'Avg GCV',        val: '4,218', sub: 'kCal/kg',   trend: '↑ 42',            up: true,  icon: Zap,          color: 'text-orange-600',      bg: 'bg-orange-50' },
          { label: 'Open NCRs',      val: '3',     sub: 'reports',   trend: '↑ 1 new',         up: false, icon: AlertTriangle,color: 'text-warning-amber',   bg: 'bg-amber-50' },
        ] as const).map((kpi) => (
          <div key={kpi.label} className="bg-white border border-border-slate rounded-2xl p-4 shadow-sm">
            <div className={`w-9 h-9 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center mb-3`}>
              <kpi.icon size={18} />
            </div>
            <p className="text-[9px] font-bold text-text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color} leading-none`}>{kpi.val}</p>
            <p className="text-[10px] text-text-slate-400 mt-0.5">{kpi.sub}</p>
            {kpi.trend && (
              <p className={`text-[10px] font-bold mt-1.5 ${kpi.up ? 'text-success-emerald' : 'text-red-500'}`}>
                {kpi.trend}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Row 2: Bar chart + Donut ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Hourly throughput bar chart */}
        <div className="lg:col-span-2 bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-text-slate-900 text-sm uppercase tracking-widest">Hourly Throughput</h3>
              <p className="text-[10px] text-text-slate-400 mt-0.5">Samples processed per hour — current shift</p>
            </div>
            <span className="text-[10px] font-bold text-text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase tracking-widest">42 total</span>
          </div>
          <svg viewBox={BC.vb} className="w-full" aria-hidden="true">
            {/* Y-axis gridlines */}
            {[0, 2, 4, 6, 8, 10].map((v) => {
              const y = BC.base - (v / BC.maxVal) * BC.h;
              return (
                <g key={v}>
                  <line x1={BC.x0} y1={y} x2={BC.x1} y2={y} stroke="#f1f5f9" strokeWidth={1} />
                  <text x={BC.x0 - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#94a3b8">{v}</text>
                </g>
              );
            })}
            {/* Baseline */}
            <line x1={BC.x0} y1={BC.base} x2={BC.x1} y2={BC.base} stroke="#e2e8f0" strokeWidth={1.5} />
            {/* Bars */}
            {HOURLY_DATA.map((d, i) => {
              const barH = Math.max((d.val / BC.maxVal) * BC.h, 2);
              const barX = BC.x0 + i * BC.slotW + (BC.slotW - BC.barW) / 2;
              const barY = BC.base - barH;
              return (
                <g key={d.label}>
                  <rect
                    x={barX} y={barY} width={BC.barW} height={barH} rx={5}
                    fill={d.current ? '#a5b4fc' : '#4f46e5'} opacity={0.9}
                  />
                  <text x={barX + BC.barW / 2} y={barY - 5} textAnchor="middle" fontSize={11} fill="#64748b" fontWeight="600">
                    {d.val}
                  </text>
                  <text x={barX + BC.barW / 2} y={BC.base + 16} textAnchor="middle" fontSize={10} fill="#94a3b8">
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-primary-indigo" />
              <span className="text-[10px] text-text-slate-400">Completed hours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-indigo-300" />
              <span className="text-[10px] text-text-slate-400">Current hour (partial)</span>
            </div>
          </div>
        </div>

        {/* Sample distribution donut */}
        <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-text-slate-900 text-sm uppercase tracking-widest mb-1">Sample Distribution</h3>
          <p className="text-[10px] text-text-slate-400 mb-5">Pipeline stage breakdown</p>
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 140 140" className="w-36 h-36" aria-hidden="true">
              <circle cx="70" cy="70" r="52" fill="none" stroke="#f1f5f9" strokeWidth="18" />
              {DONUT_SEGMENTS.map((seg) => (
                <circle
                  key={seg.label}
                  cx="70" cy="70" r="52"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="18"
                  strokeDasharray={`${seg.dash} ${DONUT_C}`}
                  strokeDashoffset={seg.offset}
                  transform="rotate(-90 70 70)"
                />
              ))}
              <circle cx="70" cy="70" r="34" fill="white" />
              <text x="70" y="65" textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a">73</text>
              <text x="70" y="79" textAnchor="middle" fontSize="9" fill="#94a3b8">active</text>
            </svg>
            <div className="w-full space-y-2.5 mt-4">
              {DONUT_SEGMENTS.map((seg) => (
                <div key={seg.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-text-slate-600 font-medium">{seg.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-slate-900">{seg.count}</span>
                    <span className="text-[10px] text-text-slate-400 w-9 text-right">{seg.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Grade bars + Pipeline + Gauge ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Coal grade horizontal bars */}
        <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-text-slate-900 text-sm uppercase tracking-widest mb-1">Coal Grade Distribution</h3>
          <p className="text-[10px] text-text-slate-400 mb-5">Wagons by declared BIS grade</p>
          <div className="space-y-4">
            {GRADE_DATA.map((g) => (
              <div key={g.grade}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="data-mono text-xs font-bold text-text-slate-900">{g.grade}</span>
                    <span className="text-[10px] text-text-slate-400">{g.gcv} kCal/kg</span>
                  </div>
                  <span className="text-xs font-bold text-text-slate-700">
                    {g.count} <span className="text-[10px] font-normal text-text-slate-400">wagons</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${(g.count / 24) * 100}%`, backgroundColor: g.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline flow — vertical clickable list */}
        <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-text-slate-900 text-sm uppercase tracking-widest mb-1">Pipeline Flow</h3>
          <p className="text-[10px] text-text-slate-400 mb-5">Live stage counts — click to navigate</p>
          <div className="space-y-0.5">
            {PIPELINE_STAGES.map((stage, idx) => (
              <div key={stage.view}>
                <button
                  onClick={() => setActiveView(stage.view)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group text-left"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${stage.dot}`} />
                  <stage.icon size={15} className={`${stage.color} shrink-0`} />
                  <span className="text-xs font-bold text-text-slate-700 flex-1">{stage.label}</span>
                  <span className={`text-lg font-bold ${stage.color}`}>{stage.count}</span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-primary-indigo transition-colors" />
                </button>
                {idx < PIPELINE_STAGES.length - 1 && (
                  <div className="ml-[22px] w-px h-2 bg-slate-100" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shift performance ring gauge */}
        <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-text-slate-900 text-sm uppercase tracking-widest mb-1">Shift Performance</h3>
          <p className="text-[10px] text-text-slate-400 mb-4">Daily quota progress</p>
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <svg viewBox="0 0 120 120" className="w-32 h-32" aria-hidden="true">
              {/* Track */}
              <circle cx="60" cy="60" r={GR} fill="none" stroke="#f1f5f9" strokeWidth="12" />
              {/* Progress */}
              <circle
                cx="60" cy="60" r={GR}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${GD} ${GC}`}
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="55" textAnchor="middle" fontSize="18" fontWeight="700" fill="#0f172a">21%</text>
              <text x="60" y="70" textAnchor="middle" fontSize="9" fill="#94a3b8">of daily quota</text>
            </svg>
            <div className="text-center">
              <p className="text-3xl font-bold text-text-slate-900">
                42 <span className="text-base font-medium text-text-slate-400">/ 200</span>
              </p>
              <p className="text-xs text-text-slate-400 mt-0.5">samples completed</p>
            </div>
            <div className="w-full space-y-2 pt-4 border-t border-border-slate">
              {[
                { label: 'Shift ends',     val: '18:00 UTC',  color: 'text-text-slate-900' },
                { label: 'Required rate',  val: '~22 / hr',   color: 'text-warning-amber' },
                { label: 'Batches today',  val: '6',          color: 'text-text-slate-900' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-xs">
                  <span className="font-bold text-text-slate-400 uppercase tracking-widest">{row.label}</span>
                  <span className={`font-bold ${row.color}`}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 4: Activity feed + NCR table ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Live activity feed */}
        <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success-emerald rounded-full animate-pulse" />
              <h3 className="font-bold text-text-slate-900 text-sm uppercase tracking-widest">Live Activity</h3>
            </div>
            <button
              onClick={() => setActiveView('audit')}
              className="text-xs font-bold text-primary-indigo hover:underline uppercase tracking-widest flex items-center gap-1"
            >
              Audit Log <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {ACTIVITY.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="data-mono text-xs font-bold text-text-slate-900 mb-0.5">{item.id}</p>
                  <p className="text-xs text-text-slate-500 font-medium leading-snug">{item.event}</p>
                </div>
                <span className="data-mono text-[10px] text-text-slate-400 shrink-0 font-bold">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active NCR table */}
        <div className="bg-white border border-border-slate rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-border-slate flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <BellRing size={15} className="text-warning-amber" />
              <h3 className="font-bold text-text-slate-900 text-sm uppercase tracking-widest">Non-Conformances</h3>
              <span className="bg-warning-amber/10 text-warning-amber text-[10px] font-bold px-2 py-0.5 rounded-full">3 OPEN</span>
            </div>
            <button
              onClick={() => setActiveView('non-conformance')}
              className="text-xs font-bold text-primary-indigo hover:underline uppercase tracking-widest flex items-center gap-1"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>
          <table className="w-full text-left flex-1">
            <thead>
              <tr className="bg-slate-50/80 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest border-b border-border-slate">
                <th className="px-5 py-3">NCR ID</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ACTIVE_NCRS.map((ncr) => (
                <tr key={ncr.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 data-mono text-xs font-bold text-warning-amber">{ncr.id}</td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-text-slate-600 px-2 py-0.5 rounded">
                      {ncr.stage}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-text-slate-600">{ncr.category}</td>
                  <td className="px-5 py-4 text-right">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                      ncr.status === 'OPEN' ? 'bg-warning-amber text-white' : 'bg-slate-100 text-text-slate-600'
                    }`}>{ncr.status}</span>
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
