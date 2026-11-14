
export default function LocationPanel({ onClose }) {
  return (
    <section className="location-panel">
      <div className="panel-heading">
        <h2>Surface Change Explorer</h2>
        <button onClick={onClose} aria-label="Close panel">
          ×
        </button>
      </div>

      <p>
        Explore how Earth's surface changes through
        NASA NISAR radar observations.
      </p>

      <div className="data-placeholder">
        <h3>Radar Comparison</h3>
        <p>Study area coming soon</p>
        <p>
          Before-and-after imagery will appear here.
        </p>
      </div>

      <h3>What changed?</h3>
      <p>
        We'll explain the observed changes and
        possible environmental causes here.
      </p>
    </section>
  );
}
