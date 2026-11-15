/*
 * popularity.js - remembers which places get visited most, for the
 * "Popular places" panel. Saved in the browser (localStorage), so each
 * visitor has their own list.
 *
 * A place is { id, name, lat, lon, visits }.
 * Until there are real visits, the list is filled with random starter places
 * (picked once and saved, so it doesn't reshuffle on every reload). Each visit
 * adds 1 to a place's count; places are ranked by count, so visited places push
 * the random starters (0 visits) down and off the end of the list.
 *
 * No React or three.js here, so it can be tested with plain Node (popularity.check.js).
 */

const STORAGE_KEY = "popularPlaces";

// Most places remembered; the least visited are forgotten beyond this.
const MAX_SAVED = 50;

/** A city from cities.json ([name, lat, lon, ...]) as a place. */
export function cityPlace([name, lat, lon]) {
  return { id: `city:${name}`, name, lat, lon };
}

/** A NISAR study area (studyAreas.js) as a place. */
export function areaPlace(area) {
  return { id: `area:${area.id}`, name: area.name, lat: area.center.lat, lon: area.center.lon };
}

/** `n` different random items from `pool`. */
function pickRandom(pool, n, random) {
  const copy = [...pool];
  // Partial Fisher-Yates shuffle: only the first n slots need shuffling.
  for (let i = 0; i < Math.min(n, copy.length); i++) {
    const j = i + Math.floor(random() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/**
 * The saved places, or (first time) `n` random places from `starters`, saved.
 * `storage` is localStorage, or null when the browser doesn't allow it.
 */
export function loadPlaces(storage, starters, n, random = Math.random) {
  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEY) ?? "null");
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {
    // Unreadable or corrupted: start over below.
  }
  const places = pickRandom(starters, n, random).map((p) => ({ ...p, visits: 0 }));
  savePlaces(storage, places);
  return places;
}

export function savePlaces(storage, places) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(places));
  } catch {
    // Storage full or blocked: popularity just won't survive a reload.
  }
}

/** Count one visit to `place`. Returns a new list, most visited first. */
export function recordVisit(places, place) {
  const known = places.some((p) => p.id === place.id);
  const next = known
    ? places.map((p) => (p.id === place.id ? { ...p, visits: p.visits + 1 } : p))
    : [...places, { ...place, visits: 1 }];
  // sort is stable, so places with equal counts keep their order.
  return next.sort((a, b) => b.visits - a.visits).slice(0, MAX_SAVED);
}
