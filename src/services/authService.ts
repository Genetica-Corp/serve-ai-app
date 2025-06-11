// Authentication Service
// This will be implemented by the Authentication Agent

import { User, LoginForm, RegisterForm } from '@/types';

export class AuthService {
  // These methods will be implemented by the Authentication Agent
  async login(credentials: LoginForm): Promise<User> {
    throw new Error('AuthService.login implementation pending - will be added by Authentication Agent');
  }

  async register(userData: RegisterForm): Promise<User> {
    throw new Error('AuthService.register implementation pending - will be added by Authentication Agent');
  }

  async logout(): Promise<void> {
    throw new Error('AuthService.logout implementation pending - will be added by Authentication Agent');
  }

  async getCurrentUser(): Promise<User | null> {
    throw new Error('AuthService.getCurrentUser implementation pending - will be added by Authentication Agent');
  }

  async refreshToken(): Promise<string> {
    throw new Error('AuthService.refreshToken implementation pending - will be added by Authentication Agent');
  }

  async resetPassword(email: string): Promise<void> {
    throw new Error('AuthService.resetPassword implementation pending - will be added by Authentication Agent');
  }
}

export default new AuthService();