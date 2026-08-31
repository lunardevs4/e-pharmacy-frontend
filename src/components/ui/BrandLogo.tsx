import React from 'react';

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = "h-10 w-auto", 
  showText = false 
}) => {
  return (
    <div className="flex items-center gap-2">
      <img 
        src="/logo1.png" 
        alt="Rwanda E-Pharmacy Logo" 
        className={`object-contain ${className}`}
        onError={() => {
          console.error("Logo image failed to load from /logo1.png");
        }}
      />
      {showText && (
        <span className="font-bold text-sm text-health-950 tracking-tight">
          Rwanda E-Pharmacy
        </span>
      )}
    </div>
  );
};
