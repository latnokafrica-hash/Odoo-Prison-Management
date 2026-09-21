import React, { useState } from 'react';
import { Inmate, RehabilitationEnrollment } from '../../types';
import { EDUCATIONAL_AND_VOCATIONAL_COURSES, CourseCurriculum } from '../../data/educationalCoursesData';
import { GraduationCap, BookOpen, Wrench, X, Check, Search, Calendar, User, ShieldAlert } from 'lucide-react';

interface EnrollInmateModalProps {
  isOpen: boolean;
  onClose: () => void;
  inmates: Inmate[];
  onEnroll: (inmateId: string, enrollment: RehabilitationEnrollment) => void;
  preselectedInmateId?: string;
}

export const EnrollInmateModal: React.FC<EnrollInmateModalProps> = ({
  isOpen,
  onClose,
  inmates,
  onEnroll,
  preselectedInmateId
}) => {
  const [selectedInmateId, setSelectedInmateId] = useState<string>(preselectedInmateId || (inmates[0]?.id || ''));
  const [selectedCourseId, setSelectedCourseId] = useState<string>(EDUCATIONAL_AND_VOCATIONAL_COURSES[0]?.id || '');
  const [enrollmentDate, setEnrollmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [instructor, setInstructor] = useState<string>(EDUCATIONAL_AND_VOCATIONAL_COURSES[0]?.defaultInstructor || '');
  const [inmateSearch, setInmateSearch] = useState<string>('');
  const [trainingRemarks, setTrainingRemarks] = useState<string>('');

  if (!isOpen) return null;

  const selectedInmate = inmates.find(i => i.id === selectedInmateId);
  const selectedCourse = EDUCATIONAL_AND_VOCATIONAL_COURSES.find(c => c.id === selectedCourseId);

  const filteredInmates = inmates.filter(i => {
    const q = inmateSearch.toLowerCase();
    return (
      i.firstName.toLowerCase().includes(q) ||
      i.lastName.toLowerCase().includes(q) ||
      i.bookingNumber.toLowerCase().includes(q) ||
      i.facilityName.toLowerCase().includes(q)
    );
  });

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    const course = EDUCATIONAL_AND_VOCATIONAL_COURSES.find(c => c.id === courseId);
    if (course) {
      setInstructor(course.defaultInstructor);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInmate || !selectedCourse) return;

    // Check if inmate is already enrolled in this course
    const alreadyEnrolled = selectedInmate.programs.some(p => p.programId === selectedCourse.id && p.status === 'in_progress');
    if (alreadyEnrolled) {
      alert(`${selectedInmate.firstName} ${selectedInmate.lastName} is already actively enrolled in this program.`);
      return;
    }

    const newEnrollment: RehabilitationEnrollment = {
      id: `prg-${Date.now()}`,
      programId: selectedCourse.id,
      programName: selectedCourse.name,
      category: selectedCourse.category,
      enrollmentDate,
      progressPercent: 0,
      status: 'in_progress',
      dailyEarningRate: selectedCourse.dailyWage,
      instructor: instructor || selectedCourse.defaultInstructor,
      certifyingBody: selectedCourse.certifyingBody,
      attendanceHoursCompleted: 0,
      totalCourseHours: selectedCourse.totalHours,
      modulesCompleted: 0,
      totalModules: selectedCourse.totalModules,
      skillsAcquired: [],
      instructorRemarks: trainingRemarks || `Admitted to ${selectedCourse.name} under Progressive Rehabilitation System.`
    };

    onEnroll(selectedInmate.id, newEnrollment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-100 text-[#714B67] rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enroll Inmate in Rehabilitation Course</h3>
              <p className="text-xs text-slate-500">Assign vocational trade, basic literacy, or technical curriculum</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Step 1: Inmate Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Select Inmate for Enrollment
            </label>
            
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by name, booking #, or facility..."
                  value={inmateSearch}
                  onChange={(e) => setInmateSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                />
              </div>

              <select
                value={selectedInmateId}
                onChange={(e) => setSelectedInmateId(e.target.value)}
                className="w-full text-xs font-medium py-2 px-3 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] bg-white"
                required
              >
                {filteredInmates.map(inm => (
                  <option key={inm.id} value={inm.id}>
                    {inm.bookingNumber} - {inm.firstName} {inm.lastName} ({inm.facilityName.split(' ')[0]}) • Stage: {inm.progressiveStage.replace('_', ' ')} • Enrolled: {inm.programs.length} courses
                  </option>
                ))}
              </select>
            </div>

            {selectedInmate && (
              <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedInmate.photoUrl}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover border border-slate-300"
                  />
                  <div>
                    <span className="font-bold text-slate-900">{selectedInmate.firstName} {selectedInmate.lastName}</span>
                    <span className="text-[11px] text-slate-500 ml-2">Cell: {selectedInmate.cellLocation}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="capitalize px-2 py-0.5 rounded bg-purple-100 text-[#714B67] font-semibold text-[10px]">
                    {selectedInmate.progressiveStage.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-emerald-700 font-bold">
                    Gratuity: ${selectedInmate.gratuityBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Course Curriculum Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Course Curriculum
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full text-xs font-medium py-2 px-3 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] bg-white"
              required
            >
              {EDUCATIONAL_AND_VOCATIONAL_COURSES.map(course => (
                <option key={course.id} value={course.id}>
                  [{course.categoryLabel}] {course.name} ({course.durationWeeks} wks, {course.totalHours} hrs)
                </option>
              ))}
            </select>

            {selectedCourse && (
              <div className="mt-2.5 p-3.5 bg-purple-50/50 border border-purple-200/70 rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-100 text-[#714B67]">
                      {selectedCourse.categoryLabel}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{selectedCourse.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      {selectedCourse.dailyWage > 0 ? `+$${selectedCourse.dailyWage.toFixed(2)} / day stipend` : 'Non-Wage Educational'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{selectedCourse.description}</p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-200/50 text-[10px] text-slate-600">
                  <div>Certifying Authority: <strong className="text-slate-800">{selectedCourse.certifyingBody}</strong></div>
                  <div>Accreditation: <strong className="text-slate-800">{selectedCourse.accreditationStandard}</strong></div>
                  <div>Curriculum Duration: <strong className="text-slate-800">{selectedCourse.durationWeeks} Weeks ({selectedCourse.totalHours} Hours)</strong></div>
                  <div>Modules: <strong className="text-slate-800">{selectedCourse.totalModules} Units</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Instructor & Enrollment Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Lead Instructor
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="e.g. Master Craftsman S. Wekesa"
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Enrollment Date
              </label>
              <input
                type="date"
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
                required
              />
            </div>
          </div>

          {/* Training Notes / Reintegration Target */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Rehabilitation Assessment & Target Goals (Optional)
            </label>
            <textarea
              rows={2}
              value={trainingRemarks}
              onChange={(e) => setTrainingRemarks(e.target.value)}
              placeholder="e.g. Inmate assigned to carpentry workshop pursuant to post-release trade transition plan."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#714B67] hover:bg-[#5a3a52] rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              Enroll Inmate in Program
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
