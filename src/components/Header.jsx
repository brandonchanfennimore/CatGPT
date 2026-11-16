import { useEffect, useRef, useState } from "react";
import { stepSettings } from "../hands/settingsGesture";
import GestureHint from "./GestureHint";

// The map layers you can switch on/off, in the order shown.
const LAYERS = [
  { key: "borders", label: "Borders" },
  { key: "labels", label: "Labels" },
  { key: "coordinates", label: "Coordinates", needs: "labels" }, // coordinates live inside labels
];
// Rows the pinky gesture can highlight, top to bottom: the lighting switch, the layers,
// then (scrolling on down) one row per event type, "cat:<id>". Reaching those opens the
// Event types list; it closes again when the pinky comes down.
const SETTING_ROWS = ["lighting", ...LAYERS.map((l) => l.key)];
const CATEGORY_ROW = "cat:";
// A row can't be switched while the layer it depends on is off (Coordinates needs Labels).
function rowDisabled(key, layers) {
  const needs = LAYERS.find((l) => l.key === key)?.needs;
  return Boolean(needs && !layers[needs]);
}

export default function Header({
  lighting,
  onLightingChange,
  layers,
  onLayersChange,
  categories = [], // [{ id, color }] event types, in legend order
  siteCounts = {}, // category id -> number of pins
  hiddenCategories = new Set(), // category ids whose pins are hidden
  onHiddenCategoriesChange,
  gestureRef, // shared hand-gesture "mailbox" (pinky up = control these settings)
  gestureEnabled = true, // false while a pop-up is open
  handsMode = false, // camera on: show how to use this panel by hand
  children, // extra panels under the title (Popular places)
}) {
  const total = Object.values(siteCounts).reduce((a, b) => a + b, 0);

  // ---- Pinky-up gesture: move down/up to highlight a row, move right to switch it ----
  const rows = [...SETTING_ROWS, ...categories.map((c) => CATEGORY_ROW + c.id)];
  const [focus, setFocus] = useState(0); // highlighted row (index into rows)
  const [pinkyActive, setPinkyActive] = useState(false); // pinky up right now?
  const [legendOpen, setLegendOpen] = useState(false); // Event types list folded open?
  const [settingsOpen, setSettingsOpen] = useState(false); // phones: panel folded open? (UI.css)
  const panelRef = useRef(null);
  const latest = useRef(null); // newest props/state for the animation-frame loop below
  useEffect(() => {
    latest.current = {
      rows, lighting, layers, hiddenCategories, onLightingChange, onLayersChange, onHiddenCategoriesChange,
      focus, gestureEnabled, legendOpen,
    };
  });
  useEffect(() => {
    if (!gestureRef) return;
    let frame;
    let active = false;
    let lastToggle = -Infinity;
    let openedByGesture = false; // did the pinky open the Event types list?
    const loop = (now) => {
      const g = gestureRef.current; // HandTracker's Stop button swaps in a new object
      const L = latest.current;
      const on = Boolean(L?.gestureEnabled) && g.mode === "settings";
      if (on !== active) {
        setPinkyActive((active = on));
        // Pinky down: fold the Event types list away again if the pinky opened it.
        if (!on && openedByGesture) {
          openedByGesture = false;
          setLegendOpen(false);
        }
      }
      if (on) {
        const r = stepSettings({
          rows: L.rows,
          disabled: (key) => rowDisabled(key, L.layers),
          focus: L.focus,
          sx: g.sx,
          sy: g.sy,
          now,
          lastToggle,
        });
        g.sx = r.sx;
        g.sy = r.sy;
        lastToggle = r.lastToggle;
        if (r.focus !== L.focus) {
          setFocus(r.focus);
          // Scrolled on past the settings into the event types: open their list.
          if (L.rows[r.focus].startsWith(CATEGORY_ROW) && !L.legendOpen) {
            openedByGesture = true;
            setLegendOpen(true);
          }
        }
        if (r.toggle?.startsWith(CATEGORY_ROW)) {
          const id = r.toggle.slice(CATEGORY_ROW.length);
          const next = new Set(L.hiddenCategories);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          L.onHiddenCategoriesChange(next);
        } else if (r.toggle === "lighting") L.onLightingChange(L.lighting === "bright" ? "realistic" : "bright");
        else if (r.toggle) L.onLayersChange({ ...L.layers, [r.toggle]: !L.layers[r.toggle] });
      } else {
        g.sx = g.sy = 0; // nothing piles up while the pinky isn't up
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [gestureRef]);
  const focusClass = (i) => (pinkyActive && focus === i ? "gesture-focus" : undefined);

  // Keep the highlighted row in view (the panel scrolls when the list is long).
  useEffect(() => {
    if (pinkyActive) panelRef.current?.querySelector(".gesture-focus")?.scrollIntoView({ block: "nearest" });
  }, [focus, pinkyActive, legendOpen]);

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
      {/* Bottom-left: (camera on) a gesture tip, then the View settings panel */}
      <div className={settingsOpen || pinkyActive ? "view-settings-dock open" : "view-settings-dock"}>
        {handsMode && (
          <GestureHint hand="🤙" motion="updown" className="panel-tip">
            Pinky up: move down/up to choose, right to switch
          </GestureHint>
        )}
      {/* Phones only (UI.css): the panel folds away behind this button; the pinky opens it too. */}
      <button
        type="button"
        className="settings-toggle"
        aria-expanded={settingsOpen || pinkyActive}
        onClick={() => setSettingsOpen((o) => !o)}
      >
        View settings
      </button>
      <fieldset ref={panelRef} className={pinkyActive ? "layer-toggles gesture-active" : "layer-toggles"}>
        <legend>View settings</legend>
        {/* Lighting switch. data-mode moves the sliding highlight (see UI.css). */}
        <div
          className={["light-toggle", focusClass(0)].filter(Boolean).join(" ")}
          role="group"
          aria-label="Earth lighting"
          data-mode={lighting}
        >
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

        {LAYERS.map(({ key, label, needs }, n) => {
          const disabled = needs && !layers[needs];
          return (
            <label key={key} className={[disabled && "disabled", focusClass(n + 1)].filter(Boolean).join(" ") || undefined}>
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

        {pinkyActive && (
          <p className="gesture-hint" aria-live="polite">
            Pinky down/up: choose · right: switch
          </p>
        )}

        {/* Pin legend: colour = type of surface change. A <details> element folds open/closed
            (click, or the pinky gesture scrolling into it) and keeps the panel short. */}
        <details className="pin-legend" open={legendOpen} onToggle={(e) => setLegendOpen(e.currentTarget.open)}>
          <summary>Event types ({total})</summary>
          {categories.map((c, n) => (
            <label key={c.id} className={focusClass(SETTING_ROWS.length + n)}>
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
      </div>

      {children && <div className="header-extra">{children}</div>}
    </header>
  );
}
