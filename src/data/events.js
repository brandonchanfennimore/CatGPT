// Surface-change events shown as pins on the globe (generated from a NASA catalogue check).
// nasaData = how many files NASA's catalogue (CMR) had at this spot around the event
// (3 weeks either side; "ongoing" = all of 2024; NISAR = Nov 2025 - Nov 2026):
//   sentinel1: raw Sentinel-1 radar scenes, ready: files of `readyProduct` (a ready-made
//   map), nisar: NISAR GCOV files, older: ALOS PALSAR / UAVSAR files.
// Descriptions are short summaries from general knowledge: check before presenting.
export const events = [
  {
    "id": "punjab-monsoon-2025",
    "name": "Punjab monsoon 2025",
    "category": "Floods",
    "place": "Punjab, Pakistan",
    "date": "2025-08-27",
    "center": {
      "lat": 31.6,
      "lon": 74.25
    },
    "description": "Heavy monsoon rain and swollen rivers flooded huge areas of farmland.",
    "nasaData": {
      "sentinel1": 9,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 33,
      "nisar": 0,
      "older": 0,
      "window": [
        "2025-08-06",
        "2025-09-17"
      ]
    }
  },
  {
    "id": "maiduguri-dam",
    "name": "Maiduguri dam",
    "category": "Floods",
    "place": "Maiduguri, Nigeria",
    "date": "2024-09-10",
    "center": {
      "lat": 11.85,
      "lon": 13.16
    },
    "description": "The Alau dam failed after heavy rain, flooding large parts of the city.",
    "nasaData": {
      "sentinel1": 8,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 19,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-08-20",
        "2024-10-01"
      ]
    }
  },
  {
    "id": "rio-grande-do-sul",
    "name": "Rio Grande do Sul",
    "category": "Floods",
    "place": "Porto Alegre, Brazil",
    "date": "2024-05-03",
    "center": {
      "lat": -29.99,
      "lon": -51.2
    },
    "description": "Weeks of rain flooded much of the state, including the capital Porto Alegre.",
    "nasaData": {
      "sentinel1": 2,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-04-12",
        "2024-05-24"
      ]
    }
  },
  {
    "id": "derna-storm-daniel",
    "name": "Derna (Storm Daniel)",
    "category": "Floods",
    "place": "Derna, Libya",
    "date": "2023-09-11",
    "center": {
      "lat": 32.76,
      "lon": 22.64
    },
    "description": "Two dams burst during Storm Daniel, sending a flood wave through the city.",
    "nasaData": {
      "sentinel1": 10,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2023-08-21",
        "2023-10-02"
      ]
    }
  },
  {
    "id": "pakistan-2022-sindh",
    "name": "Pakistan 2022 (Sindh)",
    "category": "Floods",
    "place": "Sindh, Pakistan",
    "date": "2022-08-30",
    "center": {
      "lat": 26.73,
      "lon": 67.78
    },
    "description": "Record monsoon left roughly a third of Pakistan under water at its peak.",
    "nasaData": {
      "sentinel1": 7,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2022-08-09",
        "2022-09-20"
      ]
    }
  },
  {
    "id": "emilia-romagna",
    "name": "Emilia-Romagna",
    "category": "Floods",
    "place": "Emilia-Romagna, Italy",
    "date": "2023-05-17",
    "center": {
      "lat": 44.35,
      "lon": 11.95
    },
    "description": "Two waves of heavy rain flooded rivers and farmland across the region.",
    "nasaData": {
      "sentinel1": 8,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2023-04-26",
        "2023-06-07"
      ]
    }
  },
  {
    "id": "ahr-valley",
    "name": "Ahr valley",
    "category": "Floods",
    "place": "Ahr valley, Germany",
    "date": "2021-07-15",
    "center": {
      "lat": 50.53,
      "lon": 7.12
    },
    "description": "Extreme rain turned small rivers in Germany and Belgium into deadly floods.",
    "nasaData": {
      "sentinel1": 27,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2021-06-24",
        "2021-08-05"
      ]
    }
  },
  {
    "id": "hurricane-harvey",
    "name": "Hurricane Harvey",
    "category": "Floods",
    "place": "Houston, USA",
    "date": "2017-08-28",
    "center": {
      "lat": 29.76,
      "lon": -95.37
    },
    "description": "The hurricane stalled over Texas, dumping record rain on Houston.",
    "nasaData": {
      "sentinel1": 18,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 0,
      "nisar": 0,
      "older": 12,
      "window": [
        "2017-08-07",
        "2017-09-18"
      ]
    }
  },
  {
    "id": "kahramanmaras",
    "name": "Kahramanmaras",
    "category": "Earthquakes",
    "place": "Kahramanmaraş, Türkiye",
    "date": "2023-02-06",
    "center": {
      "lat": 37.4,
      "lon": 37.0
    },
    "description": "Two huge quakes (M7.8 and M7.5) ruptured hundreds of km of faults.",
    "nasaData": {
      "sentinel1": 10,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 42,
      "nisar": 0,
      "older": 0,
      "window": [
        "2023-01-16",
        "2023-02-27"
      ]
    }
  },
  {
    "id": "myanmar-sagaing",
    "name": "Myanmar Sagaing",
    "category": "Earthquakes",
    "place": "Mandalay, Myanmar",
    "date": "2025-03-28",
    "center": {
      "lat": 21.97,
      "lon": 96.08
    },
    "description": "M7.7 quake on the Sagaing fault, one of the longest ruptures recorded.",
    "nasaData": {
      "sentinel1": 12,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2025-03-07",
        "2025-04-18"
      ]
    }
  },
  {
    "id": "noto-peninsula",
    "name": "Noto Peninsula",
    "category": "Earthquakes",
    "place": "Noto, Japan",
    "date": "2024-01-01",
    "center": {
      "lat": 37.4,
      "lon": 137.2
    },
    "description": "M7.5 quake lifted parts of the coastline by up to about 4 m.",
    "nasaData": {
      "sentinel1": 9,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2023-12-11",
        "2024-01-22"
      ]
    }
  },
  {
    "id": "al-haouz-morocco",
    "name": "Al Haouz Morocco",
    "category": "Earthquakes",
    "place": "Atlas Mountains, Morocco",
    "date": "2023-09-08",
    "center": {
      "lat": 31.07,
      "lon": -8.4
    },
    "description": "M6.8 quake struck mountain villages in the High Atlas.",
    "nasaData": {
      "sentinel1": 12,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2023-08-18",
        "2023-09-29"
      ]
    }
  },
  {
    "id": "hualien-taiwan",
    "name": "Hualien Taiwan",
    "category": "Earthquakes",
    "place": "Hualien, Taiwan",
    "date": "2024-04-03",
    "center": {
      "lat": 23.98,
      "lon": 121.6
    },
    "description": "M7.4 quake, Taiwan's strongest in about 25 years.",
    "nasaData": {
      "sentinel1": 8,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-03-13",
        "2024-04-24"
      ]
    }
  },
  {
    "id": "ridgecrest",
    "name": "Ridgecrest",
    "category": "Earthquakes",
    "place": "Ridgecrest, California, USA",
    "date": "2019-07-06",
    "center": {
      "lat": 35.77,
      "lon": -117.6
    },
    "description": "M6.4 and M7.1 quakes in the desert; a classic radar (InSAR) example.",
    "nasaData": {
      "sentinel1": 10,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 86,
      "nisar": 0,
      "older": 0,
      "window": [
        "2019-06-15",
        "2019-07-27"
      ]
    }
  },
  {
    "id": "kaikoura",
    "name": "Kaikoura",
    "category": "Earthquakes",
    "place": "Kaikōura, New Zealand",
    "date": "2016-11-14",
    "center": {
      "lat": -42.4,
      "lon": 173.68
    },
    "description": "M7.8 quake ruptured many faults at once and lifted the coast.",
    "nasaData": {
      "sentinel1": 13,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2016-10-24",
        "2016-12-05"
      ]
    }
  },
  {
    "id": "gorkha-nepal",
    "name": "Gorkha Nepal",
    "category": "Earthquakes",
    "place": "Gorkha, Nepal",
    "date": "2015-04-25",
    "center": {
      "lat": 28.15,
      "lon": 84.7
    },
    "description": "M7.8 quake lifted the Kathmandu valley; one of the first Sentinel-1 quake maps.",
    "nasaData": {
      "sentinel1": 8,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 8,
      "nisar": 0,
      "older": 0,
      "window": [
        "2015-04-04",
        "2015-05-16"
      ]
    }
  },
  {
    "id": "herat",
    "name": "Herat",
    "category": "Earthquakes",
    "place": "Herat, Afghanistan",
    "date": "2023-10-07",
    "center": {
      "lat": 34.6,
      "lon": 61.9
    },
    "description": "A series of M6.3 quakes struck villages near Herat.",
    "nasaData": {
      "sentinel1": 6,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2023-09-16",
        "2023-10-28"
      ]
    }
  },
  {
    "id": "kamchatka-m8-8",
    "name": "Kamchatka M8.8",
    "category": "Earthquakes",
    "place": "Kamchatka, Russia",
    "date": "2025-07-29",
    "center": {
      "lat": 53.0,
      "lon": 158.65
    },
    "description": "One of the largest quakes ever recorded, mostly offshore; Pacific tsunami alerts.",
    "nasaData": {
      "sentinel1": 12,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2025-07-08",
        "2025-08-19"
      ]
    }
  },
  {
    "id": "grindavik-sundhnukur",
    "name": "Grindavik/Sundhnukur",
    "category": "Volcanoes",
    "place": "Grindavík, Iceland",
    "date": "2023-11-10",
    "center": {
      "lat": 63.86,
      "lon": -22.43
    },
    "description": "Magma split the ground under the town, then repeated eruptions began.",
    "nasaData": {
      "sentinel1": 23,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2023-10-20",
        "2023-12-01"
      ]
    }
  },
  {
    "id": "cumbre-vieja-la-palma",
    "name": "Cumbre Vieja La Palma",
    "category": "Volcanoes",
    "place": "La Palma, Spain",
    "date": "2021-09-19",
    "center": {
      "lat": 28.61,
      "lon": -17.87
    },
    "description": "A three-month eruption; lava flows buried thousands of buildings.",
    "nasaData": {
      "sentinel1": 22,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 30,
      "nisar": 0,
      "older": 0,
      "window": [
        "2021-08-29",
        "2021-10-10"
      ]
    }
  },
  {
    "id": "kilauea-2018",
    "name": "Kilauea 2018",
    "category": "Volcanoes",
    "place": "Hawaiʻi, USA",
    "date": "2018-05-03",
    "center": {
      "lat": 19.41,
      "lon": -155.28
    },
    "description": "Lava poured into neighbourhoods while the summit crater collapsed.",
    "nasaData": {
      "sentinel1": 10,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 75,
      "nisar": 0,
      "older": 11,
      "window": [
        "2018-04-12",
        "2018-05-24"
      ]
    }
  },
  {
    "id": "hunga-tonga",
    "name": "Hunga Tonga",
    "category": "Volcanoes",
    "place": "Tonga",
    "date": "2022-01-15",
    "center": {
      "lat": -20.55,
      "lon": -175.39
    },
    "description": "A huge underwater explosion mostly destroyed the volcanic island.",
    "nasaData": {
      "sentinel1": 4,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2021-12-25",
        "2022-02-05"
      ]
    }
  },
  {
    "id": "mauna-loa-2022",
    "name": "Mauna Loa 2022",
    "category": "Volcanoes",
    "place": "Hawaiʻi, USA",
    "date": "2022-11-27",
    "center": {
      "lat": 19.47,
      "lon": -155.6
    },
    "description": "The world's largest active volcano erupted for the first time since 1984.",
    "nasaData": {
      "sentinel1": 7,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 43,
      "nisar": 0,
      "older": 0,
      "window": [
        "2022-11-06",
        "2022-12-18"
      ]
    }
  },
  {
    "id": "fagradalsfjall",
    "name": "Fagradalsfjall",
    "category": "Volcanoes",
    "place": "Reykjanes, Iceland",
    "date": "2021-03-19",
    "center": {
      "lat": 63.89,
      "lon": -22.27
    },
    "description": "First eruption on the peninsula in about 800 years.",
    "nasaData": {
      "sentinel1": 53,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 149,
      "nisar": 0,
      "older": 0,
      "window": [
        "2021-02-26",
        "2021-04-09"
      ]
    }
  },
  {
    "id": "nyiragongo",
    "name": "Nyiragongo",
    "category": "Volcanoes",
    "place": "Goma, DR Congo",
    "date": "2021-05-22",
    "center": {
      "lat": -1.52,
      "lon": 29.25
    },
    "description": "Lava flows reached the edge of the city of Goma.",
    "nasaData": {
      "sentinel1": 13,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2021-05-01",
        "2021-06-12"
      ]
    }
  },
  {
    "id": "semeru",
    "name": "Semeru",
    "category": "Volcanoes",
    "place": "Java, Indonesia",
    "date": "2021-12-04",
    "center": {
      "lat": -8.11,
      "lon": 112.92
    },
    "description": "A collapse sent hot ash flows down the volcano's flank.",
    "nasaData": {
      "sentinel1": 9,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2021-11-13",
        "2021-12-25"
      ]
    }
  },
  {
    "id": "campi-flegrei",
    "name": "Campi Flegrei",
    "category": "Volcanoes",
    "place": "Naples, Italy",
    "date": "ongoing",
    "center": {
      "lat": 40.83,
      "lon": 14.14
    },
    "description": "The ground is slowly rising (bradyseism) under a densely populated caldera.",
    "nasaData": {
      "sentinel1": 120,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 20,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "etna-2021",
    "name": "Etna 2021",
    "category": "Volcanoes",
    "place": "Sicily, Italy",
    "date": "2021-02-16",
    "center": {
      "lat": 37.75,
      "lon": 15.0
    },
    "description": "A burst of lava fountains from Europe's most active volcano.",
    "nasaData": {
      "sentinel1": 14,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 34,
      "nisar": 0,
      "older": 0,
      "window": [
        "2021-01-26",
        "2021-03-09"
      ]
    }
  },
  {
    "id": "mexico-city",
    "name": "Mexico City",
    "category": "Subsidence",
    "place": "Mexico City, Mexico",
    "date": "ongoing",
    "center": {
      "lat": 19.43,
      "lon": -99.13
    },
    "description": "Parts of the city sink tens of cm per year as groundwater is pumped out.",
    "nasaData": {
      "sentinel1": 93,
      "readyProduct": "OPERA_L3_DISP-S1_V1",
      "ready": 124,
      "nisar": 70,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "jakarta",
    "name": "Jakarta",
    "category": "Subsidence",
    "place": "Jakarta, Indonesia",
    "date": "ongoing",
    "center": {
      "lat": -6.2,
      "lon": 106.85
    },
    "description": "Parts of the city sink fast; Indonesia is moving its capital.",
    "nasaData": {
      "sentinel1": 35,
      "readyProduct": "OPERA_L3_DISP-S1_V1",
      "ready": 0,
      "nisar": 20,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "tehran",
    "name": "Tehran",
    "category": "Subsidence",
    "place": "Tehran, Iran",
    "date": "ongoing",
    "center": {
      "lat": 35.6,
      "lon": 51.3
    },
    "description": "Groundwater pumping makes areas around the city sink rapidly.",
    "nasaData": {
      "sentinel1": 58,
      "readyProduct": "OPERA_L3_DISP-S1_V1",
      "ready": 0,
      "nisar": 39,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "central-valley-ca",
    "name": "Central Valley CA",
    "category": "Subsidence",
    "place": "Central Valley, California, USA",
    "date": "ongoing",
    "center": {
      "lat": 36.3,
      "lon": -119.6
    },
    "description": "Farm wells make the ground sink, especially during droughts.",
    "nasaData": {
      "sentinel1": 59,
      "readyProduct": "OPERA_L3_DISP-S1_V1",
      "ready": 66,
      "nisar": 60,
      "older": 4,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "semarang",
    "name": "Semarang",
    "category": "Subsidence",
    "place": "Semarang, Indonesia",
    "date": "ongoing",
    "center": {
      "lat": -6.95,
      "lon": 110.42
    },
    "description": "A coastal city sinking fast, worsening flooding from the sea.",
    "nasaData": {
      "sentinel1": 54,
      "readyProduct": "OPERA_L3_DISP-S1_V1",
      "ready": 0,
      "nisar": 22,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "houston",
    "name": "Houston",
    "category": "Subsidence",
    "place": "Houston, USA",
    "date": "ongoing",
    "center": {
      "lat": 29.76,
      "lon": -95.37
    },
    "description": "Groundwater and oil/gas extraction have lowered parts of the region.",
    "nasaData": {
      "sentinel1": 90,
      "readyProduct": "OPERA_L3_DISP-S1_V1",
      "ready": 70,
      "nisar": 118,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "beijing",
    "name": "Beijing",
    "category": "Subsidence",
    "place": "Beijing, China",
    "date": "ongoing",
    "center": {
      "lat": 39.9,
      "lon": 116.4
    },
    "description": "Groundwater use has made parts of the North China Plain sink.",
    "nasaData": {
      "sentinel1": 48,
      "readyProduct": "OPERA_L3_DISP-S1_V1",
      "ready": 0,
      "nisar": 36,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "mekong-delta",
    "name": "Mekong Delta",
    "category": "Subsidence",
    "place": "Mekong Delta, Vietnam",
    "date": "ongoing",
    "center": {
      "lat": 10.0,
      "lon": 105.8
    },
    "description": "The delta sinks as groundwater is pumped and sediment supply drops.",
    "nasaData": {
      "sentinel1": 54,
      "readyProduct": "OPERA_L3_DISP-S1_V1",
      "ready": 0,
      "nisar": 62,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "venice",
    "name": "Venice",
    "category": "Subsidence",
    "place": "Venice, Italy",
    "date": "ongoing",
    "center": {
      "lat": 45.44,
      "lon": 12.33
    },
    "description": "A slowly sinking lagoon city facing rising seas.",
    "nasaData": {
      "sentinel1": 92,
      "readyProduct": "OPERA_L3_DISP-S1_V1",
      "ready": 0,
      "nisar": 61,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "joshimath",
    "name": "Joshimath",
    "category": "Subsidence",
    "place": "Joshimath, India",
    "date": "2023-01-05",
    "center": {
      "lat": 30.55,
      "lon": 79.56
    },
    "description": "In early 2023 the Himalayan town cracked and sank on its slope.",
    "nasaData": {
      "sentinel1": 9,
      "readyProduct": "OPERA_L3_DISP-S1_V1",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2022-12-15",
        "2023-01-26"
      ]
    }
  },
  {
    "id": "wayanad",
    "name": "Wayanad",
    "category": "Landslides",
    "place": "Wayanad, Kerala, India",
    "date": "2024-07-30",
    "center": {
      "lat": 11.48,
      "lon": 76.15
    },
    "description": "Heavy rain triggered debris flows that swept through villages.",
    "nasaData": {
      "sentinel1": 7,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-07-09",
        "2024-08-20"
      ]
    }
  },
  {
    "id": "enga-png",
    "name": "Enga PNG",
    "category": "Landslides",
    "place": "Enga, Papua New Guinea",
    "date": "2024-05-24",
    "center": {
      "lat": -5.37,
      "lon": 143.48
    },
    "description": "A mountainside collapsed and buried a village.",
    "nasaData": {
      "sentinel1": 6,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-05-03",
        "2024-06-14"
      ]
    }
  },
  {
    "id": "blatten",
    "name": "Blatten",
    "category": "Landslides",
    "place": "Blatten, Switzerland",
    "date": "2025-05-28",
    "center": {
      "lat": 46.42,
      "lon": 7.82
    },
    "description": "The Birch glacier collapsed and buried most of the evacuated village.",
    "nasaData": {
      "sentinel1": 28,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2025-05-07",
        "2025-06-18"
      ]
    }
  },
  {
    "id": "portuguese-bend",
    "name": "Portuguese Bend",
    "category": "Landslides",
    "place": "Rancho Palos Verdes, California, USA",
    "date": "ongoing",
    "center": {
      "lat": 33.74,
      "lon": -118.37
    },
    "description": "A slow landslide speeding up under homes; great for InSAR.",
    "nasaData": {
      "sentinel1": 90,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 130,
      "nisar": 109,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "chamoli",
    "name": "Chamoli",
    "category": "Landslides",
    "place": "Chamoli, India",
    "date": "2021-02-07",
    "center": {
      "lat": 30.4,
      "lon": 79.73
    },
    "description": "A rock and ice avalanche sent a deadly flood wave down the valley.",
    "nasaData": {
      "sentinel1": 18,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 21,
      "nisar": 0,
      "older": 0,
      "window": [
        "2021-01-17",
        "2021-02-28"
      ]
    }
  },
  {
    "id": "gjerdrum",
    "name": "Gjerdrum",
    "category": "Landslides",
    "place": "Gjerdrum, Norway",
    "date": "2020-12-30",
    "center": {
      "lat": 60.07,
      "lon": 11.03
    },
    "description": "A quick-clay slide suddenly swallowed part of a village.",
    "nasaData": {
      "sentinel1": 35,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2020-12-09",
        "2021-01-20"
      ]
    }
  },
  {
    "id": "xinmo",
    "name": "Xinmo",
    "category": "Landslides",
    "place": "Sichuan, China",
    "date": "2017-06-24",
    "center": {
      "lat": 32.06,
      "lon": 103.66
    },
    "description": "A mountainside collapsed onto the village of Xinmo.",
    "nasaData": {
      "sentinel1": 7,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 4,
      "nisar": 0,
      "older": 0,
      "window": [
        "2017-06-03",
        "2017-07-15"
      ]
    }
  },
  {
    "id": "mud-creek-big-sur",
    "name": "Mud Creek Big Sur",
    "category": "Landslides",
    "place": "Big Sur, California, USA",
    "date": "2017-05-20",
    "center": {
      "lat": 35.86,
      "lon": -121.43
    },
    "description": "A huge slide buried the coastal highway and extended the shoreline.",
    "nasaData": {
      "sentinel1": 6,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 45,
      "nisar": 0,
      "older": 1,
      "window": [
        "2017-04-29",
        "2017-06-10"
      ]
    }
  },
  {
    "id": "oso-sr530",
    "name": "Oso SR530",
    "category": "Landslides",
    "place": "Oso, Washington, USA",
    "date": "2014-03-22",
    "center": {
      "lat": 48.28,
      "lon": -121.85
    },
    "description": "A hillside collapsed across a river and a highway community.",
    "nasaData": {
      "sentinel1": 0,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2014-03-01",
        "2014-04-12"
      ]
    }
  },
  {
    "id": "brienz-brinzauls",
    "name": "Brienz/Brinzauls",
    "category": "Landslides",
    "place": "Brienz/Brinzauls, Switzerland",
    "date": "2023-06-15",
    "center": {
      "lat": 46.67,
      "lon": 9.6
    },
    "description": "A whole village sits on a moving slope; residents were evacuated.",
    "nasaData": {
      "sentinel1": 14,
      "readyProduct": "SENTINEL-1_INTERFEROGRAMS",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2023-05-25",
        "2023-07-06"
      ]
    }
  },
  {
    "id": "la-palisades-eaton",
    "name": "LA Palisades/Eaton",
    "category": "Wildfires",
    "place": "Los Angeles, USA",
    "date": "2025-01-07",
    "center": {
      "lat": 34.07,
      "lon": -118.54
    },
    "description": "Wind-driven fires destroyed thousands of homes.",
    "nasaData": {
      "sentinel1": 14,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 15,
      "nisar": 0,
      "older": 4,
      "window": [
        "2024-12-17",
        "2025-01-28"
      ]
    }
  },
  {
    "id": "lahaina",
    "name": "Lahaina",
    "category": "Wildfires",
    "place": "Maui, Hawaiʻi, USA",
    "date": "2023-08-08",
    "center": {
      "lat": 20.88,
      "lon": -156.68
    },
    "description": "A fast fire destroyed the historic town of Lahaina.",
    "nasaData": {
      "sentinel1": 7,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 17,
      "nisar": 0,
      "older": 0,
      "window": [
        "2023-07-18",
        "2023-08-29"
      ]
    }
  },
  {
    "id": "quebec-2023",
    "name": "Quebec 2023",
    "category": "Wildfires",
    "place": "Quebec, Canada",
    "date": "2023-06-05",
    "center": {
      "lat": 49.9,
      "lon": -74.4
    },
    "description": "Part of Canada's worst fire season on record.",
    "nasaData": {
      "sentinel1": 4,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 11,
      "nisar": 0,
      "older": 0,
      "window": [
        "2023-05-15",
        "2023-06-26"
      ]
    }
  },
  {
    "id": "jasper",
    "name": "Jasper",
    "category": "Wildfires",
    "place": "Jasper, Alberta, Canada",
    "date": "2024-07-24",
    "center": {
      "lat": 52.87,
      "lon": -118.08
    },
    "description": "A wildfire burned into the mountain town of Jasper.",
    "nasaData": {
      "sentinel1": 4,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 23,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-07-03",
        "2024-08-14"
      ]
    }
  },
  {
    "id": "evros-greece",
    "name": "Evros Greece",
    "category": "Wildfires",
    "place": "Evros, Greece",
    "date": "2023-08-22",
    "center": {
      "lat": 41.12,
      "lon": 26.2
    },
    "description": "The largest wildfire recorded in the EU.",
    "nasaData": {
      "sentinel1": 11,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 21,
      "nisar": 0,
      "older": 0,
      "window": [
        "2023-08-01",
        "2023-09-12"
      ]
    }
  },
  {
    "id": "valparaiso-chile",
    "name": "Valparaiso Chile",
    "category": "Wildfires",
    "place": "Valparaíso, Chile",
    "date": "2024-02-02",
    "center": {
      "lat": -33.05,
      "lon": -71.45
    },
    "description": "Fires swept through hillside neighbourhoods near Viña del Mar.",
    "nasaData": {
      "sentinel1": 6,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 20,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-01-12",
        "2024-02-23"
      ]
    }
  },
  {
    "id": "pantanal-2024",
    "name": "Pantanal 2024",
    "category": "Wildfires",
    "place": "Pantanal, Brazil",
    "date": "2024-06-25",
    "center": {
      "lat": -17.5,
      "lon": -57.0
    },
    "description": "Fires burned large parts of the world's biggest tropical wetland.",
    "nasaData": {
      "sentinel1": 2,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 28,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-06-04",
        "2024-07-16"
      ]
    }
  },
  {
    "id": "black-summer-nsw",
    "name": "Black Summer NSW",
    "category": "Wildfires",
    "place": "New South Wales, Australia",
    "date": "2020-01-01",
    "center": {
      "lat": -35.7,
      "lon": 150.0
    },
    "description": "Australia's 2019–20 'Black Summer' fires burned huge areas.",
    "nasaData": {
      "sentinel1": 4,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2019-12-11",
        "2020-01-22"
      ]
    }
  },
  {
    "id": "dixie-fire",
    "name": "Dixie Fire",
    "category": "Wildfires",
    "place": "California, USA",
    "date": "2021-08-05",
    "center": {
      "lat": 40.0,
      "lon": -121.0
    },
    "description": "One of California's largest single wildfires.",
    "nasaData": {
      "sentinel1": 15,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2021-07-15",
        "2021-08-26"
      ]
    }
  },
  {
    "id": "camp-fire",
    "name": "Camp Fire",
    "category": "Wildfires",
    "place": "Paradise, California, USA",
    "date": "2018-11-08",
    "center": {
      "lat": 39.76,
      "lon": -121.62
    },
    "description": "California's deadliest wildfire destroyed the town of Paradise.",
    "nasaData": {
      "sentinel1": 16,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2018-10-18",
        "2018-11-29"
      ]
    }
  },
  {
    "id": "para-arc",
    "name": "Para arc",
    "category": "Deforestation",
    "place": "Pará, Brazil",
    "date": "ongoing",
    "center": {
      "lat": -7.1,
      "lon": -55.4
    },
    "description": "The Amazon's 'arc of deforestation', cleared for cattle and soy.",
    "nasaData": {
      "sentinel1": 61,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 87,
      "nisar": 20,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "cerrado-matopiba",
    "name": "Cerrado MATOPIBA",
    "category": "Deforestation",
    "place": "Cerrado, Brazil",
    "date": "ongoing",
    "center": {
      "lat": -10.0,
      "lon": -46.0
    },
    "description": "Savanna being converted to large farms.",
    "nasaData": {
      "sentinel1": 28,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 208,
      "nisar": 43,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "gran-chaco",
    "name": "Gran Chaco",
    "category": "Deforestation",
    "place": "Gran Chaco, Paraguay",
    "date": "ongoing",
    "center": {
      "lat": -21.5,
      "lon": -60.5
    },
    "description": "Dry forest cleared at one of the fastest rates in the world.",
    "nasaData": {
      "sentinel1": 0,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 93,
      "nisar": 51,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "chiquitano",
    "name": "Chiquitano",
    "category": "Deforestation",
    "place": "Chiquitano forest, Bolivia",
    "date": "ongoing",
    "center": {
      "lat": -16.5,
      "lon": -61.0
    },
    "description": "Dry forest lost to clearing and fires.",
    "nasaData": {
      "sentinel1": 26,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 104,
      "nisar": 34,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "kalimantan",
    "name": "Kalimantan",
    "category": "Deforestation",
    "place": "Kalimantan, Borneo",
    "date": "ongoing",
    "center": {
      "lat": -1.0,
      "lon": 113.5
    },
    "description": "Rainforest replaced by oil palm plantations.",
    "nasaData": {
      "sentinel1": 24,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 90,
      "nisar": 21,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "riau",
    "name": "Riau",
    "category": "Deforestation",
    "place": "Riau, Sumatra",
    "date": "ongoing",
    "center": {
      "lat": 0.5,
      "lon": 101.5
    },
    "description": "Peat forest drained and cleared for plantations.",
    "nasaData": {
      "sentinel1": 53,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 94,
      "nisar": 21,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "nusantara",
    "name": "Nusantara",
    "category": "Deforestation",
    "place": "East Kalimantan, Indonesia",
    "date": "ongoing",
    "center": {
      "lat": -0.97,
      "lon": 116.7
    },
    "description": "Indonesia's new capital city being built in forest land.",
    "nasaData": {
      "sentinel1": 58,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 263,
      "nisar": 21,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "congo-basin",
    "name": "Congo Basin",
    "category": "Deforestation",
    "place": "Congo Basin, DR Congo",
    "date": "ongoing",
    "center": {
      "lat": 0.5,
      "lon": 24.0
    },
    "description": "Small-scale clearing in the world's second-largest rainforest.",
    "nasaData": {
      "sentinel1": 29,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 94,
      "nisar": 27,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "cote-d-ivoire",
    "name": "Cote d'Ivoire",
    "category": "Deforestation",
    "place": "Côte d'Ivoire",
    "date": "ongoing",
    "center": {
      "lat": 6.0,
      "lon": -6.0
    },
    "description": "Forest cleared for cocoa farms.",
    "nasaData": {
      "sentinel1": 28,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 73,
      "nisar": 30,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "prey-lang",
    "name": "Prey Lang",
    "category": "Deforestation",
    "place": "Prey Lang, Cambodia",
    "date": "ongoing",
    "center": {
      "lat": 13.0,
      "lon": 105.4
    },
    "description": "Logging in one of mainland Southeast Asia's last big lowland forests.",
    "nasaData": {
      "sentinel1": 84,
      "readyProduct": "OPERA_L3_DIST-ALERT-HLS_V1",
      "ready": 90,
      "nisar": 21,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "albufera-rice",
    "name": "Albufera rice",
    "category": "Crops & wetlands",
    "place": "Valencia, Spain",
    "date": "ongoing",
    "center": {
      "lat": 39.33,
      "lon": -0.35
    },
    "description": "Rice fields flooded on purpose each winter.",
    "nasaData": {
      "sentinel1": 121,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 414,
      "nisar": 35,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "mekong-rice",
    "name": "Mekong rice",
    "category": "Crops & wetlands",
    "place": "Mekong Delta, Vietnam",
    "date": "ongoing",
    "center": {
      "lat": 10.3,
      "lon": 105.5
    },
    "description": "Two or three rice crops a year.",
    "nasaData": {
      "sentinel1": 54,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 118,
      "nisar": 22,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "indian-punjab",
    "name": "Indian Punjab",
    "category": "Crops & wetlands",
    "place": "Punjab, India",
    "date": "ongoing",
    "center": {
      "lat": 30.9,
      "lon": 75.8
    },
    "description": "Rice–wheat rotation on one of the world's busiest farm plains.",
    "nasaData": {
      "sentinel1": 111,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 151,
      "nisar": 78,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "iowa-corn-belt",
    "name": "Iowa corn belt",
    "category": "Crops & wetlands",
    "place": "Iowa, USA",
    "date": "ongoing",
    "center": {
      "lat": 42.0,
      "lon": -93.5
    },
    "description": "Corn and soy fields growing through the summer.",
    "nasaData": {
      "sentinel1": 48,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 207,
      "nisar": 61,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "central-valley-crops",
    "name": "Central Valley crops",
    "category": "Crops & wetlands",
    "place": "Central Valley, California, USA",
    "date": "ongoing",
    "center": {
      "lat": 36.7,
      "lon": -120.0
    },
    "description": "Orchards and crops, with fields left empty in droughts.",
    "nasaData": {
      "sentinel1": 89,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 410,
      "nisar": 97,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "nile-delta",
    "name": "Nile Delta",
    "category": "Crops & wetlands",
    "place": "Nile Delta, Egypt",
    "date": "ongoing",
    "center": {
      "lat": 30.8,
      "lon": 31.0
    },
    "description": "Year-round farming on a narrow green delta.",
    "nasaData": {
      "sentinel1": 92,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 436,
      "nisar": 33,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "okavango",
    "name": "Okavango",
    "category": "Crops & wetlands",
    "place": "Okavango Delta, Botswana",
    "date": "ongoing",
    "center": {
      "lat": -19.3,
      "lon": 22.9
    },
    "description": "A desert delta that floods every winter.",
    "nasaData": {
      "sentinel1": 0,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 113,
      "nisar": 28,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "pantanal-wetland",
    "name": "Pantanal wetland",
    "category": "Crops & wetlands",
    "place": "Pantanal, Brazil",
    "date": "ongoing",
    "center": {
      "lat": -18.0,
      "lon": -57.3
    },
    "description": "The world's largest tropical wetland, flooding each wet season.",
    "nasaData": {
      "sentinel1": 28,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 134,
      "nisar": 27,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "sudd",
    "name": "Sudd",
    "category": "Crops & wetlands",
    "place": "Sudd, South Sudan",
    "date": "ongoing",
    "center": {
      "lat": 7.5,
      "lon": 30.5
    },
    "description": "One of Africa's largest wetlands.",
    "nasaData": {
      "sentinel1": 27,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 313,
      "nisar": 22,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "everglades",
    "name": "Everglades",
    "category": "Crops & wetlands",
    "place": "Florida, USA",
    "date": "ongoing",
    "center": {
      "lat": 25.8,
      "lon": -80.8
    },
    "description": "A huge subtropical wetland studied with NASA's UAVSAR and NISAR.",
    "nasaData": {
      "sentinel1": 31,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 130,
      "nisar": 78,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "jakobshavn",
    "name": "Jakobshavn",
    "category": "Glaciers",
    "place": "Greenland",
    "date": "ongoing",
    "center": {
      "lat": 69.17,
      "lon": -49.8
    },
    "description": "One of the fastest-flowing glaciers in the world.",
    "nasaData": {
      "sentinel1": 150,
      "readyProduct": null,
      "ready": null,
      "nisar": 45,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "thwaites",
    "name": "Thwaites",
    "category": "Glaciers",
    "place": "West Antarctica",
    "date": "ongoing",
    "center": {
      "lat": -75.5,
      "lon": -106.75
    },
    "description": "The 'Doomsday glacier', whose loss could raise sea level significantly.",
    "nasaData": {
      "sentinel1": 194,
      "readyProduct": null,
      "ready": null,
      "nisar": 110,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "pine-island",
    "name": "Pine Island",
    "category": "Glaciers",
    "place": "West Antarctica",
    "date": "ongoing",
    "center": {
      "lat": -75.17,
      "lon": -100.0
    },
    "description": "A fast-retreating Antarctic glacier.",
    "nasaData": {
      "sentinel1": 205,
      "readyProduct": null,
      "ready": null,
      "nisar": 135,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "zachariae-isstrom",
    "name": "Zachariae Isstrom",
    "category": "Glaciers",
    "place": "North-east Greenland",
    "date": "ongoing",
    "center": {
      "lat": 78.9,
      "lon": -21.7
    },
    "description": "A glacier that has retreated rapidly.",
    "nasaData": {
      "sentinel1": 232,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "petermann",
    "name": "Petermann",
    "category": "Glaciers",
    "place": "North-west Greenland",
    "date": "ongoing",
    "center": {
      "lat": 80.7,
      "lon": -60.5
    },
    "description": "Calved giant ice islands in 2010 and 2012.",
    "nasaData": {
      "sentinel1": 59,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "a68-larsen-c",
    "name": "A68 / Larsen C",
    "category": "Glaciers",
    "place": "Antarctic Peninsula",
    "date": "2017-07-12",
    "center": {
      "lat": -67.5,
      "lon": -61.5
    },
    "description": "One of the largest icebergs ever recorded broke off the Larsen C ice shelf.",
    "nasaData": {
      "sentinel1": 13,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2017-06-21",
        "2017-08-02"
      ]
    }
  },
  {
    "id": "a23a-near-s-georgia",
    "name": "A23a near S. Georgia",
    "category": "Glaciers",
    "place": "South Atlantic",
    "date": "2025-03-04",
    "center": {
      "lat": -53.5,
      "lon": -38.5
    },
    "description": "The world's largest iceberg drifted north and grounded near South Georgia.",
    "nasaData": {
      "sentinel1": 0,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2025-02-11",
        "2025-03-25"
      ]
    }
  },
  {
    "id": "brunt-a81",
    "name": "Brunt A81",
    "category": "Glaciers",
    "place": "Brunt Ice Shelf, Antarctica",
    "date": "2023-01-22",
    "center": {
      "lat": -75.5,
      "lon": -26.0
    },
    "description": "A giant iceberg broke off near a research station.",
    "nasaData": {
      "sentinel1": 17,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2023-01-01",
        "2023-02-12"
      ]
    }
  },
  {
    "id": "malaspina",
    "name": "Malaspina",
    "category": "Glaciers",
    "place": "Alaska, USA",
    "date": "ongoing",
    "center": {
      "lat": 59.9,
      "lon": -140.5
    },
    "description": "One of the world's largest lowland glaciers.",
    "nasaData": {
      "sentinel1": 51,
      "readyProduct": null,
      "ready": null,
      "nisar": 85,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "columbia-glacier",
    "name": "Columbia Glacier",
    "category": "Glaciers",
    "place": "Alaska, USA",
    "date": "ongoing",
    "center": {
      "lat": 61.2,
      "lon": -147.1
    },
    "description": "Retreated dramatically over recent decades.",
    "nasaData": {
      "sentinel1": 25,
      "readyProduct": null,
      "ready": null,
      "nisar": 72,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "arctic-min-2012-beaufort",
    "name": "Arctic min 2012 (Beaufort)",
    "category": "Sea ice",
    "place": "Arctic Ocean",
    "date": "2012-09-16",
    "center": {
      "lat": 75.0,
      "lon": -150.0
    },
    "description": "Record-low summer sea-ice extent.",
    "nasaData": {
      "sentinel1": 0,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2012-08-26",
        "2012-10-07"
      ]
    }
  },
  {
    "id": "antarctic-low-2023-weddell",
    "name": "Antarctic low 2023 (Weddell)",
    "category": "Sea ice",
    "place": "Southern Ocean",
    "date": "2023-02-21",
    "center": {
      "lat": -70.0,
      "lon": -40.0
    },
    "description": "Record-low Antarctic sea ice.",
    "nasaData": {
      "sentinel1": 12,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2023-01-31",
        "2023-03-14"
      ]
    }
  },
  {
    "id": "arctic-max-2025-barents",
    "name": "Arctic max 2025 (Barents)",
    "category": "Sea ice",
    "place": "Arctic Ocean",
    "date": "2025-03-22",
    "center": {
      "lat": 76.0,
      "lon": 40.0
    },
    "description": "Record-low winter peak of Arctic sea ice.",
    "nasaData": {
      "sentinel1": 26,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2025-03-01",
        "2025-04-12"
      ]
    }
  },
  {
    "id": "maud-rise-polynya",
    "name": "Maud Rise polynya",
    "category": "Sea ice",
    "place": "Weddell Sea",
    "date": "2017-09-15",
    "center": {
      "lat": -65.0,
      "lon": 3.0
    },
    "description": "A large hole opened in the winter sea ice.",
    "nasaData": {
      "sentinel1": 17,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2017-08-25",
        "2017-10-06"
      ]
    }
  },
  {
    "id": "northwest-passage",
    "name": "Northwest Passage",
    "category": "Sea ice",
    "place": "Canadian Arctic",
    "date": "2024-09-01",
    "center": {
      "lat": 74.0,
      "lon": -95.0
    },
    "description": "Summer sea lanes opening as ice retreats.",
    "nasaData": {
      "sentinel1": 18,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-08-11",
        "2024-09-22"
      ]
    }
  },
  {
    "id": "hudson-bay",
    "name": "Hudson Bay",
    "category": "Sea ice",
    "place": "Hudson Bay, Canada",
    "date": "2024-07-01",
    "center": {
      "lat": 60.0,
      "lon": -85.0
    },
    "description": "Ice break-up timing matters for polar bears.",
    "nasaData": {
      "sentinel1": 7,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-06-10",
        "2024-07-22"
      ]
    }
  },
  {
    "id": "gulf-of-st-lawrence",
    "name": "Gulf of St Lawrence",
    "category": "Sea ice",
    "place": "Gulf of St. Lawrence, Canada",
    "date": "2024-02-15",
    "center": {
      "lat": 47.5,
      "lon": -62.0
    },
    "description": "Winter ice watched by Canada's RADARSAT satellites.",
    "nasaData": {
      "sentinel1": 12,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-01-25",
        "2024-03-07"
      ]
    }
  },
  {
    "id": "utqiagvik-shorefast",
    "name": "Utqiagvik shorefast",
    "category": "Sea ice",
    "place": "Utqiaġvik, Alaska, USA",
    "date": "2024-05-01",
    "center": {
      "lat": 71.3,
      "lon": -156.8
    },
    "description": "Ice attached to the coast that local hunters travel on.",
    "nasaData": {
      "sentinel1": 6,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-04-10",
        "2024-05-22"
      ]
    }
  },
  {
    "id": "sea-of-okhotsk",
    "name": "Sea of Okhotsk",
    "category": "Sea ice",
    "place": "Sea of Okhotsk",
    "date": "2024-02-20",
    "center": {
      "lat": 52.0,
      "lon": 145.0
    },
    "description": "The southernmost large sea-ice area in the northern hemisphere.",
    "nasaData": {
      "sentinel1": 3,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-01-30",
        "2024-03-12"
      ]
    }
  },
  {
    "id": "bothnian-bay",
    "name": "Bothnian Bay",
    "category": "Sea ice",
    "place": "Bothnian Bay, Finland/Sweden",
    "date": "2024-02-20",
    "center": {
      "lat": 65.0,
      "lon": 24.0
    },
    "description": "Winter ice that ships must break through.",
    "nasaData": {
      "sentinel1": 17,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-01-30",
        "2024-03-12"
      ]
    }
  },
  {
    "id": "deepwater-horizon",
    "name": "Deepwater Horizon",
    "category": "Oil slicks",
    "place": "Gulf of Mexico",
    "date": "2010-05-15",
    "center": {
      "lat": 28.74,
      "lon": -88.37
    },
    "description": "An oil-rig blowout caused one of the largest marine spills.",
    "nasaData": {
      "sentinel1": 0,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2010-04-24",
        "2010-06-05"
      ]
    }
  },
  {
    "id": "wakashio",
    "name": "Wakashio",
    "category": "Oil slicks",
    "place": "Mauritius",
    "date": "2020-08-08",
    "center": {
      "lat": -20.44,
      "lon": 57.75
    },
    "description": "A grounded ship leaked fuel oil into a lagoon.",
    "nasaData": {
      "sentinel1": 14,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2020-07-18",
        "2020-08-29"
      ]
    }
  },
  {
    "id": "x-press-pearl",
    "name": "X-Press Pearl",
    "category": "Oil slicks",
    "place": "Sri Lanka",
    "date": "2021-05-28",
    "center": {
      "lat": 7.0,
      "lon": 79.8
    },
    "description": "A burning container ship spilled chemicals and plastic pellets.",
    "nasaData": {
      "sentinel1": 5,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2021-05-07",
        "2021-06-18"
      ]
    }
  },
  {
    "id": "repsol-peru",
    "name": "Repsol Peru",
    "category": "Oil slicks",
    "place": "Lima, Peru",
    "date": "2022-01-17",
    "center": {
      "lat": -11.95,
      "lon": -77.15
    },
    "description": "Oil spilled at a refinery terminal fouled beaches.",
    "nasaData": {
      "sentinel1": 2,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2021-12-27",
        "2022-02-07"
      ]
    }
  },
  {
    "id": "princess-empress-mindoro",
    "name": "Princess Empress Mindoro",
    "category": "Oil slicks",
    "place": "Mindoro, Philippines",
    "date": "2023-03-01",
    "center": {
      "lat": 13.33,
      "lon": 121.3
    },
    "description": "A sunken tanker leaked industrial fuel oil.",
    "nasaData": {
      "sentinel1": 4,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2023-02-08",
        "2023-03-22"
      ]
    }
  },
  {
    "id": "kerch-strait",
    "name": "Kerch Strait",
    "category": "Oil slicks",
    "place": "Black Sea",
    "date": "2024-12-17",
    "center": {
      "lat": 44.9,
      "lon": 37.3
    },
    "description": "Two old tankers were wrecked in a storm, spilling fuel oil.",
    "nasaData": {
      "sentinel1": 10,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-11-26",
        "2025-01-07"
      ]
    }
  },
  {
    "id": "sanchi",
    "name": "Sanchi",
    "category": "Oil slicks",
    "place": "East China Sea",
    "date": "2018-01-10",
    "center": {
      "lat": 30.85,
      "lon": 124.95
    },
    "description": "A burning tanker sank carrying condensate.",
    "nasaData": {
      "sentinel1": 5,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2017-12-20",
        "2018-01-31"
      ]
    }
  },
  {
    "id": "israel-tar-spill",
    "name": "Israel tar spill",
    "category": "Oil slicks",
    "place": "Israel",
    "date": "2021-02-17",
    "center": {
      "lat": 32.5,
      "lon": 34.85
    },
    "description": "Tar washed ashore along much of the coast.",
    "nasaData": {
      "sentinel1": 22,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2021-01-27",
        "2021-03-10"
      ]
    }
  },
  {
    "id": "taylor-energy",
    "name": "Taylor Energy",
    "category": "Oil slicks",
    "place": "Gulf of Mexico",
    "date": "2018-06-01",
    "center": {
      "lat": 28.94,
      "lon": -88.97
    },
    "description": "A long-running leak from a toppled oil platform.",
    "nasaData": {
      "sentinel1": 4,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2018-05-11",
        "2018-06-22"
      ]
    }
  },
  {
    "id": "jiyeh-lebanon",
    "name": "Jiyeh Lebanon",
    "category": "Oil slicks",
    "place": "Lebanon",
    "date": "2006-07-20",
    "center": {
      "lat": 33.65,
      "lon": 35.4
    },
    "description": "A bombed power plant leaked oil along the coast.",
    "nasaData": {
      "sentinel1": 0,
      "readyProduct": null,
      "ready": null,
      "nisar": 0,
      "older": 0,
      "window": [
        "2006-06-29",
        "2006-08-10"
      ]
    }
  },
  {
    "id": "rodanthe-outer-banks",
    "name": "Rodanthe Outer Banks",
    "category": "Coastal",
    "place": "North Carolina, USA",
    "date": "ongoing",
    "center": {
      "lat": 35.6,
      "lon": -75.47
    },
    "description": "Houses on the eroding shore have collapsed into the sea.",
    "nasaData": {
      "sentinel1": 59,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 22,
      "nisar": 63,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "coastal-louisiana",
    "name": "Coastal Louisiana",
    "category": "Coastal",
    "place": "Louisiana, USA",
    "date": "ongoing",
    "center": {
      "lat": 29.3,
      "lon": -90.0
    },
    "description": "The coast is losing land to the sea at one of the fastest rates.",
    "nasaData": {
      "sentinel1": 29,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 49,
      "nisar": 34,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "sundarbans",
    "name": "Sundarbans",
    "category": "Coastal",
    "place": "Sundarbans, Bangladesh/India",
    "date": "ongoing",
    "center": {
      "lat": 21.9,
      "lon": 89.2
    },
    "description": "A mangrove coast eroding and shifting.",
    "nasaData": {
      "sentinel1": 53,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 42,
      "nisar": 28,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "nile-rosetta",
    "name": "Nile Rosetta",
    "category": "Coastal",
    "place": "Rosetta, Egypt",
    "date": "ongoing",
    "center": {
      "lat": 31.47,
      "lon": 30.36
    },
    "description": "The Nile delta coast erodes as less sediment arrives.",
    "nasaData": {
      "sentinel1": 92,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 55,
      "nisar": 20,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "holderness",
    "name": "Holderness",
    "category": "Coastal",
    "place": "Holderness, England",
    "date": "ongoing",
    "center": {
      "lat": 53.98,
      "lon": -0.2
    },
    "description": "One of Europe's fastest-eroding coastlines.",
    "nasaData": {
      "sentinel1": 121,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 69,
      "nisar": 22,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "drew-point",
    "name": "Drew Point",
    "category": "Coastal",
    "place": "Alaska, USA",
    "date": "ongoing",
    "center": {
      "lat": 70.88,
      "lon": -153.9
    },
    "description": "Permafrost cliffs collapsing into the Arctic Ocean.",
    "nasaData": {
      "sentinel1": 110,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 92,
      "nisar": 195,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "saint-louis-senegal",
    "name": "Saint-Louis Senegal",
    "category": "Coastal",
    "place": "Saint-Louis, Senegal",
    "date": "ongoing",
    "center": {
      "lat": 16.0,
      "lon": -16.5
    },
    "description": "A sand spit breached, exposing the city to the sea.",
    "nasaData": {
      "sentinel1": 32,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 26,
      "nisar": 54,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "fort-myers-beach-ian",
    "name": "Fort Myers Beach (Ian)",
    "category": "Coastal",
    "place": "Florida, USA",
    "date": "2022-09-28",
    "center": {
      "lat": 26.45,
      "lon": -81.95
    },
    "description": "Hurricane Ian's storm surge reshaped the barrier island.",
    "nasaData": {
      "sentinel1": 6,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2022-09-07",
        "2022-10-19"
      ]
    }
  },
  {
    "id": "big-bend-helene",
    "name": "Big Bend (Helene)",
    "category": "Coastal",
    "place": "Florida, USA",
    "date": "2024-09-27",
    "center": {
      "lat": 29.82,
      "lon": -83.59
    },
    "description": "Hurricane Helene's surge flooded the Big Bend coast.",
    "nasaData": {
      "sentinel1": 3,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 12,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-09-06",
        "2024-10-18"
      ]
    }
  },
  {
    "id": "tuvalu-funafuti",
    "name": "Tuvalu Funafuti",
    "category": "Coastal",
    "place": "Tuvalu",
    "date": "ongoing",
    "center": {
      "lat": -8.52,
      "lon": 179.2
    },
    "description": "Low-lying atolls threatened by rising seas.",
    "nasaData": {
      "sentinel1": 0,
      "readyProduct": "OPERA_L3_DSWX-S1_V1",
      "ready": 0,
      "nisar": 6,
      "older": 0,
      "window": [
        "2024-01-01",
        "2024-12-31"
      ]
    }
  },
  {
    "id": "horn-of-africa-2022",
    "name": "Horn of Africa 2022",
    "category": "Soil moisture",
    "place": "Horn of Africa",
    "date": "2022-10-01",
    "center": {
      "lat": 4.0,
      "lon": 40.0
    },
    "description": "Several failed rainy seasons in a row.",
    "nasaData": {
      "sentinel1": 11,
      "readyProduct": "SPL3SMP",
      "ready": 32,
      "nisar": 0,
      "older": 0,
      "window": [
        "2022-09-10",
        "2022-10-22"
      ]
    }
  },
  {
    "id": "amazon-drought-2023",
    "name": "Amazon drought 2023",
    "category": "Soil moisture",
    "place": "Amazon, Brazil",
    "date": "2023-10-15",
    "center": {
      "lat": -3.1,
      "lon": -60.0
    },
    "description": "Record-low rivers, including the Rio Negro.",
    "nasaData": {
      "sentinel1": 4,
      "readyProduct": "SPL3SMP",
      "ready": 43,
      "nisar": 0,
      "older": 0,
      "window": [
        "2023-09-24",
        "2023-11-05"
      ]
    }
  },
  {
    "id": "southern-africa-2024",
    "name": "Southern Africa 2024",
    "category": "Soil moisture",
    "place": "Southern Africa",
    "date": "2024-02-15",
    "center": {
      "lat": -18.0,
      "lon": 30.0
    },
    "description": "An El Niño drought hit crops across the region.",
    "nasaData": {
      "sentinel1": 0,
      "readyProduct": "SPL3SMP",
      "ready": 43,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-01-25",
        "2024-03-07"
      ]
    }
  },
  {
    "id": "europe-2022",
    "name": "Europe 2022",
    "category": "Soil moisture",
    "place": "Europe",
    "date": "2022-08-01",
    "center": {
      "lat": 46.5,
      "lon": 2.5
    },
    "description": "A severe summer drought dried soils and rivers.",
    "nasaData": {
      "sentinel1": 12,
      "readyProduct": "SPL3SMP",
      "ready": 27,
      "nisar": 0,
      "older": 0,
      "window": [
        "2022-07-11",
        "2022-08-22"
      ]
    }
  },
  {
    "id": "us-midwest-2012",
    "name": "US Midwest 2012",
    "category": "Soil moisture",
    "place": "US Midwest",
    "date": "2012-07-15",
    "center": {
      "lat": 40.5,
      "lon": -89.5
    },
    "description": "A 'flash drought' dried soils very quickly.",
    "nasaData": {
      "sentinel1": 0,
      "readyProduct": "SPL3SMP",
      "ready": 0,
      "nisar": 0,
      "older": 0,
      "window": [
        "2012-06-24",
        "2012-08-05"
      ]
    }
  },
  {
    "id": "california-ars-2023",
    "name": "California ARs 2023",
    "category": "Soil moisture",
    "place": "California, USA",
    "date": "2023-01-10",
    "center": {
      "lat": 37.0,
      "lon": -120.5
    },
    "description": "A series of atmospheric rivers soaked the state.",
    "nasaData": {
      "sentinel1": 11,
      "readyProduct": "SPL3SMP",
      "ready": 43,
      "nisar": 0,
      "older": 0,
      "window": [
        "2022-12-20",
        "2023-01-31"
      ]
    }
  },
  {
    "id": "murray-darling-2022",
    "name": "Murray-Darling 2022",
    "category": "Soil moisture",
    "place": "Murray–Darling, Australia",
    "date": "2022-11-15",
    "center": {
      "lat": -34.0,
      "lon": 142.0
    },
    "description": "Major floods across the river basin.",
    "nasaData": {
      "sentinel1": 4,
      "readyProduct": "SPL3SMP",
      "ready": 42,
      "nisar": 0,
      "older": 0,
      "window": [
        "2022-10-25",
        "2022-12-06"
      ]
    }
  },
  {
    "id": "helene-nc-2024",
    "name": "Helene NC 2024",
    "category": "Soil moisture",
    "place": "North Carolina, USA",
    "date": "2024-09-27",
    "center": {
      "lat": 35.6,
      "lon": -82.55
    },
    "description": "Hurricane Helene's rain saturated mountain soils.",
    "nasaData": {
      "sentinel1": 4,
      "readyProduct": "SPL3SMP",
      "ready": 43,
      "nisar": 0,
      "older": 0,
      "window": [
        "2024-09-06",
        "2024-10-18"
      ]
    }
  },
  {
    "id": "india-monsoon-onset-2025",
    "name": "India monsoon onset 2025",
    "category": "Soil moisture",
    "place": "Kerala, India",
    "date": "2025-06-01",
    "center": {
      "lat": 10.0,
      "lon": 76.3
    },
    "description": "The arrival of the monsoon wets soils each June.",
    "nasaData": {
      "sentinel1": 4,
      "readyProduct": "SPL3SMP",
      "ready": 43,
      "nisar": 0,
      "older": 0,
      "window": [
        "2025-05-11",
        "2025-06-22"
      ]
    }
  },
  {
    "id": "sahel-2025",
    "name": "Sahel 2025",
    "category": "Soil moisture",
    "place": "Sahel, Niger",
    "date": "2025-08-01",
    "center": {
      "lat": 13.5,
      "lon": 2.1
    },
    "description": "The short rainy season greens and wets the land.",
    "nasaData": {
      "sentinel1": 3,
      "readyProduct": "SPL3SMP",
      "ready": 43,
      "nisar": 0,
      "older": 0,
      "window": [
        "2025-07-11",
        "2025-08-22"
      ]
    }
  }
];
