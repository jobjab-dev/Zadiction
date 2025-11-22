import React from 'react';

interface IconProps {
    className?: string;
}

export const SketchScale = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* Base */}
        <path d="M20 90 L80 90 M50 90 L50 20" />
        {/* Beam */}
        <path d="M20 30 L80 40" />
        {/* Left Pan */}
        <path d="M20 30 L10 50 L30 50 L20 30" />
        {/* Right Pan */}
        <path d="M80 40 L70 60 L90 60 L80 40" />
    </svg>
);

export const SketchShield = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 10 L90 30 V50 C90 75 50 90 50 90 C50 90 10 75 10 50 V30 L50 10 Z" />
        <path d="M30 45 L45 60 L70 35" />
    </svg>
);

export const SketchSearch = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="45" cy="45" r="25" />
        <path d="M65 65 L85 85" />
        <path d="M35 45 L55 45 M45 35 L45 55" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
);

export const SketchCreate = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {/* Document */}
        <path d="M30 10 L70 10 L70 90 L30 90 Z" />
        <path d="M40 30 L60 30 M40 50 L60 50 M40 70 L60 70" />
        {/* Pen */}
        <path d="M75 75 L85 65 L95 75 L85 85 Z" />
        <path d="M75 75 L65 85" />
    </svg>
);

export const SketchGrid = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="20" y="20" width="60" height="60" rx="5" />
        <path d="M40 20 L40 80 M60 20 L60 80" />
        <path d="M20 40 L80 40 M20 60 L80 60" />
        {/* Selection Circle */}
        <circle cx="70" cy="70" r="8" className="text-marker-yellow" strokeWidth="4" />
    </svg>
);

export const SketchTrophy = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 20 L70 20 L60 60 C60 70 40 70 40 60 L30 20 Z" />
        <path d="M30 25 C10 25 10 45 35 45" />
        <path d="M70 25 C90 25 90 45 65 45" />
        <path d="M50 70 L50 85 M30 85 L70 85" />
        {/* Stars */}
        <path d="M50 10 L50 5 M20 10 L15 5 M80 10 L85 5" strokeWidth="2" />
    </svg>
);

export const SketchSparkles = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 10 L55 35 L80 40 L55 45 L50 70 L45 45 L20 40 L45 35 Z" />
        <path d="M80 10 L82 20 L92 22 L82 24 L80 34 L78 24 L68 22 L78 20 Z" />
        <path d="M20 70 L22 80 L32 82 L22 84 L20 94 L18 84 L8 82 L18 80 Z" />
    </svg>
);

export const SketchBook = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 20 C20 20 35 25 50 20 C65 25 80 20 80 20 V80 C80 80 65 85 50 80 C35 85 20 80 20 80 Z" />
        <path d="M50 20 V80" />
        <path d="M25 30 C35 33 45 30 45 30" />
        <path d="M25 40 C35 43 45 40 45 40" />
        <path d="M25 50 C35 53 45 50 45 50" />
        <path d="M55 30 C65 33 75 30 75 30" />
        <path d="M55 40 C65 43 75 40 75 40" />
        <path d="M55 50 C65 53 75 50 75 50" />
    </svg>
);

export const SketchMath = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="15" y="15" width="70" height="70" rx="5" />
        <path d="M25 30 H75" />
        <path d="M25 45 H40 M50 45 H65 M75 45 H75" />
        <path d="M25 60 H40 M50 60 H65 M75 60 H75" />
        <path d="M25 75 H40 M50 75 H65 M75 75 H75" />
    </svg>
);

export const SketchChart = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 90 L90 90" />
        <path d="M10 10 L10 90" />
        <path d="M20 80 L35 50 L50 70 L65 30 L85 10" />
        <circle cx="20" cy="80" r="2" fill="currentColor" />
        <circle cx="35" cy="50" r="2" fill="currentColor" />
        <circle cx="50" cy="70" r="2" fill="currentColor" />
        <circle cx="65" cy="30" r="2" fill="currentColor" />
        <circle cx="85" cy="10" r="2" fill="currentColor" />
    </svg>
);

export const SketchBulb = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M35 55 C35 30 65 30 65 55 C65 65 55 70 55 75 L45 75 C45 70 35 65 35 55 Z" />
        <path d="M45 75 L45 85 L55 85 L55 75" />
        <path d="M42 90 L58 90" />
        <path d="M50 35 L50 45" />
        <path d="M50 15 L50 25" />
        <path d="M20 35 L28 40" />
        <path d="M80 35 L72 40" />
    </svg>
);

export const SketchDice = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="20" y="20" width="60" height="60" rx="10" />
        <circle cx="35" cy="35" r="5" fill="currentColor" />
        <circle cx="65" cy="35" r="5" fill="currentColor" />
        <circle cx="35" cy="65" r="5" fill="currentColor" />
        <circle cx="65" cy="65" r="5" fill="currentColor" />
    </svg>
);

export const SketchHourglass = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M25 15 L75 15 L65 45 L75 85 L25 85 L35 45 L25 15 Z" />
        <path d="M25 15 L75 15" />
        <path d="M25 85 L75 85" />
        <path d="M35 45 L65 45" />
        <path d="M45 55 L55 55 L50 65 Z" fill="currentColor" />
    </svg>
);

export const SketchMoneyBag = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M25 35 C25 35 20 90 50 90 C80 90 75 35 75 35 L65 20 L35 20 L25 35 Z" />
        <path d="M40 20 L35 10 L65 10 L60 20" />
        <path d="M30 35 L70 35" />
        <circle cx="50" cy="60" r="10" />
        <path d="M50 55 V65" />
        <path d="M48 55 H52 M48 65 H52" />
    </svg>
);

export const SketchMenu = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 30 L80 30" />
        <path d="M20 50 L80 50" />
        <path d="M20 70 L80 70" />
    </svg>
);

export const SketchClose = ({ className = "w-24 h-24" }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M25 25 L75 75" />
        <path d="M75 25 L25 75" />
    </svg>
);
