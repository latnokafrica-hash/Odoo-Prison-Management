import { UserRole, UserRoleProfile, AppSection } from '../types';

export const USER_ROLES: Record<UserRole, UserRoleProfile> = {
  superintendent: {
    id: 'superintendent',
    name: 'Josephat Mwangi',
    nameFr: 'Josephat Mwangi',
    title: 'Senior Superintendent of Prisons (Warden)',
    titleFr: 'Directeur Général d\'Établissement Pénitentiaire',
    avatarText: 'JM',
    avatarColor: 'bg-amber-500 text-slate-900',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    badgeBorder: 'border-amber-400',
    odooGroup: 'Prison / Superintendent (Administrator)',
    odooGroupXmlId: 'prison_management.group_prison_superintendent',
    description: 'Full managerial oversight, discharge gate pass authorization, sentence commutation, disciplinary forfeiture approvals, and multi-prison directorate administration.',
    descriptionFr: 'Direction générale, approbation des levées d\'écrou et bons de sortie, commutation des peines, forclusion disciplinaire et gestion nationale.',
    allowedModules: [
      'dashboard',
      'inmates',
      'court_calendar',
      'meals',
      'visitors',
      'rooms',
      'fleet',
      'facilities',
      'admissions',
      'sentence',
      'rehabilitation',
      'discharge',
      'human_rights',
      'handover',
      'inspections',
      'odoo_code'
    ],
    sensitiveRestrictedModules: [],
    canExecuteDischarge: true,
    canRecalculateRemission: true,
    canCreateAdmission: true,
    canAuthorizeSolitary: true,
  },
  guard: {
    id: 'guard',
    name: 'David Kiprop',
    nameFr: 'David Kiprop',
    title: 'Correctional Officer / Custody Guard',
    titleFr: 'Gardien de Prison / Surveillant d\'Étage',
    avatarText: 'DK',
    avatarColor: 'bg-blue-600 text-white',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    badgeBorder: 'border-blue-400',
    odooGroup: 'Prison / Correctional Officer (Custody)',
    odooGroupXmlId: 'prison_management.group_prison_officer',
    description: 'Day-to-day custodial security, cell inspections, headcount, lunch ration distribution, parloir search, and armed court escort convoy duty. Sensitive legal modules hidden.',
    descriptionFr: 'Surveillance quotidienne, rondes de cellules, comptage des effectifs, distribution des repas, fouille des parloirs et escortes armées. Modules juridiques sensibles masqués.',
    allowedModules: [
      'dashboard',
      'inmates',
      'rooms',
      'court_calendar',
      'fleet',
      'meals',
      'visitors',
      'handover',
      'inspections',
      'human_rights'
    ],
    sensitiveRestrictedModules: [
      'discharge',
      'sentence',
      'facilities',
      'admissions',
      'rehabilitation',
      'odoo_code'
    ],
    canExecuteDischarge: false,
    canRecalculateRemission: false,
    canCreateAdmission: false,
    canAuthorizeSolitary: false,
  },
  medical_officer: {
    id: 'medical_officer',
    name: 'Dr. Beatrice Achieng',
    nameFr: 'Dr. Béatrice Achieng',
    title: 'Chief Medical Officer / Prison Physician',
    titleFr: 'Médecin-Chef Pénitentiaire',
    avatarText: 'BA',
    avatarColor: 'bg-emerald-600 text-white',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    badgeBorder: 'border-emerald-400',
    odooGroup: 'Prison / Medical Officer',
    odooGroupXmlId: 'prison_management.group_prison_medical',
    description: 'Health clinical records, special dietary ration verification (Mandela Rule 22), daily solitary confinement fitness certification (Mandela Rule 43/46), and cell hygiene audits.',
    descriptionFr: 'Dossiers médicaux, régimes diététiques (Règle Mandela 22), certification médicale d\'aptitude à l\'isolement (Règles 43/46) et contrôle d\'hygiène des locaux.',
    allowedModules: [
      'dashboard',
      'inmates',
      'meals',
      'human_rights',
      'visitors',
      'rooms',
      'inspections'
    ],
    sensitiveRestrictedModules: [
      'discharge',
      'sentence',
      'fleet',
      'court_calendar',
      'court',
      'admissions',
      'facilities',
      'odoo_code'
    ],
    canExecuteDischarge: false,
    canRecalculateRemission: false,
    canCreateAdmission: false,
    canAuthorizeSolitary: false,
  },
  records_clerk: {
    id: 'records_clerk',
    name: 'Samuel Otieno',
    nameFr: 'Samuel Otieno',
    title: 'Senior Committal & Records Clerk',
    titleFr: 'Greffier Principal d\'Écrou & Affaires Pénales',
    avatarText: 'SO',
    avatarColor: 'bg-purple-600 text-white',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    badgeBorder: 'border-purple-400',
    odooGroup: 'Prison / Records & Legal Clerk',
    odooGroupXmlId: 'prison_management.group_prison_records',
    description: 'Court warrants, committal registrations, judicial docketing, and 1/3 statutory remission sentence computations. Final discharge release gate clearance is restricted to Superintendent.',
    descriptionFr: 'Enregistrement des mandats de dépôt, greffe judiciaire, audiences et calcul de réduction légale 1/3. La levée d\'écrou finale requiert la signature du Directeur.',
    allowedModules: [
      'dashboard',
      'inmates',
      'admissions',
      'sentence',
      'rehabilitation',
      'court_calendar'
    ],
    sensitiveRestrictedModules: [
      'discharge',
      'fleet',
      'rooms',
      'inspections',
      'facilities',
      'meals',
      'odoo_code'
    ],
    canExecuteDischarge: false,
    canRecalculateRemission: true,
    canCreateAdmission: true,
    canAuthorizeSolitary: false,
  }
};

export interface ModelPermission {
  model: string;
  name: string;
  nameFr: string;
  officer: { read: boolean; write: boolean; create: boolean; unlink: boolean };
  medical: { read: boolean; write: boolean; create: boolean; unlink: boolean };
  records: { read: boolean; write: boolean; create: boolean; unlink: boolean };
  superintendent: { read: boolean; write: boolean; create: boolean; unlink: boolean };
}

export const ODOO_IR_MODEL_ACCESS: ModelPermission[] = [
  {
    model: 'prison.inmate',
    name: 'Inmate Master Records',
    nameFr: 'Registre d\'Écrou & Détenus',
    officer: { read: true, write: false, create: false, unlink: false },
    medical: { read: true, write: true, create: false, unlink: false },
    records: { read: true, write: true, create: true, unlink: false },
    superintendent: { read: true, write: true, create: true, unlink: true }
  },
  {
    model: 'prison.sentence',
    name: 'Sentence & Remission',
    nameFr: 'Calculs de Peines & Réductions',
    officer: { read: false, write: false, create: false, unlink: false },
    medical: { read: false, write: false, create: false, unlink: false },
    records: { read: true, write: true, create: true, unlink: false },
    superintendent: { read: true, write: true, create: true, unlink: true }
  },
  {
    model: 'prison.discharge',
    name: 'Discharge Clearance & Gate Pass',
    nameFr: 'Levée d\'Écrou & Bon de Sortie',
    officer: { read: false, write: false, create: false, unlink: false },
    medical: { read: false, write: false, create: false, unlink: false },
    records: { read: true, write: false, create: false, unlink: false },
    superintendent: { read: true, write: true, create: true, unlink: true }
  },
  {
    model: 'prison.facility.cell',
    name: 'Cell Blocks & Detention Units',
    nameFr: 'Quartiers & Cellules de Détention',
    officer: { read: true, write: true, create: false, unlink: false },
    medical: { read: true, write: false, create: false, unlink: false },
    records: { read: false, write: false, create: false, unlink: false },
    superintendent: { read: true, write: true, create: true, unlink: true }
  },
  {
    model: 'prison.meal.distribution',
    name: 'Prisoner Catering & Meals',
    nameFr: 'Distribution des Repas & Régimes',
    officer: { read: true, write: true, create: true, unlink: false },
    medical: { read: true, write: true, create: true, unlink: false },
    records: { read: false, write: false, create: false, unlink: false },
    superintendent: { read: true, write: true, create: true, unlink: true }
  },
  {
    model: 'prison.fleet.convoy',
    name: 'Armed Court Escort Fleet',
    nameFr: 'Convois d\'Escorte Judiciaire',
    officer: { read: true, write: true, create: true, unlink: false },
    medical: { read: false, write: false, create: false, unlink: false },
    records: { read: true, write: false, create: false, unlink: false },
    superintendent: { read: true, write: true, create: true, unlink: true }
  },
  {
    model: 'prison.human.rights.audit',
    name: 'Nelson Mandela Rules Audits',
    nameFr: 'Audits des Règles Nelson Mandela',
    officer: { read: true, write: false, create: false, unlink: false },
    medical: { read: true, write: true, create: true, unlink: false },
    records: { read: false, write: false, create: false, unlink: false },
    superintendent: { read: true, write: true, create: true, unlink: true }
  }
];
