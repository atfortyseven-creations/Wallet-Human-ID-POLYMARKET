import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Check Database Migration Status
 * 
 * This script verifies if the tables from migration 20260131120000_phase2_3_4_init
 * exist in the database to determine the correct resolution strategy.
 */

async function checkMigrationStatus() {
  console.log('🔍 Checking database migration status...\n');

  try {
    // Check if the required enums exist
    const enumsQuery = `
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      AND typname IN ('WalletTransactionType', 'WalletTransactionStatus', 'WalletType');
    `;
    
    const enums = await prisma.$queryRawUnsafe<{ typname: string }[]>(enumsQuery);
    console.log('📊 Enums found:', enums.map(e => e.typname));

    // Check if the required tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('Transaction', 'AddressBookEntry', 'Authenticator', 'WalletAccount');
    `;
    
    const tables = await prisma.$queryRawUnsafe<{ table_name: string }[]>(tablesQuery);
    console.log('📋 Tables found:', tables.map(t => t.table_name));

    // Check if AuthUser has the new columns
    const columnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'AuthUser'
      AND column_name IN ('walletAddress', 'encryptedMnemonic', 'encryptedPrivateKey', 'walletSalt');
    `;
    
    const columns = await prisma.$queryRawUnsafe<{ column_name: string }[]>(columnsQuery);
    console.log('🔑 AuthUser columns found:', columns.map(c => c.column_name));

    // Check migration status
    const migrationQuery = `
      SELECT migration_name, finished_at, rolled_back_at
      FROM _prisma_migrations
      WHERE migration_name = '20260131120000_phase2_3_4_init';
    `;
    
    const migrations = await prisma.$queryRawUnsafe<any[]>(migrationQuery);
    console.log('\n📝 Migration status:', migrations);

    // Determine recommendation
    console.log('\n🎯 RECOMMENDATION:');
    
    const expectedEnums = ['WalletTransactionType', 'WalletTransactionStatus', 'WalletType'];
    const expectedTables = ['Transaction', 'AddressBookEntry', 'Authenticator', 'WalletAccount'];
    const expectedColumns = ['walletAddress', 'encryptedMnemonic', 'encryptedPrivateKey', 'walletSalt'];

    const enumsExist = expectedEnums.every(e => enums.some(en => en.typname === e));
    const tablesExist = expectedTables.every(t => tables.some(tb => tb.table_name === t));
    const columnsExist = expectedColumns.every(c => columns.some(col => col.column_name === c));

    if (enumsExist && tablesExist && columnsExist) {
      console.log('✅ All migration artifacts exist in the database.');
      console.log('💡 Run: npx prisma migrate resolve --applied 20260131120000_phase2_3_4_init');
      console.log('   This will mark the migration as applied without re-running it.');
    } else {
      console.log('❌ Migration artifacts are incomplete or missing.');
      console.log('💡 Run: npx prisma migrate deploy');
      console.log('   This will apply all pending migrations.');
      
      if (!enumsExist) console.log('   ⚠️  Missing enums:', expectedEnums.filter(e => !enums.some(en => en.typname === e)));
      if (!tablesExist) console.log('   ⚠️  Missing tables:', expectedTables.filter(t => !tables.some(tb => tb.table_name === t)));
      if (!columnsExist) console.log('   ⚠️  Missing columns:', expectedColumns.filter(c => !columns.some(col => col.column_name === c)));
    }

  } catch (error) {
    console.error('❌ Error checking migration status:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrationStatus();
