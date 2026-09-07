import { useEffect, useState } from "react";
import { SetupScreen } from "./features/setup/SetupScreen";
import { HotspotList } from "./features/hotspots/HotspotList";
import { ZoneChooser } from "./features/chooser/ZoneChooser";

const API_BASE = "http://127.0.0.1:8000";

function App() {
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);

  const [zone, setZone] = useState<"autopsy" | "repodoctor" | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/setup/status`)
      .then((res) => res.json())
      .then((data) => setSetupComplete(data.setup_complete));
  }, []);

  if (setupComplete === null) {
    return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading...</div>;
  }

  if (!setupComplete) {
    return <SetupScreen onComplete={() => setSetupComplete(true)} />;
  }

  if (!zone) {
    return <ZoneChooser onSelect={setZone} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <HotspotList />
    </div>
  );
}

export default App;