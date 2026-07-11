import { User, Transaction, Investment, Notification, Referral, AuditLog, InvestmentPlan, DailyTask, TaskClaim } from './types';
import { supabase } from './lib/supabase';

export interface DbState {
  users: User[];
  transactions: Transaction[];
  investments: Investment[];
  notifications: Notification[];
  referrals: Referral[];
  auditLogs: AuditLog[];
  plans: InvestmentPlan[];
  tasks: DailyTask[];
  taskClaims: TaskClaim[];
  referralRewardsEnabled: boolean;
  referralCommissionRate: number;
  companyBankName: string;
  companyAccountName: string;
  companyAccountNumber: string;
  inquiriesDeskTitle: string;
  inquiriesDeskText: string;
  inquiriesDeskAddress: string;
  inquiriesDeskEmail: string;
  inquiriesDeskPhone: string;
}

// Production investment plans
const defaultPlans: InvestmentPlan[] = [
  { id: 'starter', name: 'Starter', deposit: 52000, dailyReturn: 2000, type: 'basic', paused: false },
  { id: 'growth', name: 'Growth', deposit: 130000, dailyReturn: 5500, type: 'basic', paused: false },
  { id: 'public', name: 'Public', deposit: 245000, dailyReturn: 10000, type: 'basic', paused: false },
  { id: 'premium_1', name: 'Premium 1', deposit: 530000, dailyReturn: 20000, type: 'premium', paused: false },
  { id: 'premium_2', name: 'Premium 2', deposit: 850000, dailyReturn: 33500, type: 'premium', paused: false },
  { id: 'premium_3', name: 'Premium 3', deposit: 1700000, dailyReturn: 67000, type: 'premium', paused: false },
  { id: 'elite', name: 'Elite Partner', deposit: 0, dailyReturn: 0.045, type: 'elite', minElite: 2000000, maxElite: 200000000, paused: false }
];

export const INITIAL_STATE: DbState = {
  users: [],
  transactions: [],
  investments: [],
  notifications: [],
  referrals: [],
  auditLogs: [],
  plans: defaultPlans,
  tasks: [],
  taskClaims: [],
  referralRewardsEnabled: true,
  referralCommissionRate: 10,
  companyBankName: 'Access Bank Plc',
  companyAccountName: 'PrimeVest Asset clearing Trust',
  companyAccountNumber: '0842918491',
  inquiriesDeskTitle: 'Connect with PrimeVest Advisors',
  inquiriesDeskText: 'Have custom compliance, regulatory, or institutional partnership questions? Our premium advisor team is here to support you 24 hours a day, 5 days a week.',
  inquiriesDeskAddress: 'Level 24, Tower 3, Marina Mall Financial Center, Lagos',
  inquiriesDeskEmail: 'support@primevest.capital',
  inquiriesDeskPhone: '+234 (1) 4950 200'
};

const DB_KEY = 'primevest_db_state';

// ==========================================
// PRODUCTION STATE MANAGEMENT
// ==========================================

export async function getDbState(): Promise<DbState> {
  // Primary: Fetch from Supabase (production database)
  return await pullFromSupabase();
}

export async function saveDbState(state: DbState): Promise<void> {
  // Immediately persist to Supabase
  await pushToSupabase(state);
  
  // Cache locally for offline access
  if (typeof window !== 'undefined') {
    localStorage.setItem(DB_KEY, JSON.stringify(state));
  }
}

// Generate sequential IDs
function nextId(prefix: string): string {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

// ==========================================
// PRODUCTION ROI PROCESSING
// ==========================================

/**
 * Process ROI earnings from backend trading system
 * In production, your backend processes trades and credits payouts
 * This syncs those results from Supabase to the frontend
 */
export async function processROIPayouts(): Promise<DbState> {
  const state = await getDbState();
  
  try {
    // Fetch unprocssed ROI payouts from backend
    const { data: payouts, error } = await supabase
      .from('roi_payouts')
      .select('*')
      .eq('processed', false);
    
    if (error) throw error;
    if (!payouts || payouts.length === 0) return state;

    let updated = false;

    for (const payout of payouts) {
      const investment = state.investments.find(inv => inv.id === payout.investment_id);
      if (!investment) continue;

      const user = state.users.find(u => u.id === investment.userId);
      if (!user) continue;

      // Credit earnings to user
      investment.earningsAccumulated += payout.amount;
      user.walletBalance += payout.amount;
      user.totalEarnings += payout.amount;

      // Log transaction
      state.transactions.push({
        id: nextId('tx'),
        userId: user.id,
        userName: user.name,
        type: 'investment_payout',
        amount: payout.amount,
        status: 'approved',
        date: new Date().toISOString(),
        planName: investment.planName,
        adminNote: `Trading payout from ${investment.planName} Plan.`
      });

      // Notify user
      state.notifications.push({
        id: nextId('notif'),
        userId: user.id,
        title: 'Trading Return Credited',
        message: `Your ${investment.planName} Plan generated ₦${payout.amount.toLocaleString()} in returns.`,
        date: new Date().toISOString(),
        read: false
      });

      // Mark payout as processed
      await supabase
        .from('roi_payouts')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', payout.id);

      updated = true;
    }

    if (updated) {
      await saveDbState(state);
    }

    return state;
  } catch (error) {
    console.error('Error processing ROI payouts:', error);
    return state;
  }
}

// Alias used by App.tsx for the periodic/on-load ROI simulation loop
export const simulateROI = processROIPayouts;

// ==========================================
// USER ACTIONS
// ==========================================

export async function requestDeposit(
  userId: string,
  amount: number,
  paymentProof: string,
  receiptFile?: string,
  receiptFileName?: string
): Promise<DbState> {
  const state = await getDbState();
  const user = state.users.find(u => u.id === userId);
  if (!user) return state;

  const tx: Transaction = {
    id: nextId('tx'),
    userId,
    userName: user.name,
    type: 'deposit',
    amount,
    status: 'pending',
    date: new Date().toISOString(),
    paymentProof,
    receiptFile,
    receiptFileName
  };

  state.transactions.push(tx);
  await saveDbState(state);
  return state;
}

export async function requestWithdrawal(
  userId: string,
  amount: number
): Promise<{ success: boolean; state: DbState; message: string }> {
  const state = await getDbState();
  const user = state.users.find(u => u.id === userId);
  if (!user) return { success: false, state, message: 'User not found' };

  if (amount < 10000) {
    return { success: false, state, message: 'Minimum withdrawal amount is ₦10,000.' };
  }

  if (user.walletBalance < amount) {
    return { success: false, state, message: 'Insufficient wallet balance' };
  }

  if (user.totalEarnings < amount) {
    return {
      success: false,
      state,
      message: `Withdrawals can only be initiated from your earnings. Your total earnings are ₦${user.totalEarnings.toLocaleString()}`
    };
  }

  const tx: Transaction = {
    id: nextId('tx'),
    userId,
    userName: user.name,
    type: 'withdrawal',
    amount,
    status: 'pending',
    date: new Date().toISOString()
  };

  state.transactions.push(tx);
  await saveDbState(state);
  return { success: true, state, message: 'Withdrawal request submitted. Awaiting administrator approval.' };
}

export async function investInPlan(
  userId: string,
  planId: string,
  customAmount?: number
): Promise<{ success: boolean; state: DbState; message: string }> {
  const state = await getDbState();
  const user = state.users.find(u => u.id === userId);
  const plan = state.plans.find(p => p.id === planId);

  if (!user) return { success: false, state, message: 'User not found' };
  if (!plan) return { success: false, state, message: 'Investment plan not found' };
  if (plan.paused) return { success: false, state, message: 'This plan is currently unavailable' };

  let amount = plan.deposit;
  let dailyPayout = plan.dailyReturn;

  if (plan.type === 'elite') {
    if (!customAmount) {
      return { success: false, state, message: 'Custom investment amount is required for Elite plans' };
    }
    if (customAmount < (plan.minElite || 2000000)) {
      return {
        success: false,
        state,
        message: `Minimum investment for Elite Plan is ₦${(plan.minElite || 2000000).toLocaleString()}`
      };
    }
    if (customAmount > (plan.maxElite || 200000000)) {
      return {
        success: false,
        state,
        message: `Maximum investment for Elite Plan is ₦${(plan.maxElite || 200000000).toLocaleString()}`
      };
    }
    amount = customAmount;
    dailyPayout = customAmount * plan.dailyReturn;
  }

  if (user.walletBalance < amount) {
    return { success: false, state, message: 'Insufficient wallet balance. Please fund your wallet first.' };
  }

  user.walletBalance -= amount;

  const newInv: Investment = {
    id: nextId('inv'),
    userId,
    planId: plan.id,
    planName: plan.name,
    amountInvested: amount,
    dailyReturn: dailyPayout,
    earningsAccumulated: 0,
    status: 'active',
    startDate: new Date().toISOString(),
    lastPayoutDate: new Date().toISOString(),
    durationDays: 30,
    daysElapsed: 0
  };

  state.investments.push(newInv);

  state.transactions.push({
    id: nextId('tx'),
    userId,
    userName: user.name,
    type: 'investment_payout',
    amount: -amount,
    status: 'approved',
    date: new Date().toISOString(),
    planName: plan.name,
    adminNote: `Purchased ${plan.name} Investment Plan.`
  });

  user.activeInvestmentsAmount = state.investments
    .filter(inv => inv.userId === userId && inv.status === 'active')
    .reduce((sum, inv) => sum + inv.amountInvested, 0);

  // Referral rewards
  if (state.referralRewardsEnabled && user.referredBy) {
    const referrer = state.users.find(u => u.referralCode === user.referredBy || u.id === user.referredBy);
    if (referrer) {
      const rewardRate = state.referralCommissionRate / 100;
      const rewardAmount = amount * rewardRate;

      referrer.walletBalance += rewardAmount;
      referrer.referralEarnings += rewardAmount;
      referrer.totalEarnings += rewardAmount;

      state.transactions.push({
        id: nextId('tx'),
        userId: referrer.id,
        userName: referrer.name,
        type: 'referral_commission',
        amount: rewardAmount,
        status: 'approved',
        date: new Date().toISOString(),
        planName: plan.name,
        adminNote: `10% Commission from referral ${user.name}'s investment in ${plan.name} plan.`
      });

      state.notifications.push({
        id: nextId('notif'),
        userId: referrer.id,
        title: 'Referral Commission Received!',
        message: `You earned ₦${rewardAmount.toLocaleString()} commission from your referral ${user.name}'s investment.`,
        date: new Date().toISOString(),
        read: false
      });
    }
  }

  state.notifications.push({
    id: nextId('notif'),
    userId,
    title: 'Investment Active',
    message: `You have successfully invested ₦${amount.toLocaleString()} in the ${plan.name} Plan. Daily returns are now active.`,
    date: new Date().toISOString(),
    read: false
  });

  state.auditLogs.push({
    id: nextId('log'),
    userId,
    action: 'BUY_PLAN',
    details: `Invested ₦${amount.toLocaleString()} in ${plan.name} Plan.`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });

  await saveDbState(state);
  return { success: true, state, message: `Your investment in ${plan.name} Plan is now active!` };
}

// ==========================================
// ADMIN ACTIONS: DEPOSIT MANAGEMENT
// ==========================================

export async function approveDeposit(txId: string, adminId: string, note?: string): Promise<DbState> {
  const state = await getDbState();
  const tx = state.transactions.find(t => t.id === txId && t.type === 'deposit');
  if (!tx || tx.status !== 'pending') return state;

  tx.status = 'approved';
  tx.adminNote = note || 'Approved by administrator';

  state.users = state.users.map(u => {
    if (u.id === tx.userId) {
      return {
        ...u,
        walletBalance: u.walletBalance + tx.amount,
        totalDeposits: u.totalDeposits + tx.amount
      };
    }
    return u;
  });

  state.notifications.push({
    id: nextId('notif'),
    userId: tx.userId,
    title: 'Deposit Approved',
    message: `Your deposit of ₦${tx.amount.toLocaleString()} has been approved. The funds are now available in your wallet.`,
    date: new Date().toISOString(),
    read: false
  });

  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'APPROVE_DEPOSIT',
    details: `Approved deposit ID ${txId} of ₦${tx.amount.toLocaleString()} for user ID ${tx.userId}.`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });

  await saveDbState(state);
  return state;
}

export async function rejectDeposit(txId: string, adminId: string, note: string): Promise<DbState> {
  const state = await getDbState();
  const tx = state.transactions.find(t => t.id === txId && t.type === 'deposit');
  if (!tx || tx.status !== 'pending') return state;

  tx.status = 'rejected';
  tx.adminNote = note || 'Rejected by administrator';

  state.notifications.push({
    id: nextId('notif'),
    userId: tx.userId,
    title: 'Deposit Rejected',
    message: `Your deposit of ₦${tx.amount.toLocaleString()} was rejected. Reason: ${note}`,
    date: new Date().toISOString(),
    read: false
  });

  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'REJECT_DEPOSIT',
    details: `Rejected deposit ID ${txId} for user ID ${tx.userId}. Reason: ${note}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });

  await saveDbState(state);
  return state;
}

// ==========================================
// ADMIN ACTIONS: WITHDRAWAL MANAGEMENT
// ==========================================

export async function approveWithdrawal(txId: string, adminId: string, note?: string): Promise<DbState> {
  const state = await getDbState();
  const tx = state.transactions.find(t => t.id === txId && t.type === 'withdrawal');
  if (!tx || tx.status !== 'pending') return state;

  const user = state.users.find(u => u.id === tx.userId);
  if (!user) return state;

  if (user.walletBalance < tx.amount) {
    tx.status = 'rejected';
    tx.adminNote = 'System Auto-Rejected: Insufficient wallet balance.';
    await saveDbState(state);
    return state;
  }

  tx.status = 'approved';
  tx.adminNote = note || 'Processed & Approved';

  user.walletBalance -= tx.amount;
  user.totalWithdrawals += tx.amount;

  state.notifications.push({
    id: nextId('notif'),
    userId: tx.userId,
    title: 'Withdrawal Approved',
    message: `Your withdrawal of ₦${tx.amount.toLocaleString()} has been approved and processed.`,
    date: new Date().toISOString(),
    read: false
  });

  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'APPROVE_WITHDRAWAL',
    details: `Approved withdrawal ID ${txId} of ₦${tx.amount.toLocaleString()} for user ID ${tx.userId}.`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });

  await saveDbState(state);
  return state;
}

export async function rejectWithdrawal(txId: string, adminId: string, note: string): Promise<DbState> {
  const state = await getDbState();
  const tx = state.transactions.find(t => t.id === txId && t.type === 'withdrawal');
  if (!tx || tx.status !== 'pending') return state;

  tx.status = 'rejected';
  tx.adminNote = note || 'Rejected by administrator';

  state.notifications.push({
    id: nextId('notif'),
    userId: tx.userId,
    title: 'Withdrawal Rejected',
    message: `Your withdrawal request of ₦${tx.amount.toLocaleString()} was rejected. Reason: ${note}`,
    date: new Date().toISOString(),
    read: false
  });

  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'REJECT_WITHDRAWAL',
    details: `Rejected withdrawal ID ${txId} for user ID ${tx.userId}. Reason: ${note}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });

  await saveDbState(state);
  return state;
}

// ==========================================
// USER PROFILE MANAGEMENT
// ==========================================

export async function updateProfile(userId: string, data: Partial<User>): Promise<DbState> {
  const state = await getDbState();
  state.users = state.users.map(u => {
    if (u.id === userId) {
      return { ...u, ...data };
    }
    return u;
  });
  await saveDbState(state);
  return state;
}

export async function submitKyc(userId: string): Promise<DbState> {
  const state = await getDbState();
  state.users = state.users.map(u => {
    if (u.id === userId) {
      return { ...u, kycStatus: 'pending' };
    }
    return u;
  });
  state.notifications.push({
    id: nextId('notif'),
    userId,
    title: 'KYC Documents Submitted',
    message: 'Your Identity Verification documents are under review.',
    date: new Date().toISOString(),
    read: false
  });
  await saveDbState(state);
  return state;
}

export async function approveKyc(userId: string, adminId: string): Promise<DbState> {
  const state = await getDbState();
  state.users = state.users.map(u => {
    if (u.id === userId) {
      return { ...u, kycStatus: 'verified' };
    }
    return u;
  });
  state.notifications.push({
    id: nextId('notif'),
    userId,
    title: 'KYC Verified Successfully',
    message: 'Congratulations! Your Identity Verification has been approved.',
    date: new Date().toISOString(),
    read: false
  });
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'APPROVE_KYC',
    details: `Approved KYC verification for user ID ${userId}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  await saveDbState(state);
  return state;
}

export async function rejectKyc(userId: string, adminId: string): Promise<DbState> {
  const state = await getDbState();
  state.users = state.users.map(u => {
    if (u.id === userId) {
      return { ...u, kycStatus: 'unverified' };
    }
    return u;
  });
  state.notifications.push({
    id: nextId('notif'),
    userId,
    title: 'KYC Document Rejected',
    message: 'Your verification was declined. Please re-upload legible and valid documents.',
    date: new Date().toISOString(),
    read: false
  });
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'REJECT_KYC',
    details: `Rejected KYC verification for user ID ${userId}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  await saveDbState(state);
  return state;
}

// ==========================================
// ADMIN: USER MANAGEMENT
// ==========================================

export async function adminUpdateUser(adminId: string, targetUserId: string, updates: Partial<User>): Promise<DbState> {
  const state = await getDbState();
  state.users = state.users.map(u => {
    if (u.id === targetUserId) {
      return { ...u, ...updates };
    }
    return u;
  });
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'EDIT_USER',
    details: `Updated details for user ${targetUserId}: ${JSON.stringify(updates)}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  await saveDbState(state);
  return state;
}

export async function adminDeleteUser(adminId: string, targetUserId: string): Promise<DbState> {
  const state = await getDbState();
  state.users = state.users.filter(u => u.id !== targetUserId);
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'DELETE_USER',
    details: `Deleted user ${targetUserId} from system.`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  await saveDbState(state);

  if ((import.meta as any).env.VITE_SUPABASE_URL && (import.meta as any).env.VITE_SUPABASE_ANON_KEY) {
    supabase.from('users').delete().eq('id', targetUserId).then(({ error }) => {
      if (error) console.error('Error deleting user from Supabase:', error);
    });
  }

  return state;
}

// ==========================================
// ADMIN: BANK DETAILS VERIFICATION
// ==========================================

export async function adminVerifyBankDetails(
  adminId: string,
  targetUserId: string,
  status: 'verified' | 'rejected',
  note?: string
): Promise<DbState> {
  const state = await getDbState();
  state.users = state.users.map(u => {
    if (u.id === targetUserId) {
      return {
        ...u,
        bankVerificationStatus: status,
        bankAdminNote: status === 'rejected' ? (note || '') : ''
      };
    }
    return u;
  });
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'VERIFY_BANK_DETAILS',
    details: `Set bank verification status to ${status} for user ${targetUserId}${note ? ` (note: ${note})` : ''}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  await saveDbState(state);
  return state;
}

export async function adminEditUserBankDetails(
  adminId: string,
  targetUserId: string,
  bankName: string,
  accountName: string,
  accountNumber: string
): Promise<DbState> {
  const state = await getDbState();
  state.users = state.users.map(u => {
    if (u.id === targetUserId) {
      return {
        ...u,
        withdrawalBankName: bankName,
        withdrawalAccountName: accountName,
        withdrawalAccountNumber: accountNumber
      };
    }
    return u;
  });
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'EDIT_USER_BANK_DETAILS',
    details: `Administrator updated payout bank details for user ${targetUserId}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  await saveDbState(state);
  return state;
}

// ==========================================
// ADMIN: PLAN MANAGEMENT
// ==========================================

export async function adminCreatePlan(adminId: string, plan: Omit<InvestmentPlan, 'id'>): Promise<DbState> {
  const state = await getDbState();
  const newPlan: InvestmentPlan = {
    ...plan,
    id: nextId('plan')
  };
  state.plans.push(newPlan);
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'CREATE_PLAN',
    details: `Created new investment plan ${newPlan.name} (type: ${newPlan.type})`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  await saveDbState(state);
  return state;
}

export async function adminUpdatePlan(
  adminId: string,
  planId: string,
  updates: Partial<InvestmentPlan>
): Promise<DbState> {
  const state = await getDbState();
  state.plans = state.plans.map(p => {
    if (p.id === planId) {
      return { ...p, ...updates };
    }
    return p;
  });
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'UPDATE_PLAN',
    details: `Updated plan ${planId} with updates: ${JSON.stringify(updates)}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  await saveDbState(state);
  return state;
}

export async function adminDeletePlan(adminId: string, planId: string): Promise<DbState> {
  const state = await getDbState();
  state.plans = state.plans.filter(p => p.id !== planId);
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'DELETE_PLAN',
    details: `Deleted investment plan ${planId}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  await saveDbState(state);

  if ((import.meta as any).env.VITE_SUPABASE_URL && (import.meta as any).env.VITE_SUPABASE_ANON_KEY) {
    supabase.from('plans').delete().eq('id', planId).then(({ error }) => {
      if (error) console.error('Error deleting plan from Supabase:', error);
    });
  }

  return state;
}

// ==========================================
// ADMIN: DAILY ENGAGEMENT TASKS
// ==========================================

export async function adminCreateTask(adminId: string, task: Omit<DailyTask, 'id'>): Promise<DbState> {
  const state = await getDbState();
  const newTask: DailyTask = {
    ...task,
    id: nextId('task')
  };
  state.tasks.push(newTask);
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'CREATE_TASK',
    details: `Published new daily engagement task "${newTask.title}" (${newTask.platformType})`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  await saveDbState(state);
  return state;
}

export async function adminUpdateTask(
  adminId: string,
  taskId: string,
  updates: Partial<DailyTask>
): Promise<DbState> {
  const state = await getDbState();
  state.tasks = state.tasks.map(t => {
    if (t.id === taskId) {
      return { ...t, ...updates };
    }
    return t;
  });
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'UPDATE_TASK',
    details: `Updated daily engagement task ${taskId} with updates: ${JSON.stringify(updates)}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  await saveDbState(state);
  return state;
}

export async function adminDeleteTask(adminId: string, taskId: string): Promise<DbState> {
  const state = await getDbState();
  state.tasks = state.tasks.filter(t => t.id !== taskId);
  state.taskClaims = state.taskClaims.filter(c => c.taskId !== taskId);
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'DELETE_TASK',
    details: `Deleted daily engagement task ${taskId}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  await saveDbState(state);

  if ((import.meta as any).env.VITE_SUPABASE_URL && (import.meta as any).env.VITE_SUPABASE_ANON_KEY) {
    supabase.from('tasks').delete().eq('id', taskId).then(({ error }) => {
      if (error) console.error('Error deleting task from Supabase:', error);
    });
  }

  return state;
}

// ==========================================
// ADMIN: SETTINGS
// ==========================================

export async function adminUpdateReferralSettings(
  adminId: string,
  enabled: boolean,
  rate: number
): Promise<DbState> {
  const state = await getDbState();
  state.referralRewardsEnabled = enabled;
  state.referralCommissionRate = rate;
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'UPDATE_REFERRAL_SETTINGS',
    details: `Set referral rewards enabled=${enabled}, commissionRate=${rate}%`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  await saveDbState(state);
  return state;
}

export async function adminSendNotification(
  adminId: string,
  targetUserId: string,
  title: string,
  message: string
): Promise<DbState> {
  const state = await getDbState();
  state.notifications.push({
    id: nextId('notif'),
    userId: targetUserId,
    title,
    message,
    date: new Date().toISOString(),
    read: false
  });
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'SEND_NOTIFICATION',
    details: `Sent notification (${title}) to ${targetUserId}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  await saveDbState(state);
  return state;
}

export async function adminUpdateCompanySettings(
  adminId: string,
  updates: {
    companyBankName?: string;
    companyAccountName?: string;
    companyAccountNumber?: string;
    inquiriesDeskTitle?: string;
    inquiriesDeskText?: string;
    inquiriesDeskAddress?: string;
    inquiriesDeskEmail?: string;
    inquiriesDeskPhone?: string;
  }
): Promise<DbState> {
  const state = await getDbState();
  if (updates.companyBankName !== undefined) state.companyBankName = updates.companyBankName;
  if (updates.companyAccountName !== undefined) state.companyAccountName = updates.companyAccountName;
  if (updates.companyAccountNumber !== undefined) state.companyAccountNumber = updates.companyAccountNumber;
  if (updates.inquiriesDeskTitle !== undefined) state.inquiriesDeskTitle = updates.inquiriesDeskTitle;
  if (updates.inquiriesDeskText !== undefined) state.inquiriesDeskText = updates.inquiriesDeskText;
  if (updates.inquiriesDeskAddress !== undefined) state.inquiriesDeskAddress = updates.inquiriesDeskAddress;
  if (updates.inquiriesDeskEmail !== undefined) state.inquiriesDeskEmail = updates.inquiriesDeskEmail;
  if (updates.inquiriesDeskPhone !== undefined) state.inquiriesDeskPhone = updates.inquiriesDeskPhone;

  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'UPDATE_COMPANY_SETTINGS',
    details: 'Updated company deposit details and inquiries desk information.',
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  await saveDbState(state);
  return state;
}

// ==========================================
// SUPABASE SYNC (Production Database)
// ==========================================

export async function seedSupabase(state: DbState): Promise<void> {
  if (!(import.meta as any).env.VITE_SUPABASE_URL || !(import.meta as any).env.VITE_SUPABASE_ANON_KEY) return;

  try {
    console.log('Seeding Supabase with production data...');
    if (state.users && state.users.length > 0) {
      const { error } = await supabase.from('users').insert(state.users);
      if (error) console.error('Error seeding users:', error);
    }
    if (state.transactions && state.transactions.length > 0) {
      const { error } = await supabase.from('transactions').insert(state.transactions);
      if (error) console.error('Error seeding transactions:', error);
    }
    if (state.investments && state.investments.length > 0) {
      const { error } = await supabase.from('investments').insert(state.investments);
      if (error) console.error('Error seeding investments:', error);
    }
    if (state.notifications && state.notifications.length > 0) {
      const { error } = await supabase.from('notifications').insert(state.notifications);
      if (error) console.error('Error seeding notifications:', error);
    }
    if (state.referrals && state.referrals.length > 0) {
      const { error } = await supabase.from('referrals').insert(state.referrals);
      if (error) console.error('Error seeding referrals:', error);
    }
    if (state.auditLogs && state.auditLogs.length > 0) {
      const { error } = await supabase.from('audit_logs').insert(state.auditLogs);
      if (error) console.error('Error seeding audit logs:', error);
    }
    if (state.plans && state.plans.length > 0) {
      const { error } = await supabase.from('plans').insert(state.plans);
      if (error) console.error('Error seeding plans:', error);
    }
    if (state.tasks && state.tasks.length > 0) {
      const { error } = await supabase.from('tasks').insert(state.tasks);
      if (error) console.error('Error seeding tasks:', error);
    }
    if (state.taskClaims && state.taskClaims.length > 0) {
      const { error } = await supabase.from('task_claims').insert(state.taskClaims);
      if (error) console.error('Error seeding task claims:', error);
    }
    const settingsData = [
      { key: 'referralRewardsEnabled', value: state.referralRewardsEnabled },
      { key: 'referralCommissionRate', value: state.referralCommissionRate },
      { key: 'companyBankName', value: state.companyBankName },
      { key: 'companyAccountName', value: state.companyAccountName },
      { key: 'companyAccountNumber', value: state.companyAccountNumber },
      { key: 'inquiriesDeskTitle', value: state.inquiriesDeskTitle },
      { key: 'inquiriesDeskText', value: state.inquiriesDeskText },
      { key: 'inquiriesDeskAddress', value: state.inquiriesDeskAddress },
      { key: 'inquiriesDeskEmail', value: state.inquiriesDeskEmail },
      { key: 'inquiriesDeskPhone', value: state.inquiriesDeskPhone }
    ];
    const { error } = await supabase.from('settings').insert(settingsData);
    if (error) console.error('Error seeding settings:', error);
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding Supabase:', error);
  }
}

export async function pushToSupabase(state: DbState): Promise<void> {
  if (!(import.meta as any).env.VITE_SUPABASE_URL || !(import.meta as any).env.VITE_SUPABASE_ANON_KEY) return;

  try {
    await Promise.all([
      state.users.length > 0 ? supabase.from('users').upsert(state.users) : Promise.resolve(),
      state.transactions.length > 0 ? supabase.from('transactions').upsert(state.transactions) : Promise.resolve(),
      state.investments.length > 0 ? supabase.from('investments').upsert(state.investments) : Promise.resolve(),
      state.notifications.length > 0 ? supabase.from('notifications').upsert(state.notifications) : Promise.resolve(),
      state.referrals.length > 0 ? supabase.from('referrals').upsert(state.referrals) : Promise.resolve(),
      state.auditLogs.length > 0 ? supabase.from('audit_logs').upsert(state.auditLogs) : Promise.resolve(),
      state.plans.length > 0 ? supabase.from('plans').upsert(state.plans) : Promise.resolve(),
      state.tasks.length > 0 ? supabase.from('tasks').upsert(state.tasks) : Promise.resolve(),
      state.taskClaims.length > 0 ? supabase.from('task_claims').upsert(state.taskClaims) : Promise.resolve(),
      supabase.from('settings').upsert([
        { key: 'referralRewardsEnabled', value: state.referralRewardsEnabled },
        { key: 'referralCommissionRate', value: state.referralCommissionRate },
        { key: 'companyBankName', value: state.companyBankName },
        { key: 'companyAccountName', value: state.companyAccountName },
        { key: 'companyAccountNumber', value: state.companyAccountNumber },
        { key: 'inquiriesDeskTitle', value: state.inquiriesDeskTitle },
        { key: 'inquiriesDeskText', value: state.inquiriesDeskText },
        { key: 'inquiriesDeskAddress', value: state.inquiriesDeskAddress },
        { key: 'inquiriesDeskEmail', value: state.inquiriesDeskEmail },
        { key: 'inquiriesDeskPhone', value: state.inquiriesDeskPhone }
      ])
    ]);
  } catch (error) {
    console.error('Error pushing to Supabase:', error);
  }
}

export async function pullFromSupabase(): Promise<DbState> {
  if (!(import.meta as any).env.VITE_SUPABASE_URL || !(import.meta as any).env.VITE_SUPABASE_ANON_KEY) {
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          return { ...INITIAL_STATE, ...parsed };
        } catch (e) {
          console.error('Error parsing cached DB state:', e);
        }
      }
    }
    return INITIAL_STATE;
  }

  try {
    const [
      { data: users, error: errUsers },
      { data: transactions },
      { data: investments },
      { data: notifications },
      { data: referrals },
      { data: auditLogs },
      { data: plans },
      { data: tasks },
      { data: taskClaims },
      { data: settings }
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('transactions').select('*'),
      supabase.from('investments').select('*'),
      supabase.from('notifications').select('*'),
      supabase.from('referrals').select('*'),
      supabase.from('audit_logs').select('*'),
      supabase.from('plans').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('task_claims').select('*'),
      supabase.from('settings').select('*')
    ]);

    if (errUsers) {
      console.warn('Could not connect to Supabase. Falling back to local cache.');
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(DB_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            return { ...INITIAL_STATE, ...parsed };
          } catch (e) {
            console.error('Error parsing cached DB state:', e);
          }
        }
      }
      return INITIAL_STATE;
    }

    const state = { ...INITIAL_STATE };

    if (users && users.length > 0) {
      state.users = users as User[];
      state.transactions = (transactions || []) as Transaction[];
      state.investments = (investments || []) as Investment[];
      state.notifications = (notifications || []) as Notification[];
      state.referrals = (referrals || []) as Referral[];
      state.auditLogs = (auditLogs || []) as AuditLog[];
      state.plans = (plans || []) as InvestmentPlan[];
      state.tasks = (tasks || []) as DailyTask[];
      state.taskClaims = (taskClaims || []) as TaskClaim[];

      if (settings) {
        settings.forEach((s: any) => {
          if (s.key === 'referralRewardsEnabled') state.referralRewardsEnabled = s.value;
          if (s.key === 'referralCommissionRate') state.referralCommissionRate = Number(s.value);
          if (s.key === 'companyBankName') state.companyBankName = s.value;
          if (s.key === 'companyAccountName') state.companyAccountName = s.value;
          if (s.key === 'companyAccountNumber') state.companyAccountNumber = s.value;
          if (s.key === 'inquiriesDeskTitle') state.inquiriesDeskTitle = s.value;
          if (s.key === 'inquiriesDeskText') state.inquiriesDeskText = s.value;
          if (s.key === 'inquiriesDeskAddress') state.inquiriesDeskAddress = s.value;
          if (s.key === 'inquiriesDeskEmail') state.inquiriesDeskEmail = s.value;
          if (s.key === 'inquiriesDeskPhone') state.inquiriesDeskPhone = s.value;
        });
      }

      // Cache locally
      if (typeof window !== 'undefined') {
        localStorage.setItem(DB_KEY, JSON.stringify(state));
      }
    } else {
      // Database exists but is empty: seed it
      await seedSupabase(state);
    }

    return state;
  } catch (error) {
    console.error('Error pulling from Supabase:', error);
    return INITIAL_STATE;
  }
}
