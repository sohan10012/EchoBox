import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  name: string;
  authProvider: 'demo-local' | 'aws-cognito';
  createdAt: string;
}

export interface ManagedRoomRecord {
  roomId: string;
  roomName: string;
  createdAt: string;
}

export interface AuthService {
  signIn(email: string, password: string): Promise<User>;
  signUp(email: string, password: string, name?: string): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

/**
 * Demo Authentication Service implementation.
 * Acts as an architectural boundary until AWS Cognito user pool is hooked up.
 * Does not fake production Cognito tokens.
 */
class DemoAuthServiceImpl implements AuthService {
  private readonly storageKey = 'echobox_auth_user';

  async signIn(email: string, password: string): Promise<User> {
    // Artificial latency for authentic network feel
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const name = email.split('@')[0];
    const user: User = {
      id: `usr_${Math.abs(email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0))}`,
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      authProvider: 'demo-local',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(this.storageKey, JSON.stringify(user));
    return user;
  }

  async signUp(email: string, password: string, name?: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 750));

    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const displayName = name?.trim() || email.split('@')[0];
    const user: User = {
      id: `usr_${Date.now()}`,
      email,
      name: displayName,
      authProvider: 'demo-local',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(this.storageKey, JSON.stringify(user));
    return user;
  }

  async signOut(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    localStorage.removeItem(this.storageKey);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return null;
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }
}

export const authService: AuthService = new DemoAuthServiceImpl();

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  managedRooms: ManagedRoomRecord[];
  addManagedRoom: (roomId: string, roomName: string) => void;
  removeManagedRoom: (roomId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [managedRooms, setManagedRooms] = useState<ManagedRoomRecord[]>([]);

  // Load active user on initial mount
  useEffect(() => {
    let isMounted = true;
    authService
      .getCurrentUser()
      .then((existingUser) => {
        if (isMounted) {
          setUser(existingUser);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync managed rooms for current user
  useEffect(() => {
    if (!user) {
      setManagedRooms([]);
      return;
    }

    const userRoomsKey = `echobox_rooms_${user.id}`;
    try {
      const stored = localStorage.getItem(userRoomsKey);
      if (stored) {
        setManagedRooms(JSON.parse(stored));
      } else {
        // Provide initial default test room f485b2d4 created earlier for demonstration if empty
        const initialRooms: ManagedRoomRecord[] = [
          {
            roomId: 'f485b2d4',
            roomName: 'Product Design & Feedback Space',
            createdAt: '2026-10-30T07:07:19.885298+00:00',
          },
        ];
        localStorage.setItem(userRoomsKey, JSON.stringify(initialRooms));
        setManagedRooms(initialRooms);
      }
    } catch {
      setManagedRooms([]);
    }
  }, [user]);

  const addManagedRoom = (roomId: string, roomName: string) => {
    if (!user) return;
    const userRoomsKey = `echobox_rooms_${user.id}`;
    setManagedRooms((prev) => {
      const exists = prev.some((r) => r.roomId === roomId);
      if (exists) return prev;
      const updated = [
        {
          roomId,
          roomName,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ];
      try {
        localStorage.setItem(userRoomsKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeManagedRoom = (roomId: string) => {
    if (!user) return;
    const userRoomsKey = `echobox_rooms_${user.id}`;
    setManagedRooms((prev) => {
      const updated = prev.filter((r) => r.roomId !== roomId);
      try {
        localStorage.setItem(userRoomsKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const login = async (email: string, password: string) => {
    const signedInUser = await authService.signIn(email, password);
    setUser(signedInUser);
    toast.success(`Welcome back, ${signedInUser.name}!`);
  };

  const register = async (email: string, password: string, name?: string) => {
    const registeredUser = await authService.signUp(email, password, name);
    setUser(registeredUser);
    toast.success(`Account created! Welcome, ${registeredUser.name}!`);
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
    toast.info('Signed out successfully.');
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
        managedRooms,
        addManagedRoom,
        removeManagedRoom,
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

