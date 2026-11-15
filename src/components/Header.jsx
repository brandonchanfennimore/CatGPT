
// The map layers you can switch on/off, in the order shown.
const LAYERS = [
  { key: "borders", label: "Borders" },
  { key: "labels", label: "Labels" },
  { key: "coordinates", label: "Coordinates", needs: "labels" }, // coordinates live inside labels
];

export default function Header({ lighting, onLightingChange, layers, onLayersChange }) {
  return (
    <header className="app-header">
      <p className="eyebrow">NASA NISAR EXPLORER</p>
      <h1>Earth in Motion</h1>
      <p className="subtitle">
        Discover how our planet changes.
      </p>

      {/* Lighting switch. data-mode moves the sliding highlight (see UI.css). */}
      <div className="light-toggle" role="group" aria-label="Earth lighting" data-mode={lighting}>
        <button
          type="button"
          aria-pressed={lighting === "bright"}
          onClick={() => onLightingChange("bright")}
          title="Light the whole globe evenly"
        >
          Bright ☀️
        </button>
        <button
          type="button"
          aria-pressed={lighting === "realistic"}
          onClick={() => onLightingChange("realistic")}
          title="Day and night match the current time around the world"
        >
          Realistic 🕑
        </button>
      </div>

      {/* Map layer switches */}
      <fieldset className="layer-toggles">
        <legend>Map layers</legend>
        {LAYERS.map(({ key, label, needs }) => {
          const disabled = needs && !layers[needs];
          return (
            <label key={key} className={disabled ? "disabled" : undefined}>
              <span>{label}</span>
              {/* A real checkbox (keyboard + screen-reader friendly), styled as a switch in UI.css. */}
              <input
                type="checkbox"
                role="switch"
                checked={layers[key]}
                disabled={disabled}
                onChange={(e) => onLayersChange({ ...layers, [key]: e.target.checked })}
              />
            </label>
          );
        })}
      </fieldset>
    </header>
  );
}
