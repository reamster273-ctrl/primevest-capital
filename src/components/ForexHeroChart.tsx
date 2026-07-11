import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, ArrowUpRight, ShieldCheck, Activity } from 'lucide-react';

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function ForexHeroChart() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [currentPrice, setCurrentPrice] = useState(1.08245);
  const [priceChange, setPriceChange] = useState(0.48);
  const [activeSignal, setActiveSignal] = useState('STRONG BUY');
  const [activeTab, setActiveTab] = useState<'EURUSD' | 'XAUUSD'>('EURUSD');

  // Generate initial candle data
  useEffect(() => {
    const initialCandles: Candle[] = [];
    let startPrice = activeTab === 'EURUSD' ? 1.07800 : 2290.00;
    
    for (let i = 0; i < 15; i++) {
      const change = (Math.random() - 0.4) * (activeTab === 'EURUSD' ? 0.0008 : 4.5);
      const open = startPrice;
      const close = startPrice + change;
      const high = Math.max(open, close) + Math.random() * (activeTab === 'EURUSD' ? 0.0004 : 2);
      const low = Math.min(open, close) - Math.random() * (activeTab === 'EURUSD' ? 0.0004 : 2);
      
      initialCandles.push({
        time: `${12 + i}:00`,
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 800) + 200,
      });
      startPrice = close;
    }
    setCandles(initialCandles);
    setCurrentPrice(startPrice);
  }, [activeTab]);

  // Live simulation ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCandles((prevCandles) => {
        if (prevCandles.length === 0) return prevCandles;
        const lastCandle = { ...prevCandles[prevCandles.length - 1] };
        const pipSize = activeTab === 'EURUSD' ? 0.00005 : 0.25;
        const tick = (Math.random() - 0.45) * pipSize;
        
        const newClose = lastCandle.close + tick;
        lastCandle.close = newClose;
        lastCandle.high = Math.max(lastCandle.high, newClose);
        lastCandle.low = Math.min(lastCandle.low, newClose);
        
        // Update live stats
        setCurrentPrice(newClose);
        const changePercent = activeTab === 'EURUSD' 
          ? ((newClose - 1.07800) / 1.07800) * 100 
          : ((newClose - 2290.0) / 2290.0) * 100;
        setPriceChange(changePercent);
        
        if (Math.random() > 0.85) {
          setActiveSignal(Math.random() > 0.6 ? 'STRONG BUY' : 'HEDGE ACTIVE');
        }

        return [...prevCandles.slice(0, prevCandles.length - 1), lastCandle];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Handle tab switch
  const handleTabChange = (tab: 'EURUSD' | 'XAUUSD') => {
    setActiveTab(tab);
    setPriceChange(tab === 'EURUSD' ? 0.48 : 1.22);
  };

  return (
    <div className="relative w-full rounded-[18px] bg-gradient-to-b from-[#1A1A1A] to-[#101010] border border-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden group">
      
      {/* Premium ambient light effects & gradients in background */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#D4AF37]/10 blur-[80px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[#FFD700]/10 blur-[80px] pointer-events-none animate-pulse" />
      
      {/* Foreground elements */}
      <div className="relative z-10 space-y-6">
        
        {/* Header Tab Toggles */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
            <button
              onClick={() => handleTabChange('EURUSD')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition duration-300 ${
                activeTab === 'EURUSD' 
                  ? 'bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-black font-semibold shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              EUR/USD
            </button>
            <button
              onClick={() => handleTabChange('XAUUSD')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition duration-300 ${
                activeTab === 'XAUUSD' 
                  ? 'bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-black font-semibold shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              XAU/USD (Gold)
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] text-emerald-400 font-mono tracking-widest uppercase">
            <Activity className="w-3 h-3 animate-pulse" />
            LIVE CORE FEED
          </div>
        </div>

        {/* Live Metrics Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 p-4 rounded-xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#D4AF37]" />
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Current Bid Price</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-semibold font-number tracking-tight text-white">
                {activeTab === 'EURUSD' ? currentPrice.toFixed(5) : currentPrice.toFixed(2)}
              </span>
              <span className={`text-xs font-semibold font-mono ${priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Neural Signal</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-emerald-400 font-mono tracking-wider">{activeSignal}</span>
              <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-[#D4AF37]">99.2% Acc.</span>
            </div>
          </div>
        </div>

        {/* Animated Forex Candlestick Chart Window */}
        <div className="relative h-44 w-full bg-black/40 rounded-xl border border-white/5 p-4 overflow-hidden flex items-end justify-between">
          
          {/* Subtle Grid Lines overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Glowing support/resistance lines */}
          <div className="absolute top-1/4 left-0 right-0 h-px bg-dashed bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent border-t border-dashed border-[#D4AF37]/10" />
          <div className="absolute bottom-1/4 left-0 right-0 h-px bg-dashed bg-gradient-to-r from-transparent via-[#D4AF37]/15 to-transparent border-t border-dashed border-[#D4AF37]/10" />

          {/* Render Candlesticks */}
          <div className="relative w-full h-full flex items-end justify-between gap-1 z-10 pt-4">
            {candles.map((candle, idx) => {
              const isGreen = candle.close >= candle.open;
              const maxHigh = Math.max(...candles.map(c => c.high));
              const minLow = Math.min(...candles.map(c => c.low));
              const spread = maxHigh - minLow || 1;
              
              // Map prices to percentages for visualization
              const bottomPercent = ((Math.min(candle.open, candle.close) - minLow) / spread) * 75 + 10;
              const heightPercent = (Math.abs(candle.close - candle.open) / spread) * 75 + 2;
              const wickBottom = ((candle.low - minLow) / spread) * 75 + 10;
              const wickTop = ((candle.high - minLow) / spread) * 75 + 10;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full relative group/candle">
                  
                  {/* Vertical Wick Line */}
                  <div 
                    className="absolute w-px bg-zinc-700 group-hover/candle:bg-[#D4AF37] transition-colors"
                    style={{
                      bottom: `${wickBottom}%`,
                      height: `${wickTop - wickBottom}%`,
                    }}
                  />
                  
                  {/* Candlestick Body */}
                  <motion.div
                    className={`absolute w-full rounded-sm shadow-sm cursor-crosshair transition-all duration-300 ${
                      isGreen 
                        ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-emerald-500/10' 
                        : 'bg-gradient-to-b from-red-400 to-red-600 shadow-red-500/10'
                    }`}
                    style={{
                      bottom: `${bottomPercent}%`,
                      height: `${heightPercent}%`,
                    }}
                    whileHover={{ scaleY: 1.1, brightness: 1.2 }}
                  />

                  {/* Hover tooltip */}
                  <div className="absolute bottom-full mb-2 bg-black border border-white/10 rounded px-2 py-1 text-[8px] font-mono text-zinc-300 opacity-0 group-hover/candle:opacity-100 transition duration-200 pointer-events-none z-50 whitespace-nowrap shadow-xl">
                    <span className="text-[#D4AF37]">O:</span> {candle.open.toFixed(activeTab === 'EURUSD' ? 5 : 1)} <span className="text-[#D4AF37]">C:</span> {candle.close.toFixed(activeTab === 'EURUSD' ? 5 : 1)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Running Sparkle Indicator / Floating trade executing dot */}
          <div className="absolute right-4 top-1/3 flex items-center gap-1.5 bg-black/80 border border-[#D4AF37]/30 px-2.5 py-1 rounded-full text-[9px] font-mono text-white animate-bounce">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            AI BUY ORDER EXECUTED
          </div>
        </div>

        {/* Bottom Trading Stats */}
        <div className="flex justify-between text-xs text-zinc-500 font-mono pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Secured liquidity pool</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#D4AF37]">
            <span>Vol: ₦424.8M / 24h</span>
          </div>
        </div>

      </div>
    </div>
  );
}
