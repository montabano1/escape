import { useState, useEffect } from 'react';
import {
  doc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface GameData {
  title: string;
  startTime: Timestamp;
  endTime: Timestamp;
  totalSolved: number;
  payments: number;
  paymentsUsed: number;
  categoryStats: {
    app: { total: number; solved: number };
    jira: { total: number; solved: number };
    api: { total: number; solved: number };
    misc: { total: number; solved: number };
  };
}

export interface Clue {
  id: number;
  type: 'app' | 'jira' | 'api' | 'misc';
  isSolved: boolean;
  answer: string | null;
  solvedBy: string | null;
  solvedAt: Timestamp | null;
  hintUnlocked: boolean;
  hiddenHint: string;
}

export interface Guess {
  id: string;
  clueId: number;
  guess: string;
  correct: boolean;
  playerName: string;
  createdAt: Timestamp;
}

const GAME_ID = 'main';

export function useGame() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [clues, setClues] = useState<Record<number, Clue>>({});
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const gameRef = doc(db, 'games', GAME_ID);
    const cluesRef = collection(db, 'games', GAME_ID, 'clues');
    const guessesRef = collection(db, 'games', GAME_ID, 'guesses');

    const unsubscribeGame = onSnapshot(
      gameRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setGameData(snapshot.data() as GameData);
          setLoading(false);
        } else {
          setError(new Error('Game not found'));
          setLoading(false);
        }
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    const unsubscribeClues = onSnapshot(
      cluesRef,
      (snapshot) => {
        const cluesMap: Record<number, Clue> = {};
        snapshot.forEach((doc) => {
          const data = doc.data() as Clue;
          cluesMap[data.id] = data;
        });
        setClues(cluesMap);
      },
      (err) => {
        setError(err);
      }
    );

    const guessesQuery = query(guessesRef, orderBy('createdAt', 'desc'), limit(25));
    const unsubscribeGuesses = onSnapshot(
      guessesQuery,
      (snapshot) => {
        const guessesList: Guess[] = [];
        snapshot.forEach((doc) => {
          guessesList.push({
            id: doc.id,
            ...doc.data(),
          } as Guess);
        });
        setGuesses(guessesList);
      },
      (err) => {
        setError(err);
      }
    );

    return () => {
      unsubscribeGame();
      unsubscribeClues();
      unsubscribeGuesses();
    };
  }, []);

  return { gameData, clues, guesses, loading, error };
}

