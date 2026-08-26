'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Shield,
  ArrowUpDown,
  Mail,
  CircleUserRound,
  Settings,
  BarChart3,
  Users,
  Bell,
  FileText,
  Flag,
  AlertTriangle,
  Clock,
  X,
  CornerDownLeft,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section: string;
}

interface SearchSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SearchResult[];
}

const dashboardItems: SearchResult[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, section: 'Dashboard' },
  { id: 'convert', label: 'Convert', href: '/convert', icon: ArrowUpDown, section: 'Dashboard' },
  { id: 'transactions', label: 'Transactions', href: '/transactions', icon: Mail, section: 'Dashboard' },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Settings, section: 'Dashboard' },
  { id: 'profile', label: 'Profile', href: '/profile', icon: CircleUserRound, section: 'Dashboard' },
  { id: 'notifications', label: 'Notifications', href: '/notifications', icon: Bell, section: 'Dashboard' },
];

const adminItems: SearchResult[] = [
  { id: 'admin-dashboard', label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard, section: 'Admin' },
  { id: 'admin-analytics', label: 'Analytics', href: '/admin/analytics', icon: BarChart3, section: 'Admin' },
  { id: 'admin-transactions', label: 'Transactions', href: '/admin/transactions', icon: Mail, section: 'Admin' },
  { id: 'admin-users', label: 'Users', href: '/admin/users', icon: Users, section: 'Admin' },
  { id: 'admin-push', label: 'Push Notifications', href: '/admin/push-notifications', icon: Bell, section: 'Admin' },
  { id: 'admin-reports', label: 'Reports', href: '/admin/reports', icon: FileText, section: 'Admin' },
  { id: 'admin-flagged', label: 'Flagged', href: '/admin/flagged', icon: Flag, section: 'Admin' },
  { id: 'admin-disputes', label: 'Disputes', href: '/admin/disputes', icon: AlertTriangle, section: 'Admin' },
];

const RECENT_SEARCHES_KEY = 'nexafx-recent-searches';
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string): string[] {
  const recent = getRecentSearches().filter((r) => r !== query);
  recent.unshift(query);
  const updated = recent.slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  return updated;
}

function removeRecentSearch(query: string): string[] {
  const recent = getRecentSearches().filter((r) => r !== query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
  return recent;
}

export function GlobalSearch() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const sections = useMemo<SearchSection[]>(() => {
    const sections: SearchSection[] = [];

    sections.push({
      title: 'Dashboard',
      icon: LayoutDashboard,
      items: dashboardItems,
    });

    if (isAdmin) {
      sections.push({
        title: 'Admin',
        icon: Shield,
        items: adminItems,
      });
    }

    return sections;
  }, [isAdmin]);

  const filteredSections = useMemo(() => {
    if (!query.trim()) return sections;

    const lowerQuery = query.toLowerCase();
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(lowerQuery) ||
            item.href.toLowerCase().includes(lowerQuery)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, query]);

  const allFilteredItems = useMemo(
    () => filteredSections.flatMap((section) => section.items),
    [filteredSections]
  );

  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback(
    (item: SearchResult) => {
      if (query.trim()) {
        setRecentSearches(addRecentSearch(query.trim()));
      }
      setOpen(false);
      setQuery('');
      router.push(item.href);
    },
    [query, router]
  );

  const handleRecentSelect = useCallback(
    (search: string) => {
      setQuery(search);
    },
    []
  );

  const handleRemoveRecent = useCallback((search: string) => {
    setRecentSearches(removeRecentSearch(search));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < allFilteredItems.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : allFilteredItems.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allFilteredItems[selectedIndex]) {
          handleSelect(allFilteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    },
    [allFilteredItems, selectedIndex, handleSelect]
  );

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-search-item]');
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border bg-white dark:bg-muted/20 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search pages, transactions, actions...</span>
        <span className="sm:hidden">Search...</span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 select-none">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    );
  }

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          setOpen(false);
          setQuery('');
        }}
      />
      <div className="fixed inset-x-0 top-[15%] mx-auto max-w-lg px-4">
        <div className="rounded-xl border bg-white dark:bg-background shadow-2xl overflow-hidden">
          <div className="flex items-center border-b px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search pages, transactions, actions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent px-3 py-4 text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="rounded-md p-1 hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => {
                setOpen(false);
                setQuery('');
              }}
              className="ml-2 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
            >
              ESC
            </button>
          </div>

          <div ref={listRef} className="max-h-[300px] overflow-y-auto p-2">
            {!query.trim() && recentSearches.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Recent Searches
                </div>
                {recentSearches.map((search) => (
                  <div key={search} className="flex items-center">
                    <button
                      onClick={() => handleRecentSelect(search)}
                      className="flex flex-1 items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-accent text-left"
                    >
                      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{search}</span>
                    </button>
                    <button
                      onClick={() => handleRemoveRecent(search)}
                      className="rounded-md p-1 hover:bg-accent"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {filteredSections.length === 0 && (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No results found for &quot;{query}&quot;
              </div>
            )}

            {filteredSections.map((section) => (
              <div key={section.title} className="mb-2">
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  <section.icon className="h-3.5 w-3.5" />
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const currentIndex = flatIndex++;
                  const isSelected = currentIndex === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      data-search-item
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-left',
                        isSelected
                          ? 'bg-accent text-accent-foreground'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {item.href}
                      </span>
                      {isSelected && (
                        <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <ChevronUp className="h-3 w-3" />
                <ChevronDown className="h-3 w-3" />
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" />
                Select
              </span>
            </div>
            <span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘</kbd>
              +
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">K</kbd>
              {' '}to toggle
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
