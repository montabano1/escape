/**
 * Seed script to initialize Firestore with game data
 * Run with: npx ts-node scripts/seed-firestore.ts
 * 
 * Make sure to set up Firebase Admin SDK credentials first
 */

import admin from 'firebase-admin';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// You'll need to set GOOGLE_APPLICATION_CREDENTIALS environment variable
// or use a service account key file
if (!admin.apps || admin.apps.length === 0) {
  // Try to use service account key file if it exists in the root directory
  const serviceAccountPath = path.join(__dirname, '..', 'ao-mobile-escape-room-firebase-adminsdk-fbsvc-b599d0709d.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use environment variable if set
    admin.initializeApp();
  } else {
    // Try default initialization
    try {
      admin.initializeApp();
    } catch (error) {
      console.error('Failed to initialize Firebase Admin. Please set GOOGLE_APPLICATION_CREDENTIALS or place service account key in root directory.');
      console.error(error);
      process.exit(1);
    }
  }
}

const db = admin.firestore();

const GAME_ID = 'main';

/**
 * IMPORTANT: Clue types and answers are defined in functions/src/index.ts as CLUE_DATA.
 * This seed script should match those types exactly.
 * 
 * The source of truth for clue types is: functions/src/index.ts -> CLUE_DATA
 * 
 * Clue type distribution:
 * - App: 1-12 (12 clues)
 * - Jira: 13-25 (13 clues)
 * - API: 26-37 (12 clues)
 * - Misc: 38-50 (13 clues)
 */
const CLUES = [
  // App clues (1-12) - Must match functions/src/index.ts CLUE_DATA
  { id: 1, type: 'app' as const, hiddenHint: 'Think about deployment processes' },
  { id: 2, type: 'app' as const, hiddenHint: 'API endpoint configuration' },
  { id: 3, type: 'app' as const, hiddenHint: 'Project management tool' },
  { id: 4, type: 'app' as const, hiddenHint: 'Data storage system' },
  { id: 5, type: 'app' as const, hiddenHint: 'Application programming interface' },
  { id: 6, type: 'app' as const, hiddenHint: 'Computer that serves requests' },
  { id: 7, type: 'app' as const, hiddenHint: 'User-facing application' },
  { id: 8, type: 'app' as const, hiddenHint: 'User interface layer' },
  { id: 9, type: 'app' as const, hiddenHint: 'Server-side logic' },
  { id: 10, type: 'app' as const, hiddenHint: 'Source code' },
  { id: 11, type: 'app' as const, hiddenHint: 'Reusable code block' },
  { id: 12, type: 'app' as const, hiddenHint: 'Stores a value' },
  
  // Jira clues (13-25) - Must match functions/src/index.ts CLUE_DATA
  { id: 13, type: 'jira' as const, hiddenHint: 'Data structure' },
  { id: 14, type: 'jira' as const, hiddenHint: 'Key-value pairs' },
  { id: 15, type: 'jira' as const, hiddenHint: 'Text data type' },
  { id: 16, type: 'jira' as const, hiddenHint: 'Numeric data type' },
  { id: 17, type: 'jira' as const, hiddenHint: 'True/false value' },
  { id: 18, type: 'jira' as const, hiddenHint: 'Empty value' },
  { id: 19, type: 'jira' as const, hiddenHint: 'Undefined value' },
  { id: 20, type: 'jira' as const, hiddenHint: 'Non-blocking execution' },
  { id: 21, type: 'jira' as const, hiddenHint: 'Wait for promise' },
  { id: 22, type: 'jira' as const, hiddenHint: 'Future value' },
  { id: 23, type: 'jira' as const, hiddenHint: 'Function passed as argument' },
  { id: 24, type: 'jira' as const, hiddenHint: 'Something went wrong' },
  { id: 25, type: 'jira' as const, hiddenHint: 'Runtime error' },
  
  // API clues (26-37) - Must match functions/src/index.ts CLUE_DATA
  { id: 26, type: 'api' as const, hiddenHint: 'Automated checks' },
  { id: 27, type: 'api' as const, hiddenHint: 'Find bugs' },
  { id: 28, type: 'api' as const, hiddenHint: 'Record information' },
  { id: 29, type: 'api' as const, hiddenHint: 'Browser developer tool' },
  { id: 30, type: 'api' as const, hiddenHint: 'Web browser' },
  { id: 31, type: 'api' as const, hiddenHint: 'JavaScript runtime' },
  { id: 32, type: 'api' as const, hiddenHint: 'Package manager' },
  { id: 33, type: 'api' as const, hiddenHint: 'Reusable code bundle' },
  { id: 34, type: 'api' as const, hiddenHint: 'Code file' },
  { id: 35, type: 'api' as const, hiddenHint: 'Bring in code' },
  { id: 36, type: 'api' as const, hiddenHint: 'Export code' },
  { id: 37, type: 'api' as const, hiddenHint: 'Object-oriented structure' },
  
  // Misc clues (38-50) - Must match functions/src/index.ts CLUE_DATA
  { id: 38, type: 'misc' as const, hiddenHint: 'Object function' },
  { id: 39, type: 'misc' as const, hiddenHint: 'Object attribute' },
  { id: 40, type: 'misc' as const, hiddenHint: 'Type definition' },
  { id: 41, type: 'misc' as const, hiddenHint: 'Type annotation' },
  { id: 42, type: 'misc' as const, hiddenHint: 'Named constants' },
  { id: 43, type: 'misc' as const, hiddenHint: 'Block-scoped constant' },
  { id: 44, type: 'misc' as const, hiddenHint: 'Block-scoped variable' },
  { id: 45, type: 'misc' as const, hiddenHint: 'Function-scoped variable' },
  { id: 46, type: 'misc' as const, hiddenHint: 'Function output' },
  { id: 47, type: 'misc' as const, hiddenHint: 'Conditional statement' },
  { id: 48, type: 'misc' as const, hiddenHint: 'Alternative condition' },
  { id: 49, type: 'misc' as const, hiddenHint: 'Iteration loop' },
  { id: 50, type: 'misc' as const, hiddenHint: 'Conditional loop' },
];

async function seedFirestore() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  };

  console.log('🌱 Firestore Seed Script');
  console.log('========================\n');

  const confirm = await question('This will create/overwrite the game document. Continue? (yes/no): ');
  if (confirm.toLowerCase() !== 'yes') {
    console.log('Cancelled.');
    rl.close();
    return;
  }

  const startTimeInput = await question('Enter start time (ISO format, or press Enter for now): ');
  const endTimeInput = await question('Enter end time (ISO format, or press Enter for 2 hours from now): ');

  const startTime = startTimeInput ? new Date(startTimeInput) : new Date();
  const endTime = endTimeInput ? new Date(endTimeInput) : new Date(Date.now() + 2 * 60 * 60 * 1000);

  console.log('\n📝 Creating game document...');
  const gameRef = db.collection('games').doc(GAME_ID);

  // Count clues by type
  const categoryStats = {
    app: { total: 0, solved: 0 },
    jira: { total: 0, solved: 0 },
    api: { total: 0, solved: 0 },
    misc: { total: 0, solved: 0 },
  };

  CLUES.forEach((clue) => {
    categoryStats[clue.type as keyof typeof categoryStats].total += 1;
  });

  await gameRef.set({
    title: 'Engineering Escape Room',
    startTime: admin.firestore.Timestamp.fromDate(startTime),
    endTime: admin.firestore.Timestamp.fromDate(endTime),
    totalSolved: 0,
    payments: 0,
    paymentsUsed: 0,
    categoryStats,
    completedCategories: [],
    previousTotalSolved: 0,
  });

  console.log('✅ Game document created');

  console.log('\n📝 Creating clue documents...');
  const batch = db.batch();
  let batchCount = 0;

  for (const clue of CLUES) {
    const clueRef = gameRef.collection('clues').doc(clue.id.toString());
    batch.set(clueRef, {
      id: clue.id,
      type: clue.type,
      isSolved: false,
      answer: null,
      solvedBy: null,
      solvedAt: null,
      hintUnlocked: false,
      hiddenHint: clue.hiddenHint,
    });
    batchCount++;

    // Firestore batches have a limit of 500 operations
    if (batchCount >= 500) {
      await batch.commit();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`✅ Created ${CLUES.length} clue documents`);

  console.log('\n🎉 Seeding complete!');
  console.log(`\nGame ID: ${GAME_ID}`);
  console.log(`Start time: ${startTime.toISOString()}`);
  console.log(`End time: ${endTime.toISOString()}`);
  console.log('\nYou can now start the frontend and test the game.');

  rl.close();
}

seedFirestore().catch((error) => {
  console.error('❌ Error seeding Firestore:', error);
  process.exit(1);
});

