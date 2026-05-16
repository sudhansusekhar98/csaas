import { Activity } from 'lucide-react';

interface ViewPlaceholderProps {
  title: string;
}

export default function ViewPlaceholder({ title }: ViewPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-700">
      <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-primary-indigo shadow-inner border border-slate-100">
        <Activity size={48} className="animate-pulse" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-text-slate-900 uppercase tracking-widest mb-2">{title}</h2>
        <div className="h-1 w-12 bg-primary-indigo mx-auto rounded-full mb-4" />
        <p className="text-text-slate-500 max-w-md font-medium leading-relaxed">
          This operational module is currently undergoing systemic synchronization.
          Real-time parametric logic will be deployed shortly.
        </p>
      </div>
      <div className="flex gap-3">
        <div className="w-2 h-2 rounded-full bg-primary-indigo/20 animate-bounce" />
        <div className="w-2 h-2 rounded-full bg-primary-indigo/40 animate-bounce [animation-delay:0.2s]" />
        <div className="w-2 h-2 rounded-full bg-primary-indigo/60 animate-bounce [animation-delay:0.4s]" />
      </div>
    </div>
  );
}
