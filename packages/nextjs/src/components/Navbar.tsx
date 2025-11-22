'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SketchMenu, SketchClose } from './SketchIcons';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="border-b-2 border-ink bg-paper sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between relative">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group z-50 relative">
                    <div className="w-10 h-10 border-2 border-ink rounded-lg flex items-center justify-center bg-white group-hover:-rotate-3 transition-transform overflow-hidden p-1">
                        <Image
                            src="/logo_nobg.png"
                            alt="Zadiction Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    </div>
                    <span className="font-bold text-xl tracking-tight">Zadiction</span>
                </Link>

                {/* Desktop Links - Absolute Center */}
                <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Link href="/markets" className="font-bold hover:text-ink-light hover:underline decoration-wavy decoration-marker-yellowSolid">
                        Markets
                    </Link>
                    <Link href="/dashboard" className="font-bold hover:text-ink-light hover:underline decoration-wavy decoration-marker-yellowSolid">
                        Dashboard
                    </Link>
                    <Link href="/how-it-works" className="font-bold hover:text-ink-light hover:underline decoration-wavy decoration-marker-yellowSolid">
                        How It Works
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden z-50 relative p-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? (
                        <SketchClose className="w-8 h-8 text-ink" />
                    ) : (
                        <SketchMenu className="w-8 h-8 text-ink" />
                    )}
                </button>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-paper z-40 flex flex-col items-center justify-center gap-8 md:hidden animate-in fade-in slide-in-from-top-10 duration-200">
                        <Link
                            href="/markets"
                            className="text-2xl font-bold hover:text-ink-light"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Markets
                        </Link>
                        <Link
                            href="/dashboard"
                            className="text-2xl font-bold hover:text-ink-light"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/how-it-works"
                            className="text-2xl font-bold hover:text-ink-light"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            How It Works
                        </Link>
                        <div className="mt-8">
                            <ConnectButton showBalance={false} />
                        </div>
                    </div>
                )}

                {/* Desktop Wallet */}
                <div className="hidden md:block">
                    <ConnectButton
                        showBalance={false}
                        accountStatus={{
                            smallScreen: 'avatar',
                            largeScreen: 'full',
                        }}
                    />
                </div>
            </div>
        </nav>
    );
}

