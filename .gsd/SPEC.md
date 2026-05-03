# SPEC.md - SpendWise: Local-First Financial Privacy

## Status: FINALIZED

## Overview
SpendWise is a premium, privacy-first personal finance application. It has transitioned from a cloud-based architecture (Supabase/Gemini) to a **100% Local-First** model. All data remains on the user's device, and AI features run locally using browser-based engines.

## Core Requirements (Current & Planned)

### 1. Local-First Architecture
- **State Management**: Zustand for global app state.
- **Persistence**: Hybrid approach using LocalStorage and IndexedDB (via custom hooks).
- **Data Safety**: Automated local backups and data integrity checks.

### 2. Offline AI & Privacy
- **Local OCR**: Tesseract.js for scanning receipts offline.
- **Local Voice**: Web Speech API for voice commands and transaction entry.
- **Local Advisor**: Rule-based financial coaching engine (no external API calls).
- **Privacy Controls**: Built-in parental controls and wallet encryption.

### 3. Premium UX & Analytics
- **Immersive Dashboards**: High-fidelity charts using Recharts and Framer Motion animations.
- **Wealth Tree**: Visual representation of asset growth and financial health.
- **Tax Prediction**: Offline Indian Income Tax (New Regime) calculator.
- **Soundscape**: Contextual audio cues for focused budgeting.

### 4. Smart Automation & Connectivity (Upcoming)
- **Recurring Engine**: Automatic transaction generation for bills and subscriptions.
- **P2P Sync**: Local device-to-device synchronization via QR codes or local networking.
- **Professional Exports**: Client-side generation of PDF/CSV financial statements.

## Technical Constraints
- **Zero Cloud Dependency**: No external APIs for core functionality (Auth, DB, AI).
- **Bundle Efficiency**: Strict 1MB limit for the initial JS bundle.
- **Performance**: 60fps animations and sub-100ms interaction latency.

## Out of Scope
- Server-side data storage or synchronization.
- Real-time stock market data (due to offline constraint).
- Multi-user collaboration via central server.
