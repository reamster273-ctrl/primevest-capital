import { createClient } from '@supabase/supabase-js';

// Access client-side Vite environment variables
const rawUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim();
const rawKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim();

function isValidUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    if (parsed.hostname.includes('your-project.supabase.co')) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

let supabaseInstance: any;

if (isValidUrl(rawUrl) && rawKey) {
  try {
    supabaseInstance = createClient(rawUrl, rawKey);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

if (!supabaseInstance) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are missing, placeholder, or invalid. ' +
    'The application will fall back to localStorage/mock-based operations until valid credentials are provided.'
  );

  // Return a safe mock proxy that handles chained builder methods and thenable promises gracefully
  const makeMock = (): any => {
    const mockTarget = () => {};
    return new Proxy(mockTarget, {
      get(target, prop) {
        if (prop === 'then') {
          return (resolve: any) => resolve({ data: [], error: null });
        }
        return makeMock();
      },
      apply() {
        return makeMock();
      }
    });
  };
  supabaseInstance = makeMock();
}

export const supabase = supabaseInstance;

/**
 * ============================================================================
 * SUPABASE SQL SCHEMA INITIALIZATION SCRIPT
 * ============================================================================
 * Copy and run this script in your Supabase SQL Editor to create all required
 * tables and set up row-level permissions (or disable Row-Level Security
 * for a simple prototype/integration).
 * 
 * -- 1. Users Table
 * CREATE TABLE IF NOT EXISTS users (
 *   id TEXT PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   email TEXT NOT NULL UNIQUE,
 *   role TEXT NOT NULL DEFAULT 'user',
 *   "walletBalance" NUMERIC NOT NULL DEFAULT 0,
 *   "totalDeposits" NUMERIC NOT NULL DEFAULT 0,
 *   "totalWithdrawals" NUMERIC NOT NULL DEFAULT 0,
 *   "totalEarnings" NUMERIC NOT NULL DEFAULT 0,
 *   "referralEarnings" NUMERIC NOT NULL DEFAULT 0,
 *   "activeInvestmentsAmount" NUMERIC NOT NULL DEFAULT 0,
 *   "kycStatus" TEXT NOT NULL DEFAULT 'unverified',
 *   status TEXT NOT NULL DEFAULT 'active',
 *   "referralCode" TEXT NOT NULL UNIQUE,
 *   "referredBy" TEXT,
 *   "tfaEnabled" BOOLEAN NOT NULL DEFAULT false,
 *   "verifiedEmail" BOOLEAN NOT NULL DEFAULT false,
 *   "registeredAt" TEXT NOT NULL,
 *   "loginCount" INTEGER NOT NULL DEFAULT 0,
 *   "lastLoginIp" TEXT,
 *   password TEXT,
 *   "withdrawalBankName" TEXT,
 *   "withdrawalAccountName" TEXT,
 *   "withdrawalAccountNumber" TEXT
 * );
 * 
 * -- 2. Transactions Table
 * CREATE TABLE IF NOT EXISTS transactions (
 *   id TEXT PRIMARY KEY,
 *   "userId" TEXT NOT NULL,
 *   "userName" TEXT NOT NULL,
 *   type TEXT NOT NULL,
 *   amount NUMERIC NOT NULL,
 *   status TEXT NOT NULL DEFAULT 'pending',
 *   date TEXT NOT NULL,
 *   "paymentProof" TEXT,
 *   "receiptFile" TEXT,
 *   "receiptFileName" TEXT,
 *   "adminNote" TEXT,
 *   "planName" TEXT
 * );
 * 
 * -- 3. Investments Table
 * CREATE TABLE IF NOT EXISTS investments (
 *   id TEXT PRIMARY KEY,
 *   "userId" TEXT NOT NULL,
 *   "planId" TEXT NOT NULL,
 *   "planName" TEXT NOT NULL,
 *   "amountInvested" NUMERIC NOT NULL,
 *   "dailyReturn" NUMERIC NOT NULL,
 *   "earningsAccumulated" NUMERIC NOT NULL DEFAULT 0,
 *   status TEXT NOT NULL DEFAULT 'active',
 *   "startDate" TEXT NOT NULL,
 *   "lastPayoutDate" TEXT NOT NULL,
 *   "durationDays" INTEGER NOT NULL,
 *   "daysElapsed" INTEGER NOT NULL DEFAULT 0
 * );
 * 
 * -- 4. Notifications Table
 * CREATE TABLE IF NOT EXISTS notifications (
 *   id TEXT PRIMARY KEY,
 *   "userId" TEXT NOT NULL,
 *   title TEXT NOT NULL,
 *   message TEXT NOT NULL,
 *   date TEXT NOT NULL,
 *   read BOOLEAN NOT NULL DEFAULT false
 * );
 * 
 * -- 5. Referrals Table
 * CREATE TABLE IF NOT EXISTS referrals (
 *   id TEXT PRIMARY KEY,
 *   "referrerId" TEXT NOT NULL,
 *   "refereeId" TEXT NOT NULL,
 *   "refereeName" TEXT NOT NULL,
 *   date TEXT NOT NULL,
 *   status TEXT NOT NULL DEFAULT 'active'
 * );
 * 
 * -- 6. Audit Logs Table
 * CREATE TABLE IF NOT EXISTS audit_logs (
 *   id TEXT PRIMARY KEY,
 *   "userId" TEXT NOT NULL,
 *   action TEXT NOT NULL,
 *   details TEXT NOT NULL,
 *   date TEXT NOT NULL,
 *   "ipAddress" TEXT NOT NULL
 * );
 * 
 * -- 7. Investment Plans Table
 * CREATE TABLE IF NOT EXISTS plans (
 *   id TEXT PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   deposit NUMERIC NOT NULL DEFAULT 0,
 *   "dailyReturn" NUMERIC NOT NULL DEFAULT 0,
 *   type TEXT NOT NULL,
 *   "minElite" NUMERIC,
 *   "maxElite" NUMERIC,
 *   paused BOOLEAN NOT NULL DEFAULT false
 * );
 * 
 * -- 8. System Settings Table
 * CREATE TABLE IF NOT EXISTS settings (
 *   key TEXT PRIMARY KEY,
 *   value JSONB NOT NULL
 * );
 */
