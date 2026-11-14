// Builds src/data/cities.json: a small list of cities for the globe labels.
// Source: SimpleMaps World Cities (CC BY 4.0) via the world-cities-json npm package.
// The full file is 12 MB, so we keep only capitals and cities above MIN_POPULATION.
// Run: npm run build:cities
import { readFileSync, writeFileSync } from 'node:fs';

const MIN_POPULATION = 400_000;

const all = JSON.parse(readFileSync('node_modules/world-cities-json/data/cities.json', 'utf8'));
const cities = all
  .filter((c) => c.capital === 'primary' || Number(c.population) >= MIN_POPULATION)
  .map((c) => [
    c.city, // name
    Number(Number(c.lat).toFixed(3)), // ~100 m precision is plenty for a label
    Number(Number(c.lng).toFixed(3)),
    Number(c.population) || 0,
    c.capital === 'primary' ? 1 : 0, // 1 = national capital
  ])
  .sort((a, b) => b[3] - a[3]); // biggest first

writeFileSync('src/data/cities.json', JSON.stringify(cities));
console.log(`wrote ${cities.length} cities to src/data/cities.json`);
