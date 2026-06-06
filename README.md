<div align="center">

# ⚡ Momentum

### _Solve slacking, stay consistent, and amplify productivity with your squad._

**Squad Activity Dashboard · Native PWA & Device Haptics · Google OAuth 2.0 · Voice-to-Task (Speech-to-Text) · Roasts & Toasts Reviews · The Midnight Purge**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Motion-v12-9D4EDE?style=for-the-badge&logo=framer&logoColor=white)](https://motion.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-FF6F61?style=for-the-badge&logo=google-chrome&logoColor=white)](https://web.dev/explore/progressive-web-apps)

</div>

---

## 📖 What is Momentum?

**Momentum** is a collaborative, social productivity application built to solve consistency problems and boost daily task execution for you and your friends. Rather than checking off tasks in isolation, Momentum puts your squad's activity center stage. 

The application is structured around **The Midnight Purge**: all unfinished tasks are automatically marked as "failed" when the day ends (locked to India Standard Time). This creates a zero-excuse forcing function, tracks your genuine consistency streak, and resets the board each morning for a fresh start.

---

## ✨ Features

- 🔐 **Google OAuth 2.0 Social Auth** — Authenticate securely in seconds. Profiles are created automatically, and the backend syncs profile pictures and issues secure JWT tokens via cookies.
- 👥 **Squad Activity Feed** — Keep your friends accountable. The live dashboard tracks your friends' progress, task completion metrics, and streaks in real time. Click on any squad member to review their exact task history.
- 🎙️ **Voice Task Addition** — Add tasks hands-free. A floating microphone action button captures voice commands using native web speech recognition, instantly converting speech to tasks.
- 📱 **Installable Progressive Web App (PWA)** — Install Momentum directly to your phone or desktop. Features native-feeling service-worker caching and custom device haptic vibration feedback when checking off tasks.
- 💬 **Roasts & Toasts (Squad Reviews)** — Give and receive raw, unfiltered daily feedback. Squad members can leave anonymous or signed comments on each other's daily progress which show up directly on their profile dashboard.
- 🕒 **The "Midnight Purge" (IST)** — Task status is calculated within an IST day range. At midnight, any incomplete or pending task is locked as "failed" in your history, keeping consistency tracking honest.
- 📊 **Detailed History & Analytics** — Track your consistency with metrics like "Win Rate" (completion percentage), consecutive active days, total tasks completed, daily average, and full interactive timeline history.

---

## 🏗️ Tech Stack

### Frontend (`/client`)
| Technology | Purpose |
|---|---|
| Next.js 16.2 | React Framework for client routes and build compilation |
| React 19 | UI Render Engine |
| Tailwind CSS v4 | Native utility-first styling layouts |
| Motion (Framer Motion v12) | Elegant UI animations, layout transitions, and confirmation prompts |
| Phosphor Icons | Clean and consistent iconography library |
| Sonner | Responsive toast alerts for status updates and warnings |
| next-pwa | PWA compilation wrapper, service worker cache management |

### Backend (`/server`)
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API router and controller hosting |
| MongoDB + Mongoose | Schema modeling, friend relationship graphs, and aggregation queries |
| Passport.js | Google OAuth callback strategy configuration |
| JSONWebToken | Secure stateless session cookie verification |
| Morgan | HTTP request logging for development monitoring |

---

## 📂 Project Structure

```
Momentum/
├── client/                  # Next.js Frontend
│   ├── public/              # Static assets, fonts, icons, manifest
│   │   ├── manifest.json    # PWA configuration settings
│   │   └── sw.js            # Service worker scripts
│   └── app/                 # Next.js App Router Pages
│       ├── friends/         # Squad management (search users, requests)
│       │   └── [id]/        # Individual friend profile & task history
│       ├── history/         # Timeline legacy view of all-time user tasks
│       ├── login/           # Glassmorphism login landing screen
│       ├── profile/         # Detailed analytics and received roasts/toasts reviews
│       ├── globals.css      # Custom Tailwind v4 styling and theme values
│       ├── layout.jsx       # Base layout wrapper with Auth wrappers and Floating Dock
│       └── page.jsx         # Today's Momentum main task dashboard
│   ├── components/          # Reusable components
│   │   ├── AuthWrapper.js   # Route protection middleware
│   │   └── FloatingDock.js  # Bottom interactive application navigation dock
│   └── lib/                 # Shared client utilities
│       ├── api.js           # API fetch client handling credentials
│       └── taskRenderer.js  # Unified task listing markup component
│
└── server/                  # Node.js + Express.js Backend
    ├── server.js            # Main Express entry point
    └── src/
        ├── app.js           # Application routers, CORS, and passport initializations
        ├── config/          # Database connection strings and env configuration
        ├── controllers/     # Controller handlers (user, task, review)
        ├── dao/             # Data Access Objects (DB query abstractions)
        ├── middlewares/     # Auth checks and route protection
        ├── models/          # Mongoose database models (User, Task, Review)
        ├── routes/          # Express route declarations
        └── utils/           # Helper utilities (JWT generation & verification)
```

---

## 🔌 API Reference

### 🔐 Authentication & Squad — `/api/users`

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| `GET`  | `/google` | Public | Redirects user to Google OAuth credentials portal |
| `GET`  | `/google/callback` | Google Auth Redirect | Processes profile payload and issues JWT secure cookies |
| `GET`  | `/me` | JWT Cookie/Bearer | Returns profile details of currently authenticated user |
| `POST` | `/logout` | JWT Cookie/Bearer | Clears cookie tokens and logs out user session |
| `GET`  | `/profile` | JWT Cookie/Bearer | Resolves user profile statistics and updates lastActive timestamp |
| `GET`  | `/search` | JWT Cookie/Bearer | Search directory for other users by name |
| `GET`  | `/friends` | JWT Cookie/Bearer | Fetches list of squad friends with computed Win Rates |
| `GET`  | `/friend-requests` | JWT Cookie/Bearer | Fetches pending friend requests |
| `POST` | `/friend-request` | JWT Cookie/Bearer | Sends friend request to target user ID |
| `POST` | `/friend-request/accept` | JWT Cookie/Bearer | Accepts a pending friend request from a requester ID |

### 📋 Task Management — `/api/tasks`

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| `POST`  | `/` | JWT Cookie/Bearer | Creates a new task for today |
| `GET`  | `/today` | JWT Cookie/Bearer | Fetches today's tasks within the user's local IST range |
| `GET`  | `/friends/today` | JWT Cookie/Bearer | Fetches today's tasks created by all members of the squad |
| `GET`  | `/history` | JWT Cookie/Bearer | Retrieves user task history (auto-fails pending tasks on-the-fly) |
| `PATCH` | `/:taskId/status` | JWT Cookie/Bearer | Cycles task status: `not started` ➔ `in progress` ➔ `completed` |
| `DELETE`| `/:taskId` | JWT Cookie/Bearer | Deletes a task from today's list |
| `GET`  | `/friend/:friendId/today` | JWT Cookie/Bearer | Fetches today's task list for a specific friend |
| `GET`  | `/friend/:friendId/history` | JWT Cookie/Bearer | Fetches historical task history for a specific friend |

### 💬 Daily Reviews — `/api/reviews`

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| `POST`  | `/` | JWT Cookie/Bearer | Submits feedback content ("Roast or Toast") for a squad member |
| `GET`  | `/me/today` | JWT Cookie/Bearer | Fetches all reviews and feedback received today |
| `GET`  | `/friend/:friendId/today` | JWT Cookie/Bearer | Fetches reviews written by the current user for a specific friend today |

---

## ⚙️ Local Setup

### Prerequisites
- Node.js (version 20+)
- MongoDB connection (Local URI or MongoDB Atlas Cluster string)
- Google Cloud Console Project credentials (for configuring Google Sign-In)

---

### Setup Steps

#### 1. Clone the repository
```bash
git clone https://github.com/shobhit2603/Momentum.git
cd Momentum
```

#### 2. Set Up the Backend Server
```bash
cd server
npm install
```

Create a `.env` file inside the `/server` directory:
```env
PORT=8080
CLIENT_URL=http://localhost:3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_key_secret

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=/api/users/google/callback

NODE_ENV=development
```

Start the backend server in development mode:
```bash
npm run dev
```
The server will start listening on `http://localhost:8080`.

#### 3. Set Up the Client Frontend
```bash
cd ../client
npm install
```

Create a `.env` file inside the `/client` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Start the Next.js development server:
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🌐 Deployment

| Service | Recommended Host | Configuration |
|---|---|---|
| **Frontend Client** | **Vercel** | Set root directory to `client`. Bind the environment variable `NEXT_PUBLIC_API_URL` to your live server API URL. |
| **Backend Server** | **Render / Koyeb / Fly.io** | Set base directory to `server`. Add environment variables for MongoDB, JWT, Google OAuth, and point `CLIENT_URL` to your production frontend domain. |
| **Database** | **MongoDB Atlas** | Spin up a shared cloud M0 cluster for free database hosting. |

> [!IMPORTANT]
> Ensure that you whitelist the production domain callback (`https://your-api-domain.com/api/users/google/callback`) in the Google Cloud Credentials Console, and verify that the backend `CLIENT_URL` CORS settings align with your deployed client address.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more details.

---

<div align="center">

Built with ❤️ by [Shobhit](https://github.com/shobhit2603).

</div>
