import { useEffect, useState } from "react";
import { SetupScreen } from "./features/setup/SetupScreen";
import { ZoneChooser } from "./features/chooser/ZoneChooser";
import { ZoneShell } from "./features/shell/ZoneShell";

const API_BASE = "http://127.0.0.1:8000";

type Target = "autopsy" | "repodoctor";

interface Origin {
  x: number;
  y: number;
}

function App() {
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [zone, setZone] = useState<Target | null>(null);

  // While this is set, `target` renders on top of the current `zone`,
  // clipped to a growing circle. When it finishes, it BECOMES `zone`.
  const [transition, setTransition] = useState<{ target: Target; origin: Origin; radius: string } | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/setup/status`)
      .then((res) => res.json())
      .then((data) => setSetupComplete(data.setup_complete));
  }, []);

  function transitionTo(target: Target, origin: Origin) {
    setTransition({ target, origin, radius: "0%" });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransition((t) => (t ? { ...t, radius: "150%" } : t));
      });
    });
  }

  function handleTransitionEnd() {
    if (!transition) return;
    setZone(transition.target);
    setTransition(null);
  }

  function getOrigin(e: React.MouseEvent): Origin {
    return { x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 };
  }

  if (setupComplete === null) {
    return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading...</div>;
  }

  if (!setupComplete) {
    return <SetupScreen onComplete={() => setSetupComplete(true)} />;
  }

  function renderZone(z: Target, onSwitch: (e: React.MouseEvent) => void) {
    return <ZoneShell zone={z} onSwitch={onSwitch} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Base layer: whatever is currently active, full and static */}
      {!zone ? (
        <ZoneChooser onSelect={(next, e) => transitionTo(next, getOrigin(e))} />
      ) : (
        renderZone(zone, (e) => transitionTo(zone === "autopsy" ? "repodoctor" : "autopsy", getOrigin(e)))
      )}

      {/* Overlay layer: the NEXT screen, revealed by a single growing circle */}
      {transition && (
        <div
          className="fixed inset-0 z-50 transition-[clip-path] duration-[650ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          onTransitionEnd={handleTransitionEnd}
          style={{
            clipPath: `circle(${transition.radius} at ${transition.origin.x}% ${transition.origin.y}%)`,
          }}
        >
          {renderZone(transition.target, () => { })}
        </div>
      )}
    </div>
  );
}

export default App;