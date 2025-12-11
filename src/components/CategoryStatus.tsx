'use client';

import { GameData } from '@/lib/useGame';

interface CategoryStatusProps {
  gameData: GameData | null;
  isExpired: boolean;
}

// Map categories to their final answer digits
const CATEGORY_CONFIG = {
  app: {
    color: '#3b82f6', // blue-500
    image: '/images/app-icon.png',
    emoji: '📱',
    finalDigit: '4', // When complete, shows "4"
  },
  jira: {
    color: '#10b981', // green-500
    image: '/images/jira-icon.png',
    emoji: '🎯',
    finalDigit: '6', // When complete, shows "6"
  },
  api: {
    color: '#a855f7', // purple-500
    image: '/images/api-icon.png',
    emoji: '🔌',
    finalDigit: '2', // When complete, shows "2"
  },
  misc: {
    color: '#f97316', // orange-500
    image: '/images/misc-icon.png',
    emoji: '🎲',
    finalDigit: '7', // When complete, shows "7"
  },
};

export default function CategoryStatus({ gameData, isExpired }: CategoryStatusProps) {
  if (!gameData) return null;

  // Always display in order: app (4), jira (6), api (2), misc (7) = 4627
  const categoryOrder: ('app' | 'jira' | 'api' | 'misc')[] = ['app', 'jira', 'api', 'misc'];

  return (
    <div className="flex justify-center gap-8 mb-8">
      {categoryOrder.map((type) => {
        const stats = gameData.categoryStats[type];
        const config = CATEGORY_CONFIG[type];
        // Calculate progress: each clue fills 360/total degrees
        // Don't show total count to users
        const progress = stats.total > 0 ? (stats.solved / stats.total) * 100 : 0;
        const circumference = 2 * Math.PI * 45; // radius = 45
        const offset = circumference - (progress / 100) * circumference;
        const isComplete = stats.total > 0 && stats.solved === stats.total;

        return (
          <div key={type} className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              {/* SVG Circle Progress */}
              <svg className="transform -rotate-90 w-24 h-24">
                {/* Background circle */}
                <circle
                  cx="48"
                  cy="48"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-slate-700"
                />
                {/* Progress circle */}
                <circle
                  cx="48"
                  cy="48"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-500 ease-out"
                  style={{ color: config.color }}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Category Icon or Final Digit */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isComplete ? (
                  <span 
                    className="text-5xl font-bold"
                    style={{ color: config.color }}
                  >
                    {config.finalDigit}
                  </span>
                ) : (
                  <span className="text-4xl">{config.emoji}</span>
                )}
              </div>
            </div>
            {/* No label shown */}
          </div>
        );
      })}
    </div>
  );
}
