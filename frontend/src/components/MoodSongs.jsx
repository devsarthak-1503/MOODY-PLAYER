import { useState, useRef } from "react"
import './MoodSongs.css'

const MoodSongs = ({ Songs }) => {

    const [currentIndex, setCurrentIndex] = useState(null);
    const audioRef = useRef(null);
    const [progress, setProgress] = useState(0);

    const playSong = (index) => {
        setCurrentIndex(index);
        setTimeout(() => {
            audioRef.current.play();
        }, 0);
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        audioRef.current.paused
            ? audioRef.current.play()
            : audioRef.current.pause();
    };

    const nextSong = () => {
        if (currentIndex === null) return;
        const next = (currentIndex + 1) % Songs.length;
        playSong(next);
    };

    const prevSong = () => {
        if (currentIndex === null) return;
        const prev = (currentIndex - 1 + Songs.length) % Songs.length;
        playSong(prev);
    };

    const forward10 = () => {
        audioRef.current.currentTime += 10;
    };

    const backward10 = () => {
        audioRef.current.currentTime -= 10;
    };

    const handleTimeUpdate = () => {
        const percent =
            (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(percent || 0);
    };

    const handleSeek = (e) => {
        const seekTo =
            (e.target.value / 100) * audioRef.current.duration;
        audioRef.current.currentTime = seekTo;
    };

    return (
        <div className="mood-songs">

            {/* SONG LIST */}
            {Array.isArray(Songs) && Songs.map((song, index) => (
                <div key={index} style={{ marginBottom: "15px" }}>
                    <strong>{song.title}</strong>
                    <br />
                    <small>{song.artist}</small>
                    <br />
                    <button
                        onClick={() => {
                            if (currentIndex === index) {
                                togglePlay();
                            } else {
                                playSong(index);
                            }
                        }}
                    >
                        {currentIndex === index && audioRef.current && !audioRef.current.paused
                            ? "⏸ Pause"
                            : "▶ Play"}
                    </button>
                </div>
            ))}

            {/* MINI PLAYER */}
            {currentIndex !== null && (
                <div style={{
                    marginTop: "30px",
                    padding: "15px",
                    borderTop: "1px solid #ff8080"
                }}>

                    <div style={{ marginBottom: "10px" }}>
                        <strong>{Songs[currentIndex].title}</strong>
                        <br />
                        <small>{Songs[currentIndex].artist}</small>
                    </div>

                    <audio
                        ref={audioRef}
                        src={Songs[currentIndex].audio}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={nextSong}
                    />

                    {/* Controls Row */}
                    <div style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                        marginBottom: "10px"
                    }}>
                        {/* <button onClick={prevSong}>⏮</button> */}
                        <button onClick={backward10}>⏪ 10s</button>
                        <button onClick={togglePlay}>⏯</button>
                        <button onClick={forward10}>10s ⏩</button>
                        {/* <button onClick={nextSong}>⏭</button> */}
                    </div>

                    {/* Seek Bar */}
                    <input
                        type="range"
                        value={progress}
                        onChange={handleSeek}
                        style={{ width: "100%" }}
                    />

                </div>
            )}

        </div>
    )
}

export default MoodSongs;
