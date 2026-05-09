# SpendWise Wiki & Onboarding Guide

Welcome to the SpendWise project! This guide is designed to help you understand the architecture, setup, and key features of the application.

---

## 🗺️ Onboarding

### Principal-Level Guide

> [!NOTE]
> **Core Architectural Insight:** SpendWise is a **local-first** application. It prioritizes local data storage (IndexedDB via Dexie) and state management (Zustand) over cloud-centric APIs. This ensures high performance, offline capability, and maximum privacy.

#### System Architecture
The application follows a component-based architecture with feature-specific views.
- **State Management**: Zustand (see [src/store/index.ts](file:///d:/Projects/Hackathon/SpendWise/SpendWise/src/store/index.ts))
- **Persistence**: Dexie.js wrapping IndexedDB (see [src/db/db.ts](file:///d:/Projects/Hackathon/SpendWise/SpendWise/src/db/db.ts))
- **UI Framework**: React with Vite and TailwindCSS.

#### Strategic Direction
- **AI Integration**: Leverages Gemini API for "Magic Input" and financial advice, but handles fallbacks gracefully to maintain the local-first promise.
- **Gamification**: Deeply integrated to drive user engagement.

---

### Zero-to-Hero Learning Path

If you are new to the codebase, follow this path to get up to speed:

1.  **Understand the Entry Point**: Start at [src/main.tsx](file:///d:/Projects/Hackathon/SpendWise/SpendWise/src/main.tsx) and [src/App.tsx](file:///d:/Projects/Hackathon/SpendWise/SpendWise/src/App.tsx) to see how the app is bootstrapped and how the routing/layout works.
2.  **Explore the Shell**: Check out [src/components/layout/MainShell.tsx](file:///d:/Projects/Hackathon/SpendWise/SpendWise/src/components/layout/MainShell.tsx) to understand the layout and navigation.
3.  **Dive into State**: Look at [src/store/index.ts](file:///d:/Projects/Hackathon/SpendWise/SpendWise/src/store/index.ts) to see how global state is managed.

---

## 🚀 Getting Started

### Project Overview
SpendWise is a premium personal finance application designed to help users track expenses, set goals, and gain insights into their financial health.

### Setup
To run the project locally:
1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Start the development server: `npm run dev`

---

## 🔍 Deep Dive

### Subsystems & Components

#### State Store
- **File**: [src/store/index.ts](file:///d:/Projects/Hackathon/SpendWise/SpendWise/src/store/index.ts)
- **Description**: Centralized state management using Zustand. Combines multiple slices for transactions, goals, levels, etc.

#### Database
- **File**: [src/db/db.ts](file:///d:/Projects/Hackathon/SpendWise/SpendWise/src/db/db.ts)
- **Description**: Dexie.js instance defining tables for transactions, categories, and settings.

#### Intelligent Features

*   **AI Advisor**: Provides recommendations. See [src/utils/insights/advisor.ts](file:///d:/Projects/Hackathon/SpendWise/SpendWise/src/utils/insights/advisor.ts).
*   **Anomaly Detection**: Flags unusual transactions. See [src/utils/insights/anomaly.ts](file:///d:/Projects/Hackathon/SpendWise/SpendWise/src/utils/insights/anomaly.ts).
*   **Tax Predictor**: Estimates tax liability. See [src/components/features/analytics/TaxPredictor.tsx](file:///d:/Projects/Hackathon/SpendWise/SpendWise/src/components/features/analytics/TaxPredictor.tsx).

#### Immersive Experience

*   **Gamification**: Level up and quest tracking. See [src/components/features/gamification/LevelUpModal.tsx](file:///d:/Projects/Hackathon/SpendWise/SpendWise/src/components/features/gamification/LevelUpModal.tsx).
*   **Soundscape**: Ambient music and sounds. See [src/components/features/audio/Soundscape.tsx](file:///d:/Projects/Hackathon/SpendWise/SpendWise/src/components/features/audio/Soundscape.tsx).
*   **Wealth Tree**: Visual growth representation. See [src/components/features/wealth/WealthTree.tsx](file:///d:/Projects/Hackathon/SpendWise/SpendWise/src/components/features/wealth/WealthTree.tsx).

---

## 📚 References
- [PROJECT_RULES.md](file:///d:/Projects/Hackathon/SpendWise/SpendWise/PROJECT_RULES.md) - GSD Protocol Rules.
- [GSD-STYLE.md](file:///d:/Projects/Hackathon/SpendWise/SpendWise/GSD-STYLE.md) - Coding style and guidelines.
