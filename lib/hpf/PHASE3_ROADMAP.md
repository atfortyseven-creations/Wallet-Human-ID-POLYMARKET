# HPF Phase 3 — Selective disclosure (planned)

This phase is **not implemented** in the current app build. It documents the intended path aligned with the Humanity Provenance Framework roadmap.

## Goals

- **Noir circuit v2** — extend `circuits/src/main.nr` to prove a field exists in a passport payload without revealing the full JSON (e.g. supplier list).
- **Compile + CI** — `nargo compile`, commit ACIR artifact, client-side prove via `@aztec/bb.js`.
- **Viewing keys** — replace demo logic in `lib/blockchain/StealthAddressService.ts` with Aztec viewing-key patterns from Aztec Network docs.
- **Share via Whale Chat** — encrypted message type `VIEWING_KEY:{passportId}:{exp}` in `SystemChat.tsx`.

## Explicit non-goals for Phase 3 MVP wiring

- Do **not** enable `services/crypto/zk-shield-worker.ts` (mock) for passports.
- Phase 1–2 passports remain **public read** until viewing keys ship.

## UI copy when implemented

- Label public passports: **Public passport**
- Label ZK-backed shares: **Private proof (beta)**

See `/privacy#product-scan` for what works today.
