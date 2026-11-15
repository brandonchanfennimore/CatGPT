/*
 * floodEvents.js - notable recent floods, shown as dots on the globe.
 *
 * Our study areas (studyAreas.js) are added to the globe automatically; this list
 * is everything else. Dots that are close together on screen merge into a
 * numbered cluster, and split apart as you zoom in (see FloodMarkers.jsx).
 *
 * Each event: lat/lon of the worst-hit town (degrees), date = "YYYY-MM" the flood
 * happened, and a one-line note. Compiled from public news and agency reports;
 * locations are the main town, not the full flooded area.
 */
export const floodEvents = [
  // ---- Europe ----
  { id: "ahr-2021", name: "Ahr Valley floods", place: "Bad Neuenahr, Germany", date: "2021-07", lat: 50.54, lon: 7.12,
    note: "Days of heavy rain sent a flash flood down the narrow Ahr valley." },
  { id: "emilia-2023", name: "Emilia-Romagna floods", place: "Faenza, Italy", date: "2023-05", lat: 44.29, lon: 11.88,
    note: "Two storms in two weeks made more than 20 rivers burst their banks." },
  { id: "slovenia-2023", name: "Slovenia floods", place: "Savinja Valley, Slovenia", date: "2023-08", lat: 46.23, lon: 15.26,
    note: "Torrential rain flooded about two-thirds of the country." },
  { id: "thessaly-2023", name: "Storm Daniel floods", place: "Thessaly plain, Greece", date: "2023-09", lat: 39.47, lon: 22.08,
    note: "Storm Daniel turned Greece's main farming plain into a lake." },
  { id: "jablanica-2024", name: "Jablanica floods", place: "Jablanica, Bosnia and Herzegovina", date: "2024-10", lat: 43.66, lon: 17.76,
    note: "Flash floods and landslides buried parts of the town." },

  // ---- Africa ----
  { id: "derna-2023", name: "Derna dam collapse", place: "Derna, Libya", date: "2023-09", lat: 32.76, lon: 22.64,
    note: "Storm Daniel burst two dams above the city, sweeping away whole districts." },
  { id: "maiduguri-2024", name: "Maiduguri floods", place: "Maiduguri, Nigeria", date: "2024-09", lat: 11.85, lon: 13.16,
    note: "The Alau dam failed after heavy rain, flooding much of the city." },
  { id: "kinshasa-2022", name: "Kinshasa floods", place: "Kinshasa, DR Congo", date: "2022-12", lat: -4.32, lon: 15.31,
    note: "Overnight downpours caused floods and landslides across the capital." },
  { id: "kalehe-2023", name: "Kalehe floods", place: "Kalehe, DR Congo", date: "2023-05", lat: -2.09, lon: 28.91,
    note: "Rivers above Lake Kivu flooded villages after torrential rain." },
  { id: "beledweyne-2023", name: "Shabelle River floods", place: "Beledweyne, Somalia", date: "2023-11", lat: 4.74, lon: 45.2,
    note: "El Niño rains pushed the Shabelle River through the town." },
  { id: "mai-mahiu-2024", name: "Mai Mahiu flash flood", place: "Mai Mahiu, Kenya", date: "2024-04", lat: -0.99, lon: 36.59,
    note: "Weeks of long-rains flooding ended in a deadly flash flood." },
  { id: "katesh-2023", name: "Mount Hanang mudflow", place: "Katesh, Tanzania", date: "2023-12", lat: -4.52, lon: 35.4,
    note: "Heavy rain sent mud and floodwater down Mount Hanang into the town." },
  { id: "blantyre-2023", name: "Cyclone Freddy floods", place: "Blantyre, Malawi", date: "2023-03", lat: -15.79, lon: 35.01,
    note: "Cyclone Freddy's rains caused floods and mudslides." },
  { id: "durban-2022", name: "KwaZulu-Natal floods", place: "Durban, South Africa", date: "2022-04", lat: -29.86, lon: 31.03,
    note: "Record rainfall caused floods and landslides around Durban." },
  { id: "kruger-2026", name: "Kruger Park floods", place: "Kruger National Park, South Africa", date: "2026-01", lat: -24.99, lon: 31.59,
    note: "The same January rains that flooded the Limpopo swamped the park." },
  { id: "cape-town-2026", name: "Western Cape floods", place: "Cape Town, South Africa", date: "2026-05", lat: -33.92, lon: 18.42,
    note: "Winter storms brought flooding, worst around Cape Town." },

  // ---- Middle East and Asia ----
  { id: "dubai-2024", name: "UAE record rain", place: "Dubai, UAE", date: "2024-04", lat: 25.2, lon: 55.27,
    note: "The heaviest rain on record flooded roads and the airport." },
  { id: "baghlan-2024", name: "Baghlan flash floods", place: "Baghlan, Afghanistan", date: "2024-05", lat: 36.13, lon: 68.7,
    note: "Flash floods swept through villages in northern Afghanistan." },
  { id: "sindh-2022", name: "Pakistan monsoon floods", place: "Dadu, Sindh, Pakistan", date: "2022-08", lat: 26.73, lon: 67.78,
    note: "Record monsoon rain left about a third of Pakistan under water." },
  { id: "buner-2025", name: "Buner cloudburst", place: "Buner, Pakistan", date: "2025-08", lat: 34.5, lon: 72.5,
    note: "A cloudburst sent flash floods through mountain villages." },
  { id: "kathmandu-2024", name: "Kathmandu floods", place: "Kathmandu, Nepal", date: "2024-09", lat: 27.71, lon: 85.32,
    note: "Record late-monsoon rain flooded rivers through the capital." },
  { id: "teesta-2023", name: "Teesta glacial lake flood", place: "Chungthang, Sikkim, India", date: "2023-10", lat: 27.6, lon: 88.64,
    note: "A glacial lake burst, destroying a dam and flooding the Teesta valley." },
  { id: "silchar-2022", name: "Assam floods", place: "Silchar, Assam, India", date: "2022-06", lat: 24.83, lon: 92.78,
    note: "The Barak River flooded most of the city for days." },
  { id: "chennai-2023", name: "Cyclone Michaung floods", place: "Chennai, India", date: "2023-12", lat: 13.08, lon: 80.27,
    note: "Cyclone Michaung stalled offshore and flooded the city." },
  { id: "sri-lanka-2025", name: "Cyclone Ditwah floods", place: "Colombo, Sri Lanka", date: "2025-11", lat: 6.93, lon: 79.86,
    note: "Cyclone Ditwah brought island-wide floods and landslides." },
  { id: "sumatra-2025", name: "Sumatra floods", place: "Aceh, Indonesia", date: "2025-11", lat: 4.7, lon: 96.75,
    note: "Tropical storm rains caused floods and landslides across northern Sumatra." },
  { id: "hanoi-2024", name: "Typhoon Yagi floods", place: "Hanoi, Vietnam", date: "2024-09", lat: 21.03, lon: 105.85,
    note: "Typhoon Yagi pushed the Red River to its highest level in decades." },
  { id: "hong-kong-2023", name: "Hong Kong rainstorm", place: "Hong Kong", date: "2023-09", lat: 22.32, lon: 114.17,
    note: "The heaviest hourly rain on record flooded streets and metro stations." },
  { id: "zhuozhou-2023", name: "Doksuri floods", place: "Zhuozhou, China", date: "2023-08", lat: 39.49, lon: 115.97,
    note: "Remnants of Typhoon Doksuri flooded towns south-west of Beijing." },

  // ---- Oceania ----
  { id: "lismore-2022", name: "Lismore floods", place: "Lismore, Australia", date: "2022-02", lat: -28.81, lon: 153.28,
    note: "The Wilsons River rose higher than ever recorded." },
  { id: "auckland-2023", name: "Auckland floods", place: "Auckland, New Zealand", date: "2023-01", lat: -36.85, lon: 174.76,
    note: "A month of rain fell in a day, flooding homes across the city." },

  // ---- Americas ----
  { id: "kerrville-2025", name: "Guadalupe River flash flood", place: "Kerrville, Texas, USA", date: "2025-07", lat: 30.05, lon: -99.14,
    note: "Before dawn the Guadalupe River rose about 10 m in an hour and a half at Kerrville." },
  { id: "comfort-2026", name: "Guadalupe River floods", place: "Comfort, Texas, USA", date: "2026-07", lat: 29.97, lon: -98.91,
    note: "A second July flood in two years; the river crested higher than in 2025." },
  { id: "kentucky-2022", name: "Eastern Kentucky floods", place: "Hazard, Kentucky, USA", date: "2022-07", lat: 37.25, lon: -83.19,
    note: "Overnight storms flooded towns in the Appalachian valleys." },
  { id: "vermont-2023", name: "Vermont floods", place: "Montpelier, Vermont, USA", date: "2023-07", lat: 44.26, lon: -72.58,
    note: "Two days of rain flooded the state capital's downtown." },
  { id: "asheville-2024", name: "Hurricane Helene floods", place: "Asheville, North Carolina, USA", date: "2024-09", lat: 35.6, lon: -82.55,
    note: "Helene's rain caused historic flooding in the mountains." },
  { id: "petropolis-2022", name: "Petrópolis floods", place: "Petrópolis, Brazil", date: "2022-02", lat: -22.51, lon: -43.18,
    note: "Record rain caused floods and mudslides in the hillside city." },
  { id: "sao-sebastiao-2023", name: "São Paulo coast floods", place: "São Sebastião, Brazil", date: "2023-02", lat: -23.76, lon: -45.41,
    note: "Record rainfall caused floods and landslides along the coast." },
  { id: "porto-alegre-2024", name: "Rio Grande do Sul floods", place: "Porto Alegre, Brazil", date: "2024-05", lat: -30.03, lon: -51.23,
    note: "Weeks of rain flooded much of the state and its capital." },
  { id: "bahia-blanca-2025", name: "Bahía Blanca floods", place: "Bahía Blanca, Argentina", date: "2025-03", lat: -38.72, lon: -62.27,
    note: "A record downpour (over 200 mm, about a third of a normal year) flooded much of the city in hours." },
];
