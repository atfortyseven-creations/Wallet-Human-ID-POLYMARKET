export const rpName = 'Human Wallet';
// In production, this should be your actual domain
export const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
export const origin = process.env.NEXT_PUBLIC_ORIGIN || `http://${rpID}:3000`;
