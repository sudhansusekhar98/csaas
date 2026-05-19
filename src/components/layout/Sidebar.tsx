import {
  LayoutDashboard,
  Package,
  MapPin,
  History,
  ShieldCheck,
  LogOut,
  Settings,
  Microscope,
  FileWarning,
  Activity,
  Users,
  SquareSplitVertical,
  FileBarChart,
  BellRing,
  FlaskConical,
  Building2,
  QrCode,
} from 'lucide-react';
import type { ViewType } from '../../types';

interface SidebarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  isSidebarOpen: boolean;
  onToggle: () => void;
}

const operationsNav = [
  { id: 'consignments' as ViewType,          label: 'DVC Consignments',      icon: Package },
  { id: 'supplier-consignments' as ViewType, label: 'Supplier Consignments', icon: Building2 },
  { id: 'sample-collection' as ViewType,     label: 'Sample Collection',     icon: QrCode },
  { id: 'tracking' as ViewType,              label: 'Sample Tracking',       icon: MapPin },
  { id: 'prep-room' as ViewType,             label: 'Prep Room',             icon: FlaskConical },
  { id: 'division-station' as ViewType,      label: 'Division Station',      icon: SquareSplitVertical },
  { id: 'lab-receiving' as ViewType,         label: 'Lab Receiving',         icon: Microscope },
];

const qualityNav = [
  { id: 'non-conformance' as ViewType, label: 'Non-Conformance', icon: FileWarning },
  { id: 'audit' as ViewType, label: 'Audit History', icon: History },
  { id: 'report-builder' as ViewType, label: 'Reports', icon: FileBarChart },
];

const adminNav = [
  { id: 'personnel' as ViewType, label: 'Personnel', icon: Users },
  { id: 'system-health' as ViewType, label: 'System Health', icon: Activity },
  { id: 'alert-config' as ViewType, label: 'Alerts', icon: BellRing },
];

function NavItem({ item, activeView, onNavigate, isSidebarOpen }: {
  item: { id: ViewType; label: string; icon: React.ElementType };
  activeView: ViewType;
  onNavigate: (v: ViewType) => void;
  isSidebarOpen: boolean;
}) {
  const isActive = activeView === item.id;
  return (
    <button
      key={item.id}
      onClick={() => onNavigate(item.id)}
      title={!isSidebarOpen ? item.label : undefined}
      className={`w-full flex items-center gap-3 px-6 py-2.5 transition-all relative ${
        isActive
          ? 'bg-primary-indigo/5 text-primary-indigo font-semibold'
          : 'text-text-slate-600 hover:text-text-slate-900 hover:bg-slate-50'
      }`}
    >
      <item.icon size={18} className={`shrink-0 ${isActive ? 'text-primary-indigo' : 'text-text-slate-400'}`} />
      {isSidebarOpen && <span className="text-sm truncate">{item.label}</span>}
      {isActive && <div className="absolute left-0 top-1 bottom-1 w-1 bg-primary-indigo rounded-r-full" />}
    </button>
  );
}

function NavGroup({ label, items, activeView, onNavigate, isSidebarOpen }: {
  label: string;
  items: { id: ViewType; label: string; icon: React.ElementType }[];
  activeView: ViewType;
  onNavigate: (v: ViewType) => void;
  isSidebarOpen: boolean;
}) {
  return (
    <div className="mb-2">
      {isSidebarOpen && (
        <div className="px-6 mb-2 mt-4 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest">{label}</div>
      )}
      {!isSidebarOpen && <div className="mx-4 my-3 h-px bg-slate-100" />}
      {items.map((item) => (
        <NavItem key={item.id} item={item} activeView={activeView} onNavigate={onNavigate} isSidebarOpen={isSidebarOpen} />
      ))}
    </div>
  );
}

export default function Sidebar({ activeView, onNavigate, isSidebarOpen }: SidebarProps) {
  return (
    <aside
      className={`${
        isSidebarOpen ? 'w-64' : 'w-20'
      } bg-white border-r border-border-slate transition-all duration-300 flex flex-col z-50`}
    >
      {/* Logo */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="p-6 border-b border-border-slate flex items-center gap-3 hover:bg-slate-50 transition-colors w-full text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-primary-indigo flex items-center justify-center shrink-0 shadow-sm">
          <ShieldCheck size={20} className="text-white" />
        </div>
        {isSidebarOpen && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="font-bold text-xl tracking-tight text-text-slate-900">CSAAS</h1>
            <p className="text-[10px] text-text-slate-400 label-caps">Industrial Monitor</p>
          </div>
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {/* Dashboard — standalone home item */}
        <div className="mb-1">
          {isSidebarOpen && (
            <div className="px-6 mb-2 mt-2 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest">Home</div>
          )}
          <NavItem
            item={{ id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard }}
            activeView={activeView}
            onNavigate={onNavigate}
            isSidebarOpen={isSidebarOpen}
          />
        </div>
        <NavGroup label="Operations" items={operationsNav} activeView={activeView} onNavigate={onNavigate} isSidebarOpen={isSidebarOpen} />
        <NavGroup label="Quality & Compliance" items={qualityNav} activeView={activeView} onNavigate={onNavigate} isSidebarOpen={isSidebarOpen} />
        <NavGroup label="Administration" items={adminNav} activeView={activeView} onNavigate={onNavigate} isSidebarOpen={isSidebarOpen} />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-slate">
        <button className="flex items-center gap-3 w-full px-4 py-2.5 text-text-slate-600 hover:text-text-slate-900 transition-colors rounded-lg hover:bg-slate-50">
          <Settings size={18} />
          {isSidebarOpen && <span className="text-sm font-medium">Settings</span>}
        </button>
        <button className="flex items-center gap-3 w-full px-4 py-2.5 text-text-slate-600 hover:text-text-slate-900 transition-colors rounded-lg hover:bg-slate-50 mt-1">
          <LogOut size={18} />
          {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
