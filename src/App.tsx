import React, { useState } from 'react';
import type { PageId } from './types';
import { PivotPilotProvider } from './store/PivotPilotContext';
import { Sidebar } from './components/Sidebar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardPage } from './pages/DashboardPage';
import { IntakePage } from './pages/IntakePage';
import { SkillGapPage } from './pages/SkillGapPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { ProgressPage } from './pages/ProgressPage';
import { ApplicationsPage } from './pages/ApplicationsPage';

const AppShell: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActivePage} />;
      case 'intake':
        return <IntakePage onNavigate={setActivePage} />;
      case 'skill-gap':
        return <SkillGapPage onNavigate={setActivePage} />;
      case 'roadmap':
        return <RoadmapPage onNavigate={setActivePage} />;
      case 'projects':
        return <ProjectsPage onNavigate={setActivePage} />;
      case 'mock-interview':
        return <MockInterviewPage onNavigate={setActivePage} />;
      case 'progress':
        return <ProgressPage onNavigate={setActivePage} />;
      case 'applications':
        return <ApplicationsPage onNavigate={setActivePage} />;
      default:
        return <DashboardPage onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-canvas text-ink">
      <Sidebar activePage={activePage} onSelectPage={setActivePage} />
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <ErrorBoundary key={activePage}>{renderPage()}</ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <PivotPilotProvider>
      <AppShell />
    </PivotPilotProvider>
  );
}
