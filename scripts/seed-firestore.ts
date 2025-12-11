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
 * This seed script reads from that file to ensure consistency.
 * 
 * The source of truth for clue types is: functions/src/index.ts -> CLUE_DATA
 */

// Read and parse CLUE_DATA from functions/src/index.ts
function getClueData() {
  const functionsIndexPath = path.join(__dirname, '..', 'functions', 'src', 'index.ts');
  
  if (!fs.existsSync(functionsIndexPath)) {
    throw new Error(`Could not find functions/src/index.ts at ${functionsIndexPath}`);
  }
  
  const fileContent = fs.readFileSync(functionsIndexPath, 'utf8');
  
  // Extract CLUE_DATA object using regex
  const clueDataMatch = fileContent.match(/const CLUE_DATA[^=]*=\s*\{([\s\S]*?)\};/);
  if (!clueDataMatch) {
    throw new Error('Could not find CLUE_DATA in functions/src/index.ts');
  }
  
  // Parse the object - match each clue entry: id: {answer: "...", type: "..."}
  const clueDataContent = clueDataMatch[1];
  const clues: Array<{ id: number; type: 'app' | 'jira' | 'api' | 'misc'; hiddenHint: string }> = [];
  
  // Match pattern: number: {answer: "string", type: "type"}
  const clueRegex = /(\d+):\s*\{answer:\s*"[^"]+",\s*type:\s*"(app|jira|api|misc)"\}/g;
  let match;
  
  while ((match = clueRegex.exec(clueDataContent)) !== null) {
    const id = parseInt(match[1], 10);
    const type = match[2] as 'app' | 'jira' | 'api' | 'misc';
    clues.push({
      id,
      type,
      hiddenHint: `Hint for clue ${id}`, // Default hint - you can customize these later
    });
  }
  
  if (clues.length === 0) {
    throw new Error('No clues found in CLUE_DATA. Check the format in functions/src/index.ts');
  }
  
  return clues.sort((a, b) => a.id - b.id);
}

// Get clues from CLUE_DATA - this ensures totals match exactly
const CLUES = getClueData();

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
  
  // Show clue counts for verification
  const counts = CLUES.reduce((acc, clue) => {
    acc[clue.type] = (acc[clue.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log('📊 Clue counts from CLUE_DATA:');
  console.log(`   App: ${counts.app || 0}, Jira: ${counts.jira || 0}, API: ${counts.api || 0}, Misc: ${counts.misc || 0}\n`);

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

