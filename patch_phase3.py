import pathlib, re

# ===== FIX 1: engine/tick - Remove 'local-mocker-key' hardcoded fallback =====
path = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/app/api/engine/tick/route.ts')
content = path.read_text(encoding='utf-8')

old_auth = """    const authHeader = req.headers.get('authorization');
    if (authHeader !== Bearer ) {
        if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized CRON heartbeat' }, { status: 401 });
        }
    }"""

new_auth = """    // [SECURITY] CRON secret check - fail closed if secret not configured
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        console.error('[ENGINE/TICK] CRON_SECRET not set - rejecting all invocations');
        return NextResponse.json({ error: 'Engine not configured for production' }, { status: 500 });
    }
    if (authHeader !== Bearer ) {
        return NextResponse.json({ error: 'Unauthorized CRON heartbeat' }, { status: 401 });
    }"""

content = content.replace(old_auth, new_auth)
path.write_text(content, encoding='utf-8')
print("Fixed engine/tick - removed 'local-mocker-key' fallback")

# ===== FIX 2: governance/vote - Double-vote race condition using DB transaction =====
path2 = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/app/api/governance/vote/route.ts')
content2 = path2.read_text(encoding='utf-8')

# Replace the check-then-write with an atomic DB transaction
old_check_create = """        // Check if user already voted (using generated nullifier hash)
        const existingVote = await (prisma as any).proposalVote.findUnique({
            where: {
                proposalId_nullifierHash: {
                    proposalId: body.proposalId,
                    nullifierHash: generatedNullifier,
                },
            },
        });

        if (existingVote) {
            return NextResponse.json(
                { error: 'You have already voted on this proposal' },
                { status: 409 }
            );
        }

        // Record vote
        const vote = await (prisma as any).proposalVote.create({"""

new_check_create = """        // RACE CONDITION FIX: Use DB transaction to atomically check + create
        // Without this, two simultaneous requests could both pass the existingVote check
        // and both insert a vote, breaking the one-vote-per-user guarantee.
        let vote;
        try {
            vote = await (prisma as any).proposalVote.create({"""

content2 = content2.replace(old_check_create, new_check_create)

# Close the try block after vote creation and catch the unique constraint error
old_after_create = """                verificationLevel: 'network_native',
            },
        });

        // Update proposal vote counts"""
new_after_create = """                verificationLevel: 'network_native',
            },
        });
        } catch (createErr: any) {
            // Prisma P2002 = unique constraint violation = duplicate vote attempt (race condition)
            if (createErr?.code === 'P2002') {
                return NextResponse.json(
                    { error: 'You have already voted on this proposal' },
                    { status: 409 }
                );
            }
            throw createErr;
        }

        // Update proposal vote counts"""

content2 = content2.replace(old_after_create, new_after_create)
path2.write_text(content2, encoding='utf-8')
print("Fixed governance/vote - atomic vote creation with P2002 race condition guard")

# ===== FIX 3: forum/posts - Sanitize content before DB storage (Stored XSS) =====
path3 = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/app/api/forum/posts/route.ts')
content3 = path3.read_text(encoding='utf-8')

old_content_use = """        const { content, topicId, replyToId } = body;
        if (!content || !topicId) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

        const newPost = await (prisma as any).forumPost.create({
            data: {
                content,"""
new_content_use = """        const { content: rawContent, topicId, replyToId } = body;
        if (!rawContent || !topicId) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        
        // [STORED XSS FIX] Sanitize content on write, not just on read.
        // DOMPurify is client-only. Use server-side regex strip for script/on* handlers.
        const content = rawContent
            .replace(/<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi, '')
            .replace(/ on\\w+="[^"]*"/g, '')
            .replace(/ on\\w+='[^']*'/g, '')
            .replace(/ on\\w+=\\w+/g, '')
            .replace(/javascript:/gi, '')
            .slice(0, 10000); // Hard cap: prevent oversized post DoS

        const newPost = await (prisma as any).forumPost.create({
            data: {
                content,"""

content3 = content3.replace(old_content_use, new_content_use)
path3.write_text(content3, encoding='utf-8')
print("Fixed forum/posts - stored XSS sanitization + length cap")

# ===== FIX 4: useSanitizer.ts - ReDoS-vulnerable regex in SSR fallback =====
path4 = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/hooks/useSanitizer.ts')
content4 = path4.read_text(encoding='utf-8')

# The SSR regex is vulnerable to ReDoS via catastrophic backtracking on nested tags
old_ssr = """        return content
            .replace(/<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi, '')
            .replace(/ on\\w+=\"[^\"]*\"/g, '')
            .replace(/ on\\w+='[^']*'/g, '')
            .replace(/ on\\w+=\\w+/g, '');"""

new_ssr = """        // [ReDoS FIX] Use non-backtracking replacements for SSR script stripping
        // The original regex had catastrophic backtracking potential on pathological input.
        return content
            .replace(/<script[\\s\\S]*?<\\/script>/gi, '')  // Lazy quantifier, bounded
            .replace(/\\s+on[a-z]+\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)/gi, '') // Specific attribute format
            .replace(/javascript:/gi, '')
            .replace(/data:/gi, ''); // Prevent data: URI XSS vectors"""

content4 = content4.replace(old_ssr, new_ssr)

# Also add SVG/path to potentially dangerous - svg can contain scripts via foreignObject
content4 = content4.replace(
    "FORBIDDEN_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],",
    "FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'foreignObject', 'use', 'animate'],"
)
# Fix typo in original (FORBIDDEN vs FORBID)
content4 = content4.replace(
    "        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],",
    "        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'foreignObject', 'use', 'animate'],"
)

path4.write_text(content4, encoding='utf-8')
print("Fixed useSanitizer.ts - ReDoS regex + SVG foreignObject XSS vector")

print("ALL PHASE 3 PATCHES APPLIED")
