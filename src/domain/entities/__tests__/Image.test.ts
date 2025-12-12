import { Image } from '../Image';

describe('Image Entity', () => {
  it('should create an image with all properties', () => {
    const image = new Image(
      '1',
      'Test Image',
      'https://example.com/image.jpg',
      'Test Category',
      100,
      50,
      'user123',
      'scene123',
      'Test Scene',
      'Test Prompt',
      'male',
      'Test Seed',
      'Test Model',
      new Date('2024-01-01'),
      new Date('2024-01-02')
    );

    expect(image.id).toBe('1');
    expect(image.title).toBe('Test Image');
    expect(image.imageUrl).toBe('https://example.com/image.jpg');
    expect(image.category).toBe('Test Category');
    expect(image.likes).toBe(100);
    expect(image.views).toBe(50);
    expect(image.userId).toBe('user123');
    expect(image.sceneId).toBe('scene123');
    expect(image.sceneName).toBe('Test Scene');
    expect(image.prompt).toBe('Test Prompt');
    expect(image.gender).toBe('male');
    expect(image.seed).toBe('Test Seed');
    expect(image.model).toBe('Test Model');
  });

  it('should create an image with minimal properties', () => {
    const image = new Image(
      '2',
      'Minimal Image',
      'https://example.com/image2.jpg',
      'Category',
      0,
      0,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      new Date(),
      null
    );

    expect(image.id).toBe('2');
    expect(image.title).toBe('Minimal Image');
    expect(image.imageUrl).toBe('https://example.com/image2.jpg');
    expect(image.likes).toBe(0);
    expect(image.views).toBe(0);
  });

  it('should handle null optional properties', () => {
    const image = new Image(
      '3',
      'Null Test',
      'https://example.com/image3.jpg',
      'Category',
      0,
      0,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      new Date(),
      null
    );

    expect(image.userId).toBeNull();
    expect(image.sceneId).toBeNull();
    expect(image.sceneName).toBeNull();
    expect(image.prompt).toBeNull();
    expect(image.gender).toBeNull();
    expect(image.seed).toBeNull();
    expect(image.model).toBeNull();
    expect(image.updatedAt).toBeNull();
  });
});
