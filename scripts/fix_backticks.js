const fs = require('fs');
const files = [
  'app/api/aztec/quests/route.ts',
  'components/portfolio/AztecRewardsCard.tsx',
  'components/portfolio/AztecAirdropCalendar.tsx',
  'app/api/aztec/airdrop/calendar/route.ts',
  'app/api/aztec/test-flow/route.ts',
  'app/api/cron/social-audit/route.ts',
  'app/api/social/verify/route.ts',
  'app/test-qd-flow/page.tsx',
  'scripts/run_test_flow.js',
  'test/qd-economy.security.test.ts',
  'test/qd-stress.test.ts'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let code = fs.readFileSync(f, 'utf8');
    if (code.includes('\\`')) {
      fs.writeFileSync(f, code.replace(/\\`/g, '`'));
      console.log('Fixed', f);
    }
  }
});
