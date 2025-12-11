'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/lib/useGame';
import NameModal from '@/components/NameModal';
import Header from '@/components/Header';
import CategoryStatus from '@/components/CategoryStatus';
import PaymentsPanel from '@/components/PaymentsPanel';
import ClueGrid from '@/components/ClueGrid';
import LiveFeed from '@/components/LiveFeed';

export default function Home() {
  const { gameData, clues, guesses, loading, error } = useGame();
  const [playerName, setPlayerName] = useState<string>('');
  const [updateKey, setUpdateKey] = useState(0);

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
  };

  const handleUpdate = () => {
    setUpdateKey((prev) => prev + 1);
  };

  const isExpired = gameData?.endTime
    ? gameData.endTime.toMillis() <= Date.now()
    : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-slate-300">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Error loading game</p>
          <p className="text-slate-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NameModal onNameSubmit={handleNameSubmit} />

      {playerName && gameData && (
        <>
          <Header title={gameData.title} endTime={gameData.endTime} />

          <main className="container mx-auto px-4 py-6">
            {isExpired && (
              <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 text-center">
                <p className="text-red-200 font-semibold text-lg">⏰ Time is up! The game has ended.</p>
              </div>
            )}

            <CategoryStatus gameData={gameData} isExpired={isExpired} />
            <PaymentsPanel gameData={gameData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ClueGrid
                  clues={clues}
                  tokens={gameData.payments}
                  playerName={playerName}
                  endTime={gameData.endTime}
                  onUpdate={handleUpdate}
                />
              </div>
              <div>
                <LiveFeed guesses={guesses} />
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}

