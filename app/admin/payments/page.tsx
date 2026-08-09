'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, Check, X, Eye, ExternalLink } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { db } from '@/lib/db';
import { Payment } from '@/lib/types';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    setPayments([...db.getPayments()]);
  }, []);

  const handleVerify = (id: string, status: 'VERIFIED' | 'REJECTED') => {
    db.verifyPayment(id, status);
    setPayments([...db.getPayments()]);
  };

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col font-body">
      <Navbar />

      <div className="bg-surface/80 border-b border-surface-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-black text-3xl text-white">MOBILE PAYMENT VERIFICATION</h1>
          <div className="text-xs text-gray-400">Review bKash, Nagad, and Rocket manual payment deposits</div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        <div className="flex items-center space-x-2 border-b border-surface-border overflow-x-auto pb-1">
          <Link href="/admin" className="px-4 py-2 rounded-xl bg-surface-light text-gray-300 hover:text-white font-heading font-bold text-xs">
            Overview & Analytics
          </Link>
          <Link href="/admin/tournaments" className="px-4 py-2 rounded-xl bg-surface-light text-gray-300 hover:text-white font-heading font-bold text-xs">
            Tournament Manager
          </Link>
          <Link href="/admin/payments" className="px-4 py-2 rounded-xl bg-brand-purple text-white font-heading font-bold text-xs">
            Payment Verification Queue ({payments.filter(p => p.status === 'PENDING').length})
          </Link>
          <Link href="/admin/users" className="px-4 py-2 rounded-xl bg-surface-light text-gray-300 hover:text-white font-heading font-bold text-xs">
            User Manager
          </Link>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden border border-surface-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-light text-xs font-bold uppercase text-gray-400 border-b border-surface-border">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Tournament</th>
                  <th className="p-4">Method / Amount</th>
                  <th className="p-4">TrxID</th>
                  <th className="p-4">Screenshot</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-light/50">
                    <td className="p-4">
                      <div className="font-bold text-white text-xs">{p.userName}</div>
                      <div className="text-[10px] text-gray-400">{p.userEmail}</div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="text-xs text-gray-300 font-semibold truncate">
                        {p.tournamentTitle || 'Wallet Deposit'}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-brand-cyan text-xs uppercase">{p.method}</span>
                      <div className="font-heading font-black text-brand-gold text-base">৳ {p.amount}</div>
                    </td>

                    <td className="p-4 font-mono text-xs text-white font-bold">{p.trxId}</td>

                    <td className="p-4">
                      {p.screenshot ? (
                        <button
                          onClick={() => setSelectedScreenshot(p.screenshot || null)}
                          className="px-2.5 py-1 rounded bg-surface-light text-brand-orange border border-brand-orange/30 text-xs font-bold hover:bg-brand-orange hover:text-white flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Pic</span>
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs">No Pic</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        p.status === 'VERIFIED' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                        p.status === 'PENDING' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
                        'bg-red-900/30 text-red-400 border border-red-500/30'
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {p.status === 'PENDING' && (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleVerify(p.id, 'VERIFIED')}
                            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleVerify(p.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Screenshot Preview Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card rounded-3xl p-6 max-w-lg w-full border border-surface-border space-y-4 text-center">
            <h3 className="font-heading font-bold text-xl text-white">PAYMENT PROOF PREVIEW</h3>
            <img src={selectedScreenshot} alt="Payment Proof" className="w-full h-64 object-cover rounded-2xl border border-surface-border" />
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="w-full py-2.5 rounded-xl bg-surface-light text-white font-bold"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
