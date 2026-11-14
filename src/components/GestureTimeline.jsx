
import { useState } from "react";
import "./GestureTimeline.css";

export default function GestureTimeline({ observations = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (observations.length === 0) {
    return <p>Waiting for NASA NISAR observations...</p>;
  }

  const current = observations[currentIndex];

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
      <div className="timeline-image">
        <img
          src={current.image}
          alt={`Radar observation from ${current.date}`}
        />
      </div>

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


