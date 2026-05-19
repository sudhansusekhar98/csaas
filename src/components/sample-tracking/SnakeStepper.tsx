import type { ComponentType } from 'react';
import { ShieldCheck } from 'lucide-react';
import { STEP_DEFINITIONS } from '../../data/sample-tracking-mock';

export interface ProcessStepNode {
  id: number;
  title: string;
  desc: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  status: 'completed' | 'current' | 'pending' | 'breach';
  stepIdx: number;
}

interface SnakeStepperProps {
  steps: ProcessStepNode[];
  onStepClick: (stepIdx: number) => void;
  highlightRange?: { from: number; to: number } | null;
}

const STEPS_PER_ROW = 6; // 6 per row = 2 rows of 6 for 12 steps

export default function SnakeStepper({ steps, onStepClick, highlightRange }: SnakeStepperProps) {
  const rows: ProcessStepNode[][] = [];
  for (let i = 0; i < steps.length; i += STEPS_PER_ROW) {
    rows.push(steps.slice(i, i + STEPS_PER_ROW));
  }

  const connectorColor = (a: ProcessStepNode, b: ProcessStepNode) => {
    if (a.status === 'completed' && b.status === 'completed') return 'bg-success-emerald';
    if (a.status === 'completed' && b.status === 'current') return 'bg-primary-indigo';
    if (a.status === 'current') return 'bg-primary-indigo';
    return 'bg-slate-200';
  };

  const elbowColor = (last: ProcessStepNode, first: ProcessStepNode) => {
    if (last.status === 'completed' && first.status === 'completed') return 'border-success-emerald';
    if (last.status === 'completed' || last.status === 'current') return 'border-primary-indigo';
    return 'border-slate-200';
  };

  return (
    <div className="select-none">
      {rows.map((row, rowIdx) => {
        const isRtl = rowIdx % 2 === 1;
        const displayRow = isRtl ? [...row].reverse() : row;
        const isLastRow = rowIdx === rows.length - 1;

        return (
          <div key={rowIdx}>
            {/* Step row */}
            <div className="flex items-center gap-0">
              {displayRow.map((step, colIdx) => {
                const isLast = colIdx === displayRow.length - 1;
                const isOutOfRange = highlightRange !== null && highlightRange !== undefined
                  ? step.stepIdx < highlightRange.from || step.stepIdx > highlightRange.to
                  : false;
                const isClickable = step.status === 'completed' || step.status === 'breach';

                // For connector, we need the actual next step in chronological order
                const nextStep = isRtl
                  ? (colIdx > 0 ? displayRow[colIdx - 1] : null)
                  : (colIdx < displayRow.length - 1 ? displayRow[colIdx + 1] : null);

                return (
                  <div key={step.id} className="flex items-center flex-1 min-w-0">
                    {/* Step node */}
                    <div
                      onClick={() => isClickable && !isOutOfRange && onStepClick(step.stepIdx)}
                      className={`relative flex flex-col items-center group transition-all duration-200 ${
                        isClickable && !isOutOfRange ? 'cursor-pointer' : ''
                      } ${isOutOfRange ? 'opacity-40 pointer-events-none' : ''}`}
                    >
                      {/* Icon circle */}
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all duration-500 shadow-sm ${
                          step.status === 'completed'
                            ? 'bg-success-emerald border-success-emerald text-white'
                            : step.status === 'breach'
                            ? 'bg-red-500 border-red-500 text-white'
                            : step.status === 'current'
                            ? 'bg-white border-primary-indigo text-primary-indigo animate-pulse scale-110 shadow-indigo-100 shadow-xl'
                            : 'bg-white border-border-slate text-text-slate-300 opacity-40'
                        } ${isClickable ? 'group-hover:scale-105 group-hover:shadow-md' : ''}`}
                        aria-current={step.status === 'current' ? 'step' : undefined}
                        aria-disabled={step.status === 'pending' || isOutOfRange ? true : undefined}
                        aria-label={`Step ${step.id}: ${step.title} — ${step.status}`}
                      >
                        <step.icon size={18} />
                      </div>

                      {/* Step label */}
                      <div className="mt-2 text-center w-16">
                        <p className={`text-[9px] font-bold uppercase tracking-wide leading-tight line-clamp-2 ${
                          step.status === 'current' ? 'text-primary-indigo' :
                          step.status === 'completed' ? 'text-success-emerald' :
                          'text-text-slate-300'
                        }`}>
                          {step.id}. {step.title}
                        </p>
                        {step.status === 'completed' && (
                          <ShieldCheck size={10} className="text-success-emerald mx-auto mt-0.5" />
                        )}
                        {step.status === 'current' && (
                          <span className="text-[8px] text-primary-indigo font-bold uppercase tracking-widest">Now</span>
                        )}
                      </div>
                    </div>

                    {/* Horizontal connector (not after the last in row) */}
                    {!isLast && nextStep && (
                      <div
                        aria-hidden="true"
                        className={`h-0.5 flex-1 mx-1 rounded-full transition-all duration-500 ${connectorColor(
                          isRtl ? nextStep : step,
                          isRtl ? step : nextStep
                        )}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Row-end elbow connector (between rows, not after the last row) */}
            {!isLastRow && (() => {
              const lastInRow = row[row.length - 1];
              const firstInNextRow = rows[rowIdx + 1]?.[0];
              if (!lastInRow || !firstInNextRow) return null;
              const color = elbowColor(lastInRow, firstInNextRow);
              return (
                <div aria-hidden="true" className="flex justify-end pr-0 my-0">
                  <div
                    className={`border-r-2 border-b-2 ${color} rounded-br-3xl`}
                    style={{ width: 24, height: 24, marginRight: 20 }}
                  />
                </div>
              );
            })()}
          </div>
        );
      })}
    </div>
  );
}

// Helper to build ProcessStepNode array from raw STEP_DEFINITIONS + effectiveStepIndex
export function buildStepperNodes(effectiveStepIndex: number): ProcessStepNode[] {
  return STEP_DEFINITIONS.map((step, idx) => ({
    ...step,
    stepIdx: idx,
    status: (idx < effectiveStepIndex ? 'completed' : idx === effectiveStepIndex ? 'current' : 'pending') as ProcessStepNode['status'],
  }));
}
