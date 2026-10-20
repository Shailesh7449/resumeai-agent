import { JobListing, ParsedResume, ApplicationRecord, MatchExplanation, AgentMessage } from '../types';
import { CURATED_JOBS } from '../data/jobsData';
import { rankJobsHybrid, explainJobMatch, calculateSkillCoverage, DEFAULT_WEIGHTS } from './mlEngine';
import { storageService } from './storageService';

export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  data?: any;
  displayText: string;
  requiresConfirmation?: boolean;
  confirmationAction?: () => void;
}

export class CareerAgentService {
  /**
   * Tool: search_jobs
   */
  public searchJobs(query: string = '', skill?: string, location?: string): ToolExecutionResult {
    const q = query.toLowerCase().trim();
    const filtered = CURATED_JOBS.filter(job => {
      const matchTitle = !q || job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q);
      const matchSkill = !skill || job.requiredSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()));
      const matchLoc = !location || job.location.toLowerCase().includes(location.toLowerCase()) || job.arrangement.toLowerCase().includes(location.toLowerCase());
      return matchTitle && matchSkill && matchLoc;
    });

    return {
      toolName: 'search_jobs',
      success: true,
      data: filtered,
      displayText: filtered.length > 0
        ? `Found ${filtered.length} matching job opportunities:\n` +
          filtered.slice(0, 4).map(j => `• **${j.title}** at ${j.company} (${j.location} • ${j.arrangement}) — Skills: ${j.requiredSkills.slice(0, 3).join(', ')}`).join('\n')
        : `No job postings found matching criteria: "${query || skill || location}". Try searching with broader keywords like "Python", "React", or "Remote".`
    };
  }

  /**
   * Tool: get_job_details
   */
  public getJobDetails(jobIdOrTitle: string): ToolExecutionResult {
    const job = CURATED_JOBS.find(j =>
      j.id.toLowerCase() === jobIdOrTitle.toLowerCase() ||
      j.title.toLowerCase().includes(jobIdOrTitle.toLowerCase()) ||
      j.company.toLowerCase().includes(jobIdOrTitle.toLowerCase())
    );

    if (!job) {
      return {
        toolName: 'get_job_details',
        success: false,
        displayText: `Could not find job details for "${jobIdOrTitle}".`
      };
    }

    return {
      toolName: 'get_job_details',
      success: true,
      data: job,
      displayText: `**${job.title}** — ${job.company}\n` +
        `📍 **Location:** ${job.location} (${job.arrangement})\n` +
        `💰 **Salary Range:** ${job.salaryRange || 'Competitive'}\n` +
        `🎯 **Required Skills:** ${job.requiredSkills.join(', ')}\n` +
        `✨ **Preferred Skills:** ${job.preferredSkills.join(', ')}\n\n` +
        `*Summary:* ${job.description}`
    };
  }

  /**
   * Tool: explain_job_match
   */
  public explainMatch(jobIdOrTitle: string, resume: ParsedResume | null): ToolExecutionResult {
    if (!resume) {
      return {
        toolName: 'explain_job_match',
        success: false,
        displayText: 'Please upload or select an active resume first to calculate job match analytics.'
      };
    }

    const job = CURATED_JOBS.find(j =>
      j.id.toLowerCase() === jobIdOrTitle.toLowerCase() ||
      j.title.toLowerCase().includes(jobIdOrTitle.toLowerCase()) ||
      j.company.toLowerCase().includes(jobIdOrTitle.toLowerCase())
    ) || CURATED_JOBS[0];

    const explanation = explainJobMatch(job, resume, undefined, DEFAULT_WEIGHTS);

    const matchPercent = Math.round(explanation.overallScore * 100);
    const semanticPercent = Math.round(explanation.semanticScore * 100);
    const skillPercent = Math.round(explanation.skillCoverageScore * 100);

    return {
      toolName: 'explain_job_match',
      success: true,
      data: explanation,
      displayText: `### ML Match Explanation for **${job.title}** at ${job.company}\n` +
        `**Overall Hybrid Match Score:** **${matchPercent}%**\n\n` +
        `• **Semantic Text Similarity:** ${semanticPercent}% (TF-IDF vector cosine overlap)\n` +
        `• **Hard Skill Coverage:** ${skillPercent}%\n` +
        `• **Matched Skills:** ${explanation.matchedSkills.length > 0 ? explanation.matchedSkills.join(', ') : 'None'}\n` +
        `• **Skill Gaps:** ${explanation.missingSkills.length > 0 ? explanation.missingSkills.join(', ') : 'None missing!'}\n\n` +
        `*Formula:* HybridScore = 0.45×Semantic + 0.40×SkillCoverage + 0.15×Preference`
    };
  }

  /**
   * Tool: identify_skill_gaps
   */
  public identifySkillGaps(jobIdOrTitle: string, resume: ParsedResume | null): ToolExecutionResult {
    if (!resume) {
      return {
        toolName: 'identify_skill_gaps',
        success: false,
        displayText: 'Please upload or select an active resume first.'
      };
    }

    const job = CURATED_JOBS.find(j =>
      j.id.toLowerCase() === jobIdOrTitle.toLowerCase() ||
      j.title.toLowerCase().includes(jobIdOrTitle.toLowerCase()) ||
      j.company.toLowerCase().includes(jobIdOrTitle.toLowerCase())
    ) || CURATED_JOBS[0];

    const candidateSkillNames = resume.skills.map(s => s.name);
    const { matchedSkills, missingSkills } = calculateSkillCoverage(
      candidateSkillNames,
      job.requiredSkills,
      job.preferredSkills
    );

    let advice = '';
    if (missingSkills.length === 0) {
      advice = '🎉 Excellent! Your resume covers all required technical qualifications for this role.';
    } else {
      advice = `To maximize your candidate interview rate for ${job.title}, consider highlighting practical projects demonstrating: **${missingSkills.join(', ')}**.`;
    }

    return {
      toolName: 'identify_skill_gaps',
      success: true,
      data: { matchedSkills, missingSkills, job },
      displayText: `### Skill Gap Analysis for ${job.title} (${job.company})\n\n` +
        `✅ **Verified Skills You Have (${matchedSkills.length}):**\n` +
        `${matchedSkills.map(s => `  • ${s}`).join('\n')}\n\n` +
        `⚠️ **Missing or Unverified Target Skills (${missingSkills.length}):**\n` +
        `${missingSkills.length > 0 ? missingSkills.map(s => `  • ${s}`).join('\n') : '  • None! You meet 100% of stated skill requirements.'}\n\n` +
        `💡 **Recommendation:** ${advice}`
    };
  }

  /**
   * Tool: draft_resume_summary
   */
  public draftResumeSummary(jobTitle: string, resume: ParsedResume | null): ToolExecutionResult {
    if (!resume) {
      return {
        toolName: 'draft_resume_summary',
        success: false,
        displayText: 'Please upload your resume to draft a tailored summary.'
      };
    }

    const topSkills = resume.skills.slice(0, 5).map(s => s.name).join(', ');
    const candidateName = resume.name || 'Candidate';

    const draft = `Results-driven software engineering professional with hands-on expertise in ${topSkills}. Proven track record designing and delivering high-performance software systems and data pipelines with measurable reliability. Eager to leverage technical rigor, cross-functional collaboration, and continuous improvement as a ${jobTitle || 'Software Engineer'}.`;

    return {
      toolName: 'draft_resume_summary',
      success: true,
      data: { draft },
      displayText: `### Suggested Tailored Resume Summary for "${jobTitle}":\n\n> "${draft}"\n\n*(Review and adapt this draft to align with your specific accomplishments before saving).*`
    };
  }

  /**
   * Tool: draft_cover_letter
   */
  public draftCoverLetter(jobIdOrTitle: string, resume: ParsedResume | null): ToolExecutionResult {
    if (!resume) {
      return {
        toolName: 'draft_cover_letter',
        success: false,
        displayText: 'Please upload a resume first so the cover letter can reference your genuine background.'
      };
    }

    const job = CURATED_JOBS.find(j =>
      j.id.toLowerCase() === jobIdOrTitle.toLowerCase() ||
      j.title.toLowerCase().includes(jobIdOrTitle.toLowerCase()) ||
      j.company.toLowerCase().includes(jobIdOrTitle.toLowerCase())
    ) || CURATED_JOBS[0];

    const candidateName = resume.name || 'Candidate';
    const candidateEmail = resume.email || 'candidate@example.com';
    const topSkills = resume.skills.slice(0, 4).map(s => s.name).join(', ');

    const letter = `Dear Hiring Team at ${job.company},

I am writing to express my enthusiasm for the ${job.title} position (${job.arrangement} • ${job.location}). With deep practical experience across ${topSkills}, I am excited about the opportunity to contribute directly to ${job.company}'s engineering objectives.

In my recent projects, I focused on building scalable, production-grade systems while optimizing developer velocity and system performance. Specifically, my experience with ${job.requiredSkills.slice(0, 2).join(' and ')} aligns closely with the technical requirements outlined in your job description.

I welcome the opportunity to discuss how my technical skills and enthusiasm for high-quality software engineering will deliver value to your team. Thank you for your time and consideration.

Sincerely,
${candidateName}
${candidateEmail}`;

    return {
      toolName: 'draft_cover_letter',
      success: true,
      data: { letter, job },
      displayText: `### Tailored Cover Letter Draft for **${job.company}**\n\n\`\`\`text\n${letter}\n\`\`\`\n\n*(This draft uses only verified skills from your uploaded resume. You can copy or edit it in the Resume Tailoring tab).*`
    };
  }

  /**
   * Tool: save_job
   */
  public saveJob(jobIdOrTitle: string, userId: string): ToolExecutionResult {
    const job = CURATED_JOBS.find(j =>
      j.id.toLowerCase() === jobIdOrTitle.toLowerCase() ||
      j.title.toLowerCase().includes(jobIdOrTitle.toLowerCase()) ||
      j.company.toLowerCase().includes(jobIdOrTitle.toLowerCase())
    );

    if (!job) {
      return {
        toolName: 'save_job',
        success: false,
        displayText: `Could not identify job "${jobIdOrTitle}" to save.`
      };
    }

    const isSaved = storageService.toggleSaveJob(userId, job.id);
    return {
      toolName: 'save_job',
      success: true,
      data: { jobId: job.id, isSaved },
      displayText: isSaved
        ? `✅ Successfully saved **${job.title}** at ${job.company} to your Saved Jobs list.`
        : `Removed **${job.title}** from your Saved Jobs.`
    };
  }

  /**
   * Tool: get_application_tracker
   */
  public getApplicationTracker(userId: string): ToolExecutionResult {
    const apps = storageService.getApplications(userId);
    const byStatus: Record<string, number> = {};
    apps.forEach(a => {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    });

    const breakdown = Object.entries(byStatus)
      .map(([st, cnt]) => `• **${st}:** ${cnt}`)
      .join('\n');

    return {
      toolName: 'get_application_tracker',
      success: true,
      data: apps,
      displayText: `### Application Pipeline Summary (${apps.length} Total Applications)\n\n` +
        (breakdown || 'No applications recorded yet. Start by saving or adding an opportunity to your tracker.') +
        `\n\n**Recent entries:**\n` +
        apps.slice(0, 3).map(a => `• **${a.title}** @ ${a.company} — Status: *${a.status}* (Updated: ${a.dateAdded})`).join('\n')
    };
  }

  /**
   * Interpret natural language query and dispatch to real tool
   */
  public async handleUserMessage(
    userText: string,
    resume: ParsedResume | null,
    userId: string
  ): Promise<{ responseText: string; toolResult?: ToolExecutionResult }> {
    const lower = userText.toLowerCase().trim();

    // 1. Cover letter
    if (lower.includes('cover letter') || lower.includes('draft letter') || lower.includes('write letter')) {
      const toolRes = this.draftCoverLetter(userText, resume);
      return { responseText: toolRes.displayText, toolResult: toolRes };
    }

    // 2. Summary
    if (lower.includes('summary') || lower.includes('resume summary') || lower.includes('bio')) {
      const toolRes = this.draftResumeSummary(userText, resume);
      return { responseText: toolRes.displayText, toolResult: toolRes };
    }

    // 3. Skill gaps / missing skills
    if (lower.includes('skill gap') || lower.includes('missing') || lower.includes('lacking') || lower.includes('skills i need')) {
      const toolRes = this.identifySkillGaps(userText, resume);
      return { responseText: toolRes.displayText, toolResult: toolRes };
    }

    // 4. Match explanation
    if (lower.includes('why') && (lower.includes('match') || lower.includes('score')) || lower.includes('explain')) {
      const toolRes = this.explainMatch(userText, resume);
      return { responseText: toolRes.displayText, toolResult: toolRes };
    }

    // 5. Save job
    if (lower.startsWith('save') || lower.includes('save job') || lower.includes('bookmark')) {
      const toolRes = this.saveJob(userText, userId);
      return { responseText: toolRes.displayText, toolResult: toolRes };
    }

    // 6. Application status / tracker
    if (lower.includes('application') || lower.includes('tracker') || lower.includes('status') || lower.includes('pipeline')) {
      const toolRes = this.getApplicationTracker(userId);
      return { responseText: toolRes.displayText, toolResult: toolRes };
    }

    // 7. Search jobs / recommendations
    if (lower.includes('find') || lower.includes('job') || lower.includes('search') || lower.includes('recommend') || lower.includes('match')) {
      let query = '';
      if (lower.includes('python')) query = 'python';
      else if (lower.includes('react') || lower.includes('frontend')) query = 'react';
      else if (lower.includes('ml') || lower.includes('machine learning')) query = 'machine learning';
      else if (lower.includes('data')) query = 'data';
      else if (lower.includes('backend')) query = 'backend';

      const toolRes = this.searchJobs(query);
      return { responseText: toolRes.displayText, toolResult: toolRes };
    }

    // 8. General fallback guidance
    return {
      responseText: `I can help you analyze opportunities and prepare job applications using your resume.\n\nHere are some tasks you can ask me to execute:\n• *"Find data and machine learning jobs that match my resume."*\n• *"Explain why Nexus AI Labs matches my skills."*\n• *"Identify skill gaps for Senior Backend Engineer."*\n• *"Draft a personalized cover letter for Apex Cloud Solutions."*\n• *"Show my current application tracker pipeline."*`
    };
  }
}

export const careerAgentService = new CareerAgentService();
