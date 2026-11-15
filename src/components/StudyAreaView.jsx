
import { useEffect, useRef } from "react";
import GestureTimeline from "./GestureTimeline";
import { CATEGORY_BY_ID } from "../data/categories";
import "./StudyAreaView.css";

/** A NASA Earthdata Search link for this spot and time (pre-filled search). */
function earthdataLink(site) {
  const { lat, lon } = site.center;
  const [start, end] = site.nasaData?.window ?? [];
  const params = new URLSearchParams({ q: site.nasaData?.readyProduct ?? "Sentinel-1", sp: `${lon},${lat}` });
  if (start) params.set("qt", `${start}T00:00:00.000Z,${end}T23:59:59.999Z`);
  return `https://search.earthdata.nasa.gov/search?${params}`;
}

// ---- Hand gesture tuning (info view) ----
const SCROLL_SPEED = 2; // screen heights scrolled per full video height of palm movement
const SWIPE_STEP = 0.12; // finger must travel this fraction of the video width per picture

export default function StudyAreaView({
  studyArea,
  onBack,
  gestureRef, // shared hand-gesture "mailbox" from App (HandTracker writes to it)
}) {
  const category = CATEGORY_BY_ID[studyArea.category];
  const hasImages = (studyArea.observations?.length ?? 0) > 0;
  const nasa = studyArea.nasaData; // catalogue check results (events without images)
  const viewRef = useRef(null); // the scrolling page
  const timelineRef = useRef(null); // GestureTimeline: .next() / .previous()

  // While this view is open, hand gestures drive it (the globe is paused):
  //  open palm up/down -> scroll, finger right/left -> pictures, two fingers swiped up -> back.
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
          HAND ME THE EARTH / NASA NISAR
        </span>
      </div>

      {/* Main content */}
      <div className="study-content">
        <div className="study-heading">
          <p className="study-eyebrow">
            {category ? (
              <>
                <span className="category-chip" style={{ background: category.color }} />
                {category.id.toUpperCase()}
              </>
            ) : (
              "SURFACE CHANGE EXPLORER"
            )}
            {studyArea.place && ` · ${studyArea.place}`}
            {studyArea.date && ` · ${studyArea.date}`}
          </p>

          <h1>{studyArea.name}</h1>
          <p>{studyArea.description}</p>
        </div>

        <div className="study-grid">
          {/* Radar visualization (sites with processed images), or what NASA data
              exists for this spot (events without images yet). */}
          {hasImages ? (
            <div className="radar-card">
              <h2>Earth Through Time</h2>

              <p>
                Point one finger and move it right or
                left to explore how this region changes.
              </p>

              <GestureTimeline
                ref={timelineRef}
                observations={studyArea.observations || []}
                viewNotes={studyArea.viewNotes}
              />
            </div>
          ) : (
            <div className="radar-card">
              <h2>NASA Radar Data for This Event</h2>
              <p>
                No processed images in the app yet. NASA&apos;s catalogue has these files at this spot
                {nasa?.window && studyArea.date !== "ongoing"
                  ? ` from ${nasa.window[0]} to ${nasa.window[1]}`
                  : " (during 2024; NISAR: Nov 2025 – Nov 2026)"}
                :
              </p>
              <ul className="data-counts">
                <li>
                  <strong>{nasa?.sentinel1 ?? 0}</strong> Sentinel-1 radar scenes (raw, need processing)
                </li>
                {nasa?.readyProduct && (
                  <li>
                    <strong>{nasa.ready ?? 0}</strong> ready-made map files ({nasa.readyProduct})
                  </li>
                )}
                <li>
                  <strong>{nasa?.nisar ?? 0}</strong> NISAR radar files
                </li>
                {nasa?.older > 0 && (
                  <li>
                    <strong>{nasa.older}</strong> older radar files (ALOS PALSAR / UAVSAR)
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Scientific information */}
          <div className="insight-card">
            <p className="study-eyebrow">
              NASA SCIENTIFIC INSIGHTS
            </p>

            <h2>What Changed?</h2>
            <p>
              {studyArea.findings ||
                "Our radar analysis of this event will appear here."}
            </p>

            {studyArea.impact && (
              <>
                <h3>Why Does This Matter?</h3>
                <p>{studyArea.impact}</p>
              </>
            )}

            {category && (
              <>
                <h3>How Radar Sees It</h3>
                <p>{category.sees}</p>
              </>
            )}

            <h3>Data Source</h3>
            <p>
              {studyArea.dataSource ??
                (!hasImages
                  ? "NASA Earthdata catalogue (CMR)"
                  : nasa
                    ? "Public preview images from NASA Earthdata (ASF DAAC, PO.DAAC, LP DAAC): Sentinel-1, OPERA DSWx/DIST, ARIA and NISAR, placed on the map by our pipeline. Previews are lower resolution than the full data."
                    : "NASA-ISRO Synthetic Aperture Radar (NISAR)")}
            </p>

            {(studyArea.sourceUrl || studyArea.center) && (
              <a
                href={studyArea.sourceUrl || earthdataLink(studyArea)}
                target="_blank"
                rel="noopener noreferrer"
              >
                View NASA Data
              </a>
            )}

            {studyArea.sources?.length > 0 && (
              <>
                <h3>Sources</h3>
                <ul className="source-list">
                  {studyArea.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
