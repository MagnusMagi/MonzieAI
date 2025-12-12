/**
 * Domain Entity: Scene
 * Core business entity representing an AI scene template
 */
export class Scene {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly category: string,
    public readonly previewUrl: string | null,
    public readonly promptTemplate: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Check if scene is available for use
   */
  isAvailable(): boolean {
    return this.isActive;
  }

  /**
   * Get formatted prompt with gender replacement
   */
  getFormattedPrompt(gender: string): string {
    if (!this.promptTemplate) {
      return `A professional ${gender} portrait`;
    }
    return this.promptTemplate.replace(/{gender}/g, gender);
  }

  /**
   * Create from database record
   */
  static fromRecord(record: {
    id: string;
    name: string;
    description?: string | null;
    category: string;
    preview_url?: string | null;
    prompt_template?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }): Scene {
    return new Scene(
      record.id,
      record.name,
      record.description || null,
      record.category,
      record.preview_url || null,
      record.prompt_template || null,
      record.is_active,
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
      name: this.name,
      description: this.description,
      category: this.category,
      previewUrl: this.previewUrl,
      promptTemplate: this.promptTemplate,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
