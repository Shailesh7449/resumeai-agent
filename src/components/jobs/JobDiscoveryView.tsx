import React, { useState } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  ArrowUpDown,
  PlusCircle,
  FileEdit,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { JobListing, ParsedResume, UserProfile, MatchExplanation, RankingWeights } from '../../types';
import { CURATED_JOBS } from '../../data/jobsData';
import { rankJobsHybrid, DEFAULT_WEIGHTS } from '../../services/mlEngine';
import { storageService } from '../../services/storageService';

interface JobDiscoveryViewProps {
  user: UserProfile | null;
  activeResume: ParsedResume | null;
  savedJobIds: string[];
  onToggleSaveJob: (jobId: string) => void;
  onOpenTailorModal: (job: JobListing) => void;
  onAddToTracker: (job: JobListing) => void;
}

export const JobDiscoveryView: React.FC<JobDiscoveryViewProps> = ({
  user,
  activeResume,
  savedJobIds,
  onToggleSaveJob,
  onOpenTailorModal,
  onAddToTracker
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArrangement, setSelectedArrangement] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('All');
  const [selectedJobForModal, setSelectedJobForModal] = useState<{ job: JobListing; explanation: MatchExplanation } | null>(null);

  // Compute Hybrid Rankings
  const rankedItems = activeResume
    ? rankJobsHybrid(activeResume, CURATED_JOBS, user || undefined, DEFAULT_WEIGHTS)
    : CURATED_JOBS.map(job => ({
        job,
        explanation: {
          jobId: job.id,
          overallScore: 0.5,
          semanticScore: 0.5,
          skillCoverageScore: 0.5,
          preferenceScore: 0.5,
          matchedSkills: [],
          missingSkills: job.requiredSkills,
          partialSkills: [],
          weightsUsed: DEFAULT_WEIGHTS,
          reasoningNotes: ['Upload a resume to calculate dynamic ML match scores']
        }
      }));

  // Filter items
  const filteredItems = rankedItems.filter(({ job }) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.description.toLowerCase().includes(q) ||
      job.requiredSkills.some(s => s.toLowerCase().includes(q));

    const matchArrangement = selectedArrangement === 'All' || job.arrangement === selectedArrangement;
    const matchLevel = selectedLevel === 'All' || job.experienceLevel === selectedLevel;
    const matchSkill = selectedSkillFilter === 'All' || job.requiredSkills.includes(selectedSkillFilter);

    return matchQuery && matchArrangement && matchLevel && matchSkill;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Hybrid ML Recommender Engine
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Job Discovery & Matching</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time candidate-to-job matching combining semantic text overlap, explicit skill coverage, and user preference constraints.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2">
          <span className="font-mono text-indigo-400 font-bold">{filteredItems.length}</span> matching opportunities found
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title, company, technology (e.g. PyTorch, React, Go, Remote)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Work Arrangement</label>
            <select
              value={selectedArrangement}
              onChange={(e) => setSelectedArrangement(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Arrangements</option>
              <option value="Remote">Remote Only</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Experience Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Experience Tiers</option>
              <option value="Entry">Entry Level</option>
              <option value="Mid">Mid Level</option>
              <option value="Senior">Senior Level</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Core Required Skill</label>
            <select
              value={selectedSkillFilter}
              onChange={(e) => setSelectedSkillFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Skills</option>
              <option value="Python">Python</option>
              <option value="TypeScript">TypeScript</option>
              <option value="React">React</option>
              <option value="PyTorch">PyTorch</option>
              <option value="Docker">Docker</option>
              <option value="PostgreSQL">PostgreSQL</option>
              <option value="Go">Go</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map(({ job, explanation }) => {
            const isSaved = savedJobIds.includes(job.id);
            const matchPercent = Math.round(explanation.overallScore * 100);

            return (
              <div
                key={job.id}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-white tracking-tight">{job.title}</h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {job.arrangement}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                        {job.experienceLevel} Level
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                      <span className="font-semibold text-slate-300">{job.company}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" /> {job.location}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-emerald-400">{job.salaryRange || 'Competitive Salary'}</span>
                    </div>

                    <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Skill Alignment Badges */}
                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-medium mr-1">Skills:</span>
                      {job.requiredSkills.map(skill => {
                        const isMatched = explanation.matchedSkills.includes(skill);
                        return (
                          <span
                            key={skill}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                              isMatched
                                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            {isMatched ? `✓ ${skill}` : skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Match Score Badge & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0">
                    <div className="text-center sm:text-right">
                      <div className="text-3xl font-black text-indigo-400 font-mono tracking-tight">
                        {matchPercent}%
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Match Score
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleSaveJob(job.id)}
                        className={`p-2 rounded-xl border transition ${
                          isSaved
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                        title={isSaved ? 'Remove from Saved Jobs' : 'Save Job'}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] text-slate-400">
                    Semantic: {Math.round(explanation.semanticScore * 100)}% • Skill Coverage: {Math.round(explanation.skillCoverageScore * 100)}%
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedJobForModal({ job, explanation })}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition font-medium flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Explain Match
                    </button>

                    <button
                      onClick={() => onOpenTailorModal(job)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition font-medium flex items-center gap-1.5"
                    >
                      <FileEdit className="w-3.5 h-3.5 text-emerald-400" /> Draft Cover Letter
                    </button>

                    <button
                      onClick={() => onAddToTracker(job)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition font-medium flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Track Application
                    </button>

                    <a
                      href={job.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Open Job Posting URL"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <Filter className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="font-semibold text-white">No Jobs Match Current Filters</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filters or clearing your search term.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedArrangement('All');
                setSelectedLevel('All');
                setSelectedSkillFilter('All');
              }}
              className="mt-3 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Explain Match Detail Modal */}
      {selectedJobForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  ML Explainability Breakdown
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {selectedJobForModal.job.title}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedJobForModal.job.company} • {selectedJobForModal.job.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedJobForModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Score Breakdown Bar */}
            <div className="my-5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 font-medium">Final Calculated Hybrid Score</div>
              <div className="text-4xl font-black text-indigo-400 font-mono my-1">
                {Math.round(selectedJobForModal.explanation.overallScore * 100)}%
              </div>
              <div className="text-xs text-slate-400 font-mono">
                HybridScore = 0.45×Semantic + 0.40×SkillCoverage + 0.15×Preference
              </div>
            </div>

            {/* 3 Component Contributions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">1. Semantic TF-IDF</div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">
                  {Math.round(selectedJobForModal.explanation.semanticScore * 100)}%
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Cosine similarity of vector space document overlap.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">2. Skill Coverage</div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">
                  {Math.round(selectedJobForModal.explanation.skillCoverageScore * 100)}%
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Explicit requirement satisfaction with canonical alias normalization.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">3. Preference Fit</div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">
                  {Math.round(selectedJobForModal.explanation.preferenceScore * 100)}%
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Location, work arrangement, and target role alignment.
                </p>
              </div>
            </div>

            {/* Matched vs Missing Skills */}
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Matched Skills ({selectedJobForModal.explanation.matchedSkills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJobForModal.explanation.matchedSkills.length > 0 ? (
                    selectedJobForModal.explanation.matchedSkills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-medium">
                        ✓ {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">None explicitly matched.</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Missing / Unverified Skills ({selectedJobForModal.explanation.missingSkills.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJobForModal.explanation.missingSkills.length > 0 ? (
                    selectedJobForModal.explanation.missingSkills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 font-medium">
                        • {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">All required skills satisfied!</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-300 mb-1.5">Ranking Notes & Insights</h4>
                <ul className="space-y-1 text-slate-400">
                  {selectedJobForModal.explanation.reasoningNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-400">▸</span> {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedJobForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
