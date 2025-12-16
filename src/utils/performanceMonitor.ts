/**
 * Performance Monitoring Utilities
 * Provides utilities for monitoring app performance
 */

import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = __DEV__;

  /**
   * Start tracking a performance metric
   */
  start(name: string): void {
    if (!this.enabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  /**
   * End tracking a performance metric
   */
  end(name: string): void {
    if (!this.enabled) return;

    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`Performance metric "${name}" not found`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    logger.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`);

    // Log to console in development
    if (__DEV__) {
      console.log(`⚡ Performance: ${name} - ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance decorator for functions
 */
export function measurePerformance(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      performanceMonitor.start(metricName);
      try {
        const result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
          return result.finally(() => {
            performanceMonitor.end(metricName);
          });
        }
        performanceMonitor.end(metricName);
        return result;
      } catch (error) {
        performanceMonitor.end(metricName);
        throw error;
      }
    };

    return descriptor;
  };
}
