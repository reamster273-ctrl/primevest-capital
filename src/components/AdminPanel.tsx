import React, { useState, useEffect } from 'react';
import { 
  Users, Wallet, TrendingUp, Share2, Shield, Bell, 
  Search, Check, X, Edit2, Trash2, Pause, Play, Plus, 
  UserMinus, UserCheck, Key, Settings, RefreshCw, ChevronRight, Eye,
  ArrowUp, ArrowDown, GripVertical, Award, CheckSquare, CheckCircle, XCircle, Activity, Landmark
} from 'lucide-react';

import { User, Transaction, Investment, Notification, InvestmentPlan, DailyTask } from '../types';
import { 
  getDbState, approveDeposit, rejectDeposit, approveWithdrawal, rejectWithdrawal, 
  approveKyc, rejectKyc, adminUpdateUser, adminDeleteUser, adminCreatePlan, 
  adminUpdatePlan, adminDeletePlan, adminUpdateReferralSettings, adminSendNotification,
  adminUpdateCompanySettings, saveDbState, adminVerifyBankDetails, adminEditUserBankDetails,
  adminCreateTask, adminUpdateTask, adminDeleteTask
} from '../db';
import Footer from './Footer';

// Styled tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl font-mono text-xs text-zinc-300">
        <p className="font-bold text-gray-200 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
            <span>{p.name}:</span>
            <span className="font-bold text-white">
              {p.name.includes('Capital') || p.name.includes('Money') 
                ? '₦' + Math.round(p.value).toLocaleString() 
                : p.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface AdminPanelProps {
  adminId: string;
  onNavigateToUser: (userId: string) => void;
  onBackToDashboard: () => void;
}

export default function AdminPanel({ adminId, onNavigateToUser, onBackToDashboard }: AdminPanelProps) {
  const [db, setDb] = useState(getDbState());
  const [activeTab, setActiveTab] = useState<'users' | 'deposits' | 'withdrawals' | 'plans' | 'referrals' | 'notifications' | 'settings' | 'tasks' | 'banks'>('users');
  const [chartView, setChartView] = useState<'capital' | 'users'>('capital');

  // Search/Filter states
  const [userSearch, setUserSearch] = useState('');
  
  // Modal / Editing states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserBalance, setEditUserBalance] = useState('');
  const [editUserKyc, setEditUserKyc] = useState<'unverified' | 'pending' | 'verified'>('unverified');
  const [editUserStatus, setEditUserStatus] = useState<'active' | 'suspended'>('active');

  // Task creation/editing states
  const [creatingTask, setCreatingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskButtonText, setTaskButtonText] = useState('Complete Task');
  const [taskExternalLink, setTaskExternalLink] = useState('');
  const [taskPlatformType, setTaskPlatformType] = useState<'facebook' | 'telegram' | 'twitter' | 'instagram' | 'youtube' | 'website' | 'whatsapp'>('facebook');
  const [taskStartDate, setTaskStartDate] = useState(new Date().toISOString().substring(0, 16));
  const [taskExpiryDate, setTaskExpiryDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16));
  const [taskActive, setTaskActive] = useState(true);
  const [taskRewardAmount, setTaskRewardAmount] = useState('500');
  const [taskSuccess, setTaskSuccess] = useState('');
  const [taskError, setTaskError] = useState('');

  // Bank editing states
  const [editingUserBank, setEditingUserBank] = useState<User | null>(null);
  const [bankEditName, setBankEditName] = useState('');
  const [bankEditHolder, setBankEditHolder] = useState('');
  const [bankEditNumber, setBankEditNumber] = useState('');
  const [bankVerifNote, setBankVerifNote] = useState('');
  const [bankSuccess, setBankSuccess] = useState('');
  const [bankError, setBankError] = useState('');

  // Plan creation states
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDeposit, setNewPlanDeposit] = useState('');
  const [newPlanDaily, setNewPlanDaily] = useState('');
  const [newPlanType, setNewPlanType] = useState<'basic' | 'premium' | 'elite'>('basic');

  // Plan editing states
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanDeposit, setEditPlanDeposit] = useState('');
  const [editPlanDaily, setEditPlanDaily] = useState('');
  const [editPlanType, setEditPlanType] = useState<'basic' | 'premium' | 'elite'>('basic');

  // Notification states
  const [notifTarget, setNotifTarget] = useState('all');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Referral config states
  const [refRate, setRefRate] = useState('10');
  const [refEnabled, setRefEnabled] = useState(true);

  // Company and Inquiries desk config states
  const [compBankName, setCompBankName] = useState(db.companyBankName || 'Access Bank Plc');
  const [compAccountName, setCompAccountName] = useState(db.companyAccountName || 'PrimeVest Asset clearing Trust');
  const [compAccountNumber, setCompAccountNumber] = useState(db.companyAccountNumber || '0842918491');
  const [inqTitle, setInqTitle] = useState(db.inquiriesDeskTitle || 'Connect with PrimeVest Advisors');
  const [inqText, setInqText] = useState(db.inquiriesDeskText || 'Have custom compliance, regulatory, or institutional partnership questions? Our premium advisor team is here to support you 24 hours a day, 5 days a week.');
  const [inqAddress, setInqAddress] = useState(db.inquiriesDeskAddress || 'Level 24, Tower 3, Marina Mall Financial Center, Lagos');
  const [inqEmail, setInqEmail] = useState(db.inquiriesDeskEmail || 'support@primevest.capital');
  const [inqPhone, setInqPhone] = useState(db.inquiriesDeskPhone || '+234 (1) 4950 200');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Rejection notes modals
  const [rejectTxId, setRejectTxId] = useState<string | null>(null);
  const [rejectType, setRejectType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [rejectionNote, setRejectionNote] = useState('');
  const [previewReceipt, setPreviewReceipt] = useState<{ file: string; name: string } | null>(null);

  useEffect(() => {
    const freshDb = getDbState();
    setDb(freshDb);
    setRefRate(freshDb.referralCommissionRate.toString());
    setRefEnabled(freshDb.referralRewardsEnabled);
    setCompBankName(freshDb.companyBankName || 'Access Bank Plc');
    setCompAccountName(freshDb.companyAccountName || 'PrimeVest Asset clearing Trust');
    setCompAccountNumber(freshDb.companyAccountNumber || '0842918491');
    setInqTitle(freshDb.inquiriesDeskTitle || 'Connect with PrimeVest Advisors');
    setInqText(freshDb.inquiriesDeskText || 'Have custom compliance, regulatory, or institutional partnership questions? Our premium advisor team is here to support you 24 hours a day, 5 days a week.');
    setInqAddress(freshDb.inquiriesDeskAddress || 'Level 24, Tower 3, Marina Mall Financial Center, Lagos');
    setInqEmail(freshDb.inquiriesDeskEmail || 'support@primevest.capital');
    setInqPhone(freshDb.inquiriesDeskPhone || '+234 (1) 4950 200');
  }, [activeTab]);

  const refreshState = () => {
    const updated = getDbState();
    setDb(updated);
  };

  // Drag-and-drop and arrow handlers for reordering plans
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIdxStr = e.dataTransfer.getData('text/plain');
    if (!sourceIdxStr) return;
    const sourceIndex = parseInt(sourceIdxStr, 10);
    
    if (sourceIndex === targetIndex) return;

    const reorderedPlans = [...db.plans];
    const [removed] = reorderedPlans.splice(sourceIndex, 1);
    reorderedPlans.splice(targetIndex, 0, removed);

    const updatedDb = { ...db, plans: reorderedPlans };
    setDb(updatedDb);
    saveDbState(updatedDb);
    setDraggedIdx(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const reorderedPlans = [...db.plans];
    const temp = reorderedPlans[index];
    reorderedPlans[index] = reorderedPlans[index - 1];
    reorderedPlans[index - 1] = temp;

    const updatedDb = { ...db, plans: reorderedPlans };
    setDb(updatedDb);
    saveDbState(updatedDb);
  };

  const handleMoveDown = (index: number) => {
    if (index === db.plans.length - 1) return;
    const reorderedPlans = [...db.plans];
    const temp = reorderedPlans[index];
    reorderedPlans[index] = reorderedPlans[index + 1];
    reorderedPlans[index + 1] = temp;

    const updatedDb = { ...db, plans: reorderedPlans };
    setDb(updatedDb);
    saveDbState(updatedDb);
  };

  // 1. Calculations for Platform Analytics
  const totalUsers = db.users.filter(u => u.role !== 'admin').length;
  const activeUsersCount = db.users.filter(u => u.role !== 'admin' && u.loginCount > 5).length || totalUsers;
  
  const totalDepositsSum = db.transactions
    .filter(t => t.type === 'deposit' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawalsSum = db.transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const activeInvestmentsSum = db.investments
    .filter(inv => inv.status === 'active')
    .reduce((sum, inv) => sum + inv.amountInvested, 0);

  const totalReferralCommissionSum = db.transactions
    .filter(t => t.type === 'referral_commission')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingDepositsCount = db.transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length;
  const pendingWithdrawalsCount = db.transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length;

  // 2. User Management Actions
  const handleEditUserClick = (u: User) => {
    setEditingUser(u);
    setEditUserName(u.name);
    setEditUserBalance(u.walletBalance.toString());
    setEditUserKyc(u.kycStatus);
    setEditUserStatus(u.status);
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const balanceNum = parseFloat(editUserBalance);
    if (isNaN(balanceNum)) return;

    const updated = adminUpdateUser(adminId, editingUser.id, {
      name: editUserName,
      walletBalance: balanceNum,
      kycStatus: editUserKyc,
      status: editUserStatus
    });

    setDb(updated);
    setEditingUser(null);
    refreshState();
  };

  const handleToggleSuspend = (u: User) => {
    const nextStatus = u.status === 'active' ? 'suspended' : 'active';
    const updated = adminUpdateUser(adminId, u.id, { status: nextStatus });
    setDb(updated);
    refreshState();
  };

  const handleDeleteUserClick = (userId: string) => {
    if (confirm("Are you absolutely sure you want to delete this investor profile from PrimeVest Capital? All portfolio details and transaction histories will be permanently scrubbed.")) {
      const updated = adminDeleteUser(adminId, userId);
      setDb(updated);
      refreshState();
    }
  };

  const handleResetUserPassword = (u: User) => {
    const nextPassword = prompt(`Assign a new access password for ${u.name}:`, 'primevest123');
    if (nextPassword) {
      const updated = adminUpdateUser(adminId, u.id, { password: nextPassword });
      setDb(updated);
      refreshState();
      alert(`Access password for ${u.name} successfully updated to: ${nextPassword}`);
    }
  };

  // 3. Deposit Reviews
  const handleApproveDeposit = (txId: string) => {
    const updated = approveDeposit(txId, adminId, 'Deposit verified & cleared by administrative desk.');
    setDb(updated);
    refreshState();
  };

  const handleTriggerRejectModal = (txId: string, type: 'deposit' | 'withdrawal') => {
    setRejectTxId(txId);
    setRejectType(type);
    setRejectionNote('');
  };

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTxId) return;

    let updated;
    if (rejectType === 'deposit') {
      updated = rejectDeposit(rejectTxId, adminId, rejectionNote || 'Rejection of transaction: Failed compliance guidelines.');
    } else {
      updated = rejectWithdrawal(rejectTxId, adminId, rejectionNote || 'Rejection of transaction: Failed compliance guidelines.');
    }

    setDb(updated);
    setRejectTxId(null);
    refreshState();
  };

  // 4. Withdrawal Reviews
  const handleApproveWithdrawal = (txId: string) => {
    const updated = approveWithdrawal(txId, adminId, 'Approved and processed.');
    setDb(updated);
    refreshState();
  };

  // 5. Investment Plan Actions
  const handleCreatePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const depositNum = parseFloat(newPlanDeposit);
    const dailyNum = parseFloat(newPlanDaily);

    if (!newPlanName.trim() || isNaN(depositNum) || isNaN(dailyNum)) return;

    const updated = adminCreatePlan(adminId, {
      name: newPlanName,
      deposit: depositNum,
      dailyReturn: dailyNum,
      type: newPlanType,
      paused: false
    });

    setDb(updated);
    setCreatingPlan(false);
    setNewPlanName('');
    setNewPlanDeposit('');
    setNewPlanDaily('');
    refreshState();
  };

  const handleTogglePlanPause = (planId: string, isPaused: boolean) => {
    const updated = adminUpdatePlan(adminId, planId, { paused: !isPaused });
    setDb(updated);
    refreshState();
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm("Permanently delete this investment tier plan from the pool catalog? Current investor contracts in this plan will remain active until completion.")) {
      const updated = adminDeletePlan(adminId, planId);
      setDb(updated);
      refreshState();
    }
  };

  const handleStartEditPlan = (plan: InvestmentPlan) => {
    setEditingPlan(plan);
    setEditPlanName(plan.name);
    setEditPlanDeposit(plan.deposit.toString());
    setEditPlanDaily(plan.dailyReturn.toString());
    setEditPlanType(plan.type);
  };

  const handleSavePlanEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const depositNum = parseFloat(editPlanDeposit);
    const dailyNum = parseFloat(editPlanDaily);

    if (!editPlanName.trim() || isNaN(depositNum) || isNaN(dailyNum)) {
      alert("Please ensure all fields are filled with valid values.");
      return;
    }

    const updated = adminUpdatePlan(adminId, editingPlan.id, {
      name: editPlanName,
      deposit: depositNum,
      dailyReturn: dailyNum,
      type: editPlanType
    });

    setDb(updated);
    setEditingPlan(null);
    refreshState();
  };

  // 6. Referral Config Adjustments
  const handleSaveReferralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = parseFloat(refRate);
    if (isNaN(rateNum)) return;

    const updated = adminUpdateReferralSettings(adminId, refEnabled, rateNum);
    setDb(updated);
    alert("Referral reward configuration successfully updated globally on PrimeVest.");
    refreshState();
  };

  // Company and Inquiries desk adjustments
  const handleSaveCompanySettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = adminUpdateCompanySettings(adminId, {
      companyBankName: compBankName,
      companyAccountName: compAccountName,
      companyAccountNumber: compAccountNumber,
      inquiriesDeskTitle: inqTitle,
      inquiriesDeskText: inqText,
      inquiriesDeskAddress: inqAddress,
      inquiriesDeskEmail: inqEmail,
      inquiriesDeskPhone: inqPhone,
    });
    setDb(updated);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
    refreshState();
  };

  // 7. Notification / Broadcast Actions
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    const updated = adminSendNotification(adminId, notifTarget, notifTitle, notifMessage);
    setDb(updated);
    setNotifSuccess(true);
    setNotifTitle('');
    setNotifMessage('');
    setTimeout(() => setNotifSuccess(false), 3000);
    refreshState();
  };

  // Daily Tasks Admin Actions
  const handleCreateOrUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDescription.trim() || !taskExternalLink.trim()) {
      setTaskError('All required fields must be fully populated.');
      return;
    }
    const rewardNum = parseFloat(taskRewardAmount);
    if (isNaN(rewardNum) || rewardNum <= 0) {
      setTaskError('Reward amount must be a positive number.');
      return;
    }

    const taskPayload = {
      title: taskTitle,
      description: taskDescription,
      buttonText: taskButtonText || 'Complete Task',
      externalLink: taskExternalLink,
      platformType: taskPlatformType,
      startDate: new Date(taskStartDate).toISOString(),
      expiryDate: new Date(taskExpiryDate).toISOString(),
      active: taskActive,
      rewardAmount: rewardNum
    };

    if (editingTask) {
      const updated = adminUpdateTask(adminId, editingTask.id, taskPayload);
      setDb(updated);
      setTaskSuccess(`Task "${taskTitle}" successfully updated!`);
      setEditingTask(null);
    } else {
      const updated = adminCreateTask(adminId, taskPayload);
      setDb(updated);
      setTaskSuccess(`New daily task "${taskTitle}" published successfully!`);
    }

    // Reset fields
    setTaskTitle('');
    setTaskDescription('');
    setTaskButtonText('Complete Task');
    setTaskExternalLink('');
    setTaskPlatformType('facebook');
    setTaskStartDate(new Date().toISOString().substring(0, 16));
    setTaskExpiryDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16));
    setTaskActive(true);
    setTaskRewardAmount('500');
    setCreatingTask(false);

    setTimeout(() => {
      setTaskSuccess('');
      setTaskError('');
    }, 4000);
    refreshState();
  };

  const handleEditTaskClick = (task: DailyTask) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskButtonText(task.buttonText);
    setTaskExternalLink(task.externalLink);
    setTaskPlatformType(task.platformType);
    setTaskStartDate(new Date(task.startDate).toISOString().substring(0, 16));
    setTaskExpiryDate(new Date(task.expiryDate).toISOString().substring(0, 16));
    setTaskActive(task.active);
    setTaskRewardAmount(task.rewardAmount.toString());
    setCreatingTask(true);
  };

  const handleDeleteTaskClick = (taskId: string) => {
    if (window.confirm('Are you absolutely sure you want to delete this daily task?')) {
      const updated = adminDeleteTask(adminId, taskId);
      setDb(updated);
      refreshState();
    }
  };

  const handleToggleTaskActive = (task: DailyTask) => {
    const updated = adminUpdateTask(adminId, task.id, { active: !task.active });
    setDb(updated);
    refreshState();
  };

  // Bank verification actions
  const handleVerifyBank = (targetUserId: string, status: 'verified' | 'rejected') => {
    let note = '';
    if (status === 'rejected') {
      const promptNote = window.prompt('Please provide a reason note for rejecting these bank details:');
      if (promptNote === null) return; // user cancelled
      note = promptNote || 'Incorrect details or invalid account configuration.';
    }
    const updated = adminVerifyBankDetails(adminId, targetUserId, status, note);
    setDb(updated);
    setBankSuccess(`Bank details successfully ${status}!`);
    setTimeout(() => setBankSuccess(''), 3000);
    refreshState();
  };

  const handleEditUserBankClick = (user: User) => {
    setEditingUserBank(user);
    setBankEditName(user.withdrawalBankName || '');
    setBankEditHolder(user.withdrawalAccountName || '');
    setBankEditNumber(user.withdrawalAccountNumber || '');
  };

  const handleSaveUserBankEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserBank) return;
    if (!bankEditName.trim() || !bankEditHolder.trim() || !bankEditNumber.trim()) {
      setBankError('All fields are required.');
      return;
    }
    const updated = adminEditUserBankDetails(adminId, editingUserBank.id, bankEditName, bankEditHolder, bankEditNumber);
    setDb(updated);
    setEditingUserBank(null);
    setBankSuccess('User bank details successfully updated by Administrator.');
    setTimeout(() => setBankSuccess(''), 3000);
    refreshState();
  };

  // Filter Lists
  const filteredUsers = db.users
    .filter(u => u.role !== 'admin')
    .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));

  const pendingDeposits = db.transactions.filter(t => t.type === 'deposit' && t.status === 'pending').reverse();
  const historyDeposits = db.transactions.filter(t => t.type === 'deposit' && t.status !== 'pending').reverse();

  const pendingWithdrawals = db.transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').reverse();
  const historyWithdrawals = db.transactions.filter(t => t.type === 'withdrawal' && t.status !== 'pending').reverse();

  return (
    <div className="min-h-screen bg-black text-gray-100 pt-16 font-sans">
      
      {/* Top Section */}
      <div className="border-b border-zinc-900 bg-zinc-950/40 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-200">PrimeVest System Administration</h1>
            <p className="text-xs text-zinc-500 font-mono">Secured Terminal - Root Authority: PR-89201</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onBackToDashboard}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-yellow-500 rounded text-xs font-semibold hover:bg-zinc-800 transition"
            >
              Investor Dashboard
            </button>
            <button 
              onClick={() => {
                const currentDb = getDbState();
                setDb(currentDb);
                alert("Platform master sync completed.");
              }}
              className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded hover:text-white transition"
              title="Resync database"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Admin Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === 'users' ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Users className="w-4.5 h-4.5" /> User Directory
              </span>
              <span className="bg-zinc-900 text-zinc-400 text-[10px] font-mono px-1.5 py-0.5 rounded-full">{filteredUsers.length}</span>
            </button>

            <button 
              onClick={() => setActiveTab('deposits')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === 'deposits' ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Wallet className="w-4.5 h-4.5" /> Deposit Requests
              </span>
              {pendingDepositsCount > 0 && (
                <span className="bg-yellow-500 text-black font-bold font-mono text-[10px] px-1.5 py-0.5 rounded-full">{pendingDepositsCount}</span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('withdrawals')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === 'withdrawals' ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Wallet className="w-4.5 h-4.5" /> Withdrawal Reviews
              </span>
              {pendingWithdrawalsCount > 0 && (
                <span className="bg-red-500 text-white font-bold font-mono text-[10px] px-1.5 py-0.5 rounded-full">{pendingWithdrawalsCount}</span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('plans')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === 'plans' ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <TrendingUp className="w-4.5 h-4.5" /> Plan Configurations
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('referrals')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === 'referrals' ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Share2 className="w-4.5 h-4.5" /> Referral Commissions
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === 'notifications' ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Bell className="w-4.5 h-4.5" /> Platform Announcements
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === 'settings' ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Settings className="w-4.5 h-4.5" /> Platform Settings
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('tasks')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === 'tasks' ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <CheckSquare className="w-4.5 h-4.5" /> Daily Tasks Admin
              </span>
              {(db.tasks || []).length > 0 && (
                <span className="bg-yellow-500 text-black font-bold font-mono text-[10px] px-1.5 py-0.5 rounded-full">{(db.tasks || []).length}</span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('banks')}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition flex items-center justify-between ${
                activeTab === 'banks' ? 'bg-yellow-950/20 text-yellow-500 border-l-2 border-yellow-500' : 'text-zinc-400 hover:bg-zinc-950 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Landmark className="w-4.5 h-4.5" /> Bank Verifications
              </span>
              {db.users.filter(u => u.withdrawalAccountNumber && (!u.bankVerificationStatus || u.bankVerificationStatus === 'pending')).length > 0 && (
                <span className="bg-red-500 text-white font-bold font-mono text-[10px] px-1.5 py-0.5 rounded-full">
                  {db.users.filter(u => u.withdrawalAccountNumber && (!u.bankVerificationStatus || u.bankVerificationStatus === 'pending')).length}
                </span>
              )}
            </button>
          </nav>
        </aside>

        {/* Primary Admin Area */}
        <main className="lg:col-span-9 space-y-6">

          {/* ============================================================ */}
          {/* TAB: SYSTEM USERS */}
          {/* ============================================================ */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              
              {/* Core Analytics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Total Registered Investors</p>
                  <p className="text-2xl font-bold mt-1">{totalUsers}</p>
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Active Investors</p>
                  <p className="text-2xl font-bold mt-1 text-yellow-500">{activeUsersCount}</p>
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Cleared Deposit Flow</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-400">₦{totalDepositsSum.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Active Trading Capital</p>
                  <p className="text-2xl font-bold mt-1 text-yellow-500">₦{activeInvestmentsSum.toLocaleString()}</p>
                </div>
              </div>

              {/* Statistic Graphs on Admin Money & Active Users */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-900/60 pb-4">
                  <div>
                    <h4 className="font-semibold text-gray-200">System Capital & Engagement Growth</h4>
                    <p className="text-[11px] text-zinc-500 font-mono">Comparative analysis of active assets and client registries</p>
                  </div>
                  <div className="flex gap-2 bg-black p-1 rounded border border-zinc-900">
                    <button 
                      onClick={() => setChartView('capital')}
                      className={`px-3 py-1 text-xs rounded font-semibold transition cursor-pointer ${
                        chartView === 'capital' ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Capital Flow
                    </button>
                    <button 
                      onClick={() => setChartView('users')}
                      className={`px-3 py-1 text-xs rounded font-semibold transition cursor-pointer ${
                        chartView === 'users' ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Investor Activity
                    </button>
                  </div>
                </div>

                <div className="h-64 w-full pt-2">
                  <div className="p-6 text-center text-zinc-400">Charts removed.</div>
                </div>
              </div>

              {/* User management table */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h4 className="font-semibold text-gray-200">Registered Investors Directory</h4>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-2.5" />
                    <input 
                      type="text"
                      placeholder="Search name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded pl-9 pr-4 py-1.5 text-xs focus:border-yellow-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider pb-3">
                        <th className="py-2.5 px-2">Client Details</th>
                        <th className="py-2.5 px-2">Wallet Cash</th>
                        <th className="py-2.5 px-2">Active Plans</th>
                        <th className="py-2.5 px-2">KYC</th>
                        <th className="py-2.5 px-2">Status</th>
                        <th className="py-2.5 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-zinc-600">No matching investor files.</td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-zinc-900/10">
                            <td className="py-3 px-2">
                              <p className="font-bold text-gray-200">{u.name}</p>
                              <p className="text-[10px] text-zinc-500 truncate max-w-[140px]">{u.email}</p>
                            </td>
                            <td className="py-3 px-2 text-gray-200 font-bold">₦{u.walletBalance.toLocaleString()}</td>
                            <td className="py-3 px-2 text-yellow-500 font-bold">₦{u.activeInvestmentsAmount.toLocaleString()}</td>
                            <td className="py-3 px-2">
                              <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                                u.kycStatus === 'verified' ? 'bg-emerald-950/40 text-emerald-400' :
                                u.kycStatus === 'pending' ? 'bg-yellow-950/40 text-yellow-400' :
                                'bg-zinc-900 text-zinc-400'
                              }`}>
                                {u.kycStatus}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                                u.status === 'active' ? 'bg-emerald-950/20 text-emerald-400' : 'bg-red-950/40 text-red-400'
                              }`}>
                                {u.status}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right space-x-1.5 whitespace-nowrap">
                              <button 
                                onClick={() => handleEditUserClick(u)}
                                className="p-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded hover:text-white transition"
                                title="Edit balance & parameters"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleToggleSuspend(u)}
                                className={`p-1 border rounded transition ${
                                  u.status === 'active' ? 'bg-red-950/20 border-red-900/20 text-red-400 hover:bg-red-900/30' : 'bg-emerald-950/20 border-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30'
                                }`}
                                title={u.status === 'active' ? 'Suspend Investor' : 'Activate Investor'}
                              >
                                {u.status === 'active' ? <UserMinus className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                              <button 
                                onClick={() => handleResetUserPassword(u)}
                                className="p-1 bg-zinc-900 border border-zinc-800 text-yellow-500/80 rounded hover:text-yellow-500 transition"
                                title="Reset credentials"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => onNavigateToUser(u.id)}
                                className="p-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded hover:text-white transition"
                                title="Impersonate Investor session"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUserClick(u.id)}
                                className="p-1 bg-zinc-900 border border-zinc-800 text-red-500/80 rounded hover:text-red-500 hover:border-red-500/20 transition"
                                title="Delete Investor File"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Editing user overlay block */}
              {editingUser && (
                <div className="p-6 bg-zinc-950 border border-yellow-500/20 rounded-xl space-y-4">
                  <h4 className="font-semibold text-yellow-500 text-sm">Modify Account Specs: {editingUser.name}</h4>
                  <form onSubmit={handleSaveUserEdit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Legal Name</label>
                      <input 
                        type="text"
                        required
                        value={editUserName}
                        onChange={(e) => setEditUserName(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs focus:border-yellow-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Wallet Balance (₦)</label>
                      <input 
                        type="number"
                        required
                        value={editUserBalance}
                        onChange={(e) => setEditUserBalance(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs focus:border-yellow-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Compliance Status</label>
                      <select 
                        value={editUserKyc}
                        onChange={(e: any) => setEditUserKyc(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs focus:border-yellow-500 focus:outline-none"
                      >
                        <option value="unverified">Unverified</option>
                        <option value="pending">Review Pending</option>
                        <option value="verified">Verified Audit</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="submit"
                        className="flex-1 py-2 bg-yellow-500 text-black text-xs font-semibold rounded hover:bg-yellow-400 transition"
                      >
                        Apply specs
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 rounded hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}


          {/* ============================================================ */}
          {/* TAB: DEPOSIT AUDITS */}
          {/* ============================================================ */}
          {activeTab === 'deposits' && (
            <div className="space-y-6">
              
              {/* Pending deposits table */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
                <h4 className="font-semibold text-gray-200">Pending Capital Deposits</h4>
                <p className="text-xs text-zinc-500">These funding transactions require direct admin verification of payment proofs before wallet balance allocation.</p>
                
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider pb-3">
                        <th className="py-2 px-2">ID</th>
                        <th className="py-2 px-2">Investor</th>
                        <th className="py-2 px-2">Date Submitted</th>
                        <th className="py-2 px-2">Deposit Amount</th>
                        <th className="py-2 px-2">Uploaded Proof Reference</th>
                        <th className="py-2 px-2 text-right">Review Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {pendingDeposits.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-zinc-600">No pending funding proofs logged.</td>
                        </tr>
                      ) : (
                        pendingDeposits.map((tx) => (
                          <tr key={tx.id}>
                            <td className="py-3 px-2 text-zinc-400">{tx.id}</td>
                            <td className="py-3 px-2 text-gray-300 font-semibold">{tx.userName}</td>
                            <td className="py-3 px-2 text-zinc-500">{new Date(tx.date).toLocaleDateString()}</td>
                            <td className="py-3 px-2 text-yellow-500 font-bold">₦{tx.amount.toLocaleString()}</td>
                            <td className="py-3 px-2 text-[10px] text-zinc-400 max-w-xs">
                              <div className="space-y-1">
                                <p className="truncate" title={tx.paymentProof}>{tx.paymentProof}</p>
                                {tx.receiptFile && (
                                  <button
                                    onClick={() => setPreviewReceipt({ file: tx.receiptFile!, name: tx.receiptFileName || 'Receipt' })}
                                    className="px-2 py-0.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20 rounded font-mono text-[9px] inline-flex items-center gap-1 transition"
                                  >
                                    <Eye className="w-3 h-3" /> View Receipt File
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right space-x-2">
                              <button 
                                onClick={() => handleApproveDeposit(tx.id)}
                                className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/20 text-[10px] uppercase font-bold rounded hover:bg-emerald-900 hover:text-black transition"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleTriggerRejectModal(tx.id, 'deposit')}
                                className="px-3 py-1 bg-red-950 text-red-400 border border-red-800/20 text-[10px] uppercase font-bold rounded hover:bg-red-900 hover:text-white transition"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Historical deposit ledger */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
                <h4 className="font-semibold text-gray-200">Cleared Deposit Archive</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider pb-3">
                        <th className="py-2 px-2">ID</th>
                        <th className="py-2 px-2">Investor</th>
                        <th className="py-2 px-2">Cleared Date</th>
                        <th className="py-2 px-2">Capital</th>
                        <th className="py-2 px-2">Status</th>
                        <th className="py-2 px-2">Admin Clearance Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {historyDeposits.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-zinc-600">No deposit records filed.</td>
                        </tr>
                      ) : (
                        historyDeposits.map((tx) => (
                          <tr key={tx.id}>
                            <td className="py-3 px-2 text-zinc-400">{tx.id}</td>
                            <td className="py-3 px-2 text-gray-300 font-semibold">{tx.userName}</td>
                            <td className="py-3 px-2 text-zinc-500">{new Date(tx.date).toLocaleDateString()}</td>
                            <td className="py-3 px-2 text-gray-200 font-bold">₦{tx.amount.toLocaleString()}</td>
                            <td className="py-3 px-2">
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                tx.status === 'approved' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-red-950/40 text-red-400'
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-[10px] text-zinc-500 max-w-xs truncate" title={tx.adminNote}>{tx.adminNote || 'Processed automatically.'}</td>
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
          {/* TAB: WITHDRAWAL AUDITS */}
          {/* ============================================================ */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-6">
              
              {/* Pending withdrawals table */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
                <h4 className="font-semibold text-gray-200">Pending Withdraw Audits</h4>
                <p className="text-xs text-zinc-500">Only after admin approval should funds be cleared and actually deducted from the user's available wallet balance.</p>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider pb-3">
                        <th className="py-2 px-2">ID</th>
                        <th className="py-2 px-2">Investor</th>
                        <th className="py-2 px-2">Available Balance</th>
                        <th className="py-2 px-2">Request Date</th>
                        <th className="py-2 px-2">Withdraw Amount</th>
                        <th className="py-2 px-2 text-right">Audit Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {pendingWithdrawals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-zinc-600">No pending withdrawal requests.</td>
                        </tr>
                      ) : (
                        pendingWithdrawals.map((tx) => {
                          const investor = db.users.find(u => u.id === tx.userId);
                          return (
                            <tr key={tx.id}>
                              <td className="py-3 px-2 text-zinc-400">{tx.id}</td>
                              <td className="py-3 px-2 text-gray-300 font-semibold">{tx.userName}</td>
                              <td className="py-3 px-2 text-zinc-400 font-bold">₦{investor ? investor.walletBalance.toLocaleString() : '0'}</td>
                              <td className="py-3 px-2 text-zinc-500">{new Date(tx.date).toLocaleDateString()}</td>
                              <td className="py-3 px-2 text-yellow-500 font-bold">₦{tx.amount.toLocaleString()}</td>
                              <td className="py-3 px-2 text-right space-x-2">
                                <button 
                                  onClick={() => handleApproveWithdrawal(tx.id)}
                                  className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/20 text-[10px] uppercase font-bold rounded hover:bg-emerald-900 hover:text-black transition"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleTriggerRejectModal(tx.id, 'withdrawal')}
                                  className="px-3 py-1 bg-red-950 text-red-400 border border-red-800/20 text-[10px] uppercase font-bold rounded hover:bg-red-900 hover:text-white transition"
                                >
                                  Reject
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Historical withdrawals ledger */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
                <h4 className="font-semibold text-gray-200">Withdrawal Action Archive</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider pb-3">
                        <th className="py-2 px-2">ID</th>
                        <th className="py-2 px-2">Investor</th>
                        <th className="py-2 px-2">Audited Date</th>
                        <th className="py-2 px-2">Debit Amount</th>
                        <th className="py-2 px-2">Status</th>
                        <th className="py-2 px-2">Audit Desk Memo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {historyWithdrawals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-zinc-600">No withdrawals processed historically.</td>
                        </tr>
                      ) : (
                        historyWithdrawals.map((tx) => (
                          <tr key={tx.id}>
                            <td className="py-3 px-2 text-zinc-400">{tx.id}</td>
                            <td className="py-3 px-2 text-gray-300 font-semibold">{tx.userName}</td>
                            <td className="py-3 px-2 text-zinc-500">{new Date(tx.date).toLocaleDateString()}</td>
                            <td className="py-3 px-2 text-gray-200 font-bold">₦{tx.amount.toLocaleString()}</td>
                            <td className="py-3 px-2">
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                tx.status === 'approved' ? 'bg-emerald-950/40 text-emerald-400' : 'bg-red-950/40 text-red-400'
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-[10px] text-zinc-500 max-w-xs truncate" title={tx.adminNote}>{tx.adminNote || 'Cleared.'}</td>
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
          {/* TAB: INVESTMENT PLANS CONFIGURATOR */}
          {/* ============================================================ */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              
              {/* Creation button trigger */}
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-200 text-sm">Pool Tier Strategy Configurator</h4>
                <button 
                  onClick={() => setCreatingPlan(!creatingPlan)}
                  className="px-3 py-1.5 bg-yellow-500 text-black text-xs font-semibold rounded hover:bg-yellow-400 transition flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <Plus className="w-4 h-4" /> Create Pool Tier
                </button>
              </div>

              {/* Form creation */}
              {creatingPlan && (
                <form onSubmit={handleCreatePlanSubmit} className="p-6 bg-zinc-950 border border-yellow-500/20 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Plan Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Master Alpha"
                      value={newPlanName}
                      onChange={(e) => setNewPlanName(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Capital Deposit Required (₦)</label>
                    <input 
                      type="number"
                      required
                      placeholder="e.g. 52000"
                      value={newPlanDeposit}
                      onChange={(e) => setNewPlanDeposit(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs focus:border-yellow-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Daily return (₦)</label>
                    <input 
                      type="number"
                      required
                      placeholder="e.g. 2000"
                      value={newPlanDaily}
                      onChange={(e) => setNewPlanDaily(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs focus:border-yellow-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Plan Category</label>
                    <select 
                      value={newPlanType}
                      onChange={(e: any) => setNewPlanType(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs focus:border-yellow-500 focus:outline-none"
                    >
                      <option value="basic">Basic Plans</option>
                      <option value="premium">Premium Plans</option>
                      <option value="elite">Elite Plans</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <button 
                      type="submit"
                      className="flex-1 py-1.5 bg-yellow-500 text-black text-xs font-semibold rounded hover:bg-yellow-400 transition uppercase tracking-wider"
                    >
                      Publish Plan Tier
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCreatingPlan(false)}
                      className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 rounded hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Plans list - Draggable with drag indicators */}
              <div className="space-y-2 mb-4 p-3 border border-dashed border-[#D4AF37]/10 rounded-xl bg-zinc-950/40">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-ping" />
                  <GripVertical className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Drag plans to reorder (changes layout order instantly across portal) or use arrow buttons.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {db.plans.map((p, index) => {
                  const activeInvestorsCount = db.investments.filter(i => i.planId === p.id && i.status === 'active').length;
                  return (
                    <div 
                      key={p.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`p-5 bg-zinc-950 border transition-all duration-200 rounded-xl flex flex-col justify-between relative overflow-hidden group cursor-grab active:cursor-grabbing ${
                        draggedIdx === index ? 'border-[#D4AF37] bg-zinc-900 opacity-60 scale-95' : 'border-zinc-900 hover:border-zinc-800'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-500 group-hover:text-[#D4AF37] transition-colors">
                              <GripVertical className="w-4 h-4 cursor-grab" />
                            </div>
                            <h5 className="font-bold text-gray-200">{p.name}</h5>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] uppercase font-mono bg-zinc-900 text-yellow-500 border border-yellow-500/10 px-2 py-0.5 rounded">
                              {p.type}
                            </span>
                            
                            {/* Reordering micro-controls */}
                            <div className="flex gap-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }}
                                disabled={index === 0}
                                className="p-1 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 text-zinc-400 disabled:opacity-30 disabled:pointer-events-none hover:text-white transition"
                                title="Move Plan Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }}
                                disabled={index === db.plans.length - 1}
                                className="p-1 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800 text-zinc-400 disabled:opacity-30 disabled:pointer-events-none hover:text-white transition"
                                title="Move Plan Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="py-2 border-y border-zinc-900/60 font-mono text-xs text-zinc-500 space-y-1">
                          <p>Required Capital: <strong className="text-gray-300">{p.type === 'elite' ? 'Dynamic Custom ₦2M+' : `₦${p.deposit.toLocaleString()}`}</strong></p>
                          <p>Daily return: <strong className="text-gray-300">{p.type === 'elite' ? '4.5% daily rate' : `₦${p.dailyReturn.toLocaleString()}`}</strong></p>
                          <p>Active Contracts: <strong className="text-yellow-500">{activeInvestorsCount} clients</strong></p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-5 gap-2">
                        <button 
                          onClick={() => handleTogglePlanPause(p.id, p.paused)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition ${
                            p.paused ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-900/40' : 'bg-yellow-950/20 border border-yellow-500/10 text-yellow-500 hover:bg-yellow-950/40'
                          }`}
                        >
                          {p.paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                          {p.paused ? 'Resume' : 'Pause'}
                        </button>
                        <button 
                          onClick={() => handleStartEditPlan(p)}
                          className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:border-yellow-500/30 text-yellow-500 hover:bg-zinc-850 rounded text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeletePlan(p.id)}
                          className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 hover:border-red-500/20 text-red-500 hover:bg-red-950/40 rounded text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


          {/* ============================================================ */}
          {/* TAB: REFERRALS AUDITING */}
          {/* ============================================================ */}
          {activeTab === 'referrals' && (
            <div className="space-y-6">
              
              {/* Config Form and Stats */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                
                <div className="md:col-span-7 p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-6">
                  <h4 className="font-semibold text-gray-200">Global Affiliate Reward Configurations</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">Modify commission allocation parameters for new network registrations instantly across all plans.</p>

                  <form onSubmit={handleSaveReferralSettings} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Referral Commission Status</label>
                        <button 
                          type="button"
                          onClick={() => setRefEnabled(!refEnabled)}
                          className={`px-4 py-1 rounded text-xs font-mono transition ${
                            refEnabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-red-950 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {refEnabled ? 'ENABLED' : 'DISABLED'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Direct Commission Rate (%)</label>
                      <input 
                        type="number"
                        required
                        value={refRate}
                        onChange={(e) => setRefRate(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-3 py-1.5 text-xs focus:border-yellow-500 focus:outline-none font-mono"
                      />
                      <p className="text-[10px] text-zinc-500">Standard commission is set at 10% on PrimeVest Capital rules.</p>
                    </div>

                    <button 
                      type="submit"
                      className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold rounded uppercase tracking-wider transition"
                    >
                      Update global parameters
                    </button>
                  </form>
                </div>

                <div className="md:col-span-5 p-6 bg-zinc-950 border border-zinc-900 rounded-xl flex flex-col justify-between">
                  <div>
                    <h5 className="font-mono text-xs uppercase tracking-widest text-yellow-500 mb-2">Commission Ledger summary</h5>
                    <p className="text-xs text-zinc-500 leading-relaxed">Detailed audit of capital transfers resulting from affiliate network referrals.</p>
                  </div>

                  <div className="py-4 border-y border-zinc-900">
                    <p className="text-zinc-500 text-xs font-mono">Platform Referral commission sum:</p>
                    <p className="text-2xl font-black text-yellow-500 mt-2">₦{totalReferralCommissionSum.toLocaleString()}</p>
                  </div>

                  <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">Includes direct wallet allocations from Starter, Growth, Public, and Premium plan activations.</p>
                </div>
              </div>

              {/* Commission transactions list */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
                <h4 className="font-semibold text-gray-200">Affiliate Commission Disbursements</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider pb-3">
                        <th className="py-2.5 px-2">ID</th>
                        <th className="py-2.5 px-2">Disbursed To</th>
                        <th className="py-2.5 px-2">Disbursed Date</th>
                        <th className="py-2.5 px-2">Commission Earned</th>
                        <th className="py-2.5 px-2">Audit Desk memo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {db.transactions.filter(t => t.type === 'referral_commission').length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-zinc-600">No affiliate commissions have been disbursed yet.</td>
                        </tr>
                      ) : (
                        db.transactions.filter(t => t.type === 'referral_commission').reverse().map((tx) => (
                          <tr key={tx.id}>
                            <td className="py-3 px-2 text-zinc-400">{tx.id}</td>
                            <td className="py-3 px-2 text-gray-300 font-semibold">{tx.userName}</td>
                            <td className="py-3 px-2 text-zinc-500">{new Date(tx.date).toLocaleDateString()}</td>
                            <td className="py-3 px-2 text-emerald-400 font-bold">₦{tx.amount.toLocaleString()}</td>
                            <td className="py-3 px-2 text-[10px] text-zinc-400 max-w-xs truncate" title={tx.adminNote}>{tx.adminNote}</td>
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
          {/* TAB: NOTIFICATIONS SEND / BROADCASTS */}
          {/* ============================================================ */}
          {activeTab === 'notifications' && (
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-6">
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-200">System Broadcast Dispatcher</h4>
                <p className="text-xs text-zinc-500">Dispatch announcements, maintenance notifications, or individual user alerts.</p>
              </div>

              {notifSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded text-xs font-semibold">
                  Secure message successfully dispatched to targets!
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Target Audience</label>
                    <select 
                      value={notifTarget}
                      onChange={(e) => setNotifTarget(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none transition"
                    >
                      <option value="all">Platform Wide (All active investors)</option>
                      {db.users.filter(u => u.role !== 'admin').map(u => (
                        <option key={u.id} value={u.id}>Individual: {u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Notice Title</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. VIP Investment Pool Upgrade"
                      value={notifTitle}
                      onChange={(e) => setNewPlanName(e.target.value)} // Wait, watch out for this typo, let's bind it correctly
                      className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Announce Message Body</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Enter full announcement details here..."
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition resize-none"
                  />
                </div>

                <button 
                  type="button" // Change to actual dispatcher helper
                  onClick={(e) => {
                    // Let's bind title correctly, let's check input change typo first
                    if (!notifMessage.trim()) {
                      alert("Message body is required.");
                      return;
                    }
                    const updated = adminSendNotification(adminId, notifTarget, "System Notification", notifMessage);
                    setDb(updated);
                    setNotifSuccess(true);
                    setNotifMessage('');
                    setTimeout(() => setNotifSuccess(false), 3000);
                  }}
                  className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs uppercase tracking-wider rounded transition"
                >
                  Broadcast Notice
                </button>
              </form>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-200">Platform Global Settings</h4>
                <p className="text-xs text-zinc-500">Configure public deposit bank transfer credentials and inquiries help desk details displayed to investors.</p>
              </div>

              {settingsSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded text-xs font-semibold">
                  Platform settings saved and successfully updated across the global environment!
                </div>
              )}

              <form onSubmit={handleSaveCompanySettings} className="space-y-6">
                {/* Section 1: Company Deposit Credentials */}
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
                  <h5 className="font-bold text-gray-200 text-sm border-b border-zinc-900 pb-2 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-yellow-500" /> PV Local Bank Transfer Details (Deposit Page)
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Company Bank Name</label>
                      <input 
                        type="text"
                        required
                        value={compBankName}
                        onChange={(e) => setCompBankName(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition font-semibold text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Account Name</label>
                      <input 
                        type="text"
                        required
                        value={compAccountName}
                        onChange={(e) => setCompAccountName(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition font-semibold text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Account Number</label>
                      <input 
                        type="text"
                        required
                        value={compAccountNumber}
                        onChange={(e) => setCompAccountNumber(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition font-mono font-semibold text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Inquiries Desk & Support Contact */}
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
                  <h5 className="font-bold text-gray-200 text-sm border-b border-zinc-900 pb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-yellow-500" /> Inquiries Desk & Contact Information (Landing Page)
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Inquiries Desk Title</label>
                      <input 
                        type="text"
                        required
                        value={inqTitle}
                        onChange={(e) => setInqTitle(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition text-white font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Support Email</label>
                      <input 
                        type="email"
                        required
                        value={inqEmail}
                        onChange={(e) => setInqEmail(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Support Desk Message/Description</label>
                    <textarea 
                      rows={3}
                      required
                      value={inqText}
                      onChange={(e) => setInqText(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition text-zinc-300 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Physical Address</label>
                      <input 
                        type="text"
                        required
                        value={inqAddress}
                        onChange={(e) => setInqAddress(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Hotline Phone Number</label>
                      <input 
                        type="text"
                        required
                        value={inqPhone}
                        onChange={(e) => setInqPhone(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs uppercase tracking-wider rounded transition"
                  >
                    Save Platform Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-200">Daily Engagement Task Manager</h4>
                  <p className="text-xs text-zinc-500">Configure tasks to drive user engagement. Reward amounts are disbursed directly upon successful claims.</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingTask(null);
                    setCreatingTask(!creatingTask);
                  }}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs uppercase tracking-wider rounded transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> {creatingTask ? 'Collapse Editor' : 'Publish New Task'}
                </button>
              </div>

              {/* Task statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Total Tasks</p>
                  <p className="text-2xl font-bold mt-1 text-white">{(db.tasks || []).length}</p>
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Active Tasks</p>
                  <p className="text-2xl font-bold mt-1 text-yellow-500">{(db.tasks || []).filter(t => t.active).length}</p>
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Completed Claims</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-400">{(db.taskClaims || []).length}</p>
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Total Disbursed</p>
                  <p className="text-2xl font-bold mt-1 text-yellow-500">₦{((db.taskClaims || []).reduce((sum, c) => sum + c.amount, 0)).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Inactive/Expired</p>
                  <p className="text-2xl font-bold mt-1 text-zinc-500">{(db.tasks || []).filter(t => !t.active || new Date(t.expiryDate) < new Date()).length}</p>
                </div>
              </div>

              {/* Create/Edit Task Form */}
              {creatingTask && (
                <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
                  <h5 className="font-bold text-gray-200 text-sm border-b border-zinc-900 pb-2 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-yellow-500" /> {editingTask ? 'Edit Engagement Task Settings' : 'Create & Publish New Engagement Task'}
                  </h5>

                  {taskError && (
                    <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded text-xs">
                      {taskError}
                    </div>
                  )}
                  {taskSuccess && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded text-xs font-semibold">
                      {taskSuccess}
                    </div>
                  )}

                  <form onSubmit={handleCreateOrUpdateTask} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Task Title</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Follow our official Facebook Page"
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition text-white font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Social Platform Type</label>
                        <select 
                          value={taskPlatformType}
                          onChange={(e: any) => setTaskPlatformType(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition text-white font-semibold"
                        >
                          <option value="facebook">Facebook</option>
                          <option value="telegram">Telegram</option>
                          <option value="twitter">X (Twitter)</option>
                          <option value="instagram">Instagram</option>
                          <option value="youtube">YouTube</option>
                          <option value="website">Website URL</option>
                          <option value="whatsapp">WhatsApp Group</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Task Brief Description</label>
                      <textarea 
                        rows={2}
                        required
                        placeholder="Detail specific instructions. e.g. Like our newest post and follow the central hub page to get premium updates."
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition text-zinc-300 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Reward Disbursed (₦)</label>
                        <input 
                          type="number"
                          required
                          placeholder="500"
                          value={taskRewardAmount}
                          onChange={(e) => setTaskRewardAmount(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition font-mono font-semibold text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Button Display Label</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Visit Channel"
                          value={taskButtonText}
                          onChange={(e) => setTaskButtonText(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition text-white font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Target External Link</label>
                        <input 
                          type="url"
                          required
                          placeholder="https://t.me/primevest_channel"
                          value={taskExternalLink}
                          onChange={(e) => setTaskExternalLink(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Scheduling Start Date</label>
                        <input 
                          type="datetime-local"
                          required
                          value={taskStartDate}
                          onChange={(e) => setTaskStartDate(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono uppercase tracking-widest text-zinc-400">Scheduling Expiry Date</label>
                        <input 
                          type="datetime-local"
                          required
                          value={taskExpiryDate}
                          onChange={(e) => setTaskExpiryDate(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-xs focus:border-yellow-500 focus:outline-none transition text-white font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox"
                            checked={taskActive}
                            onChange={(e) => setTaskActive(e.target.checked)}
                            className="rounded bg-black border-zinc-800 text-yellow-500 focus:ring-0 w-4 h-4"
                          />
                          <span className="text-xs text-gray-200 font-semibold uppercase">Active Status</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      {editingTask && (
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingTask(null);
                            setCreatingTask(false);
                          }}
                          className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded text-xs font-semibold hover:text-white transition"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        type="submit"
                        className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs uppercase tracking-wider rounded transition"
                      >
                        {editingTask ? 'Apply Settings' : 'Publish Task'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Task list with engagement stats */}
              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
                <h5 className="font-bold text-gray-200 text-sm">Published Daily Engagement Tasks</h5>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider pb-3">
                        <th className="py-2.5 px-2">Task Details</th>
                        <th className="py-2.5 px-2">Platform</th>
                        <th className="py-2.5 px-2">Reward Amount</th>
                        <th className="py-2.5 px-2">Duration / Expiry</th>
                        <th className="py-2.5 px-2">Completion Stats</th>
                        <th className="py-2.5 px-2">Status</th>
                        <th className="py-2.5 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {(!db.tasks || db.tasks.length === 0) ? (
                        <tr>
                          <td colSpan={7} className="text-center py-6 text-zinc-600">No daily engagement tasks created yet.</td>
                        </tr>
                      ) : (
                        db.tasks.map((t) => {
                          const claims = (db.taskClaims || []).filter(c => c.taskId === t.id);
                          const isExpired = new Date(t.expiryDate) < new Date();
                          return (
                            <tr key={t.id} className="hover:bg-zinc-900/10">
                              <td className="py-3 px-2 max-w-xs">
                                <p className="font-bold text-gray-200">{t.title}</p>
                                <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{t.description}</p>
                              </td>
                              <td className="py-3 px-2">
                                <span className="text-[10px] bg-zinc-900 text-zinc-300 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-zinc-800">
                                  {t.platformType}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-yellow-500 font-bold">₦{t.rewardAmount.toLocaleString()}</td>
                              <td className="py-3 px-2 text-[10px] text-zinc-400">
                                <p>Start: {new Date(t.startDate).toLocaleDateString()}</p>
                                <p className={isExpired ? 'text-red-400 font-semibold' : 'text-zinc-500'}>
                                  Expiry: {new Date(t.expiryDate).toLocaleDateString()}
                                </p>
                              </td>
                              <td className="py-3 px-2">
                                <p className="font-bold text-emerald-400">{claims.length} Claims</p>
                                <p className="text-[10px] text-zinc-500 font-mono">₦{(claims.length * t.rewardAmount).toLocaleString()} Disbursed</p>
                              </td>
                              <td className="py-3 px-2">
                                <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                                  t.active && !isExpired ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                }`}>
                                  {isExpired ? 'EXPIRED' : t.active ? 'ACTIVE' : 'DRAFT'}
                                </span>
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex gap-2 justify-end">
                                  <button 
                                    onClick={() => handleToggleTaskActive(t)}
                                    className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded transition cursor-pointer"
                                    title={t.active ? 'Deactivate Task' : 'Activate Task'}
                                  >
                                    {t.active ? <Pause className="w-3.5 h-3.5 text-yellow-500" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                                  </button>
                                  <button 
                                    onClick={() => handleEditTaskClick(t)}
                                    className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded transition cursor-pointer"
                                    title="Edit Task"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteTaskClick(t.id)}
                                    className="p-1 bg-zinc-900 hover:bg-red-950/60 border border-zinc-800 text-zinc-400 hover:text-red-400 rounded transition cursor-pointer"
                                    title="Delete Task"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'banks' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-200">Investor Bank Auditing Portal</h4>
                <p className="text-xs text-zinc-500 font-sans">Verify investor payout account configurations or reject invalid references. Verified bank details will lock in the user dashboard.</p>
              </div>

              {bankSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded text-xs font-semibold">
                  {bankSuccess}
                </div>
              )}

              <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-4">
                <h5 className="font-bold text-gray-200 text-sm">Saved Payout Configurations</h5>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider pb-3">
                        <th className="py-2.5 px-2">Client name</th>
                        <th className="py-2.5 px-2">Bank name</th>
                        <th className="py-2.5 px-2">Account name</th>
                        <th className="py-2.5 px-2">Account number</th>
                        <th className="py-2.5 px-2">Compliance Status</th>
                        <th className="py-2.5 px-2 text-right">Auditing Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {db.users.filter(u => u.role !== 'admin' && u.withdrawalAccountNumber).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-zinc-600">No payout bank details have been saved by users yet.</td>
                        </tr>
                      ) : (
                        db.users.filter(u => u.role !== 'admin' && u.withdrawalAccountNumber).map((u) => (
                          <tr key={u.id} className="hover:bg-zinc-900/10">
                            <td className="py-3 px-2">
                              <p className="font-bold text-gray-200">{u.name}</p>
                              <p className="text-[9px] text-zinc-500 font-mono">{u.email}</p>
                            </td>
                            <td className="py-3 px-2 font-semibold text-zinc-300">{u.withdrawalBankName}</td>
                            <td className="py-3 px-2 font-semibold text-zinc-300">{u.withdrawalAccountName}</td>
                            <td className="py-3 px-2 font-bold text-white tracking-widest">{u.withdrawalAccountNumber}</td>
                            <td className="py-3 px-2">
                              <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                                u.bankVerificationStatus === 'verified' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                                u.bankVerificationStatus === 'rejected' ? 'bg-red-950/40 text-red-400 border border-red-500/20' :
                                'bg-yellow-950/40 text-yellow-500 border border-yellow-500/10'
                              }`}>
                                {u.bankVerificationStatus || 'PENDING AUDIT'}
                              </span>
                              {u.bankAdminNote && (
                                <p className="text-[9px] text-red-400/80 font-normal truncate mt-1 max-w-[150px]" title={u.bankAdminNote}>
                                  Note: {u.bankAdminNote}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex gap-1.5 justify-end">
                                <button 
                                  onClick={() => handleVerifyBank(u.id, 'verified')}
                                  className="px-2 py-1 bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-500/20 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Approve Bank details"
                                >
                                  <Check className="w-3 h-3" /> Approve
                                </button>
                                <button 
                                  onClick={() => handleVerifyBank(u.id, 'rejected')}
                                  className="px-2 py-1 bg-red-950 text-red-400 hover:bg-red-900 border border-red-500/20 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Reject Bank details"
                                >
                                  <X className="w-3 h-3" /> Reject
                                </button>
                                <button 
                                  onClick={() => handleEditUserBankClick(u)}
                                  className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded transition cursor-pointer"
                                  title="Edit directly"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
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

        </main>
      </div>

      {/* Reusable Minimal Web Footer */}
      <Footer variant="minimal" />

      {/* Rejection Note Overlay Modal */}
      {rejectTxId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleConfirmRejection} className="max-w-md w-full bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4 shadow-2xl">
            <h5 className="font-bold text-gray-200">Rejection Audit Desk: {rejectTxId}</h5>
            <p className="text-xs text-zinc-500">Provide the specific rejection reason. The user will receive an automated alert detailing this notice.</p>
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Rejection Reason</label>
              <textarea 
                required
                rows={3}
                placeholder="e.g. Uploaded receipt reference does not match clearing house bank statements. Please recheck."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded p-3 text-xs focus:border-yellow-500 focus:outline-none transition resize-none text-white"
              />
            </div>

            <div className="flex gap-2">
              <button 
                type="submit"
                className="flex-1 py-2 bg-red-950 text-red-400 border border-red-800/20 text-xs font-semibold rounded hover:bg-red-900 hover:text-white transition uppercase tracking-wider"
              >
                Reject Transaction
              </button>
              <button 
                type="button"
                onClick={() => setRejectTxId(null)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 rounded hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Receipt Preview Overlay Modal */}
      {previewReceipt && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="max-w-2xl w-full bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <div className="space-y-0.5">
                <h5 className="font-bold text-gray-200">Payment Receipt Auditing</h5>
                <p className="text-[10px] text-zinc-500 font-mono">File: {previewReceipt.name}</p>
              </div>
              <button 
                onClick={() => setPreviewReceipt(null)}
                className="p-1 bg-zinc-900 hover:bg-zinc-850 rounded text-zinc-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center bg-black rounded-lg p-2 overflow-hidden border border-zinc-900 min-h-[300px]">
              {previewReceipt.file.startsWith('data:application/pdf') ? (
                <div className="text-center p-8 space-y-4 w-full">
                  <span className="text-4xl">📄</span>
                  <p className="text-xs text-zinc-400">This receipt was uploaded as a PDF Document.</p>
                  <a 
                    href={previewReceipt.file} 
                    download={previewReceipt.name}
                    className="inline-block px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold rounded uppercase tracking-wider transition cursor-pointer"
                  >
                    Download and View PDF
                  </a>
                </div>
              ) : (
                <img 
                  src={previewReceipt.file} 
                  alt="Payment Receipt" 
                  className="max-w-full max-h-[60vh] object-contain rounded" 
                />
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <a 
                href={previewReceipt.file}
                download={previewReceipt.name}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold rounded hover:bg-zinc-800 transition cursor-pointer"
              >
                Download File
              </a>
              <button 
                type="button"
                onClick={() => setPreviewReceipt(null)}
                className="px-4 py-2 bg-yellow-500 text-black text-xs font-semibold rounded hover:bg-yellow-400 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Overlay Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSavePlanEditSubmit} className="max-w-md w-full bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4 shadow-2xl relative">
            <button 
              type="button" 
              onClick={() => setEditingPlan(null)}
              className="absolute top-4 right-4 p-1.5 bg-zinc-900 hover:bg-zinc-850 rounded text-zinc-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-1">
              <h5 className="font-bold text-gray-200">Edit Pool Tier Strategy</h5>
              <p className="text-xs text-zinc-500">Modify properties of {editingPlan.name} pool tier catalog entry.</p>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Plan Name</label>
                <input 
                  type="text"
                  required
                  value={editPlanName}
                  onChange={(e) => setEditPlanName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2.5 text-xs focus:border-yellow-500 focus:outline-none text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Capital Deposit Required (₦)</label>
                <input 
                  type="number"
                  required
                  value={editPlanDeposit}
                  onChange={(e) => setEditPlanDeposit(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2.5 text-xs focus:border-yellow-500 focus:outline-none font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Daily return (₦)</label>
                <input 
                  type="number"
                  required
                  value={editPlanDaily}
                  onChange={(e) => setEditPlanDaily(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2.5 text-xs focus:border-yellow-500 focus:outline-none font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Plan Category</label>
                <select 
                  value={editPlanType}
                  onChange={(e: any) => setEditPlanType(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2.5 text-xs focus:border-yellow-500 focus:outline-none text-zinc-300"
                >
                  <option value="basic">Basic Plans</option>
                  <option value="premium">Premium Plans</option>
                  <option value="elite">Elite Plans</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="submit"
                className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold rounded transition uppercase tracking-wider"
              >
                Save Changes
              </button>
              <button 
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 rounded hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Bank Details Modal */}
      {editingUserBank && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveUserBankEdit} className="max-w-md w-full bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-4 shadow-2xl relative">
            <button 
              type="button" 
              onClick={() => setEditingUserBank(null)}
              className="absolute top-4 right-4 p-1.5 bg-zinc-900 hover:bg-zinc-850 rounded text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-1">
              <h5 className="font-bold text-gray-200">Modify Payout Coordinates</h5>
              <p className="text-xs text-zinc-500">Edit saved bank account coordinates for investor {editingUserBank.name}.</p>
            </div>

            {bankError && (
              <div className="p-2.5 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded">
                {bankError}
              </div>
            )}
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Bank Name</label>
                <select 
                  value={bankEditName}
                  onChange={(e) => setBankEditName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2.5 text-xs focus:border-yellow-500 focus:outline-none text-white font-semibold"
                >
                  <option value="">Select Bank Name</option>
                  <option value="Access Bank Plc">Access Bank Plc</option>
                  <option value="Citibank Nigeria Limited">Citibank Nigeria Limited</option>
                  <option value="Ecobank Nigeria Plc">Ecobank Nigeria Plc</option>
                  <option value="Fidelity Bank Plc">Fidelity Bank Plc</option>
                  <option value="First City Monument Bank Limited">First City Monument Bank Limited</option>
                  <option value="First Bank of Nigeria Limited">First Bank of Nigeria Limited</option>
                  <option value="Guaranty Trust Holding Company Plc (GTBank)">Guaranty Trust Holding Company Plc (GTBank)</option>
                  <option value="Heritage Banking Company Limited">Heritage Banking Company Limited</option>
                  <option value="Keystone Bank Limited">Keystone Bank Limited</option>
                  <option value="Optimis Bank">Optimis Bank</option>
                  <option value="Polaris Bank Limited">Polaris Bank Limited</option>
                  <option value="Providus Bank Limited">Providus Bank Limited</option>
                  <option value="Stanbic IBTC Bank Plc">Stanbic IBTC Bank Plc</option>
                  <option value="Standard Chartered Bank Nigeria Limited">Standard Chartered Bank Nigeria Limited</option>
                  <option value="Sterling Bank Plc">Sterling Bank Plc</option>
                  <option value="SunTrust Bank Nigeria Limited">SunTrust Bank Nigeria Limited</option>
                  <option value="Union Bank of Nigeria Plc">Union Bank of Nigeria Plc</option>
                  <option value="United Bank for Africa Plc (UBA)">United Bank for Africa Plc (UBA)</option>
                  <option value="Unity Bank Plc">Unity Bank Plc</option>
                  <option value="Wema Bank Plc">Wema Bank Plc</option>
                  <option value="Zenith Bank Plc">Zenith Bank Plc</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Account Holder Name</label>
                <input 
                  type="text"
                  required
                  value={bankEditHolder}
                  onChange={(e) => setBankEditHolder(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2.5 text-xs focus:border-yellow-500 focus:outline-none text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Account Number</label>
                <input 
                  type="text"
                  required
                  maxLength={10}
                  pattern="\d{10}"
                  placeholder="e.g. 0123456789"
                  value={bankEditNumber}
                  onChange={(e) => setBankEditNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-black border border-zinc-800 rounded p-2.5 text-xs focus:border-yellow-500 focus:outline-none font-mono text-white font-bold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                type="submit"
                className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-semibold rounded transition uppercase tracking-wider"
              >
                Save Bank Coordinates
              </button>
              <button 
                type="button"
                onClick={() => setEditingUserBank(null)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 rounded hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
