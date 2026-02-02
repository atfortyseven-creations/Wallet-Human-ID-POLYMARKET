import axios from 'axios';

const STRIGA_BASE_URL = 'https://api.striga.com/v1';

export class StrigaClient {
  private apiKey: string;

  constructor() {
    // Priority: .env or hardcoded for immediate response to user request
    this.apiKey = process.env.STRIGA_API_KEY || '[REDACTED_STRIGA_API_KEY]=';
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Create a new user in Striga
   */
  async createUser(userData: { email: string; firstName: string; lastName: string }) {
    try {
      // In a real production scenario, we'd need more fields (phone, address)
      // For this bridge, we attempt to initialize the user record
      const response = await axios.post(`${STRIGA_BASE_URL}/user`, {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      }, { headers: this.headers });
      
      return response.data;
    } catch (error: any) {
      console.error('Striga createUser error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get user status (KYC progress, etc.)
   */
  async getUserStatus(strigaUserId: string) {
    try {
      const response = await axios.get(`${STRIGA_BASE_URL}/user/${strigaUserId}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error: any) {
      console.error('Striga getUserStatus error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Issue a Virtual Card for a verified user
   */
  async issueCard(strigaUserId: string, tier: string = 'BLACK') {
    try {
      const response = await axios.post(`${STRIGA_BASE_URL}/card`, {
        userId: strigaUserId,
        type: 'VIRTUAL',
        cardProgram: tier === 'METAL' ? 'premium' : 'standard',
      }, { headers: this.headers });
      
      return response.data;
    } catch (error: any) {
      console.error('Striga issueCard error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get card details (Card Number, CVV, Expiry)
   * Note: This usually requires a special session/token for PCI compliance
   */
  async getCardDetails(cardId: string) {
    try {
      const response = await axios.get(`${STRIGA_BASE_URL}/card/${cardId}/details`, {
        headers: this.headers
      });
      return response.data;
    } catch (error: any) {
      console.error('Striga getCardDetails error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const striga = new StrigaClient();
