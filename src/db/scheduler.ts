import { exportDatabase } from './backup';
import { writeAuditLog, db } from './db';

const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
const PRUNE_INTERVAL_MS = 6 * 60 * 60 * 1000;
const BACKUP_KEY = 'spendwise_last_auto_backup';
const PRUNE_KEY = 'spendwise_last_prune';
const MAX_AUTO_BACKUPS = 7;
const MAX_TRANSACTIONS = 10_000;
const AUDIT_LOG_RETENTION_DAYS = 30;

interface BackupRecord {
  timestamp: string;
  size: number;
}

function getBackupHistory(): BackupRecord[] {
  try {
    return JSON.parse(localStorage.getItem('spendwise_backup_history') || '[]');
  } catch {
    return [];
  }
}

function recordBackup(size: number): void {
  const history = getBackupHistory();
  history.unshift({ timestamp: new Date().toISOString(), size });
  if (history.length > MAX_AUTO_BACKUPS) history.length = MAX_AUTO_BACKUPS;
  localStorage.setItem('spendwise_backup_history', JSON.stringify(history));
}

export function getBackupHistorySummary(): BackupRecord[] {
  return getBackupHistory();
}

export function shouldRunAutoBackup(): boolean {
  const last = localStorage.getItem(BACKUP_KEY);
  if (!last) return true;
  return Date.now() - new Date(last).getTime() > BACKUP_INTERVAL_MS;
}

export async function runAutoBackup(): Promise<boolean> {
  try {
    const blob = await exportDatabase();
    localStorage.setItem(BACKUP_KEY, new Date().toISOString());
    recordBackup(blob.size);
    await writeAuditLog('_backup', 'INSERT', 'auto', undefined, `Auto backup ${blob.size} bytes`);
    return true;
  } catch {
    return false;
  }
}

export async function purgeOldBackupRecords(): Promise<void> {
  const history = getBackupHistory();
  if (history.length > MAX_AUTO_BACKUPS) {
    history.length = MAX_AUTO_BACKUPS;
    localStorage.setItem('spendwise_backup_history', JSON.stringify(history));
  }
}

export async function pruneAuditLog(): Promise<number> {
  const cutoff = new Date(Date.now() - AUDIT_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const deleted = await db.auditLog
    .where('createdAt')
    .below(cutoff)
    .delete();
  return deleted;
}

export async function capTransactions(): Promise<number> {
  const count = await db.transactions.count();
  if (count <= MAX_TRANSACTIONS) return 0;

  const excess = count - MAX_TRANSACTIONS;
  const all = await db.transactions
    .orderBy('date')
    .toArray();

  const toDelete = all.slice(0, excess);
  const ids = toDelete.map(t => t.id);
  await db.transactions.bulkDelete(ids);
  return ids.length;
}

export async function runHousekeeping(): Promise<{ prunedAudit: number; cappedTransactions: number }> {
  const prunedAudit = await pruneAuditLog();
  const cappedTransactions = await capTransactions();
  const total = prunedAudit + cappedTransactions;
  if (total > 0) {
    await writeAuditLog('_system', 'DELETE', 'housekeeping', undefined,
      `Pruned ${prunedAudit} audit entries, capped ${cappedTransactions} transactions`);
  }
  return { prunedAudit, cappedTransactions };
}

export function shouldRunPrune(): boolean {
  const last = localStorage.getItem(PRUNE_KEY);
  if (!last) return true;
  return Date.now() - new Date(last).getTime() > PRUNE_INTERVAL_MS;
}

export function startAutoBackupScheduler(): () => void {
  if (shouldRunAutoBackup()) {
    runAutoBackup();
  }
  if (shouldRunPrune()) {
    runHousekeeping().then(() => localStorage.setItem(PRUNE_KEY, new Date().toISOString()));
  }

  const intervalId = setInterval(() => {
    runAutoBackup();
    if (shouldRunPrune()) {
      runHousekeeping().then(() => localStorage.setItem(PRUNE_KEY, new Date().toISOString()));
    }
  }, BACKUP_INTERVAL_MS);

  return () => clearInterval(intervalId);
}
