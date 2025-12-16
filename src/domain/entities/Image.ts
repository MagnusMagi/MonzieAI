/**
 * Domain Entity: Image
 * Core business entity representing an image
 */
export class Image {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly imageUrl: string,
    public readonly category: string,
    public readonly likes: number,
    public readonly views: number,
    public readonly userId: string | null,
    public readonly sceneId: string | null,
    public readonly sceneName: string | null,
    public readonly prompt: string | null,
    public readonly gender: string | null,
    public readonly seed: number | string | null,
    public readonly model: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date | null,
    public readonly description?: string | null,
    public readonly features?: string[] | null
  ) {}

  /**
   * Check if image is trending (high likes/views ratio)
   */
  isTrending(): boolean {
    return this.likes > 10 && this.views > 50;
  }

  /**
   * Get engagement score (likes + views)
   */
  getEngagementScore(): number {
    return this.likes + this.views;
  }

  /**
   * Create from database record
   */
  static fromRecord(record: {
    id: string;
    title: string;
    image_url: string;
    category: string;
    likes: number;
    views: number;
    created_at: string;
    updated_at?: string | null;
    user_id?: string | null;
    scene_id?: string | null;
    scene_name?: string | null;
    prompt?: string | null;
    seed?: number | string | null;
    description?: string | null;
    features?: string[] | null;
    gender?: string | null;
    model?: string | null;
  }): Image {
    return new Image(
      record.id,
      record.title,
      record.image_url,
      record.category,
      record.likes || 0,
      record.views || 0,
      record.user_id || null,
      record.scene_id || null,
      record.scene_name || null,
      record.prompt || null,
      record.gender || null,
      record.seed || null,
      record.model || null,
      new Date(record.created_at),
      record.updated_at ? new Date(record.updated_at) : null,
      record.description || null,
      record.features || null
    );
  }

  /**
   * Convert to plain object
   */
  toPlainObject() {
    return {
      id: this.id,
      title: this.title,
      imageUrl: this.imageUrl,
      category: this.category,
      likes: this.likes,
      views: this.views,
      userId: this.userId,
      sceneId: this.sceneId,
      sceneName: this.sceneName,
      prompt: this.prompt,
      gender: this.gender,
      seed: this.seed,
      model: this.model,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt?.toISOString() || null,
      description: this.description,
      features: this.features,
    };
  }
}
