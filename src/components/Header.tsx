import React, { useState } from 'react';
import { Shield, User, LogOut, ArrowRight, Menu, X, RefreshCw, Key } from 'lucide-react';
import { getDbState } from '../db';

interface HeaderProps {
  currentUserId: string | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onSimulateLogin: (userId: string) => void;
  onResetDatabase: () => void;
}

export default function Header({ currentUserId, onNavigate, onLogout, onSimulateLogin, onResetDatabase }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSimPanel, setShowSimPanel] = useState(true);

  const db = getDbState();
  const currentUser = currentUserId ? db.users.find(u => u.id === currentUserId) : null;

  return (
    <header className="fixed top-0 inset-x-0 bg-black/90 backdrop-blur-md border-b border-zinc-900 z-40">
      
      {/* 1. DEVELOPER SIMULATION TOOLBAR BAR */}
      {showSimPanel && (
        <div className="bg-zinc-950 border-b border-yellow-500/20 px-4 py-2 text-xs text-zinc-400 flex flex-wrap items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-yellow-500 font-bold uppercase tracking-wider">Dev Simulation Desk:</span>
            <span>Test the platform's multi-role functions instantly:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {/* Quick Impersonators */}
            <button 
              onClick={() => onSimulateLogin('admin-1')}
              className="px-2 py-1 rounded bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition"
              title="Admin account: Can approve deposits, withdrawals, suspend users"
            >
              👑 Login Admin
            </button>
            <button 
              onClick={() => onSimulateLogin('user-1')}
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium hover:text-white hover:bg-zinc-800 transition"
              title="Jonathan Adebayo: Verified user with active Starter/Growth plans"
            >
              👤 Jonathan (user-1)
            </button>
            <button 
              onClick={() => onSimulateLogin('user-2')}
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium hover:text-white hover:bg-zinc-800 transition"
              title="Chidi Okafor: Pending KYC, has Starter plan"
            >
              👤 Chidi (user-2)
            </button>
            <button 
              onClick={() => onSimulateLogin('user-3')}
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium hover:text-white hover:bg-zinc-800 transition"
              title="Halima Yusuf: Unverified email, has pending ₦1,500,000 deposit"
            >
              👤 Halima (user-3)
            </button>

            <span className="text-zinc-700 mx-1">|</span>

            {/* Reset DB Button */}
            <button 
              onClick={() => {
                if (confirm("Reset the entire local storage ledger back to defaults? All your current simulated test actions will be cleared.")) {
                  onResetDatabase();
                }
              }}
              className="px-2 py-1 rounded bg-red-950/40 text-red-400 border border-red-900/20 hover:bg-red-900 hover:text-white transition flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset Database
            </button>

            {/* Close Bar Button */}
            <button 
              onClick={() => setShowSimPanel(false)}
              className="text-zinc-600 hover:text-zinc-300 ml-2"
              title="Hide panel"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. PRIMARY NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-[#D4AF37] to-[#F9E29C] rounded flex items-center justify-center text-black font-black text-base shadow-lg shadow-yellow-500/10 group-hover:brightness-110 transition">
              P
            </div>
            <span className="font-sans font-bold text-lg tracking-tight text-white group-hover:text-[#D4AF37] transition">
              PRIME<span className="text-[#D4AF37] font-extrabold">VEST</span><span className="text-zinc-500 text-xs tracking-widest font-mono uppercase ml-1">Capital</span>
            </span>
          </div>

          {/* Desktop Nav Actions */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <button onClick={() => onNavigate('home')} className="text-gray-300 hover:text-yellow-500 transition">Homepage</button>
            <button 
              onClick={() => {
                const el = document.getElementById('investment-plans');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onNavigate('home');
                  setTimeout(() => {
                    const elHome = document.getElementById('investment-plans');
                    if (elHome) elHome.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }} 
              className="text-gray-300 hover:text-yellow-500 transition"
            >
              Investment Plans
            </button>
            
            {currentUser ? (
              <>
                <button onClick={() => onNavigate('dashboard')} className="text-yellow-500 hover:text-yellow-400 transition flex items-center gap-1">
                  <User className="w-4 h-4" /> Portfolio Dashboard
                </button>
                {currentUser.role === 'admin' && (
                  <button onClick={() => onNavigate('admin')} className="text-yellow-500 hover:text-yellow-400 transition flex items-center gap-1 font-mono text-xs border border-yellow-500/30 px-2.5 py-0.5 rounded bg-yellow-950/30">
                    <Shield className="w-3.5 h-3.5" /> Compliance Desk
                  </button>
                )}
                <button 
                  onClick={onLogout}
                  className="px-4 py-2 rounded bg-zinc-900 border border-zinc-800 text-gray-300 hover:bg-zinc-800 hover:text-white transition text-xs uppercase tracking-wider flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => onNavigate('login')} className="text-gray-300 hover:text-[#D4AF37] transition">Login</button>
                <button 
                  onClick={() => onNavigate('register')}
                  className="px-5 py-2 rounded bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:brightness-110 transition text-xs uppercase tracking-wider flex items-center gap-1"
                >
                  Register Account <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </nav>

          {/* Mobile menu trigger */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. MOBILE MENU PANELS */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-t border-zinc-900 px-4 py-6 space-y-4 text-center">
          <button 
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className="block w-full py-2 text-zinc-300 hover:text-yellow-500 text-sm font-semibold"
          >
            Homepage
          </button>
          <button 
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
              setTimeout(() => {
                const el = document.getElementById('investment-plans');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 200);
            }}
            className="block w-full py-2 text-zinc-300 hover:text-yellow-500 text-sm font-semibold"
          >
            Investment Plans
          </button>

          <div className="w-12 h-px bg-zinc-900 mx-auto my-2" />

          {currentUser ? (
            <div className="space-y-3">
              <button 
                onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                className="block w-full py-2 text-yellow-500 hover:text-yellow-400 text-sm font-bold"
              >
                Portfolio Dashboard
              </button>
              {currentUser.role === 'admin' && (
                <button 
                  onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
                  className="block w-full py-2 text-yellow-500 hover:text-yellow-400 text-sm font-mono"
                >
                  Compliance Desk (Admin)
                </button>
              )}
              <button 
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full py-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs uppercase"
              >
                Sign Out Secure Session
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button 
                onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                className="block w-full py-2 text-zinc-300 hover:text-yellow-500 text-sm font-semibold"
              >
                Login
              </button>
              <button 
                onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded bg-yellow-500 text-black font-semibold text-xs uppercase tracking-wider"
              >
                Register Account
              </button>
            </div>
          )}
        </div>
      )}

    </header>
  );
}
