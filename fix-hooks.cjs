const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const hookMappings = {
    '@/hooks/useGoals': '@/features/goals/hooks/useGoals',
    '../../hooks/useGoals': '@/features/goals/hooks/useGoals',
    '../hooks/useGoals': '@/features/goals/hooks/useGoals',
    
    '@/hooks/useSharedWallets': '@/features/shared/hooks/useSharedWallets',
    '../../hooks/useSharedWallets': '@/features/shared/hooks/useSharedWallets',
    '../hooks/useSharedWallets': '@/features/shared/hooks/useSharedWallets',
    
    '@/hooks/usePortfolio': '@/features/portfolio/hooks/usePortfolio',
    '../../hooks/usePortfolio': '@/features/portfolio/hooks/usePortfolio',
    '../hooks/usePortfolio': '@/features/portfolio/hooks/usePortfolio',
    
    '@/hooks/useRecurring': '@/features/recurring/hooks/useRecurring',
    '../../hooks/useRecurring': '@/features/recurring/hooks/useRecurring',
    '../hooks/useRecurring': '@/features/recurring/hooks/useRecurring',
    
    '@/hooks/useSubscriptions': '@/features/subscriptions/hooks/useSubscriptions',
    '../../hooks/useSubscriptions': '@/features/subscriptions/hooks/useSubscriptions',
    '../hooks/useSubscriptions': '@/features/subscriptions/hooks/useSubscriptions',
    
    '@/hooks/useGamification': '@/features/gamification/hooks/useGamification',
    '../../hooks/useGamification': '@/features/gamification/hooks/useGamification',
    '../hooks/useGamification': '@/features/gamification/hooks/useGamification',
    
    '@/hooks/useAlerts': '@/features/budget/hooks/useAlerts',
    '../../hooks/useAlerts': '@/features/budget/hooks/useAlerts',
    '../hooks/useAlerts': '@/features/budget/hooks/useAlerts',
    
    '@/hooks/useAutomations': '@/features/recurring/hooks/useAutomations',
    '../../hooks/useAutomations': '@/features/recurring/hooks/useAutomations',
    '../hooks/useAutomations': '@/features/recurring/hooks/useAutomations',
    
    '@/hooks/useHealthHistory': '@/features/analytics/hooks/useHealthHistory',
    '../../hooks/useHealthHistory': '@/features/analytics/hooks/useHealthHistory',
    '../hooks/useHealthHistory': '@/features/analytics/hooks/useHealthHistory',
    
    '@/hooks/useQuestReset': '@/features/gamification/hooks/useQuestReset',
    '../../hooks/useQuestReset': '@/features/gamification/hooks/useQuestReset',
    '../hooks/useQuestReset': '@/features/gamification/hooks/useQuestReset'
};

function getAllFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, files);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            files.push(fullPath);
        }
    }
    return files;
}

const files = getAllFiles(srcDir);
let updatedCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    let changed = false;

    for (const [oldImport, newImport] of Object.entries(hookMappings)) {
        // Regex to match exact import path, with quotes
        const regex1 = new RegExp(`from\\s+['"]${oldImport}['"]`, 'g');
        if (regex1.test(content)) {
            content = content.replace(regex1, `from '${newImport}'`);
            changed = true;
        }
        
        // Also dynamic imports
        const regex2 = new RegExp(`import\\(\\s*['"]${oldImport}['"]\\s*\\)`, 'g');
        if (regex2.test(content)) {
            content = content.replace(regex2, `import('${newImport}')`);
            changed = true;
        }
    }
    
    if (changed) {
        fs.writeFileSync(file, content, 'utf-8');
        updatedCount++;
    }
}

console.log(`Updated hooks imports in ${updatedCount} files.`);
