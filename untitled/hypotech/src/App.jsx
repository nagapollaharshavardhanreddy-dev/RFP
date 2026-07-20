import { useState } from "react";

function App() {
  const [sleepTime, setSleepTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [message, setMessage] = useState("");

  const saveSchedule = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sleepTime, wakeTime }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Error connecting to backend");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>HypoTech</h1>
      <h3>Smart Sleep Time & App Restriction</h3>

      <div>
        <label>Sleep Time:</label><br />
        <input type="time" onChange={(e) => setSleepTime(e.target.value)} />
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>Wake Time:</label><br />
        <input type="time" onChange={(e) => setWakeTime(e.target.value)} />
      </div>

      <button style={{ marginTop: "15px" }} onClick={saveSchedule}>
        Save Schedule
      </button>

      <p>{message}</p>
    </div>
  );
}

export default App;