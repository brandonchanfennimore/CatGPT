/*
 * ModeBar - top-right buttons to switch between Explore, Flashlight and Time,
 * plus the current mode's name and (in Flashlight) the lens size slider.
 * Keys 1 / 2 / 3 do the same (see App.jsx), so a demo still works if a
 * gesture misfires.
 */
import { LENS_RADIUS_MAX_PX, LENS_RADIUS_MIN_PX } from "../tuning";

const MODES = [
  { id: "explore", key: "1", label: "Explore", hint: "Spin the globe and open sites" },
  { id: "flashlight", key: "2", label: "Flashlight", hint: "Reveal radar under a lens" },
  { id: "time", key: "3", label: "Time", hint: "Before/after curtain" },
];

export default function ModeBar({ mode, onModeChange, siteName, lensRadius, onLensRadiusChange }) {
  const radarMode = mode === "flashlight" || mode === "time";
  return (
    <div className="mode-bar">
      <div className="mode-buttons" role="group" aria-label="Mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={mode === m.id}
            disabled={m.disabled}
            title={`${m.hint} (key ${m.key})`}
            onClick={() => onModeChange(m.id)}
          >
            <kbd>{m.key}</kbd> {m.label}
          </button>
        ))}
      </div>

      {radarMode && (
        <div className="mode-details">
          <p className="mode-site">
            Radar: <strong>{siteName}</strong>
          </p>
          {mode === "flashlight" && (
          <label className="lens-slider">
            Lens size
            <input
              type="range"
              min={LENS_RADIUS_MIN_PX}
              max={LENS_RADIUS_MAX_PX}
              value={lensRadius}
              onChange={(e) => onLensRadiusChange(Number(e.target.value))}
            />
          </label>
          )}
        </div>
      )}
    </div>
  );
}
