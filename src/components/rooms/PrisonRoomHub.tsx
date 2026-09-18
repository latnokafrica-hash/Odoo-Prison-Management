import React, { useState } from 'react';
import { Language, CellBlock, CellRoom, CellMaintenance } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { 
  Building2, Wrench, Shield, CheckCircle, AlertTriangle, 
  Bed, Droplets, Eye, Wind, Plus, CheckCircle2, ChevronRight
} from 'lucide-react';
import { INITIAL_CELL_BLOCKS, INITIAL_CELL_ROOMS, INITIAL_CELL_MAINTENANCE } from '../../data/newModuleData';

interface PrisonRoomHubProps {
  language: Language;
}

export const PrisonRoomHub: React.FC<PrisonRoomHubProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'cells' | 'blocks' | 'maintenance'>('cells');
  const [rooms, setRooms] = useState<CellRoom[]>(INITIAL_CELL_ROOMS);
  const [blocks] = useState<CellBlock[]>(INITIAL_CELL_BLOCKS);
  const [maintenance, setMaintenance] = useState<CellMaintenance[]>(INITIAL_CELL_MAINTENANCE);

  const handleCompleteMaintenance = (id: string) => {
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status: 'completed' } : m));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded">
              Odoo 19 Facilities Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">model: prison.facility.cell</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {language === 'fr' ? 'Gestion des Bâtiments, Cellules & Équipements' : 'Cell Blocks, Detention Rooms & Facilities Management'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'fr'
              ? 'Contrôle des capacités en lits, normes de salubrité Nelson Mandela, vidéosurveillance et maintenance des serrures blindées.'
              : 'Bed capacity compliance, sanitary and natural light fixtures, anti-ligature fixtures, and security locks maintenance.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('cells')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'cells' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'fr' ? 'Cellules & Chambres' : 'Detention Cells'}
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'blocks' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'fr' ? 'Bâtiments & Quartiers' : 'Cell Blocks'}
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'maintenance' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'fr' ? 'Ordres de Travail Maintenance' : 'Work Orders'}
          </button>
        </div>
      </div>

      {activeTab === 'cells' && (
        /* Cells Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(cell => (
            <div key={cell.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{cell.name}</h4>
                  <p className="text-xs text-slate-500">{cell.blockName}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  cell.securityLevel === 'CAT_A' 
                    ? 'bg-rose-100 text-rose-800' 
                    : cell.securityLevel === 'CAT_B'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {cell.securityLevel}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">{language === 'fr' ? 'Capacité / Occupants' : 'Bed Capacity / Inmates'}</span>
                  <span className="font-bold text-slate-900 text-sm">{cell.currentOccupancy} / {cell.capacity}</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-semibold text-xs ${
                  cell.currentOccupancy >= cell.capacity 
                    ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {cell.currentOccupancy >= cell.capacity ? (language === 'fr' ? 'COMPLÈTE' : 'FULL') : (language === 'fr' ? 'PLACES DISPO' : 'AVAILABLE')}
                </span>
              </div>

              {/* Occupants list */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  {language === 'fr' ? 'Détenus Affectés :' : 'Current Occupants:'}
                </span>
                <div className="space-y-1">
                  {cell.inmateNames.map((name, idx) => (
                    <div key={idx} className="text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded truncate">
                      • {name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fixtures checklist */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  {language === 'fr' ? 'Équipements de Sécurité & Salubrité :' : 'Fixtures & Amenities:'}
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <span className={`flex items-center gap-1 ${cell.hasSanitaryToilet ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <Droplets className="w-3.5 h-3.5" />
                    {language === 'fr' ? 'WC Inox' : 'Stainless WC'}
                  </span>
                  <span className={`flex items-center gap-1 ${cell.hasRunningWater ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    {language === 'fr' ? 'Eau Courante' : 'Running Water'}
                  </span>
                  <span className={`flex items-center gap-1 ${cell.hasNaturalWindow ? 'text-emerald-700' : 'text-slate-400'}`}>
                    <Wind className="w-3.5 h-3.5" />
                    {language === 'fr' ? 'Fenêtre Naturelle' : 'Natural Light'}
                  </span>
                  <span className={`flex items-center gap-1 ${cell.hasCCTV ? 'text-indigo-700' : 'text-slate-400'}`}>
                    <Eye className="w-3.5 h-3.5" />
                    {language === 'fr' ? 'Caméra CCTV' : 'CCTV Camera'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'blocks' && (
        /* Blocks List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blocks.map(block => (
            <div key={block.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-500">{block.code}</span>
                  <h4 className="font-bold text-slate-900 text-base">{block.name}</h4>
                  <p className="text-xs text-slate-500">{block.facilityName}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                  {block.blockType.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded bg-slate-50">
                  <span className="text-slate-500 block text-[11px]">{language === 'fr' ? 'Cellules' : 'Cells'}</span>
                  <span className="font-bold text-slate-900 text-sm">{block.totalCells}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50">
                  <span className="text-slate-500 block text-[11px]">{language === 'fr' ? 'Lits Certifiés' : 'Capacity'}</span>
                  <span className="font-bold text-slate-900 text-sm">{block.capacity}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50">
                  <span className="text-slate-500 block text-[11px]">{language === 'fr' ? 'Occupants' : 'Inmates'}</span>
                  <span className="font-bold text-slate-900 text-sm">{block.currentOccupancy}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span>{language === 'fr' ? 'Taux d\'occupation' : 'Occupancy Rate'}</span>
                  <span className="font-bold">{block.occupancyRate}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full ${
                      block.occupancyRate > 90 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, block.occupancyRate)}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>{language === 'fr' ? 'Officier Responsable :' : 'Block Supervisor:'} <strong>{block.supervisor}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'maintenance' && (
        /* Maintenance Work Orders */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              {language === 'fr' ? 'Interventions Techniques & Remplacement des Serrures de Sécurité' : 'Cell Hardware & Lock Maintenance Orders'}
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {maintenance.map(wo => (
              <div key={wo.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{wo.orderRef}</span>
                    <span className="font-medium text-slate-700 text-xs">({wo.cellName})</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      wo.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {wo.priority.toUpperCase()}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      wo.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {wo.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-1">
                    {wo.notes}
                  </p>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {wo.facilityName} • {language === 'fr' ? 'Déclaré par :' : 'Reported by:'} {wo.reportedBy} ({wo.requestDate})
                  </p>
                </div>

                <div>
                  {wo.status !== 'completed' ? (
                    <button
                      onClick={() => handleCompleteMaintenance(wo.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
                    >
                      {language === 'fr' ? 'Valider Réparation' : 'Certify Repair'}
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {language === 'fr' ? 'Opérationnel' : 'Operational'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
