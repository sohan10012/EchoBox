import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cognitoAuth, CognitoUser } from '@/services/cognitoAuth';
import { echoIdentityAuth, EchoIdentityUser } from '@/services/echoIdentityAuth';

export interface User {
  id: string; // Cognito sub
  email: string;
  name: string;
  authProvider: 'aws-cognito';
  createdAt?: string;
}

interface AuthContextType {
  // Owner Authentication (for room management)
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;

  // Optional EchoBox Identity Credentials (for "Manage My Posts")
  echoIdentity: EchoIdentityUser | null;
  isEchoIdentityAuthenticated: boolean;
  loginEchoIdentity: (echoboxId: string, password: string) => Promise<void>;
  registerEchoIdentity: (echoboxId: string, password: string) => Promise<void>;
  logoutEchoIdentity: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [echoIdentity, setEchoIdentity] = useState<EchoIdentityUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore authenticated sessions from valid Cognito tokens on initial mount
  useEffect(() => {
    let isMounted = true;

    try {
      const activeOwner: CognitoUser | null = cognitoAuth.getCurrentUser();
      const activeIdentity: EchoIdentityUser | null = echoIdentityAuth.getCurrentUser();

      if (isMounted) {
        if (activeOwner) {
          setUser({
            id: activeOwner.id,
            email: activeOwner.email,
            name: activeOwner.name,
            authProvider: 'aws-cognito',
          });
        }
        if (activeIdentity) {
          setEchoIdentity(activeIdentity);
        }
        setIsLoading(false);
      }
    } catch {
      if (isMounted) {
        setIsLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Owner methods
  const login = async (email: string, password: string) => {
    const { user: cUser } = await cognitoAuth.signIn(email, password);
    const appUser: User = {
      id: cUser.id,
      email: cUser.email,
      name: cUser.name,
      authProvider: 'aws-cognito',
    };
    setUser(appUser);
    toast.success(`Welcome back, ${appUser.name}!`);
  };

  const register = async (email: string, password: string, name?: string) => {
    await cognitoAuth.signUp(email, password, name);
    const { user: cUser } = await cognitoAuth.signIn(email, password);
    const appUser: User = {
      id: cUser.id,
      email: cUser.email,
      name: cUser.name,
      authProvider: 'aws-cognito',
    };
    setUser(appUser);
    toast.success(`Account created! Welcome to EchoBox, ${appUser.name}!`);
  };

  const logout = async () => {
    await cognitoAuth.signOut();
    setUser(null);
    toast.info('Signed out of owner workspace.');
  };

  // EchoBox Identity methods (for Manage My Posts)
  const loginEchoIdentity = async (echoboxId: string, password: string) => {
    const { user: idUser } = await echoIdentityAuth.signIn(echoboxId, password);
    setEchoIdentity(idUser);
    toast.success(`Connected as ${idUser.echoboxId}!`);
  };

  const registerEchoIdentity = async (echoboxId: string, password: string) => {
    const { user: idUser } = await echoIdentityAuth.register(echoboxId, password);
    setEchoIdentity(idUser);
    toast.success(`EchoBox ID ${idUser.echoboxId} activated!`);
  };

  const logoutEchoIdentity = async () => {
    await echoIdentityAuth.signOut();
    setEchoIdentity(null);
    toast.info('Signed out of EchoBox ID.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        echoIdentity,
        isEchoIdentityAuthenticated: !!echoIdentity,
        loginEchoIdentity,
        registerEchoIdentity,
        logoutEchoIdentity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
