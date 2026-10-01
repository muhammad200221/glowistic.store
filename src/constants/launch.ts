// Target date: October 1, 2026 at 20:00:00 (8:00 PM) in Iraq Time (UTC+3)
export const LAUNCH_TARGET_ISO = '2026-10-01T20:00:00+03:00';
export const LAUNCH_TIMESTAMP = new Date(LAUNCH_TARGET_ISO).getTime();

export function checkIsStoreLaunched(): boolean {
  return Date.now() >= LAUNCH_TIMESTAMP;
}
