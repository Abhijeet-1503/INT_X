// Local authentication fallback system
// This works without Firebase configuration

export interface LocalUser {
  id: string;
  email: string;
  displayName: string;
  role: 'student' | 'proctor' | 'admin';
  createdAt: Date;
}

// Predefined accounts that work locally
const PREDEFINED_ACCOUNTS = [
  {
    id: 'admin-001',
    email: "admin@smartproctor.com",
    password: "admin123",
    displayName: "System Administrator",
    role: "admin" as const,
    createdAt: new Date()
  },
  {
    id: 'proctor-001',
    email: "proctor@smartproctor.com",
    password: "proctor123", 
    displayName: "Senior Proctor",
    role: "proctor" as const,
    createdAt: new Date()
  },
  {
    id: 'demo-001',
    email: "demo@smartproctor.com",
    password: "demo123",
    displayName: "Demo User", 
    role: "student" as const,
    createdAt: new Date()
  }
];

class LocalAuthService {
  private readonly USERS_KEY = 'smartproctor_users';
  private readonly CURRENT_USER_KEY = 'smartproctor_current_user';

  constructor() {
    this.initializePredefinedAccounts();
  }

  private initializePredefinedAccounts(): void {
    const existingUsers = this.getStoredUsers();
    
    // Add predefined accounts if they don't exist
    PREDEFINED_ACCOUNTS.forEach(account => {
      if (!existingUsers.find(user => user.email === account.email)) {
        existingUsers.push({
          id: account.id,
          email: account.email,
          displayName: account.displayName,
          role: account.role,
          createdAt: account.createdAt,
          password: account.password // Store hashed in real app
        });
      }
    });

    localStorage.setItem(this.USERS_KEY, JSON.stringify(existingUsers));
  }

  private getStoredUsers(): any[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  async signUp(email: string, password: string, displayName: string, role: 'student' | 'proctor' | 'admin'): Promise<LocalUser> {
    const users = this.getStoredUsers();
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      throw new Error('User already exists with this email');
    }

    const newUser = {
      id: `${role}-${Date.now()}`,
      email,
      displayName,
      role,
      createdAt: new Date(),
      password // In real app, hash this
    };

    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    // Auto sign in the new user
    const userWithoutPassword = { ...newUser };
    delete (userWithoutPassword as any).password;
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    return userWithoutPassword as LocalUser;
  }

  async signIn(email: string, password: string): Promise<LocalUser> {
    const users = this.getStoredUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Store current user (without password)
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    return userWithoutPassword as LocalUser;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  getCurrentUser(): LocalUser | null {
    const user = localStorage.getItem(this.CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  onAuthStateChange(callback: (user: LocalUser | null) => void): () => void {
    // Initial call
    callback(this.getCurrentUser());

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === this.CURRENT_USER_KEY) {
        callback(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }
}

export const localAuthService = new LocalAuthService();



