# Quick Start Guide

## 🚀 What You Need to Do

### 1. Firebase Setup (5 minutes)

**Create Firebase Project:**
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it (e.g., "escape-room")
4. Enable Google Analytics (optional)

**Enable Firestore:**
1. Click "Firestore Database" in left menu
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose location closest to you

**Enable Cloud Functions:**
1. Click "Functions" in left menu
2. Click "Get started"
3. **Important:** You'll need to upgrade to Blaze plan (pay-as-you-go) - this is required for Cloud Functions
4. Don't worry, Firebase has a generous free tier

**Get Your Firebase Config:**
1. Click gear icon ⚙️ > Project Settings
2. Scroll to "Your apps" section
3. Click web icon `</>`
4. Register app (nickname: "Escape Room")
5. Copy the config values

### 2. Create `.env.local` File

Create a file named `.env.local` in the project root with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase config.

### 3. Install Dependencies

```bash
npm install
cd functions && npm install && cd ..
```

### 4. Setup Firebase CLI

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login
firebase login

# Initialize (select your project when prompted)
firebase init
# Choose: Functions, Firestore
# Use existing project
# TypeScript for Functions
# Accept defaults
```

### 5. Deploy Cloud Functions

```bash
firebase deploy --only functions
```

Wait 2-3 minutes for deployment. You'll see URLs for your functions.

### 6. Seed the Database

**Get Service Account Key:**
1. Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file somewhere safe

**Set Environment Variable:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/full/path/to/service-account-key.json"
```

**Run Seed Script:**
```bash
# Install ts-node if needed
npm install -g ts-node typescript

# Run seed
npx ts-node scripts/seed-firestore.ts
```

When prompted:
- Type "yes" to confirm
- Press Enter for start time (uses now)
- Press Enter for end time (uses 2 hours from now)

### 7. Run the App

```bash
npm run dev
```

Open http://localhost:3000

## ✅ Testing Checklist

- [ ] Name modal appears on first load
- [ ] Enter name and game loads
- [ ] Timer shows countdown
- [ ] 50 clue tiles are visible
- [ ] Try solving a clue (e.g., clue #1: "deploy")
- [ ] Guess appears in live feed
- [ ] Correct answer marks clue as solved
- [ ] Solve 10 clues → check payments increase
- [ ] Use hint button (costs 1 payment)
- [ ] Reveal solution button (costs 3 payments)
- [ ] Open in second browser → test real-time sync

## 🐛 Common Issues

**"Game not found"**
→ Run the seed script (step 6)

**Functions not working**
→ Check Firebase Console > Functions for errors
→ Verify deployment: `firebase functions:list`

**Real-time not updating**
→ Check browser console for errors
→ Verify `.env.local` has correct values
→ Check Firestore rules allow read/write

**Payment logic not working**
→ Check Cloud Function logs: `firebase functions:log`
→ Verify `awardPayments` is being called

## 📝 Next Steps

1. **Customize Answers:** Edit `functions/src/index.ts` → `ANSWERS` object
2. **Update Hints:** Edit `scripts/seed-firestore.ts` → `CLUES` array
3. **Change Timer:** Modify end time in seed script
4. **Deploy:** Push to Vercel (frontend) and Firebase (backend)

## 📚 Full Documentation

See `SETUP.md` for detailed instructions and `README.md` for project overview.

