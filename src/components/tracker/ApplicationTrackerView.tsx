import React, { useState } from 'react';
import {
  Kanban,
  List,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Calendar,
  DollarSign,
  Edit3,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2
} from 'lucide-react';
import { ApplicationRecord, ApplicationStatus, JobListing } from '../../types';
import { CURATED_JOBS } from '../../data/jobsData';

interface ApplicationTrackerViewProps {
  userId: string;
  applications: ApplicationRecord[];
  onAddApplication: (app: ApplicationRecord) => void;
  onUpdateStatus: (appId: string, status: ApplicationStatus) => void;
  onDeleteApplication: (appId: string) => void;
}

const ALL_STATUSES: ApplicationStatus[] = [
  'Interested',
  'Saved',
  'Preparing',
  'Applied',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn'
];

export const ApplicationTrackerView: React.FC<ApplicationTrackerViewProps> = ({
  userId,
  applications,
  onAddApplication,
  onUpdateStatus,
  onDeleteApplication
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchFilter, setSearchFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedJobIdForAdd, setSelectedJobIdForAdd] = useState(CURATED_JOBS[0].id);
  const [customCompany, setCustomCompany] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customLocation, setCustomLocation] = useState('Remote');
  const [initialStatus, setInitialStatus] = useState<ApplicationStatus>('Applied');
  const [addNotes, setAddNotes] = useState('');

  // Editing notes state
  const [editingApp, setEditingApp] = useState<ApplicationRecord | null>(null);
  const [editNotesText, setEditNotesText] = useState('');

  // Filtered applications
  const filteredApps = applications.filter(a => {
    const q = searchFilter.toLowerCase().trim();
    return !q || a.company.toLowerCase().includes(q) || a.title.toLowerCase().includes(q) || a.notes.toLowerCase().includes(q);
  });

  // KPI Calculations
  const total = applications.length;
  const inInterview = applications.filter(a => a.status === 'Interview').length;
  const inOffer = applications.filter(a => a.status === 'Offer').length;
  const applied = applications.filter(a => a.status === 'Applied' || a.status === 'Interview' || a.status === 'Offer').length;
  const responseRate = applied > 0 ? Math.round(((inInterview + inOffer) / applied) * 100) : 0;

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const catalogJob = CURATED_JOBS.find(j => j.id === selectedJobIdForAdd);

    const newApp: ApplicationRecord = {
      id: `app-${Date.now()}`,
      userId,
      jobId: catalogJob ? catalogJob.id : `custom-${Date.now()}`,
      company: customCompany.trim() || (catalogJob ? catalogJob.company : 'Company'),
      title: customTitle.trim() || (catalogJob ? catalogJob.title : 'Software Engineer'),
      location: customLocation.trim() || (catalogJob ? catalogJob.location : 'Remote'),
      status: initialStatus,
      dateAdded: new Date().toISOString().split('T')[0],
      dateApplied: (initialStatus === 'Applied' || initialStatus === 'Interview') ? new Date().toISOString().split('T')[0] : undefined,
      notes: addNotes.trim(),
      sourceUrl: catalogJob ? catalogJob.sourceUrl : undefined,
      updatedAt: new Date().toISOString()
    };

    onAddApplication(newApp);
    setIsAddModalOpen(false);
    setCustomCompany('');
    setCustomTitle('');
    setAddNotes('');
  };

  const handleSaveNotes = () => {
    if (!editingApp) return;
    const updated = {
      ...editingApp,
      notes: editNotesText,
      updatedAt: new Date().toISOString()
    };
    onAddApplication(updated);
    setEditingApp(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Application Pipeline Tracker</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track stages, interview milestones, offers, and recruiter correspondence in your isolated candidate workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1 text-xs font-medium">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 px-2.5 rounded-lg transition flex items-center gap-1.5 ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 px-2.5 rounded-lg transition flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition"
          >
            <Plus className="w-4 h-4" /> Add Application
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Opportunities</div>
          <div className="text-2xl font-bold text-white mt-1">{total}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Active Applications</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{applied}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Interviews in Progress</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{inInterview}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Positive Response Rate</div>
          <div className="text-2xl font-bold text-violet-400 mt-1">{responseRate}%</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter pipeline by company, title, or notes..."
          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {ALL_STATUSES.map((status) => {
            const statusApps = filteredApps.filter(a => a.status === status);
            return (
              <div
                key={status}
                className="flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800 p-3 min-w-[240px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-xs font-bold text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>{status}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
                    {statusApps.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2.5 flex-1">
                  {statusApps.length > 0 ? (
                    statusApps.map((app) => (
                      <div
                        key={app.id}
                        className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-white text-xs">{app.title}</div>
                            <div className="text-slate-400 text-[11px] font-medium">{app.company}</div>
                          </div>
                          <button
                            onClick={() => onDeleteApplication(app.id)}
                            className="text-slate-500 hover:text-rose-400 transition"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {app.notes && (
                          <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 line-clamp-2">
                            "{app.notes}"
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {app.dateApplied || app.dateAdded}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingApp(app);
                                setEditNotesText(app.notes);
                              }}
                              className="text-slate-400 hover:text-indigo-300 p-1 rounded"
                              title="Edit notes"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>

                            {app.sourceUrl && (
                              <a
                                href={app.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-white p-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Status Change Selector */}
                        <select
                          value={app.status}
                          onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                          className="w-full mt-1 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500"
                        >
                          {ALL_STATUSES.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-600 text-[11px]">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-2xl bg-slate-900 border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Company & Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Date Added / Applied</th>
                <th className="p-3.5">Notes</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-white">{app.title}</div>
                    <div className="text-slate-400 text-[11px]">{app.company} • {app.location}</div>
                  </td>
                  <td className="p-3.5">
                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                      className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
                    >
                      {ALL_STATUSES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">
                    {app.dateApplied || app.dateAdded}
                  </td>
                  <td className="p-3.5 max-w-xs truncate text-slate-300">
                    {app.notes || <span className="text-slate-600">—</span>}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingApp(app);
                        setEditNotesText(app.notes);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-400"
                      title="Edit Notes"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteApplication(app.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Opportunity Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Add Job Opportunity to Pipeline</h3>
            <p className="text-xs text-slate-400 mb-4">Select from curated openings or enter a custom application.</p>

            <form onSubmit={handleCreateApplication} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select from Discovered Openings</label>
                <select
                  value={selectedJobIdForAdd}
                  onChange={(e) => {
                    setSelectedJobIdForAdd(e.target.value);
                    const j = CURATED_JOBS.find(c => c.id === e.target.value);
                    if (j) {
                      setCustomCompany(j.company);
                      setCustomTitle(j.title);
                      setCustomLocation(j.location);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  {CURATED_JOBS.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} @ {j.company} ({j.arrangement})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  placeholder="e.g. Nexus AI Labs"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Job Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Machine Learning Engineer"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Initial Status</label>
                  <select
                    value={initialStatus}
                    onChange={(e: any) => setInitialStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  >
                    {ALL_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="Remote or City"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Notes / Referral / Contact</label>
                <textarea
                  rows={2}
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  placeholder="e.g. Reached out via recruiter connection, technical interview scheduled."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20"
                >
                  Add to Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Notes Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Edit Notes for {editingApp.title} @ {editingApp.company}
            </h3>
            <textarea
              rows={4}
              value={editNotesText}
              onChange={(e) => setEditNotesText(e.target.value)}
              className="w-full mt-3 p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white resize-none"
            />
            <div className="mt-4 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setEditingApp(null)}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
