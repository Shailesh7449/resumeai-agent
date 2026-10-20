import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { CareerDashboard } from './components/dashboard/CareerDashboard';
import { ResumeView } from './components/resume/ResumeView';
import { JobDiscoveryView } from './components/jobs/JobDiscoveryView';
import { CareerAgentView } from './components/agent/CareerAgentView';
import { ApplicationTrackerView } from './components/tracker/ApplicationTrackerView';
import { MLEvaluationView } from './components/evaluation/MLEvaluationView';
import { TestSuiteView } from './components/tests/TestSuiteView';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/auth/ProfileModal';
import { SetupGuideModal } from './components/auth/SetupGuideModal';
import { CoverLetterModal } from './components/tailor/CoverLetterModal';
import { authService } from './services/authService';
import { storageService } from './services/storageService';
import { isSupabaseConfigured } from './services/supabaseClient';
import { UserProfile, ParsedResume, ApplicationRecord, JobListing } from './types';
import { ShieldAlert, Key, Sparkles } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(authService.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // User-isolated records
  const [activeResume, setActiveResume] = useState<ParsedResume | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'signup'>('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [setupGuideModalOpen, setSetupGuideModalOpen] = useState(false);
  const [tailorModalJob, setTailorModalJob] = useState<JobListing | null>(null);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = authService.subscribe((session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        // Load data strictly isolated for this user
        setActiveResume(storageService.getActiveResume(currentUser.id));
        setApplications(storageService.getApplications(currentUser.id));
        setSavedJobIds(storageService.getSavedJobs(currentUser.id));
      } else {
        setActiveResume(null);
        setApplications([]);
        setSavedJobIds([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update resume
  const handleUpdateResume = (resume: ParsedResume) => {
    if (!user) return;
    storageService.addResume(user.id, resume);
    setActiveResume(resume);
  };

  // Saved job toggle
  const handleToggleSaveJob = (jobId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const isSaved = storageService.toggleSaveJob(user.id, jobId);
    setSavedJobIds(storageService.getSavedJobs(user.id));
  };

  // Application tracker handlers
  const handleAddApplication = (app: ApplicationRecord) => {
    if (!user) return;
    storageService.addApplication(user.id, app);
    setApplications(storageService.getApplications(user.id));
  };

  const handleUpdateStatus = (appId: string, status: ApplicationRecord['status']) => {
    if (!user) return;
    storageService.updateApplicationStatus(user.id, appId, status);
    setApplications(storageService.getApplications(user.id));
  };

  const handleDeleteApplication = (appId: string) => {
    if (!user) return;
    storageService.deleteApplication(user.id, appId);
    setApplications(storageService.getApplications(user.id));
  };

  const handleOpenAuth = (tab: 'login' | 'signup' = 'login') => {
    setAuthDefaultTab(tab);
    setAuthModalOpen(true);
  };

  const handleSelectJobForMatch = (job: JobListing) => {
    setCurrentTab('jobs');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Configuration Status Notice when in Demo Mode */}
      {!isSupabaseConfigured && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-500/20 px-4 py-2 text-xs text-indigo-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Authentication Demo Mode Active:</strong> Running with pre-configured candidate accounts & local persistence. Connect your Supabase keys for live production auth.
              </span>
            </div>
            <button
              onClick={() => setSetupGuideModalOpen(true)}
              className="text-xs font-semibold text-white bg-indigo-600/60 hover:bg-indigo-600 px-3 py-1 rounded-lg border border-indigo-400/30 transition shrink-0 flex items-center gap-1.5"
            >
              <Key className="w-3 h-3" /> View OAuth Setup Guide
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        activeResume={activeResume}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenSetupGuide={() => setSetupGuideModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' && (
          <CareerDashboard
            user={user}
            activeResume={activeResume}
            savedJobIds={savedJobIds}
            applications={applications}
            onSelectTab={setCurrentTab}
            onSelectJobForMatch={handleSelectJobForMatch}
            onOpenUpload={() => setCurrentTab('resume')}
          />
        )}

        {currentTab === 'resume' && (
          <ResumeView
            userId={user?.id || 'demo-user-1'}
            activeResume={activeResume}
            onUpdateResume={handleUpdateResume}
          />
        )}

        {currentTab === 'jobs' && (
          <JobDiscoveryView
            user={user}
            activeResume={activeResume}
            savedJobIds={savedJobIds}
            onToggleSaveJob={handleToggleSaveJob}
            onOpenTailorModal={(job) => setTailorModalJob(job)}
            onAddToTracker={(job) => {
              if (!user) {
                setAuthModalOpen(true);
                return;
              }
              const newApp: ApplicationRecord = {
                id: `app-${Date.now()}`,
                userId: user.id,
                jobId: job.id,
                company: job.company,
                title: job.title,
                location: job.location,
                status: 'Applied',
                dateAdded: new Date().toISOString().split('T')[0],
                dateApplied: new Date().toISOString().split('T')[0],
                notes: `Added from Job Discovery with ${job.experienceLevel} level requirements.`,
                sourceUrl: job.sourceUrl,
                updatedAt: new Date().toISOString()
              };
              handleAddApplication(newApp);
              setCurrentTab('tracker');
            }}
          />
        )}

        {currentTab === 'agent' && (
          <CareerAgentView
            userId={user?.id || 'demo-user-1'}
            activeResume={activeResume}
            onOpenTailorModal={(jobTitle) => {
              // open tailor modal
            }}
          />
        )}

        {currentTab === 'tracker' && (
          <ApplicationTrackerView
            userId={user?.id || 'demo-user-1'}
            applications={applications}
            onAddApplication={handleAddApplication}
            onUpdateStatus={handleUpdateStatus}
            onDeleteApplication={handleDeleteApplication}
          />
        )}

        {currentTab === 'evaluation' && (
          <MLEvaluationView />
        )}

        {currentTab === 'tests' && (
          <TestSuiteView />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectTab={setCurrentTab}
        onOpenSetupGuide={() => setSetupGuideModalOpen(true)}
      />

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authDefaultTab}
        onOpenSetupGuide={() => {
          setAuthModalOpen(false);
          setSetupGuideModalOpen(true);
        }}
      />

      {user && (
        <ProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={user}
        />
      )}

      <SetupGuideModal
        isOpen={setupGuideModalOpen}
        onClose={() => setSetupGuideModalOpen(false)}
      />

      <CoverLetterModal
        isOpen={Boolean(tailorModalJob)}
        onClose={() => setTailorModalJob(null)}
        job={tailorModalJob}
        resume={activeResume}
      />
    </div>
  );
}
