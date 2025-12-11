'use client';

import { useState } from 'react';
import { Clue } from '@/lib/useGame';
import { Timestamp } from 'firebase/firestore';
import ClueModal from './ClueModal';

interface ClueGridProps {
  clues: Record<number, Clue>;
  tokens: number;
  playerName: string;
  endTime: Timestamp | null;
  onUpdate: () => void;
}

export default function ClueGrid({
  clues,
  tokens,
  playerName,
  endTime,
  onUpdate,
}: ClueGridProps) {
  const [selectedClueId, setSelectedClueId] = useState<number | null>(null);
  const [clickedId, setClickedId] = useState<number | null>(null);
  const isExpired = endTime ? endTime.toMillis() <= Date.now() : false;

  // Create 10x5 grid (50 clues)
  const grid = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 10; col++) {
      const clueId = row * 10 + col + 1;
      grid.push(clueId);
    }
  }

  const handleCircleClick = (clueId: number) => {
    if (isExpired) return;
    setClickedId(clueId);
    setTimeout(() => {
      setSelectedClueId(clueId);
      setClickedId(null);
    }, 300); // Animation duration
  };

  const handleCloseModal = () => {
    setSelectedClueId(null);
    onUpdate();
  };

  const getClueStatus = (clueId: number) => {
    const clue = clues[clueId];
    if (!clue) return 'unknown';
    if (clue.isSolved) return 'solved';
    return 'unsolved';
  };

  const getClueType = (clueId: number) => {
    return clues[clueId]?.type || 'misc';
  };

  const TYPE_COLORS = {
    app: 'bg-blue-500',
    jira: 'bg-green-500',
    api: 'bg-purple-500',
    misc: 'bg-orange-500',
  };

  return (
    <>
      <div className="mb-6">
        <div className="grid grid-cols-10 gap-3 max-w-4xl mx-auto">
          {grid.map((clueId) => {
            const status = getClueStatus(clueId);
            const type = getClueType(clueId);
            const isClicked = clickedId === clueId;
            const clue = clues[clueId];

            return (
              <button
                key={clueId}
                onClick={() => handleCircleClick(clueId)}
                disabled={isExpired || !clue}
                className={`
                  aspect-square rounded-full 
                  flex items-center justify-center
                  font-bold text-white
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${isClicked ? 'scale-150 z-50' : 'scale-100'}
                  ${
                    status === 'solved'
                      ? 'bg-green-600 hover:bg-green-700'
                      : status === 'unknown'
                      ? 'bg-slate-700 opacity-30'
                      : `bg-slate-800 hover:bg-slate-700 border-2 ${TYPE_COLORS[type as keyof typeof TYPE_COLORS]} border-opacity-50`
                  }
                `}
                style={{
                  transform: isClicked ? 'scale(1.5)' : 'scale(1)',
                }}
              >
                <span className={`${isClicked ? 'text-2xl' : 'text-lg'}`}>
                  {clueId}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedClueId && clues[selectedClueId] && (
        <ClueModal
          clue={clues[selectedClueId]}
          tokens={tokens}
          playerName={playerName}
          isExpired={isExpired}
          onClose={handleCloseModal}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
