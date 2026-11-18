import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, getRedirectResult, signOut, type User as FirebaseUser } from 'firebase/auth';
import { ShieldCheck } from 'lucide-react';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { LetterFormatter } from './components/LetterFormatter';
import { RecordsManager } from './components/RecordsManager';
import { LegalSearch } from './components/LegalSearch';
import { AuthScreen } from './components/AuthScreen';
import { ApplyingZone } from './components/ApplyingZone';
import { PublicApplicantForm } from './components/PublicApplicantForm';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GoogleOAuthGuideModal } from './components/GoogleOAuthGuideModal';
import { User, DocumentRecord } from './types';
import { db } from './services/db';
import { auth, isFirebaseConfigured, testFirestoreConnection, formatFirebaseAuthError } from './services/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [unauthorizedGateEmail, setUnauthorizedGateEmail] = useState<string | null>(null);
  const [gateAuthError, setGateAuthError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [showOAuthGuide, setShowOAuthGuide] = useState(false);
  const [applyTokenParam, setApplyTokenParam] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => db.getTheme());

  // Sync theme to document root
  useEffect(() => {
    db.setTheme(theme);
  }, [theme]);

  // Boot: Check URL applyToken, test Firestore connection, and enforce Firebase Auth gate
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('applyToken') || searchParams.get('token');
    if (token) {
      setApplyTokenParam(token);
    }

    if (!isFirebaseConfigured || !auth) {
      db.setCurrentUser(null);
      setCurrentUser(null);
      setAuthReady(true);
      return;
    }

    testFirestoreConnection();

    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const verifyAndApplyFirebaseUser = async (firebaseUser: FirebaseUser) => {
      if (!firebaseUser.email || !firebaseUser.emailVerified) {
        if (auth) await signOut(auth).catch(() => {});
        if (!isMounted) return;
        db.setCurrentUser(null);
        setCurrentUser(null);
        setGateAuthError('Email Verified မဖြစ်သေးပါ။');
        return;
      }

      const authz = await db.checkOfficerAuthorizedAsync(firebaseUser.email);
      if (!isMounted) return;
      if (authz.authorized) {
        const verifiedUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'အရာရှိ',
          email: firebaseUser.email.toLowerCase(),
          role: authz.role,
          badgeNumber: `IMM-${firebaseUser.uid.slice(0, 6).toUpperCase()}`,
          department: 'လူဝင်မှုကြီးကြပ်ရေး ဦးစီးဌာန',
          station: 'မြို့နယ်ဦးစီးမှူးရုံး',
          isPreApproved: true
        };
        db.setCurrentUser(verifiedUser);
        setCurrentUser(verifiedUser);
        setUnauthorizedGateEmail(null);
        setGateAuthError(null);
        setDocuments(db.getDocuments());
      } else {
        if (auth) await signOut(auth).catch(() => {});
        if (!isMounted) return;
        db.setCurrentUser(null);
        setCurrentUser(null);
        setUnauthorizedGateEmail(firebaseUser.email);
      }
    };

    const initAuth = async () => {
      if (!auth) return;
      try {
        const redirectResult = await getRedirectResult(auth);
        if (!isMounted) return;
        if (redirectResult?.user) {
          await verifyAndApplyFirebaseUser(redirectResult.user);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setGateAuthError(formatFirebaseAuthError(err));
      }

      if (!isMounted || !auth) return;

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMounted) return;
        try {
          if (firebaseUser) {
            await verifyAndApplyFirebaseUser(firebaseUser);
          } else {
            db.setCurrentUser(null);
            setCurrentUser(null);
          }
        } catch (err: unknown) {
          if (isMounted) {
            setGateAuthError(formatFirebaseAuthError(err));
          }
        } finally {
          if (isMounted) setAuthReady(true);
        }
      });
    };

    initAuth();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLogin = (user: User) => {
    setGateAuthError(null);
    setUnauthorizedGateEmail(null);
    setCurrentUser(user);
    setDocuments(db.getDocuments());
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    if (auth) {
      signOut(auth).catch(() => {});
    }
    db.setCurrentUser(null);
    setCurrentUser(null);
    setGateAuthError(null);
    setUnauthorizedGateEmail(null);
    setActiveTab('dashboard');
  };

  const refreshDocuments = () => {
    setDocuments(db.getDocuments());
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const pendingDocsCount = documents.filter((d) => d.syncStatus === 'PENDING').length;

  // 1. Public Applicant Portal (accessible without officer login via ?applyToken=...)
  if (applyTokenParam) {
    return (
      <PublicApplicantForm
        token={applyTokenParam}
        onBackToApp={() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          setApplyTokenParam(null);
        }}
      />
    );
  }

  // 2. Auth resolution splash screen (prevents flashing protected workspace before auth state resolves)
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] dark:bg-black flex flex-col items-center justify-center gap-3 p-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A2E6E] to-[#0055D4] flex items-center justify-center shadow-lg text-white">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">Golden Gate MM</p>
      </div>
    );
  }

  // 3. Google Login Screen First (Mandatory Security Gate for unauthenticated users)
  if (!currentUser) {
    return (
      <>
        <AuthScreen
          currentUser={null}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onNavigateToMain={() => setActiveTab('dashboard')}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenGoogleOAuthGuide={() => setShowOAuthGuide(true)}
          initialUnauthorizedEmail={unauthorizedGateEmail}
          initialAuthError={gateAuthError}
          isGateMode={true}
        />
        <GoogleOAuthGuideModal
          isOpen={showOAuthGuide}
          onClose={() => setShowOAuthGuide(false)}
        />
      </>
    );
  }

  // 4. Authenticated Officer Workspace (iOS 27 Native Design & Theme)
  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-black text-slate-900 dark:text-slate-100 flex flex-col w-full max-w-full overflow-x-hidden">
      <Header
        user={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAuth={() => setActiveTab('auth')}
      />

      <main className="flex-1 px-4 sm:px-6 py-5 max-w-6xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <Dashboard
            user={currentUser}
            documents={documents}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAuth={() => setActiveTab('auth')}
          />
        )}

        {activeTab === 'letter' && (
          <LetterFormatter onSavedToRecords={() => refreshDocuments()} />
        )}

        {activeTab === 'apply' && <ApplyingZone currentUser={currentUser} />}

        {activeTab === 'records' && <RecordsManager />}

        {activeTab === 'legal' && <LegalSearch />}

        {activeTab === 'auth' && (
          <AuthScreen
            currentUser={currentUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onNavigateToMain={() => setActiveTab('dashboard')}
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenGoogleOAuthGuide={() => setShowOAuthGuide(true)}
          />
        )}
      </main>

      <OfflineIndicator />

      <GoogleOAuthGuideModal
        isOpen={showOAuthGuide}
        onClose={() => setShowOAuthGuide(false)}
      />

      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        pendingSyncCount={pendingDocsCount}
      />
    </div>
  );
}
