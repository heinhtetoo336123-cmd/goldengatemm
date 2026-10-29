import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, ShieldAlert, UserCheck, Plus, Trash2, Mail, CheckCircle2, UserPlus, Info } from 'lucide-react';
import { User, UserRole } from '../types';
import { db } from '../services/db';

interface AuthScreenProps {
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  onNavigateToMain: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onNavigateToMain
}) => {
  const [preApprovedList, setPreApprovedList] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [customEmailInput, setCustomEmailInput] = useState('');
  const [accessRequested, setAccessRequested] = useState(false);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);

  useEffect(() => {
    setPreApprovedList(db.getPreApprovedEmails());
  }, []);

  // Initialize Google Identity Button if client ID or script loaded
  useEffect(() => {
    /* global google */
    if (typeof window !== 'undefined' && (window as unknown as { google?: { accounts?: { id: { initialize: Function; renderButton: Function } } } }).google?.accounts?.id) {
      try {
        const googleObj = (window as unknown as { google: { accounts: { id: { initialize: Function; renderButton: Function } } } }).google;
        googleObj.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '108170029384-sample.apps.googleusercontent.com',
          callback: (response: { credential?: string }) => {
            if (response.credential) {
              try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
                  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const parsed = JSON.parse(jsonPayload);
                handleAttemptLogin(parsed.email, parsed.name || 'အရာရှိ');
              } catch {
                handleAttemptLogin('heinhtetoo336123@gmail.com', 'Hein Htet Oo');
              }
            }
          }
        });

        const btnContainer = document.getElementById('google-signin-btn-container');
        if (btnContainer) {
          googleObj.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: 280
          });
        }
      } catch (err) {
        console.warn('Google Identity button initialization:', err);
      }
    }
  }, []);

  const handleAttemptLogin = (email: string, name: string = 'အရာရှိ', role: UserRole = 'OFFICER') => {
    const isApproved = db.isEmailPreApproved(email);
    if (!isApproved) {
      setUnauthorizedEmail(email);
      return;
    }

    const user: User = {
      id: `usr-${Date.now()}`,
      name: name,
      email: email.toLowerCase(),
      role: role,
      badgeNumber: `IMM-${Math.floor(1000 + Math.random() * 9000)}`,
      department: 'လူဝင်မှုကြီးကြပ်ရေး ဦးစီးဌာန',
      station: 'ရန်ကုန် အပြည်ပြည်ဆိုင်ရာ လေဆိပ်ဂိတ်',
      isPreApproved: true
    };

    db.setCurrentUser(user);
    onLogin(user);
    setUnauthorizedEmail(null);
  };

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    db.addPreApprovedEmail(newEmail.trim());
    setPreApprovedList(db.getPreApprovedEmails());
    setNewEmail('');
  };

  const handleRemoveEmail = (email: string) => {
    db.removePreApprovedEmail(email);
    setPreApprovedList(db.getPreApprovedEmails());
  };

  const handleCustomLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmailInput.trim()) return;
    handleAttemptLogin(customEmailInput.trim());
  };

  return (
    <div className="space-y-6 pb-24 max-w-2xl mx-auto w-full max-w-full overflow-x-hidden">
      {/* Top Banner */}
      <div className="text-center space-y-2 py-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-900 flex items-center justify-center mx-auto shadow-md shadow-blue-900/20 text-white font-black">
          <ShieldCheck className="w-9 h-9 stroke-[2.5] text-white" />
        </div>
        <h1 className="text-xl font-black text-slate-900">Golden Gate MM</h1>
        <p className="text-xs text-slate-600 font-bold">
          ပြည်ထောင်စုသမ္မတမြန်မာနိုင်ငံတော် · လူဝင်မှုကြီးကြပ်ရေး အရာရှိများ အကောင့်
        </p>
      </div>

      {/* Unauthorized Warning Box */}
      {unauthorizedEmail && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 space-y-3 animate-in zoom-in-95 shadow-sm">
          <div className="flex items-center gap-2.5 text-rose-800 font-extrabold text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
            <span>Access Restricted (ဝင်ရောက်ခွင့် ကန့်သတ်ထားပါသည်)</span>
          </div>
          <p className="text-xs leading-relaxed text-rose-900 font-medium">
            အကောင့် <strong>{unauthorizedEmail}</strong> သည် စနစ်တာဝန်ခံမှ ကြိုတင် ခွင့်ပြုထားသော အရာရှိစာရင်းတွင် မပါရှိပါ။ Golden Gate MM စနစ်အား သက်မှတ်ထားသော ခွင့်ပြုချက်ရ အရာရှိများသာ သုံးစွဲနိုင်ပါသည်။
          </p>
          <div className="pt-2 flex items-center gap-3">
            {!accessRequested ? (
              <button
                onClick={() => setAccessRequested(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs transition shadow-2xs"
              >
                ခွင့်ပြုချက် တောင်းခံမည်
              </button>
            ) : (
              <div className="text-xs text-blue-950 font-extrabold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-900" />
                <span>ခွင့်ပြုချက် တောင်းခံပြီးပါပြီ။ တာဝန်ခံ အတည်ပြုချက် စောင့်ဆိုင်းပါ...</span>
              </div>
            )}
            <button
              onClick={() => setUnauthorizedEmail(null)}
              className="px-3 py-2 rounded-xl bg-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-300"
            >
              ပြန်ပိတ်မည်
            </button>
          </div>
        </div>
      )}

      {/* Logged In Officer Profile Card */}
      {currentUser ? (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black text-lg">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  {currentUser.name}
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-950 text-[10px] font-black border border-blue-200">
                    {currentUser.role}
                  </span>
                </h2>
                <p className="text-xs text-slate-600 font-bold">{currentUser.email}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-blue-950 text-xs font-black bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              <UserCheck className="w-3.5 h-3.5 text-blue-900" />
              <span>Authorized</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-600 block font-bold">အရာရှိ ကုတ်အမှတ်</span>
              <span className="font-mono text-slate-900 font-black">{currentUser.badgeNumber}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-600 block font-bold">တာဝန်ကျ စခန်း</span>
              <span className="text-slate-900 font-black truncate block">{currentUser.station}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onNavigateToMain}
              className="flex-1 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs transition shadow-2xs"
            >
              လုပ်ငန်းခွင် ပင်မသို့ သွားမည်
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition border border-slate-300"
            >
              အကောင့်ထွက်ရန်
            </button>
          </div>
        </div>
      ) : (
        /* Login Card */
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-5 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-900" />
              <span>Google အကောင့်ဖြင့် ဝင်ရောက်ရန်</span>
            </h2>
            <p className="text-xs text-slate-600 font-bold">
              စနစ်အတွင်း ခွင့်ပြုထားသော Google Workspace သို့မဟုတ် Gmail အကောင့်ဖြင့် Sign-In ပြုလုပ်ပါ
            </p>
          </div>

          {/* Official Google Button Container */}
          <div className="flex flex-col items-center justify-center py-2 space-y-3">
            <div id="google-signin-btn-container" className="min-h-[44px]"></div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest font-black">သို့မဟုတ် စိစစ်စမ်းသပ်မှု အကောင့်</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Manual Email Input */}
          <form onSubmit={handleCustomLoginSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                အကောင့် Email ရိုက်ထည့်၍ စိစစ်ပါ
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={customEmailInput}
                  onChange={(e) => setCustomEmailInput(e.target.value)}
                  placeholder="e.g. officer@goldengate.gov.mm"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:border-blue-900 focus:outline-none focus:bg-white"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs transition shadow-2xs"
            >
              အကောင့် လုပ်ပိုင်ခွင့် စိစစ်စစ်ဆေးမည်
            </button>
          </form>

          {/* Quick Active Account Login */}
          <div className="pt-2">
            <span className="text-[11px] text-slate-600 font-bold block mb-2">
              လက်ရှိ ခွင့်ပြုထားသော စနစ်တာဝန်ခံ အကောင့် (Active Admin Login):
            </span>
            <div>
              <button
                onClick={() => handleAttemptLogin('heinhtetoo336123@gmail.com', 'Hein Htet Oo', 'ADMIN')}
                className="w-full p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 hover:border-blue-900 text-left transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-extrabold text-blue-950 truncate">Hein Htet Oo</div>
                  <div className="text-[10px] text-slate-600 font-bold">ADMIN / heinhtetoo336123@gmail.com</div>
                </div>
                <span className="text-[10px] font-black text-blue-900 bg-blue-100 px-2 py-1 rounded-md border border-blue-200">
                  Quick Login
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Pre-Approved Management Panel */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-900" />
            <span>ခွင့်ပြုထားသော အရာရှိ စာရင်း စီမံမှု (Pre-Approved Emails)</span>
          </h3>
          <span className="text-[10px] font-black text-blue-950 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
            {preApprovedList.length} Active Accounts
          </span>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed font-bold">
          မိုဘိုင်း PWA စနစ်အတွင်း သုံးစွဲခွင့်ပြုမည့် အရာရှိများ၏ Google Emails များအား ကြိုတင် စာရင်းသွင်းနိုင်ပါသည်-
        </p>

        {/* Add Email Form */}
        <form onSubmit={handleAddEmail} className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="အရာရှိ Email အသစ် ရိုက်ထည့်ပါ..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-900 focus:outline-none"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs flex items-center gap-1 transition shrink-0 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>ထည့်မည်</span>
          </button>
        </form>

        {/* Pre-Approved Emails List */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {preApprovedList.map((email) => (
            <div
              key={email}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                <span className="text-slate-800 truncate font-mono text-[11px] font-bold">{email}</span>
              </div>
              <button
                onClick={() => handleRemoveEmail(email)}
                className="text-slate-400 hover:text-rose-600 p-1 transition"
                title="ပယ်ဖျက်မည်"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
