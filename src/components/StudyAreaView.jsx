
import GestureTimeline from "./GestureTimeline";
import "./StudyAreaView.css";

export default function StudyAreaView({
  studyArea,
  onBack,
}) {
  return (
    <div className="study-view">
      {/* Top navigation */}
      <div className="study-topbar">
        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back to Earth
        </button>

        <span className="study-brand">
          EARTH IN MOTION / NASA NISAR
        </span>
      </div>

      {/* Main content */}
      <div className="study-content">
        <div className="study-heading">
          <p className="study-eyebrow">
            SURFACE CHANGE EXPLORER
          </p>

          <h1>{studyArea.name}</h1>
          <p>{studyArea.description}</p>
        </div>

        <div className="study-grid">
          {/* Radar visualization */}
          <div className="radar-card">
            <h2>Earth Through Time</h2>

            <p>
              Swipe your hand left or right to
              explore how this region changes.
            </p>

            <GestureTimeline
              observations={studyArea.observations || []}
            />
          </div>

          {/* Scientific information */}
          <div className="insight-card">
            <p className="study-eyebrow">
              NASA SCIENTIFIC INSIGHTS
            </p>

            <h2>What Changed?</h2>
            <p>
              {studyArea.findings ||
                "Our NISAR analysis will appear here."}
            </p>

            <h3>Why Does This Matter?</h3>
            <p>
              {studyArea.impact ||
                "Learn how these surface changes affect the environment."}
            </p>

            <h3>Data Source</h3>
            <p>NASA-ISRO Synthetic Aperture Radar</p>

            {studyArea.sourceUrl && (
              <a
                href={studyArea.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View NASA Data
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
