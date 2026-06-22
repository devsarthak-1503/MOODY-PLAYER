import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Camera, Search as SearchIcon, Library as LibraryIcon, Heart, User, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import HomePg from './pages/Home';
import MoodDetector from './pages/MoodDetector';
import Search from './pages/Search';
import Library from './pages/Library';
import Favorites from './pages/Favorites';
import PlaylistDetails from './pages/PlaylistDetails';
import Profile from './pages/Profile';

// Components & Context
import Sidebar from './components/Sidebar';
import BottomPlayer from './components/BottomPlayer';
import ProtectedRoute from './components/ProtectedRoute';
import { AudioPlayerProvider } from './context/AudioPlayerContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  const userName = localStorage.getItem('userName') || 'Sarthak';
  const userAvatar = localStorage.getItem('userAvatar') || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userName}`;

  const mobileNavItems = [
    { to: '/', name: 'Home', icon: Home },
    { to: '/mood', name: 'Mood Radar', icon: Camera },
    { to: '/search', name: 'Search', icon: SearchIcon },
    { to: '/library', name: 'Library', icon: LibraryIcon },
    { to: '/favorites', name: 'Favorites', icon: Heart },
    { to: '/profile', name: 'Profile', icon: User },
  ];

  const handleResetData = () => {
    if (window.confirm('Reset all playlists, favorites, and mood history?')) {
      localStorage.clear();
      setMobileMenuOpen(false);
      window.location.href = '/';
    }
  };

  if (isAuthPage) {
    return <div className="w-full min-h-screen text-white bg-darkBg">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-darkBg text-textPrimary flex flex-col">
      {/* MOBILE TOP NAVIGATION BAR */}
      <header className="md:hidden h-16 glass-panel border-b border-white/5 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center text-darkBg shadow-premium font-extrabold text-sm">
            M
          </div>
          <span className="font-extrabold text-sm tracking-tight">
            Moody<span className="text-primaryAccent font-light">Player</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <img
            src={userAvatar}
            alt={userName}
            onClick={() => window.location.href = '/profile'}
            className="w-7 h-7 rounded-full object-cover bg-darkBg border border-white/10"
          />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 hover:bg-white/5 rounded-lg text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-16 left-0 right-0 bg-darkSurface/95 backdrop-blur-lg border-b border-white/5 z-20 flex flex-col p-4 space-y-2 shadow-2xl"
          >
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.to}
                  href={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 text-sm text-textSecondary hover:text-white transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              );
            })}
            <button
              onClick={handleResetData}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-cyan-500/10 text-sm text-cyan-400 text-left transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset Session</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 relative">
        {/* DESKTOP SIDEBAR */}
        <Sidebar />

        {/* MAIN BODY AREA */}
        <main className="flex-1 min-w-0 md:pl-64 pt-20 md:pt-6">
          {children}
        </main>
      </div>

      {/* STICKY BOTTOM PLAYER */}
      <BottomPlayer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AudioPlayerProvider>
        <Layout>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Library & Playback Routes */}
            <Route path="/" element={<ProtectedRoute><HomePg /></ProtectedRoute>} />
            <Route path="/mood" element={<ProtectedRoute><MoodDetector /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/playlist/:id" element={<ProtectedRoute><PlaylistDetails /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AudioPlayerProvider>
    </Router>
  );
}

export default App;
