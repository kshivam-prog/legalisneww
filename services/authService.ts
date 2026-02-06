import { User } from "../types";

const USERS_KEY = 'legalis_users_db';
const SESSION_KEY = 'legalis_session_v1';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  
  // Get current logged in user from session
  getCurrentUser: (): User | null => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (!session) return null;
      return JSON.parse(session);
    } catch (e) {
      return null;
    }
  },

  // Login
  login: async (email: string, password: string): Promise<User> => {
    await delay(800); // Fake network request
    
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: any[] = usersStr ? JSON.parse(usersStr) : [];
    
    // In a real app, password should be hashed. Here we compare plaintext for simulation.
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    // Create session object (exclude password)
    const sessionUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan || 'free',
      joinedAt: user.joinedAt
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  // Signup
  signup: async (name: string, email: string, password: string): Promise<User> => {
    await delay(1000); // Fake network request

    const usersStr = localStorage.getItem(USERS_KEY);
    const users: any[] = usersStr ? JSON.parse(usersStr) : [];

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already registered.");
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password, // Note: Never store passwords in plain text in production
      plan: 'free',
      joinedAt: Date.now()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login after signup
    const sessionUser: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        plan: 'free' as const,
        joinedAt: newUser.joinedAt
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    
    return sessionUser;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  }
};