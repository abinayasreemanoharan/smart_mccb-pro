/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  onOpenCatalog: () => void;
  onOpenExport: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
  onOpenCatalog,
  onOpenExport
}) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400 text-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Wordmark & Scope */}
          <div className="space-y-3">
            <span className="text-base font-bold text-white tracking-tight">
              BreakerPulse
            </span>
            <p className="text-slate-400 leading-relaxed text-xs">
              Industrial predictive engineering software for Molded Case Circuit Breakers (MCCB). Trip dynamics, contact wear modeling, and low-voltage protection coordination.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              Calibrated to IEC 60947-2 & IEEE 1584-2018.
            </div>
          </div>

          {/* Col 2: Simulation Tools */}
          <div className="space-y-2">
            <div className="font-semibold text-white">Simulation Tools</div>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onSelectTab('tcc')}
                  className="hover:text-white transition-colors"
                >
                  Time-Current Characteristic (TCC)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('rul')}
                  className="hover:text-white transition-colors"
                >
                  RUL & Contact Erosion Model
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('derating')}
                  className="hover:text-white transition-colors"
                >
                  Thermal & Harmonic Derating
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('arcflash')}
                  className="hover:text-white transition-colors"
                >
                  Arc Flash & Selectivity Analysis
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Catalog */}
          <div className="space-y-2">
            <div className="font-semibold text-white">Database & Reports</div>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={onOpenCatalog}
                  className="hover:text-white transition-colors"
                >
                  Standard Breaker Library (160A–1600A)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenExport}
                  className="hover:text-white transition-colors"
                >
                  Engineering Dossier Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('technical')}
                  className="hover:text-white transition-colors"
                >
                  MCCB Internal Subsystems & Cutaway
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('technical')}
                  className="hover:text-white transition-colors"
                >
                  IEC 60947-2 Test Sequences I-IV
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Compliance & Standards */}
          <div className="space-y-2">
            <div className="font-semibold text-white">Governing Standards</div>
            <ul className="space-y-1.5 text-slate-400">
              <li>IEC 60947-2 Low-Voltage Circuit Breakers</li>
              <li>IEEE 1584-2018 Arc-Flash Hazard Calculations</li>
              <li>NFPA 70E Electrical Safety in the Workplace</li>
              <li>UL 489 Molded-Case Circuit Breakers</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} BreakerPulse MCCB Prediction Software. All engineering algorithms verified for industrial distribution systems.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Documentation</span>
            <span className="hover:text-slate-400 cursor-pointer">API Integration</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy & Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
