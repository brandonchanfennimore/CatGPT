
export const studyAreas = [
    {
      id: "valencia-2024",
      name: "Valencia Floods, Spain",
      description:
        "On 29 October 2024 a slow-moving storm (a \"DANA\") dropped up to a year's rain in hours. Flash floods tore through the towns south of Valencia and drained into the Albufera lagoon.",

      // Lat/lon of the site and of the images below (degrees). The images were made
      // from NASA OPERA DSWx-S1 tile T30SYJ, re-projected to lat/lon and cropped to this box.
      center: { lat: 39.37, lon: -0.4 },
      bounds: { west: -0.68, south: 39.18, east: -0.22, north: 39.56 },

      // Surface water maps from radar (Sentinel-1, processed by NASA OPERA).
      // Blue = open water, cyan = water under vegetation, clear = dry land.
      observations: [
        { date: "2024-10-19 (before)", image: "/radar/valencia/2024-10-19.png" },
        { date: "2024-10-31 (2 days after)", image: "/radar/valencia/2024-10-31.png" },
        { date: "2024-11-07 (9 days after)", image: "/radar/valencia/2024-11-07.png" },
      ],
      // Flashlight mode shows this change map: red = water that appeared after the flood.
      flashlightImage: "/radar/valencia/change.png",

      findings:
        "Comparing radar water maps from 19 and 31 October shows about 76 km² of new surface water (red in Flashlight mode), mostly around the Albufera lagoon and the low farmland of L'Horta Sud. Radar sees through the storm clouds, so it mapped the flood when ordinary satellite photos could not. Note: farmers also flood the Albufera rice fields on purpose from around November, so some new water near the lagoon may be seasonal, not the storm.",

      impact:
        "More than 220 people died and thousands of homes and cars were destroyed. Fast, cloud-proof flood maps like these help rescuers see which neighbourhoods are cut off, and help planners see where water collects in future storms.",

      sourceUrl: "https://search.earthdata.nasa.gov/search?q=OPERA_L3_DSWX-S1_V1",
    },
    {
      id: "test-area",
      name: "Test Region",
      description:
        "Explore how Earth's surface changes over time using satellite observations.",

      // Where the site is (degrees). PLACEHOLDER: made-up values so the radar
      // flashlight can be built and tested. Replace with the real site's values
      // (the data pipeline should write them into each image's JSON).
      center: { lat: 0, lon: -90 },
      // The radar images' lat/lon box: west/east = longitude, south/north = latitude.
      bounds: { west: -95, south: -5, east: -85, north: 5 },
  
      observations: [
        {
          date: "Test Frame 1",
          image: "/test-data/beginning.jpeg",
        },
        {
          date: "Test Frame 2",
          image: "/test-data/middle.jpeg",
        },
        {
          date: "Test Frame 3",
          image: "/test-data/after.jpeg",
        },
      ],
  
      findings:
        "This is temporary information for testing the interface.",
  
      impact:
        "Real NASA NISAR findings will appear here once the data is processed.",
  
      sourceUrl: "",
    },
  ];
  