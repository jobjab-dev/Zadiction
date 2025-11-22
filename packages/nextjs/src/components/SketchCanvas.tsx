'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function SketchCanvas({ onComplete }: { onComplete: () => void }) {
    const [startAnimation, setStartAnimation] = useState(false);
    const [revealLogo, setRevealLogo] = useState(false);

    useEffect(() => {
        // Start animation after a short delay
        const timer = setTimeout(() => {
            setStartAnimation(true);
        }, 500);

        // Reveal the actual logo image
        const revealTimer = setTimeout(() => {
            setRevealLogo(true);
        }, 2000);

        // Notify parent when animation is likely done
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 2000); // 4.5s reveal + 1s buffer

        return () => {
            clearTimeout(timer);
            clearTimeout(revealTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] mx-auto mb-8 flex items-center justify-center">
            {/* The Logo Image (Fades in) */}
            <div className={`transition-opacity duration-1000 absolute inset-0 flex items-center justify-center ${revealLogo ? 'opacity-100' : 'opacity-0'}`}>
                <Image
                    src="/logo_nobg.png"
                    alt="Zadiction Logo"
                    width={1000}
                    height={1000}
                    className="object-contain"
                    priority
                />
            </div>

            {/* Scribble Overlay Animation (Disappears when logo reveals) */}
            <svg
                viewBox="0 0 200 200"
                className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 ${revealLogo ? 'opacity-0' : 'opacity-100'}`}
            >
                {/* Paper background for the sketch area (optional) */}

                {/* The "Z" Logo Sketch */}
                <path
                    d="M 40 40 L 160 40 L 40 160 L 160 160"
                    fill="none"
                    stroke="#1A1A1A"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={startAnimation ? 'animate-draw' : ''}
                    style={{
                        strokeDasharray: 1000,
                        strokeDashoffset: 1000,
                        animationDuration: '1.5s'
                    }}
                />

                {/* Arrow White Border (Background) */}
                <path
                    d="M 30 170 L 170 30 M 130 30 L 170 30 L 170 70"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={startAnimation ? 'animate-draw' : ''}
                    style={{
                        strokeDasharray: 200,
                        strokeDashoffset: 200,
                        animationDelay: '1s',
                        animationDuration: '2s'
                    }}
                />

                {/* Arrow Black Core (Foreground) */}
                <path
                    d="M 30 170 L 170 30 M 130 30 L 170 30 L 170 70"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={startAnimation ? 'animate-draw' : ''}
                    style={{
                        strokeDasharray: 200,
                        strokeDashoffset: 200,
                        animationDelay: '1s',
                        animationDuration: '2s'
                    }}
                />
            </svg>
        </div>
    );
}
