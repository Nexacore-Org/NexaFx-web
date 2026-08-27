export function parseRetryAfter(header: string | null): number {
  if (!header) {
    return 60;
  }

  const seconds = parseInt(header, 10);
  if (!isNaN(seconds) && seconds > 0) {
    return seconds;
  }

  try {
    const date = new Date(header);
    const now = new Date();
    const diffSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
    return Math.max(diffSeconds, 0);
  } catch {
    return 60;
  }
}
