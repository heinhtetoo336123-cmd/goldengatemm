import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Lock,
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
  initialUnauthorizedEmail = null,
  isGateMode = false
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
        setAuthError('သင့် Google အကောင့် Email သည် Verified မဖြစ်သေးပါ။ Verified Google အကောင့်ဖြင့်သာ ဝင်ရောက်ပါ။');
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
        department: 'လူဝင်မှုကြီးကြပ်ရေး ဦးစီးဌာန',
        station: 'မြို့နယ်ဦးစီးမှူးရုံး',
        isPreApproved: true
      };

      db.setCurrentUser(user);
      onLogin(user);
      setUnauthorizedEmail(null);
    },
    [onLogin]
  );

  // Initialize optional Google Identity Services button when signed out and VITE_GOOGLE_CLIENT_ID is configured
  useEffect(() => {
    if (currentUser || !googleClientId) return;

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
              setAuthError('Google Sign-In အချက်အလက် မရရှိပါ။ ထပ်မံကြိုးစားပါ။');
              return;
            }
            setIsSigningIn(true);
            setAuthError(null);
            try {
              // Exchange Google ID token for a cryptographic Firebase Auth session whenever Firebase is configured
              if (isFirebaseConfigured && auth) {
                const credential = GoogleAuthProvider.credential(response.credential);
                const userCred = await signInWithCredential(auth, credential);
                const email = userCred.user.email;
                if (!email) {
                  await signOut(auth).catch(() => {});
                  setAuthError('Google အကောင့်မှ Email မရရှိပါ။');
                  return;
                }
                await completeVerifiedLogin(
                  userCred.user.uid,
                  email,
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
                setAuthError('Google အကောင့် Email ဖတ်ရှု၍ မရပါ။');
              }
            } catch {
              setAuthError('Google Token စိစစ်ရာတွင် အမှားအယွင်း ရှိနေပါသည်။ Firebase Google Auth Settings ကို စစ်ဆေးပါ။');
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
  }, [currentUser, googleClientId, theme, completeVerifiedLogin]);

  const handleFirebaseGoogleSignIn = async () => {
    setAuthError(null);
    setUnauthorizedEmail(null);

    if (!isFirebaseConfigured || !auth) {
      setAuthError('Firebase Project အသစ် Configuration (VITE_FIREBASE_*) မထည့်သွင်းရသေးပါ။ အောက်ရှိ "OAuth လမ်းညွှန်" ကို ကြည့်၍ Firebase Config ထည့်သွင်းပါ။');
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
        setAuthError('Google အကောင့်မှ Email မရရှိပါ။');
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
        setAuthError('Google Sign-In ဝင်းဒိုးအား ပိတ်လိုက်ပါသည်။ ထပ်မံဝင်ရောက်နိုင်ပါသည်။');
      } else if (code === 'auth/operation-not-allowed') {
        setAuthError('Firebase Console → Authentication → Sign-in method တွင် Google Provider ကို ဖွင့်ပေးရန် လိုအပ်ပါသည်။');
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError('လက်ရှိ Hosting Domain အား Firebase Console → Authentication → Authorized domains တွင် ထည့်သွင်းပေးရပါမည်။');
      } else {
        setAuthError('Google Sign-In ဝင်ရောက်ရာတွင် အခက်အခဲရှိနေပါသည်။ အင်တာနက်နှင့် Auth Settings ကို စစ်ဆေးပါ။');
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
      setAdminStatusMsg({ type: 'success', text: `${clean} (${newEmailRole}) အား ခွင့်ပြုစာရင်းသို့ ထည့်သွင်းပြီးပါပြီ။` });
    } catch {
      setAdminStatusMsg({ type: 'error', text: `${clean} အား Firestore သို့ သိမ်းဆည်းရာတွင် အခက်အခဲရှိပါသည်။` });
    }
    setTimeout(() => setAdminStatusMsg(null), 3500);
  };

  const handleRemoveEmail = async (email: string) => {
    try {
      await db.removeAuthorizedEmailAsync(email);
      setPreApprovedList(db.getPreApprovedEmails());
      setAdminStatusMsg({ type: 'success', text: `${email} အား ခွင့်ပြုစာရင်းမှ ပယ်ဖျက်ပြီးပါပြီ။` });
    } catch {
      setAdminStatusMsg({ type: 'error', text: `${email} အား ပယ်ဖျက်ရာတွင် အခက်အခဲရှိပါသည်။` });
    }
    setTimeout(() => setAdminStatusMsg(null), 3500);
  };

  // GATE MODE: Full-screen iOS 27 Native Google Login First Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen w-full bg-[#F2F2F7] dark:bg-black text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Ambient iOS 27 Sapphire Mesh Backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-32 w-[460px] h-[460px] rounded-full bg-[#0055D4]/12 dark:bg-[#3B82F6]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -right-32 w-[420px] h-[420px] rounded-full bg-[#B5891C]/12 dark:bg-[#EAB308]/10 blur-3xl"
        />

        <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Institutional Identity Column */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left px-2">
            <div className="inline-flex items-center gap-3 mx-auto lg:mx-0">
              <div className="w-14 h-14 rounded-[18px] bg-gradient-to-br from-[#0A2E6E] to-[#0055D4] flex items-center justify-center shadow-lg shadow-blue-900/20 text-white">
                <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  ပြည်ထောင်စုသမ္မတမြန်မာနိုင်ငံတော်
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Golden Gate MM
                </h1>
              </div>
            </div>

            <div className="space-y-3 max-w-lg mx-auto lg:mx-0">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug text-balance">
                လူဝင်မှုကြီးကြပ်ရေး အရာရှိများအတွက် လုံခြုံစိတ်ချရသော လုပ်ငန်းခွင်စနစ်
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                ခွင့်ပြုချက်ရ အရာရှိ Google အကောင့်ဖြင့် စစ်ဆေးဝင်ရောက်ပြီးမှသာ ရုံးစာရေးသားခြင်း၊ ဥပဒေရှာဖွေခြင်းနှင့် Applying Zone လျှောက်လွှာများကို ကြည့်ရှုစီမံနိုင်မည် ဖြစ်ပါသည်။
              </p>
            </div>

            {/* Quiet Unboxed Feature / Security Metadata */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
              <span>Google Verified Auth</span>
              <span aria-hidden="true">·</span>
              <span>Zero-Trust Allowlist</span>
              <span aria-hidden="true">·</span>
              <span>Offline PWA Ready</span>
            </div>
          </div>

          {/* Native iOS 27 Liquid Glass Sign-In Surface */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="ios-liquid-glass border border-slate-900/10 dark:border-white/15 rounded-[28px] p-6 sm:p-8 space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    အရာရှိ အကောင့်ဝင်ရောက်ရန်
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Admin မှ ကြိုတင်ခွင့်ပြုထားသော Google အကောင့်ဖြင့် ဝင်ပါ
                  </p>
                </div>
                {onToggleTheme && (
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    aria-label="Toggle appearance"
                    className="min-h-[44px] min-w-[44px] rounded-2xl bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/15 flex items-center justify-center text-slate-700 dark:text-slate-200 ios-press cursor-pointer"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {!isFirebaseConfigured && (
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-blue-950 dark:text-blue-200 text-xs leading-relaxed">
                  Firebase Project အသစ်ချိတ်ဆက်ရန် <code className="font-mono font-semibold">VITE_FIREBASE_*</code> တန်ဖိုးများကို ထည့်သွင်းပေးရပါမည် (အသေးစိတ်ကို OAuth လမ်းညွှန်တွင် ကြည့်ပါ)။
                </div>
              )}

              {authError && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 text-amber-950 dark:text-amber-200 flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="flex-1 leading-relaxed">{authError}</p>
                </div>
              )}

              {unauthorizedEmail && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 text-rose-950 dark:text-rose-100 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-800 dark:text-rose-200">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>ဝင်ရောက်ခွင့် ကန့်သတ်ထားပါသည်</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    <strong>{unauthorizedEmail}</strong> သည် စနစ်တာဝန်ခံမှ ကြိုတင်ခွင့်ပြုထားသော အရာရှိစာရင်းတွင် မပါရှိသေးပါ။
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    {!accessRequested ? (
                      <button
                        type="button"
                        onClick={() => setAccessRequested(true)}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs ios-press cursor-pointer"
                      >
                        ခွင့်ပြုချက် တောင်းခံမည်
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ခွင့်ပြုချက် တောင်းခံမှု မှတ်တမ်းတင်ပြီးပါပြီ</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setUnauthorizedEmail(null)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      ပိတ်မည်
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {/* Primary Production Google Sign-In CTA */}
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
                    {isSigningIn ? 'Google ဖြင့် စိစစ်နေပါသည်...' : 'Google အကောင့်ဖြင့် ဝင်ရောက်မည်'}
                  </span>
                </button>

                {/* Optional Google Identity Services button when VITE_GOOGLE_CLIENT_ID is set */}
                {googleClientId && (
                  <div className="flex justify-center pt-1">
                    <div id="google-signin-btn-container" className="min-h-[44px]" />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-900/8 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Production Auth Guard</span>
                </span>
                {onOpenGoogleOAuthGuide && (
                  <button
                    type="button"
                    onClick={onOpenGoogleOAuthGuide}
                    className="text-[#0055D4] dark:text-blue-400 font-semibold hover:underline min-h-[44px] px-2 flex items-center gap-1 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>OAuth လမ်းညွှန်</span>
                  </button>
                )}
              </div>
            </div>

            {!isGateMode && (
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                ခွင့်ပြုထားသော အကောင့်ဖြင့် ဝင်ရောက်ပြီးမှသာ စနစ်ကို ဖွင့်လှစ်နိုင်ပါမည်။
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED PROFILE & ADMIN ACCESS MANAGEMENT VIEW
  return (
    <div className="space-y-6 pb-28 max-w-3xl mx-auto w-full">
      {/* Large iOS 27 Section Header */}
      <div className="px-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          အကောင့် နှင့် လုံခြုံရေး
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {currentUser.email} · {currentUser.role}
        </p>
      </div>

      {/* Officer Profile Inset Grouped Card */}
      <div className="ios-grouped-card p-5 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#0A2E6E] to-[#0055D4] text-white flex items-center justify-center font-extrabold text-xl shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {currentUser.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {currentUser.department} · {currentUser.role}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shrink-0">
            <UserCheck className="w-4 h-4" />
            <span>Verified</span>
          </span>
        </div>

        {/* Hairline Grouped Metadata Rows */}
        <div className="divide-y divide-slate-200/80 dark:divide-white/10 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10">
          <div className="flex items-center justify-between px-4 py-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400">အရာရှိ ကုတ်အမှတ်</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
              {currentUser.badgeNumber}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400">တာဝန်ကျ ရုံးစခန်း</span>
            <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[60%] text-right">
              {currentUser.station}
            </span>
          </div>
          {onToggleTheme && (
            <div className="flex items-center justify-between px-4 py-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">မျက်နှာပြင် အပြင်အဆင် (iOS 27 Theme)</span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-semibold flex items-center gap-1.5 ios-press cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-[#0055D4]" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
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
            <span>လုပ်ငန်းခွင် ပင်မသို့ သွားမည်</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-rose-700 dark:text-rose-400 font-semibold text-xs flex items-center justify-center gap-1.5 ios-press cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>အကောင့်ထွက်ရန်</span>
          </button>
        </div>
      </div>

      {/* Admin-Only Pre-Approved Management Panel */}
      {currentUser.role === 'ADMIN' && (
        <div className="ios-grouped-card p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#0055D4] dark:text-blue-400" />
                <span>ခွင့်ပြုထားသော အရာရှိ စာရင်း စီမံမှု</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                Admin Only · {preApprovedList.length} ဦး ခွင့်ပြုထားသည်
              </p>
            </div>
            {onOpenGoogleOAuthGuide && (
              <button
                type="button"
                onClick={onOpenGoogleOAuthGuide}
                className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap cursor-pointer"
              >
                OAuth လမ်းညွှန်
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
              placeholder="အရာရှိ Google Email ထည့်သွင်းပါ..."
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
                    title="ပယ်ဖျက်မည်"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 px-2">Primary Admin</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
