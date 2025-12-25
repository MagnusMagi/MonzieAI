-- Schedule Materialized View Refresh
-- This migration creates a cron job to refresh daily_image_stats every day at midnight

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule refresh_daily_image_stats to run daily at 00:00 (midnight UTC)
-- Cron syntax: minute hour day month weekday
-- '0 0 * * *' means: at minute 0, hour 0, every day, every month, every weekday
SELECT cron.schedule(
  'refresh-daily-image-stats',
  '0 0 * * *', -- Every day at midnight UTC
  $$
  SELECT refresh_daily_image_stats();
  $$
);

-- Optional: Also schedule a refresh every 6 hours for more frequent updates
-- Uncomment the following if you want more frequent refreshes:
-- SELECT cron.schedule(
--   'refresh-daily-image-stats-6h',
--   '0 */6 * * *', -- Every 6 hours
--   $$
--   SELECT refresh_daily_image_stats();
--   $$
-- );

