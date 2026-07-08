import { AztecNodeApiSchema, createAztecNodeClient } from '@aztec/stdlib/interfaces/client';
console.log('AztecNodeApiSchema type:', typeof AztecNodeApiSchema);
console.log('Keys:', Object.keys(AztecNodeApiSchema).slice(0, 10));
console.log('createAztecNodeClient type:', typeof createAztecNodeClient);
