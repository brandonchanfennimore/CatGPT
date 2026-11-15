
export const studyAreas = [
    {
      id: "valencia-2024",
      name: "Valencia Floods, Spain",
      category: "Floods",
      place: "Valencia, Spain",
      date: "2024-10-29",
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
      id: "storm-boris-2024",
      name: "Storm Boris Floods, Poland",
      category: "Floods",
      place: "Nysa, Poland",
      date: "2024-09-15",
      description:
        "In mid-September 2024 Storm Boris stalled over Central Europe and poured several days of record rain onto the mountains of Czechia, Poland and Austria. Rivers rose fast; the town of Nysa in south-west Poland flooded as the Nysa Kłodzka river overflowed.",

      // Nysa reservoir and town. Images from NASA OPERA DSWx-S1 tile T33UXR,
      // re-projected to lat/lon and cropped to this box (see pipeline/dswx_flood.py).
      center: { lat: 50.47, lon: 17.28 },
      bounds: { west: 16.95, south: 50.4, east: 17.7, north: 50.585 },

      // Surface water maps from radar (Sentinel-1, processed by NASA OPERA).
      // Blue = open water, cyan = water under vegetation, clear = dry land.
      observations: [
        { date: "2024-09-03 (before)", image: "/radar/boris/2024-09-03.png" },
        { date: "2024-09-15 (flood peak)", image: "/radar/boris/2024-09-15.png" },
        { date: "2024-09-27 (12 days after)", image: "/radar/boris/2024-09-27.png" },
      ],
      // Flashlight mode: red = water that appeared between 3 and 15 September.
      flashlightImage: "/radar/boris/change.png",

      findings:
        "Between 3 and 15 September about 12 km² of new surface water appeared here (red in Flashlight mode): around the edges of the Otmuchów and Nysa reservoirs, which were holding back floodwater, and across the river plain north of Nysa. Radar sees through the storm clouds, but it misses water in the town itself (buildings bounce the signal back) and in narrow mountain valleys, so the real flooding was larger than this map shows.",

      impact:
        "Storm Boris killed more than two dozen people across Central Europe and forced tens of thousands to evacuate. Reservoirs like Nysa's helped hold back the peak; mapping how full they got and where water escaped helps plan for the next storm.",

      sourceUrl: "https://search.earthdata.nasa.gov/search?q=OPERA_L3_DSWX-S1_V1",
    },
  ];
