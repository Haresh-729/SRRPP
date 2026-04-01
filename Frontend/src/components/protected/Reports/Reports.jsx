import { useState } from 'react';
import {
  IconChartBar, IconCalendar, IconCalendarStats, IconInfinity,
  IconBuildingBank, IconBuildingSkyscraper, IconUser,
  IconClock, IconAlertTriangle, IconMenu2, IconX,
} from '@tabler/icons-react';

import PortfolioReport      from './sections/PortfolioReport.jsx';
import MonthlyReport        from './sections/MonthlyReport.jsx';
import YearlyReport         from './sections/YearlyReport.jsx';
import LifetimeReport       from './sections/LifetimeReport.jsx';
import PropertyRevenueReport from './sections/PropertyRevenueReport.jsx';
import PropertyReport       from './sections/PropertyReport.jsx';
import TenantReport         from './sections/TenantReport.jsx';
import ExpiringReport       from './sections/ExpiringReport.jsx';
import OverdueReport        from './sections/OverdueReport.jsx';

const TABS = [
  {
    key:      'portfolio',
    label:    'Portfolio Overview',
    subtitle: 'High-level snapshot of all properties and collections',
    icon:     IconChartBar,
    component: PortfolioReport,
  },
  {
    key:      'monthly',
    label:    'Monthly Report',
    subtitle: 'Collection summary for a specific month',
    icon:     IconCalendar,
    component: MonthlyReport,
  },
  {
    key:      'yearly',
    label:    'Yearly Report',
    subtitle: 'Annual revenue breakdown by month and property',
    icon:     IconCalendarStats,
    component: YearlyReport,
  },
  {
    key:      'lifetime',
    label:    'Lifetime Report',
    subtitle: 'All-time collections, payment modes, and top performers',
    icon:     IconInfinity,
    component: LifetimeReport,
  },
  {
    key:      'property-revenue',
    label:    'Property Revenue',
    subtitle: 'Revenue metrics per property with collection rates',
    icon:     IconBuildingBank,
    component: PropertyRevenueReport,
  },
  {
    key:      'property-report',
    label:    'Property Report',
    subtitle: 'Deep dive into a single property\'s history',
    icon:     IconBuildingSkyscraper,
    component: PropertyReport,
  },
  {
    key:      'tenant-report',
    label:    'Tenant Report',
    subtitle: 'Deep dive into a single tenant\'s history',
    icon:     IconUser,
    component: TenantReport,
  },
  {
    key:      'expiring',
    label:    'Expiring Soon',
    subtitle: 'Agreements nearing their end date',
    icon:     IconClock,
    component: ExpiringReport,
  },
  {
    key:      'overdue',
    label:    'Overdue',
    subtitle: 'All outstanding overdue payments',
    icon:     IconAlertTriangle,
    component: OverdueReport,
  },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const current = TABS.find(t => t.key === activeTab) || TABS[0];
  const Component = current.component;

  const NavItem = ({ tab }) => {
    const isActive = tab.key === activeTab;
    return (
      <button
        onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
        style={{
          backgroundColor: isActive ? 'rgba(26,107,60,0.12)' : 'transparent',
          color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--surface-bg)'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: isActive ? 'rgba(26,107,60,0.15)' : 'transparent' }}>
          <tab.icon size={15} />
        </div>
        <span className="text-sm font-medium truncate">{tab.label}</span>
        {isActive && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: 'var(--brand-primary)' }} />
        )}
      </button>
    );
  };

  return (
    <div className="flex h-full min-h-0" style={{ backgroundColor: 'var(--surface-bg)' }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 border-r py-5"
        style={{ borderColor: 'var(--surface-border)', backgroundColor: 'var(--surface-card)' }}>
        <div className="px-4 mb-5">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Reports</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {TABS.map(tab => <NavItem key={tab.key} tab={tab} />)}
        </nav>
      </aside>

      {/* ── Mobile Drawer ── */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col py-5 shadow-2xl lg:hidden"
            style={{ backgroundColor: 'var(--surface-card)', borderRight: '1px solid var(--surface-border)' }}>
            <div className="flex items-center justify-between px-4 mb-5">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Reports</p>
              <button onClick={() => setSidebarOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ color: 'var(--text-muted)' }}><IconX size={16} /></button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
              {TABS.map(tab => <NavItem key={tab.key} tab={tab} />)}
            </nav>
          </aside>
        </>
      )}

      {/* ── Mobile Top Tab Strip ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-2 px-4 py-3 border-b"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--surface-border)' }}>
        <button onClick={() => setSidebarOpen(true)}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}>
          <IconMenu2 size={18} />
        </button>
        <div className="overflow-x-auto flex gap-2 scrollbar-hide">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0"
              style={{
                backgroundColor: tab.key === activeTab ? 'var(--brand-primary)' : 'var(--surface-bg)',
                color: tab.key === activeTab ? 'var(--text-inverse)' : 'var(--text-muted)',
              }}>
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-14">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-6 md:py-8">
          {/* Section header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(26,107,60,0.1)' }}>
                <current.icon size={18} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-main)' }}>
                {current.label}
              </h1>
            </div>
            <p className="text-sm ml-12" style={{ color: 'var(--text-muted)' }}>{current.subtitle}</p>
          </div>

          {/* Section component — each mounts fresh when key changes */}
          <div key={activeTab}>
            <Component />
          </div>
        </div>
      </main>
    </div>
  );
}