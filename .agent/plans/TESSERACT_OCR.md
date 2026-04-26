---
phase: 1
plan: 3
wave: 1
---

# Plan 1.3: Offline Snap Receipt (Tesseract.js)

## Objective
Implement an entirely client-side, offline OCR solution for parsing receipts using `tesseract.js`. This provides a reliable, zero-rate-limit fallback when the Gemini API is exhausted or offline.

## Context
- `ROADMAP.md` (Extension of Phase 1 - AI Friction Removal)
- `src/components/MagicInput.tsx`
- `src/utils/imageUtils.ts`

## Tasks

<task type="auto">
  <name>Install Dependencies</name>
  <files>package.json</files>
  <action>
    Install `tesseract.js` as a standard dependency to allow client-side OCR.
  </action>
  <verify>npm list tesseract.js</verify>
  <done>The package `tesseract.js` is installed and registered in package.json.</done>
</task>

<task type="auto">
  <name>Create Local OCR Utility</name>
  <files>src/utils/tesseractParser.ts</files>
  <action>
    Create a new utility file that exports two functions:
    1. `recognizeReceipt(imageBase64: string)`: Initializes Tesseract worker, runs OCR on the base64 string, terminates worker, and returns raw text.
    2. `parseOfflineReceipt(rawText: string)`: Uses Regex to find amounts (e.g., matching "$", "₹", "Total", "Amount") and extract the highest value as the total. Guesses the merchant from the first line or uses our `MERCHANT_CATEGORY_MAP`.
    Returns a structured `Partial<Transaction>` object matching our app's format.
  </action>
  <verify>Check exports of `src/utils/tesseractParser.ts`</verify>
  <done>Utility correctly extracts raw text from image and parses it into a transaction object.</done>
</task>

<task type="auto">
  <name>Integrate Offline OCR into MagicInput</name>
  <files>src/components/MagicInput.tsx</files>
  <action>
    Modify `handleFileChange`:
    - After image compression, attempt to use the local `tesseractParser.ts` first, or add a toggle/fallback flow.
    - If rate limit is hit on Gemini, automatically fallback to Tesseract.
    - Update `AIInputTools` status messages to reflect "Extracting text locally..." so the user knows what is happening.
  </action>
  <verify>Trigger receipt scan with an invalid API key to force fallback, or explicitly call local OCR in code.</verify>
  <done>Receipts can be scanned and logged without using the Gemini API.</done>
</task>

## Success Criteria
- [ ] User can upload a receipt and have the total amount extracted locally.
- [ ] The app handles the parsing entirely in the browser using WebAssembly.
- [ ] No API rate limits trigger when using the offline fallback.
