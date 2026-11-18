import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Plus,
  Trash2,
  Mail,
  CheckCircle2,
  UserPlus,
  AlertCircle,
  Sun,
  Moon,
  LogOut,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut } from 'firebase/auth';
import { User, UserRole } from '../types';
import { db } from '../services/db';
import { auth, isFirebaseConfigured } from '../services/firebase';

interface AuthScreenProps {
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  onNavigateToMain: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenGoogleOAuthGuide?: () => void;
  initialUnauthorizedEmail?: string | null;
  isGateMode?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onNavigateToMain,
  theme = 'light',
  onToggleTheme,
  onOpenGoogleOAuthGuide,
  initialUnauthorizedEmail = null
}) => {
  const [preApprovedList, setPreApprovedList] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newEmailRole, setNewEmailRole] = useState<UserRole>('OFFICER');
  const [accessRequested, setAccessRequested] = useState(false);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(initialUnauthorizedEmail);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [adminStatusMsg, setAdminStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const useGisFallbackOnly = !isFirebaseConfigured && Boolean(googleClientId);

  useEffect(() => {
    setUnauthorizedEmail(initialUnauthorizedEmail);
  }, [initialUnauthorizedEmail]);

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      setPreApprovedList(db.getPreApprovedEmails());
      db.fetchAuthorizedEmailsAsync().then(setPreApprovedList).catch(() => {});
    }
  }, [currentUser]);

  const completeVerifiedLogin = useCallback(
    async (uid: string, email: string, displayName: string, emailVerified: boolean) => {
      setAuthError(null);
      if (!emailVerified) {
        if (auth) await signOut(auth).catch(() => {});
        setAuthError('Email Verified မဖြစ်သေးပါ။');
        return;
      }

      const authz = await db.checkOfficerAuthorizedAsync(email);
      if (!authz.authorized) {
        if (auth) await signOut(auth).catch(() => {});
        setUnauthorizedEmail(email);
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      const user: User = {
        id: uid,
        name: displayName || 'အရာရှိ',
        email: cleanEmail,
        role: authz.role,
        badgeNumber: `IMM-${uid.slice(0, 6).toUpperCase()}`,
        department: 'လူဝင်မှုကြီးကြပ်ရေး',
        station: 'မြို့နယ်ရုံး',
        isPreApproved: true
      };

      db.setCurrentUser(user);
      onLogin(user);
      setUnauthorizedEmail(null);
    },
    [onLogin]
  );

  // Render Google Identity Services button ONLY when Firebase Auth is not configured (never render two Google buttons)
  useEffect(() => {
    if (currentUser || !useGisFallbackOnly) return;

    let attempts = 0;
    const maxAttempts = 20;

    const tryInitGoogleButton = (): boolean => {
      const win = window as unknown as {
        google?: {
          accounts?: {
            id?: {
              initialize: (config: Record<string, unknown>) => void;
              renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
            };
          };
        };
      };

      const gsi = win.google?.accounts?.id;
      const btnContainer = document.getElementById('google-signin-btn-container');
      if (!gsi || !btnContainer) return false;

      try {
        btnContainer.innerHTML = '';
        gsi.initialize({
          client_id: googleClientId,
          callback: async (response: { credential?: string }) => {
            if (!response.credential) {
              setAuthError('Google Sign-In မအောင်မြင်ပါ။');
              return;
            }
            setIsSigningIn(true);
            setAuthError(null);
            try {
              if (isFirebaseConfigured && auth) {
                const credential = GoogleAuthProvider.credential(response.credential);
                const userCred = await signInWithCredential(auth, credential);
                if (!userCred.user.email) {
                  await signOut(auth).catch(() => {});
                  setAuthError('Email မရရှိပါ။');
                  return;
                }
                await completeVerifiedLogin(
                  userCred.user.uid,
                  userCred.user.email,
                  userCred.user.displayName || 'အရာရှိ',
                  userCred.user.emailVerified
                );
                return;
              }

              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const parsed = JSON.parse(jsonPayload);
              if (parsed.email && parsed.sub) {
                await completeVerifiedLogin(
                  `gis-${parsed.sub}`,
                  parsed.email,
                  parsed.name || 'အရာရှိ',
                  Boolean(parsed.email_verified)
                );
              } else {
                setAuthError('Email မရရှိပါ။');
              }
            } catch {
              setAuthError('Sign-In အမှားရှိနေပါသည်။');
            } finally {
              setIsSigningIn(false);
            }
          }
        });

        gsi.renderButton(btnContainer, {
          theme: theme === 'dark' ? 'filled_black' : 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 300
        });
        return true;
      } catch {
        return false;
      }
    };

    if (tryInitGoogleButton()) return;

    const timer = window.setInterval(() => {
      attempts += 1;
      if (tryInitGoogleButton() || attempts >= maxAttempts) {
        window.clearInterval(timer);
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [currentUser, useGisFallbackOnly, googleClientId, theme, completeVerifiedLogin]);

  const handleFirebaseGoogleSignIn = async () => {
    setAuthError(null);
    setUnauthorizedEmail(null);

    if (!isFirebaseConfigured || !auth) {
      setAuthError('Firebase Config (VITE_FIREBASE_*) မထည့်သွင်းရသေးပါ။');
      return;
    }

    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      if (!email) {
        await signOut(auth).catch(() => {});
        setAuthError('Email မရရှိပါ။');
        return;
      }
      await completeVerifiedLogin(
        result.user.uid,
        email,
        result.user.displayName || 'အရာရှိ',
        result.user.emailVerified
      );
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code: unknown }).code)
          : '';
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-In ပိတ်လိုက်ပါသည်။');
      } else if (code === 'auth/operation-not-allowed') {
        setAuthError('Firebase တွင် Google Auth ဖွင့်ရန် လိုအပ်ပါသည်။');
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError('Domain ကို Firebase Authorized domains တွင် ထည့်ပါ။');
      } else {
        setAuthError('Sign-In မအောင်မြင်ပါ။');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) return;
    try {
      await db.addAuthorizedEmailAsync(clean, newEmailRole);
      setPreApprovedList(db.getPreApprovedEmails());
      setNewEmail('');
      setAdminStatusMsg({ type: 'success', text: `${clean} ထည့်သွင်းပြီး` });
    } catch {
      setAdminStatusMsg({ type: 'error', text: `${clean} သိမ်းဆည်းမရပါ` });
    }
    setTimeout(() => setAdminStatusMsg(null), 3000);
  };

  const handleRemoveEmail = async (email: string) => {
    try {
      await db.removeAuthorizedEmailAsync(email);
      setPreApprovedList(db.getPreApprovedEmails());
      setAdminStatusMsg({ type: 'success', text: `${email} ပယ်ဖျက်ပြီး` });
    } catch {
      setAdminStatusMsg({ type: 'error', text: `${email} ပယ်ဖျက်မရပါ` });
    }
    setTimeout(() => setAdminStatusMsg(null), 3000);
  };

  // GATE MODE: Ultra-Minimal Full-Screen iOS 27 Google Login
  if (!currentUser) {
    return (
      <div className="min-h-screen w-full bg-[#F2F2F7] dark:bg-black text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-32 w-[420px] h-[420px] rounded-full bg-[#0055D4]/12 dark:bg-[#3B82F6]/15 blur-3xl"
        />

        <div className="relative z-10 w-full max-w-sm mx-auto">
          <div className="ios-liquid-glass border border-slate-900/10 dark:border-white/15 rounded-[28px] p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#0A2E6E] to-[#0055D4] flex items-center justify-center shadow-md shadow-blue-900/20 text-white shrink-0">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                    Golden Gate MM
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    အရာရှိ အကောင့်ဝင်ရန်
                  </p>
                </div>
              </div>
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  aria-label="Toggle appearance"
                  className="min-h-[44px] min-w-[44px] rounded-2xl bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/15 flex items-center justify-center text-slate-700 dark:text-slate-200 ios-press cursor-pointer shrink-0"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}
            </div>

            {authError && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 text-amber-950 dark:text-amber-200 flex items-center gap-2 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="flex-1">{authError}</p>
              </div>
            )}

            {unauthorizedEmail && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 text-rose-950 dark:text-rose-100 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-200">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span className="truncate">{unauthorizedEmail} ခွင့်ပြုချက်မရှိပါ</span>
                </div>
                <div className="flex items-center gap-2">
                  {!accessRequested ? (
                    <button
                      type="button"
                      onClick={() => setAccessRequested(true)}
                      className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs ios-press cursor-pointer"
                    >
                      ခွင့်ပြုချက် တောင်းမည်
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>တောင်းခံပြီး</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setUnauthorizedEmail(null)}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                  >
                    ပိတ်မည်
                  </button>
                </div>
              </div>
            )}

            {/* Strictly ONE Google Sign-In Control */}
            {useGisFallbackOnly ? (
              <div className="flex justify-center">
                <div id="google-signin-btn-container" className="min-h-[44px]" />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleFirebaseGoogleSignIn}
                disabled={isSigningIn}
                className="w-full min-h-[48px] py-3 px-5 rounded-2xl bg-[#0055D4] hover:bg-[#0A46B8] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-blue-900/20 disabled:opacity-60 ios-press cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
                  />
                </svg>
                <span className="whitespace-nowrap">
                  {isSigningIn ? 'စိစစ်နေပါသည်...' : 'Continue with Google'}
                </span>
              </button>
            )}

            {onOpenGoogleOAuthGuide && (
              <div className="pt-3 border-t border-slate-900/8 dark:border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={onOpenGoogleOAuthGuide}
                  className="text-[#0055D4] dark:text-blue-400 text-xs font-semibold hover:underline min-h-[40px] px-2 flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Setup</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED PROFILE & ADMIN ACCESS MANAGEMENT VIEW
  return (
    <div className="space-y-6 pb-28 max-w-3xl mx-auto w-full">
      <div className="px-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          အကောင့်
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {currentUser.email} · {currentUser.role}
        </p>
      </div>

      <div className="ios-grouped-card p-5 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0A2E6E] to-[#0055D4] text-white flex items-center justify-center font-extrabold text-lg shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {currentUser.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {currentUser.role} · {currentUser.badgeNumber}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shrink-0">
            <UserCheck className="w-4 h-4" />
            <span>Verified</span>
          </span>
        </div>

        <div className="divide-y divide-slate-200/80 dark:divide-white/10 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10">
          <div className="flex items-center justify-between px-4 py-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400">ရုံးစခန်း</span>
            <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[60%] text-right">
              {currentUser.station}
            </span>
          </div>
          {onToggleTheme && (
            <div className="flex items-center justify-between px-4 py-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Theme</span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-semibold flex items-center gap-1.5 ios-press cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#0055D4]" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            type="button"
            onClick={onNavigateToMain}
            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-2xl bg-[#0055D4] hover:bg-[#0A46B8] text-white font-semibold text-xs flex items-center justify-center gap-1.5 ios-press cursor-pointer"
          >
            <span>ပင်မစာမျက်နှာ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-rose-700 dark:text-rose-400 font-semibold text-xs flex items-center justify-center gap-1.5 ios-press cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>ထွက်မည်</span>
          </button>
        </div>
      </div>

      {currentUser.role === 'ADMIN' && (
        <div className="ios-grouped-card p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 tabular-nums">
              <UserPlus className="w-4 h-4 text-[#0055D4] dark:text-blue-400" />
              <span>ခွင့်ပြုစာရင်း ({preApprovedList.length})</span>
            </h3>
            {onOpenGoogleOAuthGuide && (
              <button
                type="button"
                onClick={onOpenGoogleOAuthGuide}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap cursor-pointer"
              >
                Setup
              </button>
            )}
          </div>

          {adminStatusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                adminStatusMsg.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              }`}
            >
              {adminStatusMsg.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{adminStatusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleAddEmail} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Google Email..."
              className="flex-1 min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-[#0055D4] focus:outline-none"
              required
            />
            <select
              value={newEmailRole}
              onChange={(e) => setNewEmailRole(e.target.value as UserRole)}
              className="min-h-[44px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:border-[#0055D4] focus:outline-none"
            >
              <option value="OFFICER">OFFICER</option>
              <option value="SUPERVISOR">SUPERVISOR</option>
              <option value="INSPECTOR">INSPECTOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0055D4] hover:bg-[#0A46B8] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shrink-0 ios-press cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ထည့်မည်</span>
            </button>
          </form>

          <div className="divide-y divide-slate-200/70 dark:divide-white/10 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 max-h-56 overflow-y-auto">
            {preApprovedList.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between px-3.5 py-2.5 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-[#0055D4] dark:text-blue-400 shrink-0" />
                  <span className="text-slate-800 dark:text-slate-200 truncate font-mono text-[11px]">
                    {email}
                  </span>
                </div>
                {email.toLowerCase() !== 'heinhtetoo336123@gmail.com' ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(email)}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="ဖျက်မည်"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 px-2">Admin</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
