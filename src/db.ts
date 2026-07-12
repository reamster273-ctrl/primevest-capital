import { User, Transaction, Investment, Notification, Referral, AuditLog, InvestmentPlan, DailyTask, TaskClaim } from './types';
import { supabase } from './lib/supabase';

interface DbState {
  users: User[];
  transactions: Transaction[];
  investments: Investment[];
  notifications: Notification[];
  referrals: Referral[];
  auditLogs: AuditLog[];
  plans: InvestmentPlan[];
  referralRewardsEnabled: boolean;
  referralCommissionRate: number; // e.g. 10 for 10%
  companyBankName: string;
  companyAccountName: string;
  companyAccountNumber: string;
  inquiriesDeskTitle: string;
  inquiriesDeskText: string;
  inquiriesDeskAddress: string;
  inquiriesDeskEmail: string;
  inquiriesDeskPhone: string;
  tasks?: DailyTask[];
  taskClaims?: TaskClaim[];
}

// Initial seed plans
const defaultPlans: InvestmentPlan[] = [
  { id: 'starter', name: 'Starter', deposit: 52000, dailyReturn: 2000, type: 'basic', paused: false },
  { id: 'growth', name: 'Growth', deposit: 130000, dailyReturn: 5500, type: 'basic', paused: false },
  { id: 'public', name: 'Public', deposit: 245000, dailyReturn: 10000, type: 'basic', paused: false },
  { id: 'premium_1', name: 'Premium 1', deposit: 530000, dailyReturn: 20000, type: 'premium', paused: false },
  { id: 'premium_2', name: 'Premium 2', deposit: 850000, dailyReturn: 33500, type: 'premium', paused: false },
  { id: 'premium_3', name: 'Premium 3', deposit: 1700000, dailyReturn: 67000, type: 'premium', paused: false },
  { id: 'elite', name: 'Elite Partner', deposit: 0, dailyReturn: 0.045, type: 'elite', minElite: 2000000, maxElite: 200000000, paused: false } // 4.5% daily return
];

const INITIAL_STATE: DbState = {
  users: [],
  transactions: [],
  investments: [],
  notifications: [],
  referrals: [],
  auditLogs: [],
  plans: defaultPlans,
  referralRewardsEnabled: true,
  referralCommissionRate: 10, // 10%
  companyBankName: 'Access Bank Plc',
  companyAccountName: 'PrimeVest Asset clearing Trust',
  companyAccountNumber: '0842918491',
  inquiriesDeskTitle: 'Connect with PrimeVest Advisors',
  inquiriesDeskText: 'Have custom compliance, regulatory, or institutional partnership questions? Our premium advisor team is here to support you 24 hours a day, 5 days a week.',
  inquiriesDeskAddress: 'Level 24, Tower 3, Marina Mall Financial Center, Lagos',
  inquiriesDeskEmail: 'support@primevest.capital',
  inquiriesDeskPhone: '+234 (1) 4950 200',
  tasks: [],
  taskClaims: []
};

const DB_KEY = 'primevest_db_state';

export function getDbState(): DbState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_STATE));
    return INITIAL_STATE;
  }
  try {
    const parsed = JSON.parse(raw);
    return { ...INITIAL_STATE, ...parsed };
  } catch (e) {
    console.error('Error parsing DB state, resetting', e);
    return INITIAL_STATE;
  }
}

export function saveDbState(state: DbState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DB_KEY, JSON.stringify(state));
  }
  // Asynchronously push the changes to Supabase in the background
  pushToSupabase(state);
}

// Generate sequential IDs
function nextId(prefix: string): string {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

// SIMULATE ROI: Process earnings since last payout
export function simulateROI(): DbState {
  const state = getDbState();
  const now = new Date();
  let updated = false;

  const updatedInvestments = state.investments.map(inv => {
    if (inv.status !== 'active') return inv;

    const startDate = new Date(inv.startDate);
    const lastPayout = new Date(inv.lastPayoutDate);
    
    // Calculate how many days have elapsed since last payout.
    // In our live simulation, we can simulate 1 real day = 1 minute for interactive testing, 
    // OR we can calculate based on actual real days elapsed.
    // Let's implement BOTH! 
    // If we detect the user just started the investment, we can credit simulated payouts 
    // based on real days elapsed, but we also credit payout every time they click "Simulate ROI Day" 
    // or we check if at least 1 real day has elapsed (or a fast minute simulation for interactive fun).
    // Let's calculate actual physical time elapsed, but also add a manual simulation button 
    // in the Admin Panel or Dashboard to "Simulate 24h Payout" for testing convenience.
    // Let's calculate standard real-time elapsed days:
    const diffTime = Math.abs(now.getTime() - lastPayout.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays >= 1) {
      const payoutDays = Math.min(diffDays, inv.durationDays - inv.daysElapsed);
      if (payoutDays > 0) {
        const dailyPayout = inv.dailyReturn;
        const totalPayout = dailyPayout * payoutDays;

        inv.earningsAccumulated += totalPayout;
        inv.daysElapsed += payoutDays;
        inv.lastPayoutDate = now.toISOString();

        if (inv.daysElapsed >= inv.durationDays) {
          inv.status = 'completed';
        }

        // Credit User Wallet
        state.users = state.users.map(u => {
          if (u.id === inv.userId) {
            return {
              ...u,
              walletBalance: u.walletBalance + totalPayout,
              totalEarnings: u.totalEarnings + totalPayout
            };
          }
          return u;
        });

        // Add transaction payout log
        state.transactions.push({
          id: nextId('tx'),
          userId: inv.userId,
          userName: state.users.find(u => u.id === inv.userId)?.name || 'Investor',
          type: 'investment_payout',
          amount: totalPayout,
          status: 'approved',
          date: now.toISOString(),
          planName: inv.planName,
          adminNote: `Automated Forex trading payout for ${inv.planName} Plan.`
        });

        // Notify user
        state.notifications.push({
          id: nextId('notif'),
          userId: inv.userId,
          title: 'Trading Return Credited',
          message: `Your ${inv.planName} Plan generated ₦${totalPayout.toLocaleString()} in returns for ${payoutDays} trading day(s).`,
          date: now.toISOString(),
          read: false
        });

        updated = true;
      }
    }
    return inv;
  });

  if (updated) {
    state.investments = updatedInvestments;
    // Recalculate active investments amount
    state.users = state.users.map(u => {
      const activeInv = state.investments
        .filter(inv => inv.userId === u.id && inv.status === 'active')
        .reduce((sum, inv) => sum + inv.amountInvested, 0);
      return {
        ...u,
        activeInvestmentsAmount: activeInv
      };
    });
    saveDbState(state);
  }

  return state;
}

// Force Simulate a 24 Hour Payout for testing
export function forceSimulatePayout(investmentId: string): DbState {
  const state = getDbState();
  const now = new Date();
  
  state.investments = state.investments.map(inv => {
    if (inv.id !== investmentId || inv.status !== 'active') return inv;

    if (inv.daysElapsed < inv.durationDays) {
      const dailyPayout = inv.dailyReturn;
      inv.earningsAccumulated += dailyPayout;
      inv.daysElapsed += 1;
      inv.lastPayoutDate = now.toISOString();

      if (inv.daysElapsed >= inv.durationDays) {
        inv.status = 'completed';
      }

      // Credit User
      state.users = state.users.map(u => {
        if (u.id === inv.userId) {
          return {
            ...u,
            walletBalance: u.walletBalance + dailyPayout,
            totalEarnings: u.totalEarnings + dailyPayout
          };
        }
        return u;
      });

      // Transaction log
      state.transactions.push({
        id: nextId('tx'),
        userId: inv.userId,
        userName: state.users.find(u => u.id === inv.userId)?.name || 'Investor',
        type: 'investment_payout',
        amount: dailyPayout,
        status: 'approved',
        date: now.toISOString(),
        planName: inv.planName,
        adminNote: `Manual Trading Day Simulation payout.`
      });

      // Notification
      state.notifications.push({
        id: nextId('notif'),
        userId: inv.userId,
        title: 'Trading Day Return Simulated',
        message: `Your ${inv.planName} Plan return of ₦${dailyPayout.toLocaleString()} has been credited via testing simulation.`,
        date: now.toISOString(),
        read: false
      });
    }
    return inv;
  });

  // Re-calculate active investments amount
  state.users = state.users.map(u => {
    const activeInv = state.investments
      .filter(inv => inv.userId === u.id && inv.status === 'active')
      .reduce((sum, inv) => sum + inv.amountInvested, 0);
    return {
      ...u,
      activeInvestmentsAmount: activeInv
    };
  });

  saveDbState(state);
  return state;
}

// User Actions
export function requestDeposit(userId: string, amount: number, paymentProof: string, receiptFile?: string, receiptFileName?: string): DbState {
  const state = getDbState();
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
  saveDbState(state);
  return state;
}

export function requestWithdrawal(userId: string, amount: number): { success: boolean; state: DbState; message: string } {
  const state = getDbState();
  const user = state.users.find(u => u.id === userId);
  if (!user) return { success: false, state, message: 'User not found' };

  if (amount < 10000) {
    return { success: false, state, message: 'Minimum withdrawal amount is ₦10,000.' };
  }

  if (user.walletBalance < amount) {
    return { success: false, state, message: 'Insufficient wallet balance' };
  }

  if (user.totalEarnings < amount) {
    return { success: false, state, message: `Withdrawals can only be initiated from your earnings. Your total earnings are ₦${user.totalEarnings.toLocaleString()}` };
  }

  // Deduct balance ONLY when admin approves, as specified in the rules:
  // "Only after the administrator approves the withdrawal should funds be deducted from the user's wallet and marked as completed."
  const tx: Transaction = {
    id: nextId('tx'),
    userId,
    userName: user.name,
    type: 'withdrawal',
    amount,
    status: 'pending',
    date: new Date().toISOString(),
  };

  state.transactions.push(tx);
  saveDbState(state);
  return { success: true, state, message: 'Withdrawal request submitted. Awaiting administrator approval.' };
}

// Buy investment plan
export function investInPlan(userId: string, planId: string, customAmount?: number): { success: boolean; state: DbState; message: string } {
  const state = getDbState();
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
      return { success: false, state, message: `Minimum investment for Elite Plan is ₦${(plan.minElite || 2000000).toLocaleString()}` };
    }
    if (customAmount > (plan.maxElite || 200000000)) {
      return { success: false, state, message: `Maximum investment for Elite Plan is ₦${(plan.maxElite || 200000000).toLocaleString()}` };
    }
    amount = customAmount;
    dailyPayout = customAmount * plan.dailyReturn; // dailyReturn acts as percentage rate for elite
  }

  if (user.walletBalance < amount) {
    return { success: false, state, message: 'Insufficient wallet balance. Please fund your wallet first.' };
  }

  // Deduct immediately from wallet balance to buy the plan
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
    durationDays: 30, // 30 days default duration
    daysElapsed: 0
  };

  state.investments.push(newInv);

  // Record Transaction for purchase
  state.transactions.push({
    id: nextId('tx'),
    userId,
    userName: user.name,
    type: 'investment_payout', // represents an investment debit/credit transaction
    amount: -amount, // Negative represent funding the plan
    status: 'approved',
    date: new Date().toISOString(),
    planName: plan.name,
    adminNote: `Purchased ${plan.name} Investment Plan.`
  });

  // Calculate new active investments amount
  user.activeInvestmentsAmount = state.investments
    .filter(inv => inv.userId === userId && inv.status === 'active')
    .reduce((sum, inv) => sum + inv.amountInvested, 0);

  // Trigger referral reward check!
  // "Earn a 10% referral commission based on qualifying referral investments, according to platform rules."
  if (state.referralRewardsEnabled && user.referredBy) {
    const referrer = state.users.find(u => u.referralCode === user.referredBy || u.id === user.referredBy);
    if (referrer) {
      const rewardRate = state.referralCommissionRate / 100;
      const rewardAmount = amount * rewardRate;

      referrer.walletBalance += rewardAmount;
      referrer.referralEarnings += rewardAmount;
      referrer.totalEarnings += rewardAmount;

      // Add referral commission transaction
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

      // Add notification for referrer
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

  // Save audit log
  state.auditLogs.push({
    id: nextId('log'),
    userId,
    action: 'BUY_PLAN',
    details: `Invested ₦${amount.toLocaleString()} in ${plan.name} Plan.`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });

  saveDbState(state);
  return { success: true, state, message: `Your investment in ${plan.name} Plan is now active!` };
}

// Admin Actions: Deposit Management
export function approveDeposit(txId: string, adminId: string, note?: string): DbState {
  const state = getDbState();
  const tx = state.transactions.find(t => t.id === txId && t.type === 'deposit');
  if (!tx || tx.status !== 'pending') return state;

  tx.status = 'approved';
  tx.adminNote = note || 'Approved by administrator';

  // Credit user wallet
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

  // Notify user
  state.notifications.push({
    id: nextId('notif'),
    userId: tx.userId,
    title: 'Deposit Approved',
    message: `Your deposit of ₦${tx.amount.toLocaleString()} has been approved. The funds are now available in your wallet.`,
    date: new Date().toISOString(),
    read: false
  });

  // Log admin action
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'APPROVE_DEPOSIT',
    details: `Approved deposit ID ${txId} of ₦${tx.amount.toLocaleString()} for user ID ${tx.userId}.`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });

  saveDbState(state);
  return state;
}

export function rejectDeposit(txId: string, adminId: string, note: string): DbState {
  const state = getDbState();
  const tx = state.transactions.find(t => t.id === txId && t.type === 'deposit');
  if (!tx || tx.status !== 'pending') return state;

  tx.status = 'rejected';
  tx.adminNote = note || 'Rejected by administrator';

  // Notify user
  state.notifications.push({
    id: nextId('notif'),
    userId: tx.userId,
    title: 'Deposit Rejected',
    message: `Your deposit of ₦${tx.amount.toLocaleString()} was rejected. Reason: ${note}`,
    date: new Date().toISOString(),
    read: false
  });

  // Log admin action
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'REJECT_DEPOSIT',
    details: `Rejected deposit ID ${txId} for user ID ${tx.userId}. Reason: ${note}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });

  saveDbState(state);
  return state;
}

// Admin Actions: Withdrawal Management
export function approveWithdrawal(txId: string, adminId: string, note?: string): DbState {
  const state = getDbState();
  const tx = state.transactions.find(t => t.id === txId && t.type === 'withdrawal');
  if (!tx || tx.status !== 'pending') return state;

  const user = state.users.find(u => u.id === tx.userId);
  if (!user) return state;

  if (user.walletBalance < tx.amount) {
    // Insufficient balance, auto-reject
    tx.status = 'rejected';
    tx.adminNote = 'System Auto-Rejected: Insufficient wallet balance.';
    saveDbState(state);
    return state;
  }

  tx.status = 'approved';
  tx.adminNote = note || 'Processed & Approved';

  // Deduct from wallet balance ONLY now that admin has approved!
  user.walletBalance -= tx.amount;
  user.totalWithdrawals += tx.amount;

  // Notify user
  state.notifications.push({
    id: nextId('notif'),
    userId: tx.userId,
    title: 'Withdrawal Approved',
    message: `Your withdrawal of ₦${tx.amount.toLocaleString()} has been approved and processed.`,
    date: new Date().toISOString(),
    read: false
  });

  // Log admin action
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'APPROVE_WITHDRAWAL',
    details: `Approved withdrawal ID ${txId} of ₦${tx.amount.toLocaleString()} for user ID ${tx.userId}.`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });

  saveDbState(state);
  return state;
}

export function rejectWithdrawal(txId: string, adminId: string, note: string): DbState {
  const state = getDbState();
  const tx = state.transactions.find(t => t.id === txId && t.type === 'withdrawal');
  if (!tx || tx.status !== 'pending') return state;

  tx.status = 'rejected';
  tx.adminNote = note || 'Rejected by administrator';

  // Notify user
  state.notifications.push({
    id: nextId('notif'),
    userId: tx.userId,
    title: 'Withdrawal Rejected',
    message: `Your withdrawal request of ₦${tx.amount.toLocaleString()} was rejected. Reason: ${note}`,
    date: new Date().toISOString(),
    read: false
  });

  // Log admin action
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'REJECT_WITHDRAWAL',
    details: `Rejected withdrawal ID ${txId} for user ID ${tx.userId}. Reason: ${note}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });

  saveDbState(state);
  return state;
}

// User Profile Settings & Verification
export function updateProfile(userId: string, data: Partial<User>): DbState {
  const state = getDbState();
  state.users = state.users.map(u => {
    if (u.id === userId) {
      return { ...u, ...data };
    }
    return u;
  });
  saveDbState(state);
  return state;
}

export function submitKyc(userId: string): DbState {
  const state = getDbState();
  state.users = state.users.map(u => {
    if (u.id === userId) {
      return { ...u, kycStatus: 'pending' };
    }
    return u;
  });
  // Add notification
  state.notifications.push({
    id: nextId('notif'),
    userId,
    title: 'KYC Documents Submitted',
    message: 'Your Identity Verification documents are under review.',
    date: new Date().toISOString(),
    read: false
  });
  saveDbState(state);
  return state;
}

export function approveKyc(userId: string, adminId: string): DbState {
  const state = getDbState();
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
  saveDbState(state);
  return state;
}

export function rejectKyc(userId: string, adminId: string): DbState {
  const state = getDbState();
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
  saveDbState(state);
  return state;
}

// Admin: Manage Users (Suspend / Edit / Delete)
export function adminUpdateUser(adminId: string, targetUserId: string, updates: Partial<User>): DbState {
  const state = getDbState();
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
  saveDbState(state);
  return state;
}

export function adminDeleteUser(adminId: string, targetUserId: string): DbState {
  const state = getDbState();
  state.users = state.users.filter(u => u.id !== targetUserId);
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'DELETE_USER',
    details: `Deleted user ${targetUserId} from system.`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  saveDbState(state);

  // Explicitly delete user from Supabase in the background
  if ((import.meta as any).env.VITE_SUPABASE_URL && (import.meta as any).env.VITE_SUPABASE_ANON_KEY) {
    supabase.from('users').delete().eq('id', targetUserId).then(({ error }) => {
      if (error) console.error('Error deleting user from Supabase:', error);
    });
  }

  return state;
}

// Admin: Plans management
export function adminCreatePlan(adminId: string, plan: Omit<InvestmentPlan, 'id'>): DbState {
  const state = getDbState();
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
  saveDbState(state);
  return state;
}

export function adminUpdatePlan(adminId: string, planId: string, updates: Partial<InvestmentPlan>): DbState {
  const state = getDbState();
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
  saveDbState(state);
  return state;
}

export function adminDeletePlan(adminId: string, planId: string): DbState {
  const state = getDbState();
  state.plans = state.plans.filter(p => p.id !== planId);
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'DELETE_PLAN',
    details: `Deleted investment plan ${planId}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  saveDbState(state);

  // Explicitly delete plan from Supabase in the background
  if ((import.meta as any).env.VITE_SUPABASE_URL && (import.meta as any).env.VITE_SUPABASE_ANON_KEY) {
    supabase.from('plans').delete().eq('id', planId).then(({ error }) => {
      if (error) console.error('Error deleting plan from Supabase:', error);
    });
  }

  return state;
}

// Admin: Referral settings
export function adminUpdateReferralSettings(adminId: string, enabled: boolean, rate: number): DbState {
  const state = getDbState();
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
  saveDbState(state);
  return state;
}

// Admin: Send Notifications
export function adminSendNotification(adminId: string, targetUserId: string, title: string, message: string): DbState {
  const state = getDbState();
  state.notifications.push({
    id: nextId('notif'),
    userId: targetUserId, // Can be 'all'
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
  saveDbState(state);
  return state;
}

// Admin: Update company settings
export function adminUpdateCompanySettings(
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
): DbState {
  const state = getDbState();
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
  saveDbState(state);
  return state;
}

export function adminVerifyBankDetails(
  adminId: string,
  targetUserId: string,
  status: 'verified' | 'rejected',
  note: string
): DbState {
  const state = getDbState();
  const user = state.users.find(u => u.id === targetUserId);
  if (user) {
    user.bankVerificationStatus = status;
    user.bankAdminNote = note;
    
    state.auditLogs.push({
      id: nextId('log'),
      userId: adminId,
      action: `VERIFY_BANK_${status.toUpperCase()}`,
      details: `Bank verification details approved/rejected for user ID ${targetUserId}. Note: ${note}`,
      date: new Date().toISOString(),
      ipAddress: '127.0.0.1'
    });
    
    // Also send user notification
    state.notifications.push({
      id: nextId('notif'),
      userId: targetUserId,
      title: status === 'verified' ? 'Bank Details Approved' : 'Bank Details Rejected',
      message: status === 'verified' 
        ? 'Your withdrawal bank details have been successfully verified by compliance.' 
        : `Your withdrawal bank details were rejected. Reason: ${note}. Please update them under Account settings.`,
      date: new Date().toISOString(),
      read: false
    });
  }
  saveDbState(state);
  return state;
}

export function adminEditUserBankDetails(
  adminId: string,
  targetUserId: string,
  bankName: string,
  bankHolder: string,
  bankNumber: string
): DbState {
  const state = getDbState();
  const user = state.users.find(u => u.id === targetUserId);
  if (user) {
    user.withdrawalBankName = bankName;
    user.withdrawalAccountName = bankHolder;
    user.withdrawalAccountNumber = bankNumber;
    user.bankVerificationStatus = 'verified';
    user.bankAdminNote = 'Updated and auto-verified by administrator.';
    
    state.auditLogs.push({
      id: nextId('log'),
      userId: adminId,
      action: 'ADMIN_EDIT_BANK_DETAILS',
      details: `Administrator updated bank details for user ID ${targetUserId}.`,
      date: new Date().toISOString(),
      ipAddress: '127.0.0.1'
    });
  }
  saveDbState(state);
  return state;
}

export function adminCreateTask(adminId: string, task: Omit<DailyTask, 'id'>): DbState {
  const state = getDbState();
  state.tasks = state.tasks || [];
  const newTask: DailyTask = {
    ...task,
    id: nextId('task')
  };
  state.tasks.push(newTask);
  
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'CREATE_TASK',
    details: `Created daily task: "${task.title}"`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  saveDbState(state);
  return state;
}

export function adminUpdateTask(adminId: string, taskId: string, updates: Partial<DailyTask>): DbState {
  const state = getDbState();
  state.tasks = state.tasks || [];
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    Object.assign(task, updates);
    state.auditLogs.push({
      id: nextId('log'),
      userId: adminId,
      action: 'UPDATE_TASK',
      details: `Updated task ID: ${taskId}`,
      date: new Date().toISOString(),
      ipAddress: '127.0.0.1'
    });
  }
  saveDbState(state);
  return state;
}

export function adminDeleteTask(adminId: string, taskId: string): DbState {
  const state = getDbState();
  state.tasks = state.tasks || [];
  state.tasks = state.tasks.filter(t => t.id !== taskId);
  
  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'DELETE_TASK',
    details: `Deleted task ID: ${taskId}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });
  saveDbState(state);
  return state;
}


export async function seedSupabase(state: DbState) {
  if (!(import.meta as any).env.VITE_SUPABASE_URL || !(import.meta as any).env.VITE_SUPABASE_ANON_KEY) return;

  try {
    console.log('Seeding Supabase with initial demo database...');
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

export async function pushToSupabase(state: DbState) {
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
    return getDbState();
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
      { data: settings }
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('transactions').select('*'),
      supabase.from('investments').select('*'),
      supabase.from('notifications').select('*'),
      supabase.from('referrals').select('*'),
      supabase.from('audit_logs').select('*'),
      supabase.from('plans').select('*'),
      supabase.from('settings').select('*')
    ]);

    if (errUsers) {
      console.warn('Could not read users from Supabase, possibly tables do not exist yet. Please run the SQL initialization script in your Supabase console.');
      return getDbState();
    }

    const state = getDbState();

    if (users && users.length > 0) {
      state.users = users as User[];
      state.transactions = (transactions || []) as Transaction[];
      state.investments = (investments || []) as Investment[];
      state.notifications = (notifications || []) as Notification[];
      state.referrals = (referrals || []) as Referral[];
      state.auditLogs = (auditLogs || []) as AuditLog[];
      state.plans = (plans || []) as InvestmentPlan[];

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

      // Save locally to keep the fast cached copy up to date
      if (typeof window !== 'undefined') {
        localStorage.setItem(DB_KEY, JSON.stringify(state));
      }
    } else {
      // Database exists but has no data: seed the default records so the application starts filled
      await seedSupabase(state);
    }

    return state;
  } catch (error) {
    console.error('Error pulling from Supabase:', error);
    return getDbState();
  }
}

