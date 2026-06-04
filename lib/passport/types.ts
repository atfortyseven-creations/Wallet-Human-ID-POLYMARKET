export type PassportPayload = {
  description?: string;
  origin?: string;
  batchId?: string;
  manufacturedAt?: string;
  carbonKg?: number;
  certifications?: string[];
  [key: string]: unknown;
};

export type PassportEventPayload = {
  location?: string;
  note?: string;
  [key: string]: unknown;
};

export type ProductPassportPublic = {
  slug: string;
  title: string;
  category: string | null;
  issuerAddress: string | null;
  payload: PassportPayload;
  coreEntropy: string | null;
  txHash: string | null;
  chainId: number | null;
  gs1Gtin: string | null;
  createdAt: string;
  events: Array<{
    id: string;
    eventType: string;
    payload: PassportEventPayload;
    createdAt: string;
  }>;
};
