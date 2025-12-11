"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revealSolution = exports.useHint = exports.submitGuess = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const CLUE_DATA = {
    // App clues (1-12)
    1: { answer: "deploy", type: "app" },
    2: { answer: "endpoint", type: "app" },
    3: { answer: "jira", type: "app" },
    4: { answer: "database", type: "app" },
    5: { answer: "api", type: "app" },
    6: { answer: "server", type: "app" },
    7: { answer: "client", type: "app" },
    8: { answer: "frontend", type: "app" },
    9: { answer: "backend", type: "app" },
    10: { answer: "code", type: "app" },
    11: { answer: "function", type: "app" },
    12: { answer: "variable", type: "app" },
    // Jira clues (13-25)
    13: { answer: "array", type: "jira" },
    14: { answer: "object", type: "jira" },
    15: { answer: "string", type: "jira" },
    16: { answer: "number", type: "jira" },
    17: { answer: "boolean", type: "jira" },
    18: { answer: "null", type: "jira" },
    19: { answer: "undefined", type: "jira" },
    20: { answer: "async", type: "jira" },
    21: { answer: "await", type: "jira" },
    22: { answer: "promise", type: "jira" },
    23: { answer: "callback", type: "jira" },
    24: { answer: "error", type: "jira" },
    25: { answer: "exception", type: "jira" },
    // API clues (26-37)
    26: { answer: "test", type: "api" },
    27: { answer: "debug", type: "api" },
    28: { answer: "log", type: "api" },
    29: { answer: "console", type: "api" },
    30: { answer: "browser", type: "api" },
    31: { answer: "node", type: "api" },
    32: { answer: "npm", type: "api" },
    33: { answer: "package", type: "api" },
    34: { answer: "module", type: "api" },
    35: { answer: "import", type: "api" },
    36: { answer: "export", type: "api" },
    37: { answer: "class", type: "api" },
    // Misc clues (38-50)
    38: { answer: "method", type: "misc" },
    39: { answer: "property", type: "misc" },
    40: { answer: "interface", type: "misc" },
    41: { answer: "type", type: "misc" },
    42: { answer: "enum", type: "misc" },
    43: { answer: "const", type: "misc" },
    44: { answer: "let", type: "misc" },
    45: { answer: "var", type: "misc" },
    46: { answer: "return", type: "misc" },
    47: { answer: "if", type: "misc" },
    48: { answer: "else", type: "misc" },
    49: { answer: "for", type: "misc" },
    50: { answer: "while", type: "misc" },
};
const GAME_ID = "main";
// Helper function to award payments
async function awardPayments(gameRef) {
    const gameDoc = await gameRef.get();
    if (!gameDoc.exists)
        return;
    const gameData = gameDoc.data();
    const totalSolved = gameData.totalSolved || 0;
    const categoryStats = gameData.categoryStats || {};
    let payments = gameData.payments || 0;
    const updates = {};
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
    const categories = ["app", "jira", "api", "misc"];
    const completedCategories = [...(gameData.completedCategories || [])];
    for (const category of categories) {
        const stats = categoryStats[category] || { total: 0, solved: 0 };
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
exports.submitGuess = functions.https.onCall(async (data, _context) => {
    const { clueId, guess, playerName } = data;
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
    const clueData = clueDoc.data();
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
        return { correct: false, alreadySolved: true };
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
    if (isCorrect) {
        // Update clue as solved
        await clueRef.update({
            isSolved: true,
            answer: correctAnswer,
            solvedBy: playerName,
            solvedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // Update game stats
        const gameDoc = await gameRef.get();
        const gameData = gameDoc.data();
        const totalSolved = (gameData.totalSolved || 0) + 1;
        const categoryStats = gameData.categoryStats || {};
        // Use type from CLUE_DATA as source of truth, but validate against Firestore
        const clueType = expectedType;
        const firestoreType = clueData.type;
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
        return { correct: true };
    }
    return { correct: false };
});
// Function 2: useHint
exports.useHint = functions.https.onCall(async (data, _context) => {
    const { clueId, playerName } = data;
    if (!clueId || !playerName) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }
    const gameRef = db.collection("games").doc(GAME_ID);
    const clueRef = gameRef.collection("clues").doc(clueId.toString());
    const gameDoc = await gameRef.get();
    if (!gameDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Game not found");
    }
    const gameData = gameDoc.data();
    const payments = gameData.payments || 0;
    if (payments < 1) {
        throw new functions.https.HttpsError("failed-precondition", "Insufficient payments");
    }
    const clueDoc = await clueRef.get();
    if (!clueDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Clue not found");
    }
    const clueData = clueDoc.data();
    if (clueData.hintUnlocked) {
        return { success: true, alreadyUnlocked: true };
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
    return { success: true };
});
// Function 3: revealSolution
exports.revealSolution = functions.https.onCall(async (data, _context) => {
    const { clueId, playerName } = data;
    if (!clueId || !playerName) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }
    const gameRef = db.collection("games").doc(GAME_ID);
    const clueRef = gameRef.collection("clues").doc(clueId.toString());
    const gameDoc = await gameRef.get();
    if (!gameDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Game not found");
    }
    const gameData = gameDoc.data();
    const payments = gameData.payments || 0;
    if (payments < 3) {
        throw new functions.https.HttpsError("failed-precondition", "Insufficient payments (need 3)");
    }
    const clueDoc = await clueRef.get();
    if (!clueDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Clue not found");
    }
    const clueData = clueDoc.data();
    if (clueData.isSolved) {
        return { success: true, alreadySolved: true };
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
    const firestoreType = clueData.type;
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
    return { success: true };
});
//# sourceMappingURL=index.js.map