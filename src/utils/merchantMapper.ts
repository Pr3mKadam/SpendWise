import { Category } from '@/types';

/**
 * Smart Merchant Mapper
 * Automatically predicts categories based on merchant names
 */
const MERCHANT_MAP: Record<string, Category> = {
  // Food & Dining
  'starbucks': 'Food',
  'mcdonalds': 'Food',
  'zomato': 'Food',
  'swiggy': 'Food',
  'uber eats': 'Food',
  'dominos': 'Food',
  'kfc': 'Food',
  'subway': 'Food',
  'taco bell': 'Food',
  'pizza hut': 'Food',
  'burger king': 'Food',
  'dunkin': 'Food',
  'chipotle': 'Food',
  'instamart': 'Food',
  
  // Shopping
  'amazon': 'Shopping',
  'flipkart': 'Shopping',
  'myntra': 'Shopping',
  'meesho': 'Shopping',
  'walmart': 'Shopping',
  'target': 'Shopping',
  'ebay': 'Shopping',
  'ajio': 'Shopping',
  'zara': 'Shopping',
  'h&m': 'Shopping',
  'nykaa': 'Shopping',
  
  // Transport
  'uber': 'Transport',
  'ola': 'Transport',
  'rapido': 'Transport',
  'lyft': 'Transport',
  'petrol': 'Transport',
  'shell': 'Transport',
  'bpcl': 'Transport',
  'irctc': 'Transport',
  'indigo': 'Transport',
  'air india': 'Transport',
  
  // Entertainment
  'netflix': 'Entertainment',
  'spotify': 'Entertainment',
  'youtube': 'Entertainment',
  'disney': 'Entertainment',
  'hulu': 'Entertainment',
  'prime video': 'Entertainment',
  'bookmyshow': 'Entertainment',
  'pvr': 'Entertainment',
  'steam': 'Entertainment',
  'epic games': 'Entertainment',
  'playstation': 'Entertainment',
  'xbox': 'Entertainment',
  
  // Utilities
  'airtel': 'Utilities',
  'jio': 'Utilities',
  'vi': 'Utilities',
  'bsnl': 'Utilities',
  'electricity': 'Utilities',
  'water bill': 'Utilities',
  'gas': 'Utilities',
  'recharge': 'Utilities',
  
  // Professional / Business
  'google cloud': 'Business',
  'aws': 'Business',
  'azure': 'Business',
  'slack': 'Business',
  'zoom': 'Business',
  'linkedin': 'Business',
  'github': 'Business',
  'digital ocean': 'Business',
  'shopify': 'Business',
  'canva': 'Business',
  'adobe': 'Business',
  'figma': 'Business',
  
  // Education
  'udemy': 'Education',
  'coursera': 'Education',
  'edx': 'Education',
  'skillshare': 'Education',
  'duolingo': 'Education',
  'chegg': 'Education',
  'college': 'Education',
  'university': 'Education',
  'library': 'Education',
};

export function predictCategory(merchant: string): Category {
  const m = merchant.toLowerCase().trim();
  
  // Exact matches
  if (MERCHANT_MAP[m]) return MERCHANT_MAP[m];
  
  // Partial matches
  for (const [key, category] of Object.entries(MERCHANT_MAP)) {
    if (m.includes(key)) return category;
  }
  
  // Default fallback based on keywords
  if (m.includes('cafe') || m.includes('restaurant') || m.includes('diner') || m.includes('bake')) return 'Food';
  if (m.includes('store') || m.includes('shop') || m.includes('mart') || m.includes('mall')) return 'Shopping';
  if (m.includes('taxi') || m.includes('cab') || m.includes('bus') || m.includes('train') || m.includes('flight')) return 'Transport';
  if (m.includes('bill') || m.includes('pay') || m.includes('utility')) return 'Utilities';
  if (m.includes('game') || m.includes('movie') || m.includes('cinema')) return 'Entertainment';
  if (m.includes('class') || m.includes('course') || m.includes('school')) return 'Education';
  
  return 'Shopping';
}
