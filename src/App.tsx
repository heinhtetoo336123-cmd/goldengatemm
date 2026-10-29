import React, { useState, useEffect } from 'react';
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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [showOAuthGuide, setShowOAuthGuide] = useState(false);
  const [applyTokenParam, setApplyTokenParam] = useState<string | null>(null);

  // Initialize data and check URL query params on mount
  useEffect(() => {
    // Check if opening via public application token link e.g. ?applyToken=APP-2026-X89K2
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('applyToken') || searchParams.get('token');
    if (token) {
      setApplyTokenParam(token);
    }

    // Check logged in officer
    const user = db.getCurrentUser();
    if (!user) {
      // Auto assign default pre-approved officer profile for instant field preview
      const defaultUser: User = {
        id: 'usr-101',
        name: 'Hein Htet Oo',
        email: 'heinhtetoo336123@gmail.com',
        role: 'ADMIN',
        badgeNumber: 'IMM-2026',
        department: 'လူဝင်မှုကြီးကြပ်ရေး ဦးစီးဌာန',
        station: 'ရန်ကုန် အပြည်ပြည်ဆိုင်ရာ လေဆိပ်ဂိတ်',
        isPreApproved: true
      };
      db.setCurrentUser(defaultUser);
      setCurrentUser(defaultUser);
    } else {
      setCurrentUser(user);
    }

    setDocuments(db.getDocuments());
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    db.setCurrentUser(null);
    setCurrentUser(null);
  };

  const refreshDocuments = () => {
    setDocuments(db.getDocuments());
  };

  const pendingDocsCount = documents.filter(d => d.syncStatus === 'PENDING').length;

  // Render Public Applicant Portal directly if applyToken is present in URL
  if (applyTokenParam) {
    return (
      <PublicApplicantForm
        token={applyTokenParam}
        onBackToApp={() => {
          // Clear query param and return to main app view
          window.history.replaceState({}, document.title, window.location.pathname);
          setApplyTokenParam(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950 w-full max-w-full overflow-x-hidden">
      {/* Top Bar Header */}
      <Header
        user={currentUser}
        onOpenAuth={() => setActiveTab('auth')}
        onOpenGoogleOAuthGuide={() => setShowOAuthGuide(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 px-3 sm:px-4 py-4 max-w-5xl mx-auto w-full max-w-full overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <Dashboard
            user={currentUser}
            documents={documents}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAuth={() => setActiveTab('auth')}
          />
        )}

        {activeTab === 'letter' && (
          <LetterFormatter
            onSavedToRecords={() => refreshDocuments()}
          />
        )}

        {activeTab === 'apply' && (
          <ApplyingZone
            currentUser={currentUser}
          />
        )}

        {activeTab === 'records' && (
          <RecordsManager />
        )}

        {activeTab === 'legal' && (
          <LegalSearch />
        )}

        {activeTab === 'auth' && (
          <AuthScreen
            currentUser={currentUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onNavigateToMain={() => setActiveTab('dashboard')}
          />
        )}
      </main>


      {/* Offline Status & Auto Sync Banner */}
      <OfflineIndicator />

      {/* Google OAuth Setup Instructions Modal */}
      <GoogleOAuthGuideModal
        isOpen={showOAuthGuide}
        onClose={() => setShowOAuthGuide(false)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        pendingSyncCount={pendingDocsCount}
      />
    </div>
  );
}
