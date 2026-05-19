/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ViewType } from './types';

import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import NonConformanceModal from './components/NonConformanceModal';

import ViewPlaceholder from './components/ViewPlaceholder';
import DashboardView from './components/DashboardView';
import ConsignmentsView from './components/ConsignmentsView';
import SupplierConsignmentsView from './components/SupplierConsignmentsView';
import SampleCollectionView from './components/SampleCollectionView';
import SampleTrackingView from './components/SampleTrackingView';
import LabReceivingView from './components/LabReceivingView';
import NonConformanceView from './components/NonConformanceView';
import PrepRoomView from './components/PrepRoomView';
import SplittingStationView from './components/SplittingStationView';
import ReportBuilderView from './components/ReportBuilderView';
import SystemHealthView from './components/SystemHealthView';
import AuditHistoryView from './components/AuditHistoryView';
import PersonnelManagementView from './components/PersonnelManagementView';
import AlertConfigView from './components/AlertConfigView';

type NcrStage = 'CONSIGNMENT' | 'COLLECTION' | 'TRANSIT' | 'PREP' | 'DIVISION' | 'LAB';

function deriveNcrStage(view: ViewType): NcrStage {
  switch (view) {
    case 'consignments':
    case 'supplier-consignments': return 'CONSIGNMENT';
    case 'sample-collection':     return 'COLLECTION';
    case 'tracking':              return 'TRANSIT';
    case 'prep-room':             return 'PREP';
    case 'division-station':      return 'DIVISION';
    case 'lab-receiving':         return 'LAB';
    default:                      return 'CONSIGNMENT';
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNcrModalOpen, setIsNcrModalOpen] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView setActiveView={setActiveView} />;
      case 'consignments':
        return <ConsignmentsView onNavigate={setActiveView} />;
      case 'supplier-consignments':
        return <SupplierConsignmentsView onNavigate={setActiveView} />;
      case 'sample-collection':
        return <SampleCollectionView onNavigate={setActiveView} />;
      case 'tracking':
        return <SampleTrackingView onNavigate={setActiveView} />;
      case 'prep-room':
        return <PrepRoomView onNavigate={setActiveView} />;
      case 'division-station':
        return <SplittingStationView onNavigate={setActiveView} />;
      case 'lab-receiving':
        return <LabReceivingView onNavigate={setActiveView} />;
      case 'non-conformance':
        return <NonConformanceView />;
      case 'audit':
        return <AuditHistoryView />;
      case 'report-builder':
        return <ReportBuilderView />;
      case 'personnel':
        return <PersonnelManagementView />;
      case 'system-health':
        return <SystemHealthView />;
      case 'alert-config':
        return <AlertConfigView />;
      default:
        return <ViewPlaceholder title={(activeView as string).replace('-', ' ').toUpperCase()} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onFlagIssue={() => setIsNcrModalOpen(true)}
        />

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

      <NonConformanceModal
        isOpen={isNcrModalOpen}
        onClose={() => setIsNcrModalOpen(false)}
        stage={deriveNcrStage(activeView)}
      />
    </div>
  );
}
