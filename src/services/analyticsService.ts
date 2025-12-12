/**
 * Analytics Service
 * Provides analytics tracking for the app
 * Currently supports console logging, can be extended with Firebase Analytics or similar
 */

import { logger } from '../utils/logger';

export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, any>;
};

class AnalyticsService {
  private enabled: boolean = !__DEV__; // Disabled in development by default
  private userId: string | null = null;

  /**
   * Initialize analytics service
   */
  initialize(): void {
    if (__DEV__) {
      logger.debug('Analytics service initialized (console mode)');
    }
  }

  /**
   * Set user ID for analytics
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
    if (__DEV__) {
      logger.debug('Analytics user ID set', { userId });
    }
  }

  /**
   * Track an event
   */
  track(event: AnalyticsEvent): void {
    if (!this.enabled && !__DEV__) return;

    const logData = {
      event: event.name,
      properties: event.properties,
      userId: this.userId,
      timestamp: new Date().toISOString(),
    };

    if (__DEV__) {
      console.log('📊 Analytics Event:', logData);
      logger.debug('Analytics event tracked', logData);
    } else {
      // In production, send to analytics service (Firebase Analytics, etc.)
      // Example: firebase.analytics().logEvent(event.name, event.properties);
    }
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName: string, properties?: Record<string, any>): void {
    this.track({
      name: 'screen_view',
      properties: {
        screen_name: screenName,
        ...properties,
      },
    });
  }

  /**
   * Track user action
   */
  trackAction(action: string, properties?: Record<string, any>): void {
    this.track({
      name: 'user_action',
      properties: {
        action,
        ...properties,
      },
    });
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

export const analyticsService = new AnalyticsService();

// Initialize on import
analyticsService.initialize();

