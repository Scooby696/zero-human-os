export const SCHEDULE_PRESETS = {
  "every_5_min": { label: "Every 5 minutes", cron: "*/5 * * * *" },
  "every_15_min": { label: "Every 15 minutes", cron: "*/15 * * * *" },
  "every_30_min": { label: "Every 30 minutes", cron: "*/30 * * * *" },
  "hourly": { label: "Hourly", cron: "0 * * * *" },
  "daily_midnight": { label: "Daily at midnight (UTC)", cron: "0 0 * * *" },
  "daily_9am": { label: "Daily at 9 AM (UTC)", cron: "0 9 * * *" },
  "daily_6pm": { label: "Daily at 6 PM (UTC)", cron: "0 18 * * *" },
  "weekday_9am": { label: "Weekdays at 9 AM", cron: "0 9 * * 1-5" },
  "weekly_monday": { label: "Every Monday at 9 AM", cron: "0 9 * * 1" },
  "monthly": { label: "1st of month at 9 AM", cron: "0 9 1 * *" },
};

export function createSchedulePolicy(config) {
  return {
    scheduleType: config.scheduleType || "manual", // manual, cron, interval
    cronExpression: config.cronExpression || "0 9 * * *",
    interval: config.interval || 3600, // seconds
    timeZone: config.timeZone || "UTC",
    maxConcurrent: config.maxConcurrent || 1,
    backoffPolicy: config.backoffPolicy || {
      strategy: "exponential", // linear, exponential, fixed
      initialDelay: 1000, // ms
      maxDelay: 300000, // 5 min
      maxRetries: 3,
    },
    rateLimiting: config.rateLimiting || {
      enabled: false,
      requestsPerSecond: 1,
      burstSize: 5,
    },
    budgetCap: config.budgetCap || null, // null = unlimited
    timeout: config.timeout || 30000, // ms
  };
}

export function getNextExecutionTime(cronExpression, timeZone = "UTC") {
  // Simplified: next execution is roughly 1 hour from now for demo
  // In production, use a proper cron parser like cron-parser
  const now = new Date();
  const next = new Date(now.getTime() + 3600000);
  return next.toISOString();
}