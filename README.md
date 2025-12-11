# Engineering Escape Room Web App

A collaborative real-time escape room website built with Next.js and Firebase.

## Features

- 🎮 50 clues across 4 categories (App, Jira, API, Misc)
- ⚡ Real-time synchronization using Firestore
- 💰 Payment system for unlocking hints and solutions
- 📱 Mobile-friendly responsive design
- 🔒 Secure answer validation via Cloud Functions

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TailwindCSS
- **Backend:** Firebase Firestore, Cloud Functions
- **Deployment:** Vercel (frontend), Firebase (backend)

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Firebase account
- npm or yarn

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Firestore Database** (start in test mode for development)
4. Enable **Cloud Functions**
5. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click the web icon (`</>`)
   - Copy the Firebase configuration object

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Firebase Functions Setup

1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in the project (if not already done):
   ```bash
   firebase init
   ```
   - Select: Functions, Firestore
   - Use existing project
   - Choose TypeScript
   - Accept defaults

4. Install function dependencies:
   ```bash
   cd functions
   npm install
   cd ..
   ```

5. Deploy Cloud Functions:
   ```bash
   firebase deploy --only functions
   ```

### 4. Seed Firestore Database

Before running the seed script, you need to set up Firebase Admin credentials:

**Option A: Using Service Account Key (Recommended for local development)**

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```

**Option B: Using Application Default Credentials**

If you're already authenticated with `firebase login`, you can use:
```bash
export GOOGLE_APPLICATION_CREDENTIALS=""
```

Then run the seed script:
```bash
# Install ts-node if not already installed
npm install -g ts-node typescript

# Run seed script
npx ts-node scripts/seed-firestore.ts
```

The script will prompt you for:
- Confirmation to proceed
- Start time (or press Enter for now)
- End time (or press Enter for 2 hours from now)

### 5. Install Frontend Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main game page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── NameModal.tsx     # Welcome modal
│   │   ├── Header.tsx        # Header with timer
│   │   ├── CategoryStatus.tsx # Progress bars
│   │   ├── PaymentsPanel.tsx # Payments display
│   │   ├── ClueGrid.tsx      # Grid of clues
│   │   ├── ClueTile.tsx      # Individual clue card
│   │   └── LiveFeed.tsx      # Recent guesses feed
│   └── lib/
│       ├── firebase.ts       # Firebase initialization
│       └── useGame.ts        # Real-time game data hook
├── functions/
│   └── src/
│       └── index.ts          # Cloud Functions
├── scripts/
│   └── seed-firestore.ts     # Database seeding script
└── PRD.md                    # Product Requirements Document
```

## Game Rules

- **Clues:** 50 total clues across 4 categories
- **Payments:** Earned every 10 clues solved globally, and when completing a category
- **Hints:** Cost 1 payment to unlock
- **Solutions:** Cost 3 payments to reveal
- **Real-time:** All updates sync instantly across all players

## Customization

### Changing Answers

Edit `functions/src/index.ts` and update the `ANSWERS` object:

```typescript
const ANSWERS: Record<number, string> = {
  1: "your_answer_here",
  2: "another_answer",
  // ... etc
};
```

Then redeploy:
```bash
firebase deploy --only functions
```

### Changing Clue Data

Edit `scripts/seed-firestore.ts` to modify clue hints, types, or add more clues.

### Styling

The app uses TailwindCSS. Modify `tailwind.config.ts` and component files to customize the design.

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Backend (Firebase)

```bash
firebase deploy --only functions,firestore:rules
```

## Troubleshooting

### "Game not found" error
- Make sure you've run the seed script to create the game document

### Functions not working
- Check Firebase Console > Functions for errors
- Verify function deployment: `firebase functions:list`
- Check function logs: `firebase functions:log`

### Real-time updates not working
- Verify Firestore rules allow read/write
- Check browser console for Firebase errors
- Ensure environment variables are set correctly

## Security Notes

- Answers are stored securely in Cloud Functions (not exposed to clients)
- Firestore rules are permissive for development (update for production)
- Consider adding authentication for production use

## License

Internal use only.

