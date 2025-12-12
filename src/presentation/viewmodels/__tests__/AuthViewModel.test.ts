import { AuthViewModel } from '../AuthViewModel';

describe('AuthViewModel', () => {
  let viewModel: AuthViewModel;

  beforeEach(() => {
    viewModel = new AuthViewModel();
  });

  describe('form state management', () => {
    it('should initialize with default values', () => {
      const state = viewModel.getState();
      expect(state.isLogin).toBe(true);
      expect(state.email).toBe('');
      expect(state.password).toBe('');
      expect(state.name).toBe('');
      expect(state.loading).toBe(false);
      expect(state.socialLoading).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should set email', () => {
      viewModel.setEmail('test@example.com');
      const state = viewModel.getState();
      expect(state.email).toBe('test@example.com');
      expect(state.error).toBeNull();
    });

    it('should set password', () => {
      viewModel.setPassword('password123');
      const state = viewModel.getState();
      expect(state.password).toBe('password123');
    });

    it('should set name', () => {
      viewModel.setName('John Doe');
      const state = viewModel.getState();
      expect(state.name).toBe('John Doe');
    });

    it('should toggle mode', () => {
      viewModel.toggleMode();
      let state = viewModel.getState();
      expect(state.isLogin).toBe(false);

      viewModel.toggleMode();
      state = viewModel.getState();
      expect(state.isLogin).toBe(true);
    });

    it('should clear name when toggling to login mode', () => {
      viewModel.setName('John Doe');
      viewModel.toggleMode(); // Switch to signup
      viewModel.setName('Jane Doe');
      viewModel.toggleMode(); // Switch back to login
      const state = viewModel.getState();
      expect(state.name).toBe('');
    });
  });

  describe('validation', () => {
    it('should validate empty email', () => {
      const result = viewModel.validateForm();
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Email Required');
    });

    it('should validate empty password', () => {
      viewModel.setEmail('test@example.com');
      const result = viewModel.validateForm();
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Password Required');
    });

    it('should validate name required for signup', () => {
      viewModel.toggleMode();
      viewModel.setEmail('test@example.com');
      viewModel.setPassword('password123');
      const result = viewModel.validateForm();
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Name Required');
    });

    it('should validate password length', () => {
      viewModel.setEmail('test@example.com');
      viewModel.setPassword('12345');
      const result = viewModel.validateForm();
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid Password');
    });

    it('should validate email format', () => {
      viewModel.setEmail('invalid-email');
      viewModel.setPassword('password123');
      const result = viewModel.validateForm();
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid Email');
    });

    it('should pass validation with valid data', () => {
      viewModel.setEmail('test@example.com');
      viewModel.setPassword('password123');
      const result = viewModel.validateForm();
      expect(result.valid).toBe(true);
    });

    it('should pass validation for signup with name', () => {
      viewModel.toggleMode();
      viewModel.setEmail('test@example.com');
      viewModel.setPassword('password123');
      viewModel.setName('John Doe');
      const result = viewModel.validateForm();
      expect(result.valid).toBe(true);
    });
  });

  describe('getFormData', () => {
    it('should return trimmed form data', () => {
      viewModel.setEmail('  test@example.com  ');
      viewModel.setPassword('password123');
      viewModel.setName('  John Doe  ');

      const formData = viewModel.getFormData();
      expect(formData.email).toBe('test@example.com');
      expect(formData.password).toBe('password123');
      expect(formData.name).toBe('John Doe');
    });
  });

  describe('error handling', () => {
    it('should set error', () => {
      const error = new Error('Test error');
      viewModel.setError(error);
      const state = viewModel.getState();
      expect(state.error).toBeTruthy();
    });

    it('should clear error', () => {
      viewModel.setError(new Error('Test error'));
      viewModel.clearError();
      const state = viewModel.getState();
      expect(state.error).toBeNull();
    });
  });
});
