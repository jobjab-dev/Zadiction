'use client';

import { useState, useEffect } from 'react';
import { EncryptedText } from './EncryptedText';

interface LuckyNumber {
    id: string;
    timestamp: number;
    handle: string;
    inputProof: string;
    label: string; // Optional label like "Grandma's Birthday"
}

interface LuckyNumberVaultProps {
    onSelectNumber: (decryptedNumber: number) => void;
    contractAddress: string;
    userAddress: string;
}

export function LuckyNumberVault({ onSelectNumber, contractAddress, userAddress }: LuckyNumberVaultProps) {
    const [savedNumbers, setSavedNumbers] = useState<LuckyNumber[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState('');

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem(`lucky_numbers_${userAddress}`);
        if (saved) {
            try {
                setSavedNumbers(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load lucky numbers', e);
            }
        }
    }, [userAddress]);

    // Simple obfuscation for demo purposes (since we can't use FHE to decrypt back to client easily)
    const simpleEncrypt = (val: string) => btoa(val.split('').reverse().join(''));
    const simpleDecrypt = (val: string) => atob(val).split('').reverse().join('');

    const handleAdd = (val: string) => {
        const newNumber: LuckyNumber = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            handle: simpleEncrypt(val), // Store obfuscated
            inputProof: '',
            label: newLabel || `Lucky #${savedNumbers.length + 1}`
        };
        const updated = [...savedNumbers, newNumber];
        setSavedNumbers(updated);
        localStorage.setItem(`lucky_numbers_${userAddress}`, JSON.stringify(updated));
        setIsAdding(false);
        setNewLabel('');
    };

    const deleteNumber = (id: string) => {
        const updated = savedNumbers.filter(n => n.id !== id);
        setSavedNumbers(updated);
        localStorage.setItem(`lucky_numbers_${userAddress}`, JSON.stringify(updated));
    };

    return (
        <div className="card-sketch bg-white p-4 mt-6 transform rotate-1">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                    <span>🔐</span>
                    <EncryptedText text="Lucky Vault" hoverOnly={false} />
                </h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn-sketch-sm"
                >
                    {isAdding ? 'Cancel' : '+ Add Number'}
                </button>
            </div>

            {isAdding && (
                <div className="mb-4 p-4 border-2 border-dashed border-ink/20 rounded bg-gray-50">
                    <div className="mb-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Label (Optional)</label>
                        <input
                            type="text"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className="input-sketch w-full mb-2"
                            placeholder="e.g. My Birthday"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Number</label>
                        {/* We use a standard input here because we need the raw value to store for the plaintext contract */}
                        <input
                            type="number"
                            onChange={(e) => {
                                // We'll handle the add on button click
                            }}
                            id="new-lucky-number"
                            className="input-sketch w-full"
                            placeholder="123"
                        />
                    </div>
                    <button
                        onClick={() => {
                            const el = document.getElementById('new-lucky-number') as HTMLInputElement;
                            if (el.value) handleAdd(el.value);
                        }}
                        className="btn-sketch-primary w-full"
                    >
                        Encrypt & Save
                    </button>
                </div>
            )}

            <div className="space-y-2">
                {savedNumbers.length === 0 && !isAdding && (
                    <p className="text-center text-gray-400 italic py-4">Vault is empty</p>
                )}

                {savedNumbers.map(num => (
                    <div key={num.id} className="flex items-center justify-between p-2 hover:bg-yellow-50 rounded border-b border-gray-100">
                        <div>
                            <div className="font-bold text-ink text-sm">{num.label}</div>
                            <div className="text-xs text-gray-400 font-mono">
                                {/* Show encrypted view */}
                                <EncryptedText text={'*'.repeat(simpleDecrypt(num.handle).length)} hoverOnly={false} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onSelectNumber(Number(simpleDecrypt(num.handle)))}
                                className="px-2 py-1 bg-marker-yellow text-ink text-xs font-bold rounded border border-ink hover:shadow-md transition-all"
                            >
                                Use
                            </button>
                            <button
                                onClick={() => deleteNumber(num.id)}
                                className="text-red-400 hover:text-red-600"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
