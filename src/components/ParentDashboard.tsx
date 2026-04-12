import { useState, useEffect, useCallback } from 'react';
import {
  Users, Link2, Copy, Check, BarChart2, Shield, Clock,
  RefreshCw, CheckCircle, XCircle, Unlink, AlertTriangle, X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { Transaction } from '../types';
import {
  createParentChildInvite,
  acceptParentInvite,
  fetchChildLinks,
  fetchTransactions,
  approveTransaction,
  rejectTransaction,
  type ParentChildLink
} from '../lib/supabaseData';

interface ParentDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currency?: string;
}

export default function ParentDashboard({ isOpen, onClose, currency = '₹' }: ParentDashboardProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<'children' | 'join'>('children');
  const [childLinks, setChildLinks] = useState<ParentChildLink[]>([]);
  const [childTransactions, setChildTransactions] = useState<Record<string, Transaction[]>>({});
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadChildren = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const links = await fetchChildLinks(user.id);
      setChildLinks(links);
      const txMap: Record<string, Transaction[]> = {};
      await Promise.all(links.map(async (link) => {
        try {
          const txs = await fetchTransactions(link.child_user_id);
          txMap[link.child_user_id] = txs.filter(t => t.status === 'pending_approval');
        } catch { /* access denied or no txs */ }
      }));
      setChildTransactions(txMap);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) loadChildren();
  }, [isOpen, user, loadChildren]);

  const handleGenerateInvite = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const code = await createParentChildInvite(user.id);
      setInviteCode(code);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinAsChild = async () => {
    if (!user || !joinCode.trim()) return;
    setLoading(true);
    setError('');
    try {
      const ok = await acceptParentInvite(user.id, joinCode.trim().toUpperCase());
      if (ok) {
        setSuccessMsg('Successfully linked to parent account!');
        setJoinCode('');
      } else {
        setError('Invalid or expired invite code.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (childId: string, txId: string) => {
    if (!user) return;
    await approveTransaction(childId, txId).catch(console.error);
    setChildTransactions(prev => ({
      ...prev,
      [childId]: (prev[childId] || []).filter(t => t.id !== txId)
    }));
  };

  const handleReject = async (childId: string, txId: string) => {
    if (!user) return;
    await rejectTransaction(childId, txId).catch(console.error);
    setChildTransactions(prev => ({
      ...prev,
      [childId]: (prev[childId] || []).filter(t => t.id !== txId)
    }));
  };

  if (!isOpen) return null;

  const totalPending = Object.values(childTransactions).reduce((sum, txs) => sum + txs.length, 0);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-[var(--surface-card)] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl border border-[var(--border)] flex flex-col"
        style={{ animation: 'var(--modal-enter, none)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--surface-card)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Users size={18} className="text-purple-400" />
            </div>
            <div>
              <h2 className="font-manrope font-bold text-[var(--text-primary)]">Remote Parent Dashboard</h2>
              <p className="text-xs text-[var(--text-muted)]">Monitor &amp; manage linked child accounts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadChildren} title="Refresh" className="p-2 rounded-xl hover:bg-[var(--surface-input)] text-[var(--text-muted)] transition-colors">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--surface-input)] text-[var(--text-muted)] transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 border-b border-[var(--border)] bg-[var(--surface-input)]">
          {[
            { key: 'children', label: 'Linked Children', icon: Shield },
            { key: 'join', label: 'Link / Join', icon: Link2 },
          ].map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[var(--teal)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-card)]'
                }`}
              >
                <Icon size={14} />
                {t.label}
                {t.key === 'children' && totalPending > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {totalPending}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-[var(--teal-dim)] text-[var(--teal)] text-sm flex items-center gap-2">
              <CheckCircle size={14} /> {successMsg}
            </div>
          )}

          {tab === 'children' && (
            childLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                  <Users size={24} className="text-purple-400" />
                </div>
                <h4 className="font-semibold text-[var(--text-primary)] mb-1">No linked children yet</h4>
                <p className="text-sm text-[var(--text-muted)] max-w-[280px] mb-4">
                  Generate an invite code and have your child enter it in their SpendWise app.
                </p>
                <button
                  onClick={() => setTab('join')}
                  className="px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 text-sm font-semibold hover:bg-purple-500/20 transition-colors"
                >
                  Generate Invite Code
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {childLinks.map(link => {
                  const pendingTxs = childTransactions[link.child_user_id] || [];
                  return (
                    <div key={link.id} className="rounded-2xl border border-[var(--border)] overflow-hidden">
                      {/* Child header */}
                      <div className="flex items-center gap-3 p-4 bg-[var(--surface-input)]">
                        <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center font-bold text-purple-400 text-sm">
                          {link.child_user_id.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-inter font-semibold text-sm text-[var(--text-primary)]">
                            Child Account
                          </p>
                          <p className="font-inter text-[11px] text-[var(--text-muted)] font-mono">
                            •••• {link.child_user_id.slice(-8)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
                          <span className="text-[10px] text-[var(--green)] font-bold uppercase tracking-wide">Active</span>
                        </div>
                      </div>

                      {/* Pending transactions */}
                      {pendingTxs.length > 0 ? (
                        <div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/5 border-t border-amber-500/20">
                            <Clock size={12} className="text-amber-500" />
                            <span className="text-xs text-amber-500 font-semibold">{pendingTxs.length} Pending Approval{pendingTxs.length > 1 ? 's' : ''}</span>
                          </div>
                          <div className="divide-y divide-[var(--border)]">
                            {pendingTxs.map(tx => (
                              <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{tx.merchant}</p>
                                  <p className="text-xs text-[var(--text-muted)]">
                                    {tx.category} &middot; {tx.type === 'debit' ? '-' : '+'}{currency}{tx.amount.toFixed(2)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleApprove(link.child_user_id, tx.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--teal-dim)] text-[var(--teal)] text-xs font-bold hover:bg-[var(--teal)] hover:text-white transition-all"
                                  >
                                    <CheckCircle size={12} /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(link.child_user_id, tx.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                                  >
                                    <XCircle size={12} /> Reject
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-3 border-t border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
                          <BarChart2 size={12} /> <span>No pending transactions for approval</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {tab === 'join' && (
            <div className="space-y-6">
              {/* Generate Invite */}
              <div className="rounded-2xl bg-[var(--surface-input)] p-5">
                <h4 className="font-inter font-bold text-sm text-[var(--text-primary)] mb-1 flex items-center gap-2">
                  <Shield size={15} className="text-[var(--teal)]" /> As a Parent: Generate Invite Code
                </h4>
                <p className="text-xs text-[var(--text-muted)] mb-4">
                  Create a code and share it with your child. They'll enter it in their app to link accounts.
                </p>
                {inviteCode ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-[var(--surface-card)] border border-[var(--teal)]/30 rounded-xl p-3 font-mono text-xl font-bold text-[var(--teal)] tracking-[0.3em] text-center">
                      {inviteCode}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="p-3 rounded-xl bg-[var(--teal-dim)] text-[var(--teal)] hover:bg-[var(--teal)] hover:text-white transition-colors"
                      title="Copy"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateInvite}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[var(--teal)] text-white font-bold text-sm hover:bg-[#0d9488] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <Link2 size={14} />}
                    Generate Invite Code
                  </button>
                )}
              </div>

              {/* Join as Child */}
              <div className="rounded-2xl bg-[var(--surface-input)] p-5">
                <h4 className="font-inter font-bold text-sm text-[var(--text-primary)] mb-1 flex items-center gap-2">
                  <Unlink size={15} className="text-purple-400" /> As a Child: Enter Parent's Code
                </h4>
                <p className="text-xs text-[var(--text-muted)] mb-4">
                  Enter the invite code shared by your parent to link this account.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g. A1B2C3D4"
                    className="flex-1 bg-[var(--surface-card)] border border-[var(--border)] rounded-xl px-4 py-2.5 font-mono text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--teal)] transition-colors tracking-widest"
                    maxLength={8}
                  />
                  <button
                    onClick={handleJoinAsChild}
                    disabled={loading || joinCode.length < 4}
                    className="px-4 py-2.5 rounded-xl bg-purple-500 text-white font-bold text-sm hover:bg-purple-400 disabled:opacity-50 transition-colors"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
