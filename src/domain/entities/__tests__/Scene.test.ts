import { Scene } from '../Scene';

describe('Scene Entity', () => {
  it('should create a scene with all properties', () => {
    const scene = new Scene(
      '1',
      'Test Scene',
      'Test Description',
      'Test Category',
      'Test Prompt Template',
      'https://example.com/preview.jpg',
      new Date('2024-01-01'),
      new Date('2024-01-02')
    );

    expect(scene.id).toBe('1');
    expect(scene.name).toBe('Test Scene');
    expect(scene.description).toBe('Test Description');
    expect(scene.category).toBe('Test Category');
    expect(scene.promptTemplate).toBe('Test Prompt Template');
    expect(scene.previewUrl).toBe('https://example.com/preview.jpg');
  });

  it('should create a scene with minimal properties', () => {
    const scene = new Scene(
      '2',
      'Minimal Scene',
      null,
      'Category',
      'Prompt',
      null,
      new Date(),
      null
    );

    expect(scene.id).toBe('2');
    expect(scene.name).toBe('Minimal Scene');
    expect(scene.description).toBeNull();
    expect(scene.previewUrl).toBeNull();
    expect(scene.updatedAt).toBeNull();
  });
});
