/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Flame, Shield, ArrowDownUp, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';
import { BreakerModel, ArcFlashResult, SelectivityPair } from '../types/mccb';
import { BREAKER_CATALOG } from '../data/breakerCatalog';
import { calculateArcFlash, evaluateSelectivity } from '../utils/mccbMath';

interface ArcFlashCoordinationProps {
  currentBreaker: BreakerModel;
  tripTimeSec: number;
}

export const ArcFlashCoordination: React.FC<ArcFlashCoordinationProps> = ({
  currentBreaker,
  tripTimeSec
}) => {
  // Arc Flash Inputs
  const [boltedFaultkA, setBoltedFaultkA] = useState<number>(Math.min(25, currentBreaker.ultimateBreakingCapacityIcu * 0.7));
  const [workingDistanceMm, setWorkingDistanceMm] = useState<number>(450);
  const [systemVoltageV, setSystemVoltageV] = useState<number>(currentBreaker.ratedVoltageUe);

  // Selectivity Inputs: Upstream Breaker & Fault Current
  const [selectedUpstreamId, setSelectedUpstreamId] = useState<string>('nsx630h-mic23');
  const [coordinationFaultkA, setCoordinationFaultkA] = useState<number>(18);

  const upstreamBreaker = BREAKER_CATALOG.find((b) => b.id === selectedUpstreamId) || BREAKER_CATALOG[2];

  // Calculations
  const effectiveClearingTime = isFinite(tripTimeSec) ? Math.max(0.02, tripTimeSec) : 0.05;
  const arcFlash: ArcFlashResult = calculateArcFlash(
    boltedFaultkA,
    effectiveClearingTime,
    workingDistanceMm,
    systemVoltageV
  );

  const selectivity: SelectivityPair = evaluateSelectivity(
    upstreamBreaker,
    currentBreaker,
    coordinationFaultkA
  );

  // PPE Category badge styling helper
  const getPpeStyle = (cat: ArcFlashResult['ppeCategory']) => {
    switch (cat) {
      case 1:
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/80';
      case 2:
        return 'text-cyan-400 bg-cyan-950/40 border-cyan-800/80';
      case 3:
        return 'text-amber-400 bg-amber-950/40 border-amber-800/80';
      case 4:
        return 'text-orange-400 bg-orange-950/40 border-orange-800/80';
      case 'dangerous':
        return 'text-rose-400 bg-rose-950/50 border-rose-800/80';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Arc Flash Hazard (IEEE 1584) & Selectivity Coordination
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Determine incident thermal energy, safe boundary distances, NFPA 70E PPE categories, and upstream-downstream discrimination limits.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span>Clearing Time: <strong className="text-amber-400">{Math.round(effectiveClearingTime * 1000)}ms</strong></span>
          <span>·</span>
          <span>Distance: <strong className="text-white">{workingDistanceMm}mm</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Panel 1: Arc Flash Hazard Engine */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              IEEE 1584-2018 Incident Energy Predictor
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Arc Thermal Flux
            </span>
          </div>

          {/* Prospective Fault Current */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Bolted Short-Circuit Current (Ibf)</span>
              <span className="font-mono text-cyan-400 font-bold tabular-nums">
                {boltedFaultkA} kA (Arcing Current ≈ {arcFlash.arcingCurrentkA} kA)
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={currentBreaker.ultimateBreakingCapacityIcu}
              step={1}
              value={boltedFaultkA}
              onChange={(e) => setBoltedFaultkA(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
          </div>

          {/* Working Distance */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Working Distance to Panel Busbars</span>
              <span className="font-mono text-white tabular-nums">{workingDistanceMm} mm ({(workingDistanceMm / 25.4).toFixed(1)} inches)</span>
            </div>
            <input
              type="range"
              min={300}
              max={900}
              step={50}
              value={workingDistanceMm}
              onChange={(e) => setWorkingDistanceMm(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
          </div>

          {/* Arc Flash Results Display */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-mono">INCIDENT ENERGY</div>
                <div className="text-2xl font-black text-amber-400 font-mono tabular-nums">
                  {arcFlash.incidentEnergyCalCm2} <span className="text-sm font-normal text-slate-300">cal/cm²</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400 font-mono">ARC FLASH BOUNDARY</div>
                <div className="text-2xl font-black text-white font-mono tabular-nums">
                  {arcFlash.arcFlashBoundaryMm} <span className="text-sm font-normal text-slate-300">mm</span>
                </div>
              </div>
            </div>

            {/* PPE Badge */}
            <div className={`p-3 rounded border text-xs leading-relaxed ${getPpeStyle(arcFlash.ppeCategory)}`}>
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <Shield className="w-3.5 h-3.5" />
                NFPA 70E Protective Equipment: {arcFlash.ppeCategory === 'dangerous' ? 'DANGEROUS (> 40 cal/cm²)' : `PPE Level Category ${arcFlash.ppeCategory}`}
              </div>
              <p className="text-[11px] opacity-90">{arcFlash.ppeRequirement}</p>
            </div>
          </div>
        </div>

        {/* Panel 2: Selectivity & Cascading Coordination */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <ArrowDownUp className="w-3.5 h-3.5 text-cyan-400" />
              Selective Coordination (IEC 60947-2 Annex A)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Discrimination
            </span>
          </div>

          {/* Select Upstream Breaker */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 flex justify-between">
              <span>Upstream Main Breaker (Feeder)</span>
              <span className="font-mono text-amber-400">{upstreamBreaker.ratedCurrentIn}A Frame</span>
            </label>
            <select
              value={selectedUpstreamId}
              onChange={(e) => setSelectedUpstreamId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
            >
              {BREAKER_CATALOG.filter((b) => b.ratedCurrentIn > currentBreaker.ratedCurrentIn).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.manufacturer} {b.modelName} ({b.ratedCurrentIn}A, {b.ultimateBreakingCapacityIcu}kA)
                </option>
              ))}
            </select>
          </div>

          {/* Prospective Fault Current at Downstream Terminals */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Downstream Prospective Fault Current (Ik)</span>
              <span className="font-mono text-white font-bold tabular-nums">{coordinationFaultkA} kA</span>
            </div>
            <input
              type="range"
              min={1}
              max={currentBreaker.ultimateBreakingCapacityIcu}
              step={1}
              value={coordinationFaultkA}
              onChange={(e) => setCoordinationFaultkA(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
          </div>

          {/* Selectivity Evaluation Result Card */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400">SELECTIVITY LIMIT (Is)</span>
                <div className="text-xl font-bold text-white font-mono tabular-nums">
                  {selectivity.selectivityLimitCurrentkA} kA
                </div>
              </div>

              <div>
                <span className="text-xs font-mono text-slate-400">CASCADING REINFORCED Icu</span>
                <div className="text-xl font-bold text-cyan-400 font-mono tabular-nums">
                  {selectivity.cascadingReinforcedIcu} kA
                </div>
              </div>
            </div>

            {/* Verdict */}
            <div className={`p-3 rounded border text-xs leading-relaxed ${
              selectivity.isTotallySelective
                ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                : 'bg-amber-950/40 border-amber-800/80 text-amber-300'
            }`}>
              <div className="font-bold flex items-center gap-1.5 mb-1">
                {selectivity.isTotallySelective ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Total Selectivity Confirmed (Ik ≤ Is)
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Partial Selectivity Zone (Ik &gt; Is)
                  </>
                )}
              </div>
              <p className="text-[11px] opacity-90">
                {selectivity.isTotallySelective
                  ? `For any fault up to ${coordinationFaultkA}kA, only the downstream ${currentBreaker.modelName} trips (${(selectivity.downstreamTripTimeSec * 1000).toFixed(0)}ms). Upstream breaker remains closed.`
                  : `Fault current exceeds discrimination limit (${selectivity.selectivityLimitCurrentkA}kA). Both upstream (${upstreamBreaker.ratedCurrentIn}A) and downstream breakers may trip concurrently.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
