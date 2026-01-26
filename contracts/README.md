# Smart Contracts - Production Deployment Guide

## Overview

Production-ready Solidity contracts for the Human-Fi engine:

1. **ZapContract.sol** - Atomic WLD-to-Bet conversion
2. **MarketGovernance.sol** - Merkle-based royalty distribution

## Contract Addresses

### Optimism Mainnet
- ZapContract: `TBD`
- MarketGovernance: `TBD`

### Optimism Goerli (Testnet)
- ZapContract: `TBD`
- MarketGovernance: `TBD`

## Security Features

### ZapContract
- ✅ OpenZeppelin `Ownable` and `ReentrancyGuard`
- ✅ SafeERC20 for all token transfers
- ✅ Atomic execution with full revert on failure
- ✅ Slippage protection (2% max)
- ✅ Deadline enforcement (5 min max)
- ✅ Dust recovery mechanism
- ✅ Emergency pause functionality
- ✅ Permit2 integration for gasless approvals

### MarketGovernance
- ✅ OpenZeppelin `MerkleProof` verification
- ✅ Bitmap-based claim tracking
- ✅ 90-day claim expiration
- ✅ Batch claim support
- ✅ Emergency withdrawal function
- ✅ Expired funds recovery

## Deployment

### Prerequisites

```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
npm install @openzeppelin/contracts
```

### Deploy to Testnet

```bash
npx hardhat run scripts/deploy.ts --network optimism-goerli
```

### Deploy to Mainnet

```bash
npx hardhat run scripts/deploy.ts --network optimism
```

### Verify Contracts

```bash
# ZapContract
npx hardhat verify --network optimism <ZAP_ADDRESS> \
  "<WLD_TOKEN>" \
  "<USDC_TOKEN>" \
  "<CTF_EXCHANGE>" \
  "<SWAP_ROUTER>" \
  "<PERMIT2>" \
  "<TREASURY>"

# MarketGovernance
npx hardhat verify --network optimism <GOVERNANCE_ADDRESS> \
  "<USDC_TOKEN>"
```

## Gas Estimates (Optimism L2)

| Operation | Estimated Gas | Estimated Cost (@ 0.001 Gwei) |
|-----------|--------------|-------------------------------|
| Zap WLD to Shares | ~300,000 | ~$0.30 |
| Claim Royalties | ~80,000 | ~$0.08 |
| Batch Claim (5 periods) | ~200,000 | ~$0.20 |
| Publish Merkle Root | ~100,000 | ~$0.10 |

## Integration

### Frontend Integration

```typescript
import { ZapContract__factory, MarketGovernance__factory } from './typechain';

// Initialize contracts
const zapContract = ZapContract__factory.connect(ZAP_ADDRESS, signer);
const governance = MarketGovernance__factory.connect(GOVERNANCE_ADDRESS, signer);

// Execute zap
const tx = await zapContract.zapWLDToBinaryOutcome(
  amountWLD,
  minUSDC,
  conditionId,
  outcomeIndex,
  minSharesOut,
  deadline
);

// Claim royalties
const claimTx = await governance.claimRoyalties(
  period,
  amount,
  merkleProof
);
```

### Backend Integration

```typescript
// Publish weekly Merkle root
const tx = await governance.publishMerkleRoot(
  merkleRoot,
  totalAmount
);
```

## Testing

### Unit Tests

```bash
npx hardhat test
```

### Coverage

```bash
npx hardhat coverage
```

### Gas Report

```bash
REPORT_GAS=true npx hardhat test
```

## Security Considerations

### Auditing Checklist

- [ ] External security audit (Certik/OpenZeppelin)
- [ ] Formal verification of critical functions
- [ ] Fuzz testing with Echidna/Foundry
- [ ] Economic attack simulations
- [ ] MEV resistance testing
- [ ] Upgrade path documentation

### Known Limitations

1. **Binary Markets Only**: ZapContract currently supports only binary (Yes/No) markets
2. **Single DEX**: Only Uniswap V3 supported for swaps
3. **USDC Only**: Royalties paid in USDC only
4. **No Upgradability**: Contracts are immutable (by design)

## Monitoring

### Events to Monitor

**ZapContract**:
- `ZapExecuted` - Track successful zaps
- `PauseToggled` - Alert on pause state changes
- `ProtocolFeeUpdated` - Track fee changes

**MarketGovernance**:
- `MerkleRootPublished` - Verify weekly distributions
- `RoyaltiesClaimed` - Track claim activity
- `ExpiredFundsRecovered` - Monitor unclaimed funds

### Alerts

Set up alerts for:
- Failed zap transactions (>5% failure rate)
- Large zaps (>$10,000)
- Unusual claim patterns
- Contract pause events
- Low contract balances

## Maintenance

### Weekly Tasks

1. Generate Merkle tree (automated via cron)
2. Publish Merkle root to MarketGovernance
3. Monitor claim activity
4. Check for expired periods

### Monthly Tasks

1. Review gas optimization opportunities
2. Analyze zap success rates
3. Audit treasury balances
4. Update documentation

## Emergency Procedures

### Pause ZapContract

```typescript
await zapContract.togglePause();
```

### Recover Stuck Funds

```typescript
await zapContract.recoverDust(tokenAddress, amount, recipient);
```

### Recover Expired Royalties

```typescript
await governance.recoverExpiredFunds(period, recipient);
```

## Support

- **Documentation**: https://docs.polymarketwallet.com
- **Discord**: https://discord.gg/polymarketwallet
- **Security**: security@polymarketwallet.com
