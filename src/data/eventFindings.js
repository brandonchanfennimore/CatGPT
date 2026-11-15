// "What Changed?" text for each event that has radar images (shown in the info view).
// What happened and how the ground, water or ice changed. Written from public reports
// and general knowledge: check numbers before presenting. sites.js adds one more line
// with the actual radar dates and what to look for in them.
export const eventFindings = {
  // ---- Floods ----
  "punjab-monsoon-2025":
    "Late-August monsoon rain over Pakistan and India sent the Ravi, Sutlej and Chenab rivers over their banks at the same time. Water spread out of the river channels across flat farmland and into villages around Lahore and further south. On the ground this means fields, roads and low neighbourhoods that were dry became shallow lakes for days to weeks.",
  "maiduguri-dam":
    "After heavy rain, the Alau dam on the Ngadda River failed on 10 September 2024 and released its reservoir towards Maiduguri. Floodwater moved through the city and the farmland around it, covering large parts of the urban area and displacing hundreds of thousands of people. The surface change is a sudden spread of open water across land that was dry days before.",
  "derna-storm-daniel":
    "Storm Daniel dropped extreme rain on north-east Libya on 10–11 September 2023. Two old dams above Derna collapsed and a flood wave rushed down the Wadi Derna valley through the middle of the city, destroying whole districts and washing buildings and mud into the sea. The change is a scoured river channel, lost buildings along it, and muddy water along the coast.",
  "pakistan-2022-sindh":
    "The 2022 monsoon was the wettest on record in Sindh and Balochistan. The Indus overflowed and rain pooled on flat land that drains very slowly, so huge shallow lakes formed and lasted for months, notably around Dadu and Lake Manchar. Around a third of Pakistan was affected at the peak; farmland and villages sat under water well into autumn.",
  "emilia-romagna":
    "Two rounds of heavy rain in May 2023 made more than 20 rivers in Emilia-Romagna burst their banks and set off hundreds of landslides in the hills. The low plain around Faenza, Lugo and Cesena flooded; water stood on fields and in towns for days. The change is wide sheets of standing water across normally dry, flat farmland.",
  "ahr-valley":
    "On 14–15 July 2021, a stalled storm dumped about two months of rain in a day on western Germany and Belgium. In the narrow Ahr valley the river rose several metres in hours, sweeping away bridges, houses and roads. Because the valley is narrow, the flood shows up mostly as damage and debris along the river rather than as a wide lake.",
  "hurricane-harvey":
    "Hurricane Harvey stalled over south-east Texas in late August 2017 and dropped over a metre of rain in places. Rivers, bayous and reservoirs around Houston overflowed and water spread through suburbs, farmland and wetlands. In radar, the flooded open land to the west and south of the city is the clearest change; flooded streets between buildings are much harder to see.",

  // ---- Earthquakes ----
  "kahramanmaras":
    "Two huge earthquakes (magnitude 7.8 and 7.5) struck south-east Türkiye and north-west Syria on 6 February 2023, nine hours apart. The faults broke the surface along more than 300 km, shifting land on each side sideways by several metres. That shift is invisible in a normal photo but shows up in radar interferometry (InSAR) as tight rainbow bands crowded along the fault.",
  "myanmar-sagaing":
    "A magnitude 7.7 earthquake on 28 March 2025 ruptured the Sagaing fault for several hundred kilometres through central Myanmar, near Mandalay. The two sides of the fault slid past each other by several metres. Buildings, bridges and riverbanks were damaged along the line, and the ground on either side moved in opposite directions.",
  "noto-peninsula":
    "A magnitude 7.5 earthquake on New Year's Day 2024 lifted the north coast of Japan's Noto Peninsula by up to about 4 metres. The sea bed near the shore rose out of the water, so the coastline moved seawards by tens to hundreds of metres in places and some harbours ended up on dry land. Landslides and fires also hit the towns.",
  "al-haouz-morocco":
    "A magnitude 6.8 earthquake on 8 September 2023 struck the High Atlas mountains south-west of Marrakesh. Many mud-brick villages in the valleys collapsed and rockfalls blocked roads. The ground itself was pushed up by a few centimetres over a wide area, which radar interferometry can measure even though it can't be seen in photos.",
  "hualien-taiwan":
    "A magnitude 7.4 earthquake on 3 April 2024 hit eastern Taiwan near Hualien, the strongest there in about 25 years. It set off large landslides on the steep coastal mountains and in Taroko Gorge, and the coast was lifted slightly. Fresh landslide scars on the mountains are the most visible change.",
  ridgecrest:
    "Two earthquakes (magnitude 6.4 on 4 July and 7.1 on 6 July 2019) ruptured faults in the Mojave Desert near Ridgecrest, California. The dry, bare desert keeps radar signals very stable, so this became a textbook InSAR example: the ground shifted by up to a few metres, drawing colourful fringes around the two crossing fault lines.",
  kaikoura:
    "The magnitude 7.8 Kaikōura earthquake on 14 November 2016 ruptured more than 20 faults across the north-east of New Zealand's South Island. Parts of the coast rose by several metres, lifting reefs and sea beds out of the water, and tens of thousands of landslides blocked roads and rivers. The new, wider strip of dry coast is one of the clearest changes.",
  "gorkha-nepal":
    "The magnitude 7.8 Gorkha earthquake on 25 April 2015 lifted the Kathmandu valley by about a metre, while the high Himalaya just north dropped slightly. It triggered thousands of landslides and avalanches in the mountains. It was one of the first big earthquakes mapped with Sentinel-1, launched the year before.",
  herat:
    "In October 2023 a sequence of magnitude 6.3 earthquakes struck the plains north-west of Herat in western Afghanistan. Shallow faults moved under farming villages built of mud brick, many of which collapsed. The ground shift was a few tens of centimetres over a small area, best seen in radar interferometry.",
  "kamchatka-m8-8":
    "One of the largest earthquakes ever recorded (about magnitude 8.8) struck off the east coast of Kamchatka on 29–30 July 2025, setting off tsunami warnings across the Pacific. Most of the fault that slipped lies under the sea, so the land change is mostly a broad tilt and shift of the coast near Petropavlovsk-Kamchatsky, plus damage from the shaking and waves.",

  // ---- Volcanoes ----
  "grindavik-sundhnukur":
    "On 10 November 2023, magma pushed a sheet of molten rock (a dyke) about 15 km long under the town of Grindavík in Iceland. The ground cracked open and dropped by up to about a metre, and the town was evacuated. From December onwards, a series of fissure eruptions sent lava flows across the area, some reaching the edge of the town.",
  "cumbre-vieja-la-palma":
    "The Cumbre Vieja eruption on La Palma lasted from 19 September to 13 December 2021. Lava flows buried about 1,000 hectares and around 3,000 buildings and reached the sea, where they built new land (a lava delta) out from the coast. Ash also covered large areas downwind.",
  "kilauea-2018":
    "In May 2018, Kīlauea's lower East Rift Zone split open in the Leilani Estates neighbourhood. Fissures fed lava flows that destroyed hundreds of homes and covered part of the coast, filling Kapoho Bay. At the same time the summit crater collapsed in steps, dropping by hundreds of metres.",
  "mauna-loa-2022":
    "Mauna Loa erupted from 27 November to 10 December 2022, its first eruption since 1984. Fissures on the north-east rift zone sent lava flows several kilometres downhill towards the main cross-island highway, stopping a few kilometres short. The new, rough lava changes how the surface scatters radar.",
  fagradalsfjall:
    "On 19 March 2021, lava broke through at Fagradalsfjall on Iceland's Reykjanes Peninsula, the first eruption there in about 800 years. Weeks of earthquakes and ground swelling came first as magma pushed in underground. Lava then slowly filled the surrounding valleys over six months.",
  nyiragongo:
    "On 22 May 2021, Nyiragongo's flank broke open and lava flowed south towards Goma, stopping at the edge of the city after destroying villages and part of the main road. Earthquakes and ground cracking continued under Goma for days as magma moved underground towards Lake Kivu.",
  semeru:
    "On 4 December 2021, part of Semeru's lava dome collapsed after heavy rain, sending hot clouds of ash and rock (pyroclastic flows) and mudflows down the south-east flank. Villages along the Besuk Kobokan river valley were buried in ash and debris. The valley floor changed from farmland and sand-mining sites to fresh volcanic deposits.",
  "campi-flegrei":
    "Campi Flegrei is a huge collapsed volcano (caldera) under the western suburbs of Naples. Since about 2005 the ground around Pozzuoli has been rising again, by more than a metre in total and by several centimetres a year recently, with frequent small earthquakes. This 'bradyseism' is invisible to the eye but measurable with radar interferometry.",
  "etna-2021":
    "From mid-February 2021, Etna's south-east crater produced a long series of short, powerful eruptions (paroxysms) with lava fountains up to about 1.5 km high and ash columns around 10 km high. Ash fell on towns around the volcano and new lava flows ran down into the Valle del Bove.",

  // ---- Subsidence ----
  "mexico-city":
    "Mexico City is built on the soft clay bed of a drained lake. Pumping groundwater from below makes the clay shrink, so parts of the city sink by up to about 30–50 cm a year, among the fastest anywhere. Over the past century some areas have dropped by more than 10 metres, cracking buildings, pipes and the metro.",
  jakarta:
    "Jakarta is sinking by about 5–10 cm a year on average, faster in parts of the north, as groundwater is pumped from under the city. Up to about 40% of the city now lies below sea level and protected by sea walls, and flooding from the sea and rivers has become more frequent. This is one reason Indonesia is moving its capital to Nusantara.",
  tehran:
    "Heavy groundwater pumping for farms and the city has made the plains south and west of Tehran sink by up to about 25 cm a year. The ground is cracking (earth fissures) and damaging railways, roads and wells. The sinking area shows up clearly in radar interferometry.",
  "central-valley-ca":
    "In California's Central Valley, farms pump groundwater heavily, especially during droughts. As the water is removed, clay layers underground compact and the land sinks, by tens of centimetres a year in the worst drought years. This damages canals and wells and permanently reduces how much water the ground can store.",
  semarang:
    "Semarang, on Java's north coast, is sinking by several centimetres to more than 10 cm a year in places because of groundwater pumping and the weight of new buildings on soft coastal ground. Combined with rising seas, coastal villages near Demak and Semarang are being flooded by the tide more and more often.",
  houston:
    "Pumping groundwater, oil and gas made parts of the Houston–Galveston area sink by up to several metres during the 20th century. Rules on groundwater use slowed it down near the coast, but newer suburbs to the north and west, which still rely on wells, are now sinking by a few centimetres a year.",
  beijing:
    "Groundwater pumping on the North China Plain has made parts of eastern Beijing sink by several centimetres a year. Water piped from the south since 2014 has let the city cut back on pumping, and the sinking has slowed in some areas. The pattern is clear in radar interferometry, though invisible in photos.",
  "mekong-delta":
    "The Mekong Delta is sinking by about 1–3 cm a year in many places, faster than the sea is rising, because of groundwater pumping. At the same time, dams upstream trap the river's mud that used to build the delta up. Coasts are eroding and salt water is reaching further inland into rice fields.",
  venice:
    "Venice and its lagoon sank by more than 20 cm during the 20th century, partly naturally and partly because of groundwater pumping that was stopped in the 1970s. Today it's sinking only a few millimetres a year, but with sea level rising, high tides flood the city more often. The MOSE barriers at the lagoon inlets now close during big tides.",
  joshimath:
    "In early January 2023, cracks spread through houses, roads and hotels in Joshimath, a Himalayan town built on old landslide debris. Hundreds of buildings were declared unsafe and people were moved out. Radar data suggested the slope under the town had been moving slowly for months, and sped up around the end of 2022.",

  // ---- Landslides ----
  wayanad:
    "In the early hours of 30 July 2024, extreme monsoon rain in Wayanad, Kerala, set off several debris flows near Mundakkai and Chooralmala. A fast flow of mud, rock and uprooted trees ran several kilometres down the Iruvazhinji river valley, wiping out villages and bridges. The change is a long, bare scar of mud and boulders where forest, tea estates and houses had been.",
  "enga-png":
    "On 24 May 2024, a mountainside collapsed onto Yambali village in Enga Province, Papua New Guinea, burying houses under deep rock and soil. The scar on the hillside and the debris spread across the valley floor are the main changes, in an area that is often cloudy and hard to photograph.",
  blatten:
    "Over several days in May 2025, rock falling from the Kleines Nesthorn piled onto the Birch glacier above Blatten, Switzerland. On 28 May the overloaded glacier collapsed and a huge avalanche of ice, rock and mud buried most of the village, which had been evacuated, and blocked the Lonza river, forming a lake behind the debris.",
  "portuguese-bend":
    "The Portuguese Bend landslide in Rancho Palos Verdes, near Los Angeles, has crept downhill for decades. After very wet winters in 2023 and 2024 it sped up to as much as about 10 cm a week, breaking roads, pipes and homes over a large area. The slow but steady movement is ideal for radar interferometry.",
  chamoli:
    "On 7 February 2021, a huge block of rock and glacier ice broke off Ronti peak in Chamoli, India. It turned into a fast-moving flood of ice, rock and water that rushed down the Rishiganga and Dhauliganga valleys, destroying two hydropower plants. Fresh debris filled the valley floors along tens of kilometres.",
  gjerdrum:
    "On 30 December 2020, a quick-clay landslide at Ask in Gjerdrum, Norway, suddenly turned solid ground into a flowing slurry. Houses on the slope slid into the hole left behind. Quick clay is a sea clay that can liquefy in seconds; the scar it leaves is a large, bowl-shaped pit.",
  xinmo:
    "Early on 24 June 2017, a mountainside above Xinmo village in Sichuan, China, collapsed. Millions of cubic metres of rock buried the village and dammed part of the river valley. The bright scar on the mountain and the debris field across the valley are the main changes.",
  "mud-creek-big-sur":
    "On 20 May 2017, a huge slide at Mud Creek on California's Big Sur coast buried Highway 1 under more than 20 metres of rock and soil, about 5 million cubic metres in all. The debris pushed the coastline out into the Pacific, creating new land. The road was rebuilt over the top and reopened in 2018.",
  "brienz-brinzauls":
    "The Swiss mountain village of Brienz/Brinzauls sits on a slope that has been sliding for centuries. In 2023 the slope above the village sped up sharply, and residents were evacuated in May. On the night of 15–16 June, a rock mass of roughly 1–2 million cubic metres slid down and stopped just short of the houses.",

  // ---- Wildfires ----
  "la-palisades-eaton":
    "Driven by strong Santa Ana winds, the Palisades and Eaton fires broke out on 7 January 2025 and burned through hillsides and neighbourhoods on both sides of Los Angeles. Together they destroyed more than 16,000 buildings. The burned area shows as a change in the vegetation and as missing buildings in the suburbs.",
  lahaina:
    "On 8 August 2023, wind-driven fires on Maui, fanned by strong winds from a passing hurricane far to the south, destroyed most of the historic town of Lahaina within hours. It was the deadliest US wildfire in over a century. Grass and brush around the town and almost every building in it burned.",
  "quebec-2023":
    "In early June 2023, lightning set off hundreds of fires across Quebec's boreal forest, part of Canada's worst fire season on record. Smoke reached New York and Washington. The fires left huge burned patches in the conifer forest, which radar sees through smoke as a change in forest structure.",
  jasper:
    "In July 2024, a fast-moving wildfire burned into the town of Jasper inside Jasper National Park, Alberta, destroying about a third of the buildings. The surrounding forest, already weakened by beetle damage, burned over a large area of the Athabasca valley.",
  "evros-greece":
    "In August 2023, the fire in Evros, north-east Greece, burned for weeks and became the largest wildfire recorded in the European Union. It burned through Dadia forest, a protected area, and farmland near Alexandroupolis. The burn scar covers over 900 km².",
  "valparaiso-chile":
    "On 2 February 2024, wildfires in heat and strong winds swept into hillside neighbourhoods of Viña del Mar and Quilpué near Valparaíso, Chile, killing more than 130 people. Eucalyptus and pine plantations and whole hillside districts burned in a few hours.",
  "pantanal-2024":
    "In 2024, a severe drought left the Pantanal, the world's largest tropical wetland, drier than usual, and fires started months earlier than normal. Large areas of grassland, forest and dried-out wetland burned in June and July, threatening wildlife such as jaguars.",
  "black-summer-nsw":
    "In Australia's 2019–20 'Black Summer', bushfires burned more than 20 million hectares, mostly in New South Wales and Victoria. Around New Year 2020, fires on the NSW south coast swept from the forests of the Great Dividing Range down to coastal towns. Huge areas of eucalyptus forest lost their leaves and understorey.",
  "dixie-fire":
    "The Dixie Fire burned from July to October 2021 in northern California and became the state's largest single wildfire, at nearly 4,000 km². In early August it destroyed the town of Greenville. Large areas of conifer forest in the northern Sierra Nevada burned.",
  "camp-fire":
    "On 8 November 2018, the Camp Fire, driven by strong winds, destroyed the town of Paradise, California, in a few hours. It killed 85 people and destroyed about 18,000 buildings, the deadliest and most destructive fire in California's history.",

  // ---- Deforestation ----
  "para-arc":
    "Southern Pará is part of the Amazon's 'arc of deforestation', where forest is cleared for cattle pasture and soy along roads such as the BR-163. Clearing usually starts as a fishbone pattern of side roads and grows into large rectangular fields. Cleared land loses the bright radar signal of the forest canopy.",
  "cerrado-matopiba":
    "The MATOPIBA region (Maranhão, Tocantins, Piauí and Bahia) is where Brazil's Cerrado savanna is being converted to soy and other crops fastest. Native savanna and woodland are replaced by huge, regular fields, often hundreds of hectares each.",
  "gran-chaco":
    "Paraguay's Gran Chaco has had some of the fastest forest loss in the world, as dry thorn forest is cleared for cattle ranches. Clearing leaves a distinctive pattern of large rectangular paddocks separated by thin strips of remaining forest.",
  chiquitano:
    "Bolivia's Chiquitano dry forest is being cleared for farmland and cattle, often with fire. Huge fires in 2019 and 2024 burned large areas. Recently cleared land and burned forest both change the radar brightness compared with standing forest.",
  kalimantan:
    "In Kalimantan, on the island of Borneo, rainforest and peat swamp forest have been cleared for oil palm and pulpwood plantations. New plantations appear as regular grids of planting blocks and canals cut into the forest.",
  riau:
    "In Riau province, Sumatra, much of the natural peat swamp forest has been drained and cleared for oil palm and acacia pulpwood plantations. Drained peat is also prone to fires in dry years, which release large amounts of carbon.",
  nusantara:
    "Nusantara, Indonesia's new capital, is being built on land in East Kalimantan that was mostly pulpwood plantation and secondary forest. Since 2022, land clearing, roads and new government buildings have spread across the site.",
  "congo-basin":
    "The Congo Basin holds the world's second-largest rainforest. Most forest loss there comes from small-scale farming and charcoal making around towns and along rivers and roads, which slowly eats into the forest edge.",
  "cote-d-ivoire":
    "Côte d'Ivoire has lost most of its original forest over recent decades, much of it to cocoa farms, including inside protected forests. Cocoa farms under scattered shade trees look different from dense forest in radar.",
  "prey-lang":
    "Prey Lang in Cambodia is one of the last large lowland evergreen forests in mainland South-east Asia. Illegal logging, roads and land concessions have been cutting into it, leaving cleared patches and new tracks.",

  // ---- Crops & wetlands ----
  "albufera-rice":
    "Around the Albufera lagoon south of Valencia, rice fields are flooded on purpose in spring for growing and again in late autumn and winter (the 'perellonà') for wildlife and to manage weeds. So the fields switch between dry soil, flooded water and green rice through the year.",
  "mekong-rice":
    "In Vietnam's Mekong Delta, farmers grow two or three rice crops a year. Each cycle goes from a flooded field (dark in radar), through growing rice (getting brighter), to harvest and bare soil. The canals and river channels stay dark all year.",
  "indian-punjab":
    "Punjab in north-west India grows rice in the summer monsoon and wheat in winter. Fields are flooded for rice transplanting around June–July, and after the rice harvest in October–November straw burning is a well-known source of smoke.",
  "iowa-corn-belt":
    "Iowa's fields are bare soil in winter and early spring, then corn and soybeans grow quickly through the summer and are harvested in autumn. As the crops grow tall and leafy, radar reflections get stronger.",
  "central-valley-crops":
    "California's Central Valley grows orchards (almonds, pistachios), vegetables, rice and other crops. Fields change from bare to green with the seasons, rice fields are flooded in spring, and in droughts some fields are left empty (fallow).",
  "nile-delta":
    "The Nile Delta is a narrow green triangle of intensive farming surrounded by desert. Small irrigated fields are farmed almost all year, and towns and villages keep spreading onto farmland.",
  okavango:
    "The Okavango Delta in Botswana is an inland delta in the Kalahari desert. Rain that falls in Angola reaches the delta months later, so the floodplains fill in the dry winter (around June–August) and shrink again later in the year.",
  "pantanal-wetland":
    "The Pantanal floods every wet season (roughly November–March) and slowly drains through the dry season. The size of the flooded area changes hugely through the year; in drought years like 2024 much less of it floods.",
  sudd:
    "The Sudd in South Sudan is one of Africa's largest wetlands, formed where the White Nile spreads out over a vast flat plain. Its size swells in the rainy season, and after very wet years it can stay much larger for a long time.",
  everglades:
    "The Everglades in southern Florida is a slow-moving sheet of water through sawgrass marshes and mangroves. Water levels rise in the summer wet season and fall in the dry winter; canals and levees control much of the flow.",

  // ---- Glaciers ----
  jakobshavn:
    "Jakobshavn Isbræ (Sermeq Kujalleq) in west Greenland is one of the fastest-flowing glaciers in the world, moving tens of metres a day at its front. It drains a large part of the ice sheet into the Ilulissat Icefjord, which is packed with icebergs.",
  thwaites:
    "Thwaites Glacier in West Antarctica is about the size of Florida. It is thinning and its grounding line, where the ice starts to float, is retreating. Its floating ice shelf has been cracking up, which could let the glacier speed up and add to sea-level rise.",
  "pine-island":
    "Pine Island Glacier, next to Thwaites in West Antarctica, is one of the fastest-changing glaciers in Antarctica. Its ice shelf regularly breaks off big icebergs, and the glacier has sped up as its front has retreated.",
  "zachariae-isstrom":
    "Zachariæ Isstrøm in north-east Greenland lost most of its floating ice shelf in the 2010s and has retreated quickly since. Its front is now breaking up into icebergs and sea ice in the fjord.",
  petermann:
    "Petermann Glacier in north-west Greenland ends in a long floating ice tongue in a fjord. It calved huge ice islands in 2010 (about 250 km²) and 2012 (about 130 km²), making the tongue much shorter.",
  "a68-larsen-c":
    "In July 2017, a crack that had been growing for years across the Larsen C ice shelf finally cut through, releasing iceberg A68, about 5,800 km², one of the largest ever recorded. The edge of the ice shelf moved back by tens of kilometres overnight.",
  malaspina:
    "Malaspina Glacier in Alaska spreads out of the mountains into a huge lobe of ice on the coastal plain. It is thinning, and seawater could eventually reach the low ground beneath its edge.",
  "columbia-glacier":
    "Columbia Glacier in Alaska retreated more than 20 km between the 1980s and the 2010s, one of the fastest glacier retreats recorded. Its front breaks into icebergs in Prince William Sound.",

  // ---- Sea ice ----
  "antarctic-low-2023-weddell":
    "In February 2023, Antarctic sea ice shrank to the smallest extent recorded by satellites, and the following winter it grew back far less than usual. In the Weddell Sea, much of the ice that normally lasts through summer melted.",
  "arctic-max-2025-barents":
    "In March 2025, Arctic sea ice reached the lowest winter peak in the satellite record. Ice in the Barents Sea, where warm Atlantic water flows in, was especially thin and patchy.",
  "maud-rise-polynya":
    "In the winters of 2016 and 2017, a large hole in the sea ice (a polynya) opened over the Maud Rise seamount in the Weddell Sea, far from any coast. It was one of the largest open-water areas seen there since the 1970s.",
  "northwest-passage":
    "In late summer, sea ice in the Canadian Arctic islands now often breaks up enough for ships to pass through parts of the Northwest Passage. How much ice is left changes a lot from year to year.",
  "hudson-bay":
    "Hudson Bay freezes over completely every winter and melts completely every summer. The ice now breaks up earlier in summer than it used to, which matters for polar bears that hunt seals from the ice.",
  "gulf-of-st-lawrence":
    "Sea ice forms in the Gulf of St. Lawrence in winter, but it has become much thinner and shorter-lived. The winter of 2024 had very little ice compared with past decades.",
  "utqiagvik-shorefast":
    "Off Utqiaġvik (Barrow), Alaska, ice fastened to the coast (shorefast ice) forms in winter and is used by local hunters to reach whales and seals. In spring it breaks off and drifts away, increasingly earlier than in the past.",
  "sea-of-okhotsk":
    "The Sea of Okhotsk, between Russia and Japan, is the southernmost large area of sea ice in the northern hemisphere. Ice spreads south in winter, sometimes reaching the coast of Hokkaido, and melts in spring.",
  "bothnian-bay":
    "Bothnian Bay, the northern end of the Baltic Sea between Finland and Sweden, freezes over most winters. Icebreakers keep shipping lanes open, which shows up as lines through the ice.",

  // ---- Oil slicks ----
  wakashio:
    "On 25 July 2020, the bulk carrier MV Wakashio ran aground on a coral reef off south-east Mauritius. From 6 August it leaked about 1,000 tonnes of fuel oil into the lagoon near Mahébourg, coating mangroves and beaches.",
  "x-press-pearl":
    "In May 2021, the container ship X-Press Pearl caught fire and sank off Colombo, Sri Lanka. It spilled chemicals and billions of tiny plastic pellets (nurdles) that washed up along the coast, one of the worst plastic spills recorded.",
  "princess-empress-mindoro":
    "On 28 February 2023, the tanker MT Princess Empress sank off Oriental Mindoro in the Philippines while carrying about 800,000 litres of industrial fuel oil. The oil spread along the coast and into rich marine areas.",
  "kerch-strait":
    "On 15 December 2024, two old Russian tankers were wrecked in a storm in the Kerch Strait between the Black Sea and the Sea of Azov: Volgoneft-212 broke in two and Volgoneft-239 ran aground. Thousands of tonnes of heavy fuel oil (mazut) spilled and washed ashore on beaches around Anapa.",
  "israel-tar-spill":
    "In February 2021, sticky tar washed ashore along most of Israel's Mediterranean coast after an oil spill out at sea during a storm. It was one of Israel's worst coastal pollution events.",
  "taylor-energy":
    "In 2004, Hurricane Ivan toppled the Taylor Energy oil platform in the Gulf of Mexico. Oil leaked from the buried wells for about 15 years, forming long, thin slicks on the sea surface, until a containment system installed in 2019 began capturing most of it. It is the longest-running oil spill in US history.",

  // ---- Coastal ----
  "rodanthe-outer-banks":
    "Around Rodanthe on North Carolina's Outer Banks, the beach is moving back several metres a year. Since 2020 dozens of houses along Cape Hatteras National Seashore, many of them in Rodanthe, have collapsed into the ocean as the shoreline moved under them.",
  "coastal-louisiana":
    "Coastal Louisiana has lost about 5,000 km² of land since the 1930s, as the Mississippi's mud is held back by levees, wetlands sink, canals cut through marshes and the sea rises. Marshes break up into open water.",
  sundarbans:
    "The Sundarbans, the world's largest mangrove forest in the Ganges–Brahmaputra delta, is shifting as rivers change course, cyclones hit and the sea rises. Some islands are eroding away while new mud flats build up elsewhere.",
  "nile-rosetta":
    "At Rosetta (Rashid), where a branch of the Nile meets the sea, the coastline retreated fast after the Aswan High Dam stopped the river's mud reaching the coast. Sea walls now protect the river mouth.",
  holderness:
    "The Holderness coast in eastern England is one of the fastest-eroding coastlines in Europe, losing about 2 metres a year on average. Its soft clay cliffs slump into the sea, and many villages from medieval times have disappeared.",
  "drew-point":
    "At Drew Point on Alaska's Arctic coast, permafrost cliffs are eroding by up to about 20 metres a year, among the fastest rates in the world. Longer ice-free seasons let waves attack the frozen bluffs for more of the year.",
  "saint-louis-senegal":
    "In 2003, a channel was cut through the Langue de Barbarie sand spit to protect Saint-Louis, Senegal, from river floods. The breach has since widened to several kilometres, and the sea now erodes the coast and fishing villages directly.",
  "fort-myers-beach-ian":
    "Hurricane Ian made landfall in south-west Florida on 28 September 2022. A storm surge of several metres flooded Fort Myers Beach and Sanibel, destroying many buildings and moving sand across the barrier islands.",
  "big-bend-helene":
    "Hurricane Helene made landfall in Florida's Big Bend on 26 September 2024 as a category 4 storm. Its storm surge, up to several metres, flooded coastal towns such as Keaton Beach and Steinhatchee and reshaped the low, marshy coast.",

  // ---- Soil moisture ----
  "horn-of-africa-2022":
    "From 2020 to 2023, five rainy seasons in a row failed across Somalia, Ethiopia and Kenya, the worst drought there in about 40 years. Soils and pastures dried out, crops failed and millions of livestock died.",
  "amazon-drought-2023":
    "In 2023 the Amazon had a record drought. The Rio Negro at Manaus fell to its lowest level since records began, rivers turned into sandbanks, and dry soils and forest fuelled fires.",
  "southern-africa-2024":
    "In early 2024, El Niño brought one of the driest growing seasons on record to Zambia, Zimbabwe and Malawi. Rain stopped during the key months for maize, soils dried out and harvests failed across the region.",
  "europe-2022":
    "In summer 2022, a long heatwave and drought dried soils across much of Europe. Rivers such as the Rhine, Po and Loire fell to very low levels and crops were stressed.",
  "california-ars-2023":
    "From late December 2022 to January 2023, a series of atmospheric rivers (long streams of moist air) soaked California. Soils became saturated, rivers flooded and hillsides slid after years of drought.",
  "murray-darling-2022":
    "In late 2022, after three La Niña years in a row, the Murray–Darling Basin in south-east Australia flooded widely. Soils were saturated and floodwater spread across huge areas of flat land for months.",
  "helene-nc-2024":
    "Hurricane Helene's remnants dumped up to about 60 cm of rain on the mountains of western North Carolina in late September 2024. Soils were already wet, so the rain ran off into catastrophic river floods and set off more than a thousand landslides.",
  "india-monsoon-onset-2025":
    "The south-west monsoon reached Kerala on 24 May 2025, about a week earlier than usual. Heavy rain wetted the soils of southern India within days, the start of the main growing season.",
  "sahel-2025":
    "Each year the Sahel gets almost all its rain between July and September. Soils and grasslands green up quickly after the first storms, then dry out again later in the year.",
};
