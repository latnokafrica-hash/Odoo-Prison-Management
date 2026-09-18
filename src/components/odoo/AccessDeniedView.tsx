import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, KeyRound, CheckCircle2, UserCheck } from 'lucide-react';
import { UserRole, AppSection, Language } from '../../types';
import { USER_ROLES } from '../../data/rolesData';

interface AccessDeniedViewProps {
  attemptedSection: AppSection;
  currentRole: UserRole;
  language: Language;
  onElevateRole: (newRole: UserRole) => void;
  onReturnToDashboard: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  attemptedSection,
  currentRole,
  language,
  onElevateRole,
  onReturnToDashboard
}) => {
  const roleProfile = USER_ROLES[currentRole];

  const getSectionTitle = (section: AppSection) => {
    switch (section) {
      case 'discharge':
        return language === 'fr' ? 'Levée d\'Écrou & Bons de Sortie' : 'Inmate Discharge Clearance & Gate Exit';
      case 'sentence':
        return language === 'fr' ? 'Calculs de Peines & Réductions Légales' : 'Sentence Administration & Remission Engine';
      case 'facilities':
        return language === 'fr' ? 'Direction Nationale & Configuration des Établissements' : 'National Directorate & Facility Configuration';
      case 'fleet':
        return language === 'fr' ? 'Flotte & Convois d\'Escorte Armée' : 'Armed Court Escort Fleet';
      case 'odoo_code':
        return language === 'fr' ? 'Architecture Technique Odoo 19' : 'Odoo 19 Technical Architecture & Code';
      default:
        return section;
    }
  };

  const getRequiredGroup = (section: AppSection) => {
    switch (section) {
      case 'discharge':
        return 'prison_management.group_prison_superintendent (Discharge Board Authorization)';
      case 'sentence':
        return 'prison_management.group_prison_records or prison_management.group_prison_superintendent';
      case 'facilities':
      case 'odoo_code':
        return 'prison_management.group_prison_superintendent (System Administrator)';
      default:
        return 'prison_management.group_prison_superintendent';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white border-2 border-rose-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Odoo Error Header */}
        <div className="bg-rose-50 border-b border-rose-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 border border-rose-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-rose-900 tracking-tight flex items-center gap-2">
                <span>{language === 'fr' ? 'Erreur de Droits d\'Accès (Odoo AccessError)' : 'Access Error (Odoo AccessError)'}</span>
                <span className="text-[10px] bg-rose-200 text-rose-800 font-mono px-2 py-0.5 rounded font-semibold uppercase">
                  ir.model.access.csv
                </span>
              </h2>
              <p className="text-xs text-rose-700">
                {language === 'fr' 
                  ? 'Privilèges insuffisants pour consulter ce module protégé' 
                  : 'Insufficient privileges to access this sensitive custody module'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono bg-white px-2.5 py-1 rounded border border-rose-200 text-slate-700 font-medium">
              403 FORBIDDEN
            </span>
          </div>
        </div>

        {/* Error Body */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-800 leading-relaxed">
            <div className="text-rose-600 font-bold mb-1">
              odoo.exceptions.AccessError:
            </div>
            <p>
              {language === 'fr' ? (
                <>
                  L'utilisateur <strong>{roleProfile.nameFr}</strong> ({roleProfile.titleFr}) sous le rôle <code>{roleProfile.odooGroupXmlId}</code> n'a pas les droits de lecture/écriture sur le modèle <code>{attemptedSection === 'discharge' ? 'prison.discharge' : 'prison.sentence'}</code> (Module: <strong>{getSectionTitle(attemptedSection)}</strong>).
                </>
              ) : (
                <>
                  The user <strong>{roleProfile.name}</strong> ({roleProfile.title}) with assigned group <code>{roleProfile.odooGroupXmlId}</code> is not allowed to access the model <code>{attemptedSection === 'discharge' ? 'prison.discharge' : 'prison.sentence'}</code> (Module: <strong>{getSectionTitle(attemptedSection)}</strong>).
                </>
              )}
            </p>
          </div>

          {/* Odoo Group Inspection Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="text-slate-500 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                {language === 'fr' ? 'Session Utilisateur Actuelle' : 'Current Active User Session'}
              </div>
              <div className="flex items-center space-x-2.5">
                <div className={`w-8 h-8 rounded-full ${roleProfile.avatarColor} font-bold text-xs flex items-center justify-center shadow-xs`}>
                  {roleProfile.avatarText}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{roleProfile.name}</div>
                  <div className="text-slate-500 text-[11px]">{language === 'fr' ? roleProfile.titleFr : roleProfile.title}</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-600 pt-1">
                <strong>Odoo Group:</strong> <code>{roleProfile.odooGroupXmlId}</code>
              </div>
            </div>

            <div className="p-4 bg-amber-50/70 rounded-lg border border-amber-200 space-y-2">
              <div className="text-amber-800 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                {language === 'fr' ? 'Groupe de Sécurité Requis' : 'Required Security Group'}
              </div>
              <div className="font-mono text-amber-900 bg-white p-2 rounded border border-amber-200 font-medium">
                {getRequiredGroup(attemptedSection)}
              </div>
              <p className="text-[11px] text-amber-800">
                {language === 'fr' 
                  ? 'Ce module est réservé aux officiers supérieurs pour garantir l\'intégrité judiciaire et la légalité des libérations.' 
                  : 'Restricted to commanding officers to guarantee judicial integrity and statutory release validation.'}
              </p>
            </div>
          </div>

          {/* Action Callouts */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={onReturnToDashboard}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'fr' ? 'Retour au Tableau de Bord' : 'Return to Operations Dashboard'}</span>
            </button>

            <button
              onClick={() => onElevateRole('superintendent')}
              className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-[#714B67] hover:bg-[#5f3c54] rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>
                {language === 'fr' 
                  ? 'Prendre le Rôle Directeur (Superintendent)' 
                  : 'Switch to Superintendent (Elevate Privileges)'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
