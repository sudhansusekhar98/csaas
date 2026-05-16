/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  MapPin,
  History,
  Settings,
  HelpCircle,
  Bell,
  Search,
  ShieldCheck,
  Menu,
  LogOut,
  Microscope,
  FileWarning,
  Activity,
  Users,
  SquareSplitVertical,
  FileBarChart,
  BellRing,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewType, ExtendedViewType } from './types';

import ViewPlaceholder from './components/ViewPlaceholder';
import DashboardView from './components/DashboardView';
import ConsignmentsView from './components/ConsignmentsView';
import SampleTrackingView from './components/SampleTrackingView';
import LabReceivingView from './components/LabReceivingView';
import ExceptionLoggingView from './components/ExceptionLoggingView';
import SplittingStationView from './components/SplittingStationView';
import ReportBuilderView from './components/ReportBuilderView';
import SystemHealthView from './components/SystemHealthView';
import AuditHistoryView from './components/AuditHistoryView';
import PersonnelManagementView from './components/PersonnelManagementView';
import AlertConfigView from './components/AlertConfigView';

export default function App() {
  const [activeView, setActiveView] = useState<ExtendedViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'consignments', label: 'Consignments', icon: Package },
    { id: 'tracking', label: 'Sample Tracking', icon: MapPin },
    { id: 'audit', label: 'Audit Logs', icon: History },
    { id: 'personnel', label: 'Personnel', icon: Users },
  ];

  const subNavItems = [
    { id: 'lab-receiving', label: 'Lab Receiving', icon: Microscope },
    { id: 'exception-logging', label: 'Exception Log', icon: FileWarning },
    { id: 'splitting-station', label: 'Splitting Station', icon: SquareSplitVertical },
    { id: 'report-builder', label: 'Report Builder', icon: FileBarChart },
    { id: 'system-health', label: 'System Health', icon: Activity },
    { id: 'alert-config', label: 'Alert Configuration', icon: BellRing },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView setActiveView={setActiveView} />;
      case 'consignments':
        return <ConsignmentsView />;
      case 'tracking':
        return <SampleTrackingView />;
      case 'lab-receiving':
        return <LabReceivingView />;
      case 'exception-logging':
        return <ExceptionLoggingView />;
      case 'splitting-station':
        return <SplittingStationView />;
      case 'report-builder':
        return <ReportBuilderView />;
      case 'system-health':
        return <SystemHealthView />;
      case 'audit':
        return <AuditHistoryView />;
      case 'personnel':
        return <PersonnelManagementView />;
      case 'alert-config':
        return <AlertConfigView />;
      default:
        return <ViewPlaceholder title={activeView.replace('-', ' ').toUpperCase()} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-border-slate transition-all duration-300 flex flex-col z-50`}
      >
        <div className="p-6 border-b border-border-slate flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-indigo flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck size={20} className="text-white" />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-bold text-xl tracking-tight text-text-slate-900">CSAAS</h1>
              <p className="text-[10px] text-text-slate-400 label-caps">Industrial Monitor</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden scrollbar-hide flex flex-col gap-1">
          <div className="px-6 mb-2 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest">Main Navigation</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-6 py-2.5 transition-all relative ${
                activeView === item.id
                  ? 'bg-primary-indigo/5 text-primary-indigo font-semibold'
                  : 'text-text-slate-600 hover:text-text-slate-900 hover:bg-slate-50'
              }`}
            >
              <item.icon size={18} className={`${activeView === item.id ? 'text-primary-indigo' : 'text-text-slate-400'}`} />
              {isSidebarOpen && <span className="text-sm">{item.label}</span>}
              {activeView === item.id && (
                <div className="absolute left-0 top-1 bottom-1 w-1 bg-primary-indigo rounded-r-full" />
              )}
            </button>
          ))}

          <div className="px-6 mt-6 mb-2 text-[10px] font-bold text-text-slate-400 uppercase tracking-widest">Modules & Controls</div>
          {subNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-6 py-2.5 transition-all relative ${
                activeView === item.id
                  ? 'bg-primary-indigo/5 text-primary-indigo font-semibold'
                  : 'text-text-slate-600 hover:text-text-slate-900 hover:bg-slate-50'
              }`}
            >
              <item.icon size={18} className={`${activeView === item.id ? 'text-primary-indigo' : 'text-text-slate-400'}`} />
              {isSidebarOpen && <span className="text-sm">{item.label}</span>}
              {activeView === item.id && (
                <div className="absolute left-0 top-1 bottom-1 w-1 bg-primary-indigo rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border-slate">
          {isSidebarOpen && (
             <div className="mb-4 bg-primary-indigo rounded-xl p-4 text-white relative overflow-hidden shadow-md shadow-indigo-100">
                <div className="relative z-10">
                   <p className="text-[10px] font-bold opacity-80 mb-1 uppercase tracking-widest">System Health</p>
                   <p className="text-sm font-bold mb-3">Monitoring 84 Units</p>
                   <button className="w-full bg-white text-primary-indigo text-xs font-bold py-2 rounded-lg hover:bg-slate-50 transition-colors">View Status</button>
                </div>
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary-indigo-dark rounded-full opacity-50"></div>
             </div>
          )}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border-slate flex items-center justify-between px-8 shrink-0 z-40 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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

        {/* View Content */}
        <main className="flex-1 overflow-y-auto bg-surface relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-8 max-w-[1440px] mx-auto min-h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
