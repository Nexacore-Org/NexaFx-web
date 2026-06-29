'use client';

import { forwardRef } from 'react';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';

type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection';

interface HapticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  haptic?: HapticFeedbackType;
}

const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  ({ onClick, haptic = 'light', ...props }, ref) => {
    const haptics = useHapticFeedback();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const feedback = haptics[haptic];
      if (typeof feedback === 'function') {
        feedback();
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  },
);

HapticButton.displayName = 'HapticButton';

export { HapticButton };
export type { HapticFeedbackType };
