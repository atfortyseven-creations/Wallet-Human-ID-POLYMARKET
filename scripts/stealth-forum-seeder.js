const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Natural names & handles
const firstNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Charlie', 'Drew', 'Avery', 'Devin', 'Skyler', 'Cameron', 'Peyton', 'Quinn', 'Reese', 'Rowan', 'Hayden', 'Spencer', 'Elliott', 'Finley', 'Harley', 'Emerson', 'Kendall', 'Ryan', 'Dylan', 'Parker', 'Logan', 'Blake', 'Dakota', 'Micah', 'Jesse', 'River', 'Sage', 'Frank', 'John', 'Alice', 'Bob', 'Eve', 'Mike', 'Sarah', 'David', 'Emma', 'Tom', 'Lucy', 'Chris', 'Anna', 'Dan', 'Nina', 'Zack', 'Maya', 'Leo', 'Zoe', 'Max', 'Mia', 'Ian', 'Lily', 'Eli', 'Ava'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez'];
const handles = ['0x', 'eth', 'zk', 'crypto', 'dev', 'defi', 'node', 'sec', 'audit', 'code', 'builder', 'whale', 'l2', 'noir'];

// Humanized vocabulary, no asterisks, natural phrasing.
const titles = [
    "Aztec testnet performance vs Polygon zkEVM?",
    "Noir compilation times are getting better",
    "How to handle private state in Aztec contracts",
    "Sequencer decentralization timeline for mainnet",
    "Anyone migrating from Cairo to Noir?",
    "Best practices for bridging L1 to Aztec L2",
    "Dealing with high gas costs on proof verification",
    "Aztec grant program requirements - any tips?",
    "Is Humanity Ledger using recursive proofs?",
    "Data availability layer for Aztec - Celestia vs EigenDA",
    "RPC providers supporting Aztec testnet reliably",
    "When is the next Aztec network upgrade?",
    "Differences between Aztec Connect and the new network",
    "Writing a DEX in Noir - sharing my experience",
    "Security audits for Noir circuits",
    "How does the Aztec unconstrained execution work?",
    "State transitions in the Aztec rollup",
    "Whale Network integration with Aztec privacy",
    "Can we expect an Aztec token for decentralization?",
    "Optimizing circuit size in Noir"
];

const postContents = [
    "I've been testing the new Aztec testnet and the proof generation times are surprisingly fast. Has anyone benchmarked it against Polygon zkEVM for similar workloads?",
    "Noir is genuinely a joy to write compared to other ZK languages. The syntax feels natural and Rust-like. Compiling large circuits still takes a bit of memory though.",
    "I'm struggling to understand how to manage shared private state in Aztec. If two users need to update the same private variable, how do we prevent race conditions?",
    "The roadmap says sequencer decentralization is a priority before mainnet. I hope they use a robust consensus mechanism. Any thoughts on what they might choose?",
    "We are migrating our dapp from Starknet to Aztec. Cairo is powerful but Noir feels more accessible for our web3 devs. The tooling is catching up fast.",
    "Bridging assets from Ethereum mainnet to Aztec seems straightforward in theory, but I'm worried about the withdrawal times during the rollup challenge period.",
    "Verifying proofs on L1 is still quite expensive. I see Aztec is working on recursive proofs to batch them. Does anyone know when this will be live on testnet?",
    "We are applying for an Aztec grant to build a private lending protocol. Does the committee prefer infrastructure tools or consumer dapps right now?",
    "I saw Humanity Ledger is building on Aztec. Their approach to private identity is interesting. Are they using Aztec's native account abstraction?",
    "For data availability, relies on Ethereum right now, but long term it might be too costly. Will they integrate Celestia or EigenDA?",
    "Most public RPCs for the testnet are rate-limited heavily. Anyone running their own full node? How heavy is it on storage?",
    "The next upgrade is supposed to bring significant improvements to the Noir standard library. I'm really looking forward to the new crypto primitives.",
    "Aztec Connect was great for privacy on DeFi, but this new fully programmable L2 is a game changer. We can finally build native private apps.",
    "Writing an AMM in Noir was challenging but rewarding. The main issue was handling fractional math without floating point numbers in circuits.",
    "Who are the best auditors for Noir circuits right now? Most firms only know Solidity or Cairo. We need specialized ZK auditors.",
    "Unconstrained functions in Aztec are great for fetching data without paying for proof generation, but you have to be careful not to trust the data blindly in constrained functions.",
    "The way Aztec handles public and private state transitions simultaneously is elegant. The state tree structure makes a lot of sense.",
    "Whale Network's use of ZK proofs for their Humanity Ledger is a perfect use case for Aztec. Privacy-preserving KYC is the future.",
    "A token seems inevitable if they want a decentralized sequencer network. I just hope the tokenomics are fair and not overly VC-heavy.",
    "You really have to think about gate count when writing Noir. Small changes in logic can drastically increase the circuit size and proof time."
];

const replyContents = [
    "I agree entirely. We saw a 30% reduction in compilation time after the last update.",
    "That's a very valid concern. We ran into the same issue last week and had to redesign our state model.",
    "Have you checked the official Aztec documentation? They updated the section on this recently.",
    "I believe they are leaning towards a BFT consensus for the sequencers, but it's not confirmed.",
    "We made the same move from Cairo. Best decision we made. The community is super helpful.",
    "Withdrawal times are a bottleneck for sure, but fast bridges like Across will probably integrate soon.",
    "Recursive proofs are the only way to scale this. I heard they are testing it internally.",
    "They usually fund infrastructure first, but a strong consumer dapp with a working prototype has a good chance.",
    "Yes, they are using native AA. It makes the UX seamless.",
    "EigenDA seems more aligned with the Ethereum ecosystem, so my bet is on that.",
    "Running a node is fairly lightweight right now, about 50GB storage. I recommend setting up your own.",
    "The new crypto primitives will save us so many gates.",
    "Exactly. Programmable privacy is the holy grail.",
    "Did you open source the AMM code? I'd love to take a look.",
    "Try reaching out to Zellic or Trail of Bits, they have ZK teams.",
    "Good point on unconstrained functions. It's an easy vector for bugs if you aren't careful.",
    "The UTXO model for private state combined with account model for public is genius.",
    "Agreed. Zero knowledge KYC is going to be massive for sovereign adoption.",
    "A token is needed for sybil resistance on the sequencer layer.",
    "Optimization is key. Avoid loops if you can, unroll them manually."
];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[randomInt(0, arr.length - 1)];

function generateAddress() {
    return '0x' + crypto.randomBytes(20).toString('hex');
}

function generateName() {
    return `${randomItem(firstNames)} ${randomItem(lastNames)}`;
}

function generateBio() {
    const roles = ['ZK Researcher', 'Smart Contract Dev', 'Noir Engineer', 'DeFi Analyst', 'EVM Specialist'];
    const places = ['Aztec Ecosystem', 'Independent', 'Web3 Startup', 'Capital DAO'];
    return `${randomItem(roles)} @ ${randomItem(places)}. Building the private web.`;
}

// Gaussian distribution for timestamps (favoring recent)
function generateTimestamp(monthsAgo) {
    const now = new Date().getTime();
    const past = now - (monthsAgo * 30 * 24 * 60 * 60 * 1000);
    // Box-Muller transform for normal distribution
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return generateTimestamp(monthsAgo); // resample between 0 and 1
    
    // num is heavily weighted towards 0.5. Let's skew it towards 1 (recent)
    num = Math.pow(num, 0.5); // shift mean towards 1
    
    const time = past + (now - past) * num;
    return new Date(time);
}

async function seed() {
    console.log("Starting Stealth ZK-Seeder Engine...");
    
    // Ensure we have categories (fetch the first one)
    let category = await prisma.forumCategory.findFirst({
        where: { slug: 'zero-knowledge' }
    });

    if (!category) {
        console.log("Category missing. Creating 'Zero-Knowledge Architecture' category.");
        category = await prisma.forumCategory.create({
            data: {
                slug: 'zero-knowledge',
                name: 'Zero-Knowledge Architecture',
                description: 'ZK-Rollups, privacy-preserving state transitions, and SNARKs.',
                color: '#DB2777',
                orderIndex: 1
            }
        });
    }

    const USERS_TO_CREATE = 1200; // Scaled down to prevent memory issues in node execution, run multiple times if needed.
    const TOPICS_TO_CREATE = 1800; 

    console.log(`Generating ${USERS_TO_CREATE} personas...`);
    const users = [];
    for (let i = 0; i < USERS_TO_CREATE; i++) {
        const createdAt = generateTimestamp(6);
        users.push({
            walletAddress: generateAddress(),
            displayName: generateName(),
            bio: generateBio(),
            isPro: Math.random() > 0.8,
            tier: Math.random() > 0.9 ? 'PRO' : 'FREE',
            createdAt: createdAt,
            updatedAt: createdAt,
            lastActive: generateTimestamp(1)
        });
    }

    // Insert users in chunks
    const chunkSize = 200;
    for (let i = 0; i < users.length; i += chunkSize) {
        const chunk = users.slice(i, i + chunkSize);
        await prisma.user.createMany({ data: chunk, skipDuplicates: true });
        console.log(`Inserted users ${i} to ${i + chunk.length}`);
    }

    const dbUsers = await prisma.user.findMany({ select: { id: true } });
    if (dbUsers.length === 0) {
        console.error("Failed to load users from DB.");
        return;
    }

    console.log(`Generating ${TOPICS_TO_CREATE} topics...`);
    const topics = [];
    for (let i = 0; i < TOPICS_TO_CREATE; i++) {
        const createdAt = generateTimestamp(4);
        topics.push({
            title: randomItem(titles) + (Math.random() > 0.5 ? "?" : ""),
            content: randomItem(postContents),
            categoryId: category.id,
            authorId: randomItem(dbUsers).id,
            views: randomInt(10, 500),
            createdAt: createdAt,
            updatedAt: createdAt
        });
    }

    for (let i = 0; i < topics.length; i += chunkSize) {
        const chunk = topics.slice(i, i + chunkSize);
        await prisma.forumTopic.createMany({ data: chunk });
        console.log(`Inserted topics ${i} to ${i + chunk.length}`);
    }

    const dbTopics = await prisma.forumTopic.findMany({ select: { id: true, createdAt: true } });

    console.log(`Generating replies...`);
    const posts = [];
    for (const topic of dbTopics) {
        const replyCount = randomInt(1, 4);
        let lastTime = topic.createdAt.getTime();
        for (let j = 0; j < replyCount; j++) {
            // Reply is strictly AFTER the topic creation, within a few days
            const replyTime = new Date(lastTime + randomInt(1000 * 60 * 5, 1000 * 60 * 60 * 24 * 3));
            lastTime = replyTime.getTime();
            
            posts.push({
                content: randomItem(replyContents),
                topicId: topic.id,
                authorId: randomItem(dbUsers).id,
                createdAt: replyTime,
                updatedAt: replyTime
            });
        }
    }

    const postChunkSize = 500;
    for (let i = 0; i < posts.length; i += postChunkSize) {
        const chunk = posts.slice(i, i + postChunkSize);
        await prisma.forumPost.createMany({ data: chunk });
        console.log(`Inserted posts ${i} to ${i + chunk.length}`);
    }

    console.log("Stealth seeding complete.");
}

seed().catch(e => console.error(e)).finally(() => prisma.$disconnect());
