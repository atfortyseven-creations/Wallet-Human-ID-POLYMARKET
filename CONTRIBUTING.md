# Contributing to Humanity Ledger

We welcome contributions to the Humanity Ledger front-end and infrastructure.

## Design Guidelines
Our design language relies on clarity, readability, and structural hierarchy.
- **Typography**: We strictly use IBM Plex Sans (prose/UI) and IBM Plex Mono (code/hashes). Do not introduce decorative or display fonts.
- **Content**: Prose should not use automatic hyphenation (`hyphens: none`). Use `word-break: break-all` only for cryptographic hashes or addresses.
- **Theme**: Our primary palette relies on clean, high-contrast layouts (black/white/zinc).

## Development Workflow
1. Fork the repository and create a feature branch.
2. Ensure your code compiles (`npm run build`) and passes linting.
3. Be transparent in your PRs. Do not claim features are "Zero-Knowledge" or "production-ready" if they rely on simulated Web2 fallbacks.
4. Submit your PR for review.
