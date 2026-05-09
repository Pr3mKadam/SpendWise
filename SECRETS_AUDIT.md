# Secrets Audit Report

This report details the audit of secrets handling in the SpendWise project, focusing on API keys and credentials.

---

## 1. Resumo

The project uses external APIs (Gemini, Razorpay) that require authentication keys. As a local-first application, handling these keys securely in the browser environment is a challenge.

---

## 2. Findings

### #1 | Gemini API Key (VITE_GEMINI_API_KEY)
*   **Location**: `src/services/VoiceService.ts` and `src/services/OCRService.ts`
*   **Usage**: Loaded via `import.meta.env.VITE_GEMINI_API_KEY`.
*   **Risk**: While not hardcoded in the source code (it reads from environment variables), Vite exposes these variables to the client-side bundle. Anyone inspecting the network traffic or the source code in the browser can see the API key.
*   **Recommendation**: For production, use a thin backend proxy to make calls to the Gemini API. The frontend should call the proxy, and the proxy should append the API key stored securely on the server.

### #2 | Razorpay Keys (keyId, keySecret)
*   **Location**: `src/components/views/BankSyncView.tsx` (Line 94-95)
*   **Usage**: Stored in `localStorage` in plaintext when the user checks "Save locally".
*   **Risk**: **CRITICAL**. `localStorage` is accessible by any script running in the same origin. XSS attacks can easily steal these keys, leading to complete compromise of the connected Razorpay account.
*   **Recommendation**: 
    1.  **Do not store secrets in LocalStorage**.
    2.  If local persistence is required for a serverless/local-first architecture, prompt the user for a master password and use it to encrypt the keys before saving them to `localStorage` (AES-GCM).
    3.  Alternatively, use session-only storage (in-memory state) so the keys are lost when the tab is closed.

---

## 3. Best Practices Compliance

*   **Never commit secrets**: Compliant. No hardcoded keys found in the scanned files.
*   **Use environment variables**: Compliant for Gemini API.
*   **Mask secrets in logs**: Not checked, but ensure `console.log` does not print keys.

---

## 4. Conclusion

The handling of Gemini API keys is standard for pure frontend apps but insecure for production. The storage of Razorpay keys in `localStorage` is a critical vulnerability that should be fixed immediately by removing the "Save locally" feature or implementing encryption.
