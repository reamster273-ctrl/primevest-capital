import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, Shield, Cpu, Users, Award, 
  CheckCircle2, ArrowRight, HelpCircle, 
  MapPin, Mail, Phone, ExternalLink, 
  DollarSign, ChevronRight, Star, ArrowUpRight
} from 'lucide-react';
import { InvestmentPlan } from '../types';
import { getDbState } from '../db';
import ForexHeroChart from './ForexHeroChart';
import Footer from './Footer';

interface LandingPageProps {
  plans: InvestmentPlan[];
  onNavigate: (page: string, params?: any) => void;
}

export default function LandingPage({ plans, onNavigate }: LandingPageProps) {
  const db = getDbState();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [calcAmount, setCalcAmount] = useState(1700000);

  const testimonials = [
    {
      name: "Marcus Sterling",
      role: "Elite Wealth Manager",
      text: "PrimeVest Capital has completely transformed our client portfolio allocation. Their AI-driven forex strategies yield consistent daily returns while managing downside risks perfectly. A truly premium service.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
    },
    {
      name: "Chioma Nwachukwu",
      role: "Tech Entrepreneur",
      text: "The Premium 2 plan has given me true financial freedom. The returns are processed daily, and the withdrawal requests are always approved within hours. The gold standard of fintech investments.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
    },
    {
      name: "Farouq Bello",
      role: "Forex Specialist",
      text: "As a professional trader, I was skeptical of AI, but PrimeVest's hybrid approach of artificial intelligence model combined with expert human trader oversight is flawless. Superb risk-adjusted returns.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120"
    }
  ];

  const faqs = [
    {
      question: "What is PrimeVest Capital and how does it work?",
      answer: "PrimeVest Capital is a high-yield AI-powered Forex investment platform. We pool capital from international investors and allocate it to algorithmic AI-assisted high-frequency trading strategies and seasoned market professionals. This combination generates consistent, high-probability gains on the currency markets daily."
    },
    {
      question: "Are there any risks involved in trading Forex?",
      answer: "All financial investments carry some degree of risk. However, PrimeVest Capital employs institutional-grade risk management. We utilize strict stop-loss protocols, real-time market hedging, and trade size scaling, limiting potential maximum loss to a fraction of the capital."
    },
    {
      question: "What are the minimum and maximum deposit limits?",
      answer: "Our Starter Plan begins at ₦52,000 with a guaranteed daily return of up to ₦2,000. For our high-net-worth investors, our Elite Packages can accommodate capital investments up to ₦200,000,000 under custom premium yield agreements."
    },
    {
      question: "How long does it take to process deposit and withdrawal requests?",
      answer: "Deposits are credited to your account as soon as an administrator verifies your uploaded payment receipt (usually within 10 to 60 minutes). Withdrawal requests are thoroughly audited by compliance and transferred in less than 18 hours to maintain ultimate security, liquidity management, and compliance."
    },
    {
      question: "How does the Referral Program work?",
      answer: "Every registered investor receives a unique referral code and tracking link. When someone registers using your link and finances any investment plan, you will instantly receive a 10% cash commission of their deposit directly in your wallet balance."
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', message: '' });
      setFormSubmitted(false);
    }, 3000);
  };

  return (
    <div className="bg-black text-white font-sans min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 px-4 sm:px-6 lg:px-8 border-b border-yellow-950/20">
        {/* Abstract luxury background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-950/15 via-black to-black z-0" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
        
        {/* Decorative Grid Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)] z-0" />

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-yellow-950/40 border border-yellow-500/30 rounded-full px-4 py-1.5 text-xs text-yellow-500 font-mono tracking-wider uppercase"
            >
              <Cpu className="w-3.5 h-3.5 animate-pulse" /> Next-Gen AI Trading Algorithms Active
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-sans font-medium tracking-tight leading-[1.1] text-gray-100"
            >
              Grow Your Wealth with <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F9E29C] to-[#B8860B] font-extrabold">
                AI-Powered
              </span> Forex Trading
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-400 text-lg max-w-xl font-normal leading-relaxed"
            >
              Our premium trading algorithms and certified forex traders analyze global markets 24/7 to pinpoint risk-hedged opportunities. Secure, automated, and designed for consistent passive growth.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <button 
                onClick={() => onNavigate('register')}
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold hover:brightness-110 transition duration-300 shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
              >
                Register Now <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onNavigate('login')}
                className="px-8 py-4 rounded-lg bg-zinc-950 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition duration-300 text-sm uppercase tracking-wider font-semibold cursor-pointer"
              >
                Client Login
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('investment-plans');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-4 text-[#D4AF37] hover:text-[#F9E29C] font-semibold transition flex items-center gap-1.5 text-sm uppercase tracking-wider underline underline-offset-4 cursor-pointer"
              >
                Invest Now
              </button>
            </motion.div>

            {/* Withdrawal speed guarantee info banner */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="p-3.5 rounded-xl bg-zinc-950 border border-emerald-500/20 flex items-center gap-3 max-w-xl"
            >
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <div className="text-[11px] font-mono text-zinc-400 leading-normal">
                <span className="text-emerald-400 font-bold uppercase mr-1">Liquidity Guarantee:</span>
                All withdrawal operations are audited and dispatched in <strong className="text-white bg-emerald-950/60 border border-emerald-500/20 px-1.5 py-0.5 rounded">less than 18 hours</strong> 365 days a year.
              </div>
            </motion.div>

            {/* Simulated Live status and metrics */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-zinc-900/85 max-w-xl"
            >
              <div>
                <p className="text-xl font-bold font-sans text-yellow-500">₦22.8B+</p>
                <p className="text-zinc-500 text-[9px] uppercase tracking-widest font-mono mt-1">Total Funded</p>
              </div>
              <div>
                <p className="text-xl font-bold font-sans text-gray-200">14,250+</p>
                <p className="text-zinc-500 text-[9px] uppercase tracking-widest font-mono mt-1">Traders</p>
              </div>
              <div>
                <p className="text-xl font-bold font-sans text-yellow-500">99.2%</p>
                <p className="text-zinc-500 text-[9px] uppercase tracking-widest font-mono mt-1">AI Accuracy</p>
              </div>
              <div>
                <p className="text-xl font-bold font-sans text-emerald-400">&lt; 18h</p>
                <p className="text-zinc-500 text-[9px] uppercase tracking-widest font-mono mt-1">Withdrawals</p>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative hidden lg:block">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <ForexHeroChart />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-900 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-mono text-yellow-500">Institutional Grade</h2>
            <p className="text-3xl sm:text-4xl font-sans font-medium">Why Institutional Investors Choose PrimeVest</p>
            <div className="w-16 h-1 bg-yellow-500 mx-auto rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-yellow-500/30 transition duration-300 space-y-6">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">AI Neural Trading Models</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Our high-speed algorithms parse over 10,000 global parameters per second. Operating patterns are recognized in real time, executing profitable market entry and exit trades with ultimate precision.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-yellow-500/30 transition duration-300 space-y-6">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Fortified Capital Security</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Invest with absolute peace of mind. All deposits are backed by multi-layered secure trust reserves. Premium risk management locks total platform downside to under 2% margin risk daily.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-yellow-500/30 transition duration-300 space-y-6">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold">Expert Trader Supervision</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                AI technology is powerful, but we believe in double validation. Seasoned Forex professionals oversee all algorithmic output to filter out macro-geopolitical noise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-mono text-yellow-500">Passive Income Process</h2>
            <p className="text-3xl sm:text-4xl font-sans font-medium">How PrimeVest Generates Wealth For You</p>
            <div className="w-16 h-1 bg-yellow-500 mx-auto rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="space-y-4 text-center md:text-left relative">
              <div className="text-6xl font-bold font-mono text-yellow-500/10 absolute -top-8 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0">01</div>
              <h4 className="text-lg font-semibold pt-4 text-yellow-500">Register Account</h4>
              <p className="text-zinc-400 text-sm">Create a secure client profile in minutes and verify your email.</p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 text-center md:text-left relative">
              <div className="text-6xl font-bold font-mono text-yellow-500/10 absolute -top-8 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0">02</div>
              <h4 className="text-lg font-semibold pt-4 text-yellow-500">Fund Wallet</h4>
              <p className="text-zinc-400 text-sm">Upload payment receipts to fund your internal high-yield wallet via bank transfer or USDT.</p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 text-center md:text-left relative">
              <div className="text-6xl font-bold font-mono text-yellow-500/10 absolute -top-8 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0">03</div>
              <h4 className="text-lg font-semibold pt-4 text-yellow-500">Select Plan</h4>
              <p className="text-zinc-400 text-sm">Pick an active Basic, Premium, or Elite custom investment strategy matched to your financial targets.</p>
            </div>

            {/* Step 4 */}
            <div className="space-y-4 text-center md:text-left relative">
              <div className="text-6xl font-bold font-mono text-yellow-500/10 absolute -top-8 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0">04</div>
              <h4 className="text-lg font-semibold pt-4 text-yellow-500">Collect Daily Returns</h4>
              <p className="text-zinc-400 text-sm">AI strategies execute. Payouts are credited daily. Withdraw back to your bank account anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Plans */}
      <section id="investment-plans" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-900 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h2 className="text-xs uppercase tracking-widest font-mono text-yellow-500">Investment Tiers</h2>
            <p className="text-3xl sm:text-4xl font-sans font-medium">Select Your Optimal Wealth Strategy</p>
            <p className="text-zinc-500 text-sm max-w-xl mx-auto">Allocated capital runs on standard 30-day contracts, delivering professional yields. Click any plan to register and fund your secure balance.</p>
            
            {/* Prominent Risk Disclosure Notice */}
            <div className="p-6 rounded-[14px] bg-red-500/5 border border-red-500/10 max-w-3xl mx-auto text-left space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-red-400 font-bold block">⚠️ Regulatory Risk Disclosure</span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                <strong>Risk Disclosure:</strong> Forex trading involves substantial risk. Investment values can rise or fall, and returns are not guaranteed. Any projected returns shown on this platform are estimates based on strategy objectives and historical performance where applicable. Actual results may differ depending on market conditions.
              </p>
            </div>
            
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto rounded" />
          </div>

          {/* Basic Plans */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-2 border-[#D4AF37] pl-3">
              <h3 className="text-lg font-mono text-white font-semibold">Basic Investment Strategies</h3>
              <span className="inline-flex items-center gap-1.5 bg-[#D4AF37]/10 px-2.5 py-1 rounded-full text-[10px] text-[#D4AF37] font-mono tracking-wider uppercase font-semibold">
                Target Daily Return: Up to 3.2%
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.filter(p => p.type === 'basic' && !p.paused).map((plan) => (
                <div key={plan.id} className="bg-gradient-to-b from-[#1A1A1A] to-[#101010] border border-white/5 hover:border-[#D4AF37]/30 transition-all duration-300 p-8 rounded-[18px] flex flex-col justify-between group relative overflow-hidden shadow-2xl shadow-black">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xl font-bold text-gray-200">{plan.name}</h4>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-widest font-bold">Target Return</span>
                        <span className="text-[9px] text-zinc-500 font-mono">30 Days Contract</span>
                      </div>
                    </div>
                    <div className="py-2 border-b border-zinc-900">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Investment Capital</p>
                      <p className="text-3xl font-extrabold text-white mt-1">₦{plan.deposit.toLocaleString()}</p>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span>Daily Payout Target: ₦{plan.dailyReturn.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span>10% Instant Referral Commission</span>
                      </div>
                    </div>
                    
                    {/* Notice on Each Card */}
                    <p className="text-[10px] text-zinc-500 italic leading-relaxed pt-2 border-t border-zinc-900/60">
                      *Returns depend on market conditions and trading performance.
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigate('register')}
                    className="w-full mt-8 py-3 rounded-[14px] bg-zinc-950 border border-zinc-800 text-[#D4AF37] font-semibold hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#B8860B] hover:text-black hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
                  >
                    Invest Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Plans */}
          <div className="space-y-6 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-2 border-[#D4AF37] pl-3">
              <h3 className="text-lg font-mono text-white font-semibold">Premium Alpha Wealth Tiers</h3>
              <span className="inline-flex items-center gap-1.5 bg-[#D4AF37]/10 px-2.5 py-1 rounded-full text-[10px] text-[#D4AF37] font-mono tracking-wider uppercase font-semibold">
                Target Daily Return: Up to 3.7%
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.filter(p => p.type === 'premium' && !p.paused).map((plan) => (
                <div key={plan.id} className="bg-gradient-to-b from-[#1E190E] to-[#0A0A0A] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all duration-300 p-8 rounded-[18px] flex flex-col justify-between group relative overflow-hidden shadow-2xl shadow-[#D4AF37]/5">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent pointer-events-none" />
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xl font-bold text-gray-200">{plan.name}</h4>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] bg-[#D4AF37]/35 text-[#FFD700] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-widest font-bold">Target Return</span>
                        <span className="text-[9px] text-[#D4AF37] font-mono">High Yield Tier</span>
                      </div>
                    </div>
                    <div className="py-2 border-b border-zinc-900">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Investment Capital</p>
                      <p className="text-3xl font-extrabold text-[#D4AF37] mt-1">₦{plan.deposit.toLocaleString()}</p>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span className="font-semibold text-gray-200">Daily Payout Target: ₦{plan.dailyReturn.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span>Auto-Compound Option Enabled</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span>VIP Concierge Support Services</span>
                      </div>
                    </div>
                    
                    {/* Notice on Each Card */}
                    <p className="text-[10px] text-zinc-500 italic leading-relaxed pt-2 border-t border-zinc-900/60">
                      *Returns depend on market conditions and trading performance.
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigate('register')}
                    className="w-full mt-8 py-3 rounded-[14px] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold hover:brightness-110 transition duration-300 flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-lg shadow-[#D4AF37]/15 cursor-pointer"
                  >
                    Invest Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Elite Plan */}
          <div className="pt-8">
            <div className="p-8 sm:p-12 rounded-[18px] bg-gradient-to-r from-zinc-950 via-[#18150a] to-zinc-950 border border-[#D4AF37]/30 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent pointer-events-none" />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="inline-block text-xs uppercase tracking-widest font-mono text-[#D4AF37] bg-yellow-500/10 border border-[#D4AF37]/20 px-3 py-1 rounded-full">Elite Partnerships</span>
                    <span className="inline-flex items-center gap-1.5 bg-[#D4AF37]/10 px-2.5 py-1 rounded-full text-[10px] text-[#D4AF37] font-mono tracking-wider uppercase font-semibold">
                      Target Daily Return: Up to 4.0%
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-100">Custom Sovereign Trading Agreements</h3>
                  <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
                    Designed for ultra-high-net-worth individuals, institutional hedge funds, and family offices. Secure tailored custom daily payouts based on premium capital commitments between <strong>₦2,000,000</strong> and <strong>₦200,000,000</strong>.
                  </p>
                  <p className="text-[11px] text-[#D4AF37] italic font-semibold">
                    *Projected returns are determined by portfolio strategy and market performance.
                  </p>
                  <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs text-zinc-500 uppercase tracking-widest pt-2">
                    <span className="flex items-center gap-1.5 text-[#D4AF37]"><CheckCircle2 className="w-4 h-4" /> Custom Daily Yield Curve</span>
                    <span className="flex items-center gap-1.5 text-[#D4AF37]"><CheckCircle2 className="w-4 h-4" /> Personal Portfolio Architect</span>
                    <span className="flex items-center gap-1.5 text-[#D4AF37]"><CheckCircle2 className="w-4 h-4" /> Customized Withdraw Schedules</span>
                  </div>
                </div>
                <div className="lg:col-span-4 text-left lg:text-right">
                  <button 
                    onClick={() => onNavigate('register')}
                    className="px-8 py-4 rounded-[14px] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black hover:brightness-110 transition font-bold w-full lg:w-auto uppercase tracking-wider text-sm shadow-xl shadow-[#D4AF37]/15 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Contact Elite desk <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Program */}
      <section id="affiliate-ecosystem" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0D0D0D] border-b border-zinc-900 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase tracking-widest font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/10 inline-block">Affiliate Ecosystem</span>
            <h2 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight text-white">
              Earn Passive Yields: PrimeVest Multi-Tier Referral Program
            </h2>
            <p className="text-[#B5B5B5] text-sm sm:text-base leading-relaxed">
              Unlock a secure secondary stream of income without trading. Introduce other elite investors to PrimeVest Capital. You will instantly receive a premium <strong className="text-[#FFD700]">10% Referral Commission</strong> in real withdrawable funds based on qualifying capital entries from your network.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-5 rounded-[18px] bg-[#1A1A1A] border border-zinc-800 hover:border-[#D4AF37]/30 transition-all duration-300 flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-gray-200 text-sm">Instant Wallet Payout</h5>
                  <p className="text-zinc-500 text-xs mt-1 leading-relaxed">Commissions are processed and credited immediately upon referral funding verification.</p>
                </div>
              </div>
              <div className="p-5 rounded-[18px] bg-[#1A1A1A] border border-zinc-800 hover:border-[#D4AF37]/30 transition-all duration-300 flex items-start gap-4">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-gray-200 text-sm">Unlimited Affiliate Network</h5>
                  <p className="text-zinc-500 text-xs mt-1 leading-relaxed">Promote on Telegram, Twitter, WhatsApp, or email. Zero commission tier caps or limits.</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => onNavigate('register')}
              className="mt-4 px-6 py-3.5 rounded-[14px] bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-bold text-xs uppercase tracking-wider transition hover:brightness-110 shadow-lg shadow-[#D4AF37]/15 flex items-center gap-2 cursor-pointer"
            >
              Get Your Affiliate Link <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Calculator on the Right */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-[18px] bg-[#1A1A1A] border border-[#D4AF37]/20 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D4AF37]/5 to-transparent pointer-events-none" />
              
              <div className="text-center space-y-4">
                <p className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] font-semibold">Interactive Partner Calculator</p>
                
                <div className="space-y-1.5 text-center">
                  <p className="text-xs text-[#B5B5B5]">If your network allocation is:</p>
                  <p className="text-3xl font-bold text-white tracking-tight font-sans">
                    ₦{calcAmount.toLocaleString()}
                  </p>
                </div>

                {/* Slider bar */}
                <div className="space-y-2 py-2">
                  <input 
                    type="range" 
                    min="20000" 
                    max="50000000" 
                    step="20000"
                    value={calcAmount} 
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full accent-[#D4AF37] bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>₦20K</span>
                    <span>₦10M</span>
                    <span>₦25M</span>
                    <span>₦50M</span>
                  </div>
                </div>

                {/* Quick select buttons */}
                <div className="flex flex-wrap gap-2 justify-center py-1">
                  {[200000, 1000000, 5000000, 20000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCalcAmount(amt)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono border transition ${
                        calcAmount === amt 
                          ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-semibold' 
                          : 'bg-black/40 border-zinc-800 text-zinc-400 hover:text-white hover:border-[#D4AF37]/30'
                      }`}
                    >
                      ₦{(amt / 1000).toLocaleString()}K
                    </button>
                  ))}
                </div>

                <div className="w-16 h-[1px] bg-[#D4AF37]/20 mx-auto my-3" />

                <div className="space-y-2">
                  <p className="text-xs text-[#B5B5B5]">Your instant commission yield:</p>
                  <p className="text-4xl font-extrabold text-[#FFD700] tracking-tight font-sans animate-pulse">
                    ₦{Math.round(calcAmount * 0.1).toLocaleString()}
                  </p>
                  <div className="p-2.5 bg-black/60 rounded-lg border border-zinc-900">
                    <p className="text-[10px] text-[#D4AF37] font-mono uppercase tracking-widest font-bold">
                      10% DIRECT TRANSFERABLE ROYALTY
                    </p>
                    <p className="text-[9px] text-zinc-600 mt-1 leading-relaxed">
                      Instant distribution, no waiting periods, directly withdrawable to any Nigerian bank or USDT wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-900">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-mono text-yellow-500">Clear Answers</h2>
            <p className="text-3xl sm:text-4xl font-sans font-medium">Frequently Asked Questions</p>
            <div className="w-16 h-1 bg-yellow-500 mx-auto rounded" />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950 transition-colors duration-250"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left p-6 flex justify-between items-center hover:bg-zinc-900/40 text-gray-200"
                >
                  <span className="font-semibold text-sm sm:text-base">{faq.question}</span>
                  <ChevronRight className={`w-5 h-5 text-yellow-500 transition-transform duration-200 ${activeFaq === idx ? 'rotate-90' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="p-6 pt-0 border-t border-zinc-900 text-zinc-400 text-sm leading-relaxed bg-black/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-mono text-yellow-500">Client Reviews</h2>
            <p className="text-3xl sm:text-4xl font-sans font-medium">What Global Investors Say About PrimeVest</p>
            <div className="w-16 h-1 bg-yellow-500 mx-auto rounded" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="p-8 rounded-xl bg-black border border-zinc-900 flex flex-col justify-between space-y-6">
                <p className="text-zinc-400 text-sm leading-relaxed italic">"{test.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={test.avatar} alt={test.name} className="w-10 h-10 rounded-full border border-yellow-500/20 object-cover" />
                  <div>
                    <h5 className="font-semibold text-gray-200 text-sm">{test.name}</h5>
                    <p className="text-xs text-zinc-500 font-mono">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-2xl p-8 space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-widest font-mono text-yellow-500">Inquiries Desk</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-200">{db.inquiriesDeskTitle || 'Connect with PrimeVest Advisors'}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {db.inquiriesDeskText || 'Have custom compliance, regulatory, or institutional partnership questions? Our premium advisor team is here to support you 24 hours a day, 5 days a week.'}
              </p>
            </div>

            <div className="space-y-4 font-mono text-xs sm:text-sm text-zinc-400">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-yellow-500" />
                <span>{db.inquiriesDeskAddress || 'Level 24, Tower 3, Marina Mall Financial Center, Lagos'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-yellow-500" />
                <span>{db.inquiriesDeskEmail || 'support@primevest.capital'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-yellow-500" />
                <span>{db.inquiriesDeskPhone || '+234 (1) 4950 200'}</span>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
              PrimeVest Capital LLC is registered under global financial service structures, executing clearing and asset protection guarantees with fully verified tier-1 global banking assets.
            </p>
          </div>

          <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-2xl p-8">
            <h4 className="text-xl font-bold text-gray-200 mb-6">Send Secure Message</h4>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest font-mono text-zinc-400">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none transition" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-widest font-mono text-zinc-400">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none transition" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest font-mono text-zinc-400">Your Message</label>
                <textarea 
                  rows={4} 
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full bg-black border border-zinc-800 rounded px-4 py-2 text-sm focus:border-yellow-500 focus:outline-none transition resize-none"
                ></textarea>
              </div>
              {formSubmitted ? (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-500 rounded text-sm font-semibold">
                  Thank you! Your message has been routed to our advisors.
                </div>
              ) : (
                <button 
                  type="submit" 
                  className="px-6 py-3 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold uppercase tracking-wider text-xs transition duration-300 w-full"
                >
                  Submit Encrypted Inquiry
                </button>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="detailed" onNavigate={onNavigate} />
    </div>
  );
}
