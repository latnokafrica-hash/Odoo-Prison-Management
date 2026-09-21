import React, { useState } from 'react';
import { Inmate, RehabilitationEnrollment } from '../../types';
import { EDUCATIONAL_AND_VOCATIONAL_COURSES } from '../../data/educationalCoursesData';
import { Award, CheckCircle2, TrendingUp, X, Sparkles, Clock, BookOpen, FileText } from 'lucide-react';

interface UpdateProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  inmate: Inmate;
  enrollment: RehabilitationEnrollment;
  onSave: (inmateId: string, updatedEnrollment: RehabilitationEnrollment) => void;
  onOpenCertificate?: (inmate: Inmate, enrollment: RehabilitationEnrollment) => void;
}

export const UpdateProgressModal: React.FC<UpdateProgressModalProps> = ({
  isOpen,
  onClose,
  inmate,
  enrollment,
  onSave,
  onOpenCertificate
}) => {
  const courseCurriculum = EDUCATIONAL_AND_VOCATIONAL_COURSES.find(c => c.id === enrollment.programId);
  const totalHours = enrollment.totalCourseHours || courseCurriculum?.totalHours || 400;
  const totalModules = enrollment.totalModules || courseCurriculum?.totalModules || 6;

  const [progressPercent, setProgressPercent] = useState<number>(enrollment.progressPercent);
  const [status, setStatus] = useState<'in_progress' | 'completed' | 'withdrawn'>(enrollment.status);
  const [hoursCompleted, setHoursCompleted] = useState<number>(enrollment.attendanceHoursCompleted || Math.round((enrollment.progressPercent / 100) * totalHours));
  const [modulesCompleted, setModulesCompleted] = useState<number>(enrollment.modulesCompleted || Math.round((enrollment.progressPercent / 100) * totalModules));
  const [grade, setGrade] = useState<string>(enrollment.gradeOrScore || 'Distinction (Artisan Grade II)');
  const [completionDate, setCompletionDate] = useState<string>(enrollment.completedDate || new Date().toISOString().split('T')[0]);
  const [instructorRemarks, setInstructorRemarks] = useState<string>(enrollment.instructorRemarks || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    enrollment.skillsAcquired && enrollment.skillsAcquired.length > 0
      ? enrollment.skillsAcquired
      : (courseCurriculum?.skillsLearned.slice(0, 3) || ['Practical Workshop Execution', 'Tool Maintenance & Safety'])
  );

  if (!isOpen) return null;

  const handleSliderChange = (newVal: number) => {
    setProgressPercent(newVal);
    const calculatedHours = Math.round((newVal / 100) * totalHours);
    const calculatedModules = Math.min(totalModules, Math.round((newVal / 100) * totalModules));
    setHoursCompleted(calculatedHours);
    setModulesCompleted(calculatedModules);

    if (newVal === 100 && status !== 'completed') {
      setStatus('completed');
    }
  };

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSave = (viewCertAfter = false) => {
    const isCompleted = status === 'completed' || progressPercent === 100;
    const certNumber = isCompleted
      ? (enrollment.certificateNumber || `CERT-${(enrollment.category || 'VOC').toUpperCase().slice(0, 3)}-${new Date().getFullYear()}-${inmate.bookingNumber.replace(/[^A-Z0-9]/gi, '')}`)
      : undefined;

    const updated: RehabilitationEnrollment = {
      ...enrollment,
      progressPercent,
      status: isCompleted ? 'completed' : status,
      attendanceHoursCompleted: hoursCompleted,
      totalCourseHours: totalHours,
      modulesCompleted,
      totalModules,
      completedDate: isCompleted ? completionDate : undefined,
      certificateNumber: certNumber,
      certificateIssuedAt: isCompleted ? (enrollment.certificateIssuedAt || completionDate) : undefined,
      gradeOrScore: isCompleted ? grade : undefined,
      certifyingBody: enrollment.certifyingBody || courseCurriculum?.certifyingBody || 'National Industrial Training Authority (NITA)',
      skillsAcquired: selectedSkills,
      instructorRemarks
    };

    onSave(inmate.id, updated);
    onClose();

    if (viewCertAfter && onOpenCertificate) {
      onOpenCertificate(inmate, updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Update Course Progress & Evaluation</h3>
              <p className="text-xs text-slate-500">
                {inmate.bookingNumber} • {inmate.firstName} {inmate.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Course Information Header */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Course / Trade</div>
              <div className="font-bold text-slate-900 text-sm">{enrollment.programName}</div>
              <div className="text-slate-500 mt-0.5">Instructor: {enrollment.instructor} • Enrolled: {enrollment.enrollmentDate}</div>
            </div>
            <div className="text-right">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${
                status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                status === 'withdrawn' ? 'bg-rose-100 text-rose-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Curriculum Progress: <span className="text-[#714B67] text-sm">{progressPercent}%</span>
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleSliderChange(50)}
                  className="px-2 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-[11px] text-slate-600"
                >
                  Midterm (50%)
                </button>
                <button
                  type="button"
                  onClick={() => handleSliderChange(100)}
                  className="px-2 py-0.5 rounded border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-[11px] text-emerald-800 font-bold"
                >
                  Complete (100%)
                </button>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={progressPercent}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full accent-[#714B67] cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          {/* Metrics: Hours Completed & Modules Completed */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instructional Hours
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={totalHours}
                  value={hoursCompleted}
                  onChange={(e) => setHoursCompleted(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold py-1.5 px-2.5 rounded border border-slate-300 focus:ring-1 focus:ring-[#714B67]"
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">/ {totalHours} hrs</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Modules Mastered
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={totalModules}
                  value={modulesCompleted}
                  onChange={(e) => setModulesCompleted(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold py-1.5 px-2.5 rounded border border-slate-300 focus:ring-1 focus:ring-[#714B67]"
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">/ {totalModules} units</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enrollment Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const s = e.target.value as any;
                  setStatus(s);
                  if (s === 'completed' && progressPercent < 100) {
                    setProgressPercent(100);
                  }
                }}
                className="w-full text-xs font-medium py-1.5 px-2.5 rounded border border-slate-300 focus:ring-1 focus:ring-[#714B67] bg-white"
              >
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed / Graduated</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          {/* Completion & Certificate Generation Section */}
          {(status === 'completed' || progressPercent === 100) && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Award className="w-4 h-4 text-emerald-700" />
                Accredited Completion & Certificate Issuance Parameters
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Graduation / Completion Date
                  </label>
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Award Grade / Competency Classification
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 rounded border border-slate-300 bg-white"
                  >
                    <option value="Distinction (Artisan Grade II)">Distinction (Artisan Grade II)</option>
                    <option value="Credit with Honors">Credit with Honors</option>
                    <option value="Grade II Craft Pass">Grade II Craft Pass</option>
                    <option value="Advanced Functional Proficiency">Advanced Functional Proficiency</option>
                    <option value="Satisfactory Completion">Satisfactory Completion</option>
                  </select>
                </div>
              </div>

              {/* Skills Checklist for Certificate */}
              {courseCurriculum && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                    Skills & Competencies Endorsed on Official Certificate:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {courseCurriculum.skillsLearned.map((skill, idx) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleToggleSkill(skill)}
                          className={`text-[10px] px-2 py-1 rounded-md border flex items-center gap-1 transition-colors ${
                            isSelected
                              ? 'bg-emerald-700 text-white border-emerald-800'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3 h-3" />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructor Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instructor Remarks & Clinical Assessment
            </label>
            <textarea
              rows={2}
              value={instructorRemarks}
              onChange={(e) => setInstructorRemarks(e.target.value)}
              placeholder="e.g. Mastered workshop safety drills and completed institutional furniture assignment with precision."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              {(status === 'completed' || progressPercent === 100 || enrollment.status === 'completed') && (
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Award className="w-4 h-4 text-emerald-700" />
                  Save & View Certificate Now
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#714B67] hover:bg-[#5a3a52] rounded-lg transition-colors shadow-xs"
              >
                Save Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
