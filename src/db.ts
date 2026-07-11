import { User, Transaction, Investment, Notification, Referral, AuditLog, InvestmentPlan, DailyTask, UserTaskClaim } from './types';

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
  tasks: DailyTask[];
  taskClaims: UserTaskClaim[];
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
  users: [
    {
      id: 'admin-1',
      name: 'PrimeVest Administrator',
      email: 'admin@primevest.capital',
      role: 'admin',
      walletBalance: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalEarnings: 0,
      referralEarnings: 0,
      activeInvestmentsAmount: 0,
      kycStatus: 'verified',
      status: 'active',
      referralCode: 'PRIMEADMIN',
      tfaEnabled: true,
      verifiedEmail: true,
      registeredAt: '2026-01-01T08:00:00Z',
      loginCount: 42,
    },
    {
      id: 'user-1',
      name: 'Jonathan Adebayo',
      email: 'jonathan@example.com',
      role: 'user',
      walletBalance: 84000,
      totalDeposits: 250000,
      totalWithdrawals: 30000,
      totalEarnings: 109000,
      referralEarnings: 5200,
      activeInvestmentsAmount: 130000,
      kycStatus: 'verified',
      status: 'active',
      referralCode: 'JONATHAN88',
      referredBy: 'CHIDI247',
      tfaEnabled: false,
      verifiedEmail: true,
      registeredAt: '2026-06-15T10:30:00Z',
      loginCount: 18,
    },
    {
      id: 'user-2',
      name: 'Chidi Okafor',
      email: 'chidi@example.com',
      role: 'user',
      walletBalance: 12500,
      totalDeposits: 52000,
      totalWithdrawals: 0,
      totalEarnings: 15200,
      referralEarnings: 13000,
      activeInvestmentsAmount: 52000,
      kycStatus: 'pending',
      status: 'active',
      referralCode: 'CHIDI247',
      tfaEnabled: true,
      verifiedEmail: true,
      registeredAt: '2026-06-10T14:15:00Z',
      loginCount: 25,
    },
    {
      id: 'user-3',
      name: 'Halima Yusuf',
      email: 'halima@example.com',
      role: 'user',
      walletBalance: 1500000,
      totalDeposits: 1500000,
      totalWithdrawals: 0,
      totalEarnings: 0,
      referralEarnings: 0,
      activeInvestmentsAmount: 0,
      kycStatus: 'unverified',
      status: 'active',
      referralCode: 'HALIMAY',
      tfaEnabled: false,
      verifiedEmail: false,
      registeredAt: '2026-07-09T17:40:00Z',
      loginCount: 2,
    }
  ],
  transactions: [
    {
      id: 'tx-1',
      userId: 'user-1',
      userName: 'Jonathan Adebayo',
      type: 'deposit',
      amount: 120000,
      status: 'approved',
      date: '2026-06-15T11:00:00Z',
      paymentProof: 'Bank Transfer Receipt #4829104',
      adminNote: 'Verified bank wire.'
    },
    {
      id: 'tx-2',
      userId: 'user-1',
      userName: 'Jonathan Adebayo',
      type: 'deposit',
      amount: 130000,
      status: 'approved',
      date: '2026-06-20T09:15:00Z',
      paymentProof: 'Access Bank Transfer Screenshot',
      adminNote: 'Instantly credited.'
    },
    {
      id: 'tx-3',
      userId: 'user-1',
      userName: 'Jonathan Adebayo',
      type: 'withdrawal',
      amount: 30000,
      status: 'approved',
      date: '2026-06-28T16:00:00Z',
      adminNote: 'Processed via USDT wallet.'
    },
    {
      id: 'tx-4',
      userId: 'user-2',
      userName: 'Chidi Okafor',
      type: 'deposit',
      amount: 52000,
      status: 'approved',
      date: '2026-06-10T15:00:00Z',
      paymentProof: 'Proof of Payment: GTBank receipt',
      adminNote: 'Approved on review.'
    },
    {
      id: 'tx-5',
      userId: 'user-3',
      userName: 'Halima Yusuf',
      type: 'deposit',
      amount: 1500000,
      status: 'pending',
      date: '2026-07-09T18:00:00Z',
      paymentProof: 'UBA Mobile Banking PDF Receipt'
    }
  ],
  investments: [
    {
      id: 'inv-1',
      userId: 'user-1',
      planId: 'growth',
      planName: 'Growth',
      amountInvested: 130000,
      dailyReturn: 5500,
      earningsAccumulated: 104000,
      status: 'active',
      startDate: '2026-06-21T00:00:00Z',
      lastPayoutDate: '2026-07-09T00:00:00Z',
      durationDays: 30,
      daysElapsed: 18
    },
    {
      id: 'inv-2',
      userId: 'user-2',
      planId: 'starter',
      planName: 'Starter',
      amountInvested: 52000,
      dailyReturn: 2000,
      earningsAccumulated: 15200,
      status: 'active',
      startDate: '2026-07-02T00:00:00Z',
      lastPayoutDate: '2026-07-09T00:00:00Z',
      durationDays: 30,
      daysElapsed: 7
    }
  ],
  notifications: [
    {
      id: 'notif-1',
      userId: 'user-1',
      title: 'Deposit Approved',
      message: 'Your deposit of ₦120,000 has been approved and credited to your wallet.',
      date: '2026-06-15T11:05:00Z',
      read: true
    },
    {
      id: 'notif-2',
      userId: 'user-1',
      title: 'Withdrawal Completed',
      message: 'Your withdrawal request of ₦30,000 has been approved and sent to your bank account.',
      date: '2026-06-28T16:15:00Z',
      read: false
    },
    {
      id: 'notif-3',
      userId: 'user-2',
      title: 'KYC Under Review',
      message: 'Your KYC documents have been submitted and are currently being reviewed by compliance.',
      date: '2026-06-11T09:00:00Z',
      read: true
    },
    {
      id: 'notif-all-1',
      userId: 'all',
      title: 'System Upgrade Complete',
      message: 'We have optimized our AI-trading algorithm to premium Space 2.0 version, expecting increased market accuracy.',
      date: '2026-07-01T00:00:00Z',
      read: false
    }
  ],
  referrals: [
    {
      id: 'ref-1',
      referrerId: 'user-2',
      refereeId: 'user-1',
      refereeName: 'Jonathan Adebayo',
      date: '2026-06-15T10:30:00Z',
      status: 'active'
    }
  ],
  auditLogs: [
    {
      id: 'log-1',
      userId: 'admin-1',
      action: 'LOGIN',
      details: 'Admin logged in successfully.',
      date: '2026-07-10T08:00:00Z',
      ipAddress: '197.210.64.12'
    },
    {
      id: 'log-2',
      userId: 'admin-1',
      action: 'APPROVE_DEPOSIT',
      details: 'Approved deposit of ₦130,000 for Jonathan Adebayo',
      date: '2026-06-20T09:15:00Z',
      ipAddress: '197.210.64.12'
    }
  ],
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
  tasks: [
    {
      id: 'task-1',
      title: 'Follow our Facebook Page',
      description: 'Follow our official Facebook page to receive direct updates, insights and financial analysis.',
      buttonText: 'Follow Facebook',
      externalLink: 'https://facebook.com/primevest.capital',
      platformType: 'facebook',
      startDate: '2026-07-01T00:00:00Z',
      expiryDate: '2026-08-31T23:59:59Z',
      active: true,
      rewardAmount: 500,
    },
    {
      id: 'task-2',
      title: 'Join our Telegram Channel',
      description: 'Get instant notifications on trading signals, plan additions and custom market calls.',
      buttonText: 'Join Telegram',
      externalLink: 'https://t.me/primevest_capital',
      platformType: 'telegram',
      startDate: '2026-07-01T00:00:00Z',
      expiryDate: '2026-08-31T23:59:59Z',
      active: true,
      rewardAmount: 1000,
    },
    {
      id: 'task-3',
      title: 'Follow us on X (Twitter)',
      description: 'Stay updated with our short financial threads and market micro-news on Twitter.',
      buttonText: 'Follow @PrimeVest',
      externalLink: 'https://x.com/primevest',
      platformType: 'twitter',
      startDate: '2026-07-01T00:00:00Z',
      expiryDate: '2026-08-31T23:59:59Z',
      active: true,
      rewardAmount: 750,
    }
  ],
  taskClaims: [
    {
      id: 'claim-1',
      userId: 'user-1',
      taskId: 'task-1',
      taskTitle: 'Follow our Facebook Page',
      claimedAt: '2026-07-10T11:00:00Z',
      amount: 500
    }
  ]
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

// Admin: Bank Verification Actions
export function adminVerifyBankDetails(adminId: string, targetUserId: string, status: 'verified' | 'rejected', adminNote?: string): DbState {
  const state = getDbState();
  state.users = state.users.map(u => {
    if (u.id === targetUserId) {
      return { 
        ...u, 
        bankVerificationStatus: status,
        bankAdminNote: adminNote || ''
      };
    }
    return u;
  });
  
  // Add notification for user
  const user = state.users.find(u => u.id === targetUserId);
  if (user) {
    state.notifications.push({
      id: nextId('notif'),
      userId: targetUserId,
      title: status === 'verified' ? 'Bank Account Verified' : 'Bank Account Rejected',
      message: status === 'verified' 
        ? 'Your saved withdrawal bank details have been verified and locked. You can now request payouts seamlessly.'
        : `Your saved withdrawal bank details were rejected: ${adminNote || 'incorrect details'}. Please revise in Settings.`,
      date: new Date().toISOString(),
      read: false
    });
  }

  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'VERIFY_BANK',
    details: `Updated user ${targetUserId} bank details verification to ${status}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });

  saveDbState(state);
  return state;
}

export function adminEditUserBankDetails(
  adminId: string,
  targetUserId: string,
  bankName: string,
  accountName: string,
  accountNumber: string
): DbState {
  const state = getDbState();
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
    action: 'EDIT_BANK_DETAILS',
    details: `Directly edited user ${targetUserId} bank details`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });

  saveDbState(state);
  return state;
}

// Admin: Task Management
export function adminCreateTask(adminId: string, task: Omit<DailyTask, 'id'>): DbState {
  const state = getDbState();
  const newTask: DailyTask = {
    ...task,
    id: nextId('task')
  };
  state.tasks.push(newTask);

  // Send system-wide notification
  state.notifications.push({
    id: nextId('notif'),
    userId: 'all',
    title: 'New Daily Engagement Task',
    message: `A new task has been published: "${task.title}". Complete it to claim your reward of ₦${task.rewardAmount}!`,
    date: new Date().toISOString(),
    read: false
  });

  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'CREATE_TASK',
    details: `Created task "${task.title}" with reward ₦${task.rewardAmount}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });

  saveDbState(state);
  return state;
}

export function adminUpdateTask(adminId: string, taskId: string, updates: Partial<DailyTask>): DbState {
  const state = getDbState();
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
    details: `Updated task ${taskId}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });

  saveDbState(state);
  return state;
}

export function adminDeleteTask(adminId: string, taskId: string): DbState {
  const state = getDbState();
  state.tasks = state.tasks.filter(t => t.id !== taskId);
  state.taskClaims = state.taskClaims.filter(c => c.taskId !== taskId);

  state.auditLogs.push({
    id: nextId('log'),
    userId: adminId,
    action: 'DELETE_TASK',
    details: `Deleted task ${taskId}`,
    date: new Date().toISOString(),
    ipAddress: '127.0.0.1'
  });

  saveDbState(state);
  return state;
}

// User: Claim Reward
export function claimDailyReward(userId: string, taskId: string): { success: boolean; state: DbState; message: string } {
  const state = getDbState();
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) {
    return { success: false, state, message: 'Task not found.' };
  }

  if (!task.active) {
    return { success: false, state, message: 'This task is currently inactive.' };
  }

  // Check if task has expired (expiryDate is ISO String)
  const now = new Date();
  if (new Date(task.expiryDate) < now) {
    return { success: false, state, message: 'This task has expired.' };
  }

  // Check if already claimed today/overall for this task
  const alreadyClaimed = state.taskClaims.some(c => c.userId === userId && c.taskId === taskId);
  if (alreadyClaimed) {
    return { success: false, state, message: 'You have already claimed the reward for this task.' };
  }

  // Add reward to user wallet balance and earnings
  state.users = state.users.map(u => {
    if (u.id === userId) {
      return {
        ...u,
        walletBalance: u.walletBalance + task.rewardAmount,
        totalEarnings: u.totalEarnings + task.rewardAmount
      };
    }
    return u;
  });

  // Create claim record
  const newClaim: UserTaskClaim = {
    id: nextId('claim'),
    userId,
    taskId,
    taskTitle: task.title,
    claimedAt: now.toISOString(),
    amount: task.rewardAmount
  };
  state.taskClaims.push(newClaim);

  // Send user confirmation notification
  state.notifications.push({
    id: nextId('notif'),
    userId,
    title: 'Daily Reward Claimed!',
    message: `You successfully completed the task "${task.title}" and claimed ₦${task.rewardAmount}!`,
    date: now.toISOString(),
    read: false
  });

  // Create transaction log so it shows up in Ledger
  state.transactions.push({
    id: nextId('tx'),
    userId,
    userName: state.users.find(u => u.id === userId)?.name || 'User',
    type: 'investment_payout', // Use investment_payout or maybe show it in ledger as part of earnings?
    amount: task.rewardAmount,
    status: 'approved',
    date: now.toISOString(),
    planName: 'Daily Engagement Task Reward'
  });

  state.auditLogs.push({
    id: nextId('log'),
    userId,
    action: 'CLAIM_TASK_REWARD',
    details: `Claimed ₦${task.rewardAmount} for task "${task.title}"`,
    date: now.toISOString(),
    ipAddress: '127.0.0.1'
  });

  saveDbState(state);
  return { success: true, state, message: `Successfully claimed ₦${task.rewardAmount.toLocaleString()} reward!` };
}

