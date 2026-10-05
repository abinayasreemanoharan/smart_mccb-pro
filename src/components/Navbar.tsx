/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sliders, Download, BookOpen } from 'lucide-react';
import { BreakerModel } from '../types/mccb';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedBreaker: BreakerModel;
  onOpenCatalog: () => void;
  onOpenExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedBreaker,
  onOpenCatalog,
  onOpenExport
}) => {
  const navItems = [
    { id: 'workbench', label: 'Workbench' },
    { id: 'tcc', label: 'Trip Curves (TCC)' },
    { id: 'rul', label: 'RUL & Health' },
    { id: 'derating', label: 'Derating & Harmonics' },
    { id: 'arcflash', label: 'Arc Flash & Selectivity' },
    { id: 'technical', label: 'Anatomy & Standards' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-4">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('workbench');
            }}
            className="text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors"
          >
            BreakerPulse
          </a>
          <span className="hidden sm:inline-block text-xs text-slate-400 border-l border-slate-800 pl-3 tabular-nums">
            {selectedBreaker.manufacturer} {selectedBreaker.series} · {selectedBreaker.ratedCurrentIn}A
          </span>
        </div>

        {/* Zone 2: 4-6 text links with subtle hover underlines */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`transition-colors whitespace-nowrap py-1 relative ${
                activeTab === item.id
                  ? 'text-amber-400 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
              {activeTab === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCatalog}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700/80 rounded-md hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Change</span> Breaker
          </button>
          <button
            onClick={onOpenExport}
            className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 rounded-md hover:bg-amber-300 transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export Dossier
          </button>
        </div>
      </div>

      {/* Mobile nav bar row for small screens */}
      <div className="lg:hidden flex items-center gap-4 overflow-x-auto px-4 py-2 border-t border-slate-800/60 bg-slate-950 text-xs no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap pb-1 ${
              activeTab === item.id
                ? 'text-amber-400 border-b border-amber-400 font-medium'
                : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
