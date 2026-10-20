'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  LayoutDashboard,
  ReceiptText,
  Wallet,
  Target,
  BrainCircuit,
  TrendingUp,
  FileText,
  CalendarDays,
  ShieldCheck,
  Settings,
  CircleHelp,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  MoreHorizontal,
  X,
  CreditCard,
  Users,
  ShieldAlert,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const mainNav = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Transactions', href: '/transactions', icon: ReceiptText },
    { label: 'Budgets', href: '/budgets', icon: Wallet },
    { label: 'Savings goals', href: '/goals', icon: Target },
    { label: 'Recurring bills', href: '/bills', icon: CalendarDays },
    { label: 'Debt planner', href: '/debts', icon: CreditCard },
    { label: 'AI assistant', href: '/assistant', icon: BrainCircuit, badge: 'AI' },
    { label: 'Forecasts', href: '/forecasts', icon: TrendingUp },
    { label: 'Reports', href: '/reports', icon: FileText },
  ];

  const adminNav = [
    { label: 'System health', href: '/admin', icon: ShieldCheck },
    { label: 'User directory', href: '/admin/users', icon: Users },
    { label: 'Agent runs', href: '/admin/agents', icon: BrainCircuit },
  ];

  const prefNav = [
    { label: 'Settings', href: '/settings/profile', icon: Settings },
    { label: 'Security', href: '/settings/security', icon: ShieldAlert },
    { label: 'Privacy & data', href: '/settings/privacy', icon: ShieldCheck },
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="brand">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-inherit no-underline">
            <div className="brand-mark">
              <Activity size={22} />
            </div>
            <div>
              <div className="brand-name">
                finwise<span>AI</span>
              </div>
              <div className="brand-sub">PERSONAL FINANCE</div>
            </div>
          </Link>
          <button className="icon-button mobile-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* Workspace Pill */}
        <div className="workspace-pill">
          <div className="avatar">{user?.display_name ? user.display_name[0].toUpperCase() : 'F'}</div>
          <div className="workspace-copy">
            <strong>{user?.display_name || 'My'} Workspace</strong>
            <span>{user?.currency || 'INR'} · Personal</span>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Main Nav */}
          <div className="nav-group">
            <div className="nav-label">WORKSPACE</div>
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-new">{item.badge}</span>}
                </Link>
              );
            })}
          </div>

          {/* Admin Nav (if user has admin role) */}
          {user?.role === 'admin' && (
            <div className="nav-group">
              <div className="nav-label text-amber-700">ADMINISTRATION</div>
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Preferences */}
          <div className="nav-group">
            <div className="nav-label">PREFERENCES</div>
            {prefNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Bottom */}
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">
              <Sparkles size={16} />
            </div>
            <strong>Your money, in focus.</strong>
            <p>Small steps today. More freedom tomorrow.</p>
            <Link href="/assistant" className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
              Meet your AI copilot <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="profile-row justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="avatar profile-avatar">
                {user?.display_name ? user.display_name[0].toUpperCase() : 'U'}
              </div>
              <div className="profile-copy">
                <strong className="truncate">{user?.display_name || 'Guest'}</strong>
                <span className="truncate">{user?.email || 'Demo mode'}</span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Logout"
              className="text-gray-400 hover:text-red-600 transition-colors p-1"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Scrim for Mobile */}
      {isOpen && <div className="scrim" onClick={onClose} />}
    </>
  );
}
