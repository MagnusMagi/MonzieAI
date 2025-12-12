/**
 * Dependency Injection Container
 * Manages dependencies and provides instances
 */
import { ISceneRepository } from '../../domain/repositories/ISceneRepository';
import { IImageRepository } from '../../domain/repositories/IImageRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IFavoriteRepository } from '../../domain/repositories/IFavoriteRepository';
import { SceneRepository } from '../../data/repositories/SceneRepository';
import { ImageRepository } from '../../data/repositories/ImageRepository';
import { UserRepository } from '../../data/repositories/UserRepository';
import { FavoriteRepository } from '../../data/repositories/FavoriteRepository';
import { GetScenesUseCase } from '../../domain/usecases/GetScenesUseCase';
import { GetSceneByIdUseCase } from '../../domain/usecases/GetSceneByIdUseCase';
import { GetImagesUseCase } from '../../domain/usecases/GetImagesUseCase';
import { GetTrendingImagesUseCase } from '../../domain/usecases/GetTrendingImagesUseCase';
import { GenerateImageUseCase } from '../../domain/usecases/GenerateImageUseCase';
import { LikeImageUseCase } from '../../domain/usecases/LikeImageUseCase';
import { GetSceneCategoriesUseCase } from '../../domain/usecases/GetSceneCategoriesUseCase';
import { imageGenerationService } from '../../services/imageGenerationService';

class Container {
  // Repositories (singletons)
  private _sceneRepository: ISceneRepository | null = null;
  private _imageRepository: IImageRepository | null = null;
  private _userRepository: IUserRepository | null = null;
  private _favoriteRepository: IFavoriteRepository | null = null;

  // Use Cases (singletons)
  private _getScenesUseCase: GetScenesUseCase | null = null;
  private _getSceneByIdUseCase: GetSceneByIdUseCase | null = null;
  private _getImagesUseCase: GetImagesUseCase | null = null;
  private _getTrendingImagesUseCase: GetTrendingImagesUseCase | null = null;
  private _generateImageUseCase: GenerateImageUseCase | null = null;
  private _likeImageUseCase: LikeImageUseCase | null = null;
  private _getSceneCategoriesUseCase: GetSceneCategoriesUseCase | null = null;

  // Repositories
  get sceneRepository(): ISceneRepository {
    if (!this._sceneRepository) {
      this._sceneRepository = new SceneRepository();
    }
    return this._sceneRepository;
  }

  get imageRepository(): IImageRepository {
    if (!this._imageRepository) {
      this._imageRepository = new ImageRepository();
    }
    return this._imageRepository;
  }

  get userRepository(): IUserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserRepository();
    }
    return this._userRepository;
  }

  get favoriteRepository(): IFavoriteRepository {
    if (!this._favoriteRepository) {
      this._favoriteRepository = new FavoriteRepository();
    }
    return this._favoriteRepository;
  }

  // Use Cases
  get getScenesUseCase(): GetScenesUseCase {
    if (!this._getScenesUseCase) {
      this._getScenesUseCase = new GetScenesUseCase(this.sceneRepository);
    }
    return this._getScenesUseCase;
  }

  get getSceneByIdUseCase(): GetSceneByIdUseCase {
    if (!this._getSceneByIdUseCase) {
      this._getSceneByIdUseCase = new GetSceneByIdUseCase(this.sceneRepository);
    }
    return this._getSceneByIdUseCase;
  }

  get getImagesUseCase(): GetImagesUseCase {
    if (!this._getImagesUseCase) {
      this._getImagesUseCase = new GetImagesUseCase(this.imageRepository);
    }
    return this._getImagesUseCase;
  }

  get getTrendingImagesUseCase(): GetTrendingImagesUseCase {
    if (!this._getTrendingImagesUseCase) {
      this._getTrendingImagesUseCase = new GetTrendingImagesUseCase(this.imageRepository);
    }
    return this._getTrendingImagesUseCase;
  }

  get generateImageUseCase(): GenerateImageUseCase {
    if (!this._generateImageUseCase) {
      this._generateImageUseCase = new GenerateImageUseCase(
        this.imageRepository,
        this.sceneRepository,
        imageGenerationService
      );
    }
    return this._generateImageUseCase;
  }

  get likeImageUseCase(): LikeImageUseCase {
    if (!this._likeImageUseCase) {
      this._likeImageUseCase = new LikeImageUseCase(this.imageRepository);
    }
    return this._likeImageUseCase;
  }

  get getSceneCategoriesUseCase(): GetSceneCategoriesUseCase {
    if (!this._getSceneCategoriesUseCase) {
      this._getSceneCategoriesUseCase = new GetSceneCategoriesUseCase(this.sceneRepository);
    }
    return this._getSceneCategoriesUseCase;
  }
}

// Export singleton instance
export const container = new Container();
