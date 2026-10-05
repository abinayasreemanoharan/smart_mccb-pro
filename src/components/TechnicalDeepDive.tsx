/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, ShieldCheck, Cpu, Layers, Check, ExternalLink } from 'lucide-react';

export const TechnicalDeepDive: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">
          MCCB Physical Anatomy & IEC 60947-2 Certification Standards
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Detailed electro-mechanical architecture, arc extinction physics, and international compliance testing sequences.
        </p>
      </div>

      {/* Anatomy Feature Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="lg:col-span-6 relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
          <img
            src="/src/assets/images/mccb_internal_mechanism_1791194662739.jpg"
            alt="Internal mechanism of Molded Case Circuit Breaker showing arc chutes and contacts"
            referrerPolicy="no-referrer"
            className="w-full h-80 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-xs font-mono text-slate-300 bg-slate-950/80 px-2.5 py-1.5 rounded border border-slate-800">
            Cutaway Anatomy: Arc Chute Stack & Contact Erosion Zones
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-lg font-bold text-white">
            01. Precision Internal Subsystems
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            The modern MCCB integrates fast electro-dynamic repulsion with microsecond microprocessor sensing to quench destructive fault arcs before catastrophic switchgear damage.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-amber-400">De-Ion Arc Chute Plates</div>
              <div className="text-slate-400 leading-relaxed">
                Magnetic blow-out force splits high-voltage plasma arcs into smaller series segments between steel splitter plates, cooling and de-ionizing the arc in &lt;15ms.
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-cyan-400">Silver-Tungsten (AgW) Contact Tips</div>
              <div className="text-slate-400 leading-relaxed">
                Refractory alloy composition prevents micro-welding at elevated fault currents up to 100kA while sustaining low millivolt contact drops.
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-emerald-400">Rogowski Sensor Coil & Microprocessor Trip Unit</div>
              <div className="text-slate-400 leading-relaxed">
                Coreless Rogowski current transformers eliminate magnetic saturation, ensuring linear true RMS measurement during high-harmonic distortion events.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IEC 60947-2 Testing Sequences Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">
          02. Mandatory IEC 60947-2 Test Sequences
        </h3>
        <p className="text-xs text-slate-400">
          Circuit breakers must undergo rigorous destructive type test sequences in accredited high-power testing stations (KEMA / ASTA / CESI).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-amber-400">SEQUENCE I</div>
            <div className="text-sm font-semibold text-white">General Performance</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verification of tripping limits, temperature rise at terminals (ΔT ≤ 70°C), dielectric properties, and operational performance capability.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-cyan-400">SEQUENCE II</div>
            <div className="text-sm font-semibold text-white">Rated Service Capacity (Ics)</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              O - t - CO - t - CO cycle test. Breaker must clear fault and remain operational without contact replacement or dielectric breakdown.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-emerald-400">SEQUENCE III</div>
            <div className="text-sm font-semibold text-white">Ultimate Capacity (Icu)</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              O - t - CO operation at maximum certified short-circuit current. Breaker successfully isolates without igniting external combustible material.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-indigo-400">SEQUENCE IV</div>
            <div className="text-sm font-semibold text-white">Short-Time Withstand (Icw)</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Category B selective breakers withstand fault current for rated delay (e.g. 0.3s or 1.0s) to enable downstream selectivity.
            </p>
          </div>
        </div>
      </div>

      {/* Industrial Substation Proven Use Case */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-full md:w-5/12 h-48 rounded-lg overflow-hidden bg-slate-950 shrink-0">
          <img
            src="/src/assets/images/substation_power_distribution_1791194687880.jpg"
            alt="Modern power distribution room"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-3">
          <div className="text-xs font-mono text-amber-400">03. PROVEN IN CRITICAL INFRASTRUCTURE</div>
          <h4 className="text-base font-bold text-white">
            Hyperscale Data Center & Semiconductor Plant Reliability
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            By shifting from calendar-based maintenance to BreakerPulse predictive algorithms, critical continuous-process plants reduced circuit breaker nuisance trips by 94% and extended certified switchgear asset life by an average of 4.2 years.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
            <span>· 99.999% Power Availability</span>
            <span>· Zero Blind Breaker Failures</span>
            <span>· ISO 55000 Asset Management</span>
          </div>
        </div>
      </div>
    </div>
  );
};
