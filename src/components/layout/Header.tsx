import { Bell, HelpCircle, Search, Menu, FileWarning } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onFlagIssue: () => void;
}

export default function Header({ onToggleSidebar, onFlagIssue }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-border-slate flex items-center justify-between px-8 shrink-0 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-slate-50 rounded-lg text-text-slate-600 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="font-bold text-xl text-text-slate-900 tracking-tight">Coal Sample Anti-Adulteration System</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden lg:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-slate-400" />
          <input
            type="text"
            placeholder="Search resources, logs, data..."
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-indigo w-80 transition-all"
          />
        </div>
        <button
          onClick={onFlagIssue}
          title="Flag Non-Conformance"
          className="p-2 text-warning-amber hover:bg-amber-50 rounded-full transition-colors"
        >
          <FileWarning size={20} />
        </button>
        <button className="p-2 text-text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary-indigo rounded-full border-2 border-white" />
        </button>
        <button className="p-2 text-text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <HelpCircle size={20} />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-border-slate ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-text-slate-900">Admin User</p>
            <p className="text-[10px] text-text-slate-400 label-caps">Network Supervisor</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-indigo to-purple-500 border-2 border-white shadow-sm shrink-0 overflow-hidden">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAusVLjgyMEPhqIUohKcNCJckgO8RiFkioBGLbw7X1RNmZLgR-b3pWJCrxb5jc__DN-W-FpQVFVVTXwNChn4pys9-zSb4T_pDAJeWV2ON9T1LDoknY1INqisVnPvxM1oDzDMduWyQs_NviSrjsWgDrU60fK966k2V-iMkSfMGu5FmrBomsTfLVVZB7xO9eiyQdTyrCdpobL-qdOPfUtUjc6_FgzddB2brGRJbnBI5KpJsbHq5_i1ZlQnzg06o-hxykSrzAbLtFyC-gs"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
