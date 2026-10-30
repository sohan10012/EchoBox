/**
 * AWS Cognito Authentication Client
 *
 * Direct browser-native implementation against Amazon Cognito Identity Provider.
 * Zero external credentials or secrets required in client code.
 */

const COGNITO_REGION = import.meta.env.VITE_AWS_REGION || 'ap-south-1';
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || 'sctqr0h0042caou4p0tk5s4b8';
const COGNITO_ENDPOINT = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`;

const STORAGE_KEY_TOKENS = 'echobox.auth.tokens';
const STORAGE_KEY_USER = 'echobox.auth.user';

export interface CognitoUser {
  id: string; // sub
  email: string;
  name: string;
  confirmed: boolean;
}

export interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix epoch seconds
}

function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

async function callCognito(target: string, payload: Record<string, any>): Promise<any> {
  const response = await fetch(COGNITO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorType = data.__type || data.code || 'CognitoError';
    const message = data.message || data.error || 'Authentication failed';

    if (errorType.includes('NotAuthorizedException')) {
      throw new Error('Incorrect email address or password.');
    }
    if (errorType.includes('UserNotFoundException')) {
      throw new Error('No owner account found with this email address.');
    }
    if (errorType.includes('UsernameExistsException')) {
      throw new Error('An account with this email address already exists.');
    }
    if (errorType.includes('InvalidPasswordException')) {
      throw new Error('Password must be at least 8 characters long.');
    }
    throw new Error(message);
  }

  return data;
}

export const cognitoAuth = {
  /**
   * Registers a new owner account in the Cognito User Pool.
   */
  async signUp(
    email: string,
    password: string,
    name?: string
  ): Promise<{ userSub: string; userConfirmed: boolean }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || '').trim();

    const userAttributes = [{ Name: 'email', Value: cleanEmail }];
    if (cleanName) {
      userAttributes.push({ Name: 'name', Value: cleanName });
    }

    const res = await callCognito('SignUp', {
      ClientId: CLIENT_ID,
      Username: cleanEmail,
      Password: password,
      UserAttributes: userAttributes,
    });

    return {
      userSub: res.UserSub,
      userConfirmed: !!res.UserConfirmed,
    };
  },

  /**
   * Signs in an owner using Email and Password via USER_PASSWORD_AUTH.
   */
  async signIn(email: string, password: string): Promise<{ user: CognitoUser; tokens: AuthTokens }> {
    const cleanEmail = email.trim().toLowerCase();

    const res = await callCognito('InitiateAuth', {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: cleanEmail,
        PASSWORD: password,
      },
    });

    const authResult = res.AuthenticationResult;
    if (!authResult) {
      throw new Error('Authentication challenge encountered or sign-in failed.');
    }

    const idToken = authResult.IdToken;
    const accessToken = authResult.AccessToken;
    const refreshToken = authResult.RefreshToken;
    const expiresIn = authResult.ExpiresIn || 3600;

    const claims = parseJwt(idToken) || {};
    const nowEpoch = Math.floor(Date.now() / 1000);

    const tokens: AuthTokens = {
      idToken,
      accessToken,
      refreshToken,
      expiresAt: nowEpoch + expiresIn,
    };

    const user: CognitoUser = {
      id: claims.sub || authResult.Username || '',
      email: claims.email || cleanEmail,
      name: claims.name || cleanEmail.split('@')[0],
      confirmed: true,
    };

    // Store in localStorage for persistent session
    try {
      localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(tokens));
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch {}

    return { user, tokens };
  },

  /**
   * Signs out the current owner and clears authentication tokens.
   */
  async signOut(): Promise<void> {
    try {
      const storedTokens = this.getTokens();
      if (storedTokens?.accessToken) {
        // Attempt global sign out
        await callCognito('GlobalSignOut', {
          AccessToken: storedTokens.accessToken,
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem(STORAGE_KEY_TOKENS);
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  },

  /**
   * Retrieves active authentication tokens from storage.
   */
  getTokens(): AuthTokens | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TOKENS);
      if (!stored) return null;
      return JSON.parse(stored) as AuthTokens;
    } catch {
      return null;
    }
  },

  /**
   * Retrieves the current verified ID Token for Authorization headers.
   */
  getIdToken(): string | null {
    const tokens = this.getTokens();
    if (!tokens?.idToken) return null;

    // Check if expired
    const nowEpoch = Math.floor(Date.now() / 1000);
    if (tokens.expiresAt && tokens.expiresAt <= nowEpoch) {
      this.signOut();
      return null;
    }

    return tokens.idToken;
  },

  /**
   * Retrieves current authenticated user if session is valid.
   */
  getCurrentUser(): CognitoUser | null {
    const idToken = this.getIdToken();
    if (!idToken) return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        return JSON.parse(stored) as CognitoUser;
      }
      const claims = parseJwt(idToken);
      if (claims?.sub) {
        return {
          id: claims.sub,
          email: claims.email || '',
          name: claims.name || claims.email?.split('@')[0] || 'Owner',
          confirmed: true,
        };
      }
      return null;
    } catch {
      return null;
    }
  },
};

