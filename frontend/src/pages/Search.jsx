import React, { useState, useEffect, useContext, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Play, Music, User, Disc, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AudioPlayerContext } from '../context/AudioPlayerContext';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const artistParam = searchParams.get('artist');

  const { playTrack } = useContext(AudioPlayerContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all | songs | artists | albums
  const [recentSearches, setRecentSearches] = useState([]);

  // Artist Detail view state
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistTracks, setArtistTracks] = useState([]);
  const [artistLoading, setArtistLoading] = useState(false);

  const debounceTimer = useRef(null);

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Fetch artist profile if artist query parameter changes
  useEffect(() => {
    if (artistParam) {
      fetchArtistDetails(artistParam);
    } else {
      setSelectedArtist(null);
      setArtistTracks([]);
    }
  }, [artistParam]);

  const fetchArtistDetails = async (id) => {
    setArtistLoading(true);
    try {
      const res = await axios.get(`/api/music/artist/${id}`);
      setSelectedArtist(res.data.artist);
      setArtistTracks(res.data.tracks);
    } catch (err) {
      console.error('Error fetching artist detail:', err);
    } finally {
      setArtistLoading(false);
    }
  };

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`/api/music/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim()) {
      debounceTimer.current = setTimeout(() => {
        handleSearch(query);
        saveRecentSearch(query);
      }, 500);
    } else {
      setResults([]);
    }

    return () => clearTimeout(debounceTimer.current);
  }, [query]);

  const saveRecentSearch = (item) => {
    let searches = [...recentSearches];
    searches = searches.filter(s => s !== item);
    searches.unshift(item);
    searches = searches.slice(0, 5); // Limit 5
    setRecentSearches(searches);
    localStorage.setItem('recentSearches', JSON.stringify(searches));
  };

  const clearRecentSearch = (item, e) => {
    e.stopPropagation();
    const searches = recentSearches.filter(s => s !== item);
    setRecentSearches(searches);
    localStorage.setItem('recentSearches', JSON.stringify(searches));
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const selectRecent = (item) => {
    setQuery(item);
  };

  const selectArtist = (artistId) => {
    setSearchParams({ artist: artistId });
  };

  const clearArtistView = () => {
    setSearchParams({});
  };

  // Filter logic based on tab selected
  const getFilteredResults = () => {
    if (activeFilter === 'all') return results;
    if (activeFilter === 'songs') return results.filter(r => r.title);
    
    // Simplistic categorizations for demo UI filters
    if (activeFilter === 'artists') {
      const uniqueArtists = [];
      const artistMap = new Map();
      results.forEach(r => {
        if (r.artist && !artistMap.has(r.artist.id)) {
          artistMap.set(r.artist.id, true);
          uniqueArtists.push(r);
        }
      });
      return uniqueArtists;
    }
    if (activeFilter === 'albums') {
      const uniqueAlbums = [];
      const albumMap = new Map();
      results.forEach(r => {
        if (r.album && !albumMap.has(r.album.id)) {
          albumMap.set(r.album.id, true);
          uniqueAlbums.push(r);
        }
      });
      return uniqueAlbums;
    }
    return results;
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="pb-32 pt-6 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      
      {/* ARTIST PROFILE OVERLAY DETAIL VIEW */}
      <AnimatePresence>
        {selectedArtist ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            {/* Back button */}
            <button
              onClick={clearArtistView}
              className="flex items-center gap-2 text-textSecondary hover:text-white mb-6 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </button>

            {/* Artist Cover Banner */}
            <div className="relative rounded-3xl h-64 md:h-80 overflow-hidden bg-cover bg-center border border-white/5 flex items-end p-6 md:p-10"
                 style={{ backgroundImage: `linear-gradient(to top, rgba(11,15,20,0.95), transparent), url(${selectedArtist.picture})` }}>
              <div className="flex items-center gap-6 z-10">
                <img
                  src={selectedArtist.picture}
                  alt={selectedArtist.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white/10 object-cover shadow-2xl"
                />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-primaryAccent px-2.5 py-1 bg-primaryAccent/10 border border-primaryAccent/20 rounded-full">
                    Verified Artist
                  </span>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-3">{selectedArtist.name}</h2>
                  <p className="text-xs md:text-sm text-textSecondary mt-2">
                    {Number(selectedArtist.nb_fan).toLocaleString()} Fans
                  </p>
                </div>
              </div>
            </div>

            {/* Top Tracks */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-6">Popular Tracks</h3>
              {artistLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {artistTracks.map((track, index) => (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track, artistTracks)}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-sm font-bold text-textSecondary w-4 text-center">
                          {index + 1}
                        </span>
                        <img
                          src={track.album?.cover || 'https://via.placeholder.com/150'}
                          alt={track.title}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">{track.title}</h4>
                          <p className="text-xs text-textSecondary truncate">{track.album?.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-textSecondary">
                        <span>{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
                        <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white text-white group-hover:text-darkBg flex items-center justify-center transition-colors">
                          <Play className="w-4 h-4 fill-current translate-x-[0.5px]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Search Input Box */}
            <div className="relative w-full max-w-2xl">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-textSecondary" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search songs, artists, albums..."
                className="w-full pl-14 pr-12 py-4 bg-white/5 border border-white/5 focus:border-primaryAccent focus:ring-1 focus:ring-primaryAccent rounded-2xl text-base text-white placeholder-textSecondary/50 outline-none transition-all shadow-premium"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-textSecondary hover:text-white p-1 rounded-full hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter Tags */}
            {results.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {['all', 'songs', 'artists', 'albums'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterChange(filter)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors border ${
                      activeFilter === filter
                        ? 'bg-primaryAccent/20 text-primaryAccent border-primaryAccent/30 shadow-accent-glow'
                        : 'bg-white/5 text-textSecondary border-white/5 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}

            {/* Awaiting searches / Suggestions screen */}
            {!query && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-white mb-4">Recent Searches</h3>
                    <div className="space-y-2">
                      {recentSearches.map((item) => (
                        <div
                          key={item}
                          onClick={() => selectRecent(item)}
                          className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl cursor-pointer group text-sm text-white"
                        >
                          <span className="truncate">{item}</span>
                          <button
                            onClick={(e) => clearRecentSearch(item, e)}
                            className="text-textSecondary hover:text-white p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular categories */}
                <div>
                  <h3 className="text-base font-bold text-white mb-4">Popular Genres</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'Pop Hits', query: 'pop hits', bg: 'from-pink-500 to-rose-600' },
                      { name: 'Electronic', query: 'electro dance house', bg: 'from-purple-500 to-indigo-600' },
                      { name: 'Lofi Chill', query: 'lofi study beats', bg: 'from-emerald-500 to-teal-600' },
                      { name: 'Acoustic Folk', query: 'acoustic folk guitar', bg: 'from-amber-500 to-orange-600' }
                    ].map(cat => (
                      <div
                        key={cat.name}
                        onClick={() => selectRecent(cat.query)}
                        className={`p-5 rounded-2xl bg-gradient-to-br ${cat.bg} text-white font-bold text-sm cursor-pointer shadow-premium hover:opacity-90 relative overflow-hidden group`}
                      >
                        <div className="absolute right-[-10px] bottom-[-10px] w-16 h-16 bg-white/10 rounded-full blur-[8px] group-hover:scale-110 transition-transform" />
                        {cat.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Search Results Display */}
            {query && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Search Results</h3>
                
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : filteredResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredResults.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => playTrack(item, filteredResults)}
                        className="flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition-all group cursor-pointer relative"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={item.album?.cover || 'https://via.placeholder.com/150'}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate">{item.title}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-textSecondary mt-0.5">
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectArtist(item.artist.id);
                                }}
                                className="hover:underline hover:text-white"
                              >
                                {item.artist?.name}
                              </span>
                              <span>•</span>
                              <span className="truncate max-w-[120px]">{item.album?.title}</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Play Control */}
                        <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white text-white group-hover:text-darkBg flex items-center justify-center transition-colors">
                          <Play className="w-4 h-4 fill-current translate-x-[0.5px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-textSecondary text-sm">
                    No results found matching "{query}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
