# Security Policy

## Supported Versions

Security updates and vulnerability patches are actively maintained for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 6.0.x   | :white_check_mark: |
| 5.x     | :x:                |
| < 5.0   | :x:                |

---

## Reporting a Vulnerability

The SatExpert team takes software and cryptographic security seriously. If you discover a potential vulnerability in our telemetry ingestion, Post-Quantum Cryptographic implementations (Kyber-1024 / Dilithium-5), or satellite communication protocols:

1. **Do NOT report security issues through public GitHub Issues.**
2. Send an advisory email to: `security@satexpert.defense` or open a confidential advisory via GitHub Security Advisories.
3. Include the following details in your report:
   - Component affected (e.g., `SentinelAIControl`, `QuantumKeyVisualizer`, `server.ts`)
   - Description of the vulnerability and attack vector
   - Steps to reproduce or proof-of-concept script
   - Potential impact on operational security or telemetry integrity

---

## Response Timeline

- **Initial Acknowledgement**: Within 24–48 hours of receipt.
- **Triage & Assessment**: Within 5 business days.
- **Fix & Patch Deployment**: Critical flaws patched within 7 business days, followed by public coordinated disclosure.

---

## 🔒 Secret & Credential Protection on GitHub

To guarantee that private credentials and API keys are NEVER exposed in public GitHub repositories:

1. **Ignored Configuration Files**:
   - `firebase-applet-config.json` is strictly added to `.gitignore`.
   - All `.env`, `.env.local`, and `*.local.env` files are blocked from version control.
   - Use `firebase-applet-config.example.json` and `.env.example` as sanitized templates.

2. **Environment Variable Injection**:
   - Production and CI/CD pipelines use Vite client environment variables (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.) injected at build time rather than hardcoded files.
   - Server-side API tokens (e.g. `GEMINI_API_KEY`) are kept strictly on the backend server and never sent to client bundles.

3. **In-App Masking**:
   - Diagnostic and telemetry consoles mask sensitive keys (`AIzaSy...****`) to prevent shoulder surfing or recording leaks.

