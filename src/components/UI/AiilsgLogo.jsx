/**
 * AIILSG Logo Component
 * SVG representation of the All India Institute of Local Self Government branding.
 * Established 1926 – one of India's oldest institutions in local governance.
 */
export default function AiilsgLogo({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="AIILSG Logo"
      role="img"
    >
      {/* Circular gradient background */}
      <defs>
        <linearGradient id="aiilsg-bg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
        <linearGradient id="aiilsg-shine" x1="0" y1="0" x2="80" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background rounded square */}
      <rect width="80" height="80" rx="18" fill="url(#aiilsg-bg)" />
      {/* Shine overlay */}
      <rect width="80" height="40" rx="18" fill="url(#aiilsg-shine)" />

      {/* Pillars / building silhouette representing local governance */}
      {/* Base platform */}
      <rect x="10" y="58" width="60" height="5" rx="2" fill="white" opacity="0.9" />
      {/* Left pillar */}
      <rect x="14" y="34" width="8" height="24" rx="1.5" fill="white" opacity="0.85" />
      {/* Centre-left pillar */}
      <rect x="28" y="28" width="8" height="30" rx="1.5" fill="white" opacity="0.95" />
      {/* Centre-right pillar */}
      <rect x="44" y="28" width="8" height="30" rx="1.5" fill="white" opacity="0.95" />
      {/* Right pillar */}
      <rect x="58" y="34" width="8" height="24" rx="1.5" fill="white" opacity="0.85" />

      {/* Roof / pediment triangle */}
      <polygon points="40,12 12,32 68,32" fill="white" opacity="0.9" />

      {/* Flag / star at top */}
      <circle cx="40" cy="11" r="3.5" fill="white" opacity="1" />

      {/* "1926" text strip at bottom – founding year */}
      <rect x="20" y="65" width="40" height="10" rx="5" fill="white" opacity="0.15" />
      <text
        x="40"
        y="73"
        textAnchor="middle"
        fontSize="6"
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        fill="white"
        opacity="0.9"
        letterSpacing="1"
      >
        EST. 1926
      </text>
    </svg>
  )
}
