import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface RateLimitMessageProps {
  retryAfterSeconds: number;
  onRetry: () => void;
  message?: string;
}

export function RateLimitMessage({ retryAfterSeconds, onRetry, message }: RateLimitMessageProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(retryAfterSeconds);
  const previousRetryAfterRef = useRef(retryAfterSeconds);

  useEffect(() => {
    if (retryAfterSeconds !== previousRetryAfterRef.current) {
      setRemainingSeconds(retryAfterSeconds);
      previousRetryAfterRef.current = retryAfterSeconds;
    }

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [retryAfterSeconds]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <p className="text-center font-medium">
        {message || `Too many attempts. Try again in ${formattedTime}`}
      </p>
      <Button
        variant="outline"
        onClick={onRetry}
        disabled={remainingSeconds > 0}
      >
        Try again
      </Button>
    </div>
  );
}
