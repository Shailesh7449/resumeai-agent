import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, ShieldCheck, Database, Key } from 'lucide-react';
import { isSupabaseConfigured } from '../../services/supabaseClient';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const envSnippet = `# Add to your local .env or production environment settings:
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"`;

  const sqlSchemaSnippet = `-- Run in Supabase SQL Editor:
-- (Full schema is saved in supabase/schema.sql)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'candidate'
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Supabase Auth & Google OAuth Setup</h2>
              <p className="text-xs text-slate-400">Production authentication configuration instructions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status banner */}
        <div className={`mt-5 p-4 rounded-xl border flex items-start gap-3 ${
          isSupabaseConfigured
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
        }`}>
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold">
              {isSupabaseConfigured
                ? 'Supabase Client Connected'
                : 'Demo Authentication Mode Active (Credentials Not Configured in Env)'}
            </div>
            <p className="text-xs mt-1 opacity-90">
              {isSupabaseConfigured
                ? 'Your application is using live Supabase authentication with session persistence.'
                : 'The application is running in fully isolated Demo Mode with full test credentials (Alex Morgan & Sarah Chen) so you can test all features right now without any blockers.'}
            </p>
          </div>
        </div>

        <div className="space-y-6 mt-6">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              Create Supabase Project
            </h3>
            <p className="text-sm text-slate-300 mt-2">
              Sign in to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-1">Supabase <ExternalLink className="w-3 h-3" /></a>, click <strong>New Project</strong>, and copy your <strong>Project URL</strong> and <strong>anon public key</strong> from <em>Project Settings → API</em>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                Configure Environment Variables
              </h3>
              <button
                onClick={() => copyToClipboard(envSnippet, 'env')}
                className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
              >
                {copiedSection === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'env' ? 'Copied!' : 'Copy Config'}
              </button>
            </div>
            <pre className="text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 mt-3 text-indigo-300 overflow-x-auto">
              {envSnippet}
            </pre>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              Google Cloud Console OAuth Configuration
            </h3>
            <ol className="text-sm text-slate-300 mt-2 space-y-1.5 list-decimal list-inside">
              <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-1">Google Cloud Console → Credentials <ExternalLink className="w-3 h-3" /></a></li>
              <li>Create an <strong>OAuth 2.0 Client ID</strong> (Application type: <em>Web application</em>).</li>
              <li>Under <strong>Authorized redirect URIs</strong>, add:
                <code className="block bg-slate-950 px-2 py-1 mt-1 rounded text-xs text-amber-300 font-mono">
                  https://&lt;your-supabase-project-id&gt;.supabase.co/auth/v1/callback
                </code>
              </li>
              <li>In your Supabase Dashboard, go to <strong>Authentication → Providers → Google</strong>, paste the <em>Client ID</em> and <em>Client Secret</em>, and toggle <strong>Enable</strong>.</li>
            </ol>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                Run Database Migrations & RLS Policies
              </h3>
              <button
                onClick={() => copyToClipboard(sqlSchemaSnippet, 'sql')}
                className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
              >
                {copiedSection === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'sql' ? 'Copied SQL' : 'Copy Sample SQL'}
              </button>
            </div>
            <p className="text-sm text-slate-300 mt-2">
              Open the <strong>SQL Editor</strong> in Supabase and execute the script in <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded">supabase/schema.sql</code> to create all tables (profiles, resumes, saved_jobs, applications) and strict Row-Level Security policies.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium text-white transition text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
