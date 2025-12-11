'use client';

import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { Clue } from '@/lib/useGame';

interface ClueModalProps {
  clue: Clue;
  tokens: number;
  playerName: string;
  isExpired: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const TYPE_COLORS = {
  app: 'border-blue-500 text-blue-400',
  jira: 'border-green-500 text-green-400',
  api: 'border-purple-500 text-purple-400',
  misc: 'border-orange-500 text-orange-400',
};

export default function ClueModal({
  clue,
  tokens,
  playerName,
  isExpired,
  onClose,
  onUpdate,
}: ClueModalProps) {
  const [guess, setGuess] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Animate input appearance
    const timer = setTimeout(() => {
      setShowInput(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  if (!functions) {
    console.error('Firebase Functions not available');
    return null;
  }

  const submitGuess = httpsCallable(functions, 'submitGuess');
  const unlockHint = httpsCallable(functions, 'useHint');
  const revealAnswer = httpsCallable(functions, 'revealSolution');

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
      if (clue.isSolved) {
        setTimeout(() => onClose(), 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit guess');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseHint = async () => {
    if (submitting || isExpired || clue.hintUnlocked) return;
    // Allow even with negative tokens

    setSubmitting(true);
    setError(null);

    try {
      await unlockHint({ clueId: clue.id, playerName });
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to unlock hint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevealSolution = async () => {
    if (submitting || isExpired || clue.isSolved) return;
    // Allow even with negative tokens

    setSubmitting(true);
    setError(null);

    try {
      await revealAnswer({ clueId: clue.id, playerName });
      onUpdate();
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to reveal solution');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className={`
          bg-gradient-to-br from-slate-900 to-slate-800 
          border-2 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl
          transform transition-all duration-300
          ${showInput ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          ${TYPE_COLORS[clue.type]}
        `}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Clue #{clue.id}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {clue.isSolved ? (
          <div className="space-y-4">
            <div className="bg-green-900/30 border border-green-500 rounded p-4">
              <p className="text-green-200 font-semibold text-lg">Answer: {clue.answer}</p>
              {clue.solvedBy && (
                <p className="text-green-300/80 text-sm mt-2">Solved by: {clue.solvedBy}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {clue.hintUnlocked && (
              <div className="bg-yellow-900/30 border border-yellow-700 rounded p-4">
                <p className="text-xs font-semibold text-yellow-200 mb-2">💡 Hint:</p>
                <p className="text-yellow-100">{clue.hiddenHint}</p>
              </div>
            )}

            <div
              className={`
                transition-all duration-500 ease-out
                ${showInput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
            >
              <form onSubmit={handleSubmitGuess} className="space-y-3">
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Enter your answer..."
                  disabled={submitting || isExpired}
                  autoFocus
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={!guess.trim() || submitting || isExpired}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              </form>
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-700">
              <button
                onClick={handleUseHint}
                disabled={submitting || isExpired || clue.hintUnlocked}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-2 rounded transition-colors"
              >
                Get Hint (1 token{tokens < 1 ? ' - will go negative' : ''})
              </button>
              <button
                onClick={handleRevealSolution}
                disabled={submitting || isExpired}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-2 rounded transition-colors"
              >
                Get Answer (3 tokens{tokens < 3 ? ' - will go negative' : ''})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

