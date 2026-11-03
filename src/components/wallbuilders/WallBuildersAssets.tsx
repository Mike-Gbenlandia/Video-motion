import React from 'react';

// Exact vector recreation of the Wall Builders Conference Logo
export const WallBuildersLogo: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 60,
}) => {
  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* 3D Pixel Wall Geometry Top */}
        <svg
          width={size * 2.8}
          height={size}
          viewBox="0 0 240 85"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
        >
          {/* Stylized 'W' 'A' 'L' 'L' in 3D Isometric Blocks */}
          <path
            d="M10 50L30 15L45 42L60 15L80 50H65L55 30L45 50H35L25 30L15 50H10Z"
            fill="#FF1E27"
            stroke="#000"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M85 50L105 15L125 50H112L105 34L98 50H85Z"
            fill="#00F0FF"
            stroke="#000"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M130 15V50H160V40H142V15H130Z"
            fill="#E024C3"
            stroke="#000"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M168 15V50H198V40H180V15H168Z"
            fill="#0048FF"
            stroke="#000"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Location Badge (Ota) */}
          <circle cx="215" cy="40" r="14" fill="#FF1E27" stroke="#000" strokeWidth="2.5" />
          <text
            x="215"
            y="44"
            fill="#FFF"
            fontSize="10"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
            textAnchor="middle"
          >
            Ota
          </text>

          {/* "BUILDERS" Street/Neon Badge */}
          <rect
            x="25"
            y="52"
            width="170"
            height="22"
            rx="4"
            fill="#08080C"
            stroke="#FFDE00"
            strokeWidth="2.5"
          />
          <text
            x="110"
            y="68"
            fill="#FFDE00"
            fontSize="15"
            fontWeight="900"
            fontFamily="monospace"
            letterSpacing="0.25em"
            textAnchor="middle"
          >
            BUILDERS
          </text>
        </svg>
      </div>
      <div className="text-[10px] font-mono tracking-[0.3em] font-black text-black bg-white px-2 py-0.5 rounded border border-black -mt-1 shadow-sm">
        CONFERENCE
      </div>
    </div>
  );
};

// Stylized ELEVATION Title with custom V (cyan arrow) and A (blue triangle)
export const ElevationTitle: React.FC<{ progress?: number }> = ({ progress = 1 }) => {
  return (
    <div
      className="flex items-center justify-center gap-1 select-none font-black tracking-tight text-black"
      style={{
        transform: `scale(${0.9 + 0.1 * progress})`,
        opacity: progress,
      }}
    >
      <span className="text-4xl md:text-6xl font-black">ELE</span>

      {/* Upward Cyan Arrow Wedge as 'V' */}
      <div className="relative flex items-center justify-center w-8 md:w-12 h-10 md:h-14 mx-0.5">
        <svg
          viewBox="0 0 40 60"
          className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]"
        >
          <path
            d="M8 55L20 8L32 55L24 55L20 32L16 55H8Z"
            fill="#00F0FF"
            stroke="#000"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Electric Blue Upward Triangle as 'A' */}
      <div className="relative flex items-center justify-center w-8 md:w-12 h-10 md:h-14 mx-0.5">
        <svg
          viewBox="0 0 40 60"
          className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]"
        >
          <path
            d="M5 55L20 6L35 55H25L20 38L15 55H5Z"
            fill="#0048FF"
            stroke="#000"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Inner triangle cutout */}
          <polygon points="20,18 15,32 25,32" fill="#FFF" stroke="#000" strokeWidth="1.5" />
        </svg>
      </div>

      <span className="text-4xl md:text-6xl font-black">TION</span>
    </div>
  );
};

// 3D Isometric Ascending Staircase Steps with Neon Memphis Colors
export const IsometricStairs: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 600 240"
      className={`w-full max-w-lg pointer-events-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base Platform Yellow */}
      <polygon
        points="180,180 300,140 420,180 300,220"
        fill="#FFDE00"
        stroke="#000"
        strokeWidth="3"
      />
      <polygon points="180,180 300,220 300,235 180,195" fill="#E6C200" stroke="#000" strokeWidth="3" />
      <polygon points="300,220 420,180 420,195 300,235" fill="#CCA800" stroke="#000" strokeWidth="3" />

      {/* Left Stepped Escalation (White risers, Red & Cyan treads) */}
      {/* Step 1 Left */}
      <polygon points="30,170 120,140 180,160 90,190" fill="#FFFFFF" stroke="#000" strokeWidth="3" />
      <polygon points="30,170 90,190 90,215 30,195" fill="#FF1E27" stroke="#000" strokeWidth="3" />
      <polygon points="90,190 180,160 180,185 90,215" fill="#00F0FF" stroke="#000" strokeWidth="3" />

      {/* Step 2 Left */}
      <polygon points="60,130 150,100 210,120 120,150" fill="#FFFFFF" stroke="#000" strokeWidth="3" />
      <polygon points="60,130 120,150 120,170 60,150" fill="#FF1E27" stroke="#000" strokeWidth="3" />
      <polygon points="120,150 210,120 210,140 120,170" fill="#0048FF" stroke="#000" strokeWidth="3" />

      {/* Right Stepped Escalation (White risers, Magenta & Cyan treads) */}
      {/* Step 1 Right */}
      <polygon points="570,170 480,140 420,160 510,190" fill="#FFFFFF" stroke="#000" strokeWidth="3" />
      <polygon points="570,170 510,190 510,215 570,195" fill="#E024C3" stroke="#000" strokeWidth="3" />
      <polygon points="510,190 420,160 420,185 510,215" fill="#00F0FF" stroke="#000" strokeWidth="3" />

      {/* Step 2 Right */}
      <polygon points="540,130 450,100 390,120 480,150" fill="#FFFFFF" stroke="#000" strokeWidth="3" />
      <polygon points="540,130 480,150 480,170 540,150" fill="#E024C3" stroke="#000" strokeWidth="3" />
      <polygon points="480,150 390,120 390,140 480,170" fill="#0048FF" stroke="#000" strokeWidth="3" />
    </svg>
  );
};

// 3D Geometric Countdown Prism ("03 DAYS TO GO")
export const CountdownPrism: React.FC<{ progress?: number; days?: number }> = ({
  progress = 1,
  days = 3,
}) => {
  return (
    <div
      className="relative flex flex-col items-center justify-center select-none"
      style={{
        transform: `scale(${0.9 + 0.1 * progress})`,
        opacity: progress,
      }}
    >
      {/* Giant Cobalt Blue "03" Numerals */}
      <div className="relative flex items-center justify-center">
        <span
          className="text-8xl md:text-[140px] font-black tracking-tighter leading-none"
          style={{
            color: '#0048FF',
            WebkitTextStroke: '4px #000',
            textShadow: '8px 8px 0px #000, 14px 14px 0px rgba(0,0,0,0.2)',
          }}
        >
          {days.toString().padStart(2, '0')}
        </span>

        {/* 3D Overlapping Isometric Triangular Pyramid with "DAYS TO GO" */}
        <div
          className="absolute -bottom-4 -right-6 md:-right-8 w-32 md:w-40 h-28 md:h-36 drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          style={{
            transform: `rotate(-4deg) translateY(${(1 - progress) * 30}px)`,
          }}
        >
          <svg viewBox="0 0 140 120" className="w-full h-full">
            {/* Top red facet */}
            <polygon points="70,10 130,55 50,65" fill="#FF1E27" stroke="#000" strokeWidth="3.5" />
            {/* Left violet facet */}
            <polygon points="70,10 50,65 10,85" fill="#8B5CF6" stroke="#000" strokeWidth="3.5" />
            {/* Bottom front purple base facet */}
            <polygon points="50,65 130,55 90,110 10,85" fill="#6366F1" stroke="#000" strokeWidth="3.5" />

            {/* "DAYS TO GO" Text */}
            <text
              x="62"
              y="85"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
              transform="rotate(6, 62, 85)"
            >
              DAYS
            </text>
            <text
              x="64"
              y="100"
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              textAnchor="middle"
              transform="rotate(6, 64, 100)"
            >
              TO GO
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};
