
import { useImperativeHandle, useState } from "react";
import "./GestureTimeline.css";

// `ref` lets the parent flip pictures too (used by the hand swipe gesture):
// ref.current.next() / ref.current.previous().
// What each view shows. A study area can override these with `viewNotes`.
const DEFAULT_VIEW_NOTES = {
  radar:
    "NISAR radar, false colour: dark = water, purple = farmland, green = trees and bush, white = buildings.",
  normal:
    "Blue = water detected by NISAR radar, drawn on a cloud-free photo of the area.",
};

export default function GestureTimeline({ observations = [], viewNotes = {}, ref }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // "radar" = NISAR's own false-colour image, "normal" = photo + radar water in blue.
  const [view, setView] = useState("radar");

  useImperativeHandle(ref, () => ({
    next: () => setCurrentIndex((i) => Math.min(i + 1, observations.length - 1)),
    previous: () => setCurrentIndex((i) => Math.max(i - 1, 0)),
  }), [observations.length]);

  if (observations.length === 0) {
    return <p>Waiting for NASA NISAR observations...</p>;
  }

  const current = observations[currentIndex];
  const hasNormalView = observations.some((o) => o.normalImage);
  const showNormal = view === "normal" && current.normalImage;
  const notes = { ...DEFAULT_VIEW_NOTES, ...viewNotes };

  function nextObservation() {
    setCurrentIndex((prev) =>
      Math.min(prev + 1, observations.length - 1)
    );
  }

  function previousObservation() {
    setCurrentIndex((prev) =>
      Math.max(prev - 1, 0)
    );
  }

  return (
    <div className="gesture-timeline">
      {hasNormalView && (
        <div className="view-toggle" role="group" aria-label="Image view">
          <button
            className={view === "radar" ? "active" : ""}
            aria-pressed={view === "radar"}
            onClick={() => setView("radar")}
          >
            Radar view
          </button>
          <button
            className={view === "normal" ? "active" : ""}
            aria-pressed={view === "normal"}
            onClick={() => setView("normal")}
          >
            Normal view
          </button>
        </div>
      )}

      <div className="timeline-image">
        <img
          src={showNormal ? current.normalImage : current.image}
          alt={
            showNormal
              ? `Photo with flood water from ${current.date}`
              : `Radar observation from ${current.date}`
          }
        />
      </div>

      {hasNormalView && (
        <p className="view-note">{showNormal ? notes.normal : notes.radar}</p>
      )}

      <div className="timeline-info">
        <h2>{current.date}</h2>

        <p>
          Observation {currentIndex + 1} of {observations.length}
        </p>

        <div className="timeline-progress">
          {observations.map((observation, index) => (
            <div
              key={`${observation.date}-${index}`}
              className={
                index === currentIndex
                  ? "timeline-dot active"
                  : "timeline-dot"
              }
            />
          ))}
        </div>

        <div className="timeline-buttons">
          <button
            onClick={previousObservation}
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>

          <button
            onClick={nextObservation}
            disabled={currentIndex === observations.length - 1}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}


