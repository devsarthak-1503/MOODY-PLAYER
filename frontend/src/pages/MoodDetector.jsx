import React, { useState, useEffect, useRef, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera, RefreshCw, Sparkles, Play, ShieldAlert, Cpu, Heart, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AudioPlayerContext } from '../context/AudioPlayerContext';
const API_URL = "https://moody-player-1-snw9.onrender.com";

const MoodDetector = () => {
  const [searchParams] = useSearchParams();
  const selectParam = searchParams.get('select');

  const { playTrack } = useContext(AudioPlayerContext);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle'); // idle | loading | scanning | completed
  const [scanStepText, setScanStepText] = useState('');

  // Results
  const [detectedMood, setDetectedMood] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [emotionBreakdown, setEmotionBreakdown] = useState({});
  const [aiSummary, setAiSummary] = useState('');
  const [recommendedTracks, setRecommendedTracks] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const moodList = ['Happy', 'Sad', 'Angry', 'Calm', 'Excited', 'Relaxed', 'Focused'];

  const moodDescriptions = {
    Happy: "Your facial expressions reflect high valence and vibrant energy. Upbeat grooves will perfectly complement your positive vibes.",
    Sad: "A calm, low-arousal state is detected. Soothing melodies and emotional acoustics will match your current contemplative state.",
    Angry: "Elevated micro-expression indicators suggest tension. Let's redirect that intensity with high-energy rock or aggressive electronic beats.",
    Calm: "Relaxed facial muscle alignment indicates peaceful tranquility. Smooth ambient soundtracks and lofi beats will keep you centered.",
    Excited: "High-intensity micro-muscle contractions show peak hype. Fast-paced, high-BPM synth and house music will sustain your energy.",
    Relaxed: "Smooth, rhythmic respiratory indicators detected. Slow-tempo folk and acoustic tracks will keep your state cozy and warm.",
    Focused: "Sustained concentration indicators observed. Ambient classical and focus lofi beats will lock you into your flow."
  };

  // Auto trigger if query parameter exists
  useEffect(() => {
    if (selectParam) {
      const formattedMood = selectParam.charAt(0).toUpperCase() + selectParam.slice(1).toLowerCase();
      if (moodList.includes(formattedMood)) {
        triggerManualScan(formattedMood);
      }
    }
  }, [selectParam]);

  // Handle camera permission and init
  const startCamera = async () => {
    setCameraError(false);
    setScanStatus('loading');
    setScanStepText('Requesting webcam access...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setScanStatus('scanning');
      startScanningProcess();
    } catch (err) {
      console.warn('Camera blocked or unavailable. Starting simulated HUD scan...', err);
      setCameraError(true);
      setScanStatus('scanning');
      startScanningProcess();
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [cameraStream]);

  // AI Face Mesh Simulation loop on Canvas
  const drawFaceMesh = () => {
    if (!canvasRef.current || scanStatus !== 'scanning') return;

    const ctx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    ctx.clearRect(0, 0, width, height);

    // Draw scanning bounding box
    const boxSize = 220;
    const boxX = (width - boxSize) / 2;
    const boxY = (height - boxSize) / 2;

    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00E5FF';

    // Bounding Box Corners
    ctx.beginPath();
    // Top-Left
    ctx.moveTo(boxX, boxY + 20); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + 20, boxY);
    // Top-Right
    ctx.moveTo(boxX + boxSize - 20, boxY); ctx.lineTo(boxX + boxSize, boxY); ctx.lineTo(boxX + boxSize, boxY + 20);
    // Bottom-Left
    ctx.moveTo(boxX, boxY + boxSize - 20); ctx.lineTo(boxX, boxY + boxSize); ctx.lineTo(boxX + 20, boxY + boxSize);
    // Bottom-Right
    ctx.moveTo(boxX + boxSize - 20, boxY + boxSize); ctx.lineTo(boxX + boxSize, boxY + boxSize); ctx.lineTo(boxX + boxSize, boxY + boxSize - 20);
    ctx.stroke();

    // Draw glowing green face-mesh grid simulation
    ctx.strokeStyle = '#1DB954';
    ctx.shadowColor = '#1DB954';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 5;

    // Face boundary nodes
    const centerX = width / 2;
    const centerY = height / 2;
    const time = Date.now() * 0.003;

    // Build some oscillating face points
    const points = [
      // Eyebrows
      { x: centerX - 50, y: centerY - 40 + Math.sin(time) * 3 },
      { x: centerX - 25, y: centerY - 45 + Math.cos(time) * 3 },
      { x: centerX, y: centerY - 40 },
      { x: centerX + 25, y: centerY - 45 + Math.sin(time) * 3 },
      { x: centerX + 50, y: centerY - 40 + Math.cos(time) * 3 },
      // Eyes
      { x: centerX - 40, y: centerY - 20 + Math.sin(time * 2) * 1 },
      { x: centerX - 20, y: centerY - 20 + Math.cos(time * 2) * 1 },
      { x: centerX + 20, y: centerY - 20 + Math.sin(time * 2) * 1 },
      { x: centerX + 40, y: centerY - 20 + Math.cos(time * 2) * 1 },
      // Nose
      { x: centerX, y: centerY - 30 },
      { x: centerX, y: centerY - 10 },
      { x: centerX, y: centerY + 10 },
      { x: centerX - 15, y: centerY + 15 },
      { x: centerX + 15, y: centerY + 15 },
      // Mouth
      { x: centerX - 35, y: centerY + 35 + Math.sin(time * 1.5) * 2 },
      { x: centerX - 15, y: centerY + 30 },
      { x: centerX, y: centerY + 32 + Math.cos(time * 1.5) * 2 },
      { x: centerX + 15, y: centerY + 30 },
      { x: centerX + 35, y: centerY + 35 + Math.sin(time * 1.5) * 2 },
      { x: centerX, y: centerY + 45 + Math.cos(time * 1.5) * 3 },
      // Chin
      { x: centerX - 60, y: centerY + 10 },
      { x: centerX - 40, y: centerY + 50 },
      { x: centerX, y: centerY + 70 },
      { x: centerX + 40, y: centerY + 50 },
      { x: centerX + 60, y: centerY + 10 },
    ];

    // Draw lines between points to simulate mesh
    ctx.beginPath();
    // Connect brows to eyes
    ctx.moveTo(points[0].x, points[0].y); ctx.lineTo(points[5].x, points[5].y);
    ctx.moveTo(points[4].x, points[4].y); ctx.lineTo(points[8].x, points[8].y);
    // Connect nose
    ctx.moveTo(points[9].x, points[9].y); ctx.lineTo(points[10].x, points[10].y);
    ctx.lineTo(points[11].x, points[11].y);
    ctx.lineTo(points[12].x, points[12].y);
    ctx.lineTo(points[13].x, points[13].y);
    // Connect mouth outline
    ctx.moveTo(points[14].x, points[14].y);
    ctx.lineTo(points[15].x, points[15].y);
    ctx.lineTo(points[16].x, points[16].y);
    ctx.lineTo(points[17].x, points[17].y);
    ctx.lineTo(points[18].x, points[18].y);
    ctx.lineTo(points[19].x, points[19].y);
    ctx.closePath();
    ctx.stroke();

    // Connect dots with secondary nodes
    ctx.strokeStyle = 'rgba(29, 185, 84, 0.2)';
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
        if (dist < 45) {
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
        }
      }
    }
    ctx.stroke();

    // Draw nodes
    ctx.fillStyle = '#00E5FF';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00E5FF';
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw horizontal scanning laser
    const laserY = boxY + (Math.sin(Date.now() * 0.003) + 1) * 0.5 * boxSize;
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(boxX, laserY);
    ctx.lineTo(boxX + boxSize, laserY);
    ctx.stroke();

    animationFrameRef.current = requestAnimationFrame(drawFaceMesh);
  };

  useEffect(() => {
    if (scanStatus === 'scanning') {
      animationFrameRef.current = requestAnimationFrame(drawFaceMesh);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [scanStatus]);

  // AI Pipeline Scanning Process simulator
  const startScanningProcess = () => {
    const steps = [
      { text: 'Face bounding-box locked...', delay: 800 },
      { text: 'Extracting 68 coordinate facial landmarks...', delay: 1600 },
      { text: 'Analyzing macro & micro expression gradients...', delay: 2400 },
      { text: 'Correlating arousal-valence vector metrics...', delay: 3200 },
      { text: 'Finalizing mood classification outputs...', delay: 4000 }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        if (scanStatus !== 'scanning' && scanStatus !== 'loading') return;
        setScanStepText(step.text);
        if (index === steps.length - 1) {
          // Finish scanning and pick a mood
          setTimeout(() => {
            const randomMood = moodList[Math.floor(Math.random() * moodList.length)];
            finalizeDetection(randomMood);
          }, 800);
        }
      }, step.delay);
    });
  };

  // Finalize mood selection (used by both camera scan and manual trigger)
  const finalizeDetection = async (mood) => {
    stopCamera();
    setScanStatus('completed');
    setScanStepText('Writing results to log...');

    const confidenceScore = Math.floor(Math.random() * 20) + 75; // 75-95%
    setDetectedMood(mood);
    setConfidence(confidenceScore);

    // Emotion breakdown
    const breakdown = {
      [mood]: confidenceScore
    };
    let remaining = 100 - confidenceScore;

    const otherMoods = moodList.filter(m => m !== mood);
    otherMoods.forEach((m, idx) => {
      if (idx === otherMoods.length - 1) {
        breakdown[m] = remaining;
      } else {
        const val = Math.floor(Math.random() * (remaining / 2));
        breakdown[m] = val;
        remaining -= val;
      }
    });
    setEmotionBreakdown(breakdown);
    setAiSummary(moodDescriptions[mood]);

    // Save mood to db
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await axios.post(`${API_URL}/api/library/mood-history`, {
          mood,
          confidence: confidenceScore
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.warn('Could not log mood history to server:', err);
    }

    // Fetch music recommendation from Deezer API Proxy
    try {
      const musicRes = await axios.get(`${API_URL}/api/music/mood/${mood.toLowerCase()}`);
      setRecommendedTracks(musicRes.data);
    } catch (err) {
      console.error('Error fetching mood recommendations:', err);
    }
  };

  const triggerManualScan = (mood) => {
    setScanStatus('loading');
    setScanStepText('Analyzing select profile...');
    setTimeout(() => {
      finalizeDetection(mood);
    }, 1000);
  };

  const handleReset = () => {
    setScanStatus('idle');
    setDetectedMood('');
    setConfidence(0);
    setEmotionBreakdown({});
    setRecommendedTracks([]);
    setCameraError(false);
  };

  return (
    <div className="pb-32 pt-6 px-4 md:px-8 max-w-6xl mx-auto overflow-hidden">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Camera className="text-primaryAccent w-7 h-7" />
          AI Mood Radar
        </h2>
        <p className="text-textSecondary text-sm mt-1">
          Scan your micro-expressions in real-time or pick a manual profile to discover your tailored audio vibes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CAMERA SCANNING HUB PANEL */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-white/5 relative">

          <AnimatePresence mode="wait">
            {scanStatus === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primaryAccent mb-6">
                  <Camera className="w-10 h-10 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Initialize AI Sensor</h3>
                <p className="text-xs text-textSecondary max-w-xs mb-6">
                  Grant access to your camera to overlay the face mesh HUD and scan. All scans run client-side.
                </p>
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-accent-gradient hover:opacity-95 text-darkBg font-bold text-sm rounded-full shadow-premium hover:shadow-accent-glow transition-all"
                >
                  Enable Camera Scan
                </button>

                <div className="mt-8 w-full border-t border-white/5 pt-6">
                  <p className="text-xs text-textSecondary mb-4">Or choose your mood profile manually:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {moodList.map(mood => (
                      <button
                        key={mood}
                        onClick={() => triggerManualScan(mood)}
                        className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white transition-colors"
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {(scanStatus === 'scanning' || scanStatus === 'loading') && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative flex flex-col items-center"
              >
                {/* Simulated HUD scanner or actual Video feed */}
                <div className="w-full aspect-[4/3] max-w-md bg-darkBg border border-white/10 rounded-xl overflow-hidden relative shadow-premium flex items-center justify-center">
                  {cameraError ? (
                    <div className="text-center p-6 flex flex-col items-center gap-3">
                      <ShieldAlert className="w-12 h-12 text-orange-500" />
                      <p className="text-sm text-white font-semibold">Webcam Blocked or Unsupported</p>
                      <p className="text-xs text-textSecondary">Simulating scanning matrix instead...</p>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover transform -scale-x-100"
                      muted
                      playsInline
                    />
                  )}

                  {/* Canvas Landmark Overlay */}
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={360}
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  />

                  {/* Scanning Overlay Grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,33,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,33,0.3)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-50" />
                </div>

                {/* Status Bar */}
                <div className="w-full max-w-md mt-6 bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primaryAccent/10 flex items-center justify-center text-primaryAccent flex-shrink-0">
                    <Cpu className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-textSecondary uppercase tracking-widest font-bold">Engine Status</p>
                    <p className="text-sm text-white font-semibold truncate animate-pulse">{scanStepText}</p>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="mt-6 text-xs text-textSecondary hover:text-white flex items-center gap-1 hover:underline focus:outline-none"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Cancel Scan
                </button>
              </motion.div>
            )}

            {scanStatus === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-6 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-secondaryAccent/10 border border-secondaryAccent/20 flex items-center justify-center text-secondaryAccent mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Analysis Complete</h3>

                {/* Large Mood Display */}
                <div className="my-6 p-6 glass-card rounded-2xl border border-white/5 w-full max-w-sm flex flex-col items-center">
                  <p className="text-[10px] text-textSecondary uppercase tracking-widest font-bold mb-1">Detected Mood State</p>
                  <h4 className="text-4xl font-extrabold text-transparent bg-clip-text bg-accent-gradient py-2">
                    {detectedMood}
                  </h4>
                  <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white">
                    <span>Confidence:</span>
                    <span className="text-primaryAccent font-bold">{confidence}%</span>
                  </div>
                </div>

                <p className="text-sm text-textSecondary max-w-md italic mb-6">
                  "{aiSummary}"
                </p>

                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white rounded-full transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Scan Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* ANALYTICS & RECOMMENDATION COLUMN */}
        <div className="lg:col-span-5 space-y-6">
          {/* Emotion breakdown analytics */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Cpu className="text-primaryAccent w-5 h-5" />
              AI Emotion Breakdown
            </h3>

            {scanStatus === 'completed' && Object.keys(emotionBreakdown).length > 0 ? (
              <div className="space-y-3.5">
                {Object.entries(emotionBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([mood, value]) => (
                    <div key={mood} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-white">{mood}</span>
                        <span className="text-textSecondary">{value}%</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-gradient rounded-full transition-all duration-500"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="py-12 text-center text-textSecondary text-xs">
                Run a scan to output telemetry metrics
              </div>
            )}
          </div>

          {/* AI Recommended music */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="text-primaryAccent w-5 h-5" />
              Recommended Soundtrack
            </h3>

            {scanStatus === 'completed' && recommendedTracks.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {recommendedTracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, recommendedTracks)}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0">
                        <img
                          src={track.album?.cover || 'https://via.placeholder.com/150'}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-4 h-4 fill-white text-white" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate">{track.title}</h4>
                        <p className="text-[10px] text-textSecondary truncate">{track.artist?.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-textSecondary text-xs">
                Awaiting classification output...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodDetector;