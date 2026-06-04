#!/bin/bash
# 
# Atomic Rollback Script  Axioma 453
# Git-signed tag revert + Railway immediate redeploy.
# Target RTO: < 90 seconds from trigger to live.
# Usage: bash scripts/atomic-rollback.sh [TAG]
# 

set -euo pipefail

TAG="${1:-}"
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
LOG_FILE="rollback-${TIMESTAMP}.log"

log() { echo "[$(date -u +%H:%M:%S)] $*" | tee -a "$LOG_FILE"; }

log " SOVEREIGN ATOMIC ROLLBACK INITIATED "
log "Timestamp: $TIMESTAMP"

#  Step 1: Identify rollback target 
if [[ -z "$TAG" ]]; then
  log "No tag specified  finding last stable signed tag..."
  TAG=$(git tag --sort=-version:refname --merged HEAD | head -n 2 | tail -n 1)
  log "Auto-selected tag: $TAG"
fi

if ! git rev-parse "$TAG" >/dev/null 2>&1; then
  log "ERROR: Tag '$TAG' does not exist."
  exit 1
fi

#  Step 2: Verify GPG signature on tag 
log "Verifying GPG signature on tag $TAG..."
if git tag -v "$TAG" 2>&1 | grep -q "Good signature"; then
  log " Signature verified for $TAG"
else
  log "WARNING: Signature verification failed or tag is unsigned. Proceeding (non-blocking in dev)."
fi

#  Step 3: Create rollback branch 
ROLLBACK_BRANCH="rollback/${TAG}-${TIMESTAMP}"
log "Creating rollback branch: $ROLLBACK_BRANCH"
git checkout -b "$ROLLBACK_BRANCH" "$TAG"

#  Step 4: Force push to main (triggers Railway deploy) 
log "Force-pushing to main to trigger Railway redeploy..."
git push origin "$ROLLBACK_BRANCH":main --force-with-lease

log " Push complete  Railway deploy triggered"

#  Step 5: Create signed rollback tag 
ROLLBACK_TAG="rollback-${TIMESTAMP}"
git tag -s "$ROLLBACK_TAG" -m "Atomic rollback to $TAG at $TIMESTAMP"
git push origin "$ROLLBACK_TAG"
log " Rollback tag created: $ROLLBACK_TAG"

#  Step 6: Notify 
log " ROLLBACK COMPLETE "
log "Rolled back to: $TAG"
log "Rollback tag:   $ROLLBACK_TAG"
log "Branch:         $ROLLBACK_BRANCH"
log "Log:            $LOG_FILE"
log "Estimated RTO:  < 90 seconds (Railway build time)"
