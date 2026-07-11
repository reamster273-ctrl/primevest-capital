export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  walletBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalEarnings: number;
  referralEarnings: number;
  activeInvestmentsAmount: number;
  kycStatus: 'unverified' | 'pending' | 'verified';
  status: 'active' | 'suspended';
  referralCode: string;
  referredBy?: string;
  tfaEnabled: boolean;
  verifiedEmail: boolean;
  registeredAt: string;
  loginCount: number;
  lastLoginIp?: string;
  password?: string;
  withdrawalBankName?: string;
  withdrawalAccountName?: string;
  withdrawalAccountNumber?: string;
  phoneNumber?: string;
  country?: string;
  profilePicture?: string;
  notificationPreferences?: {
    newTasks: boolean;
    taskCompletions: boolean;
    rewardClaims: boolean;
    rewardExpirations: boolean;
  };
  bankVerificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  bankAdminNote?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdrawal' | 'investment_payout' | 'referral_commission';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  paymentProof?: string; // base64 or description text
  receiptFile?: string; // base64 representation of receipt image or pdf
  receiptFileName?: string; // name of uploaded file
  adminNote?: string;
  planName?: string;
}

export interface Investment {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amountInvested: number;
  dailyReturn: number;
  earningsAccumulated: number;
  status: 'active' | 'completed';
  startDate: string;
  lastPayoutDate: string;
  durationDays: number;
  daysElapsed: number;
}

export interface Notification {
  id: string;
  userId: string; // 'all' for platform-wide announcements
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  refereeName: string;
  date: string;
  status: 'active' | 'inactive';
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  date: string;
  ipAddress: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  deposit: number; // 0 for elite dynamic range
  dailyReturn: number; // or percentage for elite
  type: 'basic' | 'premium' | 'elite';
  minElite?: number;
  maxElite?: number;
  paused: boolean;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  externalLink: string;
  platformType: 'facebook' | 'telegram' | 'twitter' | 'instagram' | 'youtube' | 'website' | 'whatsapp';
  startDate: string;
  expiryDate: string;
  active: boolean;
  rewardAmount: number;
}

export interface UserTaskClaim {
  id: string;
  userId: string;
  taskId: string;
  taskTitle: string;
  claimedAt: string;
  amount: number;
}
