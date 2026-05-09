# Security Audit Report (007 Methodology)

This report details the security analysis of the SpendWise project, following the 007 workflow and Broken Authentication testing principles.

---

## 1. Resumo Do Sistema

SpendWise is a local-first personal finance application. It leverages browser storage (IndexedDB and LocalStorage) for data persistence and integrates with the Gemini API for intelligent features (voice processing, OCR).

---

## 2. Mapa De Ataque (Surface Map)

*   **Inputs**: User input in forms, voice recordings (parsed via Gemini), receipt images (parsed via Gemini), Razorpay API keys input by user.
*   **Storage**: `localStorage` (User session, Razorpay keys), IndexedDB (Transactions, configuration).
*   **External Calls**: Gemini API (via URL with API key), Razorpay API (via Basic Auth).
*   **Trust Boundaries**: The browser environment is considered the trust boundary. Data is stored locally.

---

## 3. Vulnerabilidades Encontradas

### #1 | CRITICA | Armazenamento de Segredos em LocalStorage
*   **Vetor**: `d:\Projects\Hackathon\SpendWise\SpendWise\src\components\views\BankSyncView.tsx` (Line 94-95)
*   **Impacto**: Razorpay `keyId` and `keySecret` are stored in plaintext in `localStorage`. Any script running in the same origin (including third-party scripts or XSS vulnerabilities) can access these secrets.
*   **Correcao**: Avoid storing API secrets in `localStorage`. If necessary for a local-first app, encrypt them using a key derived from a user-provided password (not auto-generated).

### #2 | ALTA | Autenticacao Simulada (Broken Authentication)
*   **Vetor**: `d:\Projects\Hackathon\SpendWise\SpendWise\src\hooks\useAuth.tsx` (Line 38-42)
*   **Impacto**: The application automatically logs in a guest user if no session is found. There is no password enforcement or verification. While acceptable for a prototype, it offers no protection for sensitive financial data on shared devices.
*   **Correcao**: Implement at least a local PIN or password protection mechanism to secure access to the local database.

---

## 4. Threat Model (STRIDE)

*   **S**poofing: Low risk as it's a local app, but an attacker with physical access can spoof the user by accessing the browser.
*   **T**ampering: High risk if XSS occurs; data in `localStorage` or IndexedDB can be modified.
*   **R**epudiation: Low as there is no multi-user audit trail required yet.
*   **I**nformation Disclosure: **CRITICAL**. Secrets in `localStorage` are exposed.
*   **D**enial of Service: Low risk locally.
*   **E**levation of Privilege: Not applicable in a single-user local context, but access to Razorpay keys gives access to the payment gateway.

---

## 5. Correcoes Propostas

1.  **Secure Storage**: Migrate Razorpay keys to a secure storage pattern. If a backend is not possible, prompt the user for the keys per session or encrypt them with a master password stored in memory (not persisted).
2.  **Auth Hardening**: Add a "Lock" feature with a PIN to protect local data.

---

## 6. Hardening E Melhorias

*   **Content Security Policy (CSP)**: Implement a strict CSP to prevent XSS, which is the primary vector for stealing data from `localStorage`.
*   **Subresource Integrity (SRI)**: Ensure the Razorpay SDK script tag (if loaded from CDN) uses SRI.

---

## 7. Scoring

| Dominio | Nota (0-100) |
|---|---|
| Segredos & Credenciais | 20 |
| Input Validation | 70 |
| Autenticacao | 30 |
| Protecao de Dados | 50 |
| **Score Final** | **42.5 (Bloqueado Total/Inseguro para Producao)** |

---

## 8. Veredito Final

**Veredito**: **Bloqueado** (Inseguro para producao).
**Justificativa**: The storage of API secrets in plaintext in `localStorage` is a critical vulnerability that must be addressed before the app can be considered safe for real-world use with actual financial credentials.
