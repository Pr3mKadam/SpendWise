import { Transaction, Category } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

/** Replaces ALL occurrences of every {key} in a template string */
export function applyTemplate(
  template: string,
  vars: Record<string, string | number>
): string {
  return Object.entries(vars).reduce<string>((str, [key, val]) => {
    // Use a global regex so ALL occurrences are replaced
    return str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
  }, template);
}

// ─── Category Metadata ────────────────────────────────────────────────────────

export const CATEGORY_COLORS: Record<Category, string> = {
  Food:          '#f43f5e',
  Subscriptions: '#a855f7',
  Transport:     '#f59e0b',
  Entertainment: '#ec4899',
  Shopping:      '#3b82f6',
  Utilities:     '#06b6d4',
  Health:        '#10b981',
  Income:        '#3b82f6',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Food:          '🍔',
  Subscriptions: '📺',
  Transport:     '🚗',
  Entertainment: '🎮',
  Shopping:      '🛍️',
  Utilities:     '💡',
  Health:        '🏥',
  Income:        '💰',
};

// ─── Initial Mock Transactions ─────────────────────────────────────────────────

export const initialTransactions: Transaction[] = [
  { id: '1',  date: daysAgo(0),  amount: 12.99,  category: 'Food',          merchant: 'Chipotle',        type: 'debit'  },
  { id: '2',  date: daysAgo(0),  amount: 2500.00, category: 'Income',        merchant: 'Salary Deposit',  type: 'credit' },
  { id: '3',  date: daysAgo(1),  amount: 9.99,   category: 'Subscriptions', merchant: 'Netflix',         type: 'debit'  },
  { id: '4',  date: daysAgo(1),  amount: 34.50,  category: 'Transport',     merchant: 'Shell Gas',       type: 'debit'  },
  { id: '5',  date: daysAgo(2),  amount: 67.23,  category: 'Shopping',      merchant: 'Amazon',          type: 'debit'  },
  { id: '6',  date: daysAgo(2),  amount: 15.99,  category: 'Entertainment', merchant: 'Spotify',         type: 'debit'  },
  { id: '7',  date: daysAgo(3),  amount: 42.80,  category: 'Food',          merchant: 'Whole Foods',     type: 'debit'  },
  { id: '8',  date: daysAgo(4),  amount: 120.00, category: 'Utilities',     merchant: 'Electric Co.',    type: 'debit'  },
  { id: '9',  date: daysAgo(5),  amount: 28.50,  category: 'Food',          merchant: 'DoorDash',        type: 'debit'  },
  { id: '10', date: daysAgo(5),  amount: 85.00,  category: 'Health',        merchant: 'CVS Pharmacy',    type: 'debit'  },
  { id: '11', date: daysAgo(6),  amount: 19.99,  category: 'Entertainment', merchant: 'Steam',           type: 'debit'  },
  { id: '12', date: daysAgo(7),  amount: 55.00,  category: 'Transport',     merchant: 'Uber',            type: 'debit'  },
  { id: '13', date: daysAgo(8),  amount: 23.45,  category: 'Food',          merchant: 'Starbucks',       type: 'debit'  },
  { id: '14', date: daysAgo(9),  amount: 149.99, category: 'Shopping',      merchant: 'Nike Store',      type: 'debit'  },
  { id: '15', date: daysAgo(10), amount: 8.99,   category: 'Subscriptions', merchant: 'iCloud',          type: 'debit'  },
  { id: '16', date: daysAgo(11), amount: 31.20,  category: 'Food',          merchant: 'Panera Bread',    type: 'debit'  },
  { id: '17', date: daysAgo(12), amount: 500.00, category: 'Income',        merchant: 'Freelance Pay',   type: 'credit' },
  { id: '18', date: daysAgo(13), amount: 45.00,  category: 'Transport',     merchant: 'Lyft',            type: 'debit'  },
];

/** Net effect of bundled demo transactions (for balance anchor when using sample data). */
export const INITIAL_TRANSACTIONS_NET = initialTransactions.reduce(
  (acc, tx) => (tx.type === 'credit' ? acc + tx.amount : acc - tx.amount),
  0
);

// ─── Parser Helpers ────────────────────────────────────────────────────────────

export const DEBIT_CATEGORIES: Category[] = [
  'Food', 'Subscriptions', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Health',
];

export const MERCHANT_MAP: Record<Category, string[]> = {
  Food:          ['Chipotle', 'DoorDash', 'Starbucks', 'Whole Foods', 'Panera Bread', 'McDonalds', 'Shake Shack'],
  Subscriptions: ['Netflix', 'Spotify', 'iCloud', 'YouTube Premium', 'ChatGPT Plus', 'Adobe CC', 'Notion Pro'],
  Transport:     ['Uber', 'Lyft', 'Shell Gas', 'Chevron', 'Parking Meter', 'Metro Transit'],
  Entertainment: ['Steam', 'AMC Theaters', 'Xbox Store', 'PlayStation Store', 'Regal Cinemas'],
  Shopping:      ['Amazon', 'Nike Store', 'Target', 'Best Buy', 'IKEA', 'Costco', 'eBay'],
  Utilities:     ['Electric Co.', 'Water Bill', 'Comcast Internet', 'Gas Company', 'AT&T'],
  Health:        ['CVS Pharmacy', 'Walgreens', 'Planet Fitness', 'Doctor Visit', 'Dental Care'],
  Income:        ['Salary Deposit', 'Freelance Payment', 'Direct Deposit', 'Bank Refund'],
};

/** Category keyword detection map */
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Food: [
    'food', 'restaurant', 'eat', 'lunch', 'dinner', 'breakfast', 'coffee',
    'chipotle', 'starbucks', 'doordash', 'ubereats', 'grubhub', 'pizza',
    'burger', 'sushi', 'taco', 'mcdonalds', 'wendys', 'subway', 'panera',
    'shake shack', 'chick-fil-a', 'cafe', 'bakery', 'diner',
  ],
  Transport: [
    'uber', 'lyft', 'gas', 'fuel', 'taxi', 'parking', 'transit', 'bus',
    'train', 'flight', 'airline', 'metro', 'toll', 'shell', 'chevron', 'bp',
    'zip car', 'bird scooter', 'lime',
  ],
  Subscriptions: [
    'netflix', 'spotify', 'subscription', 'premium', 'monthly', 'icloud',
    'youtube', 'hulu', 'disney+', 'apple tv', 'chatgpt', 'openai', 'adobe',
    'dropbox', 'slack', 'notion', 'annual plan', 'membership fee',
  ],
  Entertainment: [
    'movie', 'game', 'concert', 'ticket', 'steam', 'xbox', 'playstation',
    'theater', 'amc', 'regal', 'bowling', 'escape room', 'arcade', 'bar',
    'nightclub', 'comedy', 'show',
  ],
  Shopping: [
    'amazon', 'shopping', 'buy', 'bought', 'store', 'nike', 'target',
    'walmart', 'ikea', 'best buy', 'costco', 'ebay', 'etsy', 'zara',
    'h&m', 'uniqlo', 'purchase', 'ordered',
  ],
  Utilities: [
    'electric', 'water', 'internet', 'utility', 'bill', 'cable',
    'heating', 'at&t', 'verizon', 'comcast', 't-mobile', 'power',
    'broadband', 'wifi',
  ],
  Health: [
    'pharmacy', 'doctor', 'hospital', 'cvs', 'walgreens', 'medicine',
    'gym', 'health', 'dental', 'vision', 'therapy', 'peloton', 'planet fitness',
    'prescription', 'clinic', 'urgent care',
  ],
  Income: [],
};

// ─── Main Parser ───────────────────────────────────────────────────────────────

export function parseTransaction(text: string): Transaction {
  const trimmed = text.trim();
  const lowerText = trimmed.toLowerCase();

  // --- Amount extraction ---
  // Handles: "$45", "$1,200.50", "45.99", "USD 45"
  const amountMatch = trimmed.match(/(?:USD\s*)?\$?\s*([\d,]+\.?\d{0,2})/);
  const amount = amountMatch
    ? Math.round(parseFloat(amountMatch[1].replace(/,/g, '')) * 100) / 100
    : Math.round((Math.random() * 80 + 5) * 100) / 100;

  // --- Income detection ---
  const incomeKeywords = [
    'salary', 'deposit', 'received', 'earned', 'income',
    'refund', 'credited', 'paid me', 'payment received',
    'paycheck', 'payroll', 'dividend', 'reimbursement',
  ];
  const isIncome = incomeKeywords.some(k => lowerText.includes(k));

  // --- Category detection ---
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
    category = found ?? DEBIT_CATEGORIES[Math.floor(Math.random() * DEBIT_CATEGORIES.length)];
  }

  // --- Merchant detection ---
  // Try: "at <Merchant>", quoted name, or fallback to map
  const atMatch    = trimmed.match(/\bat\s+([A-Z][a-zA-Z0-9\s&'.,-]{2,30?})(?:\s+for|\s+\$|[.,]|$)/);
  const quotedMatch = trimmed.match(/["']([^"']{2,40})["']/);

  let merchant: string;
  if (atMatch?.[1]?.trim()) {
    merchant = atMatch[1].trim().replace(/[,.]$/, '');
  } else if (quotedMatch?.[1]?.trim()) {
    merchant = quotedMatch[1].trim();
  } else {
    const pool = MERCHANT_MAP[category];
    merchant   = pool[Math.floor(Math.random() * pool.length)];
  }

  return {
    id:          `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    date:        new Date().toISOString().split('T')[0],
    amount,
    category,
    merchant,
    type:        isIncome ? 'credit' : 'debit',
    description: trimmed,
    isNew:       true,
  };
}

// ─── AI Insight Templates ──────────────────────────────────────────────────────
// Uses {placeholder} syntax — applyTemplate() replaces ALL occurrences safely

export const professionalInsights: string[] = [
  "Your {category} spending of {currency}{amount} is your biggest expense this month. Consider capping it at {currency}{cap} to stay on target.",
  "You're spending {currency}{amount} on {category} — that's {percent}% of total expenses. Benchmark: keep it under {benchmark}%.",
  "Reducing {category} by just 20% saves you {currency}{savings}/month — that's {currency}{annualized}/year compounded.",
  "Your income-to-expense ratio looks healthy. Keep {category} under {currency}{cap} to build 3 months of emergency savings.",
  "Tip: Automate a {currency}{savings} transfer on payday. Your {category} habit costs {currency}{amount} — automation beats willpower.",
  "{category} is at {currency}{amount} this period. A weekly {currency}{cap} soft-cap alert could prevent overspend before it happens.",
  "At your current burn rate, you're spending {currency}{amount} on {category}. Redirect {currency}{savings} of that to investments for real impact.",
];

export const savageInsights: string[] = [
  "Bro... {currency}{amount} on {category}?! Your wallet isn't bleeding — it's hemorrhaging. Seek help. 💀",
  "You've torched {currency}{amount} on {category}. Your future self is watching this from a cardboard box. 📦",
  "At {percent}% of your budget on {category}, you're not on a financial plan — you're on a financial YOLO. 🎰",
  "{currency}{amount} on {category}. Genuinely impressive. Most people ruin their finances slowly — you're speedrunning it. 🏃💨",
  "Your {category} spending is {currency}{amount}. Your bank account just filed a restraining order against you. 🚨",
  "Saving {currency}{savings} from {category} would be easy. But nah, you love the chaos. We get it. We don't respect it, but we get it. 🫡",
  "{category}: {currency}{amount}. Add that up yearly and it's {currency}{annualized}. That's a vacation. Or a therapy fund. Clearly you need both. ✈️🛋️",
];
