/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Activity,
  Zap,
  Sliders,
  Flame,
  FileText,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
  Layers,
  Thermometer,
  Wrench,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TccCurveViewer } from './components/TccCurveViewer';
import { RulHealthPredictor } from './components/RulHealthPredictor';
import { DeratingHarmonicsCalculator } from './components/DeratingHarmonicsCalculator';
import { ArcFlashCoordination } from './components/ArcFlashCoordination';
import { TechnicalDeepDive } from './components/TechnicalDeepDive';
import { BreakerCatalogModal } from './components/BreakerCatalogModal';
import { EngineeringReportModal } from './components/EngineeringReportModal';
import { Footer } from './components/Footer';

import { BREAKER_CATALOG } from './data/breakerCatalog';
import { BreakerModel, TripUnitSettings, SimulationResult, DeratingResult, ArcFlashResult } from './types/mccb';
import { calculateTripTime, calculateDerating, calculateArcFlash } from './utils/mccbMath';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('workbench');
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Active Breaker Model
  const [selectedBreaker, setSelectedBreaker] = useState<BreakerModel>(BREAKER_CATALOG[1]); // NSX250N
  const [settings, setSettings] = useState<TripUnitSettings>(selectedBreaker.defaultSettings);

  // Operational & Environmental Variables
  const [testCurrent, setTestCurrent] = useState<number>(Math.round(selectedBreaker.defaultSettings.Ir * 1.5));
  const [ambientTempC, setAmbientTempC] = useState<number>(40);
  const [altitudeMeters, setAltitudeMeters] = useState<number>(0);
  const [thdPercent, setThdPercent] = useState<number>(5);
  const [enclosureType, setEnclosureType] = useState<'ip30-open' | 'ip42-ventilated' | 'ip54-sealed' | 'ip65-sealed'>('ip42-ventilated');

  // When user selects a new breaker from catalog
  const handleSelectBreaker = (breaker: BreakerModel) => {
    setSelectedBreaker(breaker);
    setSettings(breaker.defaultSettings);
    setTestCurrent(Math.round(breaker.defaultSettings.Ir * 1.5));
  };

  // Real-time Physics Calculations
  const simulationResult: SimulationResult = useMemo(() => {
    return calculateTripTime(selectedBreaker, settings, testCurrent);
  }, [selectedBreaker, settings, testCurrent]);

  const deratingResult: DeratingResult = useMemo(() => {
    return calculateDerating(
      selectedBreaker.ratedCurrentIn,
      ambientTempC,
      altitudeMeters,
      thdPercent,
      enclosureType
    );
  }, [selectedBreaker.ratedCurrentIn, ambientTempC, altitudeMeters, thdPercent, enclosureType]);

  const arcFlash: ArcFlashResult = useMemo(() => {
    const clearingTime = isFinite(simulationResult.predictedTripTimeSec)
      ? Math.max(0.02, simulationResult.predictedTripTimeSec)
      : 0.05;
    return calculateArcFlash(
      Math.min(25, selectedBreaker.ultimateBreakingCapacityIcu * 0.7),
      clearingTime,
      450,
      selectedBreaker.ratedVoltageUe
    );
  }, [simulationResult, selectedBreaker]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400/20 selection:text-amber-300">
      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedBreaker={selectedBreaker}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          currentBreaker={selectedBreaker}
          simulationResult={simulationResult}
          deratingResult={deratingResult}
          onExploreWorkbench={() => setActiveTab('workbench')}
          onOpenCatalog={() => setIsCatalogOpen(true)}
        />

        {/* Workspace Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          {/* Main Integrated Workbench */}
          {activeTab === 'workbench' && (
            <div className="space-y-10">
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveTab('tcc')}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Zap className="w-3.5 h-3.5" />
                      TRIP STATUS
                    </span>
                    <span className="group-hover:text-amber-400 transition-colors">Inspect →</span>
                  </div>
                  <div className="text-xl font-bold text-white font-mono tabular-nums">
                    {simulationResult.predictedTripTimeSec === Infinity
                      ? 'No Trip (Nominal)'
                      : simulationResult.predictedTripTimeSec < 1
                      ? `${Math.round(simulationResult.predictedTripTimeSec * 1000)} ms`
                      : `${simulationResult.predictedTripTimeSec.toFixed(2)} s`}
                  </div>
                  <div className="text-xs text-slate-400">
                    At {testCurrent.toLocaleString()}A injection ({(testCurrent / settings.Ir).toFixed(2)} × Ir)
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('rul')}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Activity className="w-3.5 h-3.5" />
                      CONTACT LIFE
                    </span>
                    <span className="group-hover:text-amber-400 transition-colors">Inspect →</span>
                  </div>
                  <div className="text-xl font-bold text-white font-mono tabular-nums">
                    32% Wear
                  </div>
                  <div className="text-xs text-slate-400">
                    6,800 electrical cycles remaining
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('derating')}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Thermometer className="w-3.5 h-3.5" />
                      DERATED CONTINUOUS
                    </span>
                    <span className="group-hover:text-amber-400 transition-colors">Inspect →</span>
                  </div>
                  <div className="text-xl font-bold text-white font-mono tabular-nums">
                    {deratingResult.deratedContinuousCurrent} A
                  </div>
                  <div className="text-xs text-slate-400">
                    K_total = {deratingResult.totalDeratingFactor} at {ambientTempC}°C
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('arcflash')}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Flame className="w-3.5 h-3.5" />
                      ARC FLASH HAZARD
                    </span>
                    <span className="group-hover:text-amber-400 transition-colors">Inspect →</span>
                  </div>
                  <div className="text-xl font-bold text-white font-mono tabular-nums">
                    {arcFlash.incidentEnergyCalCm2} cal/cm²
                  </div>
                  <div className="text-xs text-slate-400">
                    NFPA 70E Category {arcFlash.ppeCategory} PPE
                  </div>
                </div>
              </div>

              {/* TCC Plot Section */}
              <TccCurveViewer
                breaker={selectedBreaker}
                settings={settings}
                onUpdateSettings={setSettings}
                testCurrent={testCurrent}
                onUpdateTestCurrent={setTestCurrent}
                simulationResult={simulationResult}
              />

              {/* Multi-Stress Derating Overview */}
              <DeratingHarmonicsCalculator
                breaker={selectedBreaker}
                deratingResult={deratingResult}
                ambientTempC={ambientTempC}
                onUpdateAmbientTemp={setAmbientTempC}
                altitudeMeters={altitudeMeters}
                onUpdateAltitude={setAltitudeMeters}
                thdPercent={thdPercent}
                onUpdateThd={setThdPercent}
                enclosureType={enclosureType}
                onUpdateEnclosure={setEnclosureType}
              />

              {/* RUL & Health Predictor */}
              <RulHealthPredictor breaker={selectedBreaker} />

              {/* Arc Flash & Coordination */}
              <ArcFlashCoordination
                currentBreaker={selectedBreaker}
                tripTimeSec={simulationResult.predictedTripTimeSec}
              />

              {/* Technical Deep Dive */}
              <TechnicalDeepDive />
            </div>
          )}

          {/* Individual Dedicated Tabs */}
          {activeTab === 'tcc' && (
            <TccCurveViewer
              breaker={selectedBreaker}
              settings={settings}
              onUpdateSettings={setSettings}
              testCurrent={testCurrent}
              onUpdateTestCurrent={setTestCurrent}
              simulationResult={simulationResult}
            />
          )}

          {activeTab === 'rul' && (
            <RulHealthPredictor breaker={selectedBreaker} />
          )}

          {activeTab === 'derating' && (
            <DeratingHarmonicsCalculator
              breaker={selectedBreaker}
              deratingResult={deratingResult}
              ambientTempC={ambientTempC}
              onUpdateAmbientTemp={setAmbientTempC}
              altitudeMeters={altitudeMeters}
              onUpdateAltitude={setAltitudeMeters}
              thdPercent={thdPercent}
              onUpdateThd={setThdPercent}
              enclosureType={enclosureType}
              onUpdateEnclosure={setEnclosureType}
            />
          )}

          {activeTab === 'arcflash' && (
            <ArcFlashCoordination
              currentBreaker={selectedBreaker}
              tripTimeSec={simulationResult.predictedTripTimeSec}
            />
          )}

          {activeTab === 'technical' && (
            <TechnicalDeepDive />
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer
        onSelectTab={setActiveTab}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Breaker Catalog Modal */}
      <BreakerCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        selectedBreakerId={selectedBreaker.id}
        onSelectBreaker={handleSelectBreaker}
      />

      {/* Engineering Calculation Export Modal */}
      <EngineeringReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        breaker={selectedBreaker}
        settings={settings}
        simulationResult={simulationResult}
        deratingResult={deratingResult}
        arcFlash={arcFlash}
        testCurrentA={testCurrent}
        ambientTempC={ambientTempC}
        altitudeM={altitudeMeters}
      />
    </div>
  );
}
