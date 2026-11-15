/*
 * GestureHint - a small "how to do this by hand" tip shown in place of a button while
 * the camera is on: a hand emoji that moves the way your hand should, plus a label.
 * motion: "up" | "updown" | "sideways" (see GestureHint.css).
 */
import "./GestureHint.css";

export default function GestureHint({ hand, motion = "sideways", className = "", children }) {
  return (
    <p className={`gesture-tip ${className}`.trim()}>
      <span className={`gesture-tip-hand move-${motion}`} aria-hidden="true">
        {hand}
      </span>
      <span>{children}</span>
    </p>
  );
}
