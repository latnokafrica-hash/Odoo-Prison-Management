import React, { useState } from 'react';
import { Inmate, PrisonFacility, ViewMode, AppSection, TransferRecord, Language, UserRole } from './types';
import { INITIAL_INMATES, INITIAL_FACILITIES } from './data/initialData';
import { USER_ROLES } from './data/rolesData';
import { OdooNavbar } from './components/odoo/OdooNavbar';
import { OdooSubNavbar } from './components/odoo/OdooSubNavbar';
import { InmateListView } from './components/inmates/InmateListView';
import { InmateKanbanView } from './components/inmates/InmateKanbanView';
import { InmateFormView } from './components/inmates/InmateFormView';
import { AdmissionsTransfersHub } from './components/admissions/AdmissionsTransfersHub';
import { SentenceRemissionHub } from './components/sentence/SentenceRemissionHub';
import { ProgressiveStageRehabHub } from './components/rehab/ProgressiveStageRehabHub';
import { CourtDocketHub } from './components/court/CourtDocketHub';
import { DischargeExitHub } from './components/discharge/DischargeExitHub';
import { MultiPrisonOverview } from './components/facilities/MultiPrisonOverview';
import { HumanRightsHub } from './components/human_rights/HumanRightsHub';
import { Odoo19BlueprintViewer } from './components/blueprint/Odoo19BlueprintViewer';
import { PrisonDashboardHub } from './components/dashboard/PrisonDashboardHub';
import { CourtCalendarHub } from './components/court/CourtCalendarHub';
import { PrisonMealHub } from './components/meals/PrisonMealHub';
import { PrisonVisitorHub } from './components/visitors/PrisonVisitorHub';
import { PrisonRoomHub } from './components/rooms/PrisonRoomHub';
import { PrisonFleetHub } from './components/fleet/PrisonFleetHub';
import { AccessDeniedView } from './components/odoo/AccessDeniedView';
import { NewAdmissionModal } from './components/modals/NewAdmissionModal';
import { TransferModal } from './components/modals/TransferModal';
import { EscapeRecaptureModal } from './components/modals/EscapeRecaptureModal';

export default function App() {
  // Primary datasets
  const [inmates, setInmates] = useState<Inmate[]>(INITIAL_INMATES);
  const [facilities, setFacilities] = useState<PrisonFacility[]>(INITIAL_FACILITIES);

  // Active module/app section & language
  const [activeApp, setActiveApp] = useState<AppSection>('dashboard');
  const [language, setLanguage] = useState<Language>('fr'); // Default French localization
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('ALL');

  // Mock User Role (Odoo 19 RBAC & Access Control simulation)
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('superintendent');

  // Views & selection
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedInmateId, setSelectedInmateId] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSecurity, setFilterSecurity] = useState<string>('ALL');
  const [filterStage, setFilterStage] = useState<string>('ALL');

  // Modals
  const [isNewAdmissionOpen, setIsNewAdmissionOpen] = useState(false);
  const [transferInmate, setTransferInmate] = useState<Inmate | null>(null);
  const [escapeInmate, setEscapeInmate] = useState<Inmate | null>(null);

  // Filtered Inmates logic
  const filteredInmates = inmates.filter(inmate => {
    // Facility filter
    if (selectedFacilityId !== 'ALL' && inmate.facilityId !== selectedFacilityId) {
      return false;
    }
    // Security filter
    if (filterSecurity !== 'ALL' && inmate.securityCategory !== filterSecurity) {
      return false;
    }
    // Progressive stage filter
    if (filterStage !== 'ALL' && inmate.progressiveStage !== filterStage) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${inmate.firstName} ${inmate.lastName}`.toLowerCase().includes(q);
      const matchBooking = inmate.bookingNumber.toLowerCase().includes(q);
      const matchNationalId = inmate.nationalIdNumber.toLowerCase().includes(q);
      const matchCell = inmate.cellLocation.toLowerCase().includes(q);
      if (!matchName && !matchBooking && !matchNationalId && !matchCell) {
        return false;
      }
    }
    return true;
  });

  const selectedInmate = inmates.find(i => i.id === selectedInmateId) || null;

  // Handler: Select Inmate
  const handleSelectInmate = (inmate: Inmate) => {
    setSelectedInmateId(inmate.id);
    setViewMode('form');
  };

  // Handler: Update Inmate
  const handleUpdateInmate = (updatedInmate: Inmate) => {
    setInmates(prev => prev.map(i => (i.id === updatedInmate.id ? updatedInmate : i)));
  };

  // Handler: Add New Inmate
  const handleAddNewInmate = (newInmate: Inmate) => {
    setInmates(prev => [newInmate, ...prev]);
    // update facility count
    setFacilities(prev => prev.map(f => {
      if (f.id === newInmate.facilityId) {
        return { ...f, currentInmates: f.currentInmates + 1 };
      }
      return f;
    }));
    setSelectedInmateId(newInmate.id);
    setViewMode('form');
  };

  // Handler: Dispatch Transfer
  const handleConfirmTransfer = (inmateId: string, transferData: Partial<TransferRecord>) => {
    const inmate = inmates.find(i => i.id === inmateId);
    if (!inmate) return;

    const newTransfer: TransferRecord = {
      id: `trf-${Date.now()}`,
      inmateId: inmate.id,
      inmateName: `${inmate.firstName} ${inmate.lastName}`,
      fromFacilityId: transferData.fromFacilityId || inmate.facilityId,
      fromFacilityName: transferData.fromFacilityName || inmate.facilityName,
      toFacilityId: transferData.toFacilityId || 'fac-02',
      toFacilityName: transferData.toFacilityName || 'Naivasha Maximum Prison',
      transferReason: transferData.transferReason || 'vocational_training',
      escortLevel: transferData.escortLevel || 'armed_convoy',
      transitVehicleNumber: transferData.transitVehicleNumber || 'GK-B-9912',
      escortCommander: transferData.escortCommander || 'Chief Inspector J. Karanja',
      requisitionDate: transferData.requisitionDate || new Date().toISOString().split('T')[0],
      transitDispatchedAt: transferData.transitDispatchedAt || new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'in_transit'
    };

    const updatedInmate: Inmate = {
      ...inmate,
      custodyStatus: 'in_transit',
      cellLocation: 'Transit Escort Van (En Route)',
      transfers: [newTransfer, ...inmate.transfers],
      chatterLogs: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: 'National Transfer Directorate',
          message: `Transfer requisition authorized. Convoy dispatched from ${newTransfer.fromFacilityName} to ${newTransfer.toFacilityName} under ${newTransfer.escortLevel.replace('_', ' ')}.`,
          type: 'system'
        },
        ...inmate.chatterLogs
      ]
    };

    handleUpdateInmate(updatedInmate);
  };

  // Handler: Process Recapture
  const handleProcessRecapture = (inmateId: string, penaltyDays: number, arrestingAgency: string, notes: string) => {
    const inmate = inmates.find(i => i.id === inmateId);
    if (!inmate) return;

    const updatedSentences = inmate.sentences.map(sen => ({
      ...sen,
      remissionForfeitedDays: sen.remissionForfeitedDays + penaltyDays
    }));

    const updatedEscapeIncidents = inmate.escapeIncidents?.map(esc => ({
      ...esc,
      recapturedDate: new Date().toISOString().split('T')[0],
      recapturingAgency: arrestingAgency,
      disciplinaryAction: `Disciplinary Tribunal: ${penaltyDays} days remission forfeited. Demoted to Stage 1. ${notes}`
    }));

    const updatedInmate: Inmate = {
      ...inmate,
      custodyStatus: 'convicted',
      progressiveStage: 'stage_1',
      securityCategory: 'CAT_A',
      cellLocation: 'Segregation Block S-01 (Under Constant Armed Watch)',
      sentences: updatedSentences,
      escapeIncidents: updatedEscapeIncidents,
      chatterLogs: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: 'Disciplinary Superintendent',
          message: `RECAPTURE COMMITTED: Apprehended by ${arrestingAgency}. Section 46 Prisons Act applied: ${penaltyDays} days remission forfeited, demoted to Stage 1.`,
          type: 'system'
        },
        ...inmate.chatterLogs
      ]
    };

    handleUpdateInmate(updatedInmate);
  };

  // Handler: Trigger Escape Alert
  const handleTriggerEscapeAlert = (inmateId: string, escapeLocation: string, method: string) => {
    const inmate = inmates.find(i => i.id === inmateId);
    if (!inmate) return;

    const escapeIncident = {
      id: `esc-${Date.now()}`,
      inmateId: inmate.id,
      inmateName: `${inmate.firstName} ${inmate.lastName}`,
      bookingNumber: inmate.bookingNumber,
      facilityId: inmate.facilityId,
      facilityName: inmate.facilityName,
      incidentDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      escapeLocation,
      methodOfEscape: method,
      dangerLevel: (inmate.securityCategory === 'CAT_A' ? 'EXTREME' : 'HIGH') as 'EXTREME' | 'HIGH' | 'MODERATE',
      status: 'AT_LARGE' as const
    };

    const updatedInmate: Inmate = {
      ...inmate,
      custodyStatus: 'escaped',
      escapeIncidents: [escapeIncident, ...(inmate.escapeIncidents || [])],
      chatterLogs: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: 'Security Operations Center',
          message: `🚨 RED ALERT: Inmate reported escaped from ${escapeLocation} via ${method}. National broadcast issued!`,
          type: 'system'
        },
        ...inmate.chatterLogs
      ]
    };

    handleUpdateInmate(updatedInmate);
  };

  // Quick navigation helpers
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedInmateId(null);
  };

  // Role permissions computation
  const roleProfile = USER_ROLES[currentUserRole] || USER_ROLES.superintendent;
  const isSectionAllowed = roleProfile.allowedModules.includes(activeApp);

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 flex flex-col font-sans">
      {/* 1. Main Odoo 19 Navigation Header */}
      <OdooNavbar
        currentModule={activeApp}
        onSelectModule={(moduleId) => {
          setActiveApp(moduleId as AppSection);
          if (moduleId === 'inmates' && !selectedInmateId) {
            setViewMode('list');
          }
        }}
        facilities={facilities}
        selectedFacilityId={selectedFacilityId}
        onSelectFacility={setSelectedFacilityId}
        inmates={inmates}
        onOpenNewModal={() => setIsNewAdmissionOpen(true)}
        language={language}
        onToggleLanguage={setLanguage}
        currentUserRole={currentUserRole}
        onSelectRole={setCurrentUserRole}
      />

      {/* 2. Sub Navbar (Contextual Actions, Search & View Switcher) */}
      <OdooSubNavbar
        currentModule={activeApp}
        viewMode={viewMode}
        onViewModeChange={(mode) => setViewMode(mode)}
        onNewClick={() => setIsNewAdmissionOpen(true)}
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFilter={filterSecurity}
        onSelectFilter={setFilterSecurity}
        totalRecords={inmates.length}
        filteredCount={filteredInmates.length}
        title={language === 'fr' ? 'Administration Pénitentiaire & Registre d\'Écrou' : 'Prison Custody & Inmate ERP'}
      />

      {/* 3. Main Dynamic Content Body */}
      <main className="flex-1 pb-10">
        {/* Odoo 19 Access Control Check (RBAC: ir.rule & res.groups) */}
        {!isSectionAllowed ? (
          <AccessDeniedView
            attemptedSection={activeApp}
            currentRole={currentUserRole}
            language={language}
            onElevateRole={(newRole) => setCurrentUserRole(newRole)}
            onReturnToDashboard={() => setActiveApp('dashboard')}
          />
        ) : (
          <>
            {/* APP SECTION: OPERATIONS DASHBOARD */}
            {activeApp === 'dashboard' && (
              <div className="max-w-7xl mx-auto px-4 py-6">
                <PrisonDashboardHub
                  inmates={inmates}
                  facilities={facilities}
                  language={language}
                  onNavigate={(section) => setActiveApp(section)}
                  currentUserRole={currentUserRole}
                  onSelectRole={setCurrentUserRole}
                />
              </div>
            )}

        {/* APP SECTION: COURT CALENDAR & DOCKETS */}
        {activeApp === 'court_calendar' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <CourtCalendarHub
              inmates={inmates}
              language={language}
            />
          </div>
        )}

        {/* APP SECTION: PRISONERS LUNCH & MEALS MANAGEMENT */}
        {activeApp === 'meals' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <PrisonMealHub
              language={language}
            />
          </div>
        )}

        {/* APP SECTION: INMATE VISITORS & PARLOIR MANAGEMENT */}
        {activeApp === 'visitors' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <PrisonVisitorHub
              language={language}
            />
          </div>
        )}

        {/* APP SECTION: CELL & ROOM FACILITIES MANAGEMENT */}
        {activeApp === 'rooms' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <PrisonRoomHub
              language={language}
            />
          </div>
        )}

        {/* APP SECTION: ARMED ESCORT FLEET BETWEEN COURTS */}
        {activeApp === 'fleet' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <PrisonFleetHub
              language={language}
            />
          </div>
        )}

        {/* APP SECTION: INMATES MASTER */}
        {activeApp === 'inmates' && (
          <div>
            {viewMode === 'list' && (
              <InmateListView
                inmates={filteredInmates}
                onSelectInmate={handleSelectInmate}
              />
            )}

            {viewMode === 'kanban' && (
              <InmateKanbanView
                inmates={filteredInmates}
                onSelectInmate={handleSelectInmate}
              />
            )}

            {viewMode === 'form' && selectedInmate && (
              <InmateFormView
                inmate={selectedInmate}
                facilities={facilities}
                onBack={handleBackToList}
                onUpdateInmate={handleUpdateInmate}
                onOpenTransferModal={inm => setTransferInmate(inm)}
                onOpenEscapeModal={inm => setEscapeInmate(inm)}
                onOpenDischargeModal={inm => setActiveApp('discharge')}
                currentUserRole={currentUserRole}
              />
            )}

            {viewMode === 'form' && !selectedInmate && (
              <div className="p-8 text-center text-slate-500">
                No inmate selected. Please return to the list.
              </div>
            )}
          </div>
        )}

        {/* APP SECTION: ADMISSIONS, TRANSFERS, ESCAPE & RECAPTURE */}
        {activeApp === 'admissions' && (
          <AdmissionsTransfersHub
            inmates={inmates}
            facilities={facilities}
            onSelectInmate={(inm) => {
              setSelectedInmateId(inm.id);
              setActiveApp('inmates');
              setViewMode('form');
            }}
            onOpenNewModal={() => setIsNewAdmissionOpen(true)}
            onOpenTransferModal={inm => setTransferInmate(inm)}
            onOpenEscapeModal={inm => setEscapeInmate(inm)}
            onUpdateInmate={handleUpdateInmate}
          />
        )}

        {/* APP SECTION: DISCHARGE & EXIT CLEARANCE */}
        {activeApp === 'discharge' && (
          <DischargeExitHub
            inmates={inmates}
            onSelectInmate={(inm) => {
              setSelectedInmateId(inm.id);
              setActiveApp('inmates');
              setViewMode('form');
            }}
            onUpdateInmate={handleUpdateInmate}
            onOpenDischargeModal={inm => {}}
          />
        )}

        {/* APP SECTION: SENTENCE ADMINISTRATION & REMISSION ENGINE */}
        {activeApp === 'sentence' && (
          <SentenceRemissionHub
            inmates={inmates}
            onSelectInmate={(inm) => {
              setSelectedInmateId(inm.id);
              setActiveApp('inmates');
              setViewMode('form');
            }}
            onUpdateInmate={handleUpdateInmate}
          />
        )}

        {/* APP SECTION: PROGRESSIVE STAGE, REHABILITATION & GRATUITY */}
        {activeApp === 'rehabilitation' && (
          <ProgressiveStageRehabHub
            inmates={inmates}
            onSelectInmate={(inm) => {
              setSelectedInmateId(inm.id);
              setActiveApp('inmates');
              setViewMode('form');
            }}
            onUpdateInmate={handleUpdateInmate}
          />
        )}

        {/* APP SECTION: COURT DOCKETS & SCHEDULING */}
        {activeApp === 'court' && (
          <CourtDocketHub
            inmates={inmates}
            onSelectInmate={(inm) => {
              setSelectedInmateId(inm.id);
              setActiveApp('inmates');
              setViewMode('form');
            }}
            onUpdateInmate={handleUpdateInmate}
          />
        )}

        {/* APP SECTION: MULTI-PRISON NATIONAL OVERVIEW */}
        {activeApp === 'facilities' && (
          <MultiPrisonOverview
            facilities={facilities}
            inmates={inmates}
            selectedFacilityId={selectedFacilityId}
            onSelectFacility={id => setSelectedFacilityId(id)}
            onOpenNewModal={() => setIsNewAdmissionOpen(true)}
          />
        )}

        {/* APP SECTION: HUMAN RIGHTS & NELSON MANDELA AUDITS */}
        {activeApp === 'human_rights' && (
          <HumanRightsHub
            inmates={inmates}
            onSelectInmate={(inm) => {
              setSelectedInmateId(inm.id);
              setActiveApp('inmates');
              setViewMode('form');
            }}
            onUpdateInmate={handleUpdateInmate}
          />
        )}

        {/* APP SECTION: ODOO 19 CODE BLUEPRINTS & ARCHITECTURE */}
        {activeApp === 'odoo_code' && (
          <Odoo19BlueprintViewer />
        )}
          </>
        )}
      </main>

      {/* 4. Interactive Modals */}
      <NewAdmissionModal
        facilities={facilities}
        isOpen={isNewAdmissionOpen}
        onClose={() => setIsNewAdmissionOpen(false)}
        onAdmit={handleAddNewInmate}
      />

      <TransferModal
        inmate={transferInmate}
        facilities={facilities}
        isOpen={!!transferInmate}
        onClose={() => setTransferInmate(null)}
        onConfirmTransfer={handleConfirmTransfer}
      />

      <EscapeRecaptureModal
        inmate={escapeInmate}
        isOpen={!!escapeInmate}
        onClose={() => setEscapeInmate(null)}
        onProcessRecapture={handleProcessRecapture}
        onTriggerEscapeAlert={handleTriggerEscapeAlert}
      />
    </div>
  );
}
