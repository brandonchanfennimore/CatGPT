
// The map layers you can switch on/off, in the order shown.
const LAYERS = [
  { key: "borders", label: "Borders" },
  { key: "labels", label: "Labels" },
  { key: "coordinates", label: "Coordinates", needs: "labels" }, // coordinates live inside labels
];

export default function Header({
  lighting,
  onLightingChange,
  layers,
  onLayersChange,
  categories = [], // [{ id, color }] event types, in legend order
  siteCounts = {}, // category id -> number of pins
  hiddenCategories = new Set(), // category ids whose pins are hidden
  onHiddenCategoriesChange,
}) {
  const total = Object.values(siteCounts).reduce((a, b) => a + b, 0);

  // Show/hide one category's pins.
  function toggleCategory(id, visible) {
    const next = new Set(hiddenCategories);
    if (visible) next.delete(id);
    else next.add(id);
    onHiddenCategoriesChange(next);
  }

  return (
    <header className="app-header">
      <p className="eyebrow">NASA NISAR EXPLORER</p>
      <h1>Hand Me The Earth</h1>
      <p className="subtitle">
        Discover how our planet changes.
      </p>

      {/* View settings: lighting + map layer switches */}
      <fieldset className="layer-toggles">
        <legend>View settings</legend>
        {/* Lighting switch. data-mode moves the sliding highlight (see UI.css). */}
        <div className="light-toggle" role="group" aria-label="Earth lighting" data-mode={lighting}>
          <button
            type="button"
            aria-pressed={lighting === "bright"}
            onClick={() => onLightingChange("bright")}
            title="Light the whole globe evenly"
          >
            Bright
          </button>
          <button
            type="button"
            aria-pressed={lighting === "realistic"}
            onClick={() => onLightingChange("realistic")}
            title="Day and night match the current time around the world"
          >
            Real time
          </button>
        </div>

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

        {/* Pin legend: colour = type of surface change. A <details> element folds open/closed
            by itself (no extra code) and keeps the panel short. */}
        <details className="pin-legend">
          <summary>Event types ({total})</summary>
          {categories.map((c) => (
            <label key={c.id}>
              <span className="pin-dot" style={{ background: c.color }} aria-hidden="true" />
              <span className="pin-name">{c.id}</span>
              <span className="pin-count">{siteCounts[c.id] ?? 0}</span>
              <input
                type="checkbox"
                checked={!hiddenCategories.has(c.id)}
                onChange={(e) => toggleCategory(c.id, e.target.checked)}
                aria-label={`Show ${c.id} pins`}
              />
            </label>
          ))}
          <div className="pin-legend-actions">
            <button type="button" onClick={() => onHiddenCategoriesChange(new Set())}>
              Show all
            </button>
            <button type="button" onClick={() => onHiddenCategoriesChange(new Set(categories.map((c) => c.id)))}>
              Hide all
            </button>
          </div>
        </details>
      </fieldset>
    </header>
  );
}
