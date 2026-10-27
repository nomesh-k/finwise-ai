'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Search, Bell, Activity } from 'lucide-react';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { useAuth } from '@/lib/auth-context';

interface AppHeaderProps {
  pageTitle: string;
  onOpenMobileNav: () => void;
  onSearchClick?: () => void;
}

export function AppHeader({ pageTitle, onOpenMobileNav, onSearchClick }: AppHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="top-left">
        <button
          className="icon-button menu-button"
          onClick={onOpenMobileNav}
          aria-label="Open mobile navigation menu"
        >
          <Menu size={20} />
        </button>
        <div className="breadcrumbs">
          Workspace <span>/</span> <strong>{pageTitle}</strong>
        </div>
      </div>

      <div className="top-actions">
        <div className="demo-chip">
          <span /> Sample data
        </div>

        {onSearchClick && (
          <button
            className="icon-button"
            aria-label="Search transactions"
            onClick={onSearchClick}
            title="Search"
          >
            <Search size={18} />
          </button>
        )}

        <button
          className="icon-button notification"
          aria-label="Notifications"
          onClick={() => alert("You're all caught up! No pending budget alerts.")}
          title="Notifications"
        >
          <Bell size={18} />
          <i />
        </button>

        <SignedIn>
          <UserButton afterSignOutUrl="/login" />
        </SignedIn>
        <SignedOut>
          <Link href="/settings/profile" className="top-avatar no-underline" title="Profile Settings">
            {user?.display_name ? user.display_name[0].toUpperCase() : 'U'}
          </Link>
        </SignedOut>
      </div>
    </header>
  );
}
