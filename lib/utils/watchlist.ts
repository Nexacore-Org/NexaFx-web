const WATCHLIST_KEY = "currencyWatchlist";

export const getWatchlist = (): string[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(WATCHLIST_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addToWatchlist = (pair: string): void => {
  if (typeof window === "undefined") return;
  const currentWatchlist = getWatchlist();
  if (!currentWatchlist.includes(pair)) {
    const newWatchlist = [...currentWatchlist, pair];
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newWatchlist));
    window.dispatchEvent(new Event("storage"));
  }
};

export const removeFromWatchlist = (pair: string): void => {
  if (typeof window === "undefined") return;
  const currentWatchlist = getWatchlist();
  const newWatchlist = currentWatchlist.filter((p) => p !== pair);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newWatchlist));
  window.dispatchEvent(new Event("storage"));
};

export const isInWatchlist = (pair: string): boolean => {
  if (typeof window === "undefined") return false;
  const currentWatchlist = getWatchlist();
  return currentWatchlist.includes(pair);
};
