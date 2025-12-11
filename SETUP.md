# Setup Guide

## Quick Start Checklist

### ✅ Firebase Setup (Required)

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Follow the wizard

2. **Enable Firestore**
   - In Firebase Console, go to "Firestore Database"
   - Click "Create database"
   - Start in **test mode** (for development)
   - Choose a location (closest to your users)

3. **Enable Cloud Functions**
   - In Firebase Console, go to "Functions"
   - Click "Get started"
   - Follow the setup wizard
   - Note: You'll need to enable billing (Blaze plan) for Cloud Functions

4. **Get Firebase Config**
   - Go to Project Settings (gear icon) > General
   - Scroll to "Your apps" section
   - Click the web icon (`</>`)
   - Register app (nickname: "Escape Room Web")
   - Copy the `firebaseConfig` object values

5. **Create `.env.local` file** in project root:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### ✅ Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### ✅ Setup Firebase CLI

```bash
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init
# Select: Functions, Firestore
# Use existing project (select your project)
# Choose TypeScript for Functions
# Accept defaults for other options
```

### ✅ Deploy Cloud Functions

```bash
# Deploy functions to Firebase
firebase deploy --only functions
```

Wait for deployment to complete. Note the function URLs if shown.

### ✅ Seed Firestore Database

**Option 1: Using Firebase Admin SDK (Recommended)**

1. Get Service Account Key:
   - Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely (don't commit to git!)

2. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```

3. Install ts-node (if needed):
   ```bash
   npm install -g ts-node typescript
   ```

4. Run seed script:
   ```bash
   npx ts-node scripts/seed-firestore.ts
   ```

   The script will ask:
   - Confirmation to proceed (type "yes")
   - Start time (press Enter for now)
   - End time (press Enter for 2 hours from now)

**Option 2: Manual Setup via Firebase Console**

1. Go to Firestore Database in Firebase Console
2. Create collection: `games`
3. Create document with ID: `main`
4. Add these fields:
   ```json
   {
     "title": "Engineering Escape Room",
     "startTime": [Firestore Timestamp - current time],
     "endTime": [Firestore Timestamp - 2 hours from now],
     "totalSolved": 0,
     "payments": 0,
     "paymentsUsed": 0,
     "categoryStats": {
       "app": { "total": 12, "solved": 0 },
       "jira": { "total": 13, "solved": 0 },
       "api": { "total": 12, "solved": 0 },
       "misc": { "total": 13, "solved": 0 }
     },
     "completedCategories": [],
     "previousTotalSolved": 0
   }
   ```

5. Create subcollection: `clues` under `games/main`
6. Create 50 documents (IDs: "1" through "50") with fields:
   ```json
   {
     "id": 1,
     "type": "app",
     "isSolved": false,
     "answer": null,
     "solvedBy": null,
     "solvedAt": null,
     "hintUnlocked": false,
     "hiddenHint": "Your hint text here"
   }
   ```
   - Distribute types: 12 app, 13 jira, 12 api, 13 misc
   - Update hints as needed

### ✅ Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Testing Locally

### Test Game Flow

1. **Open the app** - You should see the name modal
2. **Enter your name** - Modal closes, game loads
3. **Check timer** - Should show countdown
4. **Try solving a clue** - Enter an answer and submit
5. **Check live feed** - Your guess should appear
6. **Solve 10 clues** - Should earn 1 payment
7. **Use hint** - Click "Hint (1)" button (requires 1 payment)
8. **Reveal solution** - Click "Solution (3)" button (requires 3 payments)

### Test Real-time Updates

1. Open the app in **two browser windows** (or incognito + normal)
2. Enter different names
3. Solve a clue in one window
4. Check the other window - should update automatically

## Troubleshooting

### "Game not found" error
- ✅ Run the seed script to create the game document
- ✅ Check Firestore has `games/main` document

### Functions not working
- ✅ Check Firebase Console > Functions for deployment status
- ✅ Verify functions are deployed: `firebase functions:list`
- ✅ Check function logs: `firebase functions:log`
- ✅ Ensure billing is enabled (Blaze plan required)

### Real-time updates not working
- ✅ Check browser console for errors
- ✅ Verify `.env.local` has correct Firebase config
- ✅ Check Firestore rules allow read/write
- ✅ Ensure Firestore is in test mode (for development)

### Payment logic not working
- ✅ Check Cloud Function logs for errors
- ✅ Verify `awardPayments` function is called after solving clues
- ✅ Check Firestore for `payments` field updates

## Next Steps

1. ✅ Customize answers in `functions/src/index.ts`
2. ✅ Update hints in seed script or Firestore
3. ✅ Adjust timer duration in seed script
4. ✅ Customize styling in Tailwind config
5. ✅ Deploy to Vercel (frontend) and Firebase (backend)

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Backend (Firebase)
```bash
firebase deploy --only functions,firestore:rules
```

## Need Help?

- Check Firebase Console for errors
- Review function logs: `firebase functions:log`
- Check browser console for frontend errors
- Verify all environment variables are set correctly

