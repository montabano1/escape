Below is a **copy-paste-ready PRD + Engineering Plan** tailored for **Cursor** and for a **junior engineer** to fully build this escape-room web app using **Next.js (Vercel) + Firebase Firestore + Firebase Cloud Functions**.

It is intentionally structured, explicit, and implementation-oriented so they can follow it step-by-step.

---

# 📄 PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Project: Engineering Team Escape Room Web App

## Owner: Michael

## Target Audience: Internal Software Engineering Team

## Status: v1.0

---

# 1. **Product Overview**

We are building a collaborative **real-time escape room website**.
There are **50 total clues**, grouped into **4 clue types**.
Engineers attempt to input the correct word for each clue.
The site syncs in real time: when one player solves a clue, everyone sees it instantly.

Players earn “**payments**” that can be spent to unlock hints or full solutions.

---

# 2. **User Workflow**

### **2.1. On Page Load**

1. User is shown a **Welcome modal**.
2. User enters **their name**.
3. Name is stored in `localStorage`.
4. User joins the shared game session.

### **2.2. Game View**

The main screen displays:

* **Countdown timer** (to end of escape room)
* **Category progress bars** (one for each of 4 clue types)
* **50 clue tiles**, each showing:

  * Clue ID: 1–50
  * Clue Type (App, Jira, API, Misc — names configurable)
  * If solved → show correct answer + solver name
  * If unsolved → input field for guesses + submission button
* **Payments count**
* **Hints panel**
* **Live guesses feed** (shows recent attempts)

### **2.3. Guessing**

* User types an answer for a clue.
* Upon submission, the guess is validated server-side.
* If correct → clue is marked solved, everyone sees it instantly.
* If incorrect → guess is logged in a shared feed.

### **2.4. Earning Payments**

Users earn “payments” used to unlock hints or solutions:

1. **Every 10 clues solved globally → +1 payment**
2. **Completing all clues of a type → +1 payment**
3. Payments are global/shared — not per individual.

### **2.5. Spending Payments**

* Unlock **Hint** (cost: **1 payment**)
  → reveals the hidden hint for a clue.
* Unlock **Full Solution** (cost: **3 payments**)
  → reveals the correct answer directly.

---

# 3. Game Rules Summary

| Mechanic               | Behavior                                                                     |
| ---------------------- | ---------------------------------------------------------------------------- |
| **Clues**              | 50 total, each belongs to 1 of 4 types                                       |
| **Hints**              | Each clue has 1 hidden hint                                                  |
| **Payments**           | Start with 0. Earn new payment every 10 solved clues + when finishing a type |
| **Full Solution cost** | 3 payments                                                                   |
| **Hint cost**          | 1 payment                                                                    |
| **Real-time**          | All solved clues & payments update live                                      |
| **Timer**              | Game ends at preset end time; user interface locks                           |

---

# 4. Non-Functional Requirements

* Clean, modern, high-tech UI
* Mobile-friendly
* Low latency (Firestore realtime listeners)
* Secure answers: answers live **only** in Cloud Functions
* Zero authentication (name only, stored locally)

---

# 5. Out of Scope (v1)

* Multiple game sessions
* Persistence of individual player stats
* Advanced admin UI
* Resetting games from UI (manual only)

---

# 6. Success Metrics

* All users see updates within <300ms.
* No user can cheat by inspecting the code for answers.
* All 50 clues solvable.
* Hints and solutions unlock reliably and transparently.

---

<br>

# 🛠 ENGINEERING PLAN

## Stack

* **Frontend:** Next.js (App Router), TailwindCSS, shadcn/ui components
* **Backend:** Firebase Firestore, Cloud Functions
* **Deployment:** Vercel (frontend), Firebase Functions (backend)

---

# 1. Firestore Schema

### **Document: `games/main`**

```ts
{
  title: "Engineering Escape Room",
  startTime: Timestamp,
  endTime: Timestamp,

  totalSolved: number,         // updated by Cloud Function
  payments: number,            // total payments available
  paymentsUsed: number,        // optional, for display only

  categoryStats: {
    app: { total: number, solved: number },
    jira: { total: number, solved: number },
    api: { total: number, solved: number },
    misc: { total: number, solved: number },
  }
}
```

### **Collection: `games/main/clues/{clueId}`**

```ts
{
  id: number,                     // 1–50
  type: "app" | "jira" | "api" | "misc",
  isSolved: boolean,
  answer: string | null,          // null until solved
  solvedBy: string | null,
  solvedAt: Timestamp | null,
  hintUnlocked: boolean,
  hiddenHint: string,             // stored openly
}
```

### **Collection: `games/main/guesses/{guessId}`**

```ts
{
  clueId: number,
  guess: string,
  correct: boolean,
  playerName: string,
  createdAt: Timestamp,
}
```

---

# 2. Cloud Functions Required

## **Function 1: submitGuess**

Validates a guess.

### Inputs:

```ts
{
  clueId: number,
  guess: string,
  playerName: string
}
```

### Behavior:

1. Normalize guess to lowercase/trim.
2. Compare to answer stored **inside the function's code**, e.g.:

```ts
const ANSWERS = {
  1: "aomer",
  2: "refactor",
  ...
};
```

3. If correct:

   * Update clue document:
     `isSolved = true`, `answer = ANSWERS[id]`, `solvedBy = playerName`
   * Append to guesses collection.
   * Increment `totalSolved` in game doc.
   * Recalculate payments (see below).
4. If incorrect:

   * Log guess in guesses collection.

---

## **Function 2: useHint**

Unlocks a hint for a clue.

### Inputs:

```ts
{
  clueId: number,
  playerName: string
}
```

### Behavior:

* If `payments > 0`, decrement payment count.
* Set `hintUnlocked = true` on clue document.

---

## **Function 3: revealSolution**

Unlock the full answer (cost 3 payments).

### Inputs:

```ts
{
  clueId: number,
  playerName: string
}
```

### Behavior:

* Check 3 payments available → decrement 3.
* Update clue doc:
  `answer = ANSWERS[id]; isSolved = true; solvedBy = playerName`.

---

# 3. Payment Calculation Logic

### Payments awarded automatically when:

#### **A. Every 10 clues solved**

Cloud Function checks:

```ts
if (totalSolved % 10 === 0) {
    payments += 1;
}
```

#### **B. Completing a clue type**

Each type has its own total count:

```ts
if (categoryStats[type].solved === categoryStats[type].total) {
    payments += 1;
}
```

### Payment usage:

* Hint = 1 payment
* Full solution = 3 payments

Payments cannot go negative.

---

# 4. FRONTEND IMPLEMENTATION PLAN

## Pages

### **1. `/` (Home/Game Page)**

Components:

#### **NameModal**

* Opens on first load
* Stores name in localStorage

#### **Header**

* Shows game title & countdown timer

#### **CategoryStatusBar**

* 4 progress bars
* Subscribed to `game` doc

#### **ClueGrid**

* Grid of 50 tiles
* Each tile:

  * If solved: show answer + solver
  * If unsolved: input box + Submit button
  * Hint button
  * Reveal solution button

#### **PaymentsPanel**

* Shows current payments available
* Hint cost: 1
* Full solution cost: 3

#### **LiveFeed**

* Listens to last 25 guesses ordered by `createdAt desc`

---

# 5. Real-time Listeners

Add Firestore listeners for:

### `games/main`

* countdown
* payment count
* category progress

### `games/main/clues`

* solved clues
* hint unlocks

### `games/main/guesses`

* feed of recent guesses

---

# 6. UI States

### If timer expired:

* Disable all inputs
* Display "Time is up!"

### If clue solved:

* Lock guess input
* Show solution badge

### If insufficient payments:

* Disable hint + solution buttons

---

# 7. Folder Structure (recommended)

```
/src
  /app
    page.tsx
  /components
    NameModal.tsx
    Header.tsx
    CategoryStatus.tsx
    ClueGrid.tsx
    ClueTile.tsx
    PaymentsPanel.tsx
    LiveFeed.tsx
  /lib
    firebase.ts
    useGame.ts
```

---

# 8. Tasks for Junior Engineer

### **Backend (Firebase)**

#### **Setup**

* Create Firebase project
* Enable Firestore + Functions

#### **Build functions**

* `submitGuess`
* `useHint`
* `revealSolution`
* Add helper: `awardPayments()`

#### **Seed Firestore**

* Create `games/main`
* Create 50 clue docs with fields:

  * `id`
  * `type`
  * `hiddenHint`
  * `isSolved = false`

---

### **Frontend (Next.js)**

#### **Global**

* Implement Firebase init
* Create context: `useGame()` for listeners

#### **Components**

1. NameModal
2. Timer
3. Category bars
4. Payments panel
5. ClueGrid
6. ClueTile
7. LiveFeed

#### **Logic**

* Prevent submitting multiple times rapidly
* Prevent hint/solution without payments
* Disable everything after timer

---

# 9. Example of Cloud Function Answer Key

```ts
const ANSWERS: Record<number, string> = {
  1: "deploy",
  2: "endpoint",
  3: "jira",
  ...
  50: "latency"
};
```

---

# 10. Security Rules (Development-friendly)

```ts
service cloud.firestore {
  match /databases/{database}/documents {

    match /games/{gameId}/{collection=**}/{docId} {
      allow read, write: if true; // internal tool, safe enough
    }
  }
}
```

(Production optional: lock writes to only the Cloud Functions.)

---

# 11. Acceptance Criteria

### **Game engine**

* All guesses validated server-side
* Wrong guesses logged
* Solved clues update globally within <300ms
* Payment logic correct
* Hints and solutions unlock only if payments > 0

### **UI**

* Timer counts down accurately
* Real-time updates visible
* Inputs lock when solved
* Beautiful, modern, high-tech styling

### **Game Experience**

* Users can collaboratively solve clues
* Hints feel meaningful
* All actions visible to everyone via feed

