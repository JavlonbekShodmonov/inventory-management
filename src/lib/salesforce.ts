import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

interface SalesforceTokenResponse {
  access_token: string;
  refresh_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
}

interface SalesforceContactData {
  FirstName: string;
  LastName: string;
  Email: string;
  Title?: string;
  Description?: string; // For interests
  AccountId: string;
}

interface SalesforceAccountData {
  Name: string;
  Description?: string;
}

interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
}

export class SalesforceService {
  private static CLIENT_ID = process.env.SALESFORCE_CLIENT_ID!;
  private static CLIENT_SECRET = process.env.SALESFORCE_CLIENT_SECRET!;
  private static REDIRECT_URI = process.env.SALESFORCE_REDIRECT_URI!;
  private static LOGIN_URL = process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com';
  private static API_VERSION = process.env.SALESFORCE_API_VERSION || 'v59.0';

  /**
   * Generate PKCE code verifier and challenge
   * RFC 7636 - Proof Key for Code Exchange
   */
  static generatePKCE(): PKCEPair {
    // Generate a cryptographically random 32-byte code verifier
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    
    // Create SHA256 hash of the verifier for the challenge
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    
    return { codeVerifier, codeChallenge };
  }

  /**
   * Generate OAuth authorization URL with PKCE
   */
  static getAuthorizationUrl(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      state,
      scope: 'api refresh_token offline_access',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256', // SHA256 hashing
    });

    return `${this.LOGIN_URL}/services/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token using PKCE
   */
  static async getAccessToken(code: string, codeVerifier: string): Promise<SalesforceTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: this.CLIENT_ID,
      client_secret: this.CLIENT_SECRET,
      redirect_uri: this.REDIRECT_URI,
      code_verifier: codeVerifier, // PKCE verification
    });

    const response = await fetch(`${this.LOGIN_URL}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get access token: ${error}`);
    }

    return response.json();
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken: string): Promise<SalesforceTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.CLIENT_ID,
      client_secret: this.CLIENT_SECRET,
    });

    const response = await fetch(`${this.LOGIN_URL}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    return response.json();
  }

  /**
   * Make authenticated API call to Salesforce
   */
  static async makeApiCall(
    userId: string,
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<any> {
    const integration = await prisma.salesforceIntegration.findUnique({
      where: { userId },
    });

    if (!integration) {
      throw new Error('Salesforce integration not found for user');
    }

    let accessToken = integration.accessToken;
    let instanceUrl = integration.instanceUrl;

    // Try the API call
    let response = await fetch(`${instanceUrl}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // If unauthorized, try refreshing the token
    if (response.status === 401) {
      const tokenData = await this.refreshAccessToken(integration.refreshToken);
      
      // Update stored tokens
      await prisma.salesforceIntegration.update({
        where: { userId },
        data: {
          accessToken: tokenData.access_token,
          instanceUrl: tokenData.instance_url,
          updatedAt: new Date(),
        },
      });

      accessToken = tokenData.access_token;
      instanceUrl = tokenData.instance_url;

      // Retry the request
      response = await fetch(`${instanceUrl}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Salesforce API error: ${error}`);
    }

    return response.json();
  }

  /**
   * Create Account in Salesforce
   */
  static async createAccount(
    userId: string,
    accountData: SalesforceAccountData
  ): Promise<string> {
    const result = await this.makeApiCall(
      userId,
      `/services/data/${this.API_VERSION}/sobjects/Account`,
      'POST',
      accountData
    );

    return result.id;
  }

  /**
   * Create Contact in Salesforce
   */
  static async createContact(
    userId: string,
    contactData: SalesforceContactData
  ): Promise<string> {
    const result = await this.makeApiCall(
      userId,
      `/services/data/${this.API_VERSION}/sobjects/Contact`,
      'POST',
      contactData
    );

    return result.id;
  }

  /**
   * Check if Contact already exists by email
   */
  static async findContactByEmail(userId: string, email: string): Promise<any> {
    const query = `SELECT Id, AccountId FROM Contact WHERE Email = '${email}' LIMIT 1`;
    const encodedQuery = encodeURIComponent(query);
    
    const result = await this.makeApiCall(
      userId,
      `/services/data/${this.API_VERSION}/query?q=${encodedQuery}`,
      'GET'
    );

    return result.totalSize > 0 ? result.records[0] : null;
  }

  /**
   * Create Account and Contact for user
   */
  static async createAccountAndContact(
    userId: string,
    userData: {
      name: string;
      email: string;
      jobTitle?: string;
      interests?: string;
    }
  ): Promise<{ accountId: string; contactId: string }> {
    // Check if contact already exists
    const existingContact = await this.findContactByEmail(userId, userData.email);
    
    if (existingContact) {
      return {
        accountId: existingContact.AccountId,
        contactId: existingContact.Id,
      };
    }

    // Split name into first and last
    const nameParts = userData.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Create Account
    const accountData: SalesforceAccountData = {
      Name: `${userData.name}'s Account`,
      Description: userData.interests || '',
    };

    const accountId = await this.createAccount(userId, accountData);

    // Create Contact
    const contactData: SalesforceContactData = {
      FirstName: firstName,
      LastName: lastName,
      Email: userData.email,
      Title: userData.jobTitle,
      Description: userData.interests,
      AccountId: accountId,
    };

    const contactId = await this.createContact(userId, contactData);

    // Update integration record
    await prisma.salesforceIntegration.update({
      where: { userId },
      data: {
        salesforceAccountId: accountId,
        salesforceContactId: contactId,
        lastSyncedAt: new Date(),
      },
    });

    return { accountId, contactId };
  }
}