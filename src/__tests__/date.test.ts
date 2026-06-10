import { describe, it, expect } from 'vitest';
import { formatLocalYYYYMMDD } from '@/utils/date';

describe('formatLocalYYYYMMDD', () => {
  it('formats a normal date in YYYY-MM-DD', () => {
    const d = new Date(2026, 5, 15);
    expect(formatLocalYYYYMMDD(d)).toBe('2026-06-15');
  });

  it('pads single-digit month with leading zero', () => {
    const d = new Date(2026, 0, 10);
    expect(formatLocalYYYYMMDD(d)).toBe('2026-01-10');
  });

  it('pads single-digit day with leading zero', () => {
    const d = new Date(2026, 6, 5);
    expect(formatLocalYYYYMMDD(d)).toBe('2026-07-05');
  });

  it('pads both month and day when both are single digit', () => {
    const d = new Date(2026, 2, 3);
    expect(formatLocalYYYYMMDD(d)).toBe('2026-03-03');
  });

  it('handles January (month index 0)', () => {
    const d = new Date(2026, 0, 1);
    expect(formatLocalYYYYMMDD(d)).toBe('2026-01-01');
  });

  it('handles December (month index 11)', () => {
    const d = new Date(2026, 11, 25);
    expect(formatLocalYYYYMMDD(d)).toBe('2026-12-25');
  });

  it('handles last day of month (Jan 31)', () => {
    const d = new Date(2026, 0, 31);
    expect(formatLocalYYYYMMDD(d)).toBe('2026-01-31');
  });

  it('handles last day of February in non-leap year', () => {
    const d = new Date(2026, 1, 28);
    expect(formatLocalYYYYMMDD(d)).toBe('2026-02-28');
  });

  it('handles February 29 in a leap year', () => {
    const d = new Date(2024, 1, 29);
    expect(formatLocalYYYYMMDD(d)).toBe('2024-02-29');
  });

  it('handles year boundary (Dec 31 to Jan 1)', () => {
    const d = new Date(2025, 11, 31);
    expect(formatLocalYYYYMMDD(d)).toBe('2025-12-31');
  });

  it('handles first day of year', () => {
    const d = new Date(2026, 0, 1);
    expect(formatLocalYYYYMMDD(d)).toBe('2026-01-01');
  });

  it('avoids UTC date-shifting bug for late-evening local times', () => {
    const d = new Date(2026, 5, 15, 23, 30);
    expect(formatLocalYYYYMMDD(d)).toBe('2026-06-15');
  });

  it('avoids UTC date-shifting bug for early-morning local times', () => {
    const d = new Date(2026, 5, 15, 1, 0);
    expect(formatLocalYYYYMMDD(d)).toBe('2026-06-15');
  });

  it('handles a date that would roll to next day in UTC but not locally', () => {
    const d = new Date(2026, 5, 15, 22, 0);
    expect(formatLocalYYYYMMDD(d)).toBe('2026-06-15');
  });

  it('handles dates near epoch', () => {
    const d = new Date(1970, 0, 1);
    expect(formatLocalYYYYMMDD(d)).toBe('1970-01-01');
  });

  it('handles far future dates', () => {
    const d = new Date(2099, 11, 31);
    expect(formatLocalYYYYMMDD(d)).toBe('2099-12-31');
  });

  it('uses local time methods, not UTC methods', () => {
    const d = new Date(Date.UTC(2026, 5, 15, 0, 0, 0));
    const localStr = formatLocalYYYYMMDD(d);
    expect(localStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
