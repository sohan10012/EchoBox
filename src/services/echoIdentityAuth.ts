/**
 * EchoBox Identity Authentication Service
 *
 * Provides optional credentials ("Manage My Posts") allowing visitors to claim
 * an EchoBox ID and password without requiring any real email or personal data.
 * Directly authenticated against Amazon Cognito Identity Pool: ap-south-1_vRfOd670T.
 */

const COGNITO_REGION = import.meta.env.VITE_AWS_REGION || 'ap-south-1';
const IDENTITY_CLIENT_ID =
  import.meta.env.VITE_COGNITO_IDENTITY_CLIENT_ID || 'pg5flhrd2r35kp3bn1js2k2hg';
const COGNITO_ENDPOINT = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/`;

const STORAGE_KEY_TOKENS = 'echobox.identity.tokens';
const STORAGE_KEY_USER = 'echobox.identity.user';

export interface EchoIdentityUser {
  id: string; // sub
  echoboxId: string; // username (e.g. echo_7K29XQ)
}

export interface EchoAuthTokens {
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
      throw new Error('Incorrect EchoBox ID or password.');
    }
    if (errorType.includes('UserNotFoundException')) {
      throw new Error('No account found with this EchoBox ID.');
    }
    if (errorType.includes('UsernameExistsException')) {
      throw new Error('This EchoBox ID is already taken. Please try another ID or generate a new one.');
    }
    if (errorType.includes('InvalidPasswordException')) {
      throw new Error('Password must be at least 8 characters long.');
    }
    throw new Error(message);
  }

  return data;
}

export const echoIdentityAuth = {
  /**
   * Generates a recommended unique EchoBox ID (e.g. echo_7K29XQ).
   */
  generateRandomEchoBoxId(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `echo_${code}`;
  },

  /**
   * Generates a secure random password (14 characters, letters & numbers).
   */
  generateRandomPassword(): string {
    const charset = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!#%*';
    let password = '';
    for (let i = 0; i < 14; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  },

  /**
   * Registers a new EchoBox ID without any email or personal info.
   */
  async register(
    echoboxId: string,
    password: string
  ): Promise<{ user: EchoIdentityUser; tokens: EchoAuthTokens }> {
    const cleanId = echoboxId.trim();

    if (!cleanId || cleanId.length < 4) {
      throw new Error('EchoBox ID must be at least 4 characters long.');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    // 1. Sign up
    await callCognito('SignUp', {
      ClientId: IDENTITY_CLIENT_ID,
      Username: cleanId,
      Password: password,
    });

    // 2. Immediate Sign in
    return this.signIn(cleanId, password);
  },

  /**
   * Signs in an existing EchoBox ID using username and password.
   */
  async signIn(
    echoboxId: string,
    password: string
  ): Promise<{ user: EchoIdentityUser; tokens: EchoAuthTokens }> {
    const cleanId = echoboxId.trim();

    const res = await callCognito('InitiateAuth', {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: IDENTITY_CLIENT_ID,
      AuthParameters: {
        USERNAME: cleanId,
        PASSWORD: password,
      },
    });

    const authResult = res.AuthenticationResult;
    if (!authResult) {
      throw new Error('Sign-in failed. Please verify your credentials.');
    }

    const idToken = authResult.IdToken;
    const accessToken = authResult.AccessToken;
    const refreshToken = authResult.RefreshToken;
    const expiresIn = authResult.ExpiresIn || 3600;

    const claims = parseJwt(idToken) || {};
    const nowEpoch = Math.floor(Date.now() / 1000);

    const tokens: EchoAuthTokens = {
      idToken,
      accessToken,
      refreshToken,
      expiresAt: nowEpoch + expiresIn,
    };

    const user: EchoIdentityUser = {
      id: claims.sub || authResult.Username || '',
      echoboxId: cleanId,
    };

    try {
      localStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(tokens));
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch {}

    return { user, tokens };
  },

  /**
   * Signs out the EchoBox ID and clears local credentials.
   */
  async signOut(): Promise<void> {
    try {
      const storedTokens = this.getTokens();
      if (storedTokens?.accessToken) {
        await callCognito('GlobalSignOut', {
          AccessToken: storedTokens.accessToken,
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem(STORAGE_KEY_TOKENS);
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  },

  getTokens(): EchoAuthTokens | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TOKENS);
      if (!stored) return null;
      return JSON.parse(stored) as EchoAuthTokens;
    } catch {
      return null;
    }
  },

  getIdToken(): string | null {
    const tokens = this.getTokens();
    if (!tokens?.idToken) return null;

    const nowEpoch = Math.floor(Date.now() / 1000);
    if (tokens.expiresAt && tokens.expiresAt <= nowEpoch) {
      this.signOut();
      return null;
    }

    return tokens.idToken;
  },

  getCurrentUser(): EchoIdentityUser | null {
    const idToken = this.getIdToken();
    if (!idToken) return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        return JSON.parse(stored) as EchoIdentityUser;
      }
      const claims = parseJwt(idToken);
      if (claims?.sub) {
        return {
          id: claims.sub,
          echoboxId: claims['cognito:username'] || claims.sub,
        };
      }
      return null;
    } catch {
      return null;
    }
  },
};

