import React from 'react';

interface AvatarInitialsProps {
  name: string;
  size?: number;
  className?: string;
}

export const AvatarInitials: React.FC<AvatarInitialsProps> = ({ name, size = 40, className = '' }) => {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-blue-500 text-white font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {getInitials(name)}
    </div>
  );
};
