import React from 'react';
import { PrisonFacility, Inmate } from '../../types';
import { 
  Building2, 
  Users, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRightLeft, 
  MapPin, 
  Shield 
} from 'lucide-react';

interface MultiPrisonOverviewProps {
  facilities: PrisonFacility[];
  inmates: Inmate[];
  selectedFacilityId: string;
  onSelectFacility: (id: string) => void;
  onOpenNewModal: () => void;
}

export const MultiPrisonOverview: React.FC<MultiPrisonOverviewProps> = ({
  facilities,
  inmates,
  selectedFacilityId,
  onSelectFacility,
  onOpenNewModal
}) => {
  const totalCapacity = facilities.reduce((acc, f) => acc + f.capacity, 0);
  const totalCurrentInmates = facilities.reduce((acc, f) => acc + f.currentInmates, 0);
  const nationalOccupancy = Math.round((totalCurrentInmates / totalCapacity) * 100);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Top Directorate Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-[#714B67] text-white font-mono font-bold px-2 py-0.5 rounded">
              NATIONAL HEADQUARTERS
            </span>
            <span className="text-xs text-slate-500">Ministry of Interior & National Administration</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#714B67]" />
            National Directorate of Correctional Services - Multi-Prison ERP
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized monitoring and cross-facility bed allocation across 5 national penitentiaries and remand centers.
          </p>
        </div>

        {/* National Aggregates */}
        <div className="flex items-center space-x-3 text-right">
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
            <div className="text-[10px] uppercase font-bold text-slate-500">National Occupancy</div>
            <div className={`text-xl font-mono font-extrabold ${nationalOccupancy > 100 ? 'text-rose-600' : 'text-slate-900'}`}>
              {nationalOccupancy}%
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
            <div className="text-[10px] uppercase font-bold text-slate-500">Total Inmates / Beds</div>
            <div className="text-xl font-mono font-bold text-slate-800">
              {totalCurrentInmates} / {totalCapacity}
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {facilities.map(fac => {
          const isOvercrowded = fac.currentInmates > fac.capacity;
          const occupancyRate = Math.round((fac.currentInmates / fac.capacity) * 100);
          const isSelected = selectedFacilityId === fac.id;
          const facilityInmates = inmates.filter(i => i.facilityId === fac.id);

          return (
            <div
              key={fac.id}
              className={`bg-white rounded-lg border transition-all shadow-xs p-5 flex flex-col justify-between ${
                isSelected ? 'border-[#714B67] ring-2 ring-[#714B67]/20 shadow-md' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header: Code & Type badge */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {fac.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    fac.type === 'maximum' ? 'bg-rose-100 text-rose-800' :
                    fac.type === 'womens' ? 'bg-purple-100 text-purple-800' :
                    fac.type === 'minimum' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {fac.type} security
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                  {fac.name}
                </h3>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{fac.location} ({fac.county} County)</span>
                </div>

                {/* Overcrowding meter */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-slate-600 font-medium">Beds Occupied:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {fac.currentInmates} / {fac.capacity} ({occupancyRate}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancyRate > 100
                          ? 'bg-rose-600'
                          : occupancyRate > 85
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>

                  {isOvercrowded && (
                    <div className="mt-2 text-[11px] text-rose-700 font-semibold flex items-center gap-1 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Overcrowded by +{fac.currentInmates - fac.capacity} inmates! Recommend transfer.</span>
                    </div>
                  )}
                </div>

                {/* Warden & Rating */}
                <div className="mt-4 text-xs text-slate-600 space-y-1">
                  <div>Superintendent: <strong>{fac.wardenName}</strong></div>
                  <div>Security Specification: <span className="font-mono text-slate-700 font-medium">{fac.securityRating}</span></div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  {facilityInmates.length} Sample Profiles
                </span>
                <button
                  onClick={() => onSelectFacility(fac.id)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-[#714B67] text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {isSelected ? 'Active Context' : 'Filter Facility'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
