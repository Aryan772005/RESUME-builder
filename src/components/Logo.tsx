import React from 'react';

/**
 * Premium SVG logo for Tariani's Resume Builder.
 * A geometric "T" monogram fused with a document silhouette,
 * rendered with a purple→cyan gradient.
 */
export function Logo({ size = 40 }: { size?: number }) {
  const id = 'logo-grad';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Tariani Resume Logo"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>

      {/* Document body with folded corner */}
      <path
        d="M10 4h20l8 8v32H10V4z"
        fill={`url(#${id})`}
        opacity="0.18"
        rx="3"
      />
      <path
        d="M10 4h20l8 8v32H10V4z"
        stroke={`url(#${id})`}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Folded corner crease */}
      <path
        d="M30 4v8h8"
        stroke={`url(#${id})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />

      {/* Bold "T" monogram centered on document */}
      {/* Horizontal bar */}
      <rect x="14" y="17" width="20" height="4" rx="2" fill={`url(#${id})`} />
      {/* Vertical stem */}
      <rect x="21" y="21" width="6" height="14" rx="2" fill={`url(#${id})`} />

      {/* Subtle horizontal lines suggesting resume content */}
      <line x1="14" y1="38" x2="28" y2="38" stroke={`url(#${id})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

/**
 * Full wordmark: Logo icon + brand name text
 */
export function LogoWordmark({ iconSize = 40 }: { iconSize?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <Logo size={iconSize} />
      <span
        style={{
          fontSize: iconSize * 0.5,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          background: 'linear-gradient(135deg, #fff 0%, #a78bfa 50%, #22d3ee 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Tariani's <span style={{ fontWeight: 400, opacity: 0.9 }}>Resume</span>
      </span>
    </span>
  );
}
