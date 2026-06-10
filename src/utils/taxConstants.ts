export interface TaxSlab {
  min: number;
  max: number;
  rate: number;
  label: string;
}

export const OLD_REGIME_SLABS: TaxSlab[] = [
  { min: 0, max: 250000, rate: 0, label: 'Up to \u20B92,50,000' },
  { min: 250001, max: 500000, rate: 5, label: '\u20B92,50,001 \u2013 \u20B95,00,000' },
  { min: 500001, max: 1000000, rate: 20, label: '\u20B95,00,001 \u2013 \u20B910,00,000' },
  { min: 1000001, max: Infinity, rate: 30, label: 'Above \u20B910,00,000' },
];

export const NEW_REGIME_SLABS: TaxSlab[] = [
  { min: 0, max: 300000, rate: 0, label: 'Up to \u20B93,00,000' },
  { min: 300001, max: 700000, rate: 5, label: '\u20B93,00,001 \u2013 \u20B97,00,000' },
  { min: 700001, max: 1000000, rate: 10, label: '\u20B97,00,001 \u2013 \u20B910,00,000' },
  { min: 1000001, max: 1200000, rate: 15, label: '\u20B910,00,001 \u2013 \u20B912,00,000' },
  { min: 1200001, max: 1500000, rate: 20, label: '\u20B912,00,001 \u2013 \u20B915,00,000' },
  { min: 1500001, max: Infinity, rate: 30, label: 'Above \u20B915,00,000' },
];

export const STANDARD_DEDUCTION = 50000;
export const SECTION_80C_LIMIT = 150000;
export const SECTION_80D_LIMIT = 25000;
export const NPS_80CCD_1B_LIMIT = 50000;
export const HOME_LOAN_24B_LIMIT = 200000;

export function calculateTax(slabs: TaxSlab[], income: number): number {
  let tax = 0;
  for (const slab of slabs) {
    if (income > slab.min) {
      const taxableInSlab = Math.min(income, slab.max) - Math.max(slab.min, 0);
      if (taxableInSlab > 0) {
        tax += (taxableInSlab * slab.rate) / 100;
      }
    }
  }
  return tax;
}

export function calculateCess(tax: number): number {
  return tax * 0.04;
}

export function calculateSurcharge(income: number, tax: number): number {
  if (income > 10000000) return tax * 0.15;
  if (income > 5000000) return tax * 0.1;
  return 0;
}

export function formatIndianCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `\u20B9${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `\u20B9${(amount / 100000).toFixed(2)} L`;
  }
  return `\u20B9${amount.toLocaleString('en-IN')}`;
}

export function getAnnualIncomeFromTransactions(
  transactions: { amount: number; type: string; date: string }[]
): number {
  const currentYear = new Date().getFullYear();
  return transactions
    .filter(tx => {
      const txYear = new Date(tx.date).getFullYear();
      return tx.type === 'credit' && txYear === currentYear;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
}
