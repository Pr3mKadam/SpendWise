import { useEffect, useRef } from 'react';
import { useBudgets } from '@/hooks/useBudgets';

interface BudgetAlertToastProps {
  currency?: string;
}

const ALERT_KEY = (cat: string, level: '80' | '100') =>
  `spendwise_budget_alert_${cat}_${level}_${new Date().toISOString().substring(0, 7)}`;

let toastContainer: HTMLDivElement | null = null;

function getContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'budget-toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9998;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      max-width: 340px;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function showToast(message: string, color: string, icon: string) {
  const container = getContainer();
  const toast = document.createElement('div');
  toast.style.cssText = `
    background: white;
    border-left: 4px solid ${color};
    border-radius: 14px;
    padding: 12px 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    font-family: var(--font-inter, sans-serif);
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    pointer-events: auto;
    animation: slideInRight 0.3s ease-out;
    display: flex;
    align-items: center;
    gap: 10px;
    line-height: 1.4;
  `;
  const iconSpan = document.createElement('span');
  iconSpan.style.cssText = 'font-size:18px;flex-shrink:0;';
  iconSpan.textContent = icon;

  const msgSpan = document.createElement('span');
  msgSpan.textContent = message;

  toast.appendChild(iconSpan);
  toast.appendChild(msgSpan);
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

// Inject keyframe once
if (!document.getElementById('budget-toast-keyframe')) {
  const style = document.createElement('style');
  style.id = 'budget-toast-keyframe';
  style.textContent = `@keyframes slideInRight { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
  document.head.appendChild(style);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function BudgetAlertToast({ currency = '₹' }: BudgetAlertToastProps) {
  const { budgetStats } = useBudgets();
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    budgetStats.forEach(stat => {
      const key80 = ALERT_KEY(stat.category, '80');
      const key100 = ALERT_KEY(stat.category, '100');

      const safeCategory = escapeHtml(stat.category);
      const safeSpent = stat.spent.toLocaleString('en-IN', { maximumFractionDigits: 0 });
      const safeLimit = stat.limit.toLocaleString('en-IN', { maximumFractionDigits: 0 });
      const safePercent = stat.percent.toFixed(0);
      const safeRemaining = stat.remaining.toLocaleString('en-IN', { maximumFractionDigits: 0 });

      if (stat.percent >= 100 && !firedRef.current.has(key100)) {
        try {
          if (sessionStorage.getItem(key100)) return;
          sessionStorage.setItem(key100, 'true');
        } catch {
          /* ignore */
        }
        firedRef.current.add(key100);
        showToast(
          `🚨 <strong>${safeCategory}</strong> budget exceeded! You've spent ${currency}${safeSpent} of ${currency}${safeLimit}.`,
          '#ef4444',
          '🚨'
        );
      } else if (stat.percent >= 80 && stat.percent < 100 && !firedRef.current.has(key80)) {
        try {
          if (sessionStorage.getItem(key80)) return;
          sessionStorage.setItem(key80, 'true');
        } catch {
          /* ignore */
        }
        firedRef.current.add(key80);
        showToast(
          `⚠️ <strong>${safeCategory}</strong> at ${safePercent}% of budget — ${currency}${safeRemaining} remaining.`,
          '#f59e0b',
          '⚠️'
        );
      }
    });
  }, [budgetStats, currency]);

  return null; // Renders toasts imperatively via DOM
}
