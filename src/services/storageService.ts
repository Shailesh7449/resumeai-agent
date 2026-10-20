import { ParsedResume, ApplicationRecord, JobListing } from '../types';
import { SAMPLE_RESUMES } from '../data/sampleResumes';

class StorageService {
  // Resumes
  public getResumes(userId: string): ParsedResume[] {
    try {
      const data = localStorage.getItem(`resumeai_resumes_${userId}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load resumes', e);
    }

    // Default seed resume for demo users so they immediately have a working profile
    if (userId === 'demo-user-1') {
      const defaultResumes = [SAMPLE_RESUMES['ml-engineer']];
      this.saveResumes(userId, defaultResumes);
      return defaultResumes;
    }
    if (userId === 'demo-user-2') {
      const defaultResumes = [SAMPLE_RESUMES['full-stack']];
      this.saveResumes(userId, defaultResumes);
      return defaultResumes;
    }
    return [];
  }

  public saveResumes(userId: string, resumes: ParsedResume[]): void {
    localStorage.setItem(`resumeai_resumes_${userId}`, JSON.stringify(resumes));
  }

  public addResume(userId: string, resume: ParsedResume): void {
    const existing = this.getResumes(userId);
    const updated = [resume, ...existing.filter(r => r.id !== resume.id)];
    this.saveResumes(userId, updated);
  }

  public getActiveResume(userId: string): ParsedResume | null {
    const list = this.getResumes(userId);
    return list.length > 0 ? list[0] : null;
  }

  // Applications
  public getApplications(userId: string): ApplicationRecord[] {
    try {
      const data = localStorage.getItem(`resumeai_applications_${userId}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load applications', e);
    }

    // Default sample applications for demo user
    if (userId === 'demo-user-1') {
      const sampleApps: ApplicationRecord[] = [
        {
          id: 'app-1',
          userId: 'demo-user-1',
          jobId: 'job-ml-101',
          company: 'Nexus AI Labs',
          title: 'Machine Learning Engineer',
          location: 'San Francisco, CA',
          status: 'Interview',
          dateAdded: '2026-10-16',
          dateApplied: '2026-10-17',
          sourceUrl: 'https://careers.nexusailabs.example/jobs/ml-101',
          notes: 'Completed technical screen. Next round is system design with team lead.',
          nextStep: 'System Design on Oct 24th',
          updatedAt: '2026-10-18T10:00:00Z'
        },
        {
          id: 'app-2',
          userId: 'demo-user-1',
          jobId: 'job-ai-107',
          company: 'Cognitive Engine Inc',
          title: 'AI Agent & LLM Applications Engineer',
          location: 'San Francisco, CA',
          status: 'Applied',
          dateAdded: '2026-10-18',
          dateApplied: '2026-10-18',
          sourceUrl: 'https://careers.cognitiveengine.example/jobs/ai-107',
          notes: 'Submitted customized cover letter emphasizing tool-calling experience.',
          nextStep: 'Awaiting recruiter response',
          updatedAt: '2026-10-18T14:30:00Z'
        },
        {
          id: 'app-3',
          userId: 'demo-user-1',
          jobId: 'job-ds-103',
          company: 'Vanguard HealthTech',
          title: 'Data Scientist — Analytics & Modeling',
          location: 'Boston, MA',
          status: 'Saved',
          dateAdded: '2026-10-19',
          sourceUrl: 'https://careers.vanguardhealth.example/jobs/ds-103',
          notes: 'Great match for predictive modeling skills. Need to review clinical paper references.',
          updatedAt: '2026-10-19T09:15:00Z'
        }
      ];
      this.saveApplications(userId, sampleApps);
      return sampleApps;
    }

    return [];
  }

  public saveApplications(userId: string, applications: ApplicationRecord[]): void {
    localStorage.setItem(`resumeai_applications_${userId}`, JSON.stringify(applications));
  }

  public addApplication(userId: string, app: ApplicationRecord): void {
    const list = this.getApplications(userId);
    const existingIndex = list.findIndex(a => a.id === app.id || (a.jobId === app.jobId && a.jobId));
    let updated: ApplicationRecord[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...updated[existingIndex], ...app, updatedAt: new Date().toISOString() };
    } else {
      updated = [app, ...list];
    }
    this.saveApplications(userId, updated);
  }

  public updateApplicationStatus(userId: string, appId: string, status: ApplicationRecord['status']): void {
    const list = this.getApplications(userId);
    const updated = list.map(a => {
      if (a.id === appId) {
        return {
          ...a,
          status,
          updatedAt: new Date().toISOString(),
          dateApplied: (status === 'Applied' && !a.dateApplied) ? new Date().toISOString().split('T')[0] : a.dateApplied
        };
      }
      return a;
    });
    this.saveApplications(userId, updated);
  }

  public deleteApplication(userId: string, appId: string): void {
    const list = this.getApplications(userId);
    const updated = list.filter(a => a.id !== appId);
    this.saveApplications(userId, updated);
  }

  // Saved Jobs
  public getSavedJobs(userId: string): string[] {
    try {
      const data = localStorage.getItem(`resumeai_saved_jobs_${userId}`);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    if (userId === 'demo-user-1') {
      return ['job-ml-101', 'job-ai-107'];
    }
    return [];
  }

  public toggleSaveJob(userId: string, jobId: string): boolean {
    const current = this.getSavedJobs(userId);
    let updated: string[];
    let isSaved: boolean;
    if (current.includes(jobId)) {
      updated = current.filter(id => id !== jobId);
      isSaved = false;
    } else {
      updated = [...current, jobId];
      isSaved = true;
    }
    localStorage.setItem(`resumeai_saved_jobs_${userId}`, JSON.stringify(updated));
    return isSaved;
  }
}

export const storageService = new StorageService();
