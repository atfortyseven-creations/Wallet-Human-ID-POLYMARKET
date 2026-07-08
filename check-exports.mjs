// Use the correct sub-path imports for aztec.js v4.3.1
import('@aztec/aztec.js/node').then(async nodeModule => {
  console.log('node exports:', Object.keys(nodeModule).join(', '));
  
  const accountsModule = await import('@aztec/accounts/schnorr');
  console.log('schnorr exports:', Object.keys(accountsModule).join(', '));
  
  const fieldsModule = await import('@aztec/aztec.js/fields');
  console.log('fields exports:', Object.keys(fieldsModule).slice(0,10).join(', '));

}).catch(e => console.error('ERROR:', e.message.slice(0, 500)));
