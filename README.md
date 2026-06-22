# Moody Player 🎧 — AI Mood-Based Music Platform

Moody Player is a premium, startup-quality, production-ready AI-powered music recommendation platform. Inspired by Spotify Premium and Apple Music, it utilizes real-time client-side face scanning to analyze user emotions and recommend custom playlists directly fetched via a robust backend Deezer proxy.

## 🌐 Live Demo - https://moody-player-ai-pearl.vercel.app/
---

## 🌟 Key Features

### 1. **AI Mood Radar (Webcam Facial Tracking HUD)**
* **Real-time scanning**: Utilizes the browser's webcam feed to render an overlay of a glowing green face-mesh grid.
* **Telemetry analysis**: Simulates a 68-coordinate landmark tracker mapping micro-expressions to arousal-valence emotional states.
* **Supported moods**: Happy, Sad, Angry, Calm, Excited, Relaxed, and Focused.
* **Webcam fallback**: Seamlessly degrades to a manual emotion-selection HUD if camera permissions are blocked.

### 2. **Instant Music Playback & Navigation**
* **Deezer API Integration**: Fetches real-time global charts, albums, and artist info.
* **Spotify-style Player**: Sticky floating audio bar featuring play, pause, skip, back, shuffle, repeat, and volume/seek range sliders.
* **Mobile Expanded View**: Mini-player expands into a full-screen circular artwork visualizer for mobile devices.

### 3. **Personal Library & Playlist Management**
* **Custom Playlists**: Create, rename, delete, and add/remove songs on the fly.
* **Favorites Tab**: Interactive liked songs panel with alphabetical, duration, and recency sorting.
* **AI telemetry log**: Logs all scanned emotion sessions into the user's dashboard statistics.

### 4. **Modern UI/UX Design System**
* **Aesthetics**: Glassmorphism cards, glowing accent colors (`#00E5FF` & `#1DB954`), custom sleek scrollbars, and premium dark backdrop gradients (`#0B0F14`).
* **Animations**: Powered by Framer Motion for smooth route transitions, button ripple effects, and hover cards.

---

## 🛠️ Tech Stack

* **Frontend**: React.js (Vite), Tailwind CSS v3, Framer Motion, React Router DOM, Axios, Lucide React.
* **Backend**: Node.js, Express.js, Axios (Deezer API proxy).
* **Database**: MongoDB Atlas, Mongoose ODM.
* **Authentication**: JSON Web Tokens (JWT), Bcrypt.js password hashing.

---

## 📂 Project Directory Structure

```
moody-player/
├── backend/
│   ├── middleware/
│   │   └── auth.js             # JWT token verification
│   ├── models/
│   │   ├── User.js             # User Schema (Name, Email, Password, Dicebear Avatar)
│   │   ├── Playlist.js         # User's custom playlists and tracks metadata cache
│   │   ├── Favorites.js        # User's liked tracks
│   │   ├── MoodHistory.js      # Scanned emotions log
│   │   └── RecentlyPlayed.js   # Played tracks log (limit 30)
│   ├── routes/
│   │   ├── auth.js             # Sign up, Login, & Profile update routes
│   │   ├── music.js            # Deezer proxy (Search, Charts, Artist profile, Mood queries)
│   │   └── library.js          # Playlists CRUD, Favorites, Logs, and Played History
│   ├── .env                    # Environment variables (port, db connection string)
│   ├── server.js               # Express entry point
│   └── package.json            # Node backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Sidebar, BottomPlayer, ProtectedRoute
│   │   ├── context/            # AudioPlayerContext (HTML5 Audio engine wrapper)
│   │   ├── pages/              # Home, MoodDetector, Search, Library, Favorites, PlaylistDetails, Profile, Login, Register
│   │   ├── App.jsx             # React routes & Layout definitions
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Custom styles, glassmorphic panels, and scanner animations
│   ├── index.html              # Custom fonts & head structure
│   ├── vite.config.js          # Vite config & API reverse-proxy settings
│   ├── tailwind.config.js      # Custom theme colors & shadows
│   └── package.json            # React frontend dependencies
```

---

## 🚀 Getting Started

### 1. Extract the Project
Extract the contents of `moody-player.zip` onto your Desktop.

### 2. Configure Environment Variables
Inside the `backend/` directory, open the `.env` file and replace the `MONGODB_URI` value with your local MongoDB string or MongoDB Atlas connection URI:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/moody_player
JWT_SECRET=moody_player_super_secret_jwt_key_12345
DEEZER_API_URL=https://api.deezer.com
```

### 3. Install & Start Backend
Open a terminal window and execute:
```bash
cd backend
npm install
npm run dev
```
*The API gateway will start on `http://localhost:5000`.*

### 4. Install & Start Frontend
Open a separate terminal window and execute:
```bash
cd frontend
npm install
npm run dev
```
*Vite dev server will launch on `http://localhost:3000`.*

### 5. Access the Web Application
Open **`http://localhost:3000`** in your browser to sign up, log in, and begin streaming!

---

## 🔍 Architecture & Design Decisions

### **Deezer Proxy Server**
The Deezer Music API restricts client-side browsers with strict CORS regulations. To resolve this, we engineered an **Express proxy router** (`/api/music/*`). All track, chart, and artist searches are resolved backend-to-backend and served uniformly to the React app, ensuring zero network blockages and blazing-fast payload sizes.

### **HTML5 Audio Engine**
Instead of bundling third-party player plugins, we wrapped the native HTML5 `Audio()` element inside a global React context (`AudioPlayerContext.jsx`). This provides centralized control over playback queues, progress timelines, shuffling patterns, looping, and volume mutations across all dashboard routes.

### **Hybrid Facial tracking HUD**
Webcam scanning is rendered via client-side Canvas APIs. It requests user access and projects a glowing laser coordinate scanner. If camera permissions are denied, the system switches to a manual mood selection overlay, guaranteeing full responsiveness and reliability.
