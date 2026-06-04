const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Cleaning up old topics and posts...");
    await prisma.forumPost.deleteMany({});
    await prisma.forumTopic.deleteMany({});
    
    // Find or create a category
    let category = await prisma.forumCategory.findFirst({
        where: { slug: 'announcements' }
    });
    if (!category) {
        category = await prisma.forumCategory.findFirst();
    }
    if (!category) {
        console.log("No categories found, creating default 'Announcements' category...");
        category = await prisma.forumCategory.create({
            data: {
                name: 'Announcements',
                slug: 'announcements',
                description: 'Official system transmissions and updates.',
                color: '#6366f1'
            }
        });
    }
    
    // Create an official admin user representing the system
    let admin = await prisma.user.findUnique({
        where: { walletAddress: '0x0000000000000000000000000000000000000000' }
    });

    if (!admin) {
        admin = await prisma.user.create({
            data: {
                walletAddress: '0x0000000000000000000000000000000000000000',
                displayName: 'System Architecture',
                tier: 'ELITE',
                isPro: true,
            }
        });
    }

    const content = `Welcome to the **System Forum**, powered by the structural integrity of the Aztec Network and forged by the visionary engineering of Atfortyseven.

### A New Era of Cryptographic Discourse
This space has been meticulously architected to provide an environment of absolute clarity, institutional-grade performance, and "Cosmic Perfection." We have purged the noise and the visual latency of legacy web applications to offer you a 12-column, split-view interface where ideas, research, and technical implementations can breathe.

* **To the Atfortyseven Collective**: Your relentless pursuit of architectural perfection has manifested here. The intersection of System Terminal infrastructure and the Discourse paradigm is now complete.
* **To the Aztec Network**: We honor the robust, minimalist foundations you have pioneered. This environment replicates and respects that legacy, ensuring zero-mock performance across all telemetry layers.
* **To Our Users**: Whether you are a Genesis Founder, an Institutional Pro, or a newly Verified Human, this is your sanctuary. 

Engage in governance, share your alpha, and help us build the next generation of privacy-first, institutional cryptography. 

**Welcome to the System Terminal.**`;

    console.log("Creating welcome topic...");
    await prisma.forumTopic.create({
        data: {
            title: "Welcome to the System Forum: Honoring Atfortyseven & Aztec Network",
            content: content,
            categoryId: category ? category.id : undefined,
            authorId: admin.id,
            views: 1337,
            tags: {
                create: [
                    { name: 'announcement' },
                    { name: 'humanityledger' },
                    { name: 'aztec' }
                ]
            }
        }
    });

    console.log("Seeding complete. Aztec architecture is fully initialized.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
