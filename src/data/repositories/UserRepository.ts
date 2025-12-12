import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { supabase } from '../../config/supabase';
import { logger } from '../../utils/logger';

/**
 * User Repository Implementation
 * Data access layer for users using Supabase
 */
export class UserRepository implements IUserRepository {
  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data ? User.fromRecord(data) : null;
    } catch (error) {
      logger.error(
        'Failed to fetch user by id',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          userId: id,
        }
      );
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data ? User.fromRecord(data) : null;
    } catch (error) {
      logger.error(
        'Failed to fetch user by email',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          email,
        }
      );
      return null;
    }
  }

  async createUser(user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatarUrl,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return User.fromRecord(data);
    } catch (error) {
      logger.error(
        'Failed to create user',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          userId: user.id,
          email: user.email,
        }
      );
      throw error;
    }
  }

  async updateUser(
    id: string,
    updates: Partial<{
      name: string;
      avatarUrl: string;
    }>
  ): Promise<User> {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) {
        updateData.name = updates.name;
      }
      if (updates.avatarUrl !== undefined) {
        updateData.avatar_url = updates.avatarUrl;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return User.fromRecord(data);
    } catch (error) {
      logger.error(
        'Failed to update user',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          userId: id,
          updates,
        }
      );
      throw error;
    }
  }
}
