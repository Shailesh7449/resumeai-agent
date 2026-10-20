import React from 'react';
import { Brain, Shield, ExternalLink, Github } from 'lucide-react';
import { NavTab } from './Navbar';

interface FooterProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenSetupGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenSetupGuide }) => {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950/80 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Brain className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">ResumeAI Agent</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono">
                ML Course Project
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              AI-Powered Career Assistance and Job Recommendation System developed for Machine Learning evaluation and research. Features reproducible TF-IDF baseline and hybrid multi-parameter ranking.
            </p>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span>Original project:</span>
              <a
                href="https://github.com/Shailesh7449/ResumeAI-Course-Project"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                GitHub Repository <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <a
                href="https://resumeaicourseproject.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                Vercel App <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">Features</h4>
            <ul className="space-y-1.5">
              <li><button onClick={() => onSelectTab('dashboard')} className="hover:text-white transition">Dashboard</button></li>
              <li><button onClick={() => onSelectTab('resume')} className="hover:text-white transition">Resume Intelligence</button></li>
              <li><button onClick={() => onSelectTab('jobs')} className="hover:text-white transition">Hybrid Job Matching</button></li>
              <li><button onClick={() => onSelectTab('agent')} className="hover:text-white transition">Autonomous Career Agent</button></li>
              <li><button onClick={() => onSelectTab('tracker')} className="hover:text-white transition">Application Tracker</button></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-white uppercase text-[11px] tracking-wider">ML Architecture</h4>
            <ul className="space-y-1.5">
              <li><button onClick={() => onSelectTab('evaluation')} className="hover:text-white transition">Baseline vs Hybrid Benchmark</button></li>
              <li><button onClick={() => onSelectTab('evaluation')} className="hover:text-white transition">NDCG@5 & Precision Metrics</button></li>
              <li><button onClick={() => onSelectTab('tests')} className="hover:text-white transition">Automated Test Verification</button></li>
              <li><button onClick={onOpenSetupGuide} className="hover:text-white transition">Supabase & OAuth Guide</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 ResumeAI Agent. Built for Machine Learning Demonstration and Course Evaluation.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Isolated User Sessions & RLS Policies
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
