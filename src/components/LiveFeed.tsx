'use client';

import { Guess } from '@/lib/useGame';
import { formatDistanceToNow } from 'date-fns';

interface LiveFeedProps {
  guesses: Guess[];
}

export default function LiveFeed({ guesses }: LiveFeedProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Live Feed</h2>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {guesses.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No guesses yet...</p>
        ) : (
          guesses.map((guess) => (
            <div
              key={guess.id}
              className={`p-2 rounded text-sm border-l-4 ${
                guess.correct
                  ? 'bg-green-900/20 border-green-500'
                  : 'bg-slate-700/50 border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <span className="font-medium text-slate-200">{guess.playerName}</span>
                  <span className="text-slate-400 mx-2">guessed</span>
                  <span className="font-mono text-slate-300">"{guess.guess}"</span>
                  <span className="text-slate-400 mx-2">for clue #{guess.clueId}</span>
                  {guess.correct && (
                    <span className="ml-2 text-green-400 font-semibold">✓ Correct!</span>
                  )}
                </div>
                {guess.createdAt && (
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDistanceToNow(guess.createdAt.toDate(), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

