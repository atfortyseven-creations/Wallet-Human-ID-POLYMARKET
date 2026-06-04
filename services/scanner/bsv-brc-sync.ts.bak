import { prisma } from '@/lib/prisma';
import axios from 'axios';
import * as cheerio from 'cheerio';

const BRC_REPO_URL = 'https://api.github.com/repos/bitcoin-sv/BRCs/contents';
const RAW_BASE_URL = 'https://raw.githubusercontent.com/bitcoin-sv/BRCs/master/';

/**
 * Syncs the BRCs repository natively without mocking.
 * Uses Github API to list Markdown files (e.g. brc-0001.md, brc-0010.md).
 * Uses Cheerio/Regex to parse out Frontmatter or Header data like Title, Author, Status.
 */
export async function runBrcSync() {
    console.log('[BRC-SYNC] Commencing absolute sync of bitcoin-sv/BRCs...');
    
    try {
        const { data: contents } = await axios.get(BRC_REPO_URL, {
            headers: process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}
        });

        const mdFiles = (contents as any[]).filter(f => f.name.startsWith('brc-') && f.name.endsWith('.md'));
        
        let syncedCount = 0;
        let errors = 0;

        for (const file of mdFiles) {
            try {
                // Determine BRC number out of name e.g. brc-0001.md -> 1
                const match = file.name.match(/brc-(\d+)\.md/i);
                if (!match) continue;
                const brcNumber = parseInt(match[1]);

                // Fetch raw markdown
                const rawUrl = `${RAW_BASE_URL}${file.name}`;
                const { data: markdown } = await axios.get(rawUrl);

                // Parse Frontmatter loosely
                const lines = markdown.split('\n');
                let title = file.name.replace('.md', '').toUpperCase();
                let author = 'Unknown';
                let status = 'Draft';
                let type = 'Standard';
                let created = null;

                let inFrontmatter = false;
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line === '---') {
                        inFrontmatter = !inFrontmatter;
                        continue;
                    }
                    if (inFrontmatter || i < 20) {
                        const low = line.toLowerCase();
                        if (low.startsWith('title:')) title = line.substring(6).trim();
                        if (low.startsWith('author:')) author = line.substring(7).trim();
                        if (low.startsWith('status:')) status = line.substring(7).trim();
                        if (low.startsWith('type:')) type = line.substring(5).trim();
                        if (low.startsWith('created:')) {
                            const dateStr = line.substring(8).trim();
                            if (dateStr) created = new Date(dateStr);
                        }
                    }
                    if (line.startsWith('# ')) {
                        // Title could also be first H1
                        if (title === file.name.replace('.md', '').toUpperCase()) {
                            title = line.replace('# ', '').trim();
                        }
                    }
                }

                // Upsert to DB
                await prisma.bRCStandard.upsert({
                    where: { brcNumber },
                    update: {
                        title: title.substring(0, 250),
                        author: author.substring(0, 100),
                        status: status.substring(0, 50),
                        type: type.substring(0, 50),
                        created: created && !isNaN(created.valueOf()) ? created : undefined,
                        summary: markdown.substring(0, 500) + '...',
                        githubUrl: file.html_url,
                        lastSyncAt: new Date()
                    },
                    create: {
                        brcNumber,
                        title: title.substring(0, 250),
                        author: author.substring(0, 100),
                        status: status.substring(0, 50),
                        type: type.substring(0, 50),
                        created: created && !isNaN(created.valueOf()) ? created : null,
                        summary: markdown.substring(0, 500) + '...',
                        content: markdown,
                        githubUrl: file.html_url
                    }
                });
                syncedCount++;
            } catch (fsErr: any) {
                console.error(`[BRC-SYNC] Error processing ${file.name}:`, fsErr.message);
                errors++;
            }
        }

        console.log(`[BRC-SYNC] Finished: ${syncedCount} synced, ${errors} errors.`);
        return { success: true, count: syncedCount, errors };

    } catch (e: any) {
        console.error('[BRC-SYNC] Master failure:', e.message);
        return { success: false, error: e.message };
    }
}
