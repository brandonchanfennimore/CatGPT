/*
 * GestureTutorial - a pop-up shown on the first visit (and from the "?" button on
 * the camera panel) that shows each hand gesture with a small looping animation:
 * the hand moves the way you should move yours, and a mini globe reacts.
 */
import { useEffect, useRef } from "react";
import "./GestureTutorial.css";

// Globe gestures: hand shape, what to do, and which animation to play (see the CSS).
const GLOBE_GESTURES = [
  { id: "rotate", hand: "🖐️", title: "Open palm", text: "Move your open hand to spin the globe. Swipe out of view to fling it." },
  { id: "zoom", hand: "☝️", title: "Point", text: "Point one finger and move it right to zoom in, left to zoom out." },
  { id: "pause", hand: "✊", title: "Fist", text: "Make a fist to pause. Nothing moves until you open your hand." },
  { id: "open", hand: "✌️", title: "Two fingers up", text: "Swipe two fingers up to open the place in the middle of the screen." },
];

// The same hand shapes do slightly different jobs inside an event's pop-up.
const EVENT_GESTURES = [
  { hand: "🖐️", text: "Open palm up/down: scroll the text" },
  { hand: "☝️", text: "Point right/left: next / previous picture" },
  { hand: "☝️", text: "Point down/up: normal / radar view" },
  { hand: "✌️", text: "Two fingers up: close and go back to Earth" },
];

export default function GestureTutorial({ onClose, onStartCamera }) {
  const startRef = useRef(null);

  // Esc closes; focus the main button so keyboard users land inside the pop-up.
  useEffect(() => {
    startRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="tutorial"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="tutorial-card">
        <p className="tutorial-eyebrow">HOW TO EXPLORE</p>
        <h2 id="tutorial-title">Hand Me The Earth</h2>
        <p className="tutorial-intro">
          Turn on your camera and control the globe with your hand. Hold your hand up about an arm&apos;s
          length from the screen. A mouse or touch screen works too.
        </p>

        <ul className="tutorial-grid">
          {GLOBE_GESTURES.map((g) => (
            <li key={g.id} className={`tutorial-step tut-${g.id}`}>
              {/* Decorative animation; the text below says the same thing. */}
              <div className="tut-stage" aria-hidden="true">
                <span className="tut-globe" />
                <span className="tut-pin" />
                <span className="tut-popup" />
                <span className="tut-badge">PAUSED</span>
                <span className="tut-hand">{g.hand}</span>
              </div>
              <h3>
                <span aria-hidden="true">{g.hand}</span> {g.title}
              </h3>
              <p>{g.text}</p>
            </li>
          ))}
        </ul>

        <div className="tutorial-event">
          <h3>Inside a place&apos;s info pop-up</h3>
          <ul>
            {EVENT_GESTURES.map((g) => (
              <li key={g.text}>
                <span aria-hidden="true">{g.hand}</span> {g.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="tutorial-privacy">
          The camera picture stays on your device: hands are tracked in your browser, nothing is uploaded.
        </p>

        <div className="tutorial-actions">
          <button type="button" className="tutorial-secondary" onClick={onClose}>
            Use mouse instead
          </button>
          <button
            type="button"
            ref={startRef}
            className="tutorial-primary"
            onClick={() => {
              onStartCamera(); // same click, so the browser allows the camera prompt
              onClose();
            }}
          >
            Start camera
          </button>
        </div>
      </div>
    </div>
  );
}
