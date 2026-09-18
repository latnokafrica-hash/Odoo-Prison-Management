import React from 'react';
import { X, Shield, Lock, Check, CheckCircle2, AlertCircle, FileCode, Users, Key } from 'lucide-react';
import { UserRole, Language } from '../../types';
import { USER_ROLES, ODOO_IR_MODEL_ACCESS } from '../../data/rolesData';

interface AccessControlMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  language: Language;
}

export const AccessControlMatrixModal: React.FC<AccessControlMatrixModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  language
}) => {
  if (!isOpen) return null;

  const roles = Object.values(USER_ROLES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#714B67] text-white px-6 py-4 flex items-center justify-between border-b border-[#5e3c55]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Shield className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
                <span>{language === 'fr' ? 'Contrôle d\'Accès Interne Odoo 19' : 'Odoo 19 Internal Access Control Matrix'}</span>
                <span className="text-[10px] bg-white/20 text-white font-mono px-2 py-0.5 rounded font-bold">
                  ir.model.access.csv
                </span>
              </h2>
              <p className="text-xs text-purple-200">
                {language === 'fr'
                  ? 'Gestion des groupes d\'utilisateurs (res.groups) et droits CRUD par modèle'
                  : 'User security groups (res.groups) and CRUD model permissions'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Quick Role Switcher Row */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                {language === 'fr' ? 'Changer de Rôle Actif' : 'Switch Active User Role'}
              </span>
              <span className="text-[11px] text-slate-500">
                {language === 'fr' ? 'Sélectionnez un profil pour tester les restrictions' : 'Select a profile to test UI permissions'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {roles.map(r => {
                const isSelected = currentRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => onSelectRole(r.id)}
                    className={`p-3 rounded-lg border text-left transition-all relative ${
                      isSelected 
                        ? 'border-purple-600 bg-purple-50/70 shadow-sm ring-2 ring-purple-600/20' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-700" />
                      </div>
                    )}
                    <div className="flex items-center space-x-2 mb-1.5">
                      <div className={`w-7 h-7 rounded-full ${r.avatarColor} font-bold text-xs flex items-center justify-center shadow-2xs`}>
                        {r.avatarText}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-snug">{r.name}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                          {language === 'fr' ? r.titleFr : r.title}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-purple-800 bg-purple-100/70 px-1.5 py-0.5 rounded inline-block mb-1">
                      {r.odooGroupXmlId.split('.')[1]}
                    </div>

                    <div className="text-[10px] text-slate-600 line-clamp-2">
                      {language === 'fr' ? r.descriptionFr : r.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sensitive Modules Notice */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <strong className="font-bold">
                {language === 'fr' ? 'Isolation des Modules Sensibles :' : 'Sensitive Modules Access Isolation:'}
              </strong>{' '}
              {language === 'fr'
                ? 'Les modules "Levée d\'Écrou & Bons de Sortie" (discharge) et "Calculs de Peines & Réductions 1/3" (sentence) sont strictement restreints. Le rôle "Gardien" (Officer) et le rôle "Médecin" (Medical) ne voient pas ces onglets dans le menu, conformément aux règles ir.rule et res.groups.'
                : 'Modules like "Inmate Discharge & Gate Pass" and "Sentence & Remission Engine" are restricted. Custody Guards and Medical Officers do not see these menus, enforcing Odoo ir.rule and res.groups policies.'}
            </div>
          </div>

          {/* Detailed Permissions Table (ir.model.access.csv representation) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-slate-600" />
                {language === 'fr' ? 'Matrice des Droits CRUD (security/ir.model.access.csv)' : 'CRUD Permissions Matrix (security/ir.model.access.csv)'}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                R: Read • W: Write • C: Create • U: Unlink (Delete)
              </span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Odoo Model</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-2 text-center bg-blue-50/70 text-blue-900">Officer (Guard)</th>
                    <th className="py-2.5 px-2 text-center bg-emerald-50/70 text-emerald-900">Medical Officer</th>
                    <th className="py-2.5 px-2 text-center bg-purple-50/70 text-purple-900">Records Clerk</th>
                    <th className="py-2.5 px-2 text-center bg-amber-50/70 text-amber-900">Superintendent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {ODOO_IR_MODEL_ACCESS.map((perm, idx) => {
                    const isSensitive = perm.model === 'prison.discharge' || perm.model === 'prison.sentence';
                    return (
                      <tr key={perm.model} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                          {isSensitive && <Lock className="w-3 h-3 text-rose-500 shrink-0" />}
                          <span>{perm.model}</span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-600">
                          {language === 'fr' ? perm.nameFr : perm.name}
                        </td>
                        
                        {/* Officer */}
                        <td className="py-2.5 px-2 text-center bg-blue-50/30">
                          {formatCrud(perm.officer)}
                        </td>

                        {/* Medical */}
                        <td className="py-2.5 px-2 text-center bg-emerald-50/30">
                          {formatCrud(perm.medical)}
                        </td>

                        {/* Records */}
                        <td className="py-2.5 px-2 text-center bg-purple-50/30">
                          {formatCrud(perm.records)}
                        </td>

                        {/* Superintendent */}
                        <td className="py-2.5 px-2 text-center bg-amber-50/30 font-bold text-amber-950">
                          {formatCrud(perm.superintendent)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            {language === 'fr' 
              ? 'Règle Odoo 19: Les menus masqués sont inaccessibles par URL et protégés côté ORM.' 
              : 'Odoo 19 rule: Hidden menus cannot be accessed via direct action and are guarded at the ORM layer.'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#714B67] hover:bg-[#5f3c54] text-white font-semibold rounded-md shadow-xs transition-colors"
          >
            {language === 'fr' ? 'Fermer' : 'Close Matrix'}
          </button>
        </div>
      </div>
    </div>
  );
};

function formatCrud(perms: { read: boolean; write: boolean; create: boolean; unlink: boolean }) {
  if (!perms.read && !perms.write && !perms.create && !perms.unlink) {
    return <span className="text-slate-300 font-sans text-[11px]">— No Access —</span>;
  }
  return (
    <span className="space-x-1">
      <span className={perms.read ? 'text-emerald-700 font-bold' : 'text-slate-300'}>R</span>
      <span className={perms.write ? 'text-emerald-700 font-bold' : 'text-slate-300'}>W</span>
      <span className={perms.create ? 'text-emerald-700 font-bold' : 'text-slate-300'}>C</span>
      <span className={perms.unlink ? 'text-rose-700 font-bold' : 'text-slate-300'}>U</span>
    </span>
  );
}
