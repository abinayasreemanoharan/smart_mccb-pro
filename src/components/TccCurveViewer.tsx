/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Clock, Zap, AlertTriangle, Activity, Sliders, Info, ShieldCheck } from 'lucide-react';
import { BreakerModel, TripUnitSettings, SimulationResult } from '../types/mccb';
import { generateTccCurvePoints } from '../utils/mccbMath';

interface TccCurveViewerProps {
  breaker: BreakerModel;
  settings: TripUnitSettings;
  onUpdateSettings: (settings: TripUnitSettings) => void;
  testCurrent: number;
  onUpdateTestCurrent: (current: number) => void;
  simulationResult: SimulationResult;
}

export const TccCurveViewer: React.FC<TccCurveViewerProps> = ({
  breaker,
  settings,
  onUpdateSettings,
  testCurrent,
  onUpdateTestCurrent,
  simulationResult
}) => {
  // Chart dimensions & logarithmic coordinate mapping
  const width = 640;
  const height = 440;
  const padding = { top: 30, right: 30, bottom: 45, left: 55 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Log boundaries
  // X: 50A to 100,000A (100kA)
  const minCurrent = 50;
  const maxCurrent = 100000;
  const logMinX = Math.log10(minCurrent);
  const logMaxX = Math.log10(maxCurrent);

  // Y: 0.01s (10ms) to 10,000s (2.77 hours)
  const minTime = 0.01;
  const maxTime = 10000;
  const logMinY = Math.log10(minTime);
  const logMaxY = Math.log10(maxTime);

  const getX = (current: number) => {
    const clamped = Math.max(minCurrent, Math.min(current, maxCurrent));
    const logVal = Math.log10(clamped);
    return padding.left + ((logVal - logMinX) / (logMaxX - logMinX)) * plotWidth;
  };

  const getY = (time: number) => {
    const clamped = Math.max(minTime, Math.min(time, maxTime));
    const logVal = Math.log10(clamped);
    // Inverted Y (0 at top)
    return padding.top + plotHeight - ((logVal - logMinY) / (logMaxY - logMinY)) * plotHeight;
  };

  // Generate curve coordinates
  const { tripBoundary } = useMemo(
    () => generateTccCurvePoints(breaker, settings),
    [breaker, settings]
  );

  const curveSvgPath = useMemo(() => {
    if (tripBoundary.length === 0) return '';
    return tripBoundary
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(pt.currentA).toFixed(1)} ${getY(pt.timeSec).toFixed(1)}`)
      .join(' ');
  }, [tripBoundary]);

  // Major logarithmic grid lines
  const xGridTicks = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];
  const yGridTicks = [0.01, 0.1, 1, 10, 100, 1000, 10000];

  const formatTimeLabel = (sec: number) => {
    if (sec < 0.1) return `${Math.round(sec * 1000)}ms`;
    if (sec < 1) return `${sec}s`;
    if (sec < 60) return `${sec}s`;
    if (sec < 3600) return `${Math.round(sec / 60)}m`;
    return `${Math.round(sec / 3600)}h`;
  };

  const formatCurrentLabel = (a: number) => {
    if (a >= 1000) return `${a / 1000}kA`;
    return `${a}A`;
  };

  const probeX = getX(testCurrent);
  const probeY = simulationResult.isTripping && isFinite(simulationResult.predictedTripTimeSec)
    ? getY(simulationResult.predictedTripTimeSec)
    : null;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Time-Current Characteristic (TCC) Tripping Simulation
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Log-log characteristic curve plotting thermal-magnetic overload, short-time delay, and instantaneous magnetic release per IEC 60947-2.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900 px-3 py-1.5 rounded border border-slate-800 self-start md:self-auto">
          <span>Frame: <strong className="text-white">{breaker.ratedCurrentIn}A</strong></span>
          <span>·</span>
          <span>Icu: <strong className="text-amber-400">{breaker.ultimateBreakingCapacityIcu}kA</strong></span>
          <span>·</span>
          <span>Trip: <strong className="text-white capitalize">{settings.type.replace('-', ' ')}</strong></span>
        </div>
      </div>

      {/* Main Grid: Visualizer + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Log-Log Plot */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Log-Log Tripping Characteristic
            </span>
            <div className="flex items-center gap-3 text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-amber-400 inline-block" /> Tripping Curve
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Test Injection
              </span>
            </div>
          </div>

          <div className="w-full aspect-[4/3] sm:aspect-[16/11] relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full select-none"
            >
              {/* Background */}
              <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} fill="#030712" />

              {/* Grid Lines - X (Current) */}
              {xGridTicks.map((val) => {
                const x = getX(val);
                return (
                  <g key={`x-${val}`}>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + plotHeight}
                      stroke="#1e293b"
                      strokeWidth={val === 1000 || val === 10000 ? 1.5 : 0.8}
                      strokeDasharray={val === 1000 || val === 10000 ? 'none' : '2,2'}
                    />
                    <text
                      x={x}
                      y={height - 15}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {formatCurrentLabel(val)}
                    </text>
                  </g>
                );
              })}

              {/* Grid Lines - Y (Time) */}
              {yGridTicks.map((val) => {
                const y = getY(val);
                return (
                  <g key={`y-${val}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + plotWidth}
                      y2={y}
                      stroke="#1e293b"
                      strokeWidth={val === 1 || val === 100 ? 1.5 : 0.8}
                      strokeDasharray={val === 1 || val === 100 ? 'none' : '2,2'}
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {formatTimeLabel(val)}
                    </text>
                  </g>
                );
              })}

              {/* Icu Ultimate Breaking Capacity Limit Line (Red dashed) */}
              <line
                x1={getX(breaker.ultimateBreakingCapacityIcu * 1000)}
                y1={padding.top}
                x2={getX(breaker.ultimateBreakingCapacityIcu * 1000)}
                y2={padding.top + plotHeight}
                stroke="#ef4444"
                strokeWidth={1.8}
                strokeDasharray="4,4"
              />
              <text
                x={getX(breaker.ultimateBreakingCapacityIcu * 1000) - 4}
                y={padding.top + 15}
                textAnchor="end"
                fill="#ef4444"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                transform={`rotate(-90 ${getX(breaker.ultimateBreakingCapacityIcu * 1000) - 4} ${padding.top + 15})`}
              >
                Icu = {breaker.ultimateBreakingCapacityIcu}kA
              </text>

              {/* Ir Nominal Current Limit Line (Gray) */}
              <line
                x1={getX(settings.Ir)}
                y1={padding.top}
                x2={getX(settings.Ir)}
                y2={padding.top + plotHeight}
                stroke="#475569"
                strokeWidth={1.2}
                strokeDasharray="3,3"
              />
              <text
                x={getX(settings.Ir) + 4}
                y={padding.top + plotHeight - 10}
                fill="#94a3b8"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
              >
                Ir={settings.Ir}A
              </text>

              {/* Instantaneous Pick-up Marker */}
              <line
                x1={getX(settings.Ii)}
                y1={padding.top + plotHeight - 40}
                x2={getX(settings.Ii)}
                y2={padding.top + plotHeight}
                stroke="#38bdf8"
                strokeWidth={1.2}
                strokeDasharray="2,2"
              />
              <text
                x={getX(settings.Ii) + 3}
                y={padding.top + plotHeight - 20}
                fill="#38bdf8"
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
              >
                Ii={settings.Ii}A
              </text>

              {/* Tripping Characteristic Curve Path */}
              {curveSvgPath && (
                <path
                  d={curveSvgPath}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Test Injection Current Vertical Line */}
              <line
                x1={probeX}
                y1={padding.top}
                x2={probeX}
                y2={padding.top + plotHeight}
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />

              {/* Probe Point on Curve */}
              {probeY !== null && (
                <g>
                  {/* Outer pulse circle */}
                  <circle
                    cx={probeX}
                    cy={probeY}
                    r="8"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                    className="animate-ping opacity-60"
                  />
                  {/* Solid probe dot */}
                  <circle
                    cx={probeX}
                    cy={probeY}
                    r="5"
                    fill="#06b6d4"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {/* Axis Titles */}
              <text
                x={padding.left + plotWidth / 2}
                y={height - 2}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="500"
              >
                Fault Current (Amperes, RMS)
              </text>
              <text
                x={14}
                y={padding.top + plotHeight / 2}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="500"
                transform={`rotate(-90 14 ${padding.top + plotHeight / 2})`}
              >
                Tripping Time (Seconds)
              </text>
            </svg>
          </div>

          {/* Bottom Diagnostic Banner */}
          <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-400">Predicted Clearing Time: </span>
              <span className="text-sm font-bold text-amber-400 tabular-nums">
                {simulationResult.predictedTripTimeSec === Infinity
                  ? 'NO TRIP (Nominal Load)'
                  : simulationResult.predictedTripTimeSec < 1
                  ? `${Math.round(simulationResult.predictedTripTimeSec * 1000)} ms`
                  : `${simulationResult.predictedTripTimeSec.toFixed(2)} s`}
              </span>
            </div>

            <div>
              <span className="text-slate-400">Let-Through Energy I²t: </span>
              <span className="text-white font-semibold tabular-nums">
                {simulationResult.letThroughEnergyA2s.toLocaleString()} A²s
              </span>
            </div>

            <div>
              <span className="text-slate-400">Peak Cut-off: </span>
              <span className="text-cyan-400 font-semibold tabular-nums">
                {simulationResult.peakCutoffCurrentkA} kA
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Trip Unit Dials & Test Injection Slider */}
        <div className="lg:col-span-5 space-y-4">
          {/* Test Injection Current Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Test Fault Current Injection (Itest)
              </label>
              <span className="text-xs font-mono text-cyan-400 tabular-nums font-bold">
                {testCurrent.toLocaleString()} A ({(testCurrent / settings.Ir).toFixed(2)} × Ir)
              </span>
            </div>

            <input
              type="range"
              min={Math.round(settings.Ir * 0.5)}
              max={breaker.ultimateBreakingCapacityIcu * 1000}
              step={10}
              value={testCurrent}
              onChange={(e) => onUpdateTestCurrent(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />

            {/* Quick Test Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '0.9×Ir (Nominal)', val: Math.round(settings.Ir * 0.9) },
                { label: '1.5×Ir (Overload)', val: Math.round(settings.Ir * 1.5) },
                { label: '6×Ir (High Overload)', val: Math.round(settings.Ir * 6) },
                { label: 'Short-Circuit 10kA', val: 10000 },
                { label: 'Near Icu Max', val: Math.round(breaker.ultimateBreakingCapacityIcu * 900) }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => onUpdateTestCurrent(p.val)}
                  className={`px-2 py-1 text-[11px] font-mono rounded transition-colors ${
                    testCurrent === p.val
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Trip Status Alert */}
            <div className={`p-2.5 rounded border text-xs leading-relaxed ${
              simulationResult.operatingZone === 'exceeds-breaking-capacity'
                ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                : simulationResult.operatingZone === 'instantaneous'
                ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                : simulationResult.operatingZone === 'nominal'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-cyan-950/40 border-cyan-800 text-cyan-300'
            }`}>
              <strong>Zone: </strong> {simulationResult.zoneDescription}
            </div>
          </div>

          {/* Trip Unit Calibration Settings Panel */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Trip Unit Calibration (LSIG Parameters)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                IEC 60947-2
              </span>
            </div>

            {/* Long Time Pickup Ir */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Long-time pickup Ir (A)</span>
                <span className="font-mono text-amber-400 font-bold tabular-nums">
                  {settings.Ir} A ({(settings.Ir / breaker.ratedCurrentIn).toFixed(2)} × In)
                </span>
              </div>
              <input
                type="range"
                min={Math.round(breaker.ratedCurrentIn * 0.4)}
                max={breaker.ratedCurrentIn}
                step={breaker.ratedCurrentIn > 250 ? 10 : 5}
                value={settings.Ir}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, Ir: Number(e.target.value) })
                }
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.4 × In ({Math.round(breaker.ratedCurrentIn * 0.4)}A)</span>
                <span>1.0 × In ({breaker.ratedCurrentIn}A)</span>
              </div>
            </div>

            {/* Long Time Delay tr */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Long-time delay tr @ 6×Ir</span>
                <span className="font-mono text-slate-200 tabular-nums">{settings.tr}s</span>
              </div>
              <input
                type="range"
                min={2}
                max={24}
                step={2}
                value={settings.tr}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, tr: Number(e.target.value) })
                }
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>2s (Motor class 10)</span>
                <span>24s (Heavy inrush)</span>
              </div>
            </div>

            {/* Short Time Pickup Isd */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Short-time pickup Isd</span>
                <span className="font-mono text-amber-400 font-bold tabular-nums">
                  {settings.Isd} A ({(settings.Isd / settings.Ir).toFixed(1)} × Ir)
                </span>
              </div>
              <input
                type="range"
                min={Math.round(settings.Ir * 1.5)}
                max={Math.min(settings.Ir * 10, settings.Ii - 100)}
                step={50}
                value={settings.Isd}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, Isd: Number(e.target.value) })
                }
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1.5 × Ir</span>
                <span>10 × Ir</span>
              </div>
            </div>

            {/* Short Time Delay tsd & I²t Toggle */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Short-time delay tsd</span>
                <span className="font-mono text-slate-200 tabular-nums">{settings.tsd}s</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0.02}
                  max={0.4}
                  step={0.02}
                  value={settings.tsd}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, tsd: Number(e.target.value) })
                  }
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      i2tShortTime: !settings.i2tShortTime
                    })
                  }
                  className={`px-2.5 py-1 text-[11px] font-mono rounded whitespace-nowrap border transition-colors ${
                    settings.i2tShortTime
                      ? 'bg-amber-400/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  I²t {settings.i2tShortTime ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Instantaneous Pickup Ii */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Instantaneous pickup Ii</span>
                <span className="font-mono text-cyan-400 font-bold tabular-nums">
                  {settings.Ii} A ({(settings.Ii / breaker.ratedCurrentIn).toFixed(1)} × In)
                </span>
              </div>
              <input
                type="range"
                min={Math.round(breaker.ratedCurrentIn * 3)}
                max={Math.round(breaker.ratedCurrentIn * 15)}
                step={100}
                value={settings.Ii}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, Ii: Number(e.target.value) })
                }
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>3 × In</span>
                <span>15 × In (Maximum)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
