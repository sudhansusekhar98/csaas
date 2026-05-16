import { ChevronRight, CheckCircle2 } from 'lucide-react';
import type { ViewType } from '../../types';

interface ProcessBreadcrumbProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  onNavigate: (view: ViewType) => void;
}

const steps: { label: string; view: ViewType }[] = [
  { label: 'Consignments',    view: 'consignments' },
  { label: 'Sample Tracking', view: 'tracking' },
  { label: 'Prep Room',       view: 'prep-room' },
  { label: 'Division Station',view: 'division-station' },
  { label: 'Lab Receiving',   view: 'lab-receiving' },
];

export default function ProcessBreadcrumb({ currentStep, onNavigate }: ProcessBreadcrumbProps) {
  return (
    <div className="flex items-center gap-1 mb-6 flex-wrap">
      {steps.map((step, idx) => {
        const stepNum = (idx + 1) as 1 | 2 | 3 | 4 | 5;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isFuture = stepNum > currentStep;

        return (
          <div key={step.view} className="flex items-center gap-1">
            <button
              onClick={() => isCompleted && onNavigate(step.view)}
              disabled={!isCompleted}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isCurrent
                  ? 'bg-primary-indigo/10 text-primary-indigo cursor-default'
                  : isCompleted
                  ? 'text-success-emerald hover:bg-emerald-50 cursor-pointer'
                  : 'text-text-slate-300 cursor-default'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 size={13} className="shrink-0" />
              ) : (
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] font-bold shrink-0 ${
                  isCurrent ? 'border-primary-indigo text-primary-indigo' : 'border-slate-200 text-slate-300'
                }`}>
                  {stepNum}
                </span>
              )}
              {step.label}
            </button>
            {idx < steps.length - 1 && (
              <ChevronRight
                size={14}
                className={isFuture && stepNum < currentStep ? 'text-success-emerald' : 'text-slate-200'}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
