'use client';

import { useState, useEffect, useRef } from 'react';

interface EncryptedTextProps {
    text: string;
    className?: string;
    hoverOnly?: boolean;
    animateOnView?: boolean;
}

const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function EncryptedText({ text, className = '', hoverOnly = true, animateOnView = false }: EncryptedTextProps) {
    const [displayText, setDisplayText] = useState(text);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isHovering, setIsHovering] = useState(false);
    const elementRef = useRef<HTMLSpanElement>(null);
    const hasAnimatedRef = useRef(false);

    const scramble = () => {
        let iteration = -10; // Start with a scramble-only phase

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setDisplayText(prev =>
                text
                    .split('')
                    .map((char, index) => {
                        // During scramble phase (iteration < 0), show all random
                        if (iteration < 0) {
                            return CHARS[Math.floor(Math.random() * CHARS.length)];
                        }

                        // During reveal phase
                        if (index < iteration) {
                            return text[index];
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join('')
            );

            if (iteration >= text.length) {
                if (intervalRef.current) clearInterval(intervalRef.current);
            }

            iteration += 1 / 2; // Slightly faster reveal
        }, 10);
    };

    const handleMouseEnter = () => {
        if (hoverOnly) {
            setIsHovering(true);
            scramble();
        }
    };

    const handleMouseLeave = () => {
        if (hoverOnly) {
            setIsHovering(false);
            setDisplayText(text);
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    };

    useEffect(() => {
        // If not hoverOnly and not animateOnView, animate immediately on mount
        if (!hoverOnly && !animateOnView) {
            scramble();
        }

        // Setup IntersectionObserver if animateOnView is true
        if (animateOnView && elementRef.current) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting && !hasAnimatedRef.current) {
                            hasAnimatedRef.current = true;
                            scramble();
                        }
                    });
                },
                { threshold: 0.1 } // Trigger when 10% visible
            );

            observer.observe(elementRef.current);

            return () => {
                if (elementRef.current) observer.unobserve(elementRef.current);
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [text, hoverOnly, animateOnView]);

    return (
        <span
            ref={elementRef}
            className={`${className} break-all`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {displayText}
        </span>
    );
}
