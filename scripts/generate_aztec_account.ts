import { Fr } from '@aztec/aztec.js/fields';
import { deriveSigningKey } from '@aztec/aztec.js/keys';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { createPXEClient } from '@aztec/aztec.js';

async function main() {
  console.log("🛠️ Generando nueva cuenta de Aztec...");
  
  // 1. Generate random secret key (Fr)
  const secretKey = Fr.random();
  
  // 2. Derive signing key
  const signingKey = deriveSigningKey(secretKey);

  console.log("\n=======================================================");
  console.log("🔑 AZTEC_RELAYER_SECRET_KEY (Cópialo en Railway):");
  console.log(secretKey.toString());
  console.log("=======================================================\n");

  try {
    // We create a dummy PXE just to calculate the offline address 
    // (getSchnorrAccount doesn't do a network request until .register() is called)
    const pxe = createPXEClient('http://localhost:8080');
    const account = getSchnorrAccount(pxe, secretKey, signingKey);
    const address = await account.getAddress();
    
    console.log("🏦 Dirección Pública de la Cuenta:");
    console.log(address.toString());
    console.log("\n✅ ¡Cuenta generada exitosamente en entorno local!");
  } catch (e) {
    console.log("⚠️ Error al derivar la dirección pública (necesita PXE), pero tu clave secreta es válida.");
    console.log(e.message);
  }
}

main().catch(console.error);
