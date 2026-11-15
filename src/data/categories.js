// Types of surface change, in legend order. Each has:
//  - color: the pin colour on the globe (and in the legend)
//  - sees:  how a radar satellite detects this kind of change (shown in the info view)
//  - product: NASA catalogue name of a ready-made map for it, if one exists
export const CATEGORIES = [
  {
    id: "Floods",
    color: "#3b82f6",
    sees: "Calm floodwater is smooth, so it bounces the radar away and looks dark. Flooded forests and crops look very bright instead (the signal bounces off the water, then the stems).",
    product: "OPERA_L3_DSWX-S1_V1",
  },
  {
    id: "Earthquakes",
    color: "#ef4444",
    sees: "Comparing the exact timing (phase) of two radar passes, called InSAR, reveals ground shifts of a few centimetres as coloured rainbow bands.",
    product: "SENTINEL-1_INTERFEROGRAMS",
  },
  {
    id: "Volcanoes",
    color: "#f97316",
    sees: "InSAR shows the ground swelling as magma rises; new lava and ash change how the surface scatters the radar, even through clouds and smoke.",
    product: "SENTINEL-1_INTERFEROGRAMS",
  },
  {
    id: "Subsidence",
    color: "#a855f7",
    sees: "Many InSAR passes over months add up to show the ground slowly sinking, often by millimetres to centimetres per year from pumping groundwater.",
    product: "OPERA_L3_DISP-S1_V1",
  },
  {
    id: "Landslides",
    color: "#a16207",
    sees: "InSAR can catch a slope creeping before it fails; afterwards, the scar and debris change the radar brightness.",
    product: "SENTINEL-1_INTERFEROGRAMS",
  },
  {
    id: "Wildfires",
    color: "#facc15",
    sees: "Burned vegetation scatters radar differently, so burn scars show up even through smoke. NASA's OPERA DIST maps flag where vegetation was lost.",
    product: "OPERA_L3_DIST-ALERT-HLS_V1",
  },
  {
    id: "Deforestation",
    color: "#16a34a",
    sees: "Long-wavelength radar (like NISAR's L-band) passes into forests and bounces around inside them; cleared land loses that bright signal.",
    product: "OPERA_L3_DIST-ALERT-HLS_V1",
  },
  {
    id: "Crops & wetlands",
    color: "#a3e635",
    sees: "Radar brightness rises and falls as crops grow and are harvested, and as wetlands fill and dry, so it tracks the seasons.",
    product: "OPERA_L3_DSWX-S1_V1",
  },
  {
    id: "Glaciers",
    color: "#67e8f9",
    sees: "Tracking the same crevasses and patterns between two dates (\"offset tracking\") measures how many metres per day the ice flows.",
    product: null,
  },
  {
    id: "Sea ice",
    color: "#f1f5f9",
    sees: "Sea ice and open water scatter radar very differently, and radar works through the long polar night.",
    product: null,
  },
  {
    id: "Oil slicks",
    color: "#f472b6",
    sees: "Oil calms the tiny waves on the sea, so slicks show up as dark streaks on the radar image.",
    product: null,
  },
  {
    id: "Coastal",
    color: "#14b8a6",
    sees: "The line between land and water moves between dates as coasts erode or build up; water maps make the edge easy to follow.",
    product: "OPERA_L3_DSWX-S1_V1",
  },
  {
    id: "Soil moisture",
    color: "#c2a46b",
    sees: "Wet soil reflects radar more strongly than dry soil. NASA's SMAP satellite (and now NISAR) maps soil moisture worldwide.",
    product: "SPL3SMP",
  },
  {
    id: "Reservoirs",
    color: "#6366f1",
    sees: "Calm water bounces the radar away, so a lake is a dark shape. Comparing passes shows the shoreline moving as a reservoir fills or drains, through cloud and at night.",
    product: "OPERA_L3_DSWX-S1_V1",
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
