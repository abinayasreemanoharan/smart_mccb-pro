/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { X, Search, Filter, Check, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { BreakerModel, TripUnitType } from '../types/mccb';
import { BREAKER_CATALOG } from '../data/breakerCatalog';

interface BreakerCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBreakerId: string;
  onSelectBreaker: (breaker: BreakerModel) => void;
}

export const BreakerCatalogModal: React.FC<BreakerCatalogModalProps> = ({
  isOpen,
  onClose,
  selectedBreakerId,
  onSelectBreaker
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all');
  const [selectedTripType, setSelectedTripType] = useState<string>('all');

  const manufacturers = useMemo(() => {
    return Array.from(new Set(BREAKER_CATALOG.map((b) => b.manufacturer)));
  }, []);

  const filteredBreakers = useMemo(() => {
    return BREAKER_CATALOG.filter((b) => {
      const matchesSearch =
        b.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMfg = selectedManufacturer === 'all' || b.manufacturer === selectedManufacturer;
      const matchesTrip = selectedTripType === 'all' || b.tripUnitType === selectedTripType;

      return matchesSearch && matchesMfg && matchesTrip;
    });
  }, [searchTerm, selectedManufacturer, selectedTripType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Standard MCCB Model Library
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select calibrated manufacturer profiles to populate trip curves, contact metallurgy, and endurance limits.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search breaker model, series, or rating..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Manufacturers</option>
              {manufacturers.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={selectedTripType}
              onChange={(e) => setSelectedTripType(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Trip Units</option>
              <option value="thermal-magnetic">Thermal-Magnetic</option>
              <option value="electronic-lsig">Electronic LSIG</option>
            </select>
          </div>
        </div>

        {/* Breaker Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredBreakers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No circuit breaker matches the selected criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredBreakers.map((b) => {
                const isSelected = b.id === selectedBreakerId;
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      onSelectBreaker(b);
                      onClose();
                    }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400 text-white'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[11px] font-mono text-amber-400 font-semibold uppercase">
                          {b.manufacturer} · {b.series}
                        </div>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {b.modelName}
                        </h4>
                      </div>
                      {isSelected ? (
                        <span className="p-1 rounded bg-amber-400 text-slate-950">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-slate-400">
                          {b.poles}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono tabular-nums">
                      <div>
                        <div className="text-slate-500">RATING In</div>
                        <div className="text-white font-semibold">{b.ratedCurrentIn} A</div>
                      </div>
                      <div>
                        <div className="text-slate-500">CAPACITY Icu</div>
                        <div className="text-amber-400 font-semibold">{b.ultimateBreakingCapacityIcu} kA</div>
                      </div>
                      <div>
                        <div className="text-slate-500">TRIP UNIT</div>
                        <div className="text-slate-300 capitalize">{b.tripUnitType === 'electronic-lsig' ? 'LSIG' : 'TMD'}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                      <span>Baseline R₀: {b.baselineContactResistanceMicroOhm} µΩ</span>
                      <span>Endurance: {b.electricalEndurance.toLocaleString()} ops</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Showing {filteredBreakers.length} of {BREAKER_CATALOG.length} models</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
