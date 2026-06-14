import { SignJWT, jwtVerify, JWTPayload, importJWK } from 'jose';

const alg = 'EdDSA';
const _rawJwtSecret = process.env.JWT_SECRET;
if (!_rawJwtSecret && process.env.NODE_ENV === 'production' && process.env.SKIP_ENV_VALIDATION !== 'true') {
    throw new Error('[SECURITY FATAL] JWT_SECRET not set. Cannot mint or verify JWT safely.');
}
// Quantum Aegis: No hardcoded fallbacks allowed. If secret is missing in dev, it forces developers to set it, or throws.
const secretHS256 = _rawJwtSecret || ''; 
if (secretHS256 === '') throw new Error('JWT_SECRET must be provided in environment variables.');

const migrationCutoff = process.env.JWT_MIGRATION_CUTOFF 
  ? new Date(process.env.JWT_MIGRATION_CUTOFF).getTime() 
  : Date.now() + 30 * 24 * 60 * 60 * 1000; // default 30 days from now

let cachedPrivateKey: any = null;
let cachedPublicKey: any = null;

async function getEdDSAKeys() {
  if (cachedPrivateKey && cachedPublicKey) return { privateKey: cachedPrivateKey, publicKey: cachedPublicKey };
  
  if (process.env.JWT_EDDSA_PRIVATE_JWK && process.env.JWT_EDDSA_PUBLIC_JWK) {
    try {
      const privJwk = JSON.parse(process.env.JWT_EDDSA_PRIVATE_JWK);
      const pubJwk  = JSON.parse(process.env.JWT_EDDSA_PUBLIC_JWK);
      cachedPrivateKey = await importJWK(privJwk, 'EdDSA');
      cachedPublicKey  = await importJWK(pubJwk,  'EdDSA');
      return { privateKey: cachedPrivateKey, publicKey: cachedPublicKey };
    } catch (parseErr) {
      // Malformed JWK env var  fall back to HS256 silently
      console.warn('[JWT] JWT_EDDSA_*_JWK env var is malformed or invalid JSON. Falling back to HS256.', parseErr instanceof SyntaxError ? parseErr.message : '');
      cachedPrivateKey = null;
      cachedPublicKey  = null;
      return null;
    }
  }
  return null;
}

export const mintJWT = async (payload: JWTPayload): Promise<string> => {
  const now = Date.now();
  const keys = await getEdDSAKeys();
  const useEdDSA = keys && (now < migrationCutoff || process.env.NODE_ENV === 'production');

  if (useEdDSA && keys) {
    return new SignJWT(payload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(keys.privateKey);
  }

  // Fallback HS256 with strictly enforced env secret
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(secretHS256));
};

export const verifyJWT = async (token: string): Promise<JWTPayload> => {
  const now = Date.now();
  const keys = await getEdDSAKeys();
  const useEdDSA = keys && (now < migrationCutoff || process.env.NODE_ENV === 'production');

  try {
    if (useEdDSA && keys) {
      const { payload } = await jwtVerify(token, keys.publicKey, { algorithms: [alg] });
      return payload;
    }
  } catch (e) {
    // Si EdDSA falla y estamos en ventana de migración  intentar HS256
    if (now < migrationCutoff) {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secretHS256), { algorithms: ['HS256'] });
      return payload;
    }
    throw e;
  }

  // If we didn't use EdDSA, try HS256
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secretHS256), { algorithms: ['HS256'] });
  return payload;
};
