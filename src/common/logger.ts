import pino from 'pino';

export const log = pino({
  timestamp: false,
  formatters: {
    level(lvl: string) {
      return { level: (lvl || 'info').toUpperCase() };
    },
  },
});

export function logDuration(start: number, msg: string) {
  log.info({ durationMs: Date.now() - start }, msg);
}
