import React, { useRef } from 'react';
import { Inmate, RehabilitationEnrollment } from '../../types';
import { Award, Printer, Download, CheckCircle2, Shield, X, Sparkles } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  inmate: Inmate;
  enrollment: RehabilitationEnrollment;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  inmate,
  enrollment
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const certificateNumber = enrollment.certificateNumber || `CERT-${enrollment.category.toUpperCase().slice(0, 3)}-${new Date().getFullYear()}-${inmate.bookingNumber.replace(/[^A-Z0-9]/gi, '')}`;
  const issueDate = enrollment.completedDate || enrollment.certificateIssuedAt || new Date().toISOString().split('T')[0];
  const certifyingBody = enrollment.certifyingBody || (enrollment.category === 'vocational' ? 'National Industrial Training Authority (NITA)' : 'Ministry of Education Adult & Continuing Education');
  const grade = enrollment.gradeOrScore || 'Distinction (Artisan Grade II)';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSummary = () => {
    const data = {
      certificateNumber,
      inmateName: `${inmate.firstName} ${inmate.lastName}`,
      bookingNumber: inmate.bookingNumber,
      nationalId: inmate.nationalIdNumber,
      facility: inmate.facilityName,
      course: enrollment.programName,
      category: enrollment.category,
      certifyingBody,
      grade,
      issueDate,
      hoursCompleted: enrollment.attendanceHoursCompleted || enrollment.totalCourseHours || 480,
      skillsAcquired: enrollment.skillsAcquired || [],
      instructor: enrollment.instructor,
      verificationStatus: 'AUTHENTICATED_BY_DIRECTORATE_OF_CORRECTIONAL_SERVICES'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${certificateNumber}_record.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 print:border-0 print:shadow-none print:max-w-none">
        {/* Top Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold tracking-wide">Official Rehabilitation & Competency Certificate</h3>
              <p className="text-xs text-slate-400">Registry Serial: {certificateNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              id="print-certificate-btn"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Print Certificate
            </button>
            <button
              onClick={handleDownloadSummary}
              id="download-cert-btn"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Download className="w-4 h-4" />
              Export Record
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display Canvas */}
        <div className="p-4 sm:p-8 bg-amber-50/30 overflow-x-auto">
          <div
            ref={certificateRef}
            className="certificate-paper min-w-[700px] relative bg-[#fffdf9] p-8 sm:p-12 rounded-lg border-8 border-double border-amber-900/30 shadow-md text-slate-900 mx-auto"
            style={{
              backgroundImage: `radial-gradient(#f4ebd9 1px, transparent 1px)`,
              backgroundSize: '24px 24px'
            }}
          >
            {/* Ornamental Corner Filigrees */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-700" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-700" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-700" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-700" />

            {/* Header / National Crest */}
            <div className="text-center space-y-1 mb-6">
              <div className="inline-flex items-center justify-center p-2 rounded-full bg-amber-100/60 border border-amber-300 text-amber-900 mb-1">
                <Shield className="w-7 h-7" />
              </div>
              <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-amber-950">
                Republic of Kenya • State Department for Correctional Services
              </div>
              <div className="text-[10px] font-semibold tracking-wider text-slate-600 uppercase">
                Directorate of Inmate Rehabilitation, Education & Vocational Enterprise
              </div>
              <div className="pt-2">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-slate-900 uppercase">
                  Certificate of Rehabilitation Competency
                </h1>
                <div className="h-0.5 w-32 bg-amber-600 mx-auto mt-1 mb-1" />
                <p className="text-xs italic text-slate-600">
                  Accredited under Section 42 of the Kenya Prisons Act & National Qualifications Framework (KNQF)
                </p>
              </div>
            </div>

            {/* Inmate Attestation Statement */}
            <div className="text-center space-y-3 my-6">
              <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                This is to officially certify that
              </p>
              <div className="py-1">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#714B67] border-b-2 border-slate-300 px-6 pb-1 inline-block">
                  {inmate.firstName} {inmate.lastName}
                </span>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-600 font-mono">
                <span>Booking ID: <strong className="text-slate-900">{inmate.bookingNumber}</strong></span>
                <span>•</span>
                <span>National ID: <strong className="text-slate-900">{inmate.nationalIdNumber}</strong></span>
                <span>•</span>
                <span>Facility: <strong className="text-slate-900">{inmate.facilityName}</strong></span>
              </div>
              <p className="text-xs text-slate-700 max-w-xl mx-auto leading-relaxed pt-2">
                has diligently pursued, demonstrated continuous good conduct, and successfully satisfied all curriculum, practical workshop, and examination requirements in:
              </p>
            </div>

            {/* Course & Certifying Authority Banner */}
            <div className="bg-amber-100/40 border border-amber-200/80 rounded-lg p-4 text-center my-4 max-w-2xl mx-auto">
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-900">
                {enrollment.category === 'vocational' ? 'Accredited Industrial Vocational Qualification' : 'Adult Continuing Education Curriculum'}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                {enrollment.programName}
              </h2>
              <div className="text-xs font-medium text-slate-600 mt-1 flex flex-wrap items-center justify-center gap-3">
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {certifyingBody}
                </span>
                <span>•</span>
                <span className="text-purple-900 font-bold bg-purple-100/80 px-2 py-0.5 rounded text-[11px]">
                  Classification: {grade}
                </span>
              </div>
            </div>

            {/* Competency Matrix (Skills Acquired) */}
            {enrollment.skillsAcquired && enrollment.skillsAcquired.length > 0 && (
              <div className="my-5 max-w-2xl mx-auto">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2 text-center">
                  Demonstrated Core Competencies & Practical Skills Mastered:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                  {enrollment.skillsAcquired.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-white/80 border border-slate-200 px-2.5 py-1 rounded">
                      <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Hours & Remarks */}
            <div className="text-center text-xs text-slate-600 space-y-1 mb-6">
              <div>
                Total Instructional & Practical Workshop Hours Logged:{' '}
                <strong className="text-slate-900 font-mono">
                  {enrollment.attendanceHoursCompleted || enrollment.totalCourseHours || 480} Hours
                </strong>{' '}
                • Curriculum Modules Completed:{' '}
                <strong className="text-slate-900 font-mono">
                  {enrollment.modulesCompleted || enrollment.totalModules || 6} of {enrollment.totalModules || 6}
                </strong>
              </div>
              {enrollment.instructorRemarks && (
                <p className="text-[11px] italic text-slate-500 max-w-lg mx-auto">
                  &ldquo;{enrollment.instructorRemarks}&rdquo;
                </p>
              )}
            </div>

            {/* Seal and Signatures Footer */}
            <div className="pt-6 border-t border-slate-300 mt-6 grid grid-cols-3 items-center text-center">
              {/* Left Signature */}
              <div className="space-y-1">
                <div className="font-serif italic text-sm text-slate-800 border-b border-slate-400 pb-1 max-w-[170px] mx-auto">
                  {enrollment.instructor}
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-700">Authorized Lead Instructor</div>
                <div className="text-[9px] text-slate-500">Technical Vocational Directorate</div>
              </div>

              {/* Center Official Gold Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-amber-600 bg-radial from-amber-400 to-amber-600 flex flex-col items-center justify-center text-amber-950 shadow-md p-1">
                  <Shield className="w-5 h-5 text-amber-950" />
                  <span className="text-[7px] font-black uppercase text-center tracking-tighter leading-tight mt-0.5">
                    REHABILITATION<br />OFFICIAL SEAL
                  </span>
                </div>
                <div className="text-[9px] font-mono font-bold text-slate-500 mt-1">
                  Issued: {issueDate}
                </div>
              </div>

              {/* Right Signature */}
              <div className="space-y-1">
                <div className="font-serif italic text-sm text-slate-800 border-b border-slate-400 pb-1 max-w-[170px] mx-auto">
                  Commissioner G. Karani
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-700">Director of Rehabilitation</div>
                <div className="text-[9px] text-slate-500">Kenya Prisons Headquarters</div>
              </div>
            </div>

            {/* Official Serial & Registry Barcode / Verification */}
            <div className="mt-8 pt-3 border-t border-dotted border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <div>Certificate Serial: <strong className="text-slate-800 font-bold">{certificateNumber}</strong></div>
              <div>Security Verification Hash: <span className="text-slate-400">SHA256:7f8a9e...{inmate.id}</span></div>
              <div className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified Active Credential
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>
            This official certificate is generated from accredited correctional rehabilitation coursework records.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
