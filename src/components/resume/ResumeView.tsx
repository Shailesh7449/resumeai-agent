import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  Code2,
  GraduationCap,
  Briefcase,
  Layers,
  Award,
  RefreshCw
} from 'lucide-react';
import { ParsedResume } from '../../types';
import { parseResumeDocument } from '../../services/resumeParser';
import { SAMPLE_RESUMES } from '../../data/sampleResumes';

interface ResumeViewProps {
  userId: string;
  activeResume: ParsedResume | null;
  onUpdateResume: (resume: ParsedResume) => void;
}

export const ResumeView: React.FC<ResumeViewProps> = ({
  userId,
  activeResume,
  onUpdateResume
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [rawTextModalOpen, setRawTextModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);
    setUploading(true);

    try {
      const result = await parseResumeDocument(file, userId);
      if (!result.success || !result.resume) {
        setUploadError(result.error || 'Failed to parse document');
      } else {
        onUpdateResume(result.resume);
        setUploadSuccess(`Successfully parsed ${file.name} (${result.resume.skills.length} skills extracted, ${result.resume.atsScore} ATS score)!`);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Error uploading file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoadSample = (sampleKey: 'ml-engineer' | 'full-stack') => {
    const sample = SAMPLE_RESUMES[sampleKey];
    if (sample) {
      onUpdateResume(sample);
      setUploadSuccess(`Loaded sample profile: ${sample.name} (${sampleKey === 'ml-engineer' ? 'ML Engineer' : 'Full Stack Developer'})`);
      setUploadError(null);
    }
  };

  // Group skills by category
  const skillsByCategory = activeResume?.skills.reduce((acc, skill) => {
    acc[skill.category] = acc[skill.category] || [];
    acc[skill.category].push(skill.name);
    return acc;
  }, {} as Record<string, string[]>) || {};

  return (
    <div className="space-y-6">
      {/* Top Banner & Upload Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Resume Parsing & Structured Skill Extraction
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Resume Intelligence</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Upload your PDF, DOCX, or TXT resume. The platform normalizes text, indexes skills across canonical taxonomies, and computes an automated ATS score.
            </p>
          </div>

          {/* Upload Button & Sample Quick Load */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.doc,.txt"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/25"
            >
              {uploading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? 'Parsing Document...' : 'Upload New Resume'}
            </button>

            <button
              onClick={() => handleLoadSample('ml-engineer')}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition"
            >
              Load ML Resume
            </button>
            <button
              onClick={() => handleLoadSample('full-stack')}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition"
            >
              Load Full Stack
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}
      </div>

      {activeResume ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: ATS Score & Overview (1 col) */}
          <div className="space-y-4">
            {/* ATS Score Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                ATS Compatibility Score
              </div>
              <div className="relative inline-flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border-4 border-indigo-500/30 flex items-center justify-center">
                  <div className="text-3xl font-black text-indigo-400 font-mono">
                    {activeResume.atsScore}
                    <span className="text-sm text-slate-500">/100</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Calculated based on contact readability, quantifiable metrics, and categorized technical keywords.
              </p>

              <div className="mt-4 pt-4 border-t border-slate-800 text-left space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {activeResume.atsStrengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {activeResume.atsImprovements.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Suggestions
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {activeResume.atsImprovements.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Document Info */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2.5">
              <div className="font-semibold text-white">Document Metadata</div>
              <div className="flex justify-between text-slate-400">
                <span>File Name:</span>
                <span className="text-slate-200 font-mono truncate max-w-[150px]">{activeResume.fileName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>File Size:</span>
                <span className="text-slate-200 font-mono">{(activeResume.fileSize / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Indexed Skills:</span>
                <span className="text-indigo-400 font-bold">{activeResume.skills.length}</span>
              </div>
              <button
                onClick={() => setRawTextModalOpen(true)}
                className="w-full mt-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
              >
                View Normalized Raw Text
              </button>
            </div>
          </div>

          {/* Right Column: Structured Resume Sections (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Header */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{activeResume.name || 'Candidate Name'}</h2>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-1">
                    {activeResume.email && <span>📧 {activeResume.email}</span>}
                    {activeResume.phone && <span>📞 {activeResume.phone}</span>}
                    {activeResume.location && <span>📍 {activeResume.location}</span>}
                  </div>
                </div>
              </div>

              {activeResume.summary && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Professional Summary
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeResume.summary}
                  </p>
                </div>
              )}
            </div>

            {/* Categorized Skills Breakdown */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-base">Extracted Technical Skills Taxonomy</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {activeResume.skills.length} skills total
                </span>
              </div>

              <div className="space-y-4">
                {Object.entries(skillsByCategory).map(([category, skills]) => (
                  <div key={category} className="space-y-1.5">
                    <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                      <span>{category}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{skills.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience & Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold text-sm mb-3">
                  <Briefcase className="w-4 h-4 text-emerald-400" /> Work Experience
                </div>
                {activeResume.experience.length > 0 ? (
                  <div className="space-y-3">
                    {activeResume.experience.map((exp, i) => (
                      <div key={i} className="text-xs space-y-1">
                        <div className="font-semibold text-white">{exp.role}</div>
                        <div className="text-slate-400">{exp.company} • {exp.startDate} - {exp.endDate || (exp.current ? 'Present' : '')}</div>
                        <ul className="mt-1 space-y-1 text-slate-300">
                          {exp.highlights.slice(0, 2).map((h, hi) => (
                            <li key={hi} className="text-[11px] text-slate-400 leading-snug">• {h}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No structured roles extracted.</p>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 text-white font-bold text-sm mb-3">
                  <GraduationCap className="w-4 h-4 text-violet-400" /> Education & Credentials
                </div>
                {activeResume.education.length > 0 ? (
                  <div className="space-y-3">
                    {activeResume.education.map((edu, i) => (
                      <div key={i} className="text-xs space-y-0.5">
                        <div className="font-semibold text-white">{edu.degree}</div>
                        <div className="text-slate-400">{edu.institution} {edu.graduationYear ? `(${edu.graduationYear})` : ''}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No education entries extracted.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center">
          <Upload className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white">Upload Your Resume to Begin</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Upload your PDF, DOCX, or text file. Or click either of the sample buttons above to evaluate the parser instantly.
          </p>
        </div>
      )}

      {/* Raw Text Modal */}
      {rawTextModalOpen && activeResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white">Normalized Raw Resume Text Stream</h3>
              <button
                onClick={() => setRawTextModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <pre className="mt-4 flex-1 overflow-y-auto p-4 rounded-xl bg-slate-950 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed border border-slate-800">
              {activeResume.rawText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
