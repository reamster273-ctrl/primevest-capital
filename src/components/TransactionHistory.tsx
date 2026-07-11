import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  FileText, 
  AlertCircle,
  TrendingUp,
  Coins
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  // Filters state
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<{ id: string; name: string; file: string } | null>(null);

  // Filter only deposits and withdrawals as requested by prompt
  const baseTransactions = transactions.filter(t => t.type === 'deposit' || t.type === 'withdrawal');

  // Apply filters
  const filteredTransactions = baseTransactions.filter(tx => {
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchLower) ||
      (tx.paymentProof || '').toLowerCase().includes(searchLower) ||
      (tx.adminNote || '').toLowerCase().includes(searchLower) ||
      tx.amount.toString().includes(searchLower);

    return matchesType && matchesStatus && matchesSearch;
  });

  // Calculate statistics based on base transactions
  const successfulDeposits = baseTransactions
    .filter(t => t.type === 'deposit' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const successfulWithdrawals = baseTransactions
    .filter(t => t.type === 'withdrawal' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingDeposits = baseTransactions
    .filter(t => t.type === 'deposit' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingWithdrawals = baseTransactions
    .filter(t => t.type === 'withdrawal' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* 1. Header and Premium Metric Ribbon */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h4 className="text-base font-bold text-gray-200 tracking-tight flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" /> Capital & Asset Transaction History
          </h4>
          <p className="text-xs text-zinc-500">Track, filter, and audit verified deposits and withdrawals in real time.</p>
        </div>
      </div>

      {/* 2. Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900/80 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">Cleared Funding</span>
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-bold text-yellow-500 font-mono">₦{successfulDeposits.toLocaleString()}</span>
            <span className="text-[9px] text-zinc-600 font-mono font-medium">Approved Deposits</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900/80 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">Pending Audits</span>
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-bold text-amber-500 font-mono">
              ₦{(pendingDeposits + pendingWithdrawals).toLocaleString()}
            </span>
            <span className="text-[9px] text-zinc-600 font-mono font-medium">
              {baseTransactions.filter(t => t.status === 'pending').length} In Queue
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900/80 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">Settled Disbursals</span>
          <div className="flex justify-between items-baseline">
            <span className="text-lg font-bold text-emerald-500 font-mono">₦{successfulWithdrawals.toLocaleString()}</span>
            <span className="text-[9px] text-zinc-600 font-mono font-medium">Approved Withdrawals</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          
          {/* Type Filter Buttons */}
          <div className="flex flex-wrap gap-1.5 bg-black/40 p-1 rounded-lg border border-zinc-900">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                typeFilter === 'all' 
                  ? 'bg-yellow-500 text-black shadow-sm' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('deposit')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1 ${
                typeFilter === 'deposit' 
                  ? 'bg-yellow-500 text-black shadow-sm' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> Deposits
            </button>
            <button
              onClick={() => setTypeFilter('withdrawal')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1 ${
                typeFilter === 'withdrawal' 
                  ? 'bg-yellow-500 text-black shadow-sm' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" /> Withdrawals
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500 pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search by ID, amount, reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-zinc-900 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:border-yellow-500 focus:outline-none text-zinc-300 font-medium placeholder-zinc-600 transition"
            />
          </div>
        </div>

        {/* Status filters inline tab row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-900/60">
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition ${
                statusFilter === 'all'
                  ? 'border-zinc-700 bg-zinc-800 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              All Statuses
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition ${
                statusFilter === 'pending'
                  ? 'border-amber-500/30 bg-amber-950/20 text-amber-500'
                  : 'border-transparent text-zinc-500 hover:text-amber-500'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition ${
                statusFilter === 'approved'
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                  : 'border-transparent text-zinc-500 hover:text-emerald-400'
              }`}
            >
              Succeeded
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition ${
                statusFilter === 'rejected'
                  ? 'border-rose-500/30 bg-rose-950/20 text-rose-400'
                  : 'border-transparent text-zinc-500 hover:text-rose-400'
              }`}
            >
              Declined
            </button>
          </div>
        </div>
      </div>

      {/* 4. Ledger Table / Cards */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden">
        
        {/* Table View (Desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-black/20">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Payment / Account Details</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/40">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-600 font-mono text-xs">
                    No matching transactions found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-900/10 transition-colors text-xs font-mono">
                    
                    {/* ID */}
                    <td className="py-4 px-4 font-semibold text-zinc-400">
                      {tx.id}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-zinc-500 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString()}
                      <span className="text-[10px] text-zinc-600 block">
                        {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {tx.type === 'deposit' ? (
                        <span className="flex items-center gap-1.5 font-sans font-semibold text-yellow-500 text-xs">
                          <span className="p-1 rounded bg-yellow-950/30">
                            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                          Funding Request
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 font-sans font-semibold text-emerald-400 text-xs">
                          <span className="p-1 rounded bg-emerald-950/30">
                            <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                          Asset Payout
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 text-right font-bold text-gray-200 text-sm">
                      ₦{tx.amount.toLocaleString()}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {tx.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                          <Clock className="w-3 h-3" /> Pending Audit
                        </span>
                      )}
                      {tx.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Succeeded
                        </span>
                      )}
                      {tx.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> Declined
                        </span>
                      )}
                    </td>

                    {/* Details Column */}
                    <td className="py-4 px-4 max-w-xs text-zinc-400 font-sans leading-relaxed">
                      <div className="space-y-1">
                        <p className="text-xs truncate" title={tx.paymentProof}>
                          {tx.paymentProof || 'No additional reference provided'}
                        </p>
                        {tx.adminNote && (
                          <div className="flex gap-1 items-start bg-black/30 border border-zinc-900 rounded p-1.5 mt-1 text-[11px] text-zinc-500">
                            <MessageSquare className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-zinc-400 font-mono">Feedback:</strong> {tx.adminNote}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* View Proof / Receipt */}
                    <td className="py-4 px-4 text-center">
                      {tx.receiptFile ? (
                        <button
                          onClick={() => setSelectedReceipt({
                            id: tx.id,
                            name: tx.receiptFileName || 'payment_proof_slip.png',
                            file: tx.receiptFile!
                          })}
                          className="p-1.5 hover:bg-zinc-900 border border-zinc-800 rounded text-yellow-500 hover:text-yellow-400 transition"
                          title="View Uploaded Receipt"
                        >
                          <Eye className="w-4 h-4 mx-auto" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-700 font-mono">None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Cards View (Mobile Devices) */}
        <div className="block md:hidden divide-y divide-zinc-900/60">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 font-mono text-xs">
              No matching transactions found matching your filter criteria.
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-4 space-y-4 font-sans text-xs">
                
                {/* Mobile Header: Type + ID */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-zinc-600 uppercase block tracking-wider">ID: {tx.id}</span>
                    {tx.type === 'deposit' ? (
                      <span className="flex items-center gap-1 font-semibold text-yellow-500">
                        <ArrowUpRight className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                        Funding Request
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-semibold text-emerald-400">
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Asset Payout
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div>
                    {tx.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Clock className="w-3 h-3 animate-pulse" /> Pending
                      </span>
                    )}
                    {tx.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Succeeded
                      </span>
                    )}
                    {tx.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        <XCircle className="w-3 h-3" /> Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile Mid: Amount & Date */}
                <div className="grid grid-cols-2 gap-2 bg-black/20 p-2.5 rounded-lg border border-zinc-900/60 font-mono">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase block">Amount</span>
                    <strong className="text-sm font-bold text-gray-200">₦{tx.amount.toLocaleString()}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-500 uppercase block">Timestamp</span>
                    <span className="text-[11px] text-zinc-400 block">{new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Mobile Bottom: References & Notes */}
                <div className="space-y-2">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase block font-mono">Payment/Account Reference</span>
                    <p className="text-zinc-300 font-medium leading-relaxed mt-0.5">
                      {tx.paymentProof || 'No reference provided'}
                    </p>
                  </div>

                  {tx.adminNote && (
                    <div className="flex gap-1.5 items-start bg-black/40 border border-zinc-900 rounded-lg p-2.5 text-[11px] text-zinc-400">
                      <MessageSquare className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-zinc-300 font-mono block text-[9px] uppercase tracking-wider">System Audit Feedback</strong>
                        <p className="mt-0.5 text-zinc-400 font-medium">{tx.adminNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Receipt Preview trigger button for mobile */}
                  {tx.receiptFile && (
                    <button
                      onClick={() => setSelectedReceipt({
                        id: tx.id,
                        name: tx.receiptFileName || 'payment_proof_slip.png',
                        file: tx.receiptFile!
                      })}
                      className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-yellow-500 font-semibold text-xs flex items-center justify-center gap-1.5 mt-2 transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Uploaded Receipt Slip
                    </button>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* 5. Clean, accessible modal for previewing Base64 Receipt Proof images */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-black/40">
              <div className="space-y-0.5">
                <h5 className="font-bold text-gray-200 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-yellow-500" /> Digital Proof Receipt
                </h5>
                <p className="text-[10px] text-zinc-500 font-mono">TX ID: {selectedReceipt.id} | {selectedReceipt.name}</p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Content - Receipt Image Preview */}
            <div className="p-6 bg-black flex items-center justify-center overflow-y-auto flex-1">
              {selectedReceipt.file.startsWith('data:image/') || selectedReceipt.file.startsWith('data:application/') ? (
                <img 
                  src={selectedReceipt.file} 
                  alt="Payment receipt proof slip" 
                  className="max-h-96 rounded-lg object-contain border border-zinc-900 shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl max-w-sm space-y-4">
                  <AlertCircle className="w-12 h-12 text-yellow-500/80 mx-auto" />
                  <div className="space-y-1">
                    <h6 className="font-bold text-gray-300 text-xs">Binary / Plain Document Slip</h6>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      This proof was registered using a custom compliance screenshot file. No visual raster preview is generated.
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded text-left border border-zinc-900 text-[10px] text-zinc-400 font-mono whitespace-pre-wrap select-all max-h-32 overflow-y-auto">
                    {selectedReceipt.file}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-900/60 bg-black/40 flex justify-end gap-2 text-xs font-semibold">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg transition"
              >
                Dismiss View
              </button>
              {selectedReceipt.file.startsWith('data:') && (
                <a
                  href={selectedReceipt.file}
                  download={selectedReceipt.name}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition flex items-center gap-1"
                >
                  Download Slip
                </a>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
