/*
 * TeamModal - "Built by CatGPT": a centred pop-up over the darkened globe with a
 * photo of the team, a short description and everyone's names.
 */
import { useEffect, useRef } from "react";
import "./TeamModal.css";

// Alphabetical order.
const TEAM = ["Brandon Chan Fennimore", "Brandon Jaramillo", "Nafisa Tabassum", "Paulo Jose Zapata"];

export default function TeamModal({ onClose }) {
  const closeRef = useRef(null);

  // Esc closes; start keyboard focus on the close button.
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="team-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="team-card">
        <button type="button" ref={closeRef} className="team-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <img className="team-photo" src="/team.webp" alt="The CatGPT team holding a laptop showing Hand Me The Earth" />

        <div className="team-body">
          <p className="team-eyebrow">BUILT BY</p>
          <h2 id="team-title">CatGPT</h2>
          <p className="team-description">
            CatGPT is a team of undergraduate computer science students from Hunter College who bond over
            their love for building projects. Hand Me The Earth is our project for the NASA Space Apps
            Challenge: a globe you can explore with your hands to see how our planet&apos;s surface changes.
          </p>

          <ul className="team-list">
            {TEAM.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
