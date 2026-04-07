import React from 'react';

export const BrandLogo = ({ className = "w-32 h-32", iconOnly = false }: { className?: string, iconOnly?: boolean }) => {
  return (
    <svg 
      viewBox="0 0 400 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Balance Scale */}
      <path 
        d="M200 110C200 110 230 120 260 140C290 160 320 160 320 160M200 110C200 110 170 120 140 140C110 160 80 160 80 160" 
        stroke="#ffb95f" 
        strokeWidth="8" 
        strokeLinecap="round"
      />
      <circle cx="200" cy="105" r="8" fill="#ffb95f" />
      <circle cx="80" cy="160" r="4" fill="#ffb95f" />
      <circle cx="320" cy="160" r="4" fill="#ffb95f" />
      
      {/* Left Scale Pan */}
      <path d="M80 160L40 220H120L80 160Z" fill="#ffb95f" opacity="0.8" />
      <path d="M40 220C40 235 120 235 120 220H40Z" fill="#ffb95f" />
      
      {/* Right Scale Pan */}
      <path d="M320 160L280 220H360L320 160Z" fill="#ffb95f" opacity="0.8" />
      <path d="M280 220C280 235 360 235 360 220H280Z" fill="#ffb95f" />

      {/* BS Letters */}
      <text 
        x="200" 
        y="195" 
        textAnchor="middle" 
        fill="#ffb95f" 
        style={{ fontSize: '70px', fontWeight: '900', fontFamily: 'Arial, sans-serif' }}
      >
        BS
      </text>

      {!iconOnly && (
        <>
          {/* Text: Saraiva & Batista */}
          <text 
            x="200" 
            y="255" 
            textAnchor="middle" 
            fill="#ffb95f" 
            style={{ fontSize: '24px', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}
          >
            Saraiva & Batista
          </text>

          {/* Text: ADVOCACIA */}
          <text 
            x="200" 
            y="300" 
            textAnchor="middle" 
            fill="#ffb95f" 
            style={{ fontSize: '42px', fontWeight: '900', fontFamily: 'Arial, sans-serif', letterSpacing: '2px' }}
          >
            ADVOCACIA
          </text>
        </>
      )}
    </svg>
  );
};
