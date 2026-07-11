import React from 'react';

interface FooterProps {
  variant?: 'detailed' | 'minimal';
  onNavigate?: (page: string) => void;
}

export default function Footer({ variant = 'detailed', onNavigate }: FooterProps) {
  const handleAlert = (message: string) => {
    alert(message);
  };

  if (variant === 'minimal') {
    return (
      <footer className="border-t border-[#D4AF37]/5 bg-black/60 py-6 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Secure Web Session Active</span>
            <span className="text-zinc-700">|</span>
            <span>PrimeVest Secure Core v3.8</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => handleAlert("Terms of Service is accepted by default during registration.")}
              className="hover:text-[#D4AF37] transition cursor-pointer"
            >
              Terms
            </button>
            <button 
              onClick={() => handleAlert("Privacy Policy is maintained according to strict financial guidelines.")}
              className="hover:text-[#D4AF37] transition cursor-pointer"
            >
              Privacy
            </button>
            <button 
              onClick={() => handleAlert("All investments carry risk. See official Risk Disclosures in public portal.")}
              className="hover:text-[#D4AF37] transition cursor-pointer"
            >
              Regulatory
            </button>
            <span className="text-zinc-700">|</span>
            <span>© 2026 PrimeVest Capital LLC.</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-[#D4AF37]/10 bg-black pt-16 pb-8 px-4 sm:px-6 lg:px-8 w-full z-10 relative">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[#D4AF37] text-2xl font-black">PV</span>
              <span className="font-sans font-bold text-lg tracking-tight text-white">
                PRIME<span className="text-[#D4AF37] font-extrabold">VEST</span>
              </span>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed font-mono">
              AI-powered premium Forex portfolio investments and asset management. Built for maximum yield, secured with modern stops and sovereign risk models.
            </p>
          </div>

          <div>
            <h5 className="font-mono text-xs uppercase tracking-widest text-[#D4AF37] mb-4">Investment</h5>
            <ul className="space-y-2 text-zinc-400 text-xs font-mono">
              <li>
                <a 
                  href="#investment-plans" 
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('home');
                      setTimeout(() => {
                        const el = document.getElementById('investment-plans');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }} 
                  className="hover:text-[#FFD700] transition"
                >
                  Basic Strategies
                </a>
              </li>
              <li>
                <a 
                  href="#investment-plans" 
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('home');
                      setTimeout(() => {
                        const el = document.getElementById('investment-plans');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }} 
                  className="hover:text-[#FFD700] transition"
                >
                  Premium Alpha Tiers
                </a>
              </li>
              <li>
                <a 
                  href="#investment-plans" 
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('home');
                      setTimeout(() => {
                        const el = document.getElementById('investment-plans');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }} 
                  className="hover:text-[#FFD700] transition"
                >
                  Elite Wealth Desk
                </a>
              </li>
              <li>
                <a 
                  href="#affiliate-ecosystem" 
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('home');
                      setTimeout(() => {
                        const el = document.getElementById('affiliate-ecosystem');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }} 
                  className="hover:text-[#FFD700] transition text-left"
                >
                  Affiliate Network
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-mono text-xs uppercase tracking-widest text-[#D4AF37] mb-4">Company</h5>
            <ul className="space-y-2 text-zinc-400 text-xs font-mono">
              <li>
                <button 
                  onClick={() => handleAlert("Terms of Service is accepted by default during registration.")} 
                  className="hover:text-[#FFD700] transition text-left cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleAlert("Privacy Policy is maintained according to strict financial guidelines.")} 
                  className="hover:text-[#FFD700] transition text-left cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleAlert("All investments carry risk. See official Risk Disclosures below.")} 
                  className="hover:text-[#FFD700] transition text-left cursor-pointer"
                >
                  Regulatory Licenses
                </button>
              </li>
              <li>
                <a 
                  href="#investment-plans" 
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate('home');
                      setTimeout(() => {
                        const el = document.getElementById('investment-plans');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }} 
                  className="hover:text-[#FFD700] transition"
                >
                  Interactive FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-mono text-xs uppercase tracking-widest text-[#D4AF37] mb-4">Secured Platform</h5>
            <p className="text-zinc-500 text-xs leading-relaxed font-mono">
              Protected by premium tier infrastructure, 256-Bit SSL Encryption, and multi-tier cold-storage liquidity vaults. Secure your wealth.
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-8 flex flex-col space-y-4">
          <h6 className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37]">Legal Risk Disclosure Statement:</h6>
          <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
            Trading Foreign Exchange (Forex) on margin carries high levels of risk, and may not be appropriate for all retail or institutional investors. Past performance of AI algorithmic strategies is not necessarily indicative of future returns. High leverage can work against you as well as for you. Before deciding to allocate capital, you should carefully weigh your investment objectives, expert risk tolerance, and compliance parameters. Do not invest capital that you cannot afford to lose. The system provides premium projections but the actual daily payouts are dependent on daily trading activities.
          </p>
        </div>

        <div className="border-t border-[#D4AF37]/10 pt-8 flex flex-col sm:flex-row justify-between items-center text-zinc-500 text-[11px] font-mono">
          <span>© 2026 PrimeVest Capital LLC. All Rights Reserved.</span>
          <span className="text-zinc-600">Security Certified: ISO-27001 compliant.</span>
        </div>
      </div>
    </footer>
  );
}
