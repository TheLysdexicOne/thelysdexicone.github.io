'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretRight,
  faCaretDown,
  faBars,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import Header from './Header';

interface NavSection {
  label: string;
  href?: string;
  children?: NavSection[];
  isHeader?: boolean; // For main section headers (TOOLS, ENCYCLOPEDIA)
  isSubHeader?: boolean; // For sub-section headers (Progression, The Pit, Town)
  onClick?: () => void; // For special actions like opening modals
}

interface NavProps {
  pageTitle?: string;
}

export default function Nav({ pageTitle }: NavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['Tools', 'Encyclopedia'])
  );
  const pathname = usePathname();

  // Determine page title based on pathname if not provided
  const getPageTitle = () => {
    if (pageTitle) return pageTitle;

    const titleMap: Record<string, string> = {
      '/': 'BALL X PIT',
      '/settings': 'Settings',
      '/settings/reorder-heroes': 'Settings | Reorder Heroes',
      '/tools/progression/level': 'Progression | Level View',
      '/tools/progression/character': 'Progression | Character View',
      '/tools/fusion': 'Fusion',
      '/encyclopedia/characters': 'Encyclopedia | Characters',
      '/encyclopedia/balls': 'Encyclopedia | Balls',
      '/encyclopedia/passives': 'Encyclopedia | Passives',
      '/encyclopedia/levels': 'Encyclopedia | Pit Levels',
      '/encyclopedia/enemies': 'Encyclopedia | Pit Enemies',
      '/encyclopedia/buildings': 'Encyclopedia | Town Buildings',
      '/encyclopedia/harvesting': 'Encyclopedia | Town Harvesting',
    };

    return titleMap[pathname] || 'BALL X PIT';
  };

  const navStructure: NavSection[] = [
    { label: 'Home', href: '/' },
    { label: 'Settings', href: '/settings' },
    {
      label: 'Tools',
      isHeader: true,
      children: [
        { label: 'Fusion', href: '/tools/fusion' },
        {
          label: 'Progression',
          isSubHeader: true,
          children: [
            { label: 'Level View', href: '/tools/progression/level' },
            { label: 'Character View', href: '/tools/progression/character' },
          ],
        },
      ],
    },
    {
      label: 'Encyclopedia',
      isHeader: true,
      children: [
        { label: 'Characters', href: '/encyclopedia/characters' },
        { label: 'Balls', href: '/encyclopedia/balls' },
        { label: 'Passives', href: '/encyclopedia/passives' },
        {
          label: 'The Pit',
          isSubHeader: true,
          children: [
            { label: 'Levels', href: '/encyclopedia/levels' },
            { label: 'Enemies', href: '/encyclopedia/enemies' },
          ],
        },
        {
          label: 'Town',
          isSubHeader: true,
          children: [
            { label: 'Buildings', href: '/encyclopedia/buildings' },
            { label: 'Harvesting', href: '/encyclopedia/harvesting' },
          ],
        },
      ],
    },
  ];

  const isActive = (href: string) => pathname === href;

  const toggleSection = (label: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const renderNavItem = (item: NavSection, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.label);

    // Render main section header (non-collapsible) - px-2
    if (item.isHeader && hasChildren) {
      return (
        <li key={item.label}>
          <div className="mt-4 border-t border-highlight pt-4">
            <div className="px-2 py-2 text-sm font-bold uppercase tracking-wider text-primary opacity-70 lg:text-base">
              {item.label}
            </div>
            <ul className="space-y-1">
              {item.children!.map(child => renderNavItem(child, 1))}
            </ul>
          </div>
        </li>
      );
    }

    // Render sub-section header (non-collapsible) - px-6
    if (item.isSubHeader && hasChildren) {
      return (
        <li key={item.label}>
          <div className="mt-2">
            <div className="px-6 py-1 text-sm font-semibold uppercase tracking-wide text-secondary opacity-60 lg:text-base">
              {item.label}
            </div>
            <ul className="space-y-1">
              {item.children!.map(child => renderNavItem(child, 2))}
            </ul>
          </div>
        </li>
      );
    }

    // Render collapsible section (shouldn't exist now, but kept for future use)
    if (hasChildren) {
      const padding = depth === 0 ? 'px-2' : depth === 1 ? 'px-6' : 'px-10';
      return (
        <li key={item.label}>
          <button
            onClick={() => toggleSection(item.label)}
            className={`flex w-full items-center justify-between rounded ${padding} py-2 text-left text-secondary transition-colors hover:bg-highlight hover:text-primary`}
          >
            <span className="text-sm tracking-wide lg:text-base">
              {item.label}
            </span>
            <FontAwesomeIcon
              icon={isExpanded ? faCaretDown : faCaretRight}
              className="text-xs lg:text-sm"
            />
          </button>
          {isExpanded && (
            <ul className="mt-1 space-y-1">
              {item.children!.map(child => renderNavItem(child, depth + 1))}
            </ul>
          )}
        </li>
      );
    }

    // Render regular link or button - px-6 for items under headers, px-10 for items under sub-headers
    const padding = depth === 0 ? 'px-2' : depth === 1 ? 'px-6' : 'px-10';

    // If item has onClick, render as button instead of link
    if (item.onClick) {
      return (
        <li key={item.label}>
          <button
            onClick={() => {
              item.onClick!();
              setIsOpen(false);
            }}
            className={`block w-full rounded ${padding} py-2 text-left text-sm tracking-wide text-secondary transition-colors hover:bg-highlight hover:text-primary lg:text-base`}
          >
            {item.label}
          </button>
        </li>
      );
    }

    // Regular link
    return (
      <li key={item.href || item.label}>
        <Link
          href={item.href || '#'}
          onClick={() => setIsOpen(false)}
          className={`block rounded ${padding} py-2 text-sm tracking-wide transition-colors lg:text-base ${
            item.href && isActive(item.href)
              ? 'bg-highlight text-primary'
              : 'text-secondary hover:bg-highlight hover:text-primary'
          }`}
        >
          {item.label}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Header */}
      <Header title={getPageTitle()} />

      {/* Mobile Menu Button - Top Right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded bg-body-btn-highlight text-xl text-primary lg:hidden"
        aria-label="Toggle menu"
      >
        <FontAwesomeIcon icon={isOpen ? faXmark : faBars} />
      </button>

      {/* Overlay for mobile only */}
      {isOpen && (
        <div
          className="no-doc-scroll fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-full flex-col p-6">
          {/* Logo/Title */}
          <div className="mb-4">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <h1 className="font-pixel text-2xl tracking-widest text-primary">
                BALL X PIT
                <br />
                <span className="text-lg text-secondary">Companion</span>
              </h1>
            </Link>
          </div>

          {/* Separator */}
          <div className="mb-4 border-t border-highlight" />

          {/* Navigation Links */}
          <ul className="nav-scroll flex-1 space-y-1 overflow-y-auto pr-2">
            {navStructure.map(item => renderNavItem(item))}
          </ul>
          <div className="mb-4 border-t border-highlight" />
        </div>
      </nav>
    </>
  );
}
