/**
 * Domain Entity: User
 * Core business entity representing a user
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly avatarUrl: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Get display name (name or email fallback)
   */
  getDisplayName(): string {
    return this.name || this.email.split('@')[0];
  }

  /**
   * Get initials for avatar
   */
  getInitials(): string {
    const parts = this.name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.name[0].toUpperCase();
  }

  /**
   * Check if user has avatar
   */
  hasAvatar(): boolean {
    return !!this.avatarUrl;
  }

  /**
   * Create from database record
   */
  static fromRecord(record: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string | null;
    created_at: string;
    updated_at: string;
  }): User {
    return new User(
      record.id,
      record.email,
      record.name,
      record.avatar_url || null,
      new Date(record.created_at),
      new Date(record.updated_at)
    );
  }

  /**
   * Convert to plain object
   */
  toPlainObject() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      avatarUrl: this.avatarUrl,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
