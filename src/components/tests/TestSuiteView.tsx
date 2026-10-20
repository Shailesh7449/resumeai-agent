import React, { useState, useEffect } from 'react';
import {
  TestTube2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { runAllTests, TestSuiteSummary, TestCaseResult } from '../../services/testRunner';

export const TestSuiteView: React.FC = () => {
  const [summary, setSummary] = useState<TestSuiteSummary | null>(null);
  const [running, setRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const executeTests = async () => {
    setRunning(true);
    try {
      const res = await runAllTests();
      setSummary(res);
    } catch (e) {
      console.error('Test execution failed', e);
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    executeTests();
  }, []);

  const categories = ['All', 'Resume Parsing', 'ML Matching', 'ML Evaluation', 'Career Agent', 'Application Tracker', 'Authentication & Security'];

  const filteredResults = summary?.results.filter(r =>
    selectedCategory === 'All' || r.category === selectedCategory
  ) || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
              <TestTube2 className="w-3.5 h-3.5 text-emerald-400" /> Automated Test & Verification Suite
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              System Test Results
            </h1>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Verifies resume parsing integrity, mathematical constraints of the ML hybrid ranker, NDCG evaluation benchmarks, tool calling safety, application CRUD persistence, and user-to-user data isolation.
            </p>
          </div>

          <button
            onClick={executeTests}
            disabled={running}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
          >
            {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            {running ? 'Running Tests...' : 'Re-Run All Tests'}
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Total Test Cases</div>
            <div className="text-2xl font-bold text-white mt-1">{summary.total}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Passed</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5" /> {summary.passed}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Failed</div>
            <div className={`text-2xl font-bold mt-1 ${summary.failed > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
              {summary.failed}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Pass Rate</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">
              {Math.round((summary.passed / summary.total) * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Test Results Table */}
      <div className="overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Executed Verification Specs ({filteredResults.length})</span>
          {summary && <span>Last run: {new Date(summary.timestamp).toLocaleTimeString()}</span>}
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredResults.map((test) => (
            <div
              key={test.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition text-xs"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-indigo-400 font-bold text-[11px] px-1.5 py-0.5 rounded bg-indigo-500/10">
                    {test.id}
                  </span>
                  <span className="text-white font-semibold text-sm">{test.name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {test.category}
                  </span>
                  <span>•</span>
                  <span>{test.message}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-slate-500 font-mono text-[11px]">
                  {test.durationMs}ms
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 text-xs ${
                    test.passed
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {test.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {test.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
