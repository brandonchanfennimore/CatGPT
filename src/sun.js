/*
 * sun.js - where is the Sun right now, as seen from Earth?
 *
 * The "subsolar point" is the spot on Earth where the Sun is directly overhead.
 * Light comes from that direction, so the half of the globe facing it is in daytime.
 *  - Its latitude = the Sun's "declination": +23.4° in June, -23.4° in December
 *    (that's why we have seasons).
 *  - Its longitude follows the clock: the Earth turns 15° per hour, and at 12:00 UTC
 *    the Sun is roughly over Greenwich (0°).
 *
 * Formulas: NOAA "General Solar Position Calculations" (accurate to well under 1°).
 * https://gml.noaa.gov/grad/solcalc/solareqns.PDF
 */

const DEG = 180 / Math.PI;

/** Latitude/longitude (degrees) where the Sun is overhead at `date`. */
export function subsolarPoint(date) {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear) / 86_400_000) + 1;
  const hoursUTC = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  // Position in the year as an angle (radians), called "fractional year" by NOAA.
  const g = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (hoursUTC - 12) / 24);

  // Declination: the tilt of Earth's axis toward/away from the Sun today.
  const decl =
    0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);

  // "Equation of time" (minutes): sundials run up to ~16 min fast/slow over the
  // year because Earth's orbit is an ellipse and its axis is tilted.
  const eqTime =
    229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));

  let lon = -15 * (hoursUTC - 12 + eqTime / 60);
  lon = ((((lon + 180) % 360) + 360) % 360) - 180; // wrap into -180..180
  return { lat: decl * DEG, lon };
}

/**
 * Turn latitude/longitude into a unit direction in the Earth model's own space.
 * Matches how three.js wraps a flat world map onto a SphereGeometry:
 * longitude 0° faces +X, 90°E faces -Z, the North Pole is +Y.
 */
export function latLonToVector(latDeg, lonDeg) {
  const lat = latDeg / DEG;
  const lon = lonDeg / DEG;
  return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)];
}

/** Direction from Earth's centre toward the Sun at `date`. */
export function sunDirection(date = new Date()) {
  const { lat, lon } = subsolarPoint(date);
  return latLonToVector(lat, lon);
}
