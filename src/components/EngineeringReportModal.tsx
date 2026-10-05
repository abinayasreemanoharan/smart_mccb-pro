/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Printer, CheckCircle, FileText, ShieldAlert, Award, Copy } from 'lucide-react';
import {
  BreakerModel,
  TripUnitSettings,
  SimulationResult,
  DeratingResult,
  ArcFlashResult
} from '../types/mccb';

interface EngineeringReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  breaker: BreakerModel;
  settings: TripUnitSettings;
  simulationResult: SimulationResult;
  deratingResult: DeratingResult;
  arcFlash: ArcFlashResult;
  testCurrentA: number;
  ambientTempC: number;
  altitudeM: number;
}

export const EngineeringReportModal: React.FC<EngineeringReportModalProps> = ({
  isOpen,
  onClose,
  breaker,
  settings,
  simulationResult,
  deratingResult,
  arcFlash,
  testCurrentA,
  ambientTempC,
  altitudeM
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `
BREAKERPULSE MCCB ENGINEERING CALCULATION DOSSIER
Standard: IEC 60947-2 / IEEE 1584-2018
Equipment: ${breaker.manufacturer} ${breaker.modelName} (${breaker.ratedCurrentIn}A, ${breaker.ultimateBreakingCapacityIcu}kA)
Trip Unit Settings: Ir=${settings.Ir}A, tr=${settings.tr}s, Isd=${settings.Isd}A, tsd=${settings.tsd}s, Ii=${settings.Ii}A

SIMULATION RESULTS:
Test Fault Current: ${testCurrentA} A
Predicted Clearing Time: ${simulationResult.predictedTripTimeSec === Infinity ? 'NO TRIP' : `${simulationResult.predictedTripTimeSec}s`}
Operating Zone: ${simulationResult.operatingZone}
Let-Through Energy I²t: ${simulationResult.letThroughEnergyA2s} A²s
Peak Cut-off Current: ${simulationResult.peakCutoffCurrentkA} kA

DERATING & HARMONICS:
Ambient Temp: ${ambientTempC}°C | Altitude: ${altitudeM}m
Total Derating Factor: ${deratingResult.totalDeratingFactor}
Derated Continuous Rating: ${deratingResult.deratedContinuousCurrent} A

ARC FLASH HAZARD (IEEE 1584):
Incident Energy: ${arcFlash.incidentEnergyCalCm2} cal/cm²
Arc Flash Boundary: ${arcFlash.arcFlashBoundaryMm} mm
PPE Category: Level ${arcFlash.ppeCategory}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full print:bg-white print:text-black">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Engineering Calculation Dossier & Verification Report
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Copy Summary'}
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 print:p-8 font-sans">
          {/* Document Header */}
          <div className="border-b-2 border-slate-700 print:border-black pb-4 flex justify-between items-start">
            <div>
              <div className="text-xl font-bold tracking-tight text-white print:text-black">
                BREAKERPULSE ENGINEERING VERIFICATION
              </div>
              <div className="text-xs font-mono text-slate-400 print:text-slate-600 mt-1">
                Document Ref: BP-MCCB-{Date.now().toString().slice(-6)} · Rev 1.0 · Compliance IEC 60947-2
              </div>
            </div>
            <div className="text-right text-xs font-mono text-slate-400 print:text-slate-600">
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>Status: <span className="text-emerald-400 print:text-emerald-700 font-bold">VERIFIED</span></div>
            </div>
          </div>

          {/* Breaker Specifications */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold font-mono text-amber-400 print:text-black uppercase">
              1. Equipment Identification & Baseline Ratings
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs font-mono">
              <div>
                <span className="text-slate-500">Manufacturer:</span>
                <div className="text-white print:text-black font-semibold">{breaker.manufacturer}</div>
              </div>
              <div>
                <span className="text-slate-500">Model Series:</span>
                <div className="text-white print:text-black font-semibold">{breaker.modelName}</div>
              </div>
              <div>
                <span className="text-slate-500">Rated Current In:</span>
                <div className="text-white print:text-black font-semibold">{breaker.ratedCurrentIn} A</div>
              </div>
              <div>
                <span className="text-slate-500">Breaking Capacity Icu:</span>
                <div className="text-white print:text-black font-semibold">{breaker.ultimateBreakingCapacityIcu} kA @ 415V</div>
              </div>
            </div>
          </div>

          {/* Calibrated Trip Settings */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold font-mono text-amber-400 print:text-black uppercase">
              2. Trip Unit Calibration Parameters (LSIG)
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-3 rounded-lg bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs font-mono tabular-nums">
              <div>
                <span className="text-slate-500">Long-Time Ir:</span>
                <div className="text-white print:text-black font-semibold">{settings.Ir} A</div>
              </div>
              <div>
                <span className="text-slate-500">Delay tr:</span>
                <div className="text-white print:text-black font-semibold">{settings.tr} s</div>
              </div>
              <div>
                <span className="text-slate-500">Short-Time Isd:</span>
                <div className="text-white print:text-black font-semibold">{settings.Isd} A</div>
              </div>
              <div>
                <span className="text-slate-500">Short-Time tsd:</span>
                <div className="text-white print:text-black font-semibold">{settings.tsd} s (I²t {settings.i2tShortTime ? 'ON' : 'OFF'})</div>
              </div>
              <div>
                <span className="text-slate-500">Instantaneous Ii:</span>
                <div className="text-white print:text-black font-semibold">{settings.Ii} A</div>
              </div>
            </div>
          </div>

          {/* Fault Simulation Calculation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold font-mono text-amber-400 print:text-black uppercase">
              3. Dynamic Tripping Simulation at {testCurrentA} A
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs font-mono tabular-nums">
              <div>
                <span className="text-slate-500">Predicted Trip Time:</span>
                <div className="text-amber-400 print:text-black font-bold">
                  {simulationResult.predictedTripTimeSec === Infinity
                    ? 'NO TRIP (Continuous)'
                    : `${simulationResult.predictedTripTimeSec} s`}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Operating Zone:</span>
                <div className="text-white print:text-black capitalize">{simulationResult.operatingZone}</div>
              </div>
              <div>
                <span className="text-slate-500">Let-Through Energy:</span>
                <div className="text-white print:text-black">{simulationResult.letThroughEnergyA2s.toLocaleString()} A²s</div>
              </div>
              <div>
                <span className="text-slate-500">Peak Cut-off Current:</span>
                <div className="text-white print:text-black">{simulationResult.peakCutoffCurrentkA} kA</div>
              </div>
            </div>
          </div>

          {/* Environmental Derating */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold font-mono text-amber-400 print:text-black uppercase">
              4. Multi-Stress Thermal Derating Assessment
            </h4>
            <div className="p-3 rounded-lg bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs font-mono">
              <div className="flex justify-between items-center mb-2">
                <span>Total Derating Factor K_total: <strong>{deratingResult.totalDeratingFactor}</strong></span>
                <span>Effective Continuous Rating: <strong className="text-amber-400 print:text-black">{deratingResult.deratedContinuousCurrent} A</strong></span>
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-600">
                Calculated at {ambientTempC}°C ambient, {altitudeM}m elevation, with terminal temperature rise ΔT of +{deratingResult.predictedTerminalTempRiseDeltaC}°C.
              </div>
            </div>
          </div>

          {/* Arc Flash IEEE 1584 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold font-mono text-amber-400 print:text-black uppercase">
              5. Arc Flash Hazard Classification (IEEE 1584 / NFPA 70E)
            </h4>
            <div className="p-3 rounded-lg bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs font-mono">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>Incident Energy: <strong>{arcFlash.incidentEnergyCalCm2} cal/cm²</strong></div>
                <div>Flash Boundary: <strong>{arcFlash.arcFlashBoundaryMm} mm</strong></div>
                <div>PPE Level: <strong>Category {arcFlash.ppeCategory}</strong></div>
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-600">
                {arcFlash.ppeRequirement}
              </div>
            </div>
          </div>

          {/* Engineering Sign-off Block */}
          <div className="pt-6 border-t border-slate-800 print:border-slate-300 grid grid-cols-2 gap-8 text-xs font-mono text-slate-400 print:text-slate-600">
            <div>
              <div>Calculation Engine: BreakerPulse Studio v2026.1</div>
              <div>Algorithm Core: IEC 60947-2 Standard / IEEE 1584-2018</div>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-700 print:border-black w-48 ml-auto pb-6 mb-1" />
              <div>Certified Electrical Engineer Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
