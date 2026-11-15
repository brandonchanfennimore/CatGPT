import { formatLatLon } from "../geo";

/** "Popular places" panel: the most visited places; click one to fly there. */
export default function PopularPlaces({ places, onSelect }) {
  return (
    <section className="popular-places" aria-labelledby="popular-places-title">
      <h2 id="popular-places-title">Popular places</h2>
      <ol>
        {places.map((place) => (
          <li key={place.id}>
            <button type="button" onClick={() => onSelect(place)} title={`Fly to ${formatLatLon(place.lat, place.lon)}`}>
              <span className="place-name">{place.name}</span>
              <span className="place-visits">
                {place.visits ? `${place.visits} visit${place.visits === 1 ? "" : "s"}` : "new"}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
