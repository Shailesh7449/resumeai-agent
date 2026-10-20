export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  target_title?: string;
  target_location?: string;
  target_salary?: string;
  preferred_work_arrangement?: 'Remote' | 'Hybrid' | 'On-site' | 'Any';
  experience_level?: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: UserProfile;
  access_token: string;
  expires_at?: number;
  isDemo?: boolean;
}

export interface ExtractedSkill {
  name: string;
  category: 'Languages' | 'Frameworks' | 'ML/AI' | 'Databases' | 'Cloud & DevOps' | 'Tools & Other';
  confidence: number; // 0 to 1
  isExplicit: boolean; // explicitly listed or parsed from bullets
}

export interface WorkExperience {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  highlights: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  field?: string;
  graduationYear?: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface ParsedResume {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  rawText: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: ExtractedSkill[];
  experience: WorkExperience[];
  education: EducationItem[];
  projects: ProjectItem[];
  atsScore: number; // 0 to 100
  atsStrengths: string[];
  atsImprovements: string[];
}

export type WorkArrangement = 'Remote' | 'Hybrid' | 'On-site';
export type ExperienceLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead';

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  arrangement: WorkArrangement;
  experienceLevel: ExperienceLevel;
  salaryRange?: string;
  postedDate: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  sourceUrl: string;
  companyLogoUrl?: string;
}

export interface MatchExplanation {
  jobId: string;
  overallScore: number; // 0 to 1
  semanticScore: number;
  skillCoverageScore: number;
  preferenceScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  partialSkills: string[];
  weightsUsed: {
    alpha: number; // semantic
    beta: number;  // skill coverage
    gamma: number; // preference
  };
  reasoningNotes: string[];
}

export type ApplicationStatus =
  | 'Interested'
  | 'Saved'
  | 'Preparing'
  | 'Applied'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn';

export interface ApplicationRecord {
  id: string;
  userId: string;
  jobId: string;
  company: string;
  title: string;
  location: string;
  status: ApplicationStatus;
  dateAdded: string;
  dateApplied?: string;
  sourceUrl?: string;
  notes: string;
  salaryOffered?: string;
  nextStep?: string;
  updatedAt: string;
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  toolCall?: {
    toolName: string;
    params: Record<string, any>;
    status: 'pending' | 'success' | 'failed' | 'requires_confirmation';
    result?: any;
    confirmationPrompt?: string;
  };
}

export interface RankingWeights {
  alpha: number; // Semantic weight
  beta: number;  // Skill coverage weight
  gamma: number; // Preference weight
}

export interface EvalBenchmarkResult {
  baselineP5: number;
  baselineRecall5: number;
  baselineNDCG5: number;
  baselineAvgLatencyMs: number;
  hybridP5: number;
  hybridRecall5: number;
  hybridNDCG5: number;
  hybridAvgLatencyMs: number;
  skillF1Score: number;
  sampleCount: number;
  timestamp: string;
}
