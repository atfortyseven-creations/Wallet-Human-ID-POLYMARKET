const n = require('net');
const c = n.connect(5432, '127.0.0.1', () => {
  console.log('PORT_5432=OPEN');
  c.destroy();
});
c.on('error', (e) => {
  console.log('PORT_5432=CLOSED code=' + e.code);
});
