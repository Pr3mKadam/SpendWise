import { Transaction, Category } from '@/types';
import { formatLocalYYYYMMDD } from '@/utils/date';

// ─── Category Colors ─────────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f43f5e',
  Subscriptions: '#a855f7',
  Transport: '#f59e0b',
  Entertainment: '#ec4899',
  Shopping: '#3b82f6',
  Utilities: '#06b6d4',
  Health: '#10b981',
  Travel: '#0ea5e9',
  Education: '#8b5cf6',
  Business: '#f97316',
  Income: '#3b82f6',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: '🍔',
  Subscriptions: '📺',
  Transport: '🚗',
  Entertainment: '🎮',
  Shopping: '🛍️',
  Utilities: '💡',
  Health: '💊',
  Travel: '✈️',
  Education: '🎓',
  Business: '💼',
  Income: '💰',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Replaces ALL occurrences of every {key} in a template string */
export function applyTemplate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce<string>((str, [key, val]) => {
    return str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
  }, template);
}

export const DEBIT_CATEGORIES: Category[] = [
  'Food',
  'Subscriptions',
  'Transport',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Health',
  'Travel',
  'Education',
  'Business',
];

export const MERCHANT_MAP: Record<Category, string[]> = {
  Food: ['Chipotle', 'DoorDash', 'Starbucks', 'Whole Foods', 'Panera Bread', 'McDonalds', 'Shake Shack'],
  Subscriptions: ['Netflix', 'Spotify', 'iCloud', 'YouTube Premium', 'ChatGPT Plus', 'Adobe CC', 'Notion Pro'],
  Transport: ['Uber', 'Lyft', 'Shell Gas', 'Chevron', 'Parking Meter', 'Metro Transit', 'Indigo Flight', 'OLA Cab'],
  Entertainment: ['Steam', 'AMC Theaters', 'Xbox Store', 'PlayStation Store', 'Regal Cinemas', 'Imagica'],
  Shopping: ['Amazon', 'Nike Store', 'Target', 'Best Buy', 'IKEA', 'Costco', 'eBay'],
  Utilities: ['Electric Co.', 'Water Bill', 'Comcast Internet', 'Gas Company', 'AT&T'],
  Health: ['CVS Pharmacy', 'Walgreens', 'Planet Fitness', 'Apollo Pharmacy', 'Wellness Forever', 'Practo'],
  Travel: ['MakeMyTrip', 'Airbnb', 'Goibibo', 'Hotels.com', 'Booking.com', 'IRCTC', 'Indigo'],
  Education: ['Udemy', 'Coursera', 'Skillshare', 'Duolingo', 'University Fee', 'Library'],
  Business: ['AWS', 'Google Cloud', 'Slack', 'Zoom', 'GitHub', 'Canva', 'Office Rent'],
  Income: ['Salary Deposit', 'Freelance Payment', 'Direct Deposit', 'Bank Refund'],
};

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Food: ['food', 'restaurant', 'eat', 'lunch', 'dinner', 'breakfast', 'coffee', 'chipotle', 'starbucks', 'doordash', 'ubereats', 'grubhub', 'pizza', 'burger', 'sushi', 'taco', 'mcdonalds', 'wendys', 'subway', 'panera', 'shake shack', 'chick-fil-a', 'cafe', 'bakery', 'diner', 'zomato', 'swiggy'],
  Transport: ['uber', 'lyft', 'gas', 'fuel', 'taxi', 'parking', 'transit', 'bus', 'train', 'flight', 'airline', 'metro', 'toll', 'shell', 'chevron', 'bp', 'zip car', 'bird scooter', 'lime', 'ola', 'rapido', 'rickshaw', 'auto', 'petrol', 'diesel', 'cng', 'fastag', 'cab', 'ferry', 'boat'],
  Subscriptions: ['netflix', 'spotify', 'subscription', 'premium', 'monthly', 'icloud', 'youtube', 'hulu', 'disney+', 'apple tv', 'chatgpt', 'openai', 'adobe', 'dropbox', 'slack', 'notion', 'annual plan', 'membership fee', 'jio', 'airtel'],
  Entertainment: ['movie', 'game', 'concert', 'ticket', 'steam', 'xbox', 'playstation', 'theater', 'amc', 'regal', 'bowling', 'escape room', 'arcade', 'bar', 'nightclub', 'comedy', 'show', 'trek', 'hiking', 'pvr', 'inox'],
  Shopping: ['amazon', 'shopping', 'buy', 'bought', 'store', 'nike', 'target', 'walmart', 'ikea', 'best buy', 'costco', 'ebay', 'etsy', 'zara', 'h&m', 'uniqlo', 'purchase', 'ordered', 'flipkart', 'myntra', 'zudio'],
  Utilities: ['electric', 'water', 'internet', 'utility', 'bill', 'cable', 'heating', 'at&t', 'verizon', 'comcast', 't-mobile', 'power', 'broadband', 'wifi', 'rent', 'gas bill'],
  Health: ['pharmacy', 'doctor', 'hospital', 'cvs', 'walgreens', 'medicine', 'gym', 'health', 'dental', 'vision', 'therapy', 'peloton', 'planet fitness', 'prescription', 'clinic', 'urgent care', 'tablet', 'syrup', 'capsule', 'bandage', 'chemist', 'apollo', 'medplus', '1mg', 'pharmeasy'],
  Travel: ['makemytrip', 'goibibo', 'cleartrip', 'airbnb', 'hotel', 'resort', 'stay', 'vacation', 'holiday', 'trip', 'tour', 'sightseeing', 'museum', 'fort', 'beach', 'mountains', 'goa', 'manali', 'shimla', 'ooty', 'staycation', 'check-in', 'visa', 'passport', 'trivago', 'booking.com'],
  Education: ['udemy', 'coursera', 'edx', 'skillshare', 'duolingo', 'chegg', 'college', 'university', 'library', 'class', 'course', 'school', 'tuition', 'books', 'stationery', 'exam', 'fees'],
  Business: ['google cloud', 'aws', 'azure', 'slack', 'zoom', 'linkedin', 'github', 'digital ocean', 'shopify', 'canva', 'adobe', 'figma', 'marketing', 'payroll', 'office', 'rent', 'tax', 'invoice', 'client', 'server'],
  Income: [],
};

export function parseTransaction(text: string): Transaction {
  const trimmed = text.trim();
  const lowerText = trimmed.toLowerCase();

  const amountMatch = trimmed.match(/(?:USD\s*)?\$?\s*([\d,]+\.?\d{0,2})/);
  const amount = amountMatch
    ? Math.round(parseFloat(amountMatch[1].replace(/,/g, '')) * 100) / 100
    : 0;

  const incomeKeywords = ['salary', 'deposit', 'received', 'earned', 'income', 'refund', 'credited', 'paid me', 'payment received', 'paycheck', 'payroll', 'dividend', 'reimbursement'];
  const isIncome = incomeKeywords.some(k => lowerText.includes(k));

  let category: Category;
  if (isIncome) {
    category = 'Income';
  } else {
    let found: Category | null = null;
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(k => lowerText.includes(k))) {
        found = cat as Category;
        break;
      }
    }
    category = found ?? 'Shopping';
  }

  const atMatch = trimmed.match(/\bat\s+([A-Z][a-zA-Z0-9\s&'.,-]{2,30?})(?:\s+for|\s+\$|[.,]|$)/);
  const quotedMatch = trimmed.match(/["']([^"']{2,40})["']/);

  let merchant: string;
  if (atMatch?.[1]?.trim()) {
    merchant = atMatch[1].trim().replace(/[,.]$/, '');
  } else if (quotedMatch?.[1]?.trim()) {
    merchant = quotedMatch[1].trim();
  } else {
    const pool = MERCHANT_MAP[category];
    merchant = pool[Math.floor(Math.random() * pool.length)] || category;
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    date: formatLocalYYYYMMDD(new Date()),
    amount,
    category,
    merchant,
    type: isIncome ? 'credit' : 'debit',
    description: trimmed,
    isNew: true,
  };
}

// ─── AI Insight Templates ──────────────────────────────────────────────────────

export const professionalInsights: string[] = [
  'Your {category} spending of {currency}{amount} is your biggest expense this month. Consider capping it at {currency}{cap} to stay on target.',
  "You're spending {currency}{amount} on {category} — that's {percent}% of total expenses. Benchmark: keep it under {benchmark}%.",
  "Reducing {category} by just 20% saves you {currency}{savings}/month — that's {currency}{annualized}/year compounded.",
  'Your income-to-expense ratio looks healthy. Keep {category} under {currency}{cap} to build 3 months of emergency savings.',
  'Tip: Automate a {currency}{savings} transfer on payday. Your {category} habit costs {currency}{amount} — automation beats willpower.',
  '{category} is at {currency}{amount} this period. A weekly {currency}{cap} soft-cap alert could prevent overspend before it happens.',
  "At your current burn rate, you're spending {currency}{amount} on {category}. Redirect {currency}{savings} of that to investments for real impact.",
];

export const savageInsights: string[] = [
  "Bro... {currency}{amount} on {category}?! Your wallet isn't bleeding — it's hemorrhaging. Seek help. 💀",
  "You've torched {currency}{amount} on {category}. Your future self is watching this from a cardboard box. 📦",
  "At {percent}% of your budget on {category}, you're not on a financial plan — you're on a financial YOLO. 🎰",
  "{currency}{amount} on {category}. Genuinely impressive. Most people ruin their finances slowly — you're speedrunning it. 🏃💨",
  'Your {category} spending is {currency}{amount}. Your bank account just filed a restraining order against you. 🚨',
  "Saving {currency}{savings} from {category} would be easy. But nah, you love the chaos. We get it. We don't respect it, but we get it. 🫡",
  "{category}: {currency}{amount}. Add that up yearly and it's {currency}{annualized}. That's a vacation. Or a therapy fund. Clearly you need both. ✈️🛋️",
];
