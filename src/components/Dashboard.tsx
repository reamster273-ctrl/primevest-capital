import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Shield, Wallet, ArrowDownCircle, ArrowUpCircle, 
  Clock, Share2, Copy, Check, Info, Settings, AlertCircle, 
  Bell, ChevronRight, User, Key, RefreshCw, Calendar, Eye
} from 'lucide-react';
import { User as UserType, Transaction, Investment, Notification, InvestmentPlan } from '../types';
import { 
  getDbState, requestDeposit, requestWithdrawal, investInPlan, 
  processROIPayouts, submitKyc, updateProfile, saveDbState 
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
  const [db, setDb] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  
  // UI views
  const [activeTab, setActiveTab] = useState<'overview' | 'wallet' | 'investments' | 'referrals' | 'settings' | 'notifications'>('overview');

  // Wallet form inputs
  const [depositAmount, setDepositAmount] = useState('');
  const [depositProof, setDepositProof] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('bank');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [receiptFile, setReceiptFile] = useState('');
  const [receiptFileName, setReceiptFileName] = useState('');

  // Investment form
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [customEliteAmount, setCustomEliteAmount] = useState('');
  const [acceptedRisk, setAcceptedRisk] = useState(false);

  // Settings forms
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePassword, setProfilePassword] = useState('');

  // Bank details for withdrawal
  const [withdrawalBankName, setWithdrawalBankName] = useState('');
  const [withdrawalAccountName, setWithdrawalAccountName] = useState('');
  const [withdrawalAccountNumber, setWithdrawalAccountNumber] = useState('');
  const [bankSuccess, setBankSuccess] = useState('');
  const [bankError, setBankError] = useState('');

  // KYC
  const [kycMessage, setKycMessage] = useState('');
  const [kycError, setKycError] = useState('');

  // Referral settings
  const [newReferralCode, setNewReferralCode] = useState('');

  // Messages
  const [walletSuccess, setWalletSuccess] = useState('');
  const [walletError, setWalletError] = useState('');
  const [investError, setInvestError] = useState('');
  const [investSuccess, setInvestSuccess] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Notifications
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync with database
  useEffect(() => {
    const loadDb = async () => {
      const currentDb = await getDbState();
      setDb(currentDb);
      const user = currentDb.users.find((u: UserType) => u.id === userId);
      if (user) {
        setCurrentUser(user);
        setProfileName(user.name);
        setProfilePhone(user.phone || '');
        setWithdrawalBankName(user.withdrawalBankName || '');
        setWithdrawalAccountName(user.withdrawalAccountName || '');
        setWithdrawalAccountNumber(user.withdrawalAccountNumber || '');
      }
      const unread = currentDb.notifications.filter((n: Notification) => (n.userId === userId || n.userId === 'all') && !n.read).length;
      setUnreadCount(unread);
    };
    loadDb();
  }, [userId]);

  const refreshState = async () => {
    const currentDb = await getDbState();
    setDb(currentDb);
    const user = currentDb.users.find((u: UserType) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
    const unread = currentDb.notifications.filter((n: Notification) => (n.userId === userId || n.userId === 'all') && !n.read).length;
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

  if (!currentUser || !db) return <div className="text-white p-12 text-center">Loading User Profile...</div>;

  // Wallet Handlers
  const handleDepositSubmit = async (e: React.FormEvent) => {
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

    const updatedDb = await requestDeposit(userId, amount, depositProof, receiptFile, receiptFileName);
    setDb(updatedDb);
    setWalletSuccess(`Your deposit request of ₦${amount.toLocaleString()} was successfully queued. Standard administration verification takes 10 to 60 minutes.`);
    setDepositAmount('');
    setDepositProof('');
    setReceiptFile('');
    setReceiptFileName('');
    refreshState();
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
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

    const result = await requestWithdrawal(userId, amount);
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
  const handleInvestSubmit = async (e: React.FormEvent) => {
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

    const plan = db.plans.find((p: InvestmentPlan) => p.id === selectedPlanId);
    if (!plan) return;

    let customAmount: number | undefined = undefined;
    if (plan.type === 'elite') {
      customAmount = parseFloat(customEliteAmount);
      if (isNaN(customAmount)) {
        setInvestError('Please enter a valid amount to commit.');
        return;
      }
    }

    const result = await investInPlan(userId, selectedPlanId, customAmount);
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

  // Process ROI Payouts (production)
  const handleProcessROIPayouts = async () => {
    try {
      const updatedDb = await processROIPayouts();
      setDb(updatedDb);
      refreshState();
      alert("ROI payouts processed successfully! Earnings from the backend trading system have been credited.");
    } catch (error) {
      alert("Error processing ROI payouts. Check backend connection.");
      console.error(error);
    }
  };

  // Customize referral code
  const handleCustomizeReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    const code = newReferralCode.trim().toUpperCase();
    if (code.length < 4 || code.length > 12 || !/^[A-Z0-9]+$/.test(code)) {
      setSettingsError('Referral code must be alphanumeric and between 4 and 12 characters.');
      return;
    }

    const codeTaken = db.users.some((u: UserType) => u.id !== userId && u.referralCode === code);
    if (codeTaken) {
      setSettingsError('This referral code is already registered by another investor.');
      return;
    }

    const updatedDb = await updateProfile(userId, { referralCode: code });
    setDb(updatedDb);
    setSettingsSuccess(`Your personalized referral code has been set to: ${code}`);
    refreshState();
  };

  // Submit KYC Documents
  const handleKycSubmit = async () => {
    const updatedDb = await submitKyc(userId);
    setDb(updatedDb);
    setKycMessage('KYC documents submitted successfully.');
    refreshState();
  };

  // Profile Info update
  const handleProfileUpdate = async (e: React.FormEvent) => {
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

    const updatedDb = await updateProfile(userId, updates);
    setDb(updatedDb);
    setSettingsSuccess('Profile updated successfully.');
    setProfilePassword('');
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
  const userTransactions = db.transactions.filter((t: Transaction) => t.userId === userId).reverse();
  const userInvestments = db.investments.filter((i: Investment) => i.userId === userId).reverse();
  const userNotifications = db.notifications.filter((n: Notification) => n.userId === userId || n.userId === 'all').reverse();
  const userReferralsList = db.referrals.filter((r: any) => r.referrerId === userId).reverse();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-black border-b border-zinc-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="space-y-0.5">
            <h1 className="text-lg font-bold text-white">PrimeVest Capital Dashboard</h1>
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
              onClick={() => refreshState()}
              className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded hover:text-white transition"
              title="Reload ledger database"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          {/* User profile card */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                <User className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{currentUser.name}</h3>
                <p className="text-[10px] text-zinc-500 font-mono">{currentUser.email}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full py-2 px-3 bg-zinc-900 hover:bg-red-950 text-zinc-300 hover:text-red-300 rounded text-xs font-semibold transition"
            >
              Sign Out
            </button>
          </div>

          {/* Navigation tabs */}
          {['overview', 'wallet', 'investments', 'referrals', 'settings', 'notifications'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === tab ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="capitalize">{tab}</span>
              {tab === 'notifications' && unreadCount > 0 && (
                <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-2">
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-blue-500" /> Wallet Balance
                  </p>
                  <p className="text-3xl font-extrabold text-blue-400">₦{currentUser.walletBalance.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-600 font-mono">Available for investment or withdrawal</p>
                </div>

                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-2">
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Total Earnings
                  </p>
                  <p className="text-3xl font-extrabold text-emerald-400">₦{currentUser.totalEarnings.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-600 font-mono">All trading returns accumulated</p>
                </div>

                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-2">
                  <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-purple-500" /> Active Contracts
                  </p>
                  <p className="text-3xl font-extrabold text-purple-400">{userInvestments.filter((i: Investment) => i.status === 'active').length}</p>
                  <p className="text-[10px] text-zinc-600 font-mono">Running investment plans</p>
                </div>
              </div>

              {/* Recent transactions */}
              <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-200 text-sm">Recent Ledger Statements</h4>
                  <button onClick={() => setActiveTab('wallet')} className="text-xs text-yellow-500 hover:underline">View All</button>
                </div>
                <div className="space-y-2">
                  {userTransactions.slice(0, 4).length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-600">No transactions yet.</div>
                  ) : (
                    userTransactions.slice(0, 4).map((tx: Transaction) => (
                      <div key={tx.id} className="p-3 bg-black border border-zinc-900/50 rounded flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-zinc-300">{tx.type.toUpperCase()}</p>
                          <p className="text-zinc-500">{tx.planName || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {tx.type === 'deposit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                          </p>
                          <p className="text-zinc-500">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              {/* Deposit Section */}
              <div id="deposit-section" className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-200">Submit Funding Request</h4>
                  <p className="text-xs text-zinc-500">Fund your wallet via Bank Transfer or USDT.</p>
                </div>

                <div className="p-4 bg-black border border-yellow-500/10 rounded-lg space-y-2.5 text-xs text-zinc-400 font-mono">
                  <p className="text-yellow-500 font-semibold uppercase">Bank Transfer Details</p>
                  <p>Bank: <strong>{db.companyBankName}</strong></p>
                  <p>Account Name: <strong>{db.companyAccountName}</strong></p>
                  <p>Account Number: <strong>{db.companyAccountNumber}</strong></p>
                </div>

                <form onSubmit={handleDepositSubmit} className="space-y-4">
                  <input
                    type="number"
                    placeholder="Amount (₦)"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-black border border-zinc-800 rounded text-white text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Payment proof or reference ID"
                    value={depositProof}
                    onChange={(e) => setDepositProof(e.target.value)}
                    className="w-full px-4 py-2 bg-black border border-zinc-800 rounded text-white text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-sm transition"
                  >
                    Submit Deposit Request
                  </button>
                </form>

                {walletSuccess && <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded text-emerald-400 text-xs">{walletSuccess}</div>}
                {walletError && <div className="p-3 bg-red-950/30 border border-red-500/30 rounded text-red-400 text-xs">{walletError}</div>}
              </div>

              {/* Withdrawal Section */}
              <div id="withdrawal-section" className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-200">Request Withdrawal</h4>
                  <p className="text-xs text-zinc-500">Minimum withdrawal: ₦10,000</p>
                </div>

                <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                  <input
                    type="number"
                    placeholder="Amount (₦)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-black border border-zinc-800 rounded text-white text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Bank name, account number, or USDT address"
                    value={withdrawDetails}
                    onChange={(e) => setWithdrawDetails(e.target.value)}
                    className="w-full px-4 py-2 bg-black border border-zinc-800 rounded text-white text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-sm transition"
                  >
                    Request Withdrawal
                  </button>
                </form>

                {walletSuccess && <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded text-emerald-400 text-xs">{walletSuccess}</div>}
                {walletError && <div className="p-3 bg-red-950/30 border border-red-500/30 rounded text-red-400 text-xs">{walletError}</div>}
              </div>

              {/* Transaction History */}
              <TransactionHistory transactions={userTransactions} />
            </div>
          )}

          {/* Investments Tab */}
          {activeTab === 'investments' && (
            <div className="space-y-6">
              {/* Investment Form */}
              <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-6">
                <h4 className="font-semibold text-gray-200">Purchase Investment Plan</h4>

                <form onSubmit={handleInvestSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase mb-2 text-zinc-400">Select Plan</label>
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-zinc-800 rounded text-white text-sm"
                    >
                      <option value="">-- Choose a plan --</option>
                      {db.plans.map((p: InvestmentPlan) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - ₦{p.deposit.toLocaleString()} ({p.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPlanId && db.plans.find((p: InvestmentPlan) => p.id === selectedPlanId)?.type === 'elite' && (
                    <input
                      type="number"
                      placeholder="Custom amount (min ₦2,000,000)"
                      value={customEliteAmount}
                      onChange={(e) => setCustomEliteAmount(e.target.value)}
                      className="w-full px-4 py-2 bg-black border border-zinc-800 rounded text-white text-sm"
                    />
                  )}

                  <label className="flex items-center gap-2 text-xs text-zinc-400">
                    <input
                      type="checkbox"
                      checked={acceptedRisk}
                      onChange={(e) => setAcceptedRisk(e.target.checked)}
                      className="w-4 h-4"
                    />
                    I accept the risk disclosure
                  </label>

                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-500 text-black rounded font-semibold text-sm transition"
                  >
                    Invest Now
                  </button>
                </form>

                {investSuccess && <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded text-emerald-400 text-xs">{investSuccess}</div>}
                {investError && <div className="p-3 bg-red-950/30 border border-red-500/30 rounded text-red-400 text-xs">{investError}</div>}
              </div>

              {/* Active Investments */}
              <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
                <h4 className="font-semibold text-gray-200">Your Investment Contracts</h4>

                {userInvestments.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-600">No active investments yet.</div>
                ) : (
                  <div className="space-y-3">
                    {userInvestments.map((inv: Investment) => (
                      <div key={inv.id} className="p-4 bg-black border border-zinc-900/50 rounded space-y-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-yellow-500 text-xs uppercase">{inv.planName}</p>
                            <p className="text-sm font-bold text-white">₦{inv.amountInvested.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-zinc-500">Status: <span className="text-emerald-400">{inv.status}</span></p>
                            <p className="text-sm font-bold text-emerald-400">₦{inv.earningsAccumulated.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-xs text-zinc-400 font-mono">
                          <p>Daily Return: ₦{inv.dailyReturn.toLocaleString()}</p>
                          <p>Progress: {inv.daysElapsed} / {inv.durationDays} days</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Process ROI Button (Admin only) */}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={handleProcessROIPayouts}
                    className="w-full mt-4 py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded font-semibold text-xs transition"
                  >
                    Process ROI Payouts (Admin)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
                <h4 className="font-semibold text-gray-200">Your Referral Program</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded bg-black border border-zinc-900">
                    <p className="text-xs text-zinc-500 uppercase">Referral Earnings</p>
                    <p className="text-2xl font-bold text-emerald-400">₦{currentUser.referralEarnings.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded bg-black border border-zinc-900">
                    <p className="text-xs text-zinc-500 uppercase">Commission Rate</p>
                    <p className="text-2xl font-bold text-white">{db.referralCommissionRate}%</p>
                  </div>
                </div>

                {/* Referral code */}
                <div className="p-4 bg-black border border-yellow-500/20 rounded space-y-2">
                  <p className="text-xs text-zinc-500 uppercase">Your Referral Code</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentUser.referralCode}
                      readOnly
                      className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(currentUser.referralCode, 'code')}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded transition"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Referral link */}
                <div className="p-4 bg-black border border-blue-500/20 rounded space-y-2">
                  <p className="text-xs text-zinc-500 uppercase">Referral Link</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-white text-sm text-xs overflow-hidden"
                    />
                    <button
                      onClick={() => copyToClipboard(referralLink, 'link')}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded transition"
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Customize code form */}
                <form onSubmit={handleCustomizeReferral} className="space-y-3 pt-4 border-t border-zinc-800">
                  <input
                    type="text"
                    placeholder="New referral code (4-12 chars, alphanumeric)"
                    value={newReferralCode}
                    onChange={(e) => setNewReferralCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 bg-black border border-zinc-800 rounded text-white text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-sm transition"
                  >
                    Customize Referral Code
                  </button>
                </form>

                {settingsSuccess && <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded text-emerald-400 text-xs">{settingsSuccess}</div>}
                {settingsError && <div className="p-3 bg-red-950/30 border border-red-500/30 rounded text-red-400 text-xs">{settingsError}</div>}
              </div>

              {/* Referrals list */}
              <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
                <h4 className="font-semibold text-gray-200">Your Referrals ({userReferralsList.length})</h4>
                {userReferralsList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-600">No referrals yet. Share your code to earn commissions!</div>
                ) : (
                  <div className="space-y-2">
                    {userReferralsList.map((ref: any) => (
                      <div key={ref.id} className="p-3 bg-black border border-zinc-900/50 rounded flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-zinc-300">{ref.refereeName}</p>
                          <p className="text-zinc-500">Status: {ref.status}</p>
                        </div>
                        <p className="text-zinc-500">{new Date(ref.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Profile Settings */}
              <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-6">
                <h4 className="font-semibold text-gray-200">Profile Settings</h4>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-2 bg-black border border-zinc-800 rounded text-white text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-4 py-2 bg-black border border-zinc-800 rounded text-white text-sm"
                  />
                  <input
                    type="password"
                    placeholder="New password (leave blank to skip)"
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full px-4 py-2 bg-black border border-zinc-800 rounded text-white text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-500 text-black rounded font-semibold text-sm transition"
                  >
                    Update Profile
                  </button>
                </form>

                {settingsSuccess && <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded text-emerald-400 text-xs">{settingsSuccess}</div>}
                {settingsError && <div className="p-3 bg-red-950/30 border border-red-500/30 rounded text-red-400 text-xs">{settingsError}</div>}
              </div>

              {/* KYC Section */}
              <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
                <h4 className="font-semibold text-gray-200">Identity Verification (KYC)</h4>
                <p className="text-xs text-zinc-400">Status: <span className={currentUser.kycStatus === 'verified' ? 'text-emerald-400' : 'text-yellow-500'}>{currentUser.kycStatus.toUpperCase()}</span></p>

                {currentUser.kycStatus !== 'verified' && (
                  <button
                    onClick={handleKycSubmit}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded font-semibold text-sm transition"
                  >
                    Submit KYC Documents
                  </button>
                )}

                {kycMessage && <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded text-emerald-400 text-xs">{kycMessage}</div>}
                {kycError && <div className="p-3 bg-red-950/30 border border-red-500/30 rounded text-red-400 text-xs">{kycError}</div>}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
              <h4 className="font-semibold text-gray-200">Notifications</h4>

              {userNotifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-600">No notifications.</div>
              ) : (
                <div className="space-y-3">
                  {userNotifications.map((notif: Notification) => (
                    <div key={notif.id} className={`p-4 rounded-lg border ${notif.read ? 'bg-black/20 border-zinc-900/50' : 'bg-yellow-950/10 border-yellow-500/10'}`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{notif.title}</p>
                          <p className="text-xs text-zinc-400 mt-1">{notif.message}</p>
                        </div>
                        <p className="text-[10px] text-zinc-500 whitespace-nowrap">{new Date(notif.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer variant="minimal" />
    </div>
  );
}
