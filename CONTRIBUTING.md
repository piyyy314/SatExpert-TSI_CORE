# Contributing to SatExpert TSI

Thank you for your interest in contributing to **SatExpert Tactical SatCom Intelligence (TSI)**! We welcome contributions, bug fixes, enhancements, and documentation improvements from engineers and operators.

---

## 📋 Code of Conduct

All contributors are expected to uphold our [Code of Conduct](./CODE_OF_CONDUCT.md). Please treat all members of the community with professionalism and respect.

---

## 🛠️ Development Workflow

### 1. Fork & Branch
- Fork the repository on GitHub.
- Create a feature branch with a descriptive name:
  ```bash
  git checkout -b feature/ai-decision-matrix-enhancements
  # or
  git checkout -b fix/telemetry-sparkline-bounds
  ```

### 2. Install & Run Locally
```bash
npm install
npm run dev
```

### 3. Verify Code Quality
Before submitting code, ensure that:
- TypeScript compiles cleanly without errors:
  ```bash
  npm run lint
  ```
- The production build bundles successfully:
  ```bash
  npm run build
  ```

---

## 📐 Coding Conventions

- **Language**: TypeScript with strict mode enabled.
- **Styling**: Tailwind CSS utility classes. Avoid inline style objects where possible.
- **Components**: Functional React components with hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
- **Telemetry Safety**: Ensure that calculations handle edge cases gracefully (division by zero, missing sensors, extreme temperature values).
- **Sound & Visuals**: Ensure audio effects respect mute toggles and do not block the UI thread.

---

## 🚀 Submitting a Pull Request

1. Ensure your branch is rebased onto the latest `main` branch.
2. Fill out the provided [Pull Request Template](./.github/pull_request_template.md).
3. Include screenshots or GIFs if you are introducing UI or visual changes.
4. Reference any relevant issue tickets.
