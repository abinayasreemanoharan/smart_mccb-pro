/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Thermometer, Mountain, Radio, Box, AlertOctagon, CheckCircle2, Sliders } from 'lucide-react';
import { BreakerModel, DeratingResult } from '../types/mccb';
import { calculateDerating } from '../utils/mccbMath';

interface DeratingHarmonicsCalculatorProps {
  breaker: BreakerModel;
  deratingResult: DeratingResult;
  ambientTempC: number;
  onUpdateAmbientTemp: (val: number) => void;
  altitudeMeters: number;
  onUpdateAltitude: (val: number) => void;
  thdPercent: number;
  onUpdateThd: (val: number) => void;
  enclosureType: 'ip30-open' | 'ip42-ventilated' | 'ip54-sealed' | 'ip65-sealed';
  onUpdateEnclosure: (val: 'ip30-open' | 'ip42-ventilated' | 'ip54-sealed' | 'ip65-sealed') => void;
}

export const DeratingHarmonicsCalculator: React.FC<DeratingHarmonicsCalculatorProps> = ({
  breaker,
  deratingResult,
  ambientTempC,
  onUpdateAmbientTemp,
  altitudeMeters,
  onUpdateAltitude,
  thdPercent,
  onUpdateThd,
  enclosureType,
  onUpdateEnclosure
}) => {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Multi-Stress Environmental & Harmonic Derating Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Simulate real-world thermal derating from ambient overheating, reduced air density at high elevations, non-linear load harmonics, and enclosure air stagnation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span>Rated In: <strong className="text-white">{breaker.ratedCurrentIn}A</strong></span>
          <span>·</span>
          <span>Effective: <strong className="text-amber-400 font-bold">{deratingResult.deratedContinuousCurrent}A</strong></span>
          <span>·</span>
          <span>Factor: <strong className="text-white">{(deratingResult.totalDeratingFactor * 100).toFixed(1)}%</strong></span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Environmental Inputs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Environmental Stress Variables
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                IEC 60947-2 Annex B
              </span>
            </div>

            {/* 1. Ambient Temperature */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                  Ambient Temperature (inside switchboard panel)
                </span>
                <span className="font-mono text-white font-bold tabular-nums">
                  {ambientTempC}°C (Kt = {deratingResult.temperatureFactor})
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={70}
                step={5}
                value={ambientTempC}
                onChange={(e) => onUpdateAmbientTemp(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>20°C (Air conditioned)</span>
                <span>40°C (Standard calibration)</span>
                <span>70°C (Desert / Rooftop)</span>
              </div>
            </div>

            {/* 2. Altitude */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Mountain className="w-3.5 h-3.5 text-cyan-400" />
                  Installation Altitude
                </span>
                <span className="font-mono text-white font-bold tabular-nums">
                  {altitudeMeters} m (Ka = {deratingResult.altitudeFactor})
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={4000}
                step={250}
                value={altitudeMeters}
                onChange={(e) => onUpdateAltitude(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 m (Sea level)</span>
                <span>2000 m (Standard limit)</span>
                <span>4000 m (High altitude mine/solar)</span>
              </div>
            </div>

            {/* 3. Harmonic Distortion (THD-I) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  Current Total Harmonic Distortion (THD-I)
                </span>
                <span className="font-mono text-white font-bold tabular-nums">
                  {thdPercent}% (Kh = {deratingResult.harmonicsFactor})
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={45}
                step={1}
                value={thdPercent}
                onChange={(e) => onUpdateThd(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0% (Pure Sinusoidal)</span>
                <span>15% (Data Center UPS)</span>
                <span>35%+ (VFD Inverters / LED)</span>
              </div>
            </div>

            {/* 4. Enclosure Ingress & Air Stagnation */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-indigo-400" />
                  Enclosure Ingress Protection (IP Rating)
                </span>
                <span className="font-mono text-white font-bold tabular-nums">
                  Ke = {deratingResult.enclosureFactor}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  { id: 'ip30-open', label: 'IP30 Open', desc: 'Free air convection' },
                  { id: 'ip42-ventilated', label: 'IP42 Ventilated', desc: 'Louvers / fan' },
                  { id: 'ip54-sealed', label: 'IP54 Gasketed', desc: 'Sealed enclosure' },
                  { id: 'ip65-sealed', label: 'IP65 Weatherproof', desc: 'Dust & jet proof' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onUpdateEnclosure(item.id as any)}
                    className={`p-2.5 rounded text-left border transition-colors ${
                      enclosureType === item.id
                        ? 'bg-amber-400/15 border-amber-400/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Derating Analysis & Thermal Rise */}
        <div className="lg:col-span-5 space-y-4">
          {/* Effective Rating Callout */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono text-slate-400">EFFECTIVE DERATED CAPACITY</span>
              <span className="text-xs font-mono text-amber-400 tabular-nums">
                K_total = {deratingResult.totalDeratingFactor}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {deratingResult.deratedContinuousCurrent} A
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  from nominal {breaker.ratedCurrentIn}A rating
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400 font-mono">CAPACITY LOSS</div>
                <div className="text-xl font-bold text-rose-400 font-mono tabular-nums">
                  -{(breaker.ratedCurrentIn - deratingResult.deratedContinuousCurrent).toFixed(1)} A
                </div>
              </div>
            </div>

            {/* Derating Factor Deconstruction */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs font-mono tabular-nums">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">TEMP Kt</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">{deratingResult.temperatureFactor}</div>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">ALT Ka</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">{deratingResult.altitudeFactor}</div>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">THD Kh</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">{deratingResult.harmonicsFactor}</div>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400">ENC Ke</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">{deratingResult.enclosureFactor}</div>
              </div>
            </div>
          </div>

          {/* Terminal Temperature Rise Prediction */}
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                Predicted Terminal Temperature Rise (ΔT)
              </span>
              <span className="text-xs font-mono text-slate-300 font-bold tabular-nums">
                +{deratingResult.predictedTerminalTempRiseDeltaC}°C
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  deratingResult.predictedTerminalTempRiseDeltaC > 70
                    ? 'bg-rose-500'
                    : deratingResult.predictedTerminalTempRiseDeltaC > 55
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{
                  width: `${Math.min(100, (deratingResult.predictedTerminalTempRiseDeltaC / 80) * 100)}%`
                }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Standard Permissible: ≤ 70°C Rise</span>
              <span>Absolute Terminal Temp: {ambientTempC + deratingResult.predictedTerminalTempRiseDeltaC}°C</span>
            </div>

            {/* Overload Warning Notice */}
            {deratingResult.isOverloadedAtNominal ? (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Derating Warning: </strong> Combined thermal, elevation, and harmonic stresses reduce permissible continuous load by {((1 - deratingResult.totalDeratingFactor) * 100).toFixed(0)}%.
                  Load must not exceed {deratingResult.deratedContinuousCurrent}A to prevent nuisance tripping and premature contact annealing.
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Operating Within Limits: </strong> Thermal margins remain satisfactory. Derated continuous rating of {deratingResult.deratedContinuousCurrent}A is sufficient for nominal duty.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
