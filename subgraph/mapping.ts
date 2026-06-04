import { ZapExecuted } from "../generated/ZapContract/ZapContract"
import {
    MerkleRootPublished,
    RoyaltiesClaimed,
    RoyaltiesBatchClaimed
} from "../generated/MarketGovernance/MarketGovernance"
import {
    ZapInteraction,
    MerkleDistribution,
    RoyaltyClaim
} from "../generated/schema"

export function handleZapExecuted(event: ZapExecuted): void {
    let entity = new ZapInteraction(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )
    entity.user = event.params.user
    entity.wldAmount = event.params.wldAmount
    entity.usdcReceived = event.params.usdcReceived
    entity.conditionId = event.params.conditionId
    entity.outcomeIndex = event.params.outcomeIndex
    entity.sharesReceived = event.params.sharesReceived
    entity.protocolFee = event.params.protocolFee

    entity.blockNumber = event.block.number
    entity.blockTimestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash

    entity.save()
}

export function handleMerkleRootPublished(event: MerkleRootPublished): void {
    let entity = new MerkleDistribution(event.params.merkleRoot)

    entity.period = event.params.period
    entity.totalAmount = event.params.totalAmount
    entity.expiresAt = event.params.expiresAt
    entity.publishedAt = event.block.timestamp
    entity.creator = event.transaction.from

    entity.save()
}

export function handleRoyaltiesClaimed(event: RoyaltiesClaimed): void {
    let entity = new RoyaltyClaim(
        event.transaction.hash.concatI32(event.logIndex.toI32())
    )

    entity.distributor = event.address
    entity.claimer = event.params.claimer
    entity.period = event.params.period
    entity.amount = event.params.amount

    entity.timestamp = event.block.timestamp
    entity.transactionHash = event.transaction.hash

    entity.save()
}

export function handleRoyaltiesBatchClaimed(event: RoyaltiesBatchClaimed): void {
    // Batch events summarize multiple claims, but individual claim events 
    // are likely emitted by the contract loop if implemented that way.
    // If not, we would need to inspect call input data which is harder in AssemblyScript.
    // Assuming the contract emits individual events inside the loop as per best practice,
    // or only one summary event. 
    // In our Solidity implementation:
    // - claimRoyalties emits RoyaltiesClaimed
    // - batchClaimRoyalties emits RoyaltiesClaimed inside the loop AND RoyaltiesBatchClaimed at end
    // So we don't strictly need to index BatchClaimed for data integrity, 
    // but we can index it for analytics if we add a BatchClaim entity.
}
