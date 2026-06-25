export function parseRetryAfter(header: string | null): number {
  if (!header) {
    return 60;
  }

  const seconds = parseInt(header, 10);
  if (!isNaN(seconds) && seconds >= 0) {
    return seconds;
  }

  const date = new Date(header);
  if (!isNaN(date.getTime())) {
    const diff = Math.ceil((date.getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  }

  return 60;
}
