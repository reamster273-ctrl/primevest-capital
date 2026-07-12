import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import { getDbState, simulateROI, pullFromSupabase } from './db';
import { supabase } from './lib/supabase';

export default function App() {
  const getPageFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    if (['home', 'login', 'register', 'forgot', 'verify', 'dashboard', 'admin'].includes(hash)) {
      return hash;
    }
    return '';
  };

  const [currentPage, setCurrentPage] = useState<string>('home');
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [dbState, setDbState] = useState(getDbState());

  // Check login state on mount & handle initial hash routing
  useEffect(() => {
    // Perform simulated ROI return allocations upon application load
    const updatedDb = simulateROI();
    setDbState(updatedDb);

    // Pull the latest live database state from Supabase
    const syncSupabase = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          localStorage.setItem('primevest_active_user', session.user.id);
          setActiveUserId(session.user.id);
        }
        await pullFromSupabase();
        const finalDb = simulateROI();
        setDbState(finalDb);
      } catch (err) {
        console.error('Failed to pull from Supabase on mount:', err);
      }
    };
    syncSupabase();

    const savedUser = localStorage.getItem('primevest_active_user');
    let initialPage = getPageFromHash() || 'home';

    if (savedUser) {
      setActiveUserId(savedUser);
      // Auto route to dashboard if they are on home/login/register on load
      if (initialPage === 'home' || initialPage === 'login' || initialPage === 'register') {
        initialPage = 'dashboard';
      }
    } else {
      // Direct unauthorized routes back to home/login
      if (initialPage === 'dashboard' || initialPage === 'admin') {
        initialPage = 'home';
      }
    }

    setCurrentPage(initialPage);
    window.location.hash = initialPage;
  }, []);

  // Hash navigation listener
  useEffect(() => {
    const handleHashChange = () => {
      const page = getPageFromHash();
      if (!page) return;

      const savedUser = localStorage.getItem('primevest_active_user');

      // Auth protection rules
      if (['dashboard', 'admin'].includes(page) && !savedUser) {
        window.location.hash = 'login';
        setCurrentPage('login');
        return;
      }

      if (page === 'admin' && savedUser) {
        const db = getDbState();
        const user = db.users.find(u => u.id === savedUser);
        if (!user || user.role !== 'admin') {
          window.location.hash = 'dashboard';
          setCurrentPage('dashboard');
          return;
        }
      }

      setCurrentPage(page);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Periodic simulated ROI calculator loop (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedDb = simulateROI();
      setDbState(updatedDb);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthSuccess = (userId: string) => {
    localStorage.setItem('primevest_active_user', userId);
    setActiveUserId(userId);
    setDbState(getDbState());
    handleNavigate('dashboard');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Failed to sign out from Supabase Auth:', e);
    }
    localStorage.removeItem('primevest_active_user');
    setActiveUserId(null);
    handleNavigate('home');
  };

  const handleSimulateLogin = (userId: string) => {
    localStorage.setItem('primevest_active_user', userId);
    setActiveUserId(userId);
    setDbState(getDbState());
    
    const db = getDbState();
    const user = db.users.find(u => u.id === userId);
    if (user && user.role === 'admin') {
      handleNavigate('admin');
    } else {
      handleNavigate('dashboard');
    }
  };

  const handleResetDatabase = () => {
    localStorage.removeItem('primevest_db_state');
    localStorage.removeItem('primevest_active_user');
    setActiveUserId(null);
    setDbState(getDbState());
    window.location.hash = 'home';
    setCurrentPage('home');
    window.location.reload();
  };

  const handleNavigate = (page: string) => {
    window.location.hash = page;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-black min-h-screen text-gray-100 flex flex-col relative">
      
      {/* PrimeVest Premium Navigation */}
      <Header 
        currentUserId={activeUserId}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onSimulateLogin={handleSimulateLogin}
        onResetDatabase={handleResetDatabase}
      />

      {/* Main Pages Router Section */}
      <div className="flex-1 pt-12">
        {currentPage === 'home' && (
          <LandingPage 
            plans={dbState.plans}
            onNavigate={handleNavigate}
          />
        )}

        {(currentPage === 'login' || currentPage === 'register' || currentPage === 'forgot' || currentPage === 'verify') && (
          <Auth 
            initialView={currentPage as any}
            onAuthSuccess={handleAuthSuccess}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'dashboard' && activeUserId && (
          <Dashboard 
            key={activeUserId}
            userId={activeUserId}
            onLogout={handleLogout}
            onNavigateToAdmin={() => handleNavigate('admin')}
          />
        )}

        {currentPage === 'admin' && activeUserId && (
          <AdminPanel 
            key={activeUserId}
            adminId={activeUserId}
            onNavigateToUser={(uid) => {
               handleSimulateLogin(uid);
            }}
            onBackToDashboard={() => handleNavigate('dashboard')}
          />
        )}
      </div>

    </div>
  );
}
