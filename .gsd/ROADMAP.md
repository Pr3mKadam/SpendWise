# ROADMAP.md - SpendWise Evolution

## Status: ACTIVE
**Current Phase**: 1.6 (DIY Local Persistence)

---

## Phase 1: Local-First Foundations (Current)

### Phase 1.5: Local-First Migration ✅
- [x] **State Management**: Implemented Zustand store (`src/store/index.ts`).
- [x] **Backend Decoupling**: Removed all Supabase and Convex dependencies.
- [x] **Context Refactor**: Removed `AuthContext` and `ParentalControlContext` in favor of Zustand hooks.
- [x] **UI Restructuring**: Reorganized components into `features/` and `views/` directories.
- [x] **Persistence**: Basic `localStorage` synchronization for transactions and config.

### Phase 1.6: DIY Local Persistence (Next) 🚀
- [ ] **Robust Storage**: Evaluate and implement IndexedDB (via Dexie.js or PouchDB) for handling larger datasets.
- [ ] **Data Migration**: Utility to migrate from `localStorage` to the new DB.
- [ ] **Backup/Restore**: Implement JSON export/import for user data portability.
- [ ] **Encryption**: Add optional client-side encryption for the local database.

### Phase 1.7: 100% Offline AI & Privacy 🛠️
- [ ] **Remove Gemini**: Delete all cloud AI service calls and API key requirements.
- [ ] **Local OCR**: Enhance Tesseract.js integration for receipt scanning.
- [ ] **Local Voice**: Improve Regex-based parsing for voice commands.
- [ ] **Rule-based Advisor**: Implement a heuristic-based financial coach that runs entirely on device.

---

## Phase 2: Elite Wealth & Production Polish (Planned)

### Phase 1.8: Advanced Analytics & UX
- [ ] **Tax Predictor**: Finalize the Tax Liability module.
- [ ] **Wealth Tree**: Enhance visualization of asset growth.
- [ ] **Soundscape**: Integrate atmospheric audio for "Deep Work" budgeting sessions.
- [ ] **Performance Audit**: Optimize bundle size and Framer Motion animations.

### Phase 2.0: Production Launch
- [ ] **Security Audit**: Final review of encryption and local storage safety.
- [ ] **Compliance**: Ensure GDPR/CCPA readiness for local data handling.
- [ ] **Deployment**: Optimize Vercel configuration for the PWA.

---

## Legend
- ✅ Completed
- 🚀 Current Task
- 🛠️ In Progress
- 📅 Planned
