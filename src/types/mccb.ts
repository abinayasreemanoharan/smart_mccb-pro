/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TripUnitType = 'thermal-magnetic' | 'electronic-lsig';

export type PoleConfiguration = '3P' | '4P';

export type OperatingZone = 
  | 'nominal'
  | 'thermal-overload'
  | 'short-time-delay'
  | 'instantaneous'
  | 'exceeds-breaking-capacity';

export interface TripUnitSettings {
  type: TripUnitType;
  // Thermal / Long-time
  Ir: number; // Long-time pickup current (A)
  tr: number; // Long-time delay (seconds at 6 x Ir)
  // Short-time
  Isd: number; // Short-time pickup current (A or multiple of Ir)
  tsd: number; // Short-time delay (seconds, e.g. 0.1 - 0.4s)
  i2tShortTime: boolean; // I²t response curve for short time
  // Instantaneous
  Ii: number; // Instantaneous pickup current (A or multiple of In)
  // Ground fault (for LSIG)
  Ig?: number;
  tg?: number;
}

export interface BreakerModel {
  id: string;
  manufacturer: string;
  series: string;
  modelName: string;
  ratedCurrentIn: number; // In (Amperes)
  poles: PoleConfiguration;
  ratedVoltageUe: number; // e.g. 415V or 690V
  ultimateBreakingCapacityIcu: number; // Icu in kA at 415V
  serviceBreakingCapacityIcs: number; // Ics in kA (% of Icu)
  tripUnitType: TripUnitType;
  defaultSettings: TripUnitSettings;
  mechanicalEndurance: number; // Mechanical operations (e.g. 25,000)
  electricalEndurance: number; // Electrical operations at In (e.g. 10,000)
  baselineContactResistanceMicroOhm: number; // Baseline clean contacts (e.g. 35 µΩ)
  criticalContactResistanceMicroOhm: number; // Maximum limit before replacement (e.g. 150 µΩ)
  weightKg: number;
  terminalType: string;
}

export interface SimulationParameters {
  testCurrent: number; // Test current in Amperes
  systemVoltage: number; // In Volts (e.g. 415V)
  powerFactor: number; // e.g. 0.85
  ambientTemperature: number; // In °C (default 40°C)
  altitudeMeters: number; // In meters (default 0m)
  thdCurrentPercent: number; // THD-I % (default 5%)
  enclosureType: 'ip30-open' | 'ip42-ventilated' | 'ip54-sealed' | 'ip65-sealed';
  workingDistanceMm: number; // IEEE 1584 distance (default 450mm)
}

export interface SimulationResult {
  predictedTripTimeSec: number;
  operatingZone: OperatingZone;
  letThroughEnergyA2s: number;
  peakCutoffCurrentkA: number;
  isTripping: boolean;
  zoneDescription: string;
}

export interface RulHealthMetrics {
  totalOperations: number;
  faultClearingCount: number;
  measuredContactResistanceMicroOhm: number;
  installationAgeMonths: number;
  wearPercentage: number;
  remainingElectricalCycles: number;
  predictedMttfHours: number;
  healthStatus: 'optimal' | 'moderate-wear' | 'critical-inspection' | 'replace-immediately';
  contactMassLossGrams: number;
  arcChuteSootIndex: number; // 0 - 100
}

export interface DeratingResult {
  temperatureFactor: number;
  altitudeFactor: number;
  harmonicsFactor: number;
  enclosureFactor: number;
  totalDeratingFactor: number;
  deratedContinuousCurrent: number;
  predictedTerminalTempRiseDeltaC: number;
  isOverloadedAtNominal: boolean;
}

export interface ArcFlashResult {
  boltedFaultCurrentkA: number;
  arcingCurrentkA: number;
  clearingTimeSeconds: number;
  incidentEnergyCalCm2: number;
  arcFlashBoundaryMm: number;
  ppeCategory: 1 | 2 | 3 | 4 | 'dangerous';
  ppeRequirement: string;
}

export interface SelectivityPair {
  upstreamBreaker: BreakerModel;
  downstreamBreaker: BreakerModel;
  prospectiveFaultCurrentkA: number;
  selectivityLimitCurrentkA: number;
  isTotallySelective: boolean;
  cascadingReinforcedIcu: number;
  upstreamTripTimeSec: number;
  downstreamTripTimeSec: number;
  coordinationMarginSec: number;
}
