# Contributing to Humanity Ledger

First off, thank you for considering contributing to Humanity Ledger. It's people like you that make zero-knowledge privacy scalable and accessible.

## Our Philosophy
We strictly adhere to a brutalist, mathematics-first philosophy:
1. **Zero-Knowledge First**: Never merge code that compromises user privacy or exposes raw metadata to central servers.
2. **Deterministic UI**: Our interface (Swiss brutalist) is purely functional. Do not submit PRs adding gradients, drop-shadows, or unnecessary animations.
3. **Local Sovereignty**: Client-side processing over server-side logic whenever possible.

## Development Workflow

### 1. Fork & Branch
- Fork the repository.
- Create a new branch off `main` for your feature or bugfix.
- Branch naming convention: `feat/your-feature`, `fix/issue-name`, `chore/task-name`.

### 2. Code Standards
- **TypeScript**: We use strict TypeScript. No `any` types unless absolutely unavoidable (and thoroughly documented).
- **React/Next.js**: Use functional components and modern React hooks. Ensure Server Components are used appropriately for performance.
- **Styling**: TailwindCSS is used for utility-first styling. Stick to our monochrome/brutalist color palette.

### 3. Commits
Write clear, concise commit messages using the Conventional Commits specification:
- `feat: add stealth payments using Aztec Noir`
- `fix: resolve WebRTC connection race condition`

### 4. Pull Requests
- Open a PR against the `main` branch.
- Include a detailed description of what the PR solves.
- If it's a UI change, attach screenshots or a screen recording (ensure no real data is exposed).
- Wait for a core team member to review. All PRs require at least one approving review before merging.

## Bug Reports & Feature Requests
Use the GitHub Issues tab. Please provide step-by-step reproduction instructions for bugs. For feature requests, explain the cryptographic or UX rationale behind the proposal.
