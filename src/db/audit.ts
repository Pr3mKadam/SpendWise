const AUDIT_KEY = 'spendwise_audit_log';

export async function writeAuditLog(
  domain: string,
  operation: string,
  entityId: string,
  error?: string,
  detail?: string
): Promise<void> {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    const entries: Array<{
      domain: string;
      operation: string;
      entityId: string;
      error?: string;
      detail?: string;
      createdAt: string;
    }> = raw ? JSON.parse(raw) : [];
    entries.push({
      domain,
      operation,
      entityId,
      error,
      detail,
      createdAt: new Date().toISOString(),
    });
    if (entries.length > 500) entries.splice(0, entries.length - 500);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(entries));
  } catch {
    // non-critical
  }
}

export function getAuditLog(): Array<{
  domain: string;
  operation: string;
  entityId: string;
  error?: string;
  detail?: string;
  createdAt: string;
}> {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
