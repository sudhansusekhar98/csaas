import { SquareSplitVertical } from 'lucide-react';
import type { ChildSample } from '../../types';
import { STEP_DEFINITIONS } from '../../data/sample-tracking-mock';

interface ChildSamplePanelProps {
  parentId: string;
  children: ChildSample[];
  activeChildId: string | null;
  onSelectChild: (id: string | null) => void;
}

export default function ChildSamplePanel({ children, activeChildId, onSelectChild }: ChildSamplePanelProps) {
  const POST_DIVISION_STEPS = [9, 10, 11]; // 0-based indices for steps 10, 11, 12

  const pipStatus = (child: ChildSample, stepIdx: number) => {
    if (stepIdx < child.currentStepIndex) return 'completed';
    if (stepIdx === child.currentStepIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="bg-white border border-border-slate rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-xs uppercase tracking-widest text-text-slate-900 mb-4 border-b border-slate-50 pb-4 flex items-center gap-2">
        <SquareSplitVertical size={14} className="text-primary-indigo" /> Child Samples
      </h3>

      {children.length === 0 ? (
        <p className="text-[11px] text-text-slate-400 font-medium text-center py-4">
          No child samples linked yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {children.map((child) => {
            const isActive = child.id === activeChildId;
            return (
              <li key={child.id}>
                <button
                  onClick={() => onSelectChild(isActive ? null : child.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-indigo-50 border-primary-indigo ring-2 ring-primary-indigo/20'
                      : 'border-border-slate hover:bg-slate-50'
                  }`}
                  aria-label={`Child sample ${child.id}, division ${child.divisionLabel}, current step ${STEP_DEFINITIONS[child.currentStepIndex]?.title}`}
                >
                  {/* Division badge */}
                  <div className="w-7 h-7 rounded-lg bg-primary-indigo flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                    {child.divisionLabel}
                  </div>

                  {/* ID + step */}
                  <div className="flex-1 min-w-0">
                    <p className="data-mono text-xs font-bold text-text-slate-900 truncate">{child.id}</p>
                    <p className="text-[9px] text-text-slate-500 font-medium uppercase tracking-wide mt-0.5">
                      {STEP_DEFINITIONS[child.currentStepIndex]?.title ?? 'Complete'}
                    </p>
                  </div>

                  {/* Step pips: 10, 11, 12 (indices 9, 10, 11) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {POST_DIVISION_STEPS.map((stepIdx) => {
                      const status = pipStatus(child, stepIdx);
                      return (
                        <div
                          key={stepIdx}
                          title={STEP_DEFINITIONS[stepIdx]?.title}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            status === 'completed'
                              ? 'bg-success-emerald'
                              : status === 'current'
                              ? 'bg-primary-indigo animate-pulse'
                              : 'bg-slate-100 border border-slate-200'
                          }`}
                        />
                      );
                    })}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
