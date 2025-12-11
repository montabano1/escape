'use client';

import { useState, useEffect } from 'react';

interface NameModalProps {
  onNameSubmit: (name: string) => void;
}

export default function NameModal({ onNameSubmit }: NameModalProps) {
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('playerName');
    if (storedName) {
      onNameSubmit(storedName);
    } else {
      setIsOpen(true);
    }
  }, [onNameSubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('playerName', name.trim());
      setIsOpen(false);
      onNameSubmit(name.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Welcome to the Escape Room
        </h2>
        <p className="text-slate-300 mb-6 text-center">
          Enter your name to join the game
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
}

