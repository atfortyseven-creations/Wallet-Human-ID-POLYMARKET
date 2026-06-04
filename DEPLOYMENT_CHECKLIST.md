#  Final Pre-Deployment Checklist

## ️ Security & Integrity [AUDITING]
- [ ] **Rate Limiting**: Add `upstash/ratelimit` or a custom middleware to `/api/wallet/*` to prevent spam.
- [ ] **Auth Enforcement**: Verify that every wallet API checks if the user *actually* owns the wallet they are interacting with.
- [ ] **Private Key Safety**: Ensure `WALLET_ENCRYPTION_KEY` is mandatory and not fallback to insecure strings in production.

##  Optimization & SEO
- [ ] **Meta Tags**: Ensure `app/layout.tsx` has high-converting OpenGraph and Meta descriptions.
- [ ] **Performance**: Check image sizes and Lottie animation lazy loading.
- [ ] **Smooth Scroll Consistency**: Ensure parallax stickers don't cause layout shifts on Safari/FF.

##  Blockchain & Integration
- [ ] **Error Handling**: Replace generic alerts with beautiful `sonner` toasts in *all* modals.
- [ ] **Native Balance Sync**: Ensure UI updates immediately after a swap or send.
- [ ] **Alchemy Tier**: Verify if API key supports the expected 10M+ user traffic load.

##  Mobile UX
- [ ] **Safe Areas**: Verify interaction with notched phones (iPhone Dynamic Island).
- [ ] **Touch Targets**: Ensure all navigation buttons in the "Stacked Mobile Menu" are at least 44x44px.
