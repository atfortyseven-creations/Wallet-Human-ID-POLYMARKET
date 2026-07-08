const fs = require('fs');
const content = fs.readFileSync('components/bsv/InstitutionalPortfolioView.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.match(/scrollIntoView|scrollTo/i)) {
    console.log(i + 1, l.trim());
  }
});
