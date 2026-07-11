import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Shield, Wallet, ArrowDownCircle, ArrowUpCircle, 
  Clock, Share2, Copy, Check, Info, Settings, AlertCircle, 
  Bell, ChevronRight, User, Key, RefreshCw, Calendar, Eye
} from 'lucide-react';
import { User as UserType, Transaction, Investment, Notification, InvestmentPlan } from '../types';
import { 
  getDbState, requestDeposit, requestWithdrawal, investInPlan, 
  forceSimulatePayout, submitKyc, updateProfile, saveDbState 
} from '../db';
import Footer from './Footer';
import TransactionHistory from './TransactionHistory';

interface DashboardProps {
  userId: string;
  onLogout: () => void;
  onNavigateToAdmin: () => void;
}

export default function Dashboard({ userId, onLogout, onNavigateToAdmin }: DashboardProps) {
  // Database local states
  const [db, setDb] = useState(getDbState());
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  
  // UI views: 'overview' | 'wallet' | 'investments' | 'referrals' | 'settings' | 'notifications'
  const [activeTab, setActiveTab] = useState<'overview' | 'wallet' | 'investments' | 'referrals' | 'settings' | 'notifications'>('overview');

  // Wallet form inputs
  const [depositAmount, setDepositAmount] = useState('');
  const [depositProof, setDepositProof] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('bank');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [receiptFile, setReceiptFile] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setWalletError('File size must be less than 5MB.');
      return;
    }

    setUploadingFile(true);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptFile(reader.result as string);
      setReceiptFileName(file.name);
      setWalletError('');
      setUploadingFile(false);
    };
    reader.onerror = () => {
      setWalletError('Error reading file. Please try again.');
      setUploadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  // Investment select plan
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [customEliteAmount, setCustomEliteAmount] = useState('');
  const [networkAllocation, setNetworkAllocation] = useState(2000000);
  const [acceptedRisk, setAcceptedRisk] = useState(false);

  // Referral customize code
  const [newReferralCode, setNewReferralCode] = useState('');
  
  // Notification states
  const [unreadCount, setUnreadCount] = useState(0);

  // General messages
  const [walletError, setWalletError] = useState('');
  const [walletSuccess, setWalletSuccess] = useState('');
  const [investError, setInvestError] = useState('');
  const [investSuccess, setInvestSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Profile forms
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePassword, setProfilePassword] = useState('');

  // User withdrawal payout settings states
  const [withdrawalBankName, setWithdrawalBankName] = useState('');
  const [withdrawalAccountName, setWithdrawalAccountName] = useState('');
  const [withdrawalAccountNumber, setWithdrawalAccountNumber] = useState('');
  const [bankSuccess, setBankSuccess] = useState('');
  const [bankError, setBankError] = useState('');

  // Sync state with database
  useEffect(() => {
    const currentDb = getDbState();
    setDb(currentDb);
    const user = currentDb.users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
      setNewReferralCode(user.referralCode);
      setWithdrawalBankName(user.withdrawalBankName || '');
      setWithdrawalAccountName(user.withdrawalAccountName || '');
      setWithdrawalAccountNumber(user.withdrawalAccountNumber || '');
    }
    
    // Count unread notifications
    const unread = currentDb.notifications.filter(n => (n.userId === userId || n.userId === 'all') && !n.read).length;
    setUnreadCount(unread);
  }, [userId, activeTab]);

  const refreshState = () => {
    const currentDb = getDbState();
    setDb(currentDb);
    const user = currentDb.users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
    const unread = currentDb.notifications.filter(n => (n.userId === userId || n.userId === 'all') && !n.read).length;
    setUnreadCount(unread);
  };

  const navigateToSection = (tab: 'wallet', subSection: 'deposit' | 'withdrawal') => {
    setActiveTab(tab);
    setTimeout(() => {
      const el = document.getElementById(subSection === 'deposit' ? 'deposit-section' : 'withdrawal-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const inputEl = el.querySelector('input');
        if (inputEl) {
          (inputEl as HTMLInputElement).focus();
        }
      }
    }, 100);
  };

  if (!currentUser) return <div className="text-white p-12 text-center">Loading User Profile...</div>;

  // Wallet Handlers
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWalletError('');
    setWalletSuccess('');

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setWalletError('Please enter a valid deposit amount.');
      return;
    }

    if (amount < 20000) {
      setWalletError('Minimum platform deposit is ₦20,000.');
      return;
    }

    if (!depositProof.trim()) {
      setWalletError('Payment proof explanation or reference ID is required.');
      return;
    }

    const updatedDb = requestDeposit(userId, amount, depositProof, receiptFile, receiptFileName);
    setDb(updatedDb);
    setWalletSuccess(`Your deposit request of ₦${amount.toLocaleString()} was successfully queued. Standard administration verification takes 10 to 60 minutes.`);
    setDepositAmount('');
    setDepositProof('');
    setReceiptFile('');
    setReceiptFileName('');
    refreshState();
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWalletError('');
    setWalletSuccess('');

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWalletError('Please enter a valid withdrawal amount.');
      return;
    }

    if (amount < 10000) {
      setWalletError('Minimum withdrawal amount is ₦10,000.');
      return;
    }

    if (currentUser.walletBalance < amount) {
      setWalletError(`Insufficient wallet balance. Your available balance is ₦${currentUser.walletBalance.toLocaleString()}`);
      return;
    }

    if (!withdrawDetails.trim()) {
      setWalletError('Please provide your payout details (Bank name, account number, or USDT address).');
      return;
    }

    const result = requestWithdrawal(userId, amount);
    if (result.success) {
      setDb(result.state);
      setWalletSuccess(result.message);
      setWithdrawAmount('');
      setWithdrawDetails('');
    } else {
      setWalletError(result.message);
    }
    refreshState();
  };

  // Investment Handlers
  const handleInvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInvestError('');
    setInvestSuccess('');

    if (!selectedPlanId) {
      setInvestError('Please choose an active investment plan.');
      return;
    }

    if (!acceptedRisk) {
      setInvestError('Forex trading involves substantial risk. You must read and check the Risk Disclosure Agreement box before authorizing your capital allocation.');
      return;
    }

    const plan = db.plans.find(p => p.id === selectedPlanId);
    if (!plan) return;

    let customAmount: number | undefined = undefined;
    if (plan.type === 'elite') {
      customAmount = parseFloat(customEliteAmount);
      if (isNaN(customAmount)) {
        setInvestError('Please enter a valid amount to commit.');
        return;
      }
    }

    const result = investInPlan(userId, selectedPlanId, customAmount);
    if (result.success) {
      setDb(result.state);
      setInvestSuccess(result.message);
      setSelectedPlanId('');
      setCustomEliteAmount('');
    } else {
      setInvestError(result.message);
    }
    refreshState();
  };

  // Simulate returns (interactive testing tool)
  const handleForceSimulateReturn = (investmentId: string) => {
    const updatedDb = forceSimulatePayout(investmentId);
    setDb(updatedDb);
    refreshState();
    alert("Simulation complete! We successfully fast-forwarded 24 hours of Forex trading time. Payout returns have been credited to your wallet balance.");
  };

  // Customize referral code
  const handleCustomizeReferral = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    const code = newReferralCode.trim().toUpperCase();
    if (code.length < 4 || code.length > 12 || !/^[A-Z0-9]+$/.test(code)) {
      setSettingsError('Referral code must be alphanumeric and between 4 and 12 characters.');
      return;
    }

    // Check if code is taken
    const codeTaken = db.users.some(u => u.id !== userId && u.referralCode === code);
    if (codeTaken) {
      setSettingsError('This referral code is already registered by another investor.');
      return;
    }

    const updatedDb = updateProfile(userId, { referralCode: code });
    setDb(updatedDb);
    setSettingsSuccess(`Your personalized referral code has been set to: ${code}`);
    refreshState();
  };

  // Submit KYC Documents
  const handleKycSubmit = () => {
    const updatedDb = submitKyc(userId);
    setDb(updatedDb);
    refreshState();
  };

  // Profile Info update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    const updates: Partial<UserType> = { name: profileName, phone: profilePhone };
    if (profilePassword.trim()) {
      if (profilePassword.length < 6) {
        setSettingsError('Security password must be at least 6 characters.');
        return;
      }
      updates.password = profilePassword;
    }

    const updatedDb = updateProfile(userId, updates);
    setDb(updatedDb);
    setSettingsSuccess('Identity profile successfully updated.');
    setProfilePassword('');
    refreshState();
  };

  // User withdrawal payout account details update
  const handleWithdrawalAccountUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setBankError('');
    setBankSuccess('');

    if (!withdrawalBankName.trim() || !withdrawalAccountName.trim() || !withdrawalAccountNumber.trim()) {
      setBankError('All payout bank fields are required.');
      return;
    }

    const updatedDb = updateProfile(userId, {
      withdrawalBankName: withdrawalBankName.trim(),
      withdrawalAccountName: withdrawalAccountName.trim(),
      withdrawalAccountNumber: withdrawalAccountNumber.trim(),
    });
    setDb(updatedDb);
    setBankSuccess('Payout bank account details registered successfully.');
    refreshState();
  };

  // 2FA Security Toggle
  const handleTfaToggle = () => {
    const nextState = !currentUser.tfaEnabled;
    const updatedDb = updateProfile(userId, { tfaEnabled: nextState });
    setDb(updatedDb);
    refreshState();
  };

  // Notifications Helpers
  const handleMarkNotificationsRead = () => {
    const currentDb = getDbState();
    currentDb.notifications = currentDb.notifications.map(n => {
      if ((n.userId === userId || n.userId === 'all') && !n.read) {
        return { ...n, read: true };
      }
      return n;
    });
    saveDbState(currentDb);
    refreshState();
  };

  // Copy utilities
  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const referralLink = `${window.location.origin}?ref=${currentUser.referralCode}`;

  // Filter lists specific to this user
  const userTransactions = db.transactions.filter(t => t.userId === userId).reverse();
  const userInvestments = db.investments.filter(i => i.userId === userId).reverse();
  const userNotifications = db.notifications.filter(n => n.userId === userId || n.userId === 'all').reverse();
  const userReferralsList = db.referrals.filter(r => r.referrerId === userId).reverse();

  // Project Daily Payout Returns
  const activeUserInvestments = db.investments.filter(inv => inv.userId === userId && inv.status === 'active');
  const projectedDailyReturns = activeUserInvestments.reduce((sum, inv) => sum + inv.dailyReturn, 0);

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col pt-16 font-sans">
      
      {/* Top dashboard alerts */}
      {!currentUser.verifiedEmail && (
        <div className="bg-yellow-500 text-black text-xs px-4 py-2 font-mono flex items-center justify-between z-20">
          <span className="flex items-center gap-1.5 font-sans">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Your email address is unverified. Secure withdrawals and investment functions require email authentication.
          </span>
          <button 
            onClick={() => {
              // Direct simulation of email verified
              const currentDb = getDbState();
              currentDb.users = currentDb.users.map(u => {
                if (u.id === userId) return { ...u, verifiedEmail: true };
                return u;
              });
              saveDbState(currentDb);
              refreshState();
              alert("Email Address verified successfully!");
            }}
            className="underline font-bold uppercase hover:opacity-85 ml-2 shrink-0"
          >
            Verify Now (Simulated)
          </button>
        </div>
      )}

      {/* Main Grid Wrapper */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          {/* User brief profile */}
          <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900/60 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 to-yellow-600 flex items-center justify-center text-black font-extrabold text-2xl mx-auto shadow-lg shadow-yellow-500/10">
              {currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-200 truncate">{currentUser.name}</h3>
              <p className="text-xs text-zinc-500 font-mono truncate">{currentUser.email}</p>
            </div>
            
            <div className="flex justify-center items-center gap-1.5">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                currentUser.kycStatus === 'verified' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' :
                currentUser.kycStatus === 'pending' ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-500/10' :
                'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}>
                KYC: {currentUser.kycStatus}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase bg-yellow-950/30 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/10">
                Tier 1 Account
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === 'overview' ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Wallet className="w-4.5 h-4.5" /> Overview & Balances
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('wallet')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === 'wallet' ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Wallet className="w-4.5 h-4.5" /> Wallet Transactions
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('investments')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === 'investments' ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <TrendingUp className="w-4.5 h-4.5" /> Active Wealth Plans
              </span>
              {userInvestments.filter(i => i.status === 'active').length > 0 && (
                <span className="bg-yellow-500 text-black font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full shrink-0">
                  {userInvestments.filter(i => i.status === 'active').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('referrals')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === 'referrals' ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Share2 className="w-4.5 h-4.5" /> Referral Network
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === 'settings' ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Settings className="w-4.5 h-4.5" /> Security & KYC
              </span>
            </button>
            <button 
              onClick={() => {
                setActiveTab('notifications');
                handleMarkNotificationsRead();
              }}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === 'notifications' ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Bell className="w-4.5 h-4.5" /> System Alerts
              </span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full shrink-0">
                  {unreadCount}
                </span>
              )}
            </button>
          </nav>

          <div className="pt-6 border-t border-zinc-900/60 text-center">
            <button 
              onClick={onLogout}
              className="w-full py-2 bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 rounded hover:text-white hover:bg-zinc-800 transition"
            >
              Sign Out Secure Session
            </button>
          </div>
        </aside>

        {/* Primary Content Window */}
        <main className="lg:col-span-9 space-y-6">

          {/* ============================================================ */}
          {/* TAB 1: PORTFOLIO OVERVIEW */}
          {/* ============================================================ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top simulated account status indicators */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-950 p-4 border border-zinc-900/65 rounded-xl">
                <div>
                  <h4 className="text-sm font-semibold text-gray-200">Interactive Trading Environment Active</h4>
                  <p className="text-xs text-zinc-500">Live artificial intelligent execution parameters are syncing with Marina Mall center logs.</p>
                </div>
                <div className="flex gap-2">
                  {currentUser.role === 'admin' && (
                    <button 
                      onClick={onNavigateToAdmin}
                      className="px-3.5 py-1.5 bg-yellow-500 text-black rounded text-xs font-semibold hover:bg-yellow-400 transition"
                    >
                      Admin Panel
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      const updatedDb = getDbState();
                      setDb(updatedDb);
                      refreshState();
                    }}
                    className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded hover:text-white transition"
                    title="Reload ledger database"
                  >
                    <RefreshCw className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Financial Dashboard Bento-Grid Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Wallet Balance */}
                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-yellow-500/5 to-transparent pointer-events-none" />
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-yellow-500" /> Wallet Balance
                  </p>
                  <p className="text-3xl font-extrabold text-white mt-3">₦{currentUser.walletBalance.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">Cleared transferable cash</p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => navigateToSection('wallet', 'deposit')} className="flex-1 py-1.5 bg-yellow-500 text-black font-semibold rounded text-xs hover:bg-yellow-400 transition text-center uppercase tracking-wider">Deposit</button>
                    <button onClick={() => navigateToSection('wallet', 'withdrawal')} className="flex-1 py-1.5 bg-zinc-900 border border-zinc-800 text-yellow-500 font-semibold rounded text-xs hover:bg-zinc-800 transition text-center uppercase tracking-wider">Withdraw</button>
                  </div>
                </div>

                {/* 2. Active Investments */}
                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-yellow-500/5 to-transparent pointer-events-none" />
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-yellow-500" /> Active Investments
                  </p>
                  <p className="text-3xl font-extrabold text-yellow-500 mt-3">₦{currentUser.activeInvestmentsAmount.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">Trading contracts active ({activeUserInvestments.length})</p>
                  <button onClick={() => setActiveTab('investments')} className="w-full mt-4 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold rounded text-xs hover:bg-zinc-800 transition uppercase tracking-wider">Manage Contracts</button>
                </div>

                {/* 3. Total Earnings (Promoted to first-class card) */}
                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-500/5 to-transparent pointer-events-none" />
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Total Earnings
                  </p>
                  <p className="text-3xl font-extrabold text-emerald-400 mt-3">₦{currentUser.totalEarnings.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1">Cumulative Forex arbitrage payouts</p>
                  <button onClick={() => setActiveTab('investments')} className="w-full mt-4 py-1.5 bg-zinc-900 border border-zinc-800 text-emerald-500 hover:text-emerald-400 font-semibold rounded text-xs transition uppercase tracking-wider">
                    View Yield Contracts
                  </button>
                </div>

                {/* 4. Total Deposits */}
                <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-900 text-left sm:col-span-1">
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Total Deposits</p>
                  <p className="text-xl font-bold text-gray-200 mt-2">₦{currentUser.totalDeposits.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-600 font-mono">Net verified capital inflow</p>
                </div>

                {/* 5. Referral Earnings */}
                <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-900 text-left sm:col-span-1 lg:col-span-2">
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Referral Commission</p>
                  <p className="text-xl font-bold text-yellow-500 mt-2">₦{currentUser.referralEarnings.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-600 font-mono">Affiliate program payouts</p>
                </div>
              </div>

              {/* Dynamic Interactive Candles Chart - custom styled SVG */}
              <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                  <div>
                    <h4 className="font-semibold text-gray-200 text-sm">AI Real-Time Forex Margin Analytics</h4>
                    <p className="text-xs text-zinc-500">Live-feed volatility and machine learning trade decision mapping.</p>
                  </div>
                  <span className="text-xs bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-mono">ALGO GRID ACTIVE</span>
                </div>

                <div className="h-44 w-full flex items-end justify-between gap-1 pt-4 relative">
                  {/* Decorative horizontal lines */}
                  <div className="absolute inset-x-0 top-1/4 h-px bg-zinc-900/60 pointer-events-none" />
                  <div className="absolute inset-x-0 top-2/4 h-px bg-zinc-900/60 pointer-events-none" />
                  <div className="absolute inset-x-0 top-3/4 h-px bg-zinc-900/60 pointer-events-none" />

                  {/* Simulated Candles */}
                  {[
                    { h: 'h-24', w: 'h-12', b: 'bottom-4', up: true, name: '08:00' },
                    { h: 'h-32', w: 'h-16', b: 'bottom-8', up: true, name: '09:00' },
                    { h: 'h-16', w: 'h-8', b: 'bottom-12', up: false, name: '10:00' },
                    { h: 'h-28', w: 'h-14', b: 'bottom-10', up: true, name: '11:00' },
                    { h: 'h-36', w: 'h-20', b: 'bottom-12', up: true, name: '12:00' },
                    { h: 'h-20', w: 'h-10', b: 'bottom-16', up: false, name: '13:00' },
                    { h: 'h-28', w: 'h-14', b: 'bottom-14', up: true, name: '14:00' },
                    { h: 'h-40', w: 'h-24', b: 'bottom-12', up: true, name: '15:00' },
                    { h: 'h-32', w: 'h-16', b: 'bottom-16', up: false, name: '16:00' },
                    { h: 'h-44', w: 'h-28', b: 'bottom-10', up: true, name: '17:00' }
                  ].map((candle, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-crosshair">
                      <div className={`w-1 bg-zinc-800 ${candle.h} flex justify-center items-center rounded-sm`}>
                        <div className={`w-3.5 sm:w-5 ${candle.w} ${candle.up ? 'bg-emerald-500/80' : 'bg-red-500/80'} rounded-sm`} />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-600 mt-2">{candle.name}</span>

                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black border border-zinc-800 rounded text-[10px] font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition z-10 w-28 text-center shadow-2xl">
                        <p className="text-zinc-500">EURUSD {candle.name}</p>
                        <p className={candle.up ? 'text-emerald-400' : 'text-red-400'}>
                          {candle.up ? 'AI LONG +0.15%' : 'AI SHORT -0.08%'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Account Transactions log */}
              <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-200 text-sm">Recent Ledger Statements</h4>
                  <button onClick={() => setActiveTab('wallet')} className="text-xs text-yellow-500 hover:underline">View All Ledger Logs</button>
                </div>

                <div className="space-y-2">
                  {userTransactions.slice(0, 4).length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-600">No account entries have been logged yet.</div>
                  ) : (
                    userTransactions.slice(0, 4).map((tx) => (
                      <div key={tx.id} className="p-4 bg-black border border-zinc-900/50 rounded-lg flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {tx.type === 'deposit' ? (
                            <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
                          ) : tx.type === 'withdrawal' ? (
                            <ArrowUpCircle className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-yellow-500/70" />
                          )}
                          <div>
                            <p className="text-sm font-semibold capitalize">{tx.type.replace('_', ' ')}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">{new Date(tx.date).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${tx.amount < 0 ? 'text-gray-400' : 'text-gray-200'}`}>
                            {tx.amount < 0 ? '-' : '+'} ₦{Math.abs(tx.amount).toLocaleString()}
                          </p>
                          <span className={`text-[9px] uppercase tracking-widest font-mono font-semibold px-2 py-0.5 rounded-full ${
                            tx.status === 'approved' ? 'bg-emerald-950/40 text-emerald-400' :
                            tx.status === 'rejected' ? 'bg-red-950/40 text-red-400' :
                            'bg-yellow-950/40 text-yellow-500'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}


          {/* ============================================================ */}
          {/* TAB 2: INTERNAL WALLET SYSTEM */}
          {/* ============================================================ */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              
              {/* Balances Card */}
              <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-6">
                <div>
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Available Wallet Balance</p>
                  <p className="text-4xl font-black text-yellow-500 mt-2">₦{currentUser.walletBalance.toLocaleString()}</p>
                  <p className="text-xs text-zinc-500 font-mono mt-1">Cleared trading balance & affiliate assets</p>
                </div>
                <div className="flex gap-3 justify-end items-center">
                  <div className="text-right hidden sm:block font-mono text-xs text-zinc-500">
                    <p>Deposits: ₦{currentUser.totalDeposits.toLocaleString()}</p>
                    <p>Withdrawals: ₦{currentUser.totalWithdrawals.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Status Alert logs */}
              {walletError && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded text-xs flex gap-2 font-sans">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{walletError}</span>
                </div>
              )}
              {walletSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded text-xs flex gap-2 font-sans">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{walletSuccess}</span>
                </div>
              )}

              {/* Deposit and Withdrawal Side-by-Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Deposit Request Card */}
                <div id="deposit-section" className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-6">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-200">Submit Funding Request</h4>
                    <p className="text-xs text-zinc-500">Fund your cleared balance via Bank Transfer or USDT.</p>
                  </div>

                  <div className="p-4 bg-black border border-yellow-500/10 rounded-lg space-y-2.5 text-xs text-zinc-400 font-mono">
                    <p className="text-yellow-500 font-semibold uppercase tracking-wider">PV Bank Transfer Address</p>
                    <p>Bank: <strong>{db.companyBankName || 'Access Bank Plc'}</strong></p>
                    <p>Account Name: <strong>{db.companyAccountName || 'PrimeVest Asset clearing Trust'}</strong></p>
                    <p className="text-sm text-gray-200">Account Number: <strong>{db.companyAccountNumber || '0842918491'}</strong></p>
                    <p className="text-[10px] text-zinc-600 border-t border-zinc-900 pt-2">Note: Input your fullname as reference during payment. Minimum deposit: ₦20,000.</p>
                  </div>

                  <form onSubmit={handleDepositSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Funding Amount (NGN)</label>
                      <input 
                        type="number"
                        required
                        placeholder="e.g. 52000"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none transition font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Payment Reference or receipt text</label>
                      <textarea 
                        required
                        rows={2}
                        placeholder="e.g. Sent ₦52,000 via GTBank App. Reference #48102941094."
                        value={depositProof}
                        onChange={(e) => setDepositProof(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Transaction Receipt (Photo or PDF)</label>
                      <div className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 hover:border-yellow-500/30 rounded-lg p-4 bg-black/50 transition-colors text-center relative">
                        <input 
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {uploadingFile ? (
                          <div className="space-y-2">
                            <span className="text-xs text-zinc-500 font-mono animate-pulse">Reading file data...</span>
                          </div>
                        ) : receiptFileName ? (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-emerald-400 font-mono">✓ Receipt Attached Successfully</p>
                            <p className="text-[10px] text-zinc-400 font-mono max-w-[200px] truncate mx-auto">{receiptFileName}</p>
                            <button 
                              type="button" 
                              onClick={(e) => { e.stopPropagation(); setReceiptFile(''); setReceiptFileName(''); }}
                              className="text-[10px] text-red-400 hover:underline relative z-20 mt-1 block mx-auto"
                            >
                              Remove Receipt
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-zinc-500 text-xs">
                              Drag &amp; drop or <span className="text-yellow-500 underline font-semibold">browse files</span>
                            </div>
                            <p className="text-[10px] text-zinc-600 font-mono">PNG, JPG, JPEG, or PDF up to 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs uppercase tracking-wider rounded transition"
                    >
                      Dispatch Deposit Proof
                    </button>
                  </form>
                </div>

                {/* Withdrawal Request Card - Emerald green themed for clear visual separation */}
                <div id="withdrawal-section" className="p-6 rounded-xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-zinc-950 to-zinc-950 border border-emerald-500/20 hover:border-emerald-500/35 transition-all duration-300 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-gray-200">Request Asset Withdrawal</h4>
                      <p className="text-xs text-zinc-500">Deduct your cleared balance back to your bank account.</p>
                    </div>
                    <span className="text-[9px] bg-emerald-950 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded font-mono font-bold tracking-wider uppercase animate-pulse">
                      &lt; 18h Payouts
                    </span>
                  </div>

                  <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-emerald-500 font-semibold">Payout Channel</label>
                      <select 
                        value={withdrawalMethod}
                        onChange={(e) => setWithdrawalMethod(e.target.value)}
                        className="w-full bg-black border border-emerald-500/10 rounded px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none transition text-zinc-300"
                      >
                        <option value="bank">Nigerian Local Bank Transfer</option>
                        <option value="usdt">USDT Crypto Wallet (TRC20)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-emerald-500 font-semibold">Withdraw Amount (NGN)</label>
                      <input 
                        type="number"
                        required
                        placeholder="e.g. 30000"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-black border border-emerald-500/10 rounded px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none transition font-mono text-emerald-400 placeholder-emerald-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-mono uppercase tracking-widest text-emerald-500 font-semibold">Payout Destination Details</label>
                        {withdrawalMethod === 'bank' && currentUser.withdrawalBankName && (
                          <button 
                            type="button"
                            onClick={() => setWithdrawDetails(`${currentUser.withdrawalBankName}, ${currentUser.withdrawalAccountName}, ${currentUser.withdrawalAccountNumber}`)}
                            className="text-[10px] text-yellow-500 hover:underline font-mono font-semibold"
                          >
                            [Auto-Fill Saved Bank]
                          </button>
                        )}
                      </div>
                      <textarea 
                        required
                        rows={2}
                        placeholder={withdrawalMethod === 'bank' ? "Bank Name, Account Name, Account Number (10 digits)" : "Your TRC20 USDT Wallet Address"}
                        value={withdrawDetails}
                        onChange={(e) => setWithdrawDetails(e.target.value)}
                        className="w-full bg-black border border-emerald-500/10 rounded px-4 py-2 text-xs focus:border-emerald-500 focus:outline-none transition resize-none text-zinc-300 placeholder-zinc-700 font-semibold"
                      />
                    </div>

                    {/* Guaranteed speed info card */}
                    <div className="p-3 bg-emerald-950/20 border border-emerald-500/10 rounded-lg space-y-1 text-[11px] text-emerald-400 font-mono">
                      <p className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-emerald-400">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                        Liquidity Window Guaranteed
                      </p>
                      <p className="text-zinc-400 text-[10px] leading-normal">
                        Verifications run continuously. Cleared wallet funds will be credited to your destination in <strong className="text-white">less than 18 hours</strong> from submission.
                      </p>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs uppercase tracking-wider rounded transition-all duration-300 shadow-md shadow-emerald-950/50 cursor-pointer"
                    >
                      Request Fund Withdrawal
                    </button>
                  </form>
                </div>
              </div>

              {/* Comprehensive Transaction Ledger */}
              <TransactionHistory transactions={db.transactions.filter(t => t.userId === userId)} />
            </div>
          )}


          {/* ============================================================ */}
          {/* TAB 3: ACTIVE INVESTMENT PLAN TIERS */}
          {/* ============================================================ */}
          {activeTab === 'investments' && (
            <div className="space-y-6">
              
              {/* Active list with SIMULATOR ACTION button */}
              <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-200">Active Yield Contracts</h4>
                    <p className="text-xs text-zinc-500">Your capital active in Forex trading algorithms. Returns credit automatically.</p>
                  </div>
                  <span className="text-[10px] font-mono bg-yellow-950 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 rounded font-bold uppercase tracking-widest animate-pulse">
                    LIVE TRADING AGENT ON
                  </span>
                </div>

                <div className="space-y-4 pt-2">
                  {userInvestments.filter(i => i.status === 'active').length === 0 ? (
                    <div className="p-8 text-center bg-black border border-zinc-900 rounded-xl space-y-3">
                      <p className="text-zinc-500 text-sm">You do not have any active investment plans currently.</p>
                      <button 
                        onClick={() => {
                          const el = document.getElementById('invest-setup');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-4 py-2 bg-yellow-500 text-black font-semibold text-xs rounded uppercase tracking-wider"
                      >
                        Explore Plans
                      </button>
                    </div>
                  ) : (
                    userInvestments.filter(i => i.status === 'active').map((inv) => (
                      <div key={inv.id} className="p-5 bg-black border border-zinc-900 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-widest font-mono text-yellow-500">{inv.planName} Tier</p>
                          <h5 className="font-bold text-lg text-white">₦{inv.amountInvested.toLocaleString()}</h5>
                          <p className="text-[10px] text-zinc-500 font-mono">Contract: {inv.durationDays} Days</p>
                        </div>

                        <div className="space-y-1 font-mono text-xs">
                          <p className="text-zinc-500">Daily return: <strong className="text-gray-200">₦{inv.dailyReturn.toLocaleString()}</strong></p>
                          <p className="text-zinc-500">Payout days: <strong className="text-gray-200">{inv.daysElapsed} / {inv.durationDays} days</strong></p>
                        </div>

                        <div className="space-y-1 font-mono text-xs">
                          <p className="text-zinc-500">Accumulated: <strong className="text-emerald-400">₦{inv.earningsAccumulated.toLocaleString()}</strong></p>
                          <p className="text-zinc-500">Start Date: <span className="text-[10px] text-zinc-600">{new Date(inv.startDate).toLocaleDateString()}</span></p>
                        </div>

                        <div className="flex flex-col gap-2">
                          {/* Simulated Interactive ROI Simulator Button */}
                          <button 
                            onClick={() => handleForceSimulateReturn(inv.id)}
                            className="px-3.5 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-400 transition text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-yellow-500/5"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Simulate 24H return
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Purchase Investment Tier Form */}
              <div id="invest-setup" className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-6">
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-200">Activate Wealth Contract</h4>
                  <p className="text-xs text-zinc-500">Deploy your wallet balance directly into trading pools.</p>
                </div>

                {investError && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded text-xs">
                    {investError}
                  </div>
                )}
                {investSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded text-xs">
                    {investSuccess}
                  </div>
                )}

                <form onSubmit={handleInvestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Choose Trading Strategy</label>
                      <select 
                        required
                        value={selectedPlanId}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none transition"
                      >
                        <option value="">-- Select Active Plan --</option>
                        {db.plans.filter(p => !p.paused).map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} - Capital: {p.type === 'elite' ? 'Custom ₦2M+' : `₦${p.deposit.toLocaleString()}`} (Return: {p.type === 'elite' ? '4.5% daily' : `₦${p.dailyReturn.toLocaleString()}/day`})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedPlanId && db.plans.find(p => p.id === selectedPlanId)?.type === 'elite' && (
                      <div className="space-y-4 md:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Elite Commitment Amount (₦)</label>
                            <input 
                              type="number"
                              required
                              placeholder="e.g. 5000000"
                              value={customEliteAmount}
                              onChange={(e) => {
                                setCustomEliteAmount(e.target.value);
                                const num = parseFloat(e.target.value);
                                if (!isNaN(num)) {
                                  setNetworkAllocation(num);
                                }
                              }}
                              className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none transition font-mono text-white"
                            />
                            <p className="text-[10px] text-zinc-500 font-mono mt-1">Minimum: ₦2,000,000 | Maximum: ₦200,000,000</p>
                          </div>

                          {/* Interactive Partner Calculator */}
                          <div className="bg-white border-l-4 border-yellow-500 rounded-xl p-5 text-black shadow-lg space-y-4">
                            <div className="border-b border-zinc-100 pb-2">
                              <h5 className="font-extrabold text-zinc-900 text-sm tracking-tight flex items-center gap-2 uppercase">
                                <TrendingUp className="w-4 h-4 text-yellow-500 stroke-[2.5]" /> Interactive Partner Calculator
                              </h5>
                              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">If your network allocation is:</p>
                            </div>

                            <div className="space-y-3">
                              {/* Range Slider for Network Allocation */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Allocation Level</span>
                                  <span className="text-sm font-extrabold text-yellow-600 font-mono">₦{networkAllocation.toLocaleString()}</span>
                                </div>
                                <input 
                                  type="range"
                                  min={2000000}
                                  max={50000000}
                                  step={500000}
                                  value={networkAllocation}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setNetworkAllocation(val);
                                    setCustomEliteAmount(val.toString());
                                  }}
                                  className="w-full accent-yellow-500 cursor-pointer"
                                />
                                <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                                  <span>Min ₦2M</span>
                                  <span>Mid ₦26M</span>
                                  <span>Max ₦50M+</span>
                                </div>
                              </div>

                              {/* Calculations Grid */}
                              <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-3 rounded-lg border border-zinc-100 font-mono text-xs text-zinc-700">
                                <div className="p-2 border-r border-b border-zinc-200/60">
                                  <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">Daily ROI (4.5%)</span>
                                  <strong className="text-sm text-zinc-900">₦{(networkAllocation * 0.045).toLocaleString()}</strong>
                                </div>
                                <div className="p-2 border-b border-zinc-200/60 pl-3">
                                  <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">Weekly Return</span>
                                  <strong className="text-sm text-zinc-900">₦{(networkAllocation * 0.045 * 7).toLocaleString()}</strong>
                                </div>
                                <div className="p-2 border-r border-zinc-200/60 mt-1">
                                  <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">30-Day Contract</span>
                                  <strong className="text-sm text-emerald-600 font-extrabold">₦{(networkAllocation * 0.045 * 30).toLocaleString()}</strong>
                                </div>
                                <div className="p-2 mt-1 pl-3">
                                  <span className="text-[9px] uppercase font-bold text-zinc-400 block tracking-wider">Compound Volatility</span>
                                  <span className="text-[10px] text-zinc-400 font-semibold block uppercase">4.5% daily flat</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mandated Risk Disclosure Notice */}
                  <div className="p-4 bg-[#111] border border-yellow-500/10 rounded-lg space-y-2.5">
                    <p className="text-[11px] font-mono text-[#D4AF37] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-[#D4AF37]" /> MANDATED RISK DISCLOSURE NOTICE
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      Forex trading involves substantial risk. Investment values can rise or fall, and returns are not guaranteed. Any projected returns shown on this platform are estimates based on strategy objectives and historical performance where applicable. Actual results may differ depending on market conditions.
                    </p>
                    
                    <div className="flex items-start gap-2.5 pt-2 border-t border-zinc-900">
                      <input 
                        type="checkbox"
                        id="risk-disclosure-check"
                        checked={acceptedRisk}
                        onChange={(e) => setAcceptedRisk(e.target.checked)}
                        className="mt-0.5 rounded border-zinc-800 text-[#D4AF37] focus:ring-[#D4AF37] bg-black"
                      />
                      <label htmlFor="risk-disclosure-check" className="text-xs text-zinc-300 font-medium select-none cursor-pointer">
                        I acknowledge, understand, and accept the Forex Risk Disclosure. I authorize PrimeVest Capital to deploy my funds into AI-assisted forex trading strategies.
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-semibold text-xs uppercase tracking-wider rounded transition"
                  >
                    Deploy Investment Capital
                  </button>
                </form>
              </div>

              {/* Inactive or Historical Contracts */}
              <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
                <h4 className="font-semibold text-gray-200">Completed Contracts History</h4>
                <div className="space-y-2">
                  {userInvestments.filter(i => i.status === 'completed').length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-600 font-mono">No historically completed trading contracts found.</div>
                  ) : (
                    userInvestments.filter(i => i.status === 'completed').map((inv) => (
                      <div key={inv.id} className="p-4 bg-black border border-zinc-900/60 rounded flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-gray-300 capitalize">{inv.planName} Plan</p>
                          <p className="text-zinc-500 text-[10px] font-mono">Ended: {new Date(inv.lastPayoutDate).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-400 font-mono">Total return: ₦{inv.earningsAccumulated.toLocaleString()}</p>
                          <span className="text-[9px] uppercase tracking-wider bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded">completed</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}


          {/* ============================================================ */}
          {/* TAB 4: REFERRAL NETWORK */}
          {/* ============================================================ */}
          {activeTab === 'referrals' && (
            <div className="space-y-6">
              
              {/* Affiliate Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-900 text-left">
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Total Referrals</p>
                  <p className="text-3xl font-extrabold text-white mt-2">{userReferralsList.length}</p>
                  <p className="text-[10px] text-zinc-600 font-mono">Registered affiliates</p>
                </div>
                <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-900 text-left">
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Referral Earnings</p>
                  <p className="text-3xl font-extrabold text-yellow-500 mt-2">₦{currentUser.referralEarnings.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-600 font-mono">Cleared transferable cash</p>
                </div>
                <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-900 text-left">
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Commission rate</p>
                  <p className="text-3xl font-extrabold text-white mt-2">{db.referralCommissionRate}%</p>
                  <p className="text-[10px] text-emerald-400 font-mono">Platform direct reward active</p>
                </div>
              </div>

              {/* Referral links share and code customizer */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Sharing center */}
                <div className="lg:col-span-7 p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-6">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-200">Affiliate Tracking Links</h4>
                    <p className="text-xs text-zinc-500">Distribute your secure partner links to earn instant 10% cash commissions.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Share Link Field */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Your Affiliate Link</label>
                      <div className="flex">
                        <input 
                          type="text"
                          readOnly
                          value={referralLink}
                          className="flex-1 bg-black border border-zinc-800 rounded-l px-3 py-2 text-xs font-mono focus:outline-none"
                        />
                        <button 
                          onClick={() => copyToClipboard(referralLink, 'link')}
                          className="bg-yellow-500 text-black px-4 rounded-r font-semibold hover:bg-yellow-400 transition flex items-center gap-1.5 text-xs uppercase"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedLink ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Share Code Field */}
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Referral Code</label>
                      <div className="flex">
                        <input 
                          type="text"
                          readOnly
                          value={currentUser.referralCode}
                          className="flex-1 bg-black border border-zinc-800 rounded-l px-3 py-2 text-sm font-mono uppercase tracking-wider focus:outline-none"
                        />
                        <button 
                          onClick={() => copyToClipboard(currentUser.referralCode, 'code')}
                          className="bg-zinc-900 border border-zinc-800 text-yellow-500 px-4 rounded-r font-semibold hover:bg-zinc-800 transition flex items-center gap-1.5 text-xs uppercase"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedCode ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 text-xs font-mono">
                      <button 
                        onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join PrimeVest Capital for AI Forex investment returns daily!')}`)}
                        className="px-3 py-1.5 bg-sky-950 text-sky-400 border border-sky-800/40 rounded hover:bg-sky-900/60 transition flex items-center gap-1"
                      >
                        <Share2 className="w-3 h-3" /> Telegram
                      </button>
                      <button 
                        onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out PrimeVest Capital AI Trading returns: ${referralLink}`)}`)}
                        className="px-3 py-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800/40 rounded hover:bg-emerald-900/60 transition flex items-center gap-1"
                      >
                        <Share2 className="w-3 h-3" /> WhatsApp
                      </button>
                    </div>
                  </div>
                </div>

                {/* Customizer sidebar */}
                <div className="lg:col-span-5 p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-6 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-200">Personalize Code</h4>
                    <p className="text-xs text-zinc-500">Choose a highly brandable referral code string.</p>
                  </div>

                  <form onSubmit={handleCustomizeReferral} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Custom Code String</label>
                      <input 
                        type="text"
                        placeholder="e.g. ADEBAYOVEST"
                        value={newReferralCode}
                        onChange={(e) => setNewReferralCode(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none transition uppercase font-mono"
                      />
                      <p className="text-[10px] text-zinc-500 font-mono">4-12 alphanumeric characters.</p>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs uppercase tracking-wider rounded transition"
                    >
                      Lock Personalized Code
                    </button>
                  </form>
                </div>
              </div>

              {/* Referral list tables */}
              <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
                <h4 className="font-semibold text-gray-200">Registered Affiliates Ledger</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider pb-3">
                        <th className="py-3 px-2">ID</th>
                        <th className="py-3 px-2">Date Connected</th>
                        <th className="py-3 px-2">Referee Name</th>
                        <th className="py-3 px-2">Affiliate Yield State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {userReferralsList.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-zinc-600">No referrals found.</td>
                        </tr>
                      ) : (
                        userReferralsList.map((ref) => (
                          <tr key={ref.id}>
                            <td className="py-3 px-2 text-zinc-400">{ref.id}</td>
                            <td className="py-3 px-2 text-zinc-500">{new Date(ref.date).toLocaleDateString()}</td>
                            <td className="py-3 px-2 text-gray-200 font-semibold">{ref.refereeName}</td>
                            <td className="py-3 px-2">
                              <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400`}>
                                Connected
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


          {/* ============================================================ */}
          {/* TAB 5: PROFILE SECURITY & KYC */}
          {/* ============================================================ */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              
              {/* KYC Status Details */}
              <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-200">Compliance & KYC Identity Verification</h4>
                    <p className="text-xs text-zinc-500">Provide legal identification details to secure higher volume limits.</p>
                  </div>
                  <span className={`text-xs uppercase font-mono px-3 py-1 rounded border ${
                    currentUser.kycStatus === 'verified' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/20' :
                    currentUser.kycStatus === 'pending' ? 'bg-yellow-950/30 text-yellow-400 border-yellow-500/20' :
                    'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}>
                    {currentUser.kycStatus.toUpperCase()}
                  </span>
                </div>

                {currentUser.kycStatus === 'unverified' ? (
                  <div className="p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 space-y-4">
                    <div className="flex gap-3 text-xs text-zinc-400 leading-relaxed font-sans">
                      <Info className="w-5 h-5 text-yellow-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-200">KYC Required for Cleared Asset Transfers</p>
                        <p className="mt-1">In compliance with global anti-money laundering (AML) laws, we require a scan or details of your Government-issued National ID, Drivers License, or International Passport.</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        onClick={handleKycSubmit}
                        className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs uppercase tracking-wider rounded transition"
                      >
                        Submit Simulated Documents
                      </button>
                    </div>
                  </div>
                ) : currentUser.kycStatus === 'pending' ? (
                  <div className="p-4 rounded bg-yellow-950/20 border border-yellow-500/20 text-xs text-yellow-500/90 leading-relaxed font-mono">
                    Your identity documents are queued for compliance auditing. Once approved by our administrator, your withdrawal features will be unlocked fully.
                  </div>
                ) : (
                  <div className="p-4 rounded bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-400 leading-relaxed font-mono">
                    Congratulations! Your identity profile is fully audited and certified. Cleared transfer operations are active.
                  </div>
                )}
              </div>

              {/* Profile details editor */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Info update */}
                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-6">
                  <h4 className="font-semibold text-gray-200">Profile Specifications</h4>
                  
                  {settingsError && (
                    <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded text-xs">
                      {settingsError}
                    </div>
                  )}
                  {settingsSuccess && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded text-xs">
                      {settingsSuccess}
                    </div>
                  )}

                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Legal Name</label>
                      <input 
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Phone Number</label>
                      <input 
                        type="tel"
                        placeholder="e.g. +234 812 345 6789"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none transition font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Change Security Password</label>
                      <input 
                        type="password"
                        placeholder="Leave blank to preserve current"
                        value={profilePassword}
                        onChange={(e) => setProfilePassword(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none transition font-mono"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs uppercase tracking-wider rounded transition"
                    >
                      Apply Changes
                    </button>
                  </form>
                </div>

                {/* 2FA Security Center */}
                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-6 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-200 mb-2">Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Secure your investment portfolio from illegal entries. When activated, all portal log-in attempts will verify with an encrypted OTP code generated by your mobile authenticator app.
                    </p>
                  </div>

                  <div className="py-4 border-y border-zinc-900 my-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-200">Google Authenticator State</p>
                      <p className="text-[10px] text-zinc-500 font-mono">Status: {currentUser.tfaEnabled ? 'SECURED' : 'UNPROTECTED'}</p>
                    </div>
                    <button 
                      onClick={handleTfaToggle}
                      className={`px-4 py-1.5 rounded text-xs font-bold font-mono transition ${
                        currentUser.tfaEnabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-red-950 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {currentUser.tfaEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-600 leading-relaxed font-mono">
                    Device tokens are synchronized with Marina Mall central systems. Security resets require personal compliance requests.
                  </p>
                </div>

                {/* Withdrawal Payout Account Form Card */}
                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-200">Withdrawal Bank Account Specifications</h4>
                    <p className="text-xs text-zinc-500">Configure your default payout destination details. Withdrawals will be sent to this specified account.</p>
                  </div>

                  {bankError && (
                    <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded text-xs">
                      {bankError}
                    </div>
                  )}
                  {bankSuccess && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded text-xs font-semibold">
                      {bankSuccess}
                    </div>
                  )}

                  <form onSubmit={handleWithdrawalAccountUpdate} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Payout Bank Name</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. United Bank for Africa (UBA)"
                        value={withdrawalBankName}
                        onChange={(e) => setWithdrawalBankName(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none transition font-semibold text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Account Holder Name</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={withdrawalAccountName}
                          onChange={(e) => setWithdrawalAccountName(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none transition font-semibold text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Bank Account Number</label>
                        <input 
                          type="text"
                          required
                          maxLength={10}
                          placeholder="e.g. 1012948194"
                          value={withdrawalAccountNumber}
                          onChange={(e) => setWithdrawalAccountNumber(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none transition font-mono font-semibold text-white"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs uppercase tracking-wider rounded transition"
                    >
                      Save Payout Account
                    </button>
                  </form>
                </div>
              </div>

              {/* Login Logs */}
              <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
                <h4 className="font-semibold text-gray-200">Device Login Ledger</h4>
                <div className="p-4 bg-black border border-zinc-900/60 rounded flex justify-between items-center text-xs font-mono text-zinc-500">
                  <div className="space-y-1">
                    <p>Browser Useragent: Chrome Webkit (Linux/Container Node)</p>
                    <p>Assigned IP Address: {currentUser.lastLoginIp || '127.0.0.1'}</p>
                  </div>
                  <div className="text-right">
                    <p>Authorized logins: {currentUser.loginCount}</p>
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded">active session</span>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* ============================================================ */}
          {/* TAB 6: NOTIFICATIONS Alerts */}
          {/* ============================================================ */}
          {activeTab === 'notifications' && (
            <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                <div>
                  <h4 className="font-semibold text-gray-200">Compliance & Account Notifications</h4>
                  <p className="text-xs text-zinc-500">Official logs and automated alerts dispatched to your profile.</p>
                </div>
                <button 
                  onClick={() => {
                    const currentDb = getDbState();
                    currentDb.notifications = currentDb.notifications.filter(n => n.userId !== userId && n.userId !== 'all');
                    saveDbState(currentDb);
                    refreshState();
                  }}
                  className="text-xs text-zinc-500 hover:text-red-400 transition"
                >
                  Clear All Alerts
                </button>
              </div>

              <div className="space-y-3">
                {userNotifications.length === 0 ? (
                  <div className="text-center py-12 text-zinc-600 font-mono text-xs">No notifications in your inbox.</div>
                ) : (
                  userNotifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 border rounded-lg transition-colors flex items-start gap-3.5 ${
                        notif.read ? 'bg-black/20 border-zinc-900/50 text-zinc-400' : 'bg-yellow-950/10 border-yellow-500/10 text-gray-100'
                      }`}
                    >
                      <Bell className={`w-5 h-5 shrink-0 mt-0.5 ${notif.read ? 'text-zinc-600' : 'text-yellow-500'}`} />
                      <div className="flex-1 space-y-1 text-sm">
                        <div className="flex justify-between items-center">
                          <h5 className="font-bold">{notif.title}</h5>
                          <span className="text-[10px] text-zinc-500 font-mono">{new Date(notif.date).toLocaleDateString()} {new Date(notif.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed font-sans">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </main>
      </div>
      
      {/* Reusable Minimal Web Footer */}
      <Footer variant="minimal" />
    </div>
  );
}
