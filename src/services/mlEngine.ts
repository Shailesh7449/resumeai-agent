import { JobListing, ParsedResume, MatchExplanation, RankingWeights, UserProfile } from '../types';
import { normalizeSkill, ALIAS_MAP } from '../data/skillsDictionary';

// Standard English stopwords for ML text preprocessing
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your',
  'yours', 'yourself', 'yourselves'
]);

/**
 * Text Preprocessing Pipeline:
 * Lowercases, strips punctuation, tokenizes words, and filters stopwords.
 */
export function preprocessText(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOPWORDS.has(token));
}

/**
 * TF-IDF Model & Vectorizer
 */
export class TFIDFModel {
  private idf: Map<string, number> = new Map();
  private vocabulary: Set<string> = new Set();
  private docCount: number = 0;

  constructor(corpus: string[]) {
    this.fit(corpus);
  }

  fit(corpus: string[]): void {
    this.docCount = corpus.length;
    const docFrequencies: Map<string, number> = new Map();

    for (const doc of corpus) {
      const tokens = new Set(preprocessText(doc));
      tokens.forEach(token => {
        this.vocabulary.add(token);
        docFrequencies.set(token, (docFrequencies.get(token) || 0) + 1);
      });
    }

    // Smooth IDF formula: log((1 + N) / (1 + df)) + 1
    docFrequencies.forEach((df, term) => {
      const idfScore = Math.log((1 + this.docCount) / (1 + df)) + 1.0;
      this.idf.set(term, idfScore);
    });
  }

  transform(text: string): Map<string, number> {
    const tokens = preprocessText(text);
    const tf: Map<string, number> = new Map();

    // Term Frequency (sub-linear scaling 1 + log(tf))
    for (const t of tokens) {
      if (this.vocabulary.has(t)) {
        tf.set(t, (tf.get(t) || 0) + 1);
      }
    }

    const vector: Map<string, number> = new Map();
    let normSq = 0;

    tf.forEach((count, term) => {
      const tfVal = 1 + Math.log(count);
      const idfVal = this.idf.get(term) || 1.0;
      const tfidf = tfVal * idfVal;
      vector.set(term, tfidf);
      normSq += tfidf * tfidf;
    });

    // L2 Normalization
    const norm = Math.sqrt(normSq) || 1;
    vector.forEach((val, term) => {
      vector.set(term, val / norm);
    });

    return vector;
  }
}

/**
 * Computes Cosine Similarity between two L2-normalized sparse vectors:
 * dotProduct(v1, v2)
 */
export function cosineSimilarity(
  v1: Map<string, number>,
  v2: Map<string, number>
): number {
  let dotProduct = 0;
  // Iterate through smaller vector for speed
  const [smaller, larger] = v1.size < v2.size ? [v1, v2] : [v2, v1];

  smaller.forEach((val, term) => {
    if (larger.has(term)) {
      dotProduct += val * larger.get(term)!;
    }
  });

  return Math.max(0, Math.min(1, dotProduct));
}

/**
 * Baseline Recommender:
 * Ranks jobs purely based on TF-IDF Cosine Similarity.
 */
export function rankJobsBaseline(
  resume: ParsedResume,
  jobs: JobListing[]
): { job: JobListing; similarity: number }[] {
  const corpus = [resume.rawText, ...jobs.map(j => `${j.title} ${j.description} ${j.requiredSkills.join(' ')}`)];
  const model = new TFIDFModel(corpus);
  const resumeVector = model.transform(resume.rawText);

  return jobs.map(job => {
    const jobText = `${job.title} ${job.description} ${job.requiredSkills.join(' ')}`;
    const jobVector = model.transform(jobText);
    const similarity = cosineSimilarity(resumeVector, jobVector);
    return {
      job,
      similarity: Number(similarity.toFixed(4))
    };
  }).sort((a, b) => b.similarity - a.similarity);
}

/**
 * Proposed Hybrid Ranking Engine
 * Formula:
 * HybridScore = alpha * SemanticScore + beta * SkillCoverage + gamma * PreferenceScore
 */
export const DEFAULT_WEIGHTS: RankingWeights = {
  alpha: 0.45, // Semantic content similarity
  beta: 0.40,  // Explicit Skill coverage
  gamma: 0.15  // Preference alignment
};

export function calculateSkillCoverage(
  candidateSkills: string[],
  requiredSkills: string[],
  preferredSkills: string[] = []
): {
  coverageScore: number;
  matchedSkills: string[];
  missingSkills: string[];
} {
  // Normalize candidate skills
  const normalizedCandidate = new Set(
    candidateSkills.map(s => normalizeSkill(s) || s.trim().toLowerCase())
  );

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  // Check required skills
  requiredSkills.forEach(req => {
    const normReq = normalizeSkill(req) || req.trim().toLowerCase();
    if (normalizedCandidate.has(normReq)) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  // Check preferred skills (bonus credit)
  let preferredMatchesCount = 0;
  preferredSkills.forEach(pref => {
    const normPref = normalizeSkill(pref) || pref.trim().toLowerCase();
    if (normalizedCandidate.has(normPref)) {
      if (!matchedSkills.includes(pref)) {
        matchedSkills.push(pref);
      }
      preferredMatchesCount += 1;
    }
  });

  const totalRequired = Math.max(1, requiredSkills.length);
  // Base coverage on required skills, bonus up to +0.2 for preferred
  const requiredRatio = (matchedSkills.length - preferredMatchesCount) / totalRequired;
  const preferredBonus = preferredSkills.length > 0 ? (preferredMatchesCount / preferredSkills.length) * 0.15 : 0;

  const coverageScore = Math.max(0, Math.min(1.0, requiredRatio + preferredBonus));

  return {
    coverageScore: Number(coverageScore.toFixed(4)),
    matchedSkills,
    missingSkills
  };
}

export function calculatePreferenceScore(
  job: JobListing,
  profile?: Partial<UserProfile>
): { preferenceScore: number; reasons: string[] } {
  if (!profile) {
    return { preferenceScore: 0.70, reasons: ['Default neutral preference (no user profile set)'] };
  }

  let points = 0;
  let totalCriteria = 0;
  const reasons: string[] = [];

  // 1. Work Arrangement
  if (profile.preferred_work_arrangement && profile.preferred_work_arrangement !== 'Any') {
    totalCriteria += 1;
    if (profile.preferred_work_arrangement === job.arrangement) {
      points += 1;
      reasons.push(`Matches work arrangement (${job.arrangement})`);
    } else if (job.arrangement === 'Remote') {
      points += 0.8;
      reasons.push('Remote flexibility offers strong arrangement compatibility');
    }
  }

  // 2. Experience Level
  if (profile.experience_level) {
    totalCriteria += 1;
    if (profile.experience_level === job.experienceLevel) {
      points += 1;
      reasons.push(`Target experience level aligned (${job.experienceLevel})`);
    } else {
      const levels = ['Entry', 'Mid', 'Senior', 'Lead'];
      const diff = Math.abs(levels.indexOf(profile.experience_level) - levels.indexOf(job.experienceLevel));
      if (diff === 1) {
        points += 0.5;
        reasons.push(`Close experience tier (${job.experienceLevel})`);
      }
    }
  }

  // 3. Target Title / Role match
  if (profile.target_title) {
    totalCriteria += 1;
    const titleTokens = preprocessText(profile.target_title);
    const jobTitleTokens = preprocessText(job.title);
    const overlap = titleTokens.filter(t => jobTitleTokens.includes(t));
    if (overlap.length > 0) {
      points += 1;
      reasons.push(`Role title matches desired target "${profile.target_title}"`);
    }
  }

  if (totalCriteria === 0) {
    return { preferenceScore: 0.75, reasons: ['Standard profile baseline'] };
  }

  const preferenceScore = Number((points / totalCriteria).toFixed(4));
  return { preferenceScore, reasons };
}

/**
 * Computes hybrid match explanation for a single job & resume
 */
export function explainJobMatch(
  job: JobListing,
  resume: ParsedResume,
  profile?: Partial<UserProfile>,
  weights: RankingWeights = DEFAULT_WEIGHTS
): MatchExplanation {
  // 1. Semantic score via TF-IDF
  const corpus = [
    resume.rawText,
    `${job.title} ${job.description} ${job.requiredSkills.join(' ')}`
  ];
  const model = new TFIDFModel(corpus);
  const resumeVector = model.transform(resume.rawText);
  const jobVector = model.transform(`${job.title} ${job.description} ${job.requiredSkills.join(' ')}`);
  const semanticScore = cosineSimilarity(resumeVector, jobVector);

  // 2. Skill coverage
  const candidateSkillNames = resume.skills.map(s => s.name);
  const { coverageScore, matchedSkills, missingSkills } = calculateSkillCoverage(
    candidateSkillNames,
    job.requiredSkills,
    job.preferredSkills
  );

  // 3. Preference score
  const { preferenceScore, reasons } = calculatePreferenceScore(job, profile);

  // 4. Hybrid Formula: alpha * Semantic + beta * SkillCoverage + gamma * Preference
  const alpha = weights.alpha;
  const beta = weights.beta;
  const gamma = weights.gamma;

  const overallScore = Math.max(0, Math.min(1.0,
    alpha * semanticScore + beta * coverageScore + gamma * preferenceScore
  ));

  const reasoningNotes = [
    `Semantic content overlap: ${(semanticScore * 100).toFixed(1)}%`,
    `Technical skill coverage: ${(coverageScore * 100).toFixed(1)}% (${matchedSkills.length} matched, ${missingSkills.length} missing)`,
    ...reasons
  ];

  return {
    jobId: job.id,
    overallScore: Number(overallScore.toFixed(4)),
    semanticScore: Number(semanticScore.toFixed(4)),
    skillCoverageScore: Number(coverageScore.toFixed(4)),
    preferenceScore: Number(preferenceScore.toFixed(4)),
    matchedSkills,
    missingSkills,
    partialSkills: [],
    weightsUsed: { alpha, beta, gamma },
    reasoningNotes
  };
}

/**
 * Ranks all jobs using the Proposed Hybrid Model
 */
export function rankJobsHybrid(
  resume: ParsedResume,
  jobs: JobListing[],
  profile?: Partial<UserProfile>,
  weights: RankingWeights = DEFAULT_WEIGHTS
): { job: JobListing; explanation: MatchExplanation }[] {
  return jobs.map(job => {
    const explanation = explainJobMatch(job, resume, profile, weights);
    return {
      job,
      explanation
    };
  }).sort((a, b) => b.explanation.overallScore - a.explanation.overallScore);
}
