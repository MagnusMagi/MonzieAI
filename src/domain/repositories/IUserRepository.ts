import { User } from '../entities/User';

/**
 * User Repository Interface
 * Defines contract for user data access
 */
export interface IUserRepository {
  /**
   * Get user by ID
   */
  getUserById(id: string): Promise<User | null>;

  /**
   * Get user by email
   */
  getUserByEmail(email: string): Promise<User | null>;

  /**
   * Create new user
   */
  createUser(user: { id: string; email: string; name: string; avatarUrl?: string }): Promise<User>;

  /**
   * Update user
   */
  updateUser(
    id: string,
    updates: Partial<{
      name: string;
      avatarUrl: string;
    }>
  ): Promise<User>;
}
