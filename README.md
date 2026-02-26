# 🎵 Moody Player – AI Mood Based Music App

Moody Player is an AI-powered music application that detects the user's facial expression using the camera and recommends songs based on the detected mood.

This project combines Computer Vision, Full Stack Development, and Cloud Storage into one seamless experience.

---

## 🚀 Features

- 🎥 Real-time face detection using camera
- 🧠 Mood detection using Face-API.js
- 🎶 Automatic mood-based song recommendation
- ▶️ Play / Pause music
- ⏩ 10s forward / backward controls
- 🎚️ Seekable progress bar
- 🔁 Auto next song
- 🎧 Fixed bottom mini-player
- 🌙 Clean dark UI
- 📱 Fully responsive (Desktop + Mobile)
- ☁️ Audio stored using ImageKit (Cloud)

---

## 🛠️ Tech Stack

### Frontend

- React (Vite)
- Face-api.js
- Axios
- CSS3

### Backend

- Node.js
- Express.js
- MongoDB (Mongoose)

### Cloud & Storage

- ImageKit (Audio storage)
- MongoDB Atlas

---

## 🧠 How It Works

1. User opens the app.
2. Camera captures face.
3. Face-API detects dominant emotion.
4. Frontend sends mood to backend.
5. Backend fetches mood-related songs from MongoDB.
6. Songs appear instantly.
7. User plays songs using mini-player.

---

## 📂 Project Structure

moody-player/
│
├── backend/
│ ├── src/
│ ├── server.js
│ └── .env
│
├── frontend/
│ ├── src/
│ ├── public/models
│ └── vite.config.js
│
└── README.md

---

## 🔐 Environment Variables

Create a `.env` file inside the backend folder:

MONGODB_URL=your_mongodb_connection_string
IMAGEKIT_PUBLIC_KEY=your_key
IMAGEKIT_PRIVATE_KEY=your_key
IMAGEKIT_URL_ENDPOINT=your_endpoint

⚠️ Do not push `.env` to GitHub.

---

## ▶️ Installation & Setup

### 1️⃣ Clone the repository

git clone https://github.com/devsarthak-1503/moody-player.git

### 2️⃣ Install backend dependencies

cd backend
npm start

### 3️⃣ Install frontend dependencies

cd ../frontend
npm install

### 4️⃣ Run backend

cd backend
npm start

### 5️⃣ Run frontend

cd frontend
npm run dev

---

## 🌟 Future Improvements

- Spotify-like UI upgrade
- Playlist system
- User authentication
- AI (Song) based mood detection
- Real-time mood auto-detection
- Animated audio visualizer
- Deployment (Vercel + Render)

---

## 👨‍💻 Author

Sarthak
Full Stack Developer
Building AI-powered products 🚀

---

## ⭐ If you like this project

Give it a star on GitHub and feel free to fork it!
