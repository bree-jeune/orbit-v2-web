import React, { useState } from "react";
import OrbitScene from "./OrbitScene";

function App() {
  const [paused, setPaused] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="appContainer">
      <OrbitScene paused={paused} zoomed={zoomed} />
      <div className="uiControls">
        <button onClick={() => setPaused((p) => !p)}>
          {paused ? "▶️ Play" : "⏸️ Pause"}
        </button>
        <button onClick={() => setZoomed((z) => !z)}>
          {zoomed ? "🔍 Zoom Out" : "🔎 Zoom In"}
        </button>
      </div>
    </div>
  );
}

export default App;
