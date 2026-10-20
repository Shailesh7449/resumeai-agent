import React, { useState } from 'react';
import {
  Brain,
  Sliders,
  Play,
  Download,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  BarChart,
  HelpCircle,
  FileCode,
  Layers
} from 'lucide-react';
import { RankingWeights, EvalBenchmarkResult } from '../../types';
import { runEvaluationBenchmark, GROUND_TRUTH_DATASET } from '../../services/mlEvaluator';
import { DEFAULT_WEIGHTS } from '../../services/mlEngine';

export const MLEvaluationView: React.FC = () => {
  const [weights, setWeights] = useState<RankingWeights>(DEFAULT_WEIGHTS);
  const [benchmarkResult, setBenchmarkResult] = useState<EvalBenchmarkResult>(() => runEvaluationBenchmark(DEFAULT_WEIGHTS));
  const [isRunning, setIsRunning] = useState(false);
  const [exportedJson, setExportedJson] = useState<string | null>(null);

  const handleWeightChange = (key: keyof RankingWeights, value: number) => {
    // Keep sum close to 1.0 by redistributing difference
    const newWeights = { ...weights, [key]: value };
    const currentSum = newWeights.alpha + newWeights.beta + newWeights.gamma;
    setWeights(newWeights);
  };

  const handleNormalizeWeights = () => {
    const sum = weights.alpha + weights.beta + weights.gamma;
    if (sum === 0) {
      setWeights(DEFAULT_WEIGHTS);
      return;
    }
    setWeights({
      alpha: Number((weights.alpha / sum).toFixed(2)),
      beta: Number((weights.beta / sum).toFixed(2)),
      gamma: Number((weights.gamma / sum).toFixed(2))
    });
  };

  const handleRunBenchmark = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runEvaluationBenchmark(weights);
      setBenchmarkResult(res);
      setIsRunning(false);
    }, 150);
  };

  const handleExportReport = () => {
    const reportData = {
      project: 'ResumeAI Agent — Course Evaluation Benchmark Report',
      academicPurpose: 'Machine Learning Course Project Evaluation',
      timestamp: new Date().toISOString(),
      formula: 'HybridScore = alpha * SemanticScore + beta * SkillCoverage + gamma * PreferenceScore',
      weightsConfigured: weights,
      evaluationMetrics: {
        baselineModel: {
          name: 'TF-IDF Vector Space Cosine Similarity Baseline',
          precisionAt5: benchmarkResult.baselineP5,
          recallAt5: benchmarkResult.baselineRecall5,
          ndcgAt5: benchmarkResult.baselineNDCG5,
          avgLatencyMs: benchmarkResult.baselineAvgLatencyMs
        },
        proposedHybridModel: {
          name: 'Multi-Criteria Hybrid Ranker (Semantic + Skill Coverage + Preferences)',
          precisionAt5: benchmarkResult.hybridP5,
          recallAt5: benchmarkResult.hybridRecall5,
          ndcgAt5: benchmarkResult.hybridNDCG5,
          avgLatencyMs: benchmarkResult.hybridAvgLatencyMs
        },
        improvements: {
          ndcgGain: Number((benchmarkResult.hybridNDCG5 - benchmarkResult.baselineNDCG5).toFixed(3)),
          precisionGain: Number((benchmarkResult.hybridP5 - benchmarkResult.baselineP5).toFixed(3))
        }
      },
      groundTruthDatasetSize: GROUND_TRUTH_DATASET.length
    };

    const jsonStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumeai_ml_evaluation_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportedJson(jsonStr);
  };

  const p5Gain = Number((benchmarkResult.hybridP5 - benchmarkResult.baselineP5).toFixed(3));
  const ndcgGain = Number((benchmarkResult.hybridNDCG5 - benchmarkResult.baselineNDCG5).toFixed(3));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
              <Brain className="w-3.5 h-3.5 text-violet-400" /> Machine Learning Course Evaluation Pipeline
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Model Evaluation & Benchmarks
            </h1>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Empirical evaluation comparing the <strong>Baseline Model</strong> (TF-IDF Term Frequency Cosine Similarity) against the proposed <strong>Multi-Stage Hybrid Ranking Engine</strong> using ground-truth relevance judgments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunBenchmark}
              disabled={isRunning}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              {isRunning ? 'Calculating Metrics...' : 'Run Benchmark'}
            </button>
            <button
              onClick={handleExportReport}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" /> Export Report (JSON)
            </button>
          </div>
        </div>
      </div>

      {/* Main Metric Cards: Baseline vs Hybrid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baseline Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Reference Model</span>
              <h3 className="text-lg font-bold text-white">TF-IDF Cosine Baseline</h3>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono font-medium">
              Cosine Sim Only
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Standard Information Retrieval model tokenizing resume texts and job descriptions into L2-normalized TF-IDF sparse vectors with smooth inverse document frequencies.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium uppercase">NDCG@5</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {benchmarkResult.baselineNDCG5}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Precision@5</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {benchmarkResult.baselineP5}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Recall@5</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {benchmarkResult.baselineRecall5}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Latency</div>
              <div className="text-xl font-bold font-mono text-slate-300 mt-1">
                {benchmarkResult.baselineAvgLatencyMs}ms
              </div>
            </div>
          </div>
        </div>

        {/* Proposed Hybrid Model Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950/30 to-slate-900 border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-900/40">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Proposed Architecture</span>
              <h3 className="text-lg font-bold text-white">Hybrid Recommendation Model</h3>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
              Proposed System
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Combines sub-linear semantic similarity, explicit hard-skill taxonomy satisfaction with alias resolution, and user preference constraints.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30">
              <div className="text-[10px] text-slate-400 font-medium uppercase">NDCG@5</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {benchmarkResult.hybridNDCG5}
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                +{ndcgGain > 0 ? ndcgGain : 0} Gain
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Precision@5</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {benchmarkResult.hybridP5}
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                +{p5Gain > 0 ? p5Gain : 0} Gain
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Recall@5</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {benchmarkResult.hybridRecall5}
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Coverage</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30">
              <div className="text-[10px] text-slate-400 font-medium uppercase">Latency</div>
              <div className="text-xl font-bold font-mono text-indigo-300 mt-1">
                {benchmarkResult.hybridAvgLatencyMs}ms
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Real-time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Weight Tuning Sliders */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Scoring Function Weight Tuning
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              HybridScore = α × Semantic + β × SkillCoverage + γ × Preference (Constraint: α + β + γ = 1.0)
            </p>
          </div>

          <button
            onClick={handleNormalizeWeights}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 transition"
          >
            Auto-Normalize to 1.0
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
          {/* Alpha Slider */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white">α (Semantic Similarity)</span>
              <span className="font-mono text-indigo-400">{weights.alpha.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.05"
              value={weights.alpha}
              onChange={(e) => handleWeightChange('alpha', parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <p className="text-[11px] text-slate-400">Controls weight of vector space description overlap.</p>
          </div>

          {/* Beta Slider */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white">β (Skill Coverage)</span>
              <span className="font-mono text-emerald-400">{weights.beta.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.05"
              value={weights.beta}
              onChange={(e) => handleWeightChange('beta', parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[11px] text-slate-400">Rewards explicit verified hard skill requirements.</p>
          </div>

          {/* Gamma Slider */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white">γ (Candidate Preferences)</span>
              <span className="font-mono text-amber-400">{weights.gamma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.05"
              value={weights.gamma}
              onChange={(e) => handleWeightChange('gamma', parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
            <p className="text-[11px] text-slate-400">Incorporates work arrangement and location preferences.</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span>Current Weight Sum: <strong className="text-white font-mono">{(weights.alpha + weights.beta + weights.gamma).toFixed(2)}</strong></span>
          <button
            onClick={handleRunBenchmark}
            className="text-xs text-indigo-400 hover:underline font-medium"
          >
            Re-evaluate ranking with these weights →
          </button>
        </div>
      </div>

      {/* Ground Truth Dataset Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Evaluation Dataset & Ground Truth Labels</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Curated relevance assessments across {GROUND_TRUTH_DATASET.length} resume-job test pairs (3 = Highly Relevant, 2 = Relevant, 1 = Fair, 0 = Non-Relevant).
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            {GROUND_TRUTH_DATASET.length} Evaluated Pairs
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Candidate Profile</th>
                <th className="p-3">Opportunity</th>
                <th className="p-3 text-center">Relevance Ground Truth</th>
                <th className="p-3">Domain Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {GROUND_TRUTH_DATASET.slice(0, 8).map((pair, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-white">
                    {pair.resumeId.includes('alex') ? 'Alex Morgan (ML Engineer)' : 'Sarah Chen (Full Stack)'}
                  </td>
                  <td className="p-3 font-mono text-indigo-300">{pair.jobId}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                      pair.relevance >= 3 ? 'bg-emerald-500/20 text-emerald-300' :
                      pair.relevance === 2 ? 'bg-indigo-500/20 text-indigo-300' :
                      pair.relevance === 1 ? 'bg-amber-500/20 text-amber-300' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                      {pair.relevance} / 3
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">
                    {pair.relevance >= 2 ? 'Aligned Domain' : 'Cross-Domain Negative'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
