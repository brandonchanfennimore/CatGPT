
export default function Header({ lighting, onLightingChange }) {
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
    </header>
  );
}
