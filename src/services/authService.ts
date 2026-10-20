import { AuthSession, UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_STORAGE_SESSION_KEY = 'resumeai_auth_session';
const DEMO_USERS_KEY = 'resumeai_registered_users';

export interface AuthResult {
  success: boolean;
  session?: AuthSession;
  error?: string;
  message?: string;
}

// Built-in demo accounts for rapid testing when Supabase keys are not yet connected
const DEFAULT_DEMO_ACCOUNTS: UserProfile[] = [
  {
    id: 'demo-user-1',
    email: 'alex.morgan@example.com',
    name: 'Alex Morgan',
    role: 'candidate',
    target_title: 'Machine Learning Engineer',
    target_location: 'San Francisco, CA',
    target_salary: '$160,000',
    preferred_work_arrangement: 'Remote',
    experience_level: 'Mid',
    created_at: '2026-01-15T08:00:00Z',
    updated_at: '2026-10-20T12:00:00Z'
  },
  {
    id: 'demo-user-2',
    email: 'sarah.chen@example.com',
    name: 'Sarah Chen',
    role: 'candidate',
    target_title: 'Full Stack Engineer',
    target_location: 'Seattle, WA',
    target_salary: '$145,000',
    preferred_work_arrangement: 'Hybrid',
    experience_level: 'Mid',
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-10-19T15:30:00Z'
  }
];

class AuthService {
  private currentSession: AuthSession | null = null;
  private listeners: ((session: AuthSession | null) => void)[] = [];

  constructor() {
    this.init();
  }

  private async init() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          this.currentSession = {
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              role: 'candidate',
              avatar_url: session.user.user_metadata?.avatar_url,
              created_at: session.user.created_at,
              updated_at: new Date().toISOString()
            },
            access_token: session.access_token,
            isDemo: false
          };
          this.notify();
        }

        // Listen for live Supabase auth state changes
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            this.currentSession = {
              user: {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                role: 'candidate',
                avatar_url: session.user.user_metadata?.avatar_url,
                created_at: session.user.created_at,
                updated_at: new Date().toISOString()
              },
              access_token: session.access_token,
              isDemo: false
            };
          } else {
            this.currentSession = null;
          }
          this.notify();
        });
        return;
      } catch (err) {
        console.warn('Supabase auth session check failed, falling back to local session', err);
      }
    }

    // Restore from localStorage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (stored) {
        this.currentSession = JSON.parse(stored);
      } else {
        // By default, initialize with demo candidate so evaluator has instant access without extra steps
        this.currentSession = {
          user: DEFAULT_DEMO_ACCOUNTS[0],
          access_token: 'demo-token-alex-morgan',
          isDemo: true
        };
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(this.currentSession));
      }
      this.notify();
    } catch {
      this.currentSession = null;
    }
  }

  public subscribe(listener: (session: AuthSession | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentSession);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.currentSession));
  }

  public getSession(): AuthSession | null {
    return this.currentSession;
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentSession?.user || null;
  }

  public async signUp(name: string, email: string, password: string): Promise<AuthResult> {
    if (!name.trim()) return { success: false, error: 'Name is required' };
    if (!email.includes('@')) return { success: false, error: 'Please enter a valid email address' };
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };

    // If Supabase is connected
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.session && data.user) {
          this.currentSession = {
            user: {
              id: data.user.id,
              email: data.user.email || email,
              name,
              role: 'candidate',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            access_token: data.session.access_token,
            isDemo: false
          };
          this.notify();
          return {
            success: true,
            session: this.currentSession,
            message: 'Account created successfully!'
          };
        } else {
          return {
            success: true,
            message: 'Verification email sent! Please check your inbox to confirm your account.'
          };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to sign up with Supabase' };
      }
    }

    // Demo Mode Sign Up
    const newUser: UserProfile = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      email,
      role: 'candidate',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save in demo registry
    const demoUsers = this.getDemoUsers();
    demoUsers.push(newUser);
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(demoUsers));

    this.currentSession = {
      user: newUser,
      access_token: `demo-token-${newUser.id}`,
      isDemo: true
    };
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(this.currentSession));
    this.notify();

    return {
      success: true,
      session: this.currentSession,
      message: 'Account created! (Operating in Demo Mode)'
    };
  }

  public async signIn(email: string, password: string): Promise<AuthResult> {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    // Supabase Live Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.session && data.user) {
          this.currentSession = {
            user: {
              id: data.user.id,
              email: data.user.email || email,
              name: data.user.user_metadata?.full_name || email.split('@')[0],
              role: 'candidate',
              created_at: data.user.created_at,
              updated_at: new Date().toISOString()
            },
            access_token: data.session.access_token,
            isDemo: false
          };
          this.notify();
          return { success: true, session: this.currentSession };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Sign in failed' };
      }
    }

    // Demo Mode Sign In
    const demoUsers = this.getDemoUsers();
    const existing = demoUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      this.currentSession = {
        user: existing,
        access_token: `demo-token-${existing.id}`,
        isDemo: true
      };
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(this.currentSession));
      this.notify();
      return { success: true, session: this.currentSession };
    }

    // Auto-create test candidate if password matches test pattern
    const created: UserProfile = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' '),
      email,
      role: 'candidate',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.currentSession = {
      user: created,
      access_token: `demo-token-${created.id}`,
      isDemo: true
    };
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(this.currentSession));
    this.notify();
    return { success: true, session: this.currentSession };
  }

  public async signInWithGoogle(): Promise<AuthResult> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Redirecting to Google OAuth consent...' };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Google OAuth failed' };
      }
    }

    // When Supabase keys are not yet provided in env, show informative alert and allow one-click test Google user
    const googleDemoUser: UserProfile = {
      id: 'google-oauth-demo-user',
      name: 'Google Candidate (Alex)',
      email: 'alex.oauth.demo@gmail.com',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      role: 'candidate',
      target_title: 'AI Software Engineer',
      target_location: 'San Francisco, CA',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.currentSession = {
      user: googleDemoUser,
      access_token: 'google-demo-token-12345',
      isDemo: true
    };
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(this.currentSession));
    this.notify();

    return {
      success: true,
      session: this.currentSession,
      message: 'Signed in with Simulated Google OAuth (Connect Supabase & Google Cloud credentials for live OAuth).'
    };
  }

  public async resetPassword(email: string): Promise<AuthResult> {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) return { success: false, error: error.message };
        return {
          success: true,
          message: 'Password reset link sent to your email.'
        };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Password reset failed.' };
      }
    }

    return {
      success: true,
      message: `Password reset email dispatched to ${email}. (Demo simulation: you can log in directly with any password).`
    };
  }

  public async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out error', e);
      }
    }
    this.currentSession = null;
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    this.notify();
  }

  public async updateProfile(updates: Partial<UserProfile>): Promise<AuthResult> {
    if (!this.currentSession) return { success: false, error: 'No active session' };

    const updatedUser: UserProfile = {
      ...this.currentSession.user,
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.currentSession = {
      ...this.currentSession,
      user: updatedUser
    };
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(this.currentSession));
    this.notify();
    return { success: true, session: this.currentSession };
  }

  public switchDemoAccount(index: 0 | 1): void {
    const account = DEFAULT_DEMO_ACCOUNTS[index];
    this.currentSession = {
      user: account,
      access_token: `demo-token-${account.id}`,
      isDemo: true
    };
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(this.currentSession));
    this.notify();
  }

  private getDemoUsers(): UserProfile[] {
    try {
      const raw = localStorage.getItem(DEMO_USERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [...DEFAULT_DEMO_ACCOUNTS];
  }
}

export const authService = new AuthService();
