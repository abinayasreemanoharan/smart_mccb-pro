/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BreakerModel,
  TripUnitSettings,
  SimulationResult,
  OperatingZone,
  RulHealthMetrics,
  DeratingResult,
  ArcFlashResult,
  SelectivityPair
} from '../types/mccb';

/**
 * Predicts the exact tripping time and operating regime of an MCCB
 * given test current and trip unit parameters.
 */
export function calculateTripTime(
  breaker: BreakerModel,
  settings: TripUnitSettings,
  testCurrentA: number
): SimulationResult {
  const { Ir, tr, Isd, tsd, i2tShortTime, Ii } = settings;
  const icuA = breaker.ultimateBreakingCapacityIcu * 1000;

  // Catastrophic limit check
  if (testCurrentA > icuA) {
    return {
      predictedTripTimeSec: 0.015,
      operatingZone: 'exceeds-breaking-capacity',
      letThroughEnergyA2s: Math.round(testCurrentA * testCurrentA * 0.02),
      peakCutoffCurrentkA: Math.round((testCurrentA * 1.8) / 100) / 10,
      isTripping: true,
      zoneDescription: `Exceeds ultimate breaking capacity Icu (${breaker.ultimateBreakingCapacityIcu}kA). High risk of terminal flashover or contact weld.`
    };
  }

  // Nominal non-tripping threshold (IEC 60947-2 non-tripping limit is 1.05 x Ir)
  if (testCurrentA <= Ir * 1.05) {
    return {
      predictedTripTimeSec: Infinity,
      operatingZone: 'nominal',
      letThroughEnergyA2s: 0,
      peakCutoffCurrentkA: Math.round((testCurrentA * 1.414) / 100) / 10,
      isTripping: false,
      zoneDescription: 'Continuous normal operation within nominal thermal limits (I ≤ 1.05 × Ir).'
    };
  }

  let tripTimeSec = Infinity;
  let zone: OperatingZone = 'thermal-overload';
  let description = '';

  // 1. Instantaneous Trip Check (Ii)
  if (testCurrentA >= Ii) {
    // Mechanical latch release + arc chute extinction time ~18ms to 30ms
    tripTimeSec = 0.022; // 22 ms
    zone = 'instantaneous';
    description = `Instantaneous electromagnetic/electronic trip (I ≥ ${Ii}A). High-speed contact separation.`;
  }
  // 2. Short-time pick-up check (Isd)
  else if (testCurrentA >= Isd) {
    zone = 'short-time-delay';
    if (i2tShortTime) {
      // I²t inverse delay curve for selectivity coordination
      // Formula: t = tsd * (8 * Ir / I)^2, clamped to tsd
      const ratio = (8 * Ir) / testCurrentA;
      const i2tTime = tsd * ratio * ratio;
      tripTimeSec = Math.max(tsd, Math.min(i2tTime, 2.5));
      description = `Short-time delay with I²t curve active (I ≥ ${Isd}A, tsd = ${tsd}s).`;
    } else {
      // Flat definite time delay
      tripTimeSec = tsd;
      description = `Short-time definite delay active (I ≥ ${Isd}A, tsd = ${tsd}s).`;
    }
  }
  // 3. Thermal Overload / Long-time delay (Ir)
  else {
    zone = 'thermal-overload';
    // Standard IEC 60947-2 Long-time inverse curve:
    // At 6 * Ir, time is exactly tr
    // t = tr * (6 * Ir / I)^2
    const currentMultiple = testCurrentA / Ir;
    const denominator = Math.max(0.01, Math.pow(currentMultiple, 2) - 1);
    tripTimeSec = tr * (35 / denominator); // Calibrated standard inverse curve
    // Cap reasonable bounds
    tripTimeSec = Math.max(0.5, Math.min(tripTimeSec, 7200));
    description = `Thermal overload / Long-time inverse delay active (${currentMultiple.toFixed(2)} × Ir).`;
  }

  // Calculate let-through energy I²t (A²s)
  // Current-limiting effect reduces the effective integral
  const currentLimitingFactor = testCurrentA > 5000 ? 0.45 : 0.75;
  const letThroughEnergy = Math.round(
    Math.pow(testCurrentA, 2) * Math.min(tripTimeSec, 0.1) * currentLimitingFactor
  );

  // Peak cut-off current (kA)
  const prospectivePeakKA = (testCurrentA * Math.sqrt(2) * 1.5) / 1000;
  // Current limiting effect caps peak cut-off
  const limitationCutoffKA = 0.8 * Math.pow(testCurrentA / 1000, 0.72) * (breaker.ratedCurrentIn / 100);
  const peakCutoff = testCurrentA > 3000 ? Math.min(prospectivePeakKA, limitationCutoffKA) : prospectivePeakKA;

  return {
    predictedTripTimeSec: Math.round(tripTimeSec * 1000) / 1000,
    operatingZone: zone,
    letThroughEnergyA2s: letThroughEnergy,
    peakCutoffCurrentkA: Math.round(peakCutoff * 10) / 10,
    isTripping: true,
    zoneDescription: description
  };
}

/**
 * Generates coordinate points (Current A vs Time S) for plotting
 * Log-Log Time-Current Characteristic (TCC) curves.
 */
export interface TccCurvePoint {
  currentA: number;
  timeSec: number;
}

export function generateTccCurvePoints(
  breaker: BreakerModel,
  settings: TripUnitSettings
): {
  nominalLine: TccCurvePoint[];
  tripBoundary: TccCurvePoint[];
  instantaneousBoundary: TccCurvePoint[];
} {
  const { Ir, tr, Isd, tsd, i2tShortTime, Ii } = settings;
  const icuA = breaker.ultimateBreakingCapacityIcu * 1000;

  const tripBoundary: TccCurvePoint[] = [];

  // Generate points from 1.08 * Ir up to icuA using logarithmic stepping
  const minCurrent = Ir * 1.08;
  const steps = 60;
  const logMin = Math.log10(minCurrent);
  const logMax = Math.log10(icuA);

  for (let i = 0; i <= steps; i++) {
    const current = Math.pow(10, logMin + (i / steps) * (logMax - logMin));
    const result = calculateTripTime(breaker, settings, current);
    if (result.isTripping && result.predictedTripTimeSec < 10000) {
      tripBoundary.push({
        currentA: Math.round(current),
        timeSec: result.predictedTripTimeSec
      });
    }
  }

  // Nominal vertical boundary (continuous rating)
  const nominalLine: TccCurvePoint[] = [
    { currentA: Ir, timeSec: 10000 },
    { currentA: Ir, timeSec: 0.01 }
  ];

  // Instantaneous trip vertical boundary
  const instantaneousBoundary: TccCurvePoint[] = [
    { currentA: Ii, timeSec: 1 },
    { currentA: Ii, timeSec: 0.02 }
  ];

  return {
    nominalLine,
    tripBoundary,
    instantaneousBoundary
  };
}

/**
 * Remaining Useful Life (RUL) & Contact Degradation physics model
 */
export function calculateRulMetrics(
  breaker: BreakerModel,
  totalOps: number,
  faultClearingCount: number,
  measuredResistanceUohm: number,
  monthsInService: number
): RulHealthMetrics {
  const { electricalEndurance, mechanicalEndurance, baselineContactResistanceMicroOhm, criticalContactResistanceMicroOhm } = breaker;

  // 1. Mechanical ops wear fraction
  const mechWear = (totalOps / mechanicalEndurance) * 100;

  // 2. Electrical contact erosion from normal load switching
  const normalLoadWear = (totalOps / electricalEndurance) * 100;

  // 3. Severe arc erosion from fault clearing
  // High energy arc vaporizes silver-tungsten contact alloy
  const faultWear = faultClearingCount * 12.5;

  // 4. Contact resistance degradation factor
  const resIncrease = Math.max(0, measuredResistanceUohm - baselineContactResistanceMicroOhm);
  const maxAllowableDelta = criticalContactResistanceMicroOhm - baselineContactResistanceMicroOhm;
  const resistanceDegradationRatio = Math.min(1.5, resIncrease / maxAllowableDelta);
  const resistanceWearPenalty = resistanceDegradationRatio * 45;

  // Aggregate total contact wear percentage
  const totalWear = Math.min(
    100,
    Math.round((normalLoadWear * 0.25 + faultWear * 0.45 + resistanceWearPenalty * 0.3) * 10) / 10
  );

  // Remaining electrical cycles estimation
  const remainingLifeRatio = Math.max(0, 1 - totalWear / 100);
  const remainingCycles = Math.round(electricalEndurance * remainingLifeRatio);

  // MTTF calculation based on operations cadence
  const opsPerMonth = monthsInService > 0 ? totalOps / monthsInService : 15;
  const remainingMonths = opsPerMonth > 0 ? remainingCycles / opsPerMonth : 60;
  const mttfHours = Math.round(remainingMonths * 30 * 24);

  // Contact mass loss estimation (typical 630A MCCB contact mass ~18g)
  const nominalContactMass = breaker.ratedCurrentIn > 400 ? 24 : 12;
  const contactMassLoss = Math.round((nominalContactMass * (totalWear / 100)) * 10) / 10;

  // Arc chute soot buildup index (0 - 100)
  const sootIndex = Math.min(100, Math.round(faultClearingCount * 22 + (totalOps / 1000) * 4));

  // Determine health status
  let healthStatus: RulHealthMetrics['healthStatus'] = 'optimal';
  if (totalWear >= 80 || measuredResistanceUohm >= criticalContactResistanceMicroOhm) {
    healthStatus = 'replace-immediately';
  } else if (totalWear >= 60 || measuredResistanceUohm >= criticalContactResistanceMicroOhm * 0.8) {
    healthStatus = 'critical-inspection';
  } else if (totalWear >= 35) {
    healthStatus = 'moderate-wear';
  }

  return {
    totalOperations: totalOps,
    faultClearingCount,
    measuredContactResistanceMicroOhm: measuredResistanceUohm,
    installationAgeMonths: monthsInService,
    wearPercentage: totalWear,
    remainingElectricalCycles: remainingCycles,
    predictedMttfHours: mttfHours,
    healthStatus,
    contactMassLossGrams: contactMassLoss,
    arcChuteSootIndex: sootIndex
  };
}

/**
 * Multi-stress environmental and harmonic derating model
 */
export function calculateDerating(
  ratedCurrentIn: number,
  ambientTempC: number,
  altitudeMeters: number,
  thdPercent: number,
  enclosureType: 'ip30-open' | 'ip42-ventilated' | 'ip54-sealed' | 'ip65-sealed'
): DeratingResult {
  // 1. Ambient Temperature Derating (Standard base: 40°C)
  let kt = 1.0;
  if (ambientTempC <= 30) {
    kt = 1.05;
  } else if (ambientTempC <= 40) {
    kt = 1.00;
  } else if (ambientTempC <= 50) {
    kt = 0.94;
  } else if (ambientTempC <= 60) {
    kt = 0.87;
  } else {
    // 70°C extreme ambient
    kt = 0.80;
  }

  // 2. Altitude Derating (Standard base: <= 2000m)
  let ka = 1.0;
  if (altitudeMeters > 2000) {
    const extraKm = (altitudeMeters - 2000) / 1000;
    ka = Math.max(0.85, 1.0 - extraKm * 0.05); // ~5% reduction per 1000m above 2000m
  }

  // 3. Harmonic Distortion Derating (Skin effect & eddy current heating from non-linear loads)
  // Derating factor = 1 / sqrt(1 + (THD/100)^2 * 1.5)
  const kh = 1 / Math.sqrt(1 + Math.pow(thdPercent / 100, 2) * 1.6);

  // 4. Enclosure derating
  let ke = 1.0;
  switch (enclosureType) {
    case 'ip30-open':
      ke = 1.0;
      break;
    case 'ip42-ventilated':
      ke = 0.96;
      break;
    case 'ip54-sealed':
      ke = 0.88;
      break;
    case 'ip65-sealed':
      ke = 0.82;
      break;
  }

  const totalDerating = Math.round(kt * ka * kh * ke * 1000) / 1000;
  const deratedCurrent = Math.round(ratedCurrentIn * totalDerating * 10) / 10;

  // Terminal temperature rise prediction
  // Nominal temperature rise delta at 40°C is ~50K (standard terminal limit 70°C rise)
  const baseDeltaT = 50;
  const actualRise = Math.round(baseDeltaT * Math.pow(ratedCurrentIn / (deratedCurrent || 1), 1.8));

  return {
    temperatureFactor: Math.round(kt * 100) / 100,
    altitudeFactor: Math.round(ka * 100) / 100,
    harmonicsFactor: Math.round(kh * 100) / 100,
    enclosureFactor: Math.round(ke * 100) / 100,
    totalDeratingFactor: totalDerating,
    deratedContinuousCurrent: deratedCurrent,
    predictedTerminalTempRiseDeltaC: actualRise,
    isOverloadedAtNominal: totalDerating < 0.95
  };
}

/**
 * IEEE 1584-2018 Arc Flash Incident Energy & Boundary Prediction
 */
export function calculateArcFlash(
  boltedFaultCurrentkA: number,
  clearingTimeSeconds: number,
  workingDistanceMm: number = 450,
  systemVoltageV: number = 415
): ArcFlashResult {
  // Arcing current calculation for Low Voltage (< 1000V)
  // IEEE 1584 estimate: Iarc ≈ 0.82 * Ibf
  const arcingCurrentkA = Math.round(boltedFaultCurrentkA * 0.82 * 10) / 10;

  // Incident Energy (cal/cm²) calculation
  // E = 4.184 * Cf * En * (t / 0.2) * (610 / D)^x
  const cf = 1.0; // Enclosure box factor
  const dNorm = workingDistanceMm / 610; // normalized to 24 inches
  const en = Math.pow(arcingCurrentkA / 15, 0.95) * (systemVoltageV / 400);
  const timeFactor = Math.min(2.0, clearingTimeSeconds / 0.2);
  const distFactor = Math.pow(1 / Math.max(0.3, dNorm), 1.47);

  const incidentEnergy = Math.round(4.184 * cf * en * timeFactor * distFactor * 10) / 10;

  // Arc Flash Boundary distance (mm) where energy drops to 1.2 cal/cm² (threshold of 2nd degree burn)
  const boundaryMm = Math.round(
    workingDistanceMm * Math.pow(Math.max(1.0, incidentEnergy / 1.2), 1 / 1.47)
  );

  // NFPA 70E PPE Category determination
  let ppeCategory: ArcFlashResult['ppeCategory'] = 1;
  let ppeRequirement = 'Category 1: Arc-rated long-sleeve shirt and pants (Min 4 cal/cm²), safety glasses, leather gloves.';

  if (incidentEnergy > 40) {
    ppeCategory = 'dangerous';
    ppeRequirement = 'Extreme Danger: Incident energy exceeds 40 cal/cm²! De-energize equipment prior to opening panel.';
  } else if (incidentEnergy > 25) {
    ppeCategory = 4;
    ppeRequirement = 'Category 4: Arc flash suit multi-layer system (Min 40 cal/cm²), flash hood, heavy-duty insulating gloves.';
  } else if (incidentEnergy > 8) {
    ppeCategory = 3;
    ppeRequirement = 'Category 3: Arc flash suit system (Min 25 cal/cm²), arc-rated flash hood, insulated gloves.';
  } else if (incidentEnergy > 4) {
    ppeCategory = 2;
    ppeRequirement = 'Category 2: Arc-rated shirt and pants with flash hood or faceshield (Min 8 cal/cm²), leather work shoes.';
  }

  return {
    boltedFaultCurrentkA,
    arcingCurrentkA,
    clearingTimeSeconds,
    incidentEnergyCalCm2: incidentEnergy,
    arcFlashBoundaryMm: boundaryMm,
    ppeCategory,
    ppeRequirement
  };
}

/**
 * Upstream vs Downstream Selectivity & Cascading evaluation (IEC 60947-2 Annex A)
 */
export function evaluateSelectivity(
  upstream: BreakerModel,
  downstream: BreakerModel,
  prospectiveFaultCurrentkA: number
): SelectivityPair {
  const faultCurrentA = prospectiveFaultCurrentkA * 1000;

  // Upstream breaker trip time
  const upResult = calculateTripTime(upstream, upstream.defaultSettings, faultCurrentA);
  // Downstream breaker trip time
  const downResult = calculateTripTime(downstream, downstream.defaultSettings, faultCurrentA);

  // Discrimination limit current Is:
  // Downstream instantaneous pickup or upstream short-time pick-up
  const selectivityLimitCurrentkA = Math.round((upstream.defaultSettings.Isd * 0.95) / 100) / 10;
  const isTotallySelective = prospectiveFaultCurrentkA <= selectivityLimitCurrentkA;

  // Reinforced breaking capacity through cascading
  const cascadingReinforcedIcu = Math.round(
    downstream.ultimateBreakingCapacityIcu + upstream.ultimateBreakingCapacityIcu * 0.4
  );

  const margin = Math.round((upResult.predictedTripTimeSec - downResult.predictedTripTimeSec) * 1000) / 1000;

  return {
    upstreamBreaker: upstream,
    downstreamBreaker: downstream,
    prospectiveFaultCurrentkA,
    selectivityLimitCurrentkA,
    isTotallySelective,
    cascadingReinforcedIcu,
    upstreamTripTimeSec: upResult.predictedTripTimeSec,
    downstreamTripTimeSec: downResult.predictedTripTimeSec,
    coordinationMarginSec: Math.max(0, margin)
  };
}
