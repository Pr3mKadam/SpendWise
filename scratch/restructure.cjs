const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const moveMap = new Map();

function planMove(oldRelPath, newRelPath) {
    const oldPath = path.join(__dirname, oldRelPath);
    const newPath = path.join(__dirname, newRelPath);
    if (fs.existsSync(oldPath)) {
        if (fs.statSync(oldPath).isDirectory()) {
            const items = fs.readdirSync(oldPath);
            for (const item of items) {
                planMove(path.join(oldRelPath, item), path.join(newRelPath, item));
            }
        } else {
            moveMap.set(oldPath, newPath);
        }
    }
}

// 1. App.tsx & Layout
planMove('src/App.tsx', 'src/app/App.tsx');
planMove('src/components/layout/MainShell.tsx', 'src/app/MainShell.tsx');
planMove('src/components/layout/ViewRenderer.tsx', 'src/app/ViewRenderer.tsx');
planMove('src/components/layout/AppModals.tsx', 'src/app/AppModals.tsx');

// 2. Features mapping
const featureRenames = {
    'history': 'transactions',
    'budgets': 'budget',
    'wealth': 'portfolio'
};

const oldFeaturesDir = path.join(__dirname, 'src/components/features');
if (fs.existsSync(oldFeaturesDir)) {
    const featureDirs = fs.readdirSync(oldFeaturesDir);
    for (const f of featureDirs) {
        const featurePath = path.join(oldFeaturesDir, f);
        if (fs.statSync(featurePath).isDirectory()) {
            const newF = featureRenames[f] || f;
            const items = fs.readdirSync(featurePath);
            for (const item of items) {
                if (item === 'hooks' || item === 'components') {
                    planMove(path.join('src/components/features', f, item), path.join('src/features', newF, item));
                } else {
                    planMove(path.join('src/components/features', f, item), path.join('src/features', newF, 'components', item));
                }
            }
        }
    }
}

// 4. Views
const views = {
    'AuthView.tsx': 'auth',
    'DashboardView.tsx': 'dashboard',
    'DashboardViewMobile.tsx': 'dashboard',
    'HistoryView.tsx': 'transactions',
    'HistoryViewMobile.tsx': 'transactions',
    'BudgetView.tsx': 'budget',
    'BudgetViewMobile.tsx': 'budget',
    'GoalsView.tsx': 'goals',
    'GoalsViewMobile.tsx': 'goals',
    'AnalyticsView.tsx': 'analytics',
    'AnalyticsViewMobile.tsx': 'analytics',
    'AdvisorView.tsx': 'advisor',
    'AdvisorViewMobile.tsx': 'advisor',
    'EducationView.tsx': 'education',
    'GamificationView.tsx': 'gamification',
    'PortfolioView.tsx': 'portfolio',
    'PortfolioViewMobile.tsx': 'portfolio',
    'SharedView.tsx': 'shared',
    'BankSyncView.tsx': 'sync',
    'ParentalView.tsx': 'parental',
    'ProfileView.tsx': 'profile',
    'ProfileViewMobile.tsx': 'profile',
    'ReportsView.tsx': 'reports',
    'RecurringView.tsx': 'recurring',
};

for (const [view, feature] of Object.entries(views)) {
    planMove(path.join('src/components/views', view), path.join('src/features', feature, view));
}

// 5. Hooks
const featureHooks = {
    'useGoals.ts': 'goals',
    'useSharedWallets.ts': 'shared',
    'usePortfolio.ts': 'portfolio',
    'useRecurring.ts': 'recurring',
    'useSubscriptions.ts': 'subscriptions',
    'useGamification.ts': 'gamification',
    'useAlerts.ts': 'budget',
    'useAutomations.ts': 'recurring',
    'useHealthHistory.ts': 'analytics',
    'useQuestReset.ts': 'gamification'
};

for (const [hook, feature] of Object.entries(featureHooks)) {
    planMove(path.join('src/hooks', hook), path.join('src/features', feature, 'hooks', hook));
}

function getAllFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, files);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            files.push(fullPath);
        }
    }
    return files;
}

const allFiles = getAllFiles(srcDir);

function resolveImport(currentFileDir, importPath) {
    if (!importPath.startsWith('.')) return null; 
    let resolved = path.resolve(currentFileDir, importPath);
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        resolved = path.join(resolved, 'index');
    }
    for (const ext of ['.ts', '.tsx', '.js', '.jsx', '']) {
        if (fs.existsSync(resolved + ext) && fs.statSync(resolved + ext).isFile()) {
            return resolved + ext;
        }
    }
    return null;
}

const getAliasPath = (absPath) => {
    const rel = path.relative(srcDir, absPath).replace(/\\/g, '/');
    if (rel.startsWith('features/')) return '@/' + rel.replace(/\.tsx?$/, '');
    if (rel.startsWith('app/')) return '@/' + rel.replace(/\.tsx?$/, '');
    if (rel.startsWith('ui/')) return '@/' + rel.replace(/\.tsx?$/, '');
    if (rel.startsWith('shell/')) return '@/' + rel.replace(/\.tsx?$/, '');
    if (rel.startsWith('insights/')) return '@/' + rel.replace(/\.tsx?$/, '');
    if (rel.startsWith('parsers/')) return '@/' + rel.replace(/\.tsx?$/, '');
    if (rel.startsWith('lib/')) return '@/' + rel.replace(/\.tsx?$/, '');
    return null;
}

const modifiedContents = new Map();

for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    let changed = false;
    const oldFileDir = path.dirname(file);
    const newFileAbs = moveMap.get(file) || file;
    const newFileDir = path.dirname(newFileAbs);

    const importRegex = /(from\s+['"])([^'"]+)(['"])|(import\s*\(\s*['"])([^'"]+)(['"]\s*\))/g;
    
    content = content.replace(importRegex, (match, p1, p2, p3, p4, p5, p6) => {
        const prefix = p1 || p4;
        const importPath = p2 || p5;
        const suffix = p3 || p6;

        if (importPath.startsWith('.')) {
            const resolvedOld = resolveImport(oldFileDir, importPath);
            if (resolvedOld) {
                const targetNewAbs = moveMap.get(resolvedOld) || resolvedOld;
                
                const alias = getAliasPath(targetNewAbs);
                if (alias) {
                    changed = true;
                    return prefix + alias + suffix;
                }
                
                let newRel = path.relative(newFileDir, targetNewAbs).replace(/\\/g, '/');
                if (!newRel.startsWith('.')) newRel = './' + newRel;
                newRel = newRel.replace(/\.tsx?$/, '').replace(/\.js$/, '');
                
                if (newRel !== importPath) {
                    changed = true;
                    return prefix + newRel + suffix;
                }
            }
        } else if (importPath.startsWith('@/components/features/') || importPath.startsWith('@/components/views/') || importPath.startsWith('@/components/layout/') || importPath === '@/App') {
            const simulatedAbs = path.join(srcDir, importPath.slice(2));
            const resolvedOld = resolveImport(path.dirname(simulatedAbs), './' + path.basename(simulatedAbs));
            let foundOld = resolvedOld || simulatedAbs;
            
            if (moveMap.has(foundOld)) {
                const targetNewAbs = moveMap.get(foundOld);
                const alias = getAliasPath(targetNewAbs);
                if (alias) {
                    changed = true;
                    return prefix + alias + suffix;
                }
            }
        }
        return match;
    });

    if (changed || moveMap.has(file)) {
        modifiedContents.set(file, content);
    }
}

for (const [oldPath, newPath] of moveMap.entries()) {
    fs.mkdirSync(path.dirname(newPath), { recursive: true });
}

for (const [oldPath, content] of modifiedContents.entries()) {
    const targetPath = moveMap.get(oldPath) || oldPath;
    fs.writeFileSync(targetPath, content, 'utf-8');
}

for (const oldPath of moveMap.keys()) {
    if (moveMap.get(oldPath) !== oldPath && fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
    }
}

function cleanupDirs(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const full = path.join(dir, item);
        if (fs.statSync(full).isDirectory()) cleanupDirs(full);
    }
    if (fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
    }
}
cleanupDirs(path.join(srcDir, 'components'));

console.log('Restructure complete. Updated ' + modifiedContents.size + ' files.');
