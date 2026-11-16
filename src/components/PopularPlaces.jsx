import { useEffect, useRef, useState } from "react";
import { formatLatLon } from "../geo";
import { stepSettings } from "../hands/settingsGesture";
import GestureHint from "./GestureHint";

/**
 * "Popular places" panel: the most visited places; click one to fly there.
 * Hand gesture 🤘 (index + little finger up): move down/up to highlight a place,
 * move right to fly there. Same rules as the pinky on View settings (settingsGesture.js).
 * handsMode: camera on, so a tip above the panel shows how to use it by hand.
 */
export default function PopularPlaces({ places, onSelect, gestureRef, gestureEnabled = true, handsMode = false }) {
  const [focus, setFocus] = useState(0); // highlighted place (index into places)
  const [rockActive, setRockActive] = useState(false); // 🤘 up right now?
  const latest = useRef(null); // newest props/state for the animation-frame loop below
  useEffect(() => {
    latest.current = { places, onSelect, focus, gestureEnabled };
  });

  useEffect(() => {
    if (!gestureRef) return;
    let frame;
    let active = false;
    let lastToggle = -Infinity;
    const loop = (now) => {
      const g = gestureRef.current; // HandTracker's Stop button swaps in a new object
      const L = latest.current;
      const on = Boolean(L?.gestureEnabled) && g.mode === "places" && L.places.length > 0;
      if (on !== active) setRockActive((active = on));
      if (on) {
        const focus = Math.min(L.focus, L.places.length - 1);
        const r = stepSettings({ rows: L.places.map((p) => p.id), focus, sx: g.px, sy: g.py, now, lastToggle });
        g.px = r.sx;
        g.py = r.sy;
        lastToggle = r.lastToggle;
        if (r.focus !== L.focus) setFocus(r.focus);
        if (r.toggle) L.onSelect(L.places[r.focus]); // move right = fly to the highlighted place
      } else {
        g.px = g.py = 0; // nothing piles up while the hand isn't in this shape
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [gestureRef]);

  // Keep the highlighted place in view (on phones the list is a row you swipe sideways).
  const listRef = useRef(null);
  useEffect(() => {
    if (rockActive) listRef.current?.querySelector(".gesture-focus")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [focus, rockActive]);

  const shown = Math.min(focus, places.length - 1);
  return (
    <>
      {handsMode && (
        <GestureHint hand="🤘" motion="updown" className="panel-tip">
          Index + pinky up: move down/up to choose, right to fly there
        </GestureHint>
      )}
      <section
        className={rockActive ? "popular-places gesture-active" : "popular-places"}
        aria-labelledby="popular-places-title"
      >
        <h2 id="popular-places-title">Popular places</h2>
        <ol ref={listRef}>
          {places.map((place, i) => (
            <li key={place.id}>
              <button
                type="button"
                className={rockActive && shown === i ? "gesture-focus" : undefined}
                onClick={() => onSelect(place)}
                title={`Fly to ${formatLatLon(place.lat, place.lon)}`}
              >
                <span className="place-name">{place.name}</span>
                <span className="place-visits">
                  {place.visits ? `${place.visits} visit${place.visits === 1 ? "" : "s"}` : "new"}
                </span>
              </button>
            </li>
          ))}
        </ol>
        {rockActive && (
          <p className="gesture-hint" aria-live="polite">
            🤘 down/up: choose · right: fly there
          </p>
        )}
      </section>
    </>
  );
}
