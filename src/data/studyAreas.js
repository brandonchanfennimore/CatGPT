
export const studyAreas = [
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
  