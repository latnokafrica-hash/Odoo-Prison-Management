import React, { useState } from 'react';
import { Inmate, PrisonFacility, SecurityCategory, ProgressiveStage, AdmissionType } from '../../types';
import { X, UserPlus, ShieldAlert, Fingerprint, Lock, Check } from 'lucide-react';

interface NewAdmissionModalProps {
  facilities: PrisonFacility[];
  isOpen: boolean;
  onClose: () => void;
  onAdmit: (inmate: Inmate) => void;
}

export const NewAdmissionModal: React.FC<NewAdmissionModalProps> = ({
  facilities,
  isOpen,
  onClose,
  onAdmit
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1994-05-12');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [facilityId, setFacilityId] = useState(facilities[0]?.id || 'fac-01');
  const [admissionType, setAdmissionType] = useState<AdmissionType>('new_remand');
  const [securityCategory, setSecurityCategory] = useState<SecurityCategory>('CAT_B');
  const [courtWarrantNumber, setCourtWarrantNumber] = useState('HC-WAR-2026-');
  const [committingCourt, setCommittingCourt] = useState('Milimani High Court - Anti-Corruption Division');
  const [charges, setCharges] = useState('Armed Robbery / Conspiracy to Defraud');
  const [termYears, setTermYears] = useState(5);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) return;

    const selectedFacility = facilities.find(f => f.id === facilityId) || facilities[0];
    const newBookingNumber = `PRI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const custodyStatus = admissionType === 'conviction' ? 'convicted' : 'remand';

    // Calculate remission (1/3 of term) if convicted
    const totalDays = termYears * 365;
    const earnedRemission = Math.round(totalDays * (1 / 3));

    const newInmate: Inmate = {
      id: `inm-${Date.now()}`,
      bookingNumber: newBookingNumber,
      nationalIdNumber: nationalIdNumber || `ID-${Math.floor(10000000 + Math.random() * 90000000)}`,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces',
      custodyStatus,
      facilityId: selectedFacility.id,
      facilityName: selectedFacility.name,
      cellLocation: 'Reception Block R-1',
      admissionDate: new Date().toISOString().split('T')[0],
      admissionType,
      securityCategory,
      progressiveStage: 'stage_1',
      behaviorRating: 80,
      gratuityBalance: 0.00,
      remissionLogs: [],
      gratuityTransactions: [],
      biometrics: {
        fingerprintsEnrolled: true,
        irisScanCaptured: true,
        dnaSampleRef: `DNA-KE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        scarsTattoosMarks: 'None recorded during intake physical'
      },
      propertyItems: [
        {
          id: `prop-${Date.now()}-1`,
          description: 'Mobile Phone & SIM Card',
          category: 'electronics',
          quantity: 1,
          condition: 'Good',
          sealBagNumber: `VAULT-BAG-${Math.floor(100 + Math.random() * 900)}`,
          status: 'held_in_vault'
        },
        {
          id: `prop-${Date.now()}-2`,
          description: 'Cash ($145.00) & Leather Wallet',
          category: 'cash',
          quantity: 1,
          condition: 'Good',
          sealBagNumber: `SAFE-ENV-${Math.floor(100 + Math.random() * 900)}`,
          status: 'held_in_vault'
        }
      ],
      sentences: [
        {
          id: `sen-${Date.now()}`,
          caseNumber: courtWarrantNumber,
          courtName: committingCourt,
          offense: charges,
          dateConvicted: new Date().toISOString().split('T')[0],
          termYears: termYears,
          termMonths: 0,
          termDays: 0,
          sentenceType: 'determinate',
          structure: 'concurrent',
          isConsecutive: false,
          statutoryRemissionFraction: 0.3333,
          statutoryRemissionRate: '1/3',
          remissionEarnedDays: earnedRemission,
          remissionForfeitedDays: 0,
          earliestReleaseDate: '2029-12-15',
          latestReleaseDate: '2031-09-18',
          paroleEligibilityDate: '2028-06-20'
        }
      ],
      programs: [],
      courtCases: [
        {
          id: `crt-${Date.now()}`,
          inmateId: '',
          inmateName: `${firstName} ${lastName}`,
          bookingNumber: newBookingNumber,
          caseNumber: courtWarrantNumber,
          courtName: committingCourt,
          judgeName: 'Hon. Justice G. Kimani',
          hearingDate: '2026-10-15',
          hearingTime: '09:30 AM',
          hearingType: 'mention',
          courtMode: 'virtual_video_link',
          escortTeam: 'Virtual Court Booth 1',
          transportVehicleNumber: 'STN-VIRT-01',
          status: 'scheduled',
          charges: charges
        }
      ],
      transfers: [],
      humanRightsAudits: [
        {
          id: `hra-${Date.now()}`,
          inmateId: '',
          date: new Date().toISOString().split('T')[0],
          auditorName: 'Senior Medical Officer Dr. Omondi',
          inspectionType: 'un_mandela_rules',
          outdoorHoursPerDay: 2.0,
          consecutiveSolitaryDays: 0,
          complianceStatus: 'compliant',
          medicalVisitsCount: 1,
          complaintsLogged: [],
          recommendations: 'Fit for general population admission'
        }
      ],
      emergencyContact: {
        name: 'Family Representative',
        relationship: 'Next of Kin',
        phone: '+254 712 345 678'
      },
      chatterLogs: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: 'Reception Officer (Badge #8821)',
          message: `Booking created under warrant ${courtWarrantNumber}. Biometrics captured, property deposited in vault.`,
          type: 'system'
        }
      ]
    };

    onAdmit(newInmate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden border border-slate-300">
        {/* Header */}
        <div className="bg-[#714B67] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <h3 className="font-bold text-sm">Odoo 19: New Prisoner Admission & Booking Intake</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="e.g. Samuel"
                className="w-full border border-slate-300 rounded p-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="e.g. Mutua"
                className="w-full border border-slate-300 rounded p-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">National ID / Passport</label>
              <input
                type="text"
                value={nationalIdNumber}
                onChange={e => setNationalIdNumber(e.target.value)}
                placeholder="e.g. ID-28938491"
                className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full border border-slate-300 rounded p-2 text-xs"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Facility</label>
              <select
                value={facilityId}
                onChange={e => setFacilityId(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs font-semibold"
              >
                {facilities.map(fac => (
                  <option key={fac.id} value={fac.id}>{fac.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Admission Type</label>
              <select
                value={admissionType}
                onChange={e => setAdmissionType(e.target.value as any)}
                className="w-full border border-slate-300 rounded p-2 text-xs"
              >
                <option value="new_remand">New Remand (Pre-Trial)</option>
                <option value="conviction">Direct Conviction</option>
                <option value="transfer_in">Inter-Prison Transfer In</option>
                <option value="bail_revocation">Re-Admit After Bail Revocation</option>
                <option value="recaptured">Recaptured After Escape</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Security Category</label>
              <select
                value={securityCategory}
                onChange={e => setSecurityCategory(e.target.value as any)}
                className="w-full border border-slate-300 rounded p-2 text-xs font-bold"
              >
                <option value="CAT_A">CAT A - Maximum Security (High Flight Risk)</option>
                <option value="CAT_B">CAT B - Medium Security</option>
                <option value="CAT_C">CAT C - Low Security / Trust</option>
                <option value="CAT_D">CAT D - Open Camp Candidate</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Committal Warrant Number</label>
              <input
                type="text"
                value={courtWarrantNumber}
                onChange={e => setCourtWarrantNumber(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Committing Court & Division</label>
            <input
              type="text"
              value={committingCourt}
              onChange={e => setCommittingCourt(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Primary Charges / Penal Code Offense</label>
            <textarea
              rows={2}
              value={charges}
              onChange={e => setCharges(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 text-xs"
            />
          </div>

          {admissionType === 'conviction' && (
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <label className="block font-semibold text-purple-900 mb-1">
                Sentenced Term (Years) - Automatic 1/3 Statutory Remission Calculated
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={termYears}
                onChange={e => setTermYears(parseInt(e.target.value) || 1)}
                className="w-32 border border-purple-300 rounded p-1.5 text-xs font-mono font-bold"
              />
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-semibold"
            >
              Discard
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#714B67] hover:bg-[#5f3c54] text-white rounded font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Enroll Booking</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
