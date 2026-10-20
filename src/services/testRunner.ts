import { validateResumeFile, extractResumeStructure } from './resumeParser';
import { rankJobsBaseline, rankJobsHybrid, explainJobMatch, DEFAULT_WEIGHTS } from './mlEngine';
import { runEvaluationBenchmark, calculateNDCG, calculatePrecisionAtK } from './mlEvaluator';
import { careerAgentService } from './agentTools';
import { storageService } from './storageService';
import { authService } from './authService';
import { CURATED_JOBS } from '../data/jobsData';
import { SAMPLE_RESUMES } from '../data/sampleResumes';

export interface TestCaseResult {
  id: string;
  name: string;
  category: 'Resume Parsing' | 'ML Matching' | 'ML Evaluation' | 'Career Agent' | 'Application Tracker' | 'Authentication & Security';
  passed: boolean;
  message: string;
  durationMs: number;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  results: TestCaseResult[];
  timestamp: string;
}

export async function runAllTests(): Promise<TestSuiteSummary> {
  const results: TestCaseResult[] = [];

  const runTest = async (
    id: string,
    name: string,
    category: TestCaseResult['category'],
    fn: () => Promise<void> | void
  ) => {
    const t0 = performance.now();
    try {
      await fn();
      const t1 = performance.now();
      results.push({
        id,
        name,
        category,
        passed: true,
        message: 'Passed as expected',
        durationMs: Number((t1 - t0).toFixed(2))
      });
    } catch (err: any) {
      const t1 = performance.now();
      results.push({
        id,
        name,
        category,
        passed: false,
        message: err?.message || String(err),
        durationMs: Number((t1 - t0).toFixed(2))
      });
    }
  };

  // 1. Resume Parsing Tests
  await runTest('PARSE-1', 'Accepts valid PDF and DOCX file extensions', 'Resume Parsing', () => {
    const validPdf = new File(['%PDF-dummy'], 'my_resume.pdf', { type: 'application/pdf' });
    const res1 = validateResumeFile(validPdf);
    if (!res1.valid) throw new Error(`Valid PDF was rejected: ${res1.error}`);

    const validDocx = new File(['PK-dummy'], 'my_resume.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const res2 = validateResumeFile(validDocx);
    if (!res2.valid) throw new Error(`Valid DOCX was rejected: ${res2.error}`);
  });

  await runTest('PARSE-2', 'Rejects unsupported file extensions (e.g. .exe, .png)', 'Resume Parsing', () => {
    const invalidFile = new File(['malicious'], 'script.exe', { type: 'application/x-msdownload' });
    const res = validateResumeFile(invalidFile);
    if (res.valid) throw new Error('Dangerous or unsupported file extension was not rejected');
  });

  await runTest('PARSE-3', 'Rejects empty files (0 bytes)', 'Resume Parsing', () => {
    const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });
    const res = validateResumeFile(emptyFile);
    if (res.valid) throw new Error('Empty 0-byte file was not rejected');
  });

  await runTest('PARSE-4', 'Extracts skills and calculates ATS score accurately', 'Resume Parsing', () => {
    const sampleText = 'Alex Developer. Email: test@example.com Phone: 555-123-4567. Experience with Python, PyTorch, Docker, PostgreSQL, React and Git. Improved query latency by 35%.';
    const parsed = extractResumeStructure(sampleText, 'test.txt', sampleText.length, 'user-123');
    if (parsed.skills.length < 4) throw new Error(`Expected at least 4 extracted skills, got ${parsed.skills.length}`);
    if (parsed.atsScore < 60 || parsed.atsScore > 100) throw new Error(`ATS score ${parsed.atsScore} out of valid bounds`);
  });

  // 2. ML Matching Tests
  await runTest('ML-1', 'Baseline TF-IDF cosine similarity scores are bounded in [0, 1]', 'ML Matching', () => {
    const resume = SAMPLE_RESUMES['ml-engineer'];
    const ranked = rankJobsBaseline(resume, CURATED_JOBS);
    if (ranked.length !== CURATED_JOBS.length) throw new Error('Mismatch in ranked job count');
    for (const item of ranked) {
      if (item.similarity < 0 || item.similarity > 1) {
        throw new Error(`Similarity score ${item.similarity} outside [0, 1] for ${item.job.title}`);
      }
    }
  });

  await runTest('ML-2', 'Hybrid ranking honors alpha + beta + gamma = 1.0 constraint', 'ML Matching', () => {
    const resume = SAMPLE_RESUMES['ml-engineer'];
    const explanation = explainJobMatch(CURATED_JOBS[0], resume, undefined, DEFAULT_WEIGHTS);
    const weightSum = explanation.weightsUsed.alpha + explanation.weightsUsed.beta + explanation.weightsUsed.gamma;
    if (Math.abs(weightSum - 1.0) > 0.001) {
      throw new Error(`Weights do not sum to 1.0: sum=${weightSum}`);
    }
    if (explanation.overallScore < 0 || explanation.overallScore > 1) {
      throw new Error(`Hybrid score ${explanation.overallScore} outside [0, 1]`);
    }
  });

  await runTest('ML-3', 'Hybrid Ranker scores domain-matched ML job significantly higher than frontend role', 'ML Matching', () => {
    const resume = SAMPLE_RESUMES['ml-engineer'];
    const hybrid = rankJobsHybrid(resume, CURATED_JOBS);
    const mlJob = hybrid.find(h => h.job.id === 'job-ml-101');
    const feJob = hybrid.find(h => h.job.id === 'job-fe-105');
    if (!mlJob || !feJob) throw new Error('Missing test job');
    if (mlJob.explanation.overallScore <= feJob.explanation.overallScore) {
      throw new Error(`ML Engineer resume scored lower on ML job (${mlJob.explanation.overallScore}) than Frontend job (${feJob.explanation.overallScore})`);
    }
  });

  // 3. ML Evaluation Benchmark Tests
  await runTest('EVAL-1', 'Reproducible benchmark computes NDCG@5 and Precision@5', 'ML Evaluation', () => {
    const metrics = runEvaluationBenchmark();
    if (metrics.hybridNDCG5 <= 0 || metrics.hybridNDCG5 > 1.0) {
      throw new Error(`Invalid hybrid NDCG@5: ${metrics.hybridNDCG5}`);
    }
    if (metrics.hybridP5 <= 0 || metrics.hybridP5 > 1.0) {
      throw new Error(`Invalid hybrid P@5: ${metrics.hybridP5}`);
    }
    if (metrics.hybridNDCG5 < metrics.baselineNDCG5) {
      throw new Error(`Hybrid NDCG@5 (${metrics.hybridNDCG5}) was unexpectedly lower than Baseline (${metrics.baselineNDCG5})`);
    }
  });

  // 4. Career Agent Tests
  await runTest('AGENT-1', 'Agent search_jobs returns filtered results', 'Career Agent', () => {
    const res = careerAgentService.searchJobs('Nexus');
    if (!res.success || !res.data || res.data.length === 0) {
      throw new Error('Agent failed to search jobs');
    }
  });

  await runTest('AGENT-2', 'Agent identify_skill_gaps identifies missing skills honestly', 'Career Agent', () => {
    const resume = SAMPLE_RESUMES['full-stack'];
    const res = careerAgentService.identifySkillGaps('job-ml-101', resume);
    if (!res.success || !res.data.missingSkills.includes('PyTorch')) {
      throw new Error('Agent failed to detect PyTorch as missing skill for Full Stack resume on ML role');
    }
  });

  await runTest('AGENT-3', 'Agent draft_cover_letter references verified candidate skills', 'Career Agent', () => {
    const resume = SAMPLE_RESUMES['ml-engineer'];
    const res = careerAgentService.draftCoverLetter('job-ml-101', resume);
    if (!res.success || !res.data.letter.includes('Alex Morgan')) {
      throw new Error('Draft cover letter failed to include candidate credentials');
    }
  });

  // 5. Application Tracker Tests
  await runTest('TRACK-1', 'CRUD operations on user application pipeline', 'Application Tracker', () => {
    const testUserId = `test-user-${Date.now()}`;
    const newApp = {
      id: `app-test-1`,
      userId: testUserId,
      jobId: 'job-ml-101',
      company: 'Test AI Co',
      title: 'ML Intern',
      location: 'Remote',
      status: 'Interested' as const,
      dateAdded: '2026-10-20',
      notes: 'Initial bookmark',
      updatedAt: new Date().toISOString()
    };

    storageService.addApplication(testUserId, newApp);
    const loaded = storageService.getApplications(testUserId);
    if (loaded.length !== 1 || loaded[0].company !== 'Test AI Co') {
      throw new Error('Application save failed');
    }

    // Update status
    storageService.updateApplicationStatus(testUserId, 'app-test-1', 'Applied');
    const updated = storageService.getApplications(testUserId);
    if (updated[0].status !== 'Applied') {
      throw new Error('Application status update failed');
    }

    // Delete
    storageService.deleteApplication(testUserId, 'app-test-1');
    const emptyList = storageService.getApplications(testUserId);
    if (emptyList.length !== 0) {
      throw new Error('Application deletion failed');
    }
  });

  // 6. Authentication & User Isolation
  await runTest('AUTH-1', 'User-to-user data isolation: User A cannot read User B applications', 'Authentication & Security', () => {
    const userA = 'user-alpha';
    const userB = 'user-beta';

    storageService.addApplication(userA, {
      id: 'app-a',
      userId: userA,
      jobId: 'job-ml-101',
      company: 'Alpha Exclusive Corp',
      title: 'Confidential Lead',
      location: 'NY',
      status: 'Offer',
      dateAdded: '2026-10-20',
      notes: 'Private offer letter',
      updatedAt: new Date().toISOString()
    });

    const userBApps = storageService.getApplications(userB);
    const leak = userBApps.find(a => a.company === 'Alpha Exclusive Corp');
    if (leak) {
      throw new Error('Security isolation violation: User B can see User A private application records!');
    }
  });

  await runTest('AUTH-2', 'Password validation rejects weak passwords (< 6 chars)', 'Authentication & Security', async () => {
    const res = await authService.signUp('Test User', 'weak@example.com', '123');
    if (res.success) {
      throw new Error('Sign up allowed password with fewer than 6 characters');
    }
  });

  return {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results,
    timestamp: new Date().toISOString()
  };
}
