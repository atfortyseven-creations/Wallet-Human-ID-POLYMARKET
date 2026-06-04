// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log(' Initiating Genesis Operation...')

    // 1. Crear el Arquitecto (TU USUARIO)
    // IMPORTANTE: Cambia 'admin_wallet_01' por tu wallet real si quieres ver esto logueado
    const admin = await prisma.user.upsert({
        where: { walletAddress: '0x1234567890abcdef1234567890abcdef12345678' },
        update: {},
        create: {
            walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
            email: 'admin@whalealert.network',
            tier: 'Enterprise', // Maximum tier
        },
    })
    console.log(' Usuario Soberano creado.')

    // Treasury, Market, and Proposals sections removed due to schema changes.

    // 5. Crear una Noticia de Inteligencia (Intel)
    await prisma.intelItem.create({
        data: {
            source: 'Bloomberg AI',
            title: 'Regulatory Approval for Whale Alert Network likely in Q2',
            category: 'Regulation',
            url: 'https://bloomberg.com/crypto/whale-alert',
            publishedAt: new Date(),
            aiSummary: 'Fuentes internas confirman que la SEC ve con buenos ojos el modelo de identidad.',
        }
    })
    // 6. Inicializar Categorías del Foro Soberano
    const categoryCount = await (prisma as any).forumCategory.count();
    if (categoryCount === 0) {
        await (prisma as any).forumCategory.createMany({
            data: [
                { name: 'Announcements',    slug: 'announcements', description: 'Official network updates and protocol changes.',                         color: '#2D0A59', orderIndex: 1 },
                { name: 'Governance',       slug: 'governance',    description: 'Proposals, voting discussions, and treasury allocations.',              color: '#D4AF37', orderIndex: 2 },
                { name: 'Research & Alpha', slug: 'research',      description: 'High-level macro analysis, on-chain data, and institutional insights.',  color: '#0066FF', orderIndex: 3 },
                { name: 'Technical Support',slug: 'support',       description: 'Smart contract debugging, SDK assistance, and bug reports.',             color: '#E11D48', orderIndex: 4 },
            ]
        });
        console.log('️  Forum categories initialized.')
    } else {
        console.log(`️  Forum categories already exist (${categoryCount})  skipping.`)
    }

    // 7. Seed Humanity Ledger Blocks and Transactions
    const ledgerBlockCount = await prisma.humanityLedgerBlock.count();
    if (ledgerBlockCount === 0) {
        console.log(' Seeding Humanity Ledger genesis blocks...');
        const blockId1 = 20392811n;
        const blockId2 = 20392810n;
        const blockId3 = 20392809n;

        // Create Block 3 (oldest)
        await prisma.humanityLedgerBlock.create({
            data: {
                id: blockId3,
                hash: '0x7b2fa1bc8b9dbf8a7d3c0de82a0b12fe3e4da1b9875f28c29375e82104fa28cd',
                parentHash: '0x12fe3e4da1b9875f28c29375e82104fa28cda8f2b7cd831f298e3b4a2e5d93bc8bd',
                timestamp: BigInt(Math.floor(Date.now() / 1000) - 75),
                miner: '0x00000000000000000000000000000000000001bc',
                gasUsed: 15403810n,
                gasLimit: 30000000n,
                baseFee: 38000000000n,
                txCount: 1,
                transactions: {
                    create: [
                        {
                            hash: '0x2c7fe8ab91dc2e1b4c3029da1b29d8cd7e89dbf672c81fbda89e9f1a23cd7f1a',
                            from: '0x2f2C2a821207cE58B68BBD9D7150be7CEB20FE14',
                            to: '0x0000000000000000000000000000000000000000',
                            value: '0',
                            gasPrice: '40000000000',
                            gas: 65000n,
                            transactionIndex: 0,
                            timestamp: BigInt(Math.floor(Date.now() / 1000) - 75)
                        }
                    ]
                }
            }
        });

        // Create Block 2
        await prisma.humanityLedgerBlock.create({
            data: {
                id: blockId2,
                hash: '0xa8f2b7cd831f298e3b4a2e5d93bc8bde920af847cb201df82ea29b87cf01f2ac',
                parentHash: '0x7b2fa1bc8b9dbf8a7d3c0de82a0b12fe3e4da1b9875f28c29375e82104fa28cd',
                timestamp: BigInt(Math.floor(Date.now() / 1000) - 45),
                miner: '0x000000000000000000000000000000000000032a',
                gasUsed: 8402910n,
                gasLimit: 30000000n,
                baseFee: 34000000000n,
                txCount: 1,
                transactions: {
                    create: [
                        {
                            hash: '0x9a8fde8ab90dc2e1b4c3029da1b29d8cd7e89dbf672c81fbda89e9f1a23cd7bb2',
                            from: '0xCde27Caa219F784FD3AF08703327707d7Cf82CF3',
                            to: '0x2f2C2a821207cE58B68BBD9D7150be7CEB20FE14',
                            value: '100000000000000000000',
                            gasPrice: '36000000000',
                            gas: 21000n,
                            transactionIndex: 0,
                            timestamp: BigInt(Math.floor(Date.now() / 1000) - 45)
                        }
                    ]
                }
            }
        });

        // Create Block 1 (newest)
        await prisma.humanityLedgerBlock.create({
            data: {
                id: blockId1,
                hash: '0x3e4da1b9875f28c29375e82104fa28cd7b29381c8b9dbf8a7d3c0de82a0b12fe',
                parentHash: '0xa8f2b7cd831f298e3b4a2e5d93bc8bde920af847cb201df82ea29b87cf01f2ac',
                timestamp: BigInt(Math.floor(Date.now() / 1000) - 15),
                miner: '0x000000000000000000000000000000000000032a',
                gasUsed: 12480392n,
                gasLimit: 30000000n,
                baseFee: 35000000000n,
                txCount: 2,
                transactions: {
                    create: [
                        {
                            hash: '0x42fde8ab90dc2e1b4c3029da1b29d8cd7e89dbf672c81fbda89e9f1a23cd5bc6',
                            from: '0x2f2C2a821207cE58B68BBD9D7150be7CEB20FE14',
                            to: '0xCde27Caa219F784FD3AF08703327707d7Cf82CF3',
                            value: '500000000000000000000',
                            gasPrice: '38000000000',
                            gas: 21000n,
                            transactionIndex: 0,
                            timestamp: BigInt(Math.floor(Date.now() / 1000) - 15)
                        },
                        {
                            hash: '0x5c7fe8ab91dc2e1b4c3029da1b29d8cd7e89dbf672c81fbda89e9f1a23cd7de9',
                            from: '0x0000000000000000000000000000000000000000',
                            to: '0x2f2C2a821207cE58B68BBD9D7150be7CEB20FE14',
                            value: '500000000000000000000',
                            gasPrice: '35000000000',
                            gas: 45000n,
                            transactionIndex: 1,
                            timestamp: BigInt(Math.floor(Date.now() / 1000) - 15)
                        }
                    ]
                }
            }
        });
        console.log(' Humanity Ledger blocks seeded successfully.');
    } else {
        console.log(` Humanity Ledger blocks already exist (${ledgerBlockCount})  skipping.`);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
