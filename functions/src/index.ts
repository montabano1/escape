import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Clue metadata - single source of truth for answers and types
// This ensures consistency between Cloud Functions and seed script
interface ClueMetadata {
  answer: string;
  type: "app" | "jira" | "api" | "misc";
}

const CLUE_DATA: Record<number, ClueMetadata> = {
  // App clues (1-12)
  1: {answer: "init", type: "misc"},
  2: {answer: "clown", type: "app"},
  3: {answer: "gem", type: "app"},
  4: {answer: "new", type: "misc"},
  5: {answer: "span", type: "app"},
  6: {answer: "tank", type: "app"},
  7: {answer: "duck", type: "app"},
  8: {answer: "away", type: "app"},
  9: {answer: "crop", type: "misc"},
  10: {answer: "huge", type: "app"},
  11: {answer: "pass", type: "app"},
  12: {answer: "pick", type: "app"},

  // Jira clues (13-25)
  13: {answer: "sweet", type: "app"},
  14: {answer: "marker", type: "app"},
  15: {answer: "lower", type: "app"},
  16: {answer: "horse", type: "app"},
  17: {answer: "catch", type: "misc"},
  18: {answer: "early", type: "app"},
  19: {answer: "green", type: "app"},
  20: {answer: "bull", type: "app"},
  21: {answer: "black", type: "app"},
  22: {answer: "seek", type: "app"},
  23: {answer: "goat", type: "app"},
  24: {answer: "par", type: "app"},
  25: {answer: "sport", type: "misc"},

  // API clues (26-37)
  26: {answer: "gold", type: "app"},
  27: {answer: "play", type: "app"},
  28: {answer: "spine", type: "api"},
  29: {answer: "bulb", type: "api"},
  30: {answer: "rock", type: "api"},
  31: {answer: "doll", type: "api"},
  32: {answer: "jumble", type: "api"},
  33: {answer: "warm", type: "api"},
  34: {answer: "brain", type: "api"},
  35: {answer: "crane", type: "api"},
  36: {answer: "pillow", type: "api"},
  37: {answer: "submit", type: "jira"},

  // Misc clues (38-50)
  38: {answer: "update", type: "jira"},
  39: {answer: "bottom", type: "jira"},
  40: {answer: "emit", type: "jira"},
  41: {answer: "crawl", type: "misc"},
  42: {answer: "toad", type: "misc"},
  43: {answer: "mate", type: "api"},
  44: {answer: "let", type: "misc"},
  45: {answer: "title", type: "api"},
  46: {answer: "steak", type: "misc"},
  47: {answer: "true", type: "misc"},
  48: {answer: "topic", type: "misc"},
  49: {answer: "peer", type: "misc"},
  50: {answer: "assemble", type: "misc"},
};

const GAME_ID = "main";

// Helper function to award payments
async function awardPayments(gameRef: admin.firestore.DocumentReference) {
  const gameDoc = await gameRef.get();
  if (!gameDoc.exists) return;

  const gameData = gameDoc.data()!;
  const totalSolved = gameData.totalSolved || 0;
  const categoryStats = gameData.categoryStats || {};
  let payments = gameData.payments || 0;
  const updates: any = {};

  // Award payment every 10 clues solved
  if (totalSolved > 0 && totalSolved % 10 === 0) {
    // Check if we already awarded for this milestone
    const previousTotal = (gameData.previousTotalSolved || 0);
    const milestone = Math.floor(totalSolved / 10);
    const previousMilestone = Math.floor(previousTotal / 10);

    if (milestone > previousMilestone) {
      payments += 1;
      updates.previousTotalSolved = totalSolved;
    }
  }

  // Award payment for completing a category
  const categories = ["app", "jira", "api", "misc"] as const;
  const completedCategories = [...(gameData.completedCategories || [])];

  for (const category of categories) {
    const stats = categoryStats[category] || {total: 0, solved: 0};
    if (stats.total > 0 && stats.solved === stats.total) {
      if (!completedCategories.includes(category)) {
        payments += 1;
        completedCategories.push(category);
      }
    }
  }

  if (completedCategories.length > (gameData.completedCategories || []).length) {
    updates.completedCategories = completedCategories;
  }

  if (Object.keys(updates).length > 0 || payments !== (gameData.payments || 0)) {
    updates.payments = payments;
    await gameRef.update(updates);
  }
}

// Function 1: submitGuess
export const submitGuess = functions.https.onCall(async (data, _context) => {
  const {clueId, guess, playerName} = data;

  if (!clueId || !guess || !playerName) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
  }

  const normalizedGuess = guess.toLowerCase().trim();
  const clueMetadata = CLUE_DATA[clueId];

  if (!clueMetadata) {
    throw new functions.https.HttpsError("not-found", "Clue not found");
  }

  const correctAnswer = clueMetadata.answer;
  const expectedType = clueMetadata.type;

  const gameRef = db.collection("games").doc(GAME_ID);
  const clueRef = gameRef.collection("clues").doc(clueId.toString());
  const guessesRef = gameRef.collection("guesses");

  const clueDoc = await clueRef.get();
  if (!clueDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Clue document not found");
  }

  const clueData = clueDoc.data()!;

  // Check if already solved
  if (clueData.isSolved) {
    // Still log the guess
    await guessesRef.add({
      clueId,
      guess: normalizedGuess,
      correct: false,
      playerName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return {correct: false, alreadySolved: true};
  }

  const isCorrect = normalizedGuess === correctAnswer.toLowerCase();

  // Log the guess
  await guessesRef.add({
    clueId,
    guess: normalizedGuess,
    correct: isCorrect,
    playerName,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Get current game data for payment updates
  const gameDoc = await gameRef.get();
  const gameData = gameDoc.data()!;
  let payments = gameData.payments || 0;

  if (isCorrect) {
    // Update clue as solved
    await clueRef.update({
      isSolved: true,
      answer: correctAnswer,
      solvedBy: playerName,
      solvedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update game stats
    const totalSolved = (gameData.totalSolved || 0) + 1;
    const categoryStats = gameData.categoryStats || {};

    // Use type from CLUE_DATA as source of truth, but validate against Firestore
    const clueType = expectedType;
    const firestoreType = clueData.type as "app" | "jira" | "api" | "misc";

    // Validate type matches (optional check, but good for debugging)
    if (clueType !== firestoreType) {
      console.warn(`Type mismatch for clue ${clueId}: CLUE_DATA says ${clueType}, Firestore says ${firestoreType}`);
    }

    if (categoryStats[clueType]) {
      categoryStats[clueType].solved = (categoryStats[clueType].solved || 0) + 1;
    }

    await gameRef.update({
      totalSolved,
      categoryStats,
    });

    // Award payments (this may increase payments)
    await awardPayments(gameRef);

    return {correct: true};
  }

  // Wrong answer: deduct 1 token (can go negative)
  payments = payments - 1;
  await gameRef.update({
    payments,
  });

  return {correct: false};
});

// Function 2: useHint
export const useHint = functions.https.onCall(async (data, _context) => {
  const {clueId, playerName} = data;

  if (!clueId || !playerName) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
  }

  const gameRef = db.collection("games").doc(GAME_ID);
  const clueRef = gameRef.collection("clues").doc(clueId.toString());

  const gameDoc = await gameRef.get();
  if (!gameDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Game not found");
  }

  const gameData = gameDoc.data()!;
  const payments = gameData.payments || 0;

  // Allow negative tokens - no restriction

  const clueDoc = await clueRef.get();
  if (!clueDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Clue not found");
  }

  const clueData = clueDoc.data()!;
  if (clueData.hintUnlocked) {
    return {success: true, alreadyUnlocked: true};
  }

  // Decrement payments and unlock hint
  await Promise.all([
    gameRef.update({
      payments: payments - 1,
      paymentsUsed: (gameData.paymentsUsed || 0) + 1,
    }),
    clueRef.update({
      hintUnlocked: true,
    }),
  ]);

  return {success: true};
});

// Function 3: revealSolution
export const revealSolution = functions.https.onCall(async (data, _context) => {
  const {clueId, playerName} = data;

  if (!clueId || !playerName) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
  }

  const gameRef = db.collection("games").doc(GAME_ID);
  const clueRef = gameRef.collection("clues").doc(clueId.toString());

  const gameDoc = await gameRef.get();
  if (!gameDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Game not found");
  }

  const gameData = gameDoc.data()!;
  const payments = gameData.payments || 0;

  // Allow negative tokens - no restriction

  const clueDoc = await clueRef.get();
  if (!clueDoc.exists) {
    throw new functions.https.HttpsError("not-found", "Clue not found");
  }

  const clueData = clueDoc.data()!;
  if (clueData.isSolved) {
    return {success: true, alreadySolved: true};
  }

  const clueMetadata = CLUE_DATA[clueId];
  if (!clueMetadata) {
    throw new functions.https.HttpsError("not-found", "Clue not found");
  }

  const answer = clueMetadata.answer;
  const expectedType = clueMetadata.type;

  // Decrement 3 payments and mark as solved
  await Promise.all([
    gameRef.update({
      payments: payments - 3,
      paymentsUsed: (gameData.paymentsUsed || 0) + 3,
    }),
    clueRef.update({
      isSolved: true,
      answer: answer,
      solvedBy: playerName,
      solvedAt: admin.firestore.FieldValue.serverTimestamp(),
      hintUnlocked: true, // Also unlock hint when revealing solution
    }),
  ]);

  // Update game stats
  const totalSolved = (gameData.totalSolved || 0) + 1;
  const categoryStats = gameData.categoryStats || {};

  // Use type from CLUE_DATA as source of truth
  const clueType = expectedType;
  const firestoreType = clueData.type as "app" | "jira" | "api" | "misc";

  // Validate type matches (optional check, but good for debugging)
  if (clueType !== firestoreType) {
    console.warn(`Type mismatch for clue ${clueId}: CLUE_DATA says ${clueType}, Firestore says ${firestoreType}`);
  }

  if (categoryStats[clueType]) {
    categoryStats[clueType].solved = (categoryStats[clueType].solved || 0) + 1;
  }

  await gameRef.update({
    totalSolved,
    categoryStats,
  });

  // Award payments
  await awardPayments(gameRef);

  return {success: true};
});

