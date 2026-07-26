import React, { useState } from 'react';

interface LogoBrandProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LogoBrand: React.FC<LogoBrandProps> = ({
  size = 'md',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const logoSizes = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16'
  };

  if (imageError) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div
          className={`${logoSizes[size]} flex items-center justify-center rounded-full bg-emerald-600 px-3 text-sm font-semibold text-white shadow-sm`}
        >
          E-Pharmacy
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src="/logo1.png"
        alt="Rwanda E-Pharmacy Logo"
        onError={() => setImageError(true)}
        className={`${logoSizes[size]} object-contain drop-shadow-sm`}
      />
    </div>
  );
};