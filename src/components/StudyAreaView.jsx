
import { useEffect, useRef } from "react";
import GestureTimeline from "./GestureTimeline";
import GestureHint from "./GestureHint";
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
const SWIPE_STEP = 0.12; // finger must travel this fraction of the video per picture / view change

export default function StudyAreaView({
  studyArea,
  onBack,
  gestureRef, // shared hand-gesture "mailbox" from App (HandTracker writes to it)
  handsMode = false, // camera on: no clickable buttons; show how to do each action by hand
}) {
  const category = CATEGORY_BY_ID[studyArea.category];
  const hasImages = (studyArea.observations?.length ?? 0) > 0;
  const nasa = studyArea.nasaData; // catalogue check results (events without images)
  const rootRef = useRef(null); // the whole pop-up (it scrolls instead of the cards on phones)
  const viewRef = useRef(null); // the right card (scrolls)
  const timelineRef = useRef(null); // GestureTimeline: .next() / .previous()

  // While this view is open, hand gestures drive it (the globe is paused):
  //  open palm up/down -> scroll, finger right/left -> pictures, finger down/up -> normal/radar
  //  view, two fingers swiped up -> back.
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

    let swipe = 0; // sideways finger movement added up since the last change
    let drop = 0; // up/down finger movement added up since the last change
    let frame;
    const loop = () => {
      const g = gestureRef.current; // HandTracker's Stop button swaps in a new object
      if (g.select) {
        g.select = false;
        onBack();
        return; // view is closing
      }
      if (g.mode === "rotate" && g.dy) {
        // Scroll whichever part actually scrolls: the right card on wide screens, the
        // whole pop-up on phones (the cards are stacked and grow to fit there).
        const card = viewRef.current;
        const target = card && card.scrollHeight > card.clientHeight ? card : rootRef.current;
        // "Grab" feel: palm moves up, the page moves up (scrolls down).
        if (target) target.scrollTop -= g.dy * SCROLL_SPEED * window.innerHeight;
      }
      if (g.mode === "zoom") {
        swipe += g.dx;
        drop += g.dy; // y grows downward
        // Whichever direction got far enough first (and is the bigger movement) wins.
        if (Math.max(Math.abs(swipe), Math.abs(drop)) > SWIPE_STEP) {
          const t = timelineRef.current;
          if (Math.abs(swipe) >= Math.abs(drop)) {
            if (swipe > 0) t?.next(); // finger right = next picture
            else t?.previous(); // finger left = previous picture
          } else {
            t?.setView(drop > 0 ? "normal" : "radar"); // finger down = normal view, up = radar
          }
          swipe = drop = 0;
        }
      } else {
        swipe = drop = 0;
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

  // Esc closes the pop-up too.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onBack();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  return (
    // Darkened backdrop over the globe; clicking it (outside the two cards) closes.
    <div
      ref={rootRef}
      className={handsMode ? "study-view hands-mode" : "study-view"}
      role="dialog"
      aria-modal="true"
      aria-label={studyArea.name}
      onClick={(e) => !handsMode && e.target === e.currentTarget && onBack()}
    >
      {handsMode ? (
        <div className="info-top-hints">
          {/* Phones only (StudyAreaView.css): the scroll tip next to the close tip. */}
          <GestureHint className="info-scroll-hint" hand="🖐️" motion="updown">
            Open palm up/down to scroll
          </GestureHint>
          <GestureHint className="info-close-hint" hand="✌️" motion="up">
            Two fingers, swipe up to close
          </GestureHint>
        </div>
      ) : (
        <button type="button" className="info-close" onClick={onBack} aria-label="Close and go back to Earth">
          ✕
        </button>
      )}

      <div className="study-grid" onClick={(e) => !handsMode && e.target === e.currentTarget && onBack()}>
        {/* Left card: title + radar images (Radar / Normal view), or what NASA data
            exists for this spot (events without images yet). */}
        <div className="radar-card info-modal">
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
          <h2 className="info-title">{studyArea.name}</h2>
          {studyArea.description && <p className="info-description">{studyArea.description}</p>}

          {hasImages ? (
            <GestureTimeline
              ref={timelineRef}
              observations={studyArea.observations || []}
              viewNotes={studyArea.viewNotes}
              handsMode={handsMode}
            />
          ) : (
            <>
              <h3>NASA Radar Data for This Event</h3>
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
            </>
          )}
        </div>

        {/* Right card: the explanation (scrolls on its own; the open palm scrolls it) */}
        <div className="insight-card info-modal" ref={viewRef}>
          {handsMode && (
            <GestureHint hand="🖐️" motion="updown">
              Open palm, move up/down to scroll
            </GestureHint>
          )}
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
  );
}
