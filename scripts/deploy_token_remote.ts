import { Fr } from '@aztec/aztec.js/fields';
import { deriveSigningKey } from '@aztec/aztec.js/keys';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { createPXEClient } from '@aztec/aztec.js';
import { TokenContract } from '@aztec/noir-contracts.js/Token';

async function main() {
  const pxeUrl = 'https://aztec-production.up.railway.app';
  console.log(`🔌 Conectando al PXE Sandbox remoto en: ${pxeUrl}...`);

  const pxe = createPXEClient(pxeUrl);

  try {
    const nodeInfo = await pxe.getNodeInfo();
    console.log(`✅ ¡Conexión exitosa! Versión de Aztec Node: ${nodeInfo.nodeVersion}`);
  } catch (err) {
    console.error(`❌ Error al conectar con el PXE. ¿Está el sandbox corriendo y el puerto 8080 expuesto?`);
    console.error(err.message);
    process.exit(1);
  }

  // Clave secreta que le dimos al usuario
  const secretKeyHex = '0x002be8c287a3a36a7f3277f9cbba0b1a98feb9c08249cc5cedab7b5cf4052216';
  const secretKey = Fr.fromString(secretKeyHex);
  const signingKey = deriveSigningKey(secretKey);

  console.log('⏳ Registrando cuenta pagadora en el Sandbox...');
  const account = getSchnorrAccount(pxe, secretKey, signingKey);
  const wallet = await account.waitDeploy();
  
  const adminAddress = await account.getAddress();
  console.log(`👤 Cuenta registrada: ${adminAddress.toString()}`);

  console.log('🚀 Desplegando el Smart Contract (Token QDs)... esto puede tardar un poco...');
  
  // Deploy TokenContract
  // The token contract constructor usually takes (admin: AztecAddress, name: string, symbol: string, decimals: bigint)
  // For standard @aztec/noir-contracts.js TokenContract, constructor is (admin: AztecAddress, name: string, symbol: string, decimals: bigint)
  try {
    const contract = await TokenContract.deploy(wallet, adminAddress, 'Quantum Dollars', 'QDs', 18n).send().deployed();
    console.log(`\n======================================================`);
    console.log(`🎉 ¡CONTRATO QDS DESPLEGADO EXITOSAMENTE! 🎉`);
    console.log(`AZTEC_TOKEN_CONTRACT_ADDRESS: ${contract.address.toString()}`);
    console.log(`======================================================\n`);
  } catch (e) {
    console.error(`❌ Fallo en el despliegue del contrato:`, e);
  }
}

main().catch(console.error);
