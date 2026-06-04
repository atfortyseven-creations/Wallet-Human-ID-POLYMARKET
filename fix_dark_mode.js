const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'components', 'landing', 'RealWorldMap.tsx');
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/rgba\(255,255,255,0\.(3|35|4|45|5|55|6)\)/g, (m, p1) => {
  const map = { '3': '0.7', '35': '0.75', '4': '0.8', '45': '0.85', '5': '0.9', '55': '0.9', '6': '0.95' };
  return `rgba(255,255,255,${map[p1]})`;
});
fs.writeFileSync(file, content);
console.log('Done mapping RealWorldMap!');
