import { useEffect, useState } from "react";
import { SetupScreen } from "./features/setup/SetupScreen";
import { ZoneChooser } from "./features/chooser/ZoneChooser";
import { ZoneShell } from "./features/shell/ZoneShell";

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [zone, setZone] = useState<"autopsy" | "repodoctor" | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/setup/status`)
      .then((res) => res.json())
      .then((data) => setSetupComplete(data.setup_complete));
  }, []);

  function selectZone(next: "autopsy" | "repodoctor") {
    setTransitioning(true);
    setTimeout(() => {
      setZone(next);
      setTransitioning(false);
    }, 350);
  }

  function switchZone() {
    const next = zone === "autopsy" ? "repodoctor" : "autopsy";
    selectZone(next);
  }

  if (setupComplete === null) {
    return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading...</div>;
  }

  if (!setupComplete) {
    return <SetupScreen onComplete={() => setSetupComplete(true)} />;
  }

  return (
    <div
      className="transition-opacity duration-300"
      style={{ opacity: transitioning ? 0 : 1 }}
    >
      {!zone ? (
        <ZoneChooser onSelect={selectZone} />
      ) : (
        <ZoneShell zone={zone} onSwitch={switchZone} />
      )}
    </div>
  );
}

export default App;