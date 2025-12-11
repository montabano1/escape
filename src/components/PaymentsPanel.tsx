'use client';

import { GameData } from '@/lib/useGame';

interface TokensPanelProps {
  gameData: GameData | null;
}

export default function TokensPanel({ gameData }: TokensPanelProps) {
  const tokens = gameData?.payments || 0;
  const isNegative = tokens < 0;

  return (
    <div className={`bg-gradient-to-br ${isNegative ? 'from-red-900/50 to-red-800/50 border-red-700' : 'from-yellow-900/50 to-yellow-800/50 border-yellow-700'} border rounded-lg p-4 mb-6`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-semibold mb-1 ${isNegative ? 'text-red-200' : 'text-yellow-200'}`}>Tokens</h2>
          <p className={`text-sm ${isNegative ? 'text-red-300/80' : 'text-yellow-300/80'}`}>
            Available: <span className={`font-bold text-xl ${isNegative ? 'text-red-200' : 'text-yellow-200'}`}>{tokens}</span>
          </p>
        </div>
        <div className="text-right">
          <p className={`text-xs mb-1 ${isNegative ? 'text-red-300/60' : 'text-yellow-300/60'}`}>Costs:</p>
          <p className={`text-sm ${isNegative ? 'text-red-200' : 'text-yellow-200'}`}>
            Hint: <span className="font-bold">1</span> | Answer: <span className="font-bold">3</span>
          </p>
        </div>
      </div>
      {tokens === 0 && (
        <p className={`text-xs mt-2 ${isNegative ? 'text-red-300/60' : 'text-yellow-300/60'}`}>
          Solve clues to earn tokens! (Every 10 clues = +1 token, Complete category = +1 token)
        </p>
      )}
      {isNegative && (
        <p className="text-xs text-red-300/80 mt-2">
          ⚠️ Wrong answers cost 1 token. Solve clues to earn tokens back!
        </p>
      )}
    </div>
  );
}
