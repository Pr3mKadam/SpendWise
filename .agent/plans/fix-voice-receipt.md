# Fix: Magic Mic & Snap Receipt

## Root Problems
1. **Magic Mic**: Web Speech API captures transcript fine → then parseTransaction() hits Gemini (429). Need local NLP fallback so the feature works WITHOUT an API call in most cases.
2. **Snap Receipt**: Large images consume too many tokens AND hit 429. Need to compress images client-side before sending, plus better error handling.

## Plan

### Phase A – Local Voice Parser (No API)
- Build `src/utils/voiceParser.ts`:
  - Regex-based parser for common spoken patterns like:
    - "spent 150 on coffee" → debit, Food, "Coffee", 150
    - "paid 500 for groceries at BigBazaar" → debit, Food, "BigBazaar", 500
    - "got salary 30000" → credit, Income, "Salary", 30000
    - "paid 200 uber" → debit, Transport, "Uber", 200
  - Merchant → Category inference map (uber/ola → Transport, zomato/swiggy → Food etc.)
  - Returns ParsedTransaction shape
  - Falls back gracefully if confidence < 0.5

### Phase B – Smart AI calling strategy
- In MagicInput.tsx:
  - For Voice: FIRST try local voiceParser. If confidence ≥ 0.75, use it directly (no API). If < 0.75, then try Gemini.
  - For Receipt: Compress image to max 512px & 60% quality before calling Gemini (canvas resizing).
  - Add 3-second debounce/cooldown between Gemini API calls.

### Phase C – Better UX for Voice
- Show real-time transcript as user speaks (interimResults: true)
- Show "Heard: [transcript]" before processing
- Show which parser was used (Local / AI)
- Add "Re-listen" button after processing
- Voice modal overlay instead of inline error text

### Phase D – Better UX for Receipt
- Show image preview before scanning starts
- Show "Compressing..." then "Scanning with AI..."
- Clearer split UI with ability to edit before adding
