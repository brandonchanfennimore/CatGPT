
import { useEffect, useRef } from "react";
import GestureTimeline from "./GestureTimeline";
import "./StudyAreaView.css";

// ---- Hand gesture tuning (info view) ----
const SCROLL_SPEED = 2; // screen heights scrolled per full video height of palm movement
const SWIPE_STEP = 0.12; // finger must travel this fraction of the video width per picture

export default function StudyAreaView({
  studyArea,
  onBack,
  gestureRef, // shared hand-gesture "mailbox" from App (HandTracker writes to it)
}) {
  const viewRef = useRef(null); // the scrolling page
  const timelineRef = useRef(null); // GestureTimeline: .next() / .previous()

  // While this view is open, hand gestures drive it (the globe is paused):
  //  open palm up/down -> scroll, finger right/left -> pictures, pinch-open -> back.
  useEffect(() => {
    if (!gestureRef) return;
    const g = gestureRef.current;
    // Drop movement left over from the globe so nothing jumps on open/close.
    const clear = () => {
      g.dx = g.dy = 0;
      g.fling = null;
      g.select = false;
    };
    clear();

    let swipe = 0; // finger movement added up since the last picture change
    let frame;
    const loop = () => {
      const g = gestureRef.current; // HandTracker's Stop button swaps in a new object
      if (g.select) {
        g.select = false;
        onBack();
        return; // view is closing
      }
      if (g.mode === "rotate" && g.dy && viewRef.current) {
        // "Grab" feel: palm moves up, the page moves up (scrolls down).
        viewRef.current.scrollTop -= g.dy * SCROLL_SPEED * window.innerHeight;
      }
      if (g.mode === "zoom") {
        swipe += g.dx;
        if (swipe > SWIPE_STEP) timelineRef.current?.next(); // finger right = next
        if (swipe < -SWIPE_STEP) timelineRef.current?.previous(); // finger left = previous
        if (Math.abs(swipe) > SWIPE_STEP) swipe = 0;
      } else {
        swipe = 0;
      }
      g.dx = g.dy = 0; // used up
      g.fling = null; // no globe spin waiting when we return
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      clear();
    };
  }, [gestureRef, onBack]);

  return (
    <div className="study-view" ref={viewRef}>
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
              Point one finger and move it right or
              left to explore how this region changes.
            </p>

            <GestureTimeline
              ref={timelineRef}
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
