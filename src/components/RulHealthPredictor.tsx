/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, BatteryWarning, History, Wrench, Sparkles, HardDrive } from 'lucide-react';
import { BreakerModel, RulHealthMetrics } from '../types/mccb';
import { calculateRulMetrics } from '../utils/mccbMath';

interface RulHealthPredictorProps {
  breaker: BreakerModel;
}

export const RulHealthPredictor: React.FC<RulHealthPredictorProps> = ({ breaker }) => {
  // Operational parameters state
  const [totalOperations, setTotalOperations] = useState<number>(3200);
  const [faultClearingCount, setFaultClearingCount] = useState<number>(2);
  const [measuredResistance, setMeasuredResistance] = useState<number>(breaker.baselineContactResistanceMicroOhm + 15);
  const [serviceMonths, setServiceMonths] = useState<number>(36);

  const metrics: RulHealthMetrics = calculateRulMetrics(
    breaker,
    totalOperations,
    faultClearingCount,
    measuredResistance,
    serviceMonths
  );

  // Status badge styling helper
  const getStatusVisuals = (status: RulHealthMetrics['healthStatus']) => {
    switch (status) {
      case 'optimal':
        return {
          title: 'Nominal Health (Tier 1)',
          color: 'text-emerald-400',
          bg: 'bg-emerald-950/40 border-emerald-800/80',
          badgeText: 'Optimal Operating State',
          icon: CheckCircle
        };
      case 'moderate-wear':
        return {
          title: 'Moderate Wear Detected',
          color: 'text-amber-400',
          bg: 'bg-amber-950/40 border-amber-800/80',
          badgeText: 'Scheduled Maintenance Window',
          icon: AlertTriangle
        };
      case 'critical-inspection':
        return {
          title: 'High Contact Degradation',
          color: 'text-orange-400',
          bg: 'bg-orange-950/40 border-orange-800/80',
          badgeText: 'Inspection Mandatory within 30 Days',
          icon: BatteryWarning
        };
      case 'replace-immediately':
        return {
          title: 'End of Life Exceeded',
          color: 'text-rose-400',
          bg: 'bg-rose-950/50 border-rose-800/80',
          badgeText: 'Immediate Breaker Replacement Required',
          icon: ShieldAlert
        };
    }
  };

  const statusVisual = getStatusVisuals(metrics.healthStatus);
  const StatusIcon = statusVisual.icon;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Remaining Useful Life (RUL) & Contact Degradation Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Non-linear electrical wear integration modeling arc ablation, micro-weld formation, and silver-alloy contact mass reduction.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span>Baseline R₀: <strong className="text-white">{breaker.baselineContactResistanceMicroOhm} µΩ</strong></span>
          <span>·</span>
          <span>Max Limit: <strong className="text-rose-400">{breaker.criticalContactResistanceMicroOhm} µΩ</strong></span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Degradation Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-amber-400" />
                Operational History & Test Inputs
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Primary Diagnostics
              </span>
            </div>

            {/* Total Operations */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Total Switching Operations</span>
                <span className="font-mono text-white font-bold tabular-nums">
                  {totalOperations.toLocaleString()} / {breaker.electricalEndurance.toLocaleString()} ops
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={breaker.electricalEndurance * 1.2}
                step={100}
                value={totalOperations}
                onChange={(e) => setTotalOperations(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 (Commissioned)</span>
                <span>{breaker.electricalEndurance.toLocaleString()} (Rated End)</span>
              </div>
            </div>

            {/* Fault Clearing Events */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">High-Current Fault Interrupted Count</span>
                <span className="font-mono text-amber-400 font-bold tabular-nums">
                  {faultClearingCount} interruptions
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={8}
                step={1}
                value={faultClearingCount}
                onChange={(e) => setFaultClearingCount(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <p className="text-[11px] text-slate-400 leading-normal">
                Each short-circuit clearance causes severe arc vaporisation and contact material migration.
              </p>
            </div>

            {/* Measured Contact Resistance */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Measured Micro-Ohm Resistance (Rmeas)</span>
                <span className="font-mono text-cyan-400 font-bold tabular-nums">
                  {measuredResistance} µΩ (+{measuredResistance - breaker.baselineContactResistanceMicroOhm} µΩ drift)
                </span>
              </div>
              <input
                type="range"
                min={breaker.baselineContactResistanceMicroOhm}
                max={breaker.criticalContactResistanceMicroOhm + 30}
                step={1}
                value={measuredResistance}
                onChange={(e) => setMeasuredResistance(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Nominal: {breaker.baselineContactResistanceMicroOhm} µΩ</span>
                <span>Critical: {breaker.criticalContactResistanceMicroOhm} µΩ</span>
              </div>
            </div>

            {/* Service Age (Months) */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">In-Service Duration</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {serviceMonths} months ({(serviceMonths / 12).toFixed(1)} years)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={180}
                step={1}
                value={serviceMonths}
                onChange={(e) => setServiceMonths(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
            </div>

            {/* Preset Scenarios */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-[11px] font-mono text-slate-400 mb-2">Diagnostic Preset Profiles:</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTotalOperations(450);
                    setFaultClearingCount(0);
                    setMeasuredResistance(breaker.baselineContactResistanceMicroOhm + 2);
                    setServiceMonths(8);
                  }}
                  className="px-2 py-1.5 text-[11px] font-mono bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded"
                >
                  New Breaker
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTotalOperations(4200);
                    setFaultClearingCount(2);
                    setMeasuredResistance(breaker.baselineContactResistanceMicroOhm + 28);
                    setServiceMonths(48);
                  }}
                  className="px-2 py-1.5 text-[11px] font-mono bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded"
                >
                  Mid-Life Plant
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTotalOperations(9400);
                    setFaultClearingCount(5);
                    setMeasuredResistance(breaker.criticalContactResistanceMicroOhm + 5);
                    setServiceMonths(108);
                  }}
                  className="px-2 py-1.5 text-[11px] font-mono bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded"
                >
                  Severely Worn
                </button>
              </div>
            </div>
          </div>

          {/* Test Bench Photo Banner */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 p-4 flex items-center gap-4">
            <img
              src="/src/assets/images/mccb_test_bench_1791194676182.jpg"
              alt="High current primary injection test bench"
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-lg object-cover border border-slate-800 shrink-0"
            />
            <div className="text-xs space-y-1">
              <div className="font-semibold text-white">IEC 60947-2 Test Alignment</div>
              <div className="text-slate-400 leading-relaxed">
                Primary current micro-ohmmeter calibration matches high-power laboratory endurance sequences.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Predictive Outputs & Health Gauges */}
        <div className="lg:col-span-7 space-y-4">
          {/* Health Status Headline Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${statusVisual.bg}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-slate-950/60 ${statusVisual.color}`}>
                <StatusIcon className="w-6 h-6" />
              </div>
              <div>
                <div className={`text-base font-bold ${statusVisual.color}`}>
                  {statusVisual.title}
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  {statusVisual.badgeText}
                </div>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-xs text-slate-400">CONTACT WEAR</div>
              <div className={`text-2xl font-bold tabular-nums ${statusVisual.color}`}>
                {metrics.wearPercentage}%
              </div>
            </div>
          </div>

          {/* Wear Progress Bar */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Contact Erosion Index</span>
              <span className="text-white tabular-nums">{metrics.wearPercentage}% cumulative</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  metrics.wearPercentage > 75
                    ? 'bg-rose-500'
                    : metrics.wearPercentage > 50
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, metrics.wearPercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (New Silver Alloy)</span>
              <span>50% (Inspection Recommended)</span>
              <span>80% (Mandatory Replacement)</span>
            </div>
          </div>

          {/* Detailed Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono">
              <div className="text-[11px] text-slate-400">REMAINING CYCLES</div>
              <div className="text-lg font-bold text-white mt-1 tabular-nums">
                {metrics.remainingElectricalCycles.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Electrical ops</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono">
              <div className="text-[11px] text-slate-400">PREDICTED MTTF</div>
              <div className="text-lg font-bold text-amber-400 mt-1 tabular-nums">
                {metrics.predictedMttfHours.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Operating hours</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono">
              <div className="text-[11px] text-slate-400">CONTACT MASS LOSS</div>
              <div className="text-lg font-bold text-slate-200 mt-1 tabular-nums">
                {metrics.contactMassLossGrams} g
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Silver-tungsten</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono">
              <div className="text-[11px] text-slate-400">SOOT BUILDUP INDEX</div>
              <div className="text-lg font-bold text-cyan-400 mt-1 tabular-nums">
                {metrics.arcChuteSootIndex} / 100
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">De-ion plates</div>
            </div>
          </div>

          {/* Actionable Engineering Recommendation Dossier */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              Prescriptive Maintenance Plan
            </div>

            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              {metrics.healthStatus === 'optimal' && (
                <p>
                  Breaker is operating within factory specifications. Contact resistance is nominal with minimal arc erosion.
                  Next scheduled diagnostic: <strong>routine 12-month thermographic inspection</strong> and manual trip test mechanism check.
                </p>
              )}

              {metrics.healthStatus === 'moderate-wear' && (
                <p>
                  Contact resistance has increased by {measuredResistance - breaker.baselineContactResistanceMicroOhm} µΩ above baseline.
                  Arc erosion has degraded approximately {metrics.contactMassLossGrams}g of contact material.
                  Recommend: <strong>Clean arc chute plates during next scheduled outage</strong> and re-verify terminal torque values.
                </p>
              )}

              {metrics.healthStatus === 'critical-inspection' && (
                <p>
                  Breaker contact resistance is approaching critical threshold ({measuredResistance} µΩ vs {breaker.criticalContactResistanceMicroOhm} µΩ limit).
                  Substantial soot deposition detected in arc quenching chambers.
                  Action: <strong>Schedule outage within 30 days for contact resistance micro-ohmmeter verification</strong> and thermal imaging under full load.
                </p>
              )}

              {metrics.healthStatus === 'replace-immediately' && (
                <p className="text-rose-300 font-medium">
                  CRITICAL: Contact degradation exceeds safe breaking endurance limit. Risk of contact micro-welding during short-circuit interruption or thermal runaway at terminals.
                  Action: <strong>De-energize circuit and replace MCCB mechanism immediately.</strong>
                </p>
              )}
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Weibull Slope β: <strong>2.84 (Wearout Phase)</strong></span>
              <span>·</span>
              <span>Characteristic Life η: <strong>11,200 Ops</strong></span>
              <span>·</span>
              <span>Confidence: <strong>95%</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
