
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
      satellite: "Sentinel-1",
      dataSource: "Sentinel-1 radar (ESA), water maps by NASA OPERA (DSWx-S1)",

      findings:
        "Comparing radar water maps from 19 and 31 October shows about 76 km² of new surface water, mostly around the Albufera lagoon and the low farmland of L'Horta Sud. Radar sees through the storm clouds, so it mapped the flood when ordinary satellite photos could not. Note: farmers also flood the Albufera rice fields on purpose from around November, so some new water near the lagoon may be seasonal, not the storm.",

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
      satellite: "Sentinel-1",
      dataSource: "Sentinel-1 radar (ESA), water maps by NASA OPERA (DSWx-S1)",

      findings:
        "Between 3 and 15 September about 12 km² of new surface water appeared here: around the edges of the Otmuchów and Nysa reservoirs, which were holding back floodwater, and across the river plain north of Nysa. Radar sees through the storm clouds, but it misses water in the town itself (buildings bounce the signal back) and in narrow mountain valleys, so the real flooding was larger than this map shows.",

      impact:
        "Storm Boris killed more than two dozen people across Central Europe and forced tens of thousands to evacuate. Reservoirs like Nysa's helped hold back the peak; mapping how full they got and where water escaped helps plan for the next storm.",

      sourceUrl: "https://search.earthdata.nasa.gov/search?q=OPERA_L3_DSWX-S1_V1",
    },
    {
      id: "chokwe-flood",
      name: "Limpopo River Flood, Mozambique",
      description:
        "In January 2026, weeks of heavy rain pushed the Limpopo River out of its banks across southern Mozambique. NISAR's radar sees through clouds, so it captured the flood while optical satellites only saw cloud cover.",

      // Chókwè town. Images from NASA-ISRO NISAR GCOV previews (track 114, ascending),
      // cropped 50 km x 50 km around the town by pipeline/fetch_asf.py:
      //   python pipeline/fetch_asf.py --lat -24.533 --lon 32.983 --name chokwe-flood
      center: { lat: -24.533, lon: 32.983 },
      satellite: "NISAR",
      bounds: { west: 32.7349, south: -24.7592, east: 33.2313, north: -24.3072 },

      // Radar view: NISAR false colour (dark = water). Normal view: a cloud-free photo
      // with NISAR's water in blue (pipeline/make_normal_view.py).
      observations: [
        { date: "2025-12-24 (before)", image: "/nisar/chokwe-flood/2025-12-24_A114.png",
          normalImage: "/nisar/chokwe-flood/2025-12-24_A114_normal.jpg" },
        { date: "2026-01-05 (just before)", image: "/nisar/chokwe-flood/2026-01-05_A114.png",
          normalImage: "/nisar/chokwe-flood/2026-01-05_A114_normal.jpg" },
        { date: "2026-01-17 (day after peak)", image: "/nisar/chokwe-flood/2026-01-17_A114.png",
          normalImage: "/nisar/chokwe-flood/2026-01-17_A114_normal.jpg" },
        { date: "2026-07-04 (water receded)", image: "/nisar/chokwe-flood/2026-07-04_A114.png",
          normalImage: "/nisar/chokwe-flood/2026-07-04_A114_normal.jpg" },
        { date: "2026-09-26 (dry season)", image: "/nisar/chokwe-flood/2026-09-26_A114.png",
          normalImage: "/nisar/chokwe-flood/2026-09-26_A114_normal.jpg" },
      ],

      viewNotes: {
        normal:
          "Blue = water detected by NISAR radar on this date (not the real colour of the water). Background: cloud-free Landsat/Sentinel-2 photo (NASA HLS) from 15 Aug 2025, the same in every frame.",
      },

      findings:
        "Radar bounces away from smooth water, so open water shows up dark in Radar view (blue in Normal view). On 5 January the Limpopo is a thin line crossing the image. On 17 January, the day after the river peaked at Chókwè, the whole valley is flooded: water spread several kilometres across farmland on both banks, up to the edge of the town (centre) and into its irrigated fields (the grid pattern, lower right). By July the river is back in its channel.",

      impact:
        "NASA reports the flooding displaced over 600,000 people, flooded 30,000 homes and damaged 400,000 acres of cropland; local officials said 88% of Chókwè district was under water. Because radar works day or night and through cloud, NISAR can map a flood while it is happening, when responders need it most.",

      sourceUrl: "https://svs.gsfc.nasa.gov/5661",
    },
    {
      id: "sylhet-flood-2026",
      name: "Sylhet Monsoon Floods 2026, Bangladesh",
      description:
        "Sylhet sits in a bowl of low wetlands (\"haors\") fed by rivers coming off the hills of India. In the 2026 monsoon, flash floods hit from June, and by mid-July the Surma and Kushiyara rivers were above danger level at several gauges.",

      // Sylhet city. Images from NASA-ISRO NISAR GCOV previews (track 91, descending),
      // cropped 60 km x 60 km around the city by pipeline/fetch_asf.py:
      //   python pipeline/fetch_asf.py --lat 24.90 --lon 91.87 --name sylhet-flood --radius-km 30
      center: { lat: 24.9, lon: 91.87 },
      satellite: "NISAR",
      bounds: { west: 91.5734, south: 24.6298, east: 92.1664, north: 25.1698 },

      // NISAR's first pass here was 20 June 2026, so there's no pre-monsoon "before";
      // November (dry season) shows the normal state instead.
      observations: [
        { date: "2026-06-20 (flood season)", image: "/nisar/sylhet-flood/2026-06-20_D91.png",
          normalImage: "/nisar/sylhet-flood/2026-06-20_D91_normal.jpg" },
        { date: "2026-07-14 (peak)", image: "/nisar/sylhet-flood/2026-07-14_D91.png",
          normalImage: "/nisar/sylhet-flood/2026-07-14_D91_normal.jpg" },
        { date: "2026-08-31 (receding)", image: "/nisar/sylhet-flood/2026-08-31_D91.png",
          normalImage: "/nisar/sylhet-flood/2026-08-31_D91_normal.jpg" },
        { date: "2026-10-18 (monsoon over)", image: "/nisar/sylhet-flood/2026-10-18_D91.png",
          normalImage: "/nisar/sylhet-flood/2026-10-18_D91_normal.jpg" },
        { date: "2026-11-11 (dry season)", image: "/nisar/sylhet-flood/2026-11-11_D91.png",
          normalImage: "/nisar/sylhet-flood/2026-11-11_D91_normal.jpg" },
      ],

      viewNotes: {
        normal:
          "Blue = water detected by NISAR radar on this date (not the real colour of the water). Background: Landsat/Sentinel-2 photo (NASA HLS) from 5 May 2026, before the monsoon, the same in every frame.",
      },

      findings:
        "On 14 July, a day after rivers were reported above danger level at four gauges, NISAR shows patches of open water spread across the low farmland and wetlands north-west of the city (dark in Radar view, blue in Normal view). By November the radar finds about a third as much open water. Some of the water is normal: the haors fill every monsoon (the large lake at the lower right is there in every frame), so the flood is the extra water on top of that.",

      impact:
        "Sylhet's haors grow one rice crop a year, and early flash floods can wipe it out: rain and flash floods damaged an estimated Tk 7.5 billion of boro rice in May 2026, before the main monsoon. In July the UN and aid agencies coordinated a response to flash floods and landslides across the region. Radar can watch the haors fill and drain under monsoon clouds, every 12 days.",

      sourceUrl: "https://bangladesh.un.org/sites/default/files/2026-07/SitRep_ICCG_Flash%20Flood%20%26%20Landslides_13July26.pdf",
    },
    {
      id: "hoover-dam",
      name: "Lake Mead & Hoover Dam, USA",
      category: "Reservoirs",
      description:
        "Hoover Dam holds back the Colorado River to form Lake Mead, the largest reservoir in the United States and a main water supply for Nevada, Arizona and southern California. After years of drought on the Colorado River, the lake fell to its lowest level on record in August 2026.",

      // Hoover Dam. Images from NASA-ISRO NISAR GCOV previews (track 85, descending),
      // 50 km x 50 km around the dam, by pipeline/fetch_asf.py:
      //   python pipeline/fetch_asf.py --lat 36.016045 --lon -114.737839 --name hoover-dam
      // Only passes from 27 Jan 2026 on are used: earlier previews have no corner file and
      // land about 1 km off. 31 Aug 2026 is left out (a processing stripe crosses it).
      center: { lat: 36.016045, lon: -114.737839 },
      satellite: "NISAR",
      bounds: { west: -115.0154, south: 35.792, east: -114.4599, north: 36.2413 },

      observations: [
        { date: "2026-01-27 (winter, ~1,065 ft)", image: "/nisar/hoover-dam/2026-01-27_D85.png",
          normalImage: "/nisar/hoover-dam/2026-01-27_D85_normal.jpg" },
        { date: "2026-04-09 (spring)", image: "/nisar/hoover-dam/2026-04-09_D85.png",
          normalImage: "/nisar/hoover-dam/2026-04-09_D85_normal.jpg" },
        { date: "2026-06-20 (early summer)", image: "/nisar/hoover-dam/2026-06-20_D85.png",
          normalImage: "/nisar/hoover-dam/2026-06-20_D85_normal.jpg" },
        { date: "2026-08-19 (after the record low)", image: "/nisar/hoover-dam/2026-08-19_D85.png",
          normalImage: "/nisar/hoover-dam/2026-08-19_D85_normal.jpg" },
        { date: "2026-10-30 (latest)", image: "/nisar/hoover-dam/2026-10-30_D85.png",
          normalImage: "/nisar/hoover-dam/2026-10-30_D85_normal.jpg" },
      ],

      viewNotes: {
        radar:
          "NISAR radar, false colour: Lake Mead is the dark shape; mountains are purple and white (slopes facing the satellite are brighter); towns are bright white. Dry, smooth lakebeds (bottom left) also look dark but aren't water.",
        normal:
          "Blue = Lake Mead as detected by NISAR on this date (not the real colour of the water). Only water connected to the lake is painted. Background: Sentinel-2 photo (NASA HLS) from 18 Oct 2025, the same in every frame.",
      },

      findings:
        "The dam sits at the southern tip of Lake Mead's Boulder Basin, where the Colorado River leaves through the narrow Black Canyon. Between late January (about 1,065 ft above sea level) and early August (1,040.5 ft, a record low) the lake fell by roughly 25 feet. Boulder Basin has steep canyon walls, so even that drop moves the shoreline only a short distance, often less than one pixel in these 180 m previews, and wind ripples change how dark the water looks from pass to pass. That's why the lake looks similar in every frame: tracking a few metres of level needs NISAR's full-resolution data, where each pixel is about 20 m.",

      impact:
        "Lake Mead supplies water to cities and farms across the lower Colorado River basin, and Hoover Dam's power plant makes less electricity as the water drops. Reclamation's July 2026 projection expected the lake to keep falling until November. Radar can watch reservoirs like this every 12 days, day or night, through cloud or dust.",
    },
  ];
