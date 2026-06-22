import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Camera, Search, Library, Heart, User, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const userName = localStorage.getItem('userName') || 'Sarthak';
  const userAvatar = localStorage.getItem('userAvatar') || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userName}`;

  const navItems = [
    { to: '/', name: 'Home', icon: Home },
    { to: '/mood', name: 'Mood Radar', icon: Camera, highlight: true },
    { to: '/search', name: 'Search', icon: Search },
    { to: '/library', name: 'My Library', icon: Library },
    { to: '/favorites', name: 'Favorites', icon: Heart },
    { to: '/profile', name: 'Profile', icon: User },
  ];

  const handleResetData = () => {
    if (window.confirm('Reset all playlists, favorites, and mood history?')) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 glass-panel border-r border-white/5 py-6 px-4 flex flex-col justify-between z-30 hidden md:flex">
      {/* Brand Logo */}
      <div className="flex flex-col">
        <NavLink to="/" className="flex items-center gap-3 px-3 py-2 mb-8 group">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center text-darkBg shadow-premium animate-glow"
            whileHover={{ scale: 1.1, rotate: 10 }}
          >
            <span className="font-extrabold text-xl">M</span>
          </motion.div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-primaryAccent transition-colors">
              Moody<span className="text-primaryAccent font-light">Player</span>
            </h1>
            <span className="text-[10px] text-secondaryAccent tracking-wider uppercase font-semibold">AI Powered</span>
          </div>
        </NavLink>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group font-medium ${
                    isActive
                      ? item.highlight
                        ? 'bg-primaryAccent/20 text-primaryAccent border border-primaryAccent/30 shadow-accent-glow'
                        : 'bg-white/10 text-white border border-white/10'
                      : 'text-textSecondary hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  item.highlight ? 'text-primaryAccent' : ''
                }`} />
                <span>{item.name}</span>
                {item.highlight && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-primaryAccent animate-ping" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile / Reset footer */}
      <div className="border-t border-white/5 pt-4">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-3 bg-white/5 rounded-xl border border-white/5">
          <img
            src={userAvatar}
            alt={userName}
            className="w-9 h-9 rounded-full object-cover bg-darkBg border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-[10px] text-textSecondary truncate">Premium Member</p>
          </div>
        </div>

        <button
          onClick={handleResetData}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-textSecondary hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent transition-all duration-200 group font-medium"
        >
          <RotateCcw className="w-5 h-5 group-hover:rotate-45 transition-transform" />
          <span>Reset Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
