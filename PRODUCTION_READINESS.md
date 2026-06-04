# Production Readiness Audit & Plan

## Current Status
The "Human Wallet" has a stunning UI and a solid foundation for core features. However, several advanced features are currently implemented as "UI-only" or with "Mock Backends".

## Areas for Completion

### 1. Database Schema Expansion [CRITICAL]
The `prisma/schema.prisma` file needs new models to track the state of advanced features:
- [ ] `TimeLockVault` (amount, unlockDate, txHash, status)
- [ ] `DeadMansSwitch` (beneficiary, inactivityPeriod, lastPing, active)
- [ ] `Guardian` (user email, guardian address, threshold)
- [ ] `PrivacyDonation` (amount, nullifier, commitment)

### 2. Smart Contract Deployment
- [ ] Deploy `HumanTimeLock.sol` to Ethereum Mainnet/Base.
- [ ] Deploy a simple `DeadMansSwitch.sol` logic or use a Factory pattern.

### 3. Backend Implementation (Real Logic)
- [ ] **/api/wallet/swap**: Move from "building transaction" to actually signing and broadcasting using the user's encrypted session key.
- [ ] **/api/wallet/timelock/create**: Implement real interaction with the deployed contract via `ethers.js`.
- [ ] **/api/wallet/deadman/setup**: Create cron job to check `lastPing` and execute transfers.
- [ ] **/api/wallet/rebalance/execute**: Connect to 1inch/Uniswap to perform multiple swaps based on AI strategy.
- [ ] **/api/wallet/recovery/initiate**: Implement guardian email notifications and signature collection.

### 4. Advanced Security
- [ ] Implement **Multi-Signature** support for Social Recovery.
- [ ] Add **Hardware Wallet (Ledger/Trezor)** integration for the Human Card section.
- [ ] Implement **zkSNARK** proofs for the Privacy Mixer (using `snarkjs`).

### 5. Data Feeds
- [ ] Replace any polling with **WebSockets** for Whale Alerts and real-time prices.
- [ ] Ensure `Alchemy` and `CoinGecko` API keys are robust and handled via environment variables.

## Proposed Strategy
1. **Update Prisma Schema**: Sync database to support feature states.
2. **Implement Core Backends**: Priority on Time-Lock and Dead Man's Switch as they are high-value.
3. **Refine UI Feedback**: Ensure every transaction shows a real Etherscan link and status update.
