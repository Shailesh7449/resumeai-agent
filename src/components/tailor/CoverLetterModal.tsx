import React, { useState } from 'react';
import { X, Copy, Check, Download, Sparkles, FileText, Briefcase } from 'lucide-react';
import { JobListing, ParsedResume } from '../../types';
import { careerAgentService } from '../../services/agentTools';

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobListing | null;
  resume: ParsedResume | null;
}

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({
  isOpen,
  onClose,
  job,
  resume
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'letter' | 'summary'>('letter');

  if (!isOpen || !job) return null;

  const candidateName = resume?.name || 'Candidate';
  const candidateEmail = resume?.email || 'candidate@example.com';
  const topSkills = resume?.skills.slice(0, 4).map(s => s.name).join(', ') || 'Software Engineering, Problem Solving';

  const coverLetterText = `Dear Hiring Team at ${job.company},

I am writing to express my enthusiasm for the ${job.title} position (${job.arrangement} • ${job.location}). With deep practical experience across ${topSkills}, I am excited about the opportunity to contribute directly to ${job.company}'s engineering objectives.

In my recent projects, I focused on building scalable, production-grade systems while optimizing developer velocity and system performance. Specifically, my experience with ${job.requiredSkills.slice(0, 2).join(' and ')} aligns closely with the technical requirements outlined in your job description.

I welcome the opportunity to discuss how my technical skills and enthusiasm for high-quality software engineering will deliver value to your team. Thank you for your time and consideration.

Sincerely,
${candidateName}
${candidateEmail}`;

  const summaryText = `Results-driven software engineering professional with hands-on expertise in ${topSkills}. Proven track record designing and delivering high-performance software systems and data pipelines with measurable reliability. Eager to leverage technical rigor, cross-functional collaboration, and continuous improvement as a ${job.title}.`;

  const currentText = activeTab === 'letter' ? coverLetterText : summaryText;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${candidateName.replace(/\s+/g, '_')}_${job.company}_${activeTab === 'letter' ? 'Cover_Letter' : 'Summary'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Tailored Application Materials
            </div>
            <h2 className="text-xl font-bold text-white">{job.title}</h2>
            <p className="text-xs text-slate-400">{job.company} • {job.location}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 my-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('letter')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'letter' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Targeted Cover Letter
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'summary' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Role-Tailored Resume Summary
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto">
          <textarea
            readOnly
            value={currentText}
            rows={12}
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed resize-none focus:outline-none"
          />
        </div>

        {/* Disclaimer & Action Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-slate-400 text-[11px]">
            ⚠️ <em>Draft generated using only verified resume skills. Always review and customize before submitting.</em>
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition"
            >
              <Download className="w-3.5 h-3.5" /> Download (.txt)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
