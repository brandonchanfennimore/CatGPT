/*
 * sites.js - every place shown as a dot on the globe, in one list.
 *
 * It combines three sources:
 *  1. studyAreas.js   - hand-made study areas (Valencia, Storm Boris, Limpopo, Sylhet...)
 *  2. events.js       - 128 surface-change events in 13 categories, with NASA catalogue
 *                       counts; eventImages.json adds radar images for most of them
 *                       (made by pipeline/event_images.py, stored in R2)
 *  3. floodEvents.js  - notable floods with a name, place and one-line note
 *
 * When a flood from floodEvents.js is the same flood as one in events.js (close
 * together and the same year), they're merged into one dot: the nicer name, place and
 * note from floodEvents.js, plus the images and NASA data from events.js.
 *
 * Every site ends up with: id, name, category, place, date, center {lat, lon},
 * description, and (if it has radar images) bounds + observations.
 */
import { studyAreas } from "./studyAreas";
import { events } from "./events";
import eventImages from "./eventImages.json";
import { floodEvents } from "./floodEvents";
import { eventFindings } from "./eventFindings";
import { eventSources } from "./eventSources";

const SAME_FLOOD_KM = 150; // closer than this, same year = the same flood

// Great-circle distance between two lat/lon points, in km.
function distanceKm(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// One sentence on what the radar images show: their dates.
// Observation dates look like "2023-01-28 (before) · Sentinel-1 radar".
function imagesNote(img) {
  if (!img?.observations?.length) return "";
  const dates = img.observations.map((o) => o.date.split(" · ")[0]).join(", ");
  return ` In these images: Sentinel-1 radar on ${dates}.`;
}

// Our events, with their radar images and "What Changed?" text attached.
const ourEvents = events.map((e) => {
  const img = eventImages[e.id];
  const text = eventFindings[e.id] ?? e.findings;
  return { ...e, ...img, ...(text && { findings: text + imagesNote(img) }) };
});

// Merge each named flood into a matching flood event of ours, or keep it on its own.
const extraFloods = [];
for (const f of floodEvents) {
  const match = ourEvents.find(
    (e) =>
      e.category === "Floods" &&
      e.date.slice(0, 4) === f.date.slice(0, 4) &&
      distanceKm(e.center, { lat: f.lat, lon: f.lon }) < SAME_FLOOD_KM
  );
  if (match) {
    Object.assign(match, { name: f.name, place: f.place, description: f.note });
  } else {
    extraFloods.push({
      id: f.id,
      name: f.name,
      category: "Floods",
      place: f.place,
      date: f.date,
      center: { lat: f.lat, lon: f.lon },
      description: f.note,
    });
  }
}

const ALL_SITES = [
  // Study areas are all floods so far. Valencia and Storm Boris take their radar images
  // (raw Sentinel-1 timeline, water maps, lens image) from eventImages.json like the
  // events do; their hand-written text stays. Limpopo and Sylhet keep their NISAR images.
  ...studyAreas.map((a) => ({ category: "Floods", ...a, ...eventImages[a.id] })),
  ...ourEvents,
  ...extraFloods,
];

// Every site gets the list of sources behind its description and "What Changed?" text.
export const SITES = ALL_SITES.map((s) => ({ ...s, sources: eventSources[s.id] ?? [] }));

// How many dots each category has (shown in the legend).
export const countByCategory = SITES.reduce((n, s) => ({ ...n, [s.category]: (n[s.category] ?? 0) + 1 }), {});

// A site has something to explore when it has radar images.
export const hasImages = (site) => Boolean(site.bounds && site.observations?.length);
