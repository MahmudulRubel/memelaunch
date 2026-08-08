'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { insforge, resolveStorageUrl } from '@/lib/insforge';
import { Coins, PlusCircle, MinusCircle, Loader2, User as UserIcon } from 'lucide-react';

interface PointTx {
  id: string;
  user_id: string;
  amount: number;
  action_type: string;
  created_at: string;
  users?: {
    name: string | null;
    avatar: string | null;
  } | null;
}

export function AdminPointAuditTab() {
  const [transactions, setTransactions] = useState<PointTx[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual Adjustment Form
  const [targetUserId, setTargetUserId] = useState('');
  const [pointsAmount, setPointsAmount] = useState<number>(10);
  const [actionReason, setActionReason] = useState('admin_reward');
  const [adjusting, setAdjusting] = useState(false);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const { data, error } = await insforge.database
        .from('point_transactions')
        .select('*, users(name, avatar)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions((data || []) as PointTx[]);
    } catch (err) {
      console.error('Failed fetching point transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleManualAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || !pointsAmount) {
      alert('Please specify Target User ID and Points Amount.');
      return;
    }

    setAdjusting(true);
    try {
      // 1. Insert transaction log
      const { error: txError } = await insforge.database
        .from('point_transactions')
        .insert([
          {
            user_id: targetUserId,
            amount: pointsAmount,
            action_type: actionReason || 'admin_adjustment',
          },
        ]);

      if (txError) throw txError;

      // 2. Fetch current points to increment/decrement
      const { data: userData, error: userFetchErr } = await insforge.database
        .from('users')
        .select('points')
        .eq('id', targetUserId)
        .single();

      if (userFetchErr) throw userFetchErr;

      const currentPoints = userData?.points || 0;
      const updatedPoints = currentPoints + pointsAmount;

      // 3. Update user total points
      const { error: userUpdateErr } = await insforge.database
        .from('users')
        .update({ points: updatedPoints })
        .eq('id', targetUserId);

      if (userUpdateErr) throw userUpdateErr;

      alert(`Successfully adjusted points for user! New Balance: ${updatedPoints}`);
      setTargetUserId('');
      setPointsAmount(10);
      fetchLedger();
    } catch (err: any) {
      console.error('Adjustment failed:', err);
      alert(err.message || 'Failed to adjust user points.');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <Coins className="h-5 w-5 text-amber-400" />
          <span>Point Audit Ledger & Manual Adjustment</span>
        </h2>
        <p className="text-zinc-400 text-xs">Inspect point economy transactions and perform manual point balance adjustments.</p>
      </div>

      {/* Adjustment Form */}
      <form onSubmit={handleManualAdjustment} className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl space-y-4 max-w-2xl">
        <h3 className="text-sm font-extrabold uppercase text-zinc-200 font-mono tracking-wider">
          Manual Point Adjustment Tool
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Target User ID</label>
            <input
              type="text"
              required
              placeholder="User UUID..."
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-400/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Points (+ / -)</label>
            <input
              type="number"
              required
              placeholder="e.g. 50 or -20"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-400/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Action Reason</label>
            <select
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-400/50"
            >
              <option value="admin_reward">Admin Reward (+)</option>
              <option value="community_bonus">Community Bonus (+)</option>
              <option value="fraud_deduction">Fraud Revocation (-)</option>
              <option value="system_correction">System Correction</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={adjusting}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
        >
          {adjusting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
          <span>Apply Adjustment</span>
        </button>
      </form>

      {/* Transactions Ledger */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-zinc-200 font-mono uppercase">Recent Ledger Activity</h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 text-amber-400 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800 rounded-2xl text-zinc-400 text-sm">
            No point transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-900/30">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Action Type</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="relative h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                        {tx.users?.avatar ? (
                          <Image src={resolveStorageUrl(tx.users.avatar)} alt="User" width={28} height={28} className="h-full w-full object-cover" />
                        ) : (
                          <UserIcon className="h-3.5 w-3.5 text-zinc-400" />
                        )}
                      </div>
                      <span className="font-semibold text-zinc-100">{tx.users?.name || tx.user_id.slice(0, 8)}</span>
                    </td>
                    <td className="p-4 font-mono text-zinc-400">{tx.action_type}</td>
                    <td className="p-4 font-mono font-extrabold">
                      {tx.amount >= 0 ? (
                        <span className="text-lime-400 flex items-center gap-1">
                          <PlusCircle className="h-3.5 w-3.5" /> +{tx.amount}
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <MinusCircle className="h-3.5 w-3.5" /> {tx.amount}
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-zinc-500">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
