import React from 'react';
import { BrandLogo } from './BrandLogo';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: string;
}

export default function Logo({ className = "", size = 32, showText = false, textColor = "text-[#ffb95f]" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
        <BrandLogo className="w-full h-full" iconOnly={showText} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`text-lg font-black leading-tight ${textColor}`}>Saraiva & Batista TV</span>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Saraiva & Batista</span>
        </div>
      )}
    </div>
  );
}
