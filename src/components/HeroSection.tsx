/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Activity, Gauge } from 'lucide-react';
import { BreakerModel, SimulationResult, DeratingResult } from '../types/mccb';

interface HeroSectionProps {
  currentBreaker: BreakerModel;
  simulationResult: SimulationResult;
  deratingResult: DeratingResult;
  onExploreWorkbench: () => void;
  onOpenCatalog: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentBreaker,
  simulationResult,
  deratingResult,
  onExploreWorkbench,
  onOpenCatalog
}) => {
  return (
    <section className="relative overflow-hidden border-b border-slate-800 bg-slate-950 pt-8 pb-12 lg:pt-14 lg:pb-16 bg-grid-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Value Proposition & Engineering Scope */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-amber-400 font-semibold">IEC 60947-2</span>
              <span>·</span>
              <span>IEEE 1584-2018</span>
              <span>·</span>
              <span>NFPA 70E Arc Safety</span>
              <span>·</span>
              <span>Predictive Switchgear Analytics</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-2xl leading-tight">
              Precision life prediction & trip curve simulation for Molded Case Circuit Breakers
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Predict contact erosion, thermal-magnetic and electronic LSIG tripping times,
              harmonic derating, and selective cascading across low-voltage industrial distribution networks.
            </p>

            {/* Quick Feature Adjacency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/90">
                <div className="text-amber-400 text-xs font-mono mb-1">01. TRIP DYNAMICS</div>
                <div className="text-sm font-semibold text-white">Sub-Cycle Accuracy</div>
                <div className="text-xs text-slate-400 mt-1">15ms opening to 7,200s thermal inverse curves</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/90">
                <div className="text-amber-400 text-xs font-mono mb-1">02. CONTACT DEGRADATION</div>
                <div className="text-sm font-semibold text-white">Weibull RUL Model</div>
                <div className="text-xs text-slate-400 mt-1">Micro-ohm resistance drift & fault arc wear</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/90">
                <div className="text-amber-400 text-xs font-mono mb-1">03. THERMAL DERATING</div>
                <div className="text-sm font-semibold text-white">Multi-Stress Physics</div>
                <div className="text-xs text-slate-400 mt-1">Harmonic THD-I, altitude, and ambient temp</div>
              </div>
            </div>

            {/* Call to action buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreWorkbench}
                className="px-5 py-2.5 rounded-md bg-amber-400 text-slate-950 font-semibold text-sm hover:bg-amber-300 transition-colors flex items-center gap-2 shadow-sm"
              >
                Launch Prediction Workbench
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenCatalog}
                className="px-5 py-2.5 rounded-md bg-slate-900 border border-slate-700 text-white font-medium text-sm hover:bg-slate-800 transition-colors"
              >
                Browse Standard Breaker Library
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual + Active Telemetry Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
              {/* Switchgear Hero Image */}
              <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-950">
                <img
                  src="/src/assets/images/mccb_industrial_switchgear_1791194644253.jpg"
                  alt="Industrial MCCB switchgear lineup in modern power distribution facility"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 bg-slate-950/80 px-2 py-1 rounded border border-slate-700/60">
                    MCCB Active Specimen: {currentBreaker.modelName}
                  </span>
                  <span className="text-emerald-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-700/60 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sim Ready
                  </span>
                </div>
              </div>

              {/* Active Breaker Spec Sheet */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {currentBreaker.manufacturer} {currentBreaker.series}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {currentBreaker.poles} · {currentBreaker.ratedVoltageUe}V AC · {currentBreaker.terminalType}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-mono">BREAKING CAP.</div>
                    <div className="text-lg font-bold text-amber-400 font-mono tabular-nums">
                      {currentBreaker.ultimateBreakingCapacityIcu} kA
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 text-xs font-mono tabular-nums">
                  <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
                    <div className="text-slate-400">RATED CURRENT In</div>
                    <div className="text-sm font-semibold text-white mt-1">
                      {currentBreaker.ratedCurrentIn} A
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
                    <div className="text-slate-400">DERATED CONTINUOUS</div>
                    <div className="text-sm font-semibold text-amber-400 mt-1">
                      {deratingResult.deratedContinuousCurrent} A
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800">
                    <div className="text-slate-400">CONTACT BASELINE</div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">
                      {currentBreaker.baselineContactResistanceMicroOhm} µΩ
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Electrical Endurance: <strong className="text-slate-200 font-mono tabular-nums">{currentBreaker.electricalEndurance.toLocaleString()} ops</strong></span>
                  <span>Mechanical: <strong className="text-slate-200 font-mono tabular-nums">{currentBreaker.mechanicalEndurance.toLocaleString()} ops</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
