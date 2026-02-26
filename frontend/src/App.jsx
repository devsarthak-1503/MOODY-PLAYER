import { useState } from "react";
import ExpressionDetector from "./components/ExpressionDetector";
import MoodSongs from "./components/MoodSongs";
import "./index.css";

function App() {
  const [songs, setSongs] = useState([]);

  return (
    <div className="app-container">
      <ExpressionDetector setSongs={setSongs} />
      <MoodSongs Songs={songs} />
    </div>
  );
}

export default App;
