import axios, { AxiosInstance } from 'axios';

const STRIGA_BASE_URL = 'https://api.striga.com/v1';

export class StrigaClient {
  private client: AxiosInstance;
  private appId: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.appId = process.env.STRIGA_APP_ID || '';
    this.apiKey = process.env.STRIGA_API_KEY || '';
    this.apiSecret = process.env.STRIGA_API_SECRET || '';

    this.validateConfig();

    this.client = axios.create({
      baseURL: STRIGA_BASE_URL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'X-App-Id': this.appId, // Standard header for many financial APIs
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 10000, // 10s timeout for financial ops
    });
  }

  private validateConfig() {
    const missing = [];
    if (!this.appId) missing.push('STRIGA_APP_ID');
    if (!this.apiKey) missing.push('STRIGA_API_KEY');
    if (!this.apiSecret) missing.push('STRIGA_API_SECRET');

    if (missing.length > 0) {
      console.warn(`[StrigaClient] CRITICAL: Missing configuration variables: ${missing.join(', ')}`);
    } else {
      console.log('[StrigaClient] Initialized with production credentials.');
    }
  }

  /**
   * Universal error handler for Striga API responses
   */
  private handleError(error: any, operation: string) {
    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message || error.message;

    console.error(`[StrigaClient] ${operation} failed:`, {
      status,
      message,
      errorCode: data?.errorCode,
      timestamp: new Date().toISOString()
    });

    throw new Error(`Striga ${operation} Error: ${message}`);
  }

  /**
   * Create a new user in Striga
   */
  async createUser(userData: { email: string; firstName: string; lastName: string }) {
    try {
      const response = await this.client.post('/user', {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'createUser');
    }
  }

  /**
   * Get user status (KYC progress, etc.)
   */
  async getUserStatus(strigaUserId: string) {
    try {
      const response = await this.client.get(`/user/${strigaUserId}`);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'getUserStatus');
    }
  }

  /**
   * Issue a Virtual Card for a verified user
   */
  async issueCard(strigaUserId: string, tier: string = 'BLACK') {
    try {
      const response = await this.client.post('/card', {
        userId: strigaUserId,
        type: 'VIRTUAL',
        cardProgram: tier === 'METAL' ? 'premium' : 'standard',
        // Note: Production cards often require more params (currency, billing address)
      });
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'issueCard');
    }
  }

  /**
   * Get card details (Card Number, CVV, Expiry)
   */
  async getCardDetails(cardId: string) {
    try {
      const response = await this.client.get(`/card/${cardId}/details`);
      return response.data;
    } catch (error: any) {
      this.handleError(error, 'getCardDetails');
    }
  }
}

export const striga = new StrigaClient();

