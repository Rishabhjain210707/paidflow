import { AuthUser, AuthRole } from '../types';

export interface StoredUser extends AuthUser {
  passwordHash: string; // Plaintext or hash for mock credentials
}

export const MOCK_USERS: StoredUser[] = [
  {
    id: 'user_freelancer_01',
    email: 'freelancer@metron.io',
    passwordHash: 'password123',
    name: 'Arjun Verma',
    role: 'freelancer',
    title: 'Senior Motion & Full-Stack Freelancer',
    upiId: '9079879010@fam',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_freelancer_02',
    email: 'arjun@metron.io',
    passwordHash: 'password123',
    name: 'Arjun Verma',
    role: 'freelancer',
    title: 'Lead Product Designer & Dev',
    upiId: '9079879010@fam',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_client_01',
    email: 'client@cred.club',
    passwordHash: 'password123',
    name: 'Kunal Shah',
    role: 'client',
    company: 'CRED Technologies',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_client_02',
    email: 'kunal@cred.club',
    passwordHash: 'password123',
    name: 'Kunal Shah',
    role: 'client',
    company: 'CRED Technologies',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
];

export function findUserByEmail(email: string): StoredUser | null {
  const normalized = email.trim().toLowerCase();
  return MOCK_USERS.find((u) => u.email.toLowerCase() === normalized) || null;
}

export function findUserById(id: string): StoredUser | null {
  return MOCK_USERS.find((u) => u.id === id) || null;
}

export async function authenticateCredentials(
  email: string,
  password: string,
  roleHint?: AuthRole
): Promise<{ user: AuthUser | null; error?: string }> {
  const trimmedEmail = email.trim().toLowerCase();
  const user = findUserByEmail(trimmedEmail);

  if (!user) {
    return { user: null, error: 'No account registered with this email address.' };
  }

  // Verify password
  if (user.passwordHash !== password) {
    return { user: null, error: 'Invalid password. Please check your credentials.' };
  }

  // If a role was explicitly selected in the login UI, verify it matches the user's role
  if (roleHint && user.role !== roleHint) {
    return {
      user: null,
      error: `Role mismatch: This account is registered as a ${user.role}, not a ${roleHint}. Please select the correct role tab.`,
    };
  }

  const { passwordHash, ...safeUser } = user;
  return { user: safeUser };
}
