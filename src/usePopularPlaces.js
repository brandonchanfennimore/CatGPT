import { useCallback, useEffect, useState } from "react";
import cities from "./data/cities.json";
import { cityPlace, loadPlaces, recordVisit, savePlaces } from "./popularity";
import { POPULAR_PLACES_SHOWN, POPULAR_STARTER_POOL } from "./tuning";

// cities.json is sorted biggest first, so this is the N biggest cities.
const STARTERS = cities.slice(0, POPULAR_STARTER_POOL).map(cityPlace);

/** localStorage, or null where the browser blocks it (e.g. some private modes). */
function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * The most visited places (top POPULAR_PLACES_SHOWN) and a `visit(place)`
 * function that counts one visit. Counts are saved in the browser.
 */
export default function usePopularPlaces() {
  const [places, setPlaces] = useState(() => loadPlaces(browserStorage(), STARTERS, POPULAR_PLACES_SHOWN));

  useEffect(() => savePlaces(browserStorage(), places), [places]);

  const visit = useCallback((place) => setPlaces((prev) => recordVisit(prev, place)), []);

  return [places.slice(0, POPULAR_PLACES_SHOWN), visit];
}
