'use client';

import { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';

interface HeaderProps {
  title: string;
  endTime: Timestamp | null;
}

export default function Header({ title, endTime }: HeaderProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('--:--:--');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!endTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const end = endTime.toMillis();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <div className="flex items-center gap-4">
            <div className={`text-lg font-mono font-semibold px-4 py-2 rounded-lg ${
              isExpired
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 text-green-400'
            }`}>
              {isExpired ? 'Time is up!' : timeRemaining}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

