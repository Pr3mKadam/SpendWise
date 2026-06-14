import { Transaction } from '@/types';
import { logger } from '@/core/observability';
import { writeAuditLog } from '@/db/db';

export type ConflictStrategy = 'lww' | 'local-wins' | 'remote-wins';

export interface ConflictRecord {
  entityId: string;
  local: Partial<Transaction>;
  remote: Partial<Transaction>;
  resolved: Partial<Transaction>;
  strategy: ConflictStrategy;
  timestamp: string;
}

export function resolveTransactionConflict(
  local: Transaction,
  remote: Transaction,
  strategy: ConflictStrategy = 'lww'
): { resolved: Transaction; conflict: ConflictRecord } {
  let resolved: Transaction;

  switch (strategy) {
    case 'local-wins':
      resolved = { ...remote, ...local };
      break;
    case 'remote-wins':
      resolved = { ...local, ...remote };
      break;
    case 'lww':
    default: {
      const localUpdated = local.updatedAt ? new Date(local.updatedAt).getTime() : 0;
      const remoteUpdated = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0;
      resolved = localUpdated >= remoteUpdated ? { ...remote, ...local } : { ...local, ...remote };
      break;
    }
  }

  const conflict: ConflictRecord = {
    entityId: local.id,
    local: local as unknown as Partial<Transaction>,
    remote: remote as unknown as Partial<Transaction>,
    resolved: resolved as unknown as Partial<Transaction>,
    strategy,
    timestamp: new Date().toISOString(),
  };

  return { resolved, conflict };
}

export async function resolveTransactionBatch(
  localTxs: Transaction[],
  remoteTxs: Transaction[],
  strategy: ConflictStrategy = 'lww'
): Promise<{ merged: Transaction[]; conflicts: ConflictRecord[] }> {
  const localMap = new Map(localTxs.map(t => [t.id, t]));
  const remoteMap = new Map(remoteTxs.map(t => [t.id, t]));
  const conflicts: ConflictRecord[] = [];

  const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);
  const merged: Transaction[] = [];

  for (const id of allIds) {
    const local = localMap.get(id);
    const remote = remoteMap.get(id);

    if (local && remote) {
      if (local.updatedAt === remote.updatedAt) {
        merged.push(local);
        continue;
      }
      const { resolved, conflict } = resolveTransactionConflict(local, remote, strategy);
      merged.push(resolved);
      conflicts.push(conflict);
      if (conflicts.length <= 5) {
        logger.system.warn(`Conflict resolved for transaction ${id}`, {
          strategy,
          localUpdated: local.updatedAt,
          remoteUpdated: remote.updatedAt,
        });
      }
    } else if (local) {
      merged.push(local);
    } else if (remote) {
      merged.push(remote);
    }
  }

  if (conflicts.length > 0) {
    const stored = getStoredConflicts();
    stored.push(...conflicts);
    if (stored.length > 100) stored.splice(0, stored.length - 100);
    setStoredConflicts(stored);

    await writeAuditLog(
      '_conflict',
      'UPDATE',
      'batch',
      undefined,
      `Resolved ${conflicts.length} conflicts using ${strategy} strategy`
    );
  }

  return { merged, conflicts };
}

export function getStoredConflicts(): ConflictRecord[] {
  try {
    return JSON.parse(sessionStorage.getItem('spendwise_conflicts') || '[]');
  } catch {
    // silently ignore — non-critical
    return [];
  }
}

function setStoredConflicts(records: ConflictRecord[]): void {
  try {
    sessionStorage.setItem('spendwise_conflicts', JSON.stringify(records));
  } catch { /* silently ignore — non-critical */ }
}

export function clearStoredConflicts(): void {
  sessionStorage.removeItem('spendwise_conflicts');
}
