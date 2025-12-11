'use client';

import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { Clue } from '@/lib/useGame';
import { Timestamp } from 'firebase/firestore';

interface ClueTileProps {
  clue: Clue;
  payments: number;
  playerName: string;
  isExpired: boolean;
  onUpdate: () => void;
}

const TYPE_COLORS = {
  app: 'border-blue-500 bg-blue-500/10',
  jira: 'border-green-500 bg-green-500/10',
  api: 'border-purple-500 bg-purple-500/10',
  misc: 'border-orange-500 bg-orange-500/10',
};

const TYPE_LABELS = {
  app: 'App',
  jira: 'Jira',
  api: 'API',
  misc: 'Misc',
};

export default function ClueTile({
  clue,
  payments,
  playerName,
  isExpired,
  onUpdate,
}: ClueTileProps) {
  const [guess, setGuess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitGuess = httpsCallable(functions, 'submitGuess');
  const useHint = httpsCallable(functions, 'useHint');
  const revealSolution = httpsCallable(functions, 'revealSolution');

  const handleSubmitGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || submitting || isExpired || clue.isSolved) return;

    setSubmitting(true);
    setError(null);

    try {
      await submitGuess({
        clueId: clue.id,
        guess: guess.trim(),
        playerName,
      });
      setGuess('');
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to submit guess');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseHint = async () => {
    if (payments < 1 || submitting || isExpired || clue.hintUnlocked) return;

    setSubmitting(true);
    setError(null);

    try {
      await useHint({ clueId: clue.id, playerName });
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to unlock hint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevealSolution = async () => {
    if (payments < 3 || submitting || isExpired || clue.isSolved) return;

    setSubmitting(true);
    setError(null);

    try {
      await revealSolution({ clueId: clue.id, playerName });
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to reveal solution');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 transition-all ${
        clue.isSolved
          ? 'bg-green-900/20 border-green-500'
          : TYPE_COLORS[clue.type]
      } ${isExpired ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs font-semibold text-slate-400">#{clue.id}</span>
          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
            clue.isSolved ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'
          }`}>
            {TYPE_LABELS[clue.type]}
          </span>
        </div>
      </div>

      {clue.isSolved ? (
        <div className="space-y-2">
          <div className="bg-green-900/30 rounded p-2">
            <p className="text-green-200 font-semibold text-sm">Answer: {clue.answer}</p>
            {clue.solvedBy && (
              <p className="text-green-300/80 text-xs mt-1">Solved by: {clue.solvedBy}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {clue.hintUnlocked && (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded p-2">
              <p className="text-xs font-semibold text-yellow-200 mb-1">💡 Hint:</p>
              <p className="text-yellow-100 text-sm">{clue.hiddenHint}</p>
            </div>
          )}

          <form onSubmit={handleSubmitGuess} className="space-y-2">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter answer..."
              disabled={submitting || isExpired}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={!guess.trim() || submitting || isExpired}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>

          <div className="flex gap-2">
            <button
              onClick={handleUseHint}
              disabled={payments < 1 || submitting || isExpired || clue.hintUnlocked}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs font-medium py-1.5 rounded transition-colors"
            >
              Hint (1)
            </button>
            <button
              onClick={handleRevealSolution}
              disabled={payments < 3 || submitting || isExpired}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs font-medium py-1.5 rounded transition-colors"
            >
              Solution (3)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

