'use client';

import { useEffect, useState } from 'react';

interface RateLimitMessageProps {
  retryAfterSeconds: number;
  onRetry: () => void;
  message?: string;
}

export function RateLimitMessage({ retryAfterSeconds, onRetry, message }: RateLimitMessageProps) {
  const [remaining, setRemaining] = useState(retryAfterSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
      <p className="mb-2">
        {message || 'Too many attempts. Try again in'} {formatTime(remaining)}
      </p>
      {remaining === 0 && (
        <button
          onClick={onRetry}
          className="w-full py-2 bg-[#F39A00] hover:bg-[#da8a00] text-black font-semibold rounded-md transition-colors text-sm"
        >
          Try again
        </button>
      )}
    </div>
  );
}
