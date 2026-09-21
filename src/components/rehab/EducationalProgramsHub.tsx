import React, { useState, useMemo } from 'react';
import { Inmate, RehabilitationEnrollment } from '../../types';
import { EDUCATIONAL_AND_VOCATIONAL_COURSES, CourseCurriculum } from '../../data/educationalCoursesData';
import { CertificateModal } from './CertificateModal';
import { EnrollInmateModal } from './EnrollInmateModal';
import { UpdateProgressModal } from './UpdateProgressModal';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  TrendingUp, 
  FileText, 
  Sparkles, 
  Eye, 
  ChevronRight,
  ShieldCheck,
  Building,
  Coins
} from 'lucide-react';

interface EducationalProgramsHubProps {
  inmates: Inmate[];
  onSelectInmate: (inmate: Inmate) => void;
  onUpdateInmate: (inmate: Inmate) => void;
}

export const EducationalProgramsHub: React.FC<EducationalProgramsHubProps> = ({
  inmates,
  onSelectInmate,
  onUpdateInmate
}) => {
  // Navigation tabs within EducationalProgramsHub
  const [activeTab, setActiveTab] = useState<'enrollments' | 'catalog' | 'certificates'>('enrollments');
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');

  // Modals state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [preselectedCourseId, setPreselectedCourseId] = useState<string | undefined>(undefined);
  
  const [certModalState, setCertModalState] = useState<{
    isOpen: boolean;
    inmate?: Inmate;
    enrollment?: RehabilitationEnrollment;
  }>({ isOpen: false });

  const [progressModalState, setProgressModalState] = useState<{
    isOpen: boolean;
    inmate?: Inmate;
    enrollment?: RehabilitationEnrollment;
  }>({ isOpen: false });

  // Gather all enrollments across all inmates paired with their inmate data
  const allEnrollmentRecords = useMemo(() => {
    const list: { inmate: Inmate; enrollment: RehabilitationEnrollment }[] = [];
    inmates.forEach(inmate => {
      inmate.programs.forEach(enrollment => {
        list.push({ inmate, enrollment });
      });
    });
    return list;
  }, [inmates]);

  // Aggregate KPI computations
  const totalEnrollments = allEnrollmentRecords.length;
  const inProgressCount = allEnrollmentRecords.filter(r => r.enrollment.status === 'in_progress').length;
  const completedCount = allEnrollmentRecords.filter(r => r.enrollment.status === 'completed' || r.enrollment.progressPercent === 100).length;
  const certificatesIssuedCount = allEnrollmentRecords.filter(r => Boolean(r.enrollment.certificateNumber)).length;
  
  const avgProgress = totalEnrollments > 0
    ? Math.round(allEnrollmentRecords.reduce((acc, r) => acc + r.enrollment.progressPercent, 0) / totalEnrollments)
    : 0;

  const totalDailyStipend = allEnrollmentRecords
    .filter(r => r.enrollment.status === 'in_progress')
    .reduce((acc, r) => acc + (r.enrollment.dailyEarningRate || 0), 0);

  // Filtered enrollments for the table
  const filteredEnrollments = useMemo(() => {
    return allEnrollmentRecords.filter(record => {
      const { inmate, enrollment } = record;
      const q = searchQuery.toLowerCase();
      
      const matchesSearch = !searchQuery || 
        inmate.firstName.toLowerCase().includes(q) ||
        inmate.lastName.toLowerCase().includes(q) ||
        inmate.bookingNumber.toLowerCase().includes(q) ||
        enrollment.programName.toLowerCase().includes(q) ||
        enrollment.instructor.toLowerCase().includes(q) ||
        (enrollment.certificateNumber && enrollment.certificateNumber.toLowerCase().includes(q));

      const matchesCategory = selectedCategory === 'ALL' || enrollment.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || 
        (selectedStatus === 'completed' ? (enrollment.status === 'completed' || enrollment.progressPercent === 100) : enrollment.status === selectedStatus);
      const matchesFacility = selectedFacility === 'ALL' || inmate.facilityId === selectedFacility;

      return matchesSearch && matchesCategory && matchesStatus && matchesFacility;
    });
  }, [allEnrollmentRecords, searchQuery, selectedCategory, selectedStatus, selectedFacility]);

  // Handle enrollment addition
  const handleEnrollInmate = (inmateId: string, newEnrollment: RehabilitationEnrollment) => {
    const targetInmate = inmates.find(i => i.id === inmateId);
    if (!targetInmate) return;

    const updatedInmate: Inmate = {
      ...targetInmate,
      programs: [...targetInmate.programs, newEnrollment]
    };

    onUpdateInmate(updatedInmate);
  };

  // Handle progress update
  const handleSaveProgress = (inmateId: string, updatedEnrollment: RehabilitationEnrollment) => {
    const targetInmate = inmates.find(i => i.id === inmateId);
    if (!targetInmate) return;

    const updatedPrograms = targetInmate.programs.map(p => 
      p.id === updatedEnrollment.id ? updatedEnrollment : p
    );

    const updatedInmate: Inmate = {
      ...targetInmate,
      programs: updatedPrograms
    };

    onUpdateInmate(updatedInmate);
  };

  const openCertificate = (inmate: Inmate, enrollment: RehabilitationEnrollment) => {
    setCertModalState({
      isOpen: true,
      inmate,
      enrollment
    });
  };

  const openProgressModal = (inmate: Inmate, enrollment: RehabilitationEnrollment) => {
    setProgressModalState({
      isOpen: true,
      inmate,
      enrollment
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-100 text-[#714B67]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Educational & Vocational Rehabilitation Programs Hub
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Accredited
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Track inmate enrollment, syllabus mastery, literacy progress, trade test certifications, and official credential generation.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => {
              setPreselectedCourseId(undefined);
              setIsEnrollModalOpen(true);
            }}
            id="enroll-inmate-action-btn"
            className="px-3.5 py-2 bg-[#714B67] hover:bg-[#5a3a52] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Enroll Inmate in Course
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Enrolled</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900">{totalEnrollments}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across {inmates.length} total inmates</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Active In-Training</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-700">{inProgressCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Currently taking modules</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Certificates Issued</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-700">{completedCount}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {certificatesIssuedCount} Official Registry Serials
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Average Progress</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">{avgProgress}%</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${avgProgress}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Daily Wage Flow</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">${totalDailyStipend.toFixed(2)}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Stipend disbursed / day</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('enrollments')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'enrollments'
                ? 'border-[#714B67] text-[#714B67]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Inmate Course Enrollments & Progress
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-mono">
              {totalEnrollments}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'certificates'
                ? 'border-[#714B67] text-[#714B67]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            Graduation & Certificate Registry
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-bold font-mono">
              {completedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'catalog'
                ? 'border-[#714B67] text-[#714B67]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Accredited Courses & Curriculums
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-mono">
              {EDUCATIONAL_AND_VOCATIONAL_COURSES.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          NITA • Ministry of Education • NCA • ICT Authority
        </div>
      </div>

      {/* VIEW 1: ENROLLMENTS & PROGRESS ROSTER */}
      {activeTab === 'enrollments' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search inmate name, booking #, course, instructor, or serial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
              >
                <option value="ALL">All Course Disciplines</option>
                <option value="vocational">Vocational Trades</option>
                <option value="education">Adult Literacy & Ed</option>
                <option value="substance">Behavioral & Life Skills</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
              >
                <option value="ALL">All Enrollment Statuses</option>
                <option value="in_progress">In Progress (Active)</option>
                <option value="completed">Completed / Certified</option>
                <option value="withdrawn">Withdrawn</option>
              </select>

              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
              >
                <option value="ALL">All Penitentiaries</option>
                <option value="FAC-01">Kamiti Maximum</option>
                <option value="FAC-02">Lang'ata Women</option>
                <option value="FAC-03">Shimo La Tewa</option>
                <option value="FAC-04">King'ong'o Remand</option>
                <option value="FAC-05">Naivasha Open Camp</option>
              </select>

              {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedFacility !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setSelectedStatus('ALL');
                    setSelectedFacility('ALL');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Enrollments Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Inmate / Student</th>
                    <th className="py-2.5 px-3">Course / Discipline</th>
                    <th className="py-2.5 px-3">Progress & Modules</th>
                    <th className="py-2.5 px-3">Instructor & Dates</th>
                    <th className="py-2.5 px-3 text-center">Daily Stipend</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEnrollments.length > 0 ? (
                    filteredEnrollments.map(({ inmate, enrollment }) => {
                      const isCompleted = enrollment.status === 'completed' || enrollment.progressPercent === 100;
                      const totalHrs = enrollment.totalCourseHours || 400;
                      const hrsDone = enrollment.attendanceHoursCompleted || Math.round((enrollment.progressPercent / 100) * totalHrs);
                      const totalMods = enrollment.totalModules || 6;
                      const modsDone = enrollment.modulesCompleted || Math.round((enrollment.progressPercent / 100) * totalMods);

                      return (
                        <tr key={`${inmate.id}-${enrollment.id}`} className="hover:bg-purple-50/30 transition-colors">
                          {/* Inmate Identity */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={inmate.photoUrl}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div
                                  onClick={() => onSelectInmate(inmate)}
                                  className="font-bold text-slate-900 hover:text-[#714B67] hover:underline cursor-pointer"
                                >
                                  {inmate.firstName} {inmate.lastName}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {inmate.bookingNumber} • {inmate.facilityName.split(' ')[0]}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Course Name & Category */}
                          <td className="py-3 px-3 max-w-[240px]">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                enrollment.category === 'vocational' ? 'bg-amber-100 text-amber-900' :
                                enrollment.category === 'education' ? 'bg-blue-100 text-blue-900' :
                                'bg-purple-100 text-purple-900'
                              }`}>
                                {enrollment.category}
                              </span>
                              {enrollment.certifyingBody && (
                                <span className="text-[9px] text-slate-500 truncate" title={enrollment.certifyingBody}>
                                  {enrollment.certifyingBody.split(' ')[0]}
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-slate-900 text-xs truncate" title={enrollment.programName}>
                              {enrollment.programName}
                            </div>
                            {enrollment.certificateNumber && (
                              <div className="text-[10px] text-amber-700 font-mono mt-0.5 flex items-center gap-1">
                                <Award className="w-3 h-3 text-amber-500" />
                                {enrollment.certificateNumber}
                              </div>
                            )}
                          </td>

                          {/* Progress Percentage & Hours */}
                          <td className="py-3 px-3 min-w-[160px]">
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-bold text-slate-800">{enrollment.progressPercent}%</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {modsDone}/{totalMods} units • {hrsDone}h
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isCompleted ? 'bg-emerald-600' : 'bg-[#714B67]'
                                  }`}
                                  style={{ width: `${enrollment.progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Instructor & Dates */}
                          <td className="py-3 px-3 text-slate-600">
                            <div className="text-xs text-slate-900 font-medium truncate max-w-[150px]">
                              {enrollment.instructor}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Enrolled: {enrollment.enrollmentDate}
                            </div>
                            {enrollment.completedDate && (
                              <div className="text-[10px] text-emerald-700 font-medium">
                                Graduated: {enrollment.completedDate}
                              </div>
                            )}
                          </td>

                          {/* Daily Stipend */}
                          <td className="py-3 px-3 text-center">
                            {enrollment.dailyEarningRate > 0 ? (
                              <span className="font-mono font-bold text-emerald-700 text-xs">
                                +${enrollment.dailyEarningRate.toFixed(2)}/d
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">Non-wage</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 text-center">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Certified
                              </span>
                            ) : enrollment.status === 'withdrawn' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                Withdrawn
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                In Training
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openProgressModal(inmate, enrollment)}
                                title="Update curriculum progress, hours or mark completed"
                                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                              </button>

                              {isCompleted ? (
                                <button
                                  onClick={() => openCertificate(inmate, enrollment)}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-md font-bold text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                  Certificate
                                </button>
                              ) : (
                                <button
                                  onClick={() => openProgressModal(inmate, enrollment)}
                                  className="px-2.5 py-1 bg-[#714B67] hover:bg-[#5a3a52] text-white rounded-md font-semibold text-[11px] transition-colors"
                                >
                                  Update
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No enrollments found matching current criteria. Try adjusting search filters or enroll an inmate.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: GRADUATION & CERTIFICATE REGISTRY */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Accredited Trade & Literacy Certificate Verification Registry
              </h3>
              <p className="text-xs text-slate-500">
                Official completion registry for vocational artisan trade tests and adult basic literacy certificates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allEnrollmentRecords
              .filter(r => r.enrollment.status === 'completed' || r.enrollment.progressPercent === 100)
              .map(({ inmate, enrollment }) => {
                const certNum = enrollment.certificateNumber || `CERT-VOC-${inmate.bookingNumber.replace(/[^A-Z0-9]/gi, '')}`;
                return (
                  <div
                    key={`${inmate.id}-${enrollment.id}`}
                    className="bg-white border-2 border-amber-200/80 rounded-xl p-4 shadow-xs relative overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Top Decorative Gold Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-amber-400 via-amber-600 to-amber-400" />

                    <div className="flex items-start justify-between gap-2 mt-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={inmate.photoUrl}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-amber-300"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{inmate.firstName} {inmate.lastName}</h4>
                          <div className="text-[10px] text-slate-500 font-mono">{inmate.bookingNumber}</div>
                        </div>
                      </div>
                      <span className="p-1.5 bg-amber-100 text-amber-800 rounded-full">
                        <Award className="w-4 h-4 text-amber-700" />
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="text-xs font-bold text-slate-800 line-clamp-1">
                        {enrollment.programName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{enrollment.certifyingBody || 'National Industrial Training Authority (NITA)'}</span>
                      </div>
                      <div className="text-[10px] font-mono text-purple-900 font-bold bg-purple-50 px-2 py-0.5 rounded inline-block">
                        Grade: {enrollment.gradeOrScore || 'Distinction'}
                      </div>
                      <div className="text-[10px] font-mono text-slate-600">
                        Registry Serial: <strong className="text-slate-900">{certNum}</strong>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Conferred: {enrollment.completedDate || enrollment.enrollmentDate} • Hours: {enrollment.attendanceHoursCompleted || 720}h
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Validated
                      </span>
                      <button
                        onClick={() => openCertificate(inmate, enrollment)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        View / Print Certificate
                      </button>
                    </div>
                  </div>
                );
              })}

            {allEnrollmentRecords.filter(r => r.enrollment.status === 'completed' || r.enrollment.progressPercent === 100).length === 0 && (
              <div className="col-span-3 p-8 bg-white border border-slate-200 rounded-lg text-center text-slate-500 text-xs">
                No inmates have completed their course curricula yet. Update inmate progress to 100% to generate official certificates.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: CURRICULUMS & WORKSHOPS CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#714B67]" />
                Accredited Curriculum Catalogue & Practical Trade Syllabus
              </h3>
              <p className="text-xs text-slate-500">
                Official standards recognized by the Kenya Prisons Directorate and accredited national qualification boards.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EDUCATIONAL_AND_VOCATIONAL_COURSES.map(course => {
              const enrolledInThisCourse = allEnrollmentRecords.filter(r => r.enrollment.programId === course.id);
              return (
                <div
                  key={course.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between hover:border-purple-300 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-[#714B67]">
                        {course.categoryLabel}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {course.dailyWage > 0 ? `+$${course.dailyWage.toFixed(2)}/day` : 'Non-wage'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{course.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="text-[11px] space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      <div className="flex justify-between text-slate-600">
                        <span>Duration:</span>
                        <strong className="text-slate-800">{course.durationWeeks} Weeks ({course.totalHours} hrs)</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Curriculum Modules:</span>
                        <strong className="text-slate-800">{course.totalModules} Units</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Certifying Body:</span>
                        <strong className="text-slate-800 truncate max-w-[160px]" title={course.certifyingBody}>
                          {course.certifyingBody}
                        </strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Lead Instructor:</span>
                        <strong className="text-slate-800 truncate max-w-[160px]">{course.defaultInstructor}</strong>
                      </div>
                    </div>

                    {/* Skills Checklist */}
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Core Competencies Taught:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {course.skillsLearned.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                            {skill}
                          </span>
                        ))}
                        {course.skillsLearned.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{course.skillsLearned.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer & Enroll shortcut */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      {enrolledInThisCourse.length} Enrolled
                    </span>
                    <button
                      onClick={() => {
                        setPreselectedCourseId(course.id);
                        setIsEnrollModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#714B67] hover:bg-[#5a3a52] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Enroll Inmate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Enroll Inmate Modal */}
      <EnrollInmateModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        inmates={inmates}
        onEnroll={handleEnrollInmate}
        preselectedInmateId={undefined}
      />

      {/* 2. Certificate Viewer / Generator Modal */}
      {certModalState.isOpen && certModalState.inmate && certModalState.enrollment && (
        <CertificateModal
          isOpen={certModalState.isOpen}
          onClose={() => setCertModalState({ isOpen: false })}
          inmate={certModalState.inmate}
          enrollment={certModalState.enrollment}
        />
      )}

      {/* 3. Update Progress Modal */}
      {progressModalState.isOpen && progressModalState.inmate && progressModalState.enrollment && (
        <UpdateProgressModal
          isOpen={progressModalState.isOpen}
          onClose={() => setProgressModalState({ isOpen: false })}
          inmate={progressModalState.inmate}
          enrollment={progressModalState.enrollment}
          onSave={handleSaveProgress}
          onOpenCertificate={openCertificate}
        />
      )}
    </div>
  );
};
