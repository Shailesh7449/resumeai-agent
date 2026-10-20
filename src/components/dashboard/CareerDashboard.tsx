import React from 'react';
import {
  FileText,
  Briefcase,
  Bot,
  Kanban,
  Brain,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Layers,
  Award
} from 'lucide-react';
import { UserProfile, ParsedResume, ApplicationRecord, JobListing } from '../../types';
import { CURATED_JOBS } from '../../data/jobsData';
import { rankJobsHybrid, DEFAULT_WEIGHTS } from '../../services/mlEngine';
import { NavTab } from '../Navbar';

interface CareerDashboardProps {
  user: UserProfile | null;
  activeResume: ParsedResume | null;
  savedJobIds: string[];
  applications: ApplicationRecord[];
  onSelectTab: (tab: NavTab) => void;
  onSelectJobForMatch: (job: JobListing) => void;
  onOpenUpload: () => void;
}

export const CareerDashboard: React.FC<CareerDashboardProps> = ({
  user,
  activeResume,
  savedJobIds,
  applications,
  onSelectTab,
  onSelectJobForMatch,
  onOpenUpload
}) => {
  // Compute top recommended jobs dynamically
  const rankedJobs = activeResume
    ? rankJobsHybrid(activeResume, CURATED_JOBS, user || undefined, DEFAULT_WEIGHTS)
    : [];

  const topRecommendations = rankedJobs.slice(0, 3);

  // Application Pipeline stats
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activeInterviews = (statusCounts['Interview'] || 0);
  const activeOffers = (statusCounts['Offer'] || 0);
  const appliedCount = (statusCounts['Applied'] || 0);

  // Profile completeness score
  let completeness = 30; // base account
  if (user?.target_title) completeness += 20;
  if (user?.preferred_work_arrangement) completeness += 10;
  if (activeResume) completeness += 40;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Machine Learning Career Intelligence Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name || 'Candidate'}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            ResumeAI Agent analyzes your resume using hybrid cosine semantics, normalized skill coverage taxonomies, and multi-parameter preference scoring to discover and prepare matching job applications.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onSelectTab('jobs')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-600/25"
            >
              <Briefcase className="w-4 h-4" /> View Ranked Job Matches
            </button>
            <button
              onClick={() => onSelectTab('agent')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-indigo-400" /> Chat with Career Agent
            </button>
            <button
              onClick={() => onSelectTab('evaluation')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-2"
            >
              <Brain className="w-4 h-4 text-violet-400" /> ML Benchmark (Course Evaluation)
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Resume Status */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Resume</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-xl font-bold text-white truncate max-w-[170px]">
              {activeResume ? activeResume.name : 'No Resume'}
            </span>
            {activeResume && (
              <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                {activeResume.atsScore} ATS
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {activeResume
              ? `${activeResume.skills.length} skills extracted & indexed`
              : 'Upload a resume to calculate real-time match rankings'}
          </div>
        </div>

        {/* Metric 2: Application Pipeline */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Application Pipeline</span>
            <Kanban className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{applications.length}</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {activeInterviews} in Interview
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {appliedCount} submitted • {activeOffers} offers received
          </div>
        </div>

        {/* Metric 3: Saved Opportunities */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Saved Opportunities</span>
            <Briefcase className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{savedJobIds.length}</span>
            <span className="text-xs text-indigo-300">Target Roles</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Ready for tailored cover letter drafting
          </div>
        </div>

        {/* Metric 4: Profile & Preferences */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Profile Match Calibration</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{completeness}%</span>
            <span className="text-xs text-slate-400">{user?.experience_level || 'Mid'} Level</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 truncate">
            {user?.target_title || 'Software Engineering'} • {user?.preferred_work_arrangement || 'Remote'}
          </div>
        </div>
      </div>

      {/* Main Grid: Recommended Jobs & Skill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Recommended Jobs (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Top Machine Learning Recommendations</h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold">
                Hybrid Ranked
              </span>
            </div>
            <button
              onClick={() => onSelectTab('jobs')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              View all ({CURATED_JOBS.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {topRecommendations.length > 0 ? (
            <div className="space-y-3">
              {topRecommendations.map(({ job, explanation }) => {
                const matchPct = Math.round(explanation.overallScore * 100);
                return (
                  <div
                    key={job.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-base">{job.title}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                            {job.arrangement}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {job.company} • {job.location} • {job.salaryRange || 'Competitive'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-2xl font-black text-indigo-400">{matchPct}%</div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Match Score</div>
                      </div>
                    </div>

                    {/* Matched skills chips */}
                    <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[11px] text-slate-400 font-medium mr-1">Matched Skills:</span>
                      {explanation.matchedSkills.slice(0, 4).map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                      {explanation.missingSkills.length > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-medium">
                          +{explanation.missingSkills.length} to develop
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Formula: 0.45×{Math.round(explanation.semanticScore * 100)}% + 0.40×{Math.round(explanation.skillCoverageScore * 100)}% + 0.15×{Math.round(explanation.preferenceScore * 100)}%
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectJobForMatch(job)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium"
                        >
                          Explain Match
                        </button>
                        <button
                          onClick={() => {
                            onSelectJobForMatch(job);
                            onSelectTab('jobs');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition font-medium"
                        >
                          Job Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="font-semibold text-white">No Resume Uploaded Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Upload your resume or load a test sample to calculate personalized match scores and skill coverage.
              </p>
              <button
                onClick={onOpenUpload}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                Upload Resume Now
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Active Skills & Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Extracted Skill Footprint</h2>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            {activeResume ? (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Skills Identified</span>
                  <span className="font-bold text-white">{activeResume.skills.length} Skills</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeResume.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700/80 text-xs text-slate-200 font-medium"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="text-xs font-semibold text-slate-300 mb-2">ATS Strengths</div>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {activeResume.atsStrengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No active resume skills loaded.
              </div>
            )}
          </div>

          {/* Quick Agent Actions Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-900/40">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-sm mb-2">
              <Bot className="w-4 h-4" /> Career Agent Quick Tasks
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Execute verified functions directly via conversational agent tools.
            </p>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => onSelectTab('agent')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition flex items-center justify-between group"
              >
                <span>"Find machine learning jobs matching my resume"</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition" />
              </button>
              <button
                onClick={() => onSelectTab('agent')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition flex items-center justify-between group"
              >
                <span>"Identify skill gaps for Senior Backend Engineer"</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition" />
              </button>
              <button
                onClick={() => onSelectTab('agent')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition flex items-center justify-between group"
              >
                <span>"Draft a tailored cover letter for Nexus AI Labs"</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
