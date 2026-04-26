---
phase: 1
plan: 4
wave: 1
---

# Plan 1.4: Purge Gemini API & Go 100% Offline

## Objective
Remove all dependencies on the Gemini API (`@google/genai` or standard `fetch` to Google's endpoints), making the application completely self-contained, offline-first, and immune to API key issues or rate limits.

## Context
The user has decided that the benefits of a completely local application (zero rate limits, no setup required, better privacy) outweigh the benefits of the cloud AI. 
This means we need to adapt features that previously relied on Gemini to use local alternatives or be removed.

## Impact Analysis (What will change)
1. **Magic Mic (Voice)**: Will use *only* our `voiceParser.ts` regex engine.
2. **Snap Receipt**: Will use *only* our `tesseractParser.ts` OCR engine. (No more splitting items).
3. **Razorpay SMS Sync**: Will use a new local regex parser instead of asking the AI to extract amounts from SMS.
4. **AI Coach / AI Chat**: Since true conversational AI cannot run efficiently in the browser without massive downloads, the `AIChatPane` will either be:
   - **Option A**: Replaced with a "Rule-based Coach" that gives generic financial tips based on keywords.
   - **Option B**: Removed entirely to simplify the app.

## Tasks

<task type="checkpoint:decision">
  <name>Decide Fate of AI Coach</name>
  <action>
    Ask the user whether they want to keep a "fake/rule-based" AI Coach, or just remove the AI Coach button and chat pane from the UI completely to streamline the app.
  </action>
</task>

<task type="auto">
  <name>Delete Gemini Services</name>
  <files>src/services/ai.ts</files>
  <action>
    Delete the `ai.ts` file or completely rewrite it to only export local mock versions if types are needed elsewhere.
  </action>
</task>

<task type="auto">
  <name>Refactor MagicInput</name>
  <files>src/components/MagicInput.tsx</files>
  <action>
    Remove all fallback try/catch logic. The `handleFileChange` will *only* call Tesseract. The `handleVoiceInput` will *only* call `parseVoiceLocally`.
    Remove references to `SplitItem`.
  </action>
</task>

<task type="auto">
  <name>Refactor Razorpay Sync</name>
  <files>src/utils/razorpaySync.ts</files>
  <action>
    Replace the Gemini API call with a local Regex extractor that looks for standard Razorpay SMS formats (e.g. "Paid Rs 500 to Merchant via UPI...").
  </action>
</task>

## Success Criteria
- [x] No `fetch` calls to `generativelanguage.googleapis.com` exist anywhere in the codebase.
- [x] The app functions 100% locally and instantly.
- [x] No `.env` configuration is required for any feature to work.
