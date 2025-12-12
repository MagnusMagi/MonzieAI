import { retry, retryWithCondition } from '../retry';

describe('retry utility', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should succeed on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');

    const result = await retry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce('success');

    const promise = retry(fn, { maxRetries: 3, initialDelay: 100 });

    jest.advanceTimersByTime(100);
    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should fail after max retries', async () => {
    const error = new Error('Network error');
    const fn = jest.fn().mockRejectedValue(error);

    const promise = retry(fn, { maxRetries: 2, initialDelay: 100 });

    jest.advanceTimersByTime(500);

    await expect(promise).rejects.toThrow('Network error');
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('should use exponential backoff', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockRejectedValueOnce(new Error('Error 2'))
      .mockResolvedValueOnce('success');

    const promise = retry(fn, {
      maxRetries: 3,
      initialDelay: 100,
      backoffMultiplier: 2,
    });

    // First retry after 100ms
    jest.advanceTimersByTime(100);
    // Second retry after 200ms (100 * 2)
    jest.advanceTimersByTime(200);

    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should not retry non-retryable errors', async () => {
    const error = new Error('Validation error');
    const fn = jest.fn().mockRejectedValue(error);

    const promise = retry(fn, {
      maxRetries: 3,
      retryable: err => err.message.includes('Network'),
    });

    await expect(promise).rejects.toThrow('Validation error');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should work with custom retry condition', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Temporary error'))
      .mockResolvedValueOnce('success');

    const promise = retryWithCondition(
      fn,
      (error, attempt) => {
        return error.message.includes('Temporary') && attempt < 2;
      },
      { maxRetries: 3, initialDelay: 100 }
    );

    jest.advanceTimersByTime(100);
    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
