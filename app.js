/**
 * Météo Alpe Grenoble - Application Logic
 * Données : AROME 1.3km Météo-France via Open-Meteo, ECMWF/Yr.no, ROMMA & BERA
 */

(function () {
  'use strict';

  // ========================================================
  // CONFIGURATION DES MASSIFS, SOMMETS & STATIONS ROMMA
  // ========================================================
  const MASSIFS = {
    belledonne: {
      name: "Belledonne",
      beraUrl: "https://meteofrance.com/meteo-montagne/alpes-du-nord/enneigement/bulletin-avalanche/belledonne/",
      desc: "Massif cristallin réputé pour ses crêtes escarpées et ses départs skis/randos depuis Chamrousse ou Fond de France."
    },
    chartreuse: {
      name: "Chartreuse",
      beraUrl: "https://meteofrance.com/meteo-montagne/alpes-du-nord/enneigement/bulletin-avalanche/chartreuse/",
      desc: "Citadelle calcaire surplombant Grenoble. Attention aux barres rocheuses et aux brouillards subits."
    },
    vercors: {
      name: "Vercors",
      beraUrl: "https://meteofrance.com/meteo-montagne/alpes-du-nord/enneigement/bulletin-avalanche/vercors/",
      desc: "Grands plateaux calcaires et crêtes panoramiques dominant la vallée du Drac."
    },
    oisans: {
      name: "Taillefer / Oisans",
      beraUrl: "https://meteofrance.com/meteo-montagne/alpes-du-nord/enneigement/bulletin-avalanche/oisans/",
      desc: "Haute montagne alpine et plateaux lacustres du Taillefer. Conditions sévères et vents forts fréquents."
    }
  };


  const ROMMA_STATIONS = [
    // Belledonne
    {
      id: 72,
      massif: "belledonne",
      name: "Croix de Chamrousse",
      alt: 2250,
      location: "Crête sommitale Belledonne Sud",
      rommaUrl: "https://www.romma.fr/station_24.php?id=72",
      webcamUrl: "https://chamrousse.roundshot.com/",
      defaultTemp: "2.5",
      defaultGust: "35",
      defaultWind: "20"
    },
    {
      id: 3,
      massif: "belledonne",
      name: "Chamrousse 1800",
      alt: 1800,
      location: "Roche Béranger / Le Recoin",
      rommaUrl: "https://www.romma.fr/station_24.php?id=3",
      webcamUrl: "https://www.chamrousse.com/webcams.html",
      defaultTemp: "5.2",
      defaultGust: "22",
      defaultWind: "12"
    },
    {
      id: 33,
      massif: "belledonne",
      name: "La Ferrière",
      alt: 1000,
      location: "Fond-de-France • Haut Belledonne",
      rommaUrl: "https://www.romma.fr/station_24.php?id=33",
      webcamUrl: "https://www.septlaux.com/webcams/",
      defaultTemp: "9.0",
      defaultGust: "15",
      defaultWind: "8"
    },

    // Chartreuse
    {
      id: 141,
      massif: "chartreuse",
      name: "St-Pierre de Chartreuse",
      alt: 900,
      location: "Cœur du massif • Pied Chamechaude",
      rommaUrl: "https://www.romma.fr/station_24.php?id=141",
      webcamUrl: "https://coeurdechartreuse.fr/webcams/",
      defaultTemp: "9.4",
      defaultGust: "14",
      defaultWind: "6"
    },
    {
      id: 58,
      massif: "chartreuse",
      name: "Le Sappey-en-Chartreuse",
      alt: 925,
      location: "Pied Sud Chamechaude",
      rommaUrl: "https://www.romma.fr/station_24.php?id=58",
      webcamUrl: "https://coeurdechartreuse.fr/webcams/",
      defaultTemp: "9.1",
      defaultGust: "12",
      defaultWind: "5"
    },
    {
      id: 113,
      massif: "chartreuse",
      name: "La Ruchère",
      alt: 1150,
      location: "Chartreuse Nord • Col du Fret",
      rommaUrl: "https://www.romma.fr/station_24.php?id=113",
      webcamUrl: "https://coeurdechartreuse.fr/webcams/",
      defaultTemp: "7.8",
      defaultGust: "18",
      defaultWind: "9"
    },
    {
      id: "cdp-cen",
      massif: "chartreuse",
      name: "Col de Porte (CEN)",
      alt: 1325,
      location: "Centre Études de la Neige • Météo-France",
      rommaUrl: "https://www.romma.fr/carte_interactive.php",
      webcamUrl: "https://meteo-chamrousse.com/col-de-porte/",
      defaultTemp: "6.5",
      defaultGust: "20",
      defaultWind: "10"
    },

    // Vercors
    {
      id: 133,
      massif: "vercors",
      name: "Lans - Les Allières",
      alt: 1449,
      location: "Pied du Pic Saint-Michel",
      rommaUrl: "https://www.romma.fr/station_24.php?id=133",
      webcamUrl: "https://m.lansenvercors.com/webcams.html",
      defaultTemp: "6.0",
      defaultGust: "28",
      defaultWind: "15"
    },
    {
      id: 726,
      massif: "vercors",
      name: "Corrençon-en-Vercors",
      alt: 1272,
      location: "Porte des Hauts Plateaux (Veymont)",
      rommaUrl: "https://www.romma.fr/station_24.php?id=726",
      webcamUrl: "https://www.villarddelans.com/hiver/webcams.html",
      defaultTemp: "7.2",
      defaultGust: "20",
      defaultWind: "10"
    },
    {
      id: 2102,
      massif: "vercors",
      name: "Gresse-en-V. Gerland",
      alt: 1512,
      location: "Balcon Est sous le Grand Veymont",
      rommaUrl: "https://www.romma.fr/station_24.php?id=2102",
      webcamUrl: "https://gresse-en-vercors.fr/webcams/",
      defaultTemp: "5.8",
      defaultGust: "32",
      defaultWind: "18"
    },
    {
      id: 80,
      massif: "vercors",
      name: "Lans-en-Vercors (Village)",
      alt: 990,
      location: "Val de Lans • Vercors Nord",
      rommaUrl: "https://www.romma.fr/station_24.php?id=80",
      webcamUrl: "https://m.lansenvercors.com/webcams.html",
      defaultTemp: "8.5",
      defaultGust: "16",
      defaultWind: "7"
    },

    // Oisans / Taillefer
    {
      id: 100,
      massif: "oisans",
      name: "Villard-Reymond",
      alt: 1688,
      location: "Balcon Taillefer / Romanche",
      rommaUrl: "https://www.romma.fr/station_24.php?id=100",
      webcamUrl: "https://www.bourgdoisans.com/webcams/",
      defaultTemp: "5.5",
      defaultGust: "25",
      defaultWind: "14"
    },
    {
      id: 169,
      massif: "oisans",
      name: "Séchilienne",
      alt: 550,
      location: "Pied Taillefer • Vallée Romanche",
      rommaUrl: "https://www.romma.fr/station_24.php?id=169",
      webcamUrl: "",
      defaultTemp: "11.2",
      defaultGust: "15",
      defaultWind: "8"
    },
    {
      id: "grave-3200",
      massif: "oisans",
      name: "Glacier de la Meije 3200",
      alt: 3200,
      location: "Téléphérique des Ruillans",
      rommaUrl: "https://www.la-grave.com/webcams.php",
      webcamUrl: "https://www.la-grave.com/webcams.php",
      defaultTemp: "-1.5",
      defaultGust: "45",
      defaultWind: "30"
    }
  ];

  // ========================================================
  // WMO WEATHER CODES TRANSLATOR (Norme OMM)
  // ========================================================
  const WMO_CODES = {
    0: { desc: "Ciel clair", icon: "☀️" },
    1: { desc: "Peu nuageux", icon: "🌤️" },
    2: { desc: "Éclaircies", icon: "⛅" },
    3: { desc: "Très nuageux", icon: "☁️" },
    45: { desc: "Brouillard", icon: "🌫️" },
    48: { desc: "Brouillard givrant", icon: "❄️🌫️" },
    51: { desc: "Bruine légère", icon: "🌦️" },
    53: { desc: "Bruine modérée", icon: "🌧️" },
    55: { desc: "Bruine dense", icon: "🌧️" },
    61: { desc: "Pluie faible", icon: "🌦️" },
    63: { desc: "Pluie modérée", icon: "🌧️" },
    65: { desc: "Pluie forte", icon: "🌧️🌧️" },
    66: { desc: "Pluie verglaçante", icon: "🧊🌧️" },
    67: { desc: "Forte pluie verglaçante", icon: "🧊🌧️" },
    71: { desc: "Neige faible", icon: "🌨️" },
    73: { desc: "Neige modérée", icon: "❄️🌨️" },
    75: { desc: "Forte neige", icon: "❄️❄️" },
    77: { desc: "Grains de neige", icon: "🌨️" },
    80: { desc: "Averses faibles", icon: "🌦️" },
    81: { desc: "Averses modérées", icon: "🌧️" },
    82: { desc: "Averses violentes", icon: "⛈️" },
    85: { desc: "Averses de neige", icon: "🌨️" },
    86: { desc: "Fortes averses neige", icon: "❄️🌨️" },
    95: { desc: "Orage", icon: "⚡⛈️" },
    96: { desc: "Orage avec grêle", icon: "⛈️🧊" },
    99: { desc: "Fort orage de montagne", icon: "⚡⛈️⚠️" }
  };

  function decodeWMO(code, isNight = false) {
    if (isNight) {
      if (code === 0) return { desc: "Ciel clair (nuit)", icon: "🌙" };
      if (code === 1) return { desc: "Peu nuageux (nuit)", icon: "🌙☁️" };
      if (code === 2) return { desc: "Éclaircies (nuit)", icon: "☁️" };
      if (code === 3) return { desc: "Très nuageux", icon: "☁️" };
      if (code >= 51 && code <= 55) return { desc: "Bruine nocturne", icon: "🌧️" };
      if (code >= 61 && code <= 65) return { desc: "Pluie", icon: "🌧️" };
      if (code >= 80 && code <= 82) return { desc: "Averses nocturnes", icon: "🌧️" };
    }
    const item = WMO_CODES[code] || { desc: "Variable", icon: isNight ? "☁️" : "⛅" };
    if (isNight && item.icon) {
      if (item.icon.includes("☀️")) return { desc: item.desc, icon: "🌙" };
      if (item.icon.includes("🌤️")) return { desc: item.desc, icon: "🌙☁️" };
      if (item.icon.includes("⛅")) return { desc: item.desc, icon: "☁️" };
      if (item.icon.includes("🌦️")) return { desc: item.desc, icon: "🌧️" };
    }
    return item;
  }

  // Pictogrammes officiels Météo-France (icons/mf/*.svg) à partir du code WMO ou code officiel MF
  // En journée (j), on utilise les pictogrammes officiels avec soleil + nuage + pluie/neige/orage
  // (p12j, p14bisj, p16bisj, p17j, p19j) comme sur meteofrance.com
  const MF_PICTO_BY_WMO = {
    0: "p1", 1: "p1bis", 2: "p2", 3: "p3",
    45: "p6", 48: "p8",
    51: "p12", 53: "p12", 55: "p9", 56: "p11", 57: "p11",
    61: "p12", 63: "p14bis", 65: "p15", 66: "p11", 67: "p11",
    71: "p17", 73: "p19", 75: "p23", 77: "p17",
    80: "p12", 81: "p14bis", 82: "p15",
    85: "p17", 86: "p21",
    95: "p16bis", 96: "p24", 99: "p24"
  };

  function getMfPictoHtml(codeOrName, isNight = false, alt = "") {
    let pictoName = "";
    if (typeof codeOrName === "string" && codeOrName.trim()) {
      let trimmed = codeOrName.trim();
      if (trimmed.startsWith("i")) {
        trimmed = trimmed.replace(/^i0/, "p1").replace(/^i/, "p");
      }
      if (trimmed.endsWith("j") || trimmed.endsWith("n")) {
        pictoName = trimmed;
      } else {
        pictoName = `${trimmed}${isNight ? "n" : "j"}`;
      }
    } else {
      const base = MF_PICTO_BY_WMO[codeOrName] || "p2";
      pictoName = `${base}${isNight ? "n" : "j"}`;
    }
    const safeAlt = String(alt || pictoName).replace(/\x22/g, "&quot;");
    return `<img class="mf-picto" src="icons/mf/${pictoName}.svg" alt="${safeAlt}" draggable="false" onerror="this.onerror=null;this.src='icons/mf/p1j.svg';">`;
  }

  // ========================================================
  // STATE & DOM ELEMENTS
  // ========================================================
  let currentLocation = {
    name: "Grenoble",
    alt: 212,
    lat: 45.1885,
    lon: 5.7245,
    postcode: "38000",
    communePostcode: "38000",
    nearestCity: "Grenoble",
    communeName: "Grenoble",
    admin1: "Isère / Alpes",
    isCommune: true,
    isSummit: false
  };

  try {
    const savedLoc = localStorage.getItem("meteo_current_location");
    if (savedLoc) {
      const parsed = JSON.parse(savedLoc);
      if (parsed && parsed.name && typeof parsed.lat === "number" && typeof parsed.lon === "number") {
        currentLocation = parsed;
      }
    }
  } catch (errLoc) {
    console.warn("Erreur lecture localisation stockée:", errLoc);
  }

  // Purge de tout cache météo lourd en sessionStorage/localStorage pour économiser la mémoire
  try {
    Object.keys(sessionStorage).forEach(k => {
      if (k.startsWith("meteo_full_") || k.startsWith("meteo_cache_")) {
        sessionStorage.removeItem(k);
      }
    });
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("meteo_full_") || k.startsWith("meteo_cache_")) {
        localStorage.removeItem(k);
      }
    });
  } catch (_) {}

  let weatherDataCache = null;
  let aromeDataCache = null;
  let mfDataCache = null;
  let mfOfficialDataCache = null;
  let geocodeTimeout = null;
  let currentMeteocielModel = "gfs"; // Modèle GFS NOAA (conforme capture d'écran Météociel)
  let gfsDataCache = null;
  let yrnoDataCache = null;
  let lastSuccessfulFetchTime = Date.now();
  let lastRommaRefreshTime = 0;
  let lastWebcamRefreshTime = 0;

  // Barre de Recherche Globale & Favoris
  const globalSearchInput = document.getElementById("globalSearchInput");
  const globalSearchClearBtn = document.getElementById("globalSearchClearBtn");
  const globalSearchSpinner = document.getElementById("globalSearchSpinner");
  const globalSearchDropdown = document.getElementById("globalSearchDropdown");
  const geoLocateBtn = document.getElementById("geoLocateBtn");
  const openFavoritesBtn = document.getElementById("openFavoritesBtn");
  const favoritesFlyout = document.getElementById("favoritesFlyout");
  const favFlyoutCount = document.getElementById("favFlyoutCount");
  const favFlyoutList = document.getElementById("favFlyoutList");
  const closeFavoritesFlyoutBtn = document.getElementById("closeFavoritesFlyoutBtn");
  const favoritesBarRow = document.getElementById("favoritesBarRow");
  const favoritesChipsContainer = document.getElementById("favoritesChipsContainer");
  const heroFavBtn = document.getElementById("heroFavBtn");
  const heroFavLabel = document.getElementById("heroFavLabel");

  // Hero Section
  const heroMassifTag = document.getElementById("heroMassifTag");
  const heroSummitName = document.getElementById("heroSummitName");
  const heroDeptTag = document.getElementById("heroDeptTag");
  const heroAltitudeBadge = document.getElementById("heroAltitudeBadge");
  const heroLiveBadge = document.getElementById("heroLiveBadge");
  const currentTemp = document.getElementById("currentTemp");
  const currentWindchill = document.getElementById("currentWindchill");
  const currentWind = document.getElementById("currentWind");
  const currentGusts = document.getElementById("currentGusts");
  const currentIsoZero = document.getElementById("currentIsoZero");
  const currentIsoStatus = document.getElementById("currentIsoStatus");
  const currentPrecip = document.getElementById("currentPrecip");
  const currentSnow = document.getElementById("currentSnow");
  const currentUv = document.getElementById("currentUv");
  const currentUvAdvice = document.getElementById("currentUvAdvice");
  const currentUvIcon = document.getElementById("currentUvIcon");
  const uvMaxTag = document.getElementById("uvMaxTag");
  const uvGaugePin = document.getElementById("uvGaugePin");
  const ttUvCurrent = document.getElementById("ttUvCurrent");
  const ttUvMax = document.getElementById("ttUvMax");
  const ttUvClearSky = document.getElementById("ttUvClearSky");
  const uvInfoBtn = document.getElementById("uvInfoBtn");
  const uvTooltipClose = document.getElementById("uvTooltipClose");
  const metricCardUv = document.getElementById("metricCardUv");

  // Météociel Section (Bloc Enroulable & Modèle GFS officiel)
  const meteocielAccordionHeader = document.getElementById("meteocielAccordionHeader");
  const meteocielAccordionToggle = document.getElementById("meteocielAccordionToggle");
  const meteocielContent = document.getElementById("meteocielContent");
  const meteocielArrow = document.getElementById("meteocielArrow");
  const meteocielExtLink = document.getElementById("meteocielExtLink");
  const ephemDate = document.getElementById("ephemDate");
  const ephemSaint = document.getElementById("ephemSaint");
  const ephemSunrise = document.getElementById("ephemSunrise");
  const ephemSunset = document.getElementById("ephemSunset");
  const ephemDelta = document.getElementById("ephemDelta");
  const ephemDawn = document.getElementById("ephemDawn");
  const ephemDusk = document.getElementById("ephemDusk");
  const ephemMoonIcon = document.getElementById("ephemMoonIcon");
  const ephemMoonText = document.getElementById("ephemMoonText");
  const meteocielPrecipCanvas = document.getElementById("meteocielPrecipCanvas");
  const meteocielTableBody = document.getElementById("meteocielTableBody");

  // Météo France Section
  const aromeLocationTitle = document.getElementById("aromeLocationTitle");
  const meteofranceLink = document.getElementById("meteofranceLink");
  const aromeHourlyScroll = document.getElementById("aromeHourlyScroll");
  const tabAromeHourly = document.getElementById("tabAromeHourly");
  const tabAromeChart = document.getElementById("tabAromeChart");
  const aromeTimelineView = document.getElementById("aromeTimelineView");
  const aromeChartView = document.getElementById("aromeChartView");
  const aromeChartCanvas = document.getElementById("aromeChart");

  // Yr.no Section
  const yrCurrentLocationName = document.getElementById("yrCurrentLocationName");
  const yrCurrentLocationAlt = document.getElementById("yrCurrentLocationAlt");
  const yrnoLiveTag = document.getElementById("yrnoLiveTag");
  const yrLink = document.getElementById("yrLink");
  const yrCanvas = document.getElementById("yrnoCanvas");
  const yrnoGuideline = document.getElementById("yrnoGuideline");
  const yrnoTooltip = document.getElementById("yrnoTooltip");
  const yrnoTtHeader = document.getElementById("yrnoTtHeader");
  const yrnoTtTemp = document.getElementById("yrnoTtTemp");
  const yrnoTtRain = document.getElementById("yrnoTtRain");
  const yrnoTtWind = document.getElementById("yrnoTtWind");
  let yrnoMeteogramMeta = null;
  const yrCanvasLoading = document.getElementById("yrCanvasLoading");
  const dailyForecastGrid = document.getElementById("dailyForecastGrid");

  // ROMMA Section
  const rommaStationsGrid = document.getElementById("rommaStationsGrid");
  const rommaMapIframe = document.getElementById("rommaMapIframe");
  const rommaExtLink = document.getElementById("rommaExtLink");
  const rommaResetBtn = document.getElementById("rommaResetBtn");
  const meteoblueMapIframe = document.getElementById("meteoblueMapIframe");
  const meteoblueExtLink = document.getElementById("meteoblueExtLink");
  const meteoblueResetBtn = document.getElementById("meteoblueResetBtn");
  const rommaCenterLocationBtn = document.getElementById("rommaCenterLocationBtn");
  const rommaCurrentViewLabel = document.getElementById("rommaCurrentViewLabel");
  const DEFAULT_ROMMA_HASH = "11.4/45.1667/5.7653"; // Saint-Martin-d'Hères par défaut
  const ROMMA_DEFAULT_CENTER = { lat: 45.1667, lon: 5.7653 }; // Saint-Martin-d'Hères
  const ROMMA_ZOOM = 11.4; // palier valide (zoomSnap 0.6 de romma.fr)

  // ========================================================
  // GESTION DES FAVORIS (LOCALSTORAGE & DRAG & DROP)
  // ========================================================
  const FAVORITES_STORAGE_KEY = "meteo_favorites_list";
  const DEFAULT_FAVORITES = [
    { name: "Grenoble", alt: 212, lat: 45.1885, lon: 5.7245, postcode: "38000", nearestCity: "Grenoble", admin1: "Isère / Alpes", isSummit: false },
    { name: "Croix de Belledonne", alt: 2926, lat: 45.1633, lon: 5.9867, postcode: "38114", nearestCity: "Allemond", admin1: "Belledonne", isSummit: true, massif: "belledonne" },
    { name: "Chamechaude", alt: 2082, lat: 45.2872, lon: 5.7892, postcode: "38700", nearestCity: "Le Sappey-en-Chartreuse", admin1: "Chartreuse", isSummit: true, massif: "chartreuse" },
    { name: "Grand Veymont", alt: 2341, lat: 44.8711, lon: 5.5256, postcode: "38650", nearestCity: "Gresse-en-Vercors", admin1: "Vercors", isSummit: true, massif: "vercors" },
    { name: "Chamrousse", alt: 1780, lat: 45.1278, lon: 5.8820, postcode: "38410", nearestCity: "Chamrousse", admin1: "Belledonne", isSummit: true, massif: "belledonne" },
    { name: "Chamonix-Mont-Blanc", alt: 1060, lat: 45.9237, lon: 6.8694, postcode: "74400", nearestCity: "Chamonix-Mont-Blanc", admin1: "Haute-Savoie", isSummit: false }
  ];

  let favoritesList = [];
  let draggedFavIndex = null;

  function loadFavorites() {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          favoritesList = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn("Erreur lecture favoris stockés:", e);
    }
    favoritesList = [...DEFAULT_FAVORITES];
    saveFavorites();
  }

  function saveFavorites() {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoritesList));
    } catch (e) {
      console.warn("Erreur sauvegarde favoris:", e);
    }
  }

  // ========================================================
  // HISTORIQUE DE RECHERCHE RÉCENT (5 DERNIERS LIEUX)
  // ========================================================
  const SEARCH_HISTORY_KEY = "meteo_search_history";
  let searchHistoryList = [];

  function loadSearchHistory() {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          searchHistoryList = parsed.slice(0, 5);
          return;
        }
      }
    } catch (e) {
      console.warn("Erreur lecture historique recherche:", e);
    }
    searchHistoryList = [];
  }

  function saveSearchHistory() {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistoryList));
    } catch (e) {
      console.warn("Erreur sauvegarde historique recherche:", e);
    }
  }

  function addToSearchHistory(loc) {
    if (!loc || !loc.name || typeof loc.lat !== "number" || typeof loc.lon !== "number") return;
    const cleanItem = {
      name: loc.name,
      alt: typeof loc.alt === "number" ? Math.round(loc.alt) : 250,
      lat: loc.lat,
      lon: loc.lon,
      admin1: loc.admin1 || "",
      postcode: loc.postcode || "",
      nearestCity: loc.nearestCity || loc.name,
      countryCode: loc.countryCode || "FR",
      isSummit: !!loc.isSummit,
      isLake: !!loc.isLake,
      isHut: !!loc.isHut,
      massif: loc.massif
    };
    searchHistoryList = searchHistoryList.filter(item => !isSameLocation(item, cleanItem));
    searchHistoryList.unshift(cleanItem);
    if (searchHistoryList.length > 5) {
      searchHistoryList = searchHistoryList.slice(0, 5);
    }
    saveSearchHistory();
  }

  function renderSearchHistoryDropdown() {
    loadSearchHistory();
    if (!globalSearchDropdown) return;
    globalSearchDropdown.innerHTML = "";

    if (!Array.isArray(searchHistoryList) || searchHistoryList.length === 0) {
      globalSearchDropdown.style.display = "none";
      return;
    }

    const header = document.createElement("div");
    header.className = "search-history-header";
    header.innerHTML = `<span>Recherches récentes</span>`;
    globalSearchDropdown.appendChild(header);

    searchHistoryList.slice(0, 5).forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "search-dropdown-item global-search-dropdown-item search-history-item";
      div.dataset.index = index;

      let icon = "📍";
      if (item.isSummit) icon = "⛰️";
      else if (item.isLake) icon = "💧";
      else if (item.isHut) icon = "🛖";

      const altMeta = item.alt != null ? `${Math.round(item.alt)} m` : "";
      const subtitle = [altMeta, item.admin1 || item.nearestCity || ""].filter(Boolean).join(" • ");

      div.innerHTML = `
        <div class="search-item-info">
          <div class="search-item-name">${icon} ${item.name}</div>
          <div class="search-item-meta">${subtitle}</div>
        </div>
      `;

      div.addEventListener("click", () => {
        selectLocation(item);
      });

      globalSearchDropdown.appendChild(div);
    });

    globalSearchDropdown.style.display = "block";
  }

  function isSameLocation(locA, locB) {
    if (!locA || !locB) return false;
    const hasCoordsA = typeof locA.lat === "number" && typeof locA.lon === "number";
    const hasCoordsB = typeof locB.lat === "number" && typeof locB.lon === "number";
    if (hasCoordsA && hasCoordsB) {
      const distLat = Math.abs(locA.lat - locB.lat);
      const distLon = Math.abs(locA.lon - locB.lon);
      return distLat < 0.025 && distLon < 0.025;
    }
    const normA = (locA.name || "").toLowerCase().trim();
    const normB = (locB.name || "").toLowerCase().trim();
    return !!(normA && normB && normA === normB);
  }

  function isCurrentFavorite() {
    return favoritesList.some(f => isSameLocation(f, currentLocation));
  }

  function toggleCurrentFavorite() {
    const idx = favoritesList.findIndex(f => isSameLocation(f, currentLocation));
    if (idx >= 0) {
      favoritesList.splice(idx, 1);
    } else {
      favoritesList.unshift({
        name: currentLocation.name,
        alt: currentLocation.alt || 250,
        lat: currentLocation.lat,
        lon: currentLocation.lon,
        admin1: currentLocation.admin1 || "",
        isSummit: !!currentLocation.isSummit,
        isLake: !!currentLocation.isLake,
        isHut: !!currentLocation.isHut,
        postcode: currentLocation.postcode || "",
        nearestCity: currentLocation.nearestCity || "",
        massif: currentLocation.massif
      });
    }
    saveFavorites();
    updateFavoritesUI();
  }

  function removeFavoriteByIndex(index) {
    if (index >= 0 && index < favoritesList.length) {
      favoritesList.splice(index, 1);
      saveFavorites();
      updateFavoritesUI();
    }
  }

  function reorderFavorites(fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= favoritesList.length || toIndex >= favoritesList.length) {
      return;
    }
    const [moved] = favoritesList.splice(fromIndex, 1);
    favoritesList.splice(toIndex, 0, moved);
    saveFavorites();
    updateFavoritesUI();
  }

  function updateFavoritesUI() {
    const isFav = isCurrentFavorite();

    // 1. Bouton Étoile unique à droite de la barre de recherche
    if (openFavoritesBtn) {
      openFavoritesBtn.classList.toggle("active", isFav);
      openFavoritesBtn.title = isFav ? "⭐ Favoris (Ce lieu est dans vos favoris)" : "⭐ Mes favoris";
    }

    // 2. Bouton favori dans le Hero Banner (étoile uniquement)
    if (heroFavBtn) {
      heroFavBtn.classList.toggle("active", isFav);
      heroFavBtn.title = isFav ? "Retirer ce lieu des favoris" : "Ajouter aux favoris";
      const heroStar = heroFavBtn.querySelector(".hero-fav-star");
      if (heroStar) heroStar.textContent = isFav ? "★" : "☆";
    }

    // 3. Décompte dans le panneau déroulant
    const count = favoritesList.length;
    if (favFlyoutCount) favFlyoutCount.textContent = `(${count})`;

    // 4. Pastilles favorites (Chips)
    renderFavoritesChips();

    // 5. Rendu de la liste dans le panneau déroulant (flyout)
    renderFavoritesFlyoutList();
  }

  let favLongPressTimer = null;
  let favIsLongPressActive = false;
  let favLongPressChip = null;
  let favDragStartIndex = null;
  let favStartX = 0;
  let favStartY = 0;
  let favHasMoved = false;

  function renderFavoritesChips() {
    if (!favoritesChipsContainer) return;
    favoritesChipsContainer.innerHTML = "";

    // S'il n'y a aucun favori, on n'affiche rien du tout sous la recherche
    if (favoritesList.length === 0) {
      if (favoritesBarRow) favoritesBarRow.style.display = "none";
      return;
    }

    if (favoritesBarRow) favoritesBarRow.style.display = "block";

    favoritesList.forEach((fav, index) => {
      const chip = document.createElement("div");
      chip.className = "fav-chip";
      chip.setAttribute("draggable", "true");
      chip.dataset.index = index;

      const isActive = isSameLocation(fav, currentLocation);
      if (isActive) chip.classList.add("active");

      // Nom de la ville uniquement selon la demande utilisateur
      chip.innerHTML = `<span class="fav-chip-name">${fav.name}</span>`;

      // Clic pour sélectionner la localisation (si pas en cours de réorganisation)
      chip.addEventListener("click", (e) => {
        if (favHasMoved || favIsLongPressActive) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        selectLocation(fav);
      });

      // Drag & Drop HTML5 (Souris sur PC)
      chip.addEventListener("dragstart", (e) => {
        draggedFavIndex = index;
        chip.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index.toString());
      });

      chip.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (draggedFavIndex !== index) {
          chip.classList.add("drag-over");
        }
      });

      chip.addEventListener("dragleave", () => {
        chip.classList.remove("drag-over");
      });

      chip.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        chip.classList.remove("drag-over");
        const targetIndex = Number(chip.dataset.index);
        if (draggedFavIndex !== null && draggedFavIndex !== targetIndex) {
          reorderFavorites(draggedFavIndex, targetIndex);
        }
      });

      chip.addEventListener("dragend", () => {
        chip.classList.remove("dragging");
        draggedFavIndex = null;
        document.querySelectorAll(".fav-chip").forEach(c => c.classList.remove("drag-over", "dragging"));
      });

      // Support Appui Long (Tactile mobile & Pointeurs)
      chip.addEventListener("pointerdown", (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        favStartX = e.clientX;
        favStartY = e.clientY;
        favHasMoved = false;
        favIsLongPressActive = false;
        favLongPressChip = chip;
        favDragStartIndex = index;

        favLongPressTimer = setTimeout(() => {
          favIsLongPressActive = true;
          chip.classList.add("is-reordering", "dragging");
          if (navigator.vibrate) {
            try { navigator.vibrate(50); } catch (_) {}
          }
        }, 360);
      });

      favoritesChipsContainer.appendChild(chip);
    });
  }

  // Écouteurs globaux pour la réorganisation des favoris par appui long
  window.addEventListener("pointermove", (e) => {
    if (!favLongPressChip) return;
    const dist = Math.hypot(e.clientX - favStartX, e.clientY - favStartY);
    if (dist > 8) {
      favHasMoved = true;
    }
    if (!favIsLongPressActive) {
      if (dist > 10) {
        if (favLongPressTimer) clearTimeout(favLongPressTimer);
        favLongPressTimer = null;
      }
      return;
    }

    // Appui long actif : repérage du survol pour réorganiser
    const targetEl = document.elementFromPoint(e.clientX, e.clientY);
    const targetChip = targetEl ? targetEl.closest(".fav-chip") : null;
    document.querySelectorAll(".fav-chip").forEach(c => {
      if (c === targetChip && c !== favLongPressChip) {
        c.classList.add("drag-over");
      } else {
        c.classList.remove("drag-over");
      }
    });
  }, { passive: true });

  window.addEventListener("pointerup", (e) => {
    if (favLongPressTimer) {
      clearTimeout(favLongPressTimer);
      favLongPressTimer = null;
    }
    if (favIsLongPressActive && favLongPressChip) {
      const targetEl = document.elementFromPoint(e.clientX, e.clientY);
      const targetChip = targetEl ? targetEl.closest(".fav-chip") : null;
      if (targetChip && targetChip.dataset.index != null) {
        const targetIndex = Number(targetChip.dataset.index);
        if (favDragStartIndex !== null && favDragStartIndex !== targetIndex) {
          reorderFavorites(favDragStartIndex, targetIndex);
        }
      }
    }
    document.querySelectorAll(".fav-chip").forEach(c => {
      c.classList.remove("drag-over", "dragging", "is-reordering");
    });
    setTimeout(() => {
      favIsLongPressActive = false;
      favHasMoved = false;
      favLongPressChip = null;
    }, 50);
  });

  window.addEventListener("pointercancel", () => {
    if (favLongPressTimer) clearTimeout(favLongPressTimer);
    document.querySelectorAll(".fav-chip").forEach(c => {
      c.classList.remove("drag-over", "dragging", "is-reordering");
    });
    favIsLongPressActive = false;
    favHasMoved = false;
    favLongPressChip = null;
  });

  function renderFavoritesFlyoutList() {
    if (!favFlyoutList) return;
    favFlyoutList.innerHTML = "";

    if (favoritesList.length === 0) {
      favFlyoutList.innerHTML = '<div class="fav-flyout-empty">Aucun favori enregistré.<br>Utilisez le bouton Favori du bandeau pour ajouter ce lieu.</div>';
      return;
    }

    favoritesList.forEach((fav, index) => {
      const item = document.createElement("div");
      item.className = "fav-flyout-item";
      const isActive = isSameLocation(fav, currentLocation);
      if (isActive) item.classList.add("active");

      const icon = fav.isLake ? "🌊" : (fav.isHut ? "🏡" : (fav.isSummit ? "🏔️" : "📍"));
      const altStr = `${Math.round(fav.alt || 0)} m`;

      item.innerHTML = `
        <div class="fav-flyout-item-left" title="Afficher les prévisions de ${fav.name}">
          <span style="font-size:1.15rem;">${icon}</span>
          <div>
            <div class="fav-flyout-item-name">${fav.name}</div>
            <div class="fav-flyout-item-meta">${fav.admin1 || (fav.isLake ? "Lac / Plan d'eau" : (fav.isHut ? "Refuge / Cabane" : (fav.isSummit ? "Sommet Alpe" : "Vallée")))}</div>
          </div>
        </div>
        <div class="fav-flyout-item-right">
          <span class="fav-flyout-item-alt">${altStr}</span>
          <button class="fav-flyout-del-btn" title="Supprimer ${fav.name} des favoris" aria-label="Supprimer">🗑️</button>
        </div>
      `;

      const left = item.querySelector(".fav-flyout-item-left");
      if (left) {
        left.addEventListener("click", () => {
          selectLocation(fav);
          closeFavoritesFlyout();
        });
      }

      const delBtn = item.querySelector(".fav-flyout-del-btn");
      if (delBtn) {
        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          removeFavoriteByIndex(index);
        });
      }

      favFlyoutList.appendChild(item);
    });
  }

  function toggleFavoritesFlyout() {
    if (!favoritesFlyout) return;
    const isShown = favoritesFlyout.style.display === "block";
    if (isShown) {
      closeFavoritesFlyout();
    } else {
      if (globalSearchDropdown) globalSearchDropdown.style.display = "none";
      renderFavoritesFlyoutList();
      favoritesFlyout.style.display = "block";
    }
  }

  function closeFavoritesFlyout() {
    if (favoritesFlyout) favoritesFlyout.style.display = "none";
  }

  function setupFavoritesListeners() {
    if (heroFavBtn) {
      heroFavBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleCurrentFavorite();
      });
    }

    if (openFavoritesBtn) {
      openFavoritesBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavoritesFlyout();
      });
    }

    if (closeFavoritesFlyoutBtn) {
      closeFavoritesFlyoutBtn.addEventListener("click", () => {
        closeFavoritesFlyout();
      });
    }

    document.addEventListener("click", (e) => {
      if (favoritesFlyout && favoritesFlyout.style.display !== "none") {
        if (!e.target.closest("#favoritesFlyout") && !e.target.closest("#openFavoritesBtn")) {
          closeFavoritesFlyout();
        }
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeFavoritesFlyout();
        if (globalSearchDropdown) globalSearchDropdown.style.display = "none";
      }
    });
  }

  // ========================================================
  // INITIALISATION
  // ========================================================
  function init() {
    // Purger les anciens caches du Service Worker pour forcer la mise à jour
    if ("caches" in window) {
      caches.keys().then(keys => {
        keys.forEach(k => {
          if (k !== 'meteo-grenoble-v8.90') {
            caches.delete(k);
          }
        });
      });
    }

    initTheme();
    loadFavorites();
    loadSearchHistory();
    setupGlobalSearch();
    setupFavoritesListeners();
    setupEventListeners();
    updateFavoritesUI();

    // Watchdog de sécurité (10 secondes max) : garantit que le spinner Yr.no ne reste jamais bloqué
    setTimeout(() => {
      if (yrCanvasLoading && yrCanvasLoading.style.display !== 'none') {
        yrCanvasLoading.style.display = 'none';
      }
    }, 10000);

    // Toujours forcer la récupération fraîche des données en direct (forceFresh = true)
    loadAllLocationData(currentLocation, true);
  }

  // ========================================================
  // THÈME SOMBRE FIXE (OLED / ALPIN)
  // ========================================================
  function initTheme() {
    document.documentElement.setAttribute("data-theme", "dark");
    try {
      localStorage.removeItem("meteo_theme");
    } catch (e) {}
  }

  // ========================================================
  // RECHERCHE GLOBALE VILLES, COMMUNES ET MONTAGNE
  // ========================================================
  function closeSearchBar() {
    const searchWrap = document.getElementById("heroSearchWrap") || document.querySelector(".hero-search-inline-wrap");
    const toggleBtn = document.getElementById("searchToggleTabBtn");
    const inputBox = globalSearchInput ? globalSearchInput.closest(".global-search-input-box") : null;
    if (searchWrap) searchWrap.classList.remove("search-open");
    if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
    if (inputBox) inputBox.classList.remove("search-expanded");
    if (globalSearchDropdown) globalSearchDropdown.style.display = "none";
    closeFavoritesFlyout();
  }

  function openSearchBar() {
    const searchWrap = document.getElementById("heroSearchWrap") || document.querySelector(".hero-search-inline-wrap");
    const toggleBtn = document.getElementById("searchToggleTabBtn");
    const inputBox = globalSearchInput ? globalSearchInput.closest(".global-search-input-box") : null;
    if (searchWrap) searchWrap.classList.add("search-open");
    if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "true");
    if (inputBox) inputBox.classList.add("search-expanded");
    if (globalSearchInput) {
      globalSearchInput.value = "";
      if (globalSearchClearBtn) globalSearchClearBtn.style.display = "none";
      renderSearchHistoryDropdown();
      setTimeout(() => {
        globalSearchInput.focus();
      }, 20);
    }
  }

  function setupGlobalSearch() {
    if (!globalSearchInput) return;

    const searchToggleTabBtn = document.getElementById("searchToggleTabBtn");
    if (searchToggleTabBtn) {
      searchToggleTabBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openSearchBar();
      });
    }

    // Le champ reste vide par défaut avec son placeholder "Rechercher..."
    globalSearchInput.value = "";

    // Agrandissement dynamique de la barre de recherche au clic / focus
    // et affichage automatique de l'historique des 5 dernières recherches
    const inputBox = globalSearchInput.closest(".global-search-input-box");
    globalSearchInput.addEventListener("focus", () => {
      const searchWrap = document.getElementById("heroSearchWrap") || document.querySelector(".hero-search-inline-wrap");
      if (searchWrap) searchWrap.classList.add("search-open");
      if (inputBox) inputBox.classList.add("search-expanded");
      if (!globalSearchInput.value.trim()) {
        renderSearchHistoryDropdown();
      }
      if (globalSearchClearBtn) globalSearchClearBtn.style.display = globalSearchInput.value ? "block" : "none";
    });

    globalSearchInput.addEventListener("blur", () => {
      setTimeout(() => {
        if (inputBox) inputBox.classList.remove("search-expanded");
      }, 250);
    });

    // Navigation au clavier dans les résultats de recherche (flèches + Entrée)
    let keyboardSelectedIndex = -1;

    globalSearchInput.addEventListener("keydown", (e) => {
      if (!globalSearchDropdown || globalSearchDropdown.style.display === "none") return;
      const items = Array.from(globalSearchDropdown.querySelectorAll(".search-dropdown-item"));
      if (items.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        keyboardSelectedIndex = (keyboardSelectedIndex + 1) % items.length;
        items.forEach((it, idx) => {
          it.classList.toggle("selected", idx === keyboardSelectedIndex);
          it.classList.toggle("keyboard-active", idx === keyboardSelectedIndex);
        });
        items[keyboardSelectedIndex]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        keyboardSelectedIndex = (keyboardSelectedIndex - 1 + items.length) % items.length;
        items.forEach((it, idx) => {
          it.classList.toggle("selected", idx === keyboardSelectedIndex);
          it.classList.toggle("keyboard-active", idx === keyboardSelectedIndex);
        });
        items[keyboardSelectedIndex]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (keyboardSelectedIndex >= 0 && items[keyboardSelectedIndex]) {
          items[keyboardSelectedIndex].click();
        } else if (items.length > 0) {
          items[0].click();
        }
      } else if (e.key === "Escape") {
        globalSearchDropdown.style.display = "none";
        globalSearchInput.value = "";
        globalSearchInput.blur();
        closeSearchBar();
      }
    });

    globalSearchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      if (globalSearchClearBtn) {
        globalSearchClearBtn.style.display = query ? "block" : "none";
      }

      if (geocodeTimeout) clearTimeout(geocodeTimeout);

      if (query.length < 2) {
        if (globalSearchSpinner) globalSearchSpinner.style.display = "none";
        renderSearchHistoryDropdown();
        return;
      }

      if (globalSearchSpinner) globalSearchSpinner.style.display = "block";

      geocodeTimeout = setTimeout(async () => {
        try {
          // Recherche multi-sources dynamique et universelle (aucune commune ou sommet codé en dur)

          // 2. Recherche multi-sources intelligente :
          // - Si code postal (ex: 63000, 38000) : API officielle France geo.api.gouv.fr en priorité absolue
          // - Si nom de ville : geo.api.gouv.fr + api-adresse.data.gouv.fr (toutes les communes françaises)
          // - Pour la montagne : Photon Komoot (lacs, refuges, cols, sommets avec biais alpin local)
          // - International / Europe : Open-Meteo Geocoding
          const isDigits = /^\d{2,5}$/.test(query);
          const fetchPromises = [];

          if (isDigits) {
            if (query.length === 5) {
              // Code postal complet français (ex: 38000, 63118, 75001)
              fetchPromises.push(
                fetch(`https://geo.api.gouv.fr/communes?codePostal=${encodeURIComponent(query)}&fields=nom,code,codesPostaux,centre,departement,region,population`)
                  .then(r => r.ok ? r.json() : [])
                  .catch(() => [])
              );
            } else if (query.length === 2) {
              // Numéro de département français (ex: 38, 73, 74, 63)
              fetchPromises.push(
                fetch(`https://geo.api.gouv.fr/communes?codeDepartement=${encodeURIComponent(query)}&boost=population&limit=8&fields=nom,code,codesPostaux,centre,departement,region,population`)
                  .then(r => r.ok ? r.json() : [])
                  .catch(() => [])
              );
            } else {
              // Code postal partiel (3 ou 4 chiffres)
              fetchPromises.push(
                fetch(`https://geo.api.gouv.fr/communes?codePostal=${encodeURIComponent(query)}&fields=nom,code,codesPostaux,centre,departement,region,population`)
                  .then(r => r.ok ? r.json() : [])
                  .catch(() => [])
              );
            }
          } else {
            fetchPromises.push(
              fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&boost=population&limit=6&fields=nom,code,codesPostaux,centre,departement,region,population`)
                .then(r => r.ok ? r.json() : [])
                .catch(() => [])
            );
          }

          // API Adresse officielle (Base Adresse Nationale)
          fetchPromises.push(
            fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&type=municipality&limit=8`)
              .then(r => r.ok ? r.json() : null)
              .catch(() => null)
          );

          // Photon OSM avec centrage alpin (45.2, 5.7) pour lacs, refuges et sommets (uniquement sur recherche textuelle)
          if (!isDigits) {
            fetchPromises.push(
              fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=fr&lat=45.2&lon=5.7`)
                .then(r => r.ok ? r.json() : null)
                .catch(() => null)
            );
          } else {
            fetchPromises.push(Promise.resolve(null));
          }

          // Open-Meteo Geocoding
          fetchPromises.push(
            fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=fr&format=json`)
              .then(r => r.ok ? r.json() : null)
              .catch(() => null)
          );

          const [gouvCommunes, banData, photonData, omData] = await Promise.all(fetchPromises);
          let remoteResults = [];

          // Traitement des communes officielles de France (geo.api.gouv.fr)
          if (Array.isArray(gouvCommunes)) {
            gouvCommunes.forEach(c => {
              const coords = c.centre && c.centre.coordinates ? c.centre.coordinates : null;
              if (!coords) return;
              const pc = (c.codesPostaux && c.codesPostaux.length > 0)
                ? (c.codesPostaux.includes(query) ? query : c.codesPostaux[0])
                : query;
              const dept = c.departement ? `${c.departement.code} - ${c.departement.nom}` : "";
              const reg = c.region ? c.region.nom : "";
              const adminParts = [dept, reg].filter(Boolean);

              remoteResults.push({
                id: `gouv_${c.code}`,
                name: c.nom,
                elevation: null,
                latitude: coords[1],
                longitude: coords[0],
                admin1: adminParts.join(", ") || "France",
                postcode: pc,
                nearestCity: c.nom,
                countryCode: "FR",
                population: c.population || 0,
                isCommune: true,
                isLake: false,
                isHut: false,
                isSummit: false
              });
            });
          }

          // Traitement BAN (api-adresse.data.gouv.fr)
          if (banData && Array.isArray(banData.features)) {
            banData.features.forEach(feat => {
              const p = feat.properties || {};
              const coords = feat.geometry && feat.geometry.coordinates ? feat.geometry.coordinates : null;
              if (!coords || !p.city) return;

              remoteResults.push({
                id: `ban_${p.id || Math.random()}`,
                name: p.city,
                elevation: null,
                latitude: coords[1],
                longitude: coords[0],
                admin1: p.context || "France",
                postcode: p.postcode || "",
                nearestCity: p.city,
                countryCode: "FR",
                population: p.population || 0,
                isCommune: true,
                isLake: false,
                isHut: false,
                isSummit: false
              });
            });
          }

          // Traitement des résultats Photon (OSM : Lacs, étangs, refuges, sommets, villages)
          if (photonData && Array.isArray(photonData.features)) {
            try {
              const rejectedOsmKeys = new Set([
                "amenity", "railway", "highway", "aerialway", "information", "building",
                "landuse", "boundary", "leisure", "shop", "office", "commercial",
                "craft", "historic", "emergency", "aeroway", "man_made", "power", "telecom"
              ]);
              const urbanBlacklist = [
                "mairie", "hôtel de ville", "hotel de ville", "gare", "arrêt", "arret",
                "tram", "bus", "parking", "poste", "école", "ecole", "collège", "lycée",
                "centre commercial", "salle des fêtes", "gendarmerie", "police", "cimetière",
                "stade", "gymnase"
              ];

              photonData.features.forEach(feat => {
                const p = feat.properties || {};
                const coords = feat.geometry && feat.geometry.coordinates ? feat.geometry.coordinates : null;
                if (!p.name || !coords || coords.length < 2) return;

                const osmKey = (p.osm_key || "").toLowerCase();
                const osmVal = (p.osm_value || "").toLowerCase();

                // Rejeter d'office toutes les infrastructures urbaines, commerces, transports ou services
                if (rejectedOsmKeys.has(osmKey)) return;

                let cleanName = p.name.trim();
                const nameLower = cleanName.toLowerCase();

                // Rejeter les bâtiments administratifs, arrêts de transport et structures urbaines
                if (urbanBlacklist.some(u => nameLower.includes(u))) return;

                const nearestCity = p.city || p.town || p.village || p.municipality || p.hamlet || "";
                if (/^\d+$/.test(cleanName) && nearestCity) {
                  cleanName = nearestCity;
                }

                // Sommets, crêtes, cols
                const isSummit = (osmKey === "natural" && (osmVal === "peak" || osmVal === "volcano" || osmVal === "ridge" || osmVal === "cliff")) ||
                                 osmVal === "peak" || osmKey === "mountain_pass" || osmVal === "saddle" ||
                                 nameLower.startsWith("pic ") || nameLower.startsWith("mont ") ||
                                 nameLower.startsWith("croix de ") || nameLower.startsWith("dent de ") ||
                                 nameLower.startsWith("aiguille ") || nameLower.startsWith("cime ") ||
                                 nameLower.startsWith("dôme ") || nameLower.startsWith("dome ") ||
                                 nameLower.startsWith("roche ") || nameLower.startsWith("pointe ") ||
                                 nameLower.startsWith("col de ") || nameLower.startsWith("col du ") ||
                                 nameLower.startsWith("sommet ");

                // Lacs, étangs, plans d'eau naturels
                const isLake = osmVal === "lake" || osmVal === "water" || (osmKey === "water" && osmVal === "lake") ||
                               osmVal === "reservoir" || osmVal === "pond" ||
                               nameLower.startsWith("lac ") || nameLower.startsWith("lac-") || nameLower.startsWith("lacs ") ||
                               nameLower.includes(" lac ") || nameLower.startsWith("étang") || nameLower.startsWith("etang") ||
                               nameLower.includes(" étang") || nameLower.includes(" etang") ||
                               nameLower.startsWith("plan d'eau");

                // Vrais refuges de montagne et cabanes alpines (shelter urbain/abribus explicitement exclu)
                const isHut = (osmKey === "tourism" && (osmVal === "alpine_hut" || osmVal === "wilderness_hut")) ||
                              nameLower.startsWith("refuge ") || nameLower.startsWith("refuge-") ||
                              nameLower.startsWith("cabane ") || nameLower.startsWith("gîte ") || nameLower.startsWith("gite ") ||
                              nameLower.includes(" refuge ") || nameLower.includes(" cabane ");

                // Villages, hameaux, localités
                const isPlace = osmKey === "place" && (
                  osmVal === "village" || osmVal === "town" || osmVal === "city" ||
                  osmVal === "hamlet" || osmVal === "locality" || osmVal === "isolated_dwelling"
                );

                if (!isLake && !isHut && !isSummit && !isPlace) return;

                if (isLake || isHut) {
                  cleanName = cleanName.replace(new RegExp("\\s*[-–(]?\\s*parking\\s*\\)?$", "i"), "").trim();
                }

                const adminParts = [
                  nearestCity && nearestCity !== cleanName ? nearestCity : "",
                  p.county || p.state,
                  p.country || "France"
                ].filter(Boolean);

                const ele = (p.extra && p.extra.ele) ? parseFloat(p.extra.ele) : (p.ele ? parseFloat(p.ele) : null);

                remoteResults.push({
                  id: `osm_${p.osm_type || 'N'}_${p.osm_id || Math.random()}`,
                  name: cleanName,
                  elevation: (ele && !isNaN(ele)) ? Math.round(ele) : null,
                  latitude: coords[1],
                  longitude: coords[0],
                  admin1: adminParts.slice(0, 2).join(", ") || "France",
                  postcode: p.postcode || "",
                  nearestCity: nearestCity,
                  countryCode: p.countrycode ? p.countrycode.toUpperCase() : "FR",
                  isLake: isLake,
                  isHut: isHut,
                  isSummit: isSummit
                });
              });
            } catch (ePhoton) {
              console.warn("Erreur parsing Photon:", ePhoton);
            }
          }

          // Traitement des résultats Open-Meteo (communes, villes)
          if (omData && Array.isArray(omData.results)) {
            try {
              const hasFrenchCommunes = remoteResults.some(r => r.isCommune && r.countryCode === "FR");
              omData.results.forEach(r => {
                const cc = r.country_code ? r.country_code.toUpperCase() : "FR";
                // Si recherche par code postal et commune française trouvée, ne pas afficher les ZIP codes étrangers (ex: Saint-Louis US)
                if (isDigits && hasFrenchCommunes && cc !== "FR") return;

                remoteResults.push({
                  id: `om_${r.id}`,
                  name: r.name,
                  elevation: r.elevation != null ? Math.round(r.elevation) : null,
                  latitude: r.latitude,
                  longitude: r.longitude,
                  admin1: [r.admin1, r.country].filter(Boolean).join(", "),
                  postcode: (r.postcodes && r.postcodes.length > 0) ? r.postcodes[0] : "",
                  nearestCity: r.name,
                  countryCode: cc,
                  population: r.population || 0,
                  isLake: false,
                  isHut: false,
                  isSummit: r.feature_code === "PK" || r.feature_code === "MTS" || (r.elevation != null && r.elevation > 1200)
                });
              });
            } catch (eOm) {
              console.warn("Erreur parsing Open-Meteo Geocoding:", eOm);
            }
          }

          // Fallback de secours Nominatim si aucun résultat trouvé
          if (remoteResults.length === 0) {
            try {
              const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
              const nomRes = await fetch(nomUrl, { headers: { "Accept-Language": "fr" } });
              if (nomRes.ok) {
                const nomData = await nomRes.json();
                (nomData || []).forEach(item => {
                  const addr = item.address || {};
                  const city = addr.village || addr.town || addr.municipality || addr.city || "";
                  const pc = addr.postcode ? String(addr.postcode).replace(/[^0-9]/g, "").slice(0, 5) : "";
                  const nameLower = (item.name || "").toLowerCase();
                  const isLake = item.class === "water" || item.type === "lake" || nameLower.includes("lac") || nameLower.includes("etang");
                  const isHut = item.type === "alpine_hut" || item.type === "wilderness_hut" || nameLower.includes("refuge") || nameLower.includes("cabane");
                  const isSummit = item.type === "peak" || nameLower.includes("pic") || nameLower.includes("sommet");

                  let cleanName = (item.name || item.display_name.split(",")[0]).trim();
                  if (isLake || isHut) {
                    cleanName = cleanName.replace(new RegExp("\\s*[-–(]?\\s*parking\\s*\\)?$", "i"), "").trim();
                  }

                  remoteResults.push({
                    id: `nom_${item.place_id}`,
                    name: cleanName,
                    elevation: null,
                    latitude: parseFloat(item.lat),
                    longitude: parseFloat(item.lon),
                    admin1: [city || addr.county || addr.state, addr.country].filter(Boolean).join(", "),
                    postcode: pc,
                    nearestCity: city,
                    countryCode: addr.country_code ? addr.country_code.toUpperCase() : "FR",
                    isLake: isLake,
                    isHut: isHut,
                    isSummit: isSummit
                  });
                });
              }
            } catch (eNom) {
              console.warn("Erreur fallback Nominatim:", eNom);
            }
          }

          // Affichage direct des résultats dynamiques
          renderGlobalSearchResults(remoteResults, query);
        } catch (errGeo) {
          console.error("Erreur recherche globale géocodage:", errGeo);
          if (globalSearchDropdown) {
            globalSearchDropdown.innerHTML = '<div class="search-dropdown-empty">Erreur de connexion au service de recherche</div>';
            globalSearchDropdown.style.display = "block";
          }
        } finally {
          if (globalSearchSpinner) globalSearchSpinner.style.display = "none";
        }
      }, 250);
    });

    if (globalSearchClearBtn) {
      globalSearchClearBtn.addEventListener("click", () => {
        globalSearchInput.value = "";
        globalSearchClearBtn.style.display = "none";
        renderSearchHistoryDropdown();
        globalSearchInput.focus();
      });
    }

    // Bouton de Géolocalisation (position GPS actuelle)
    if (geoLocateBtn) {
      geoLocateBtn.addEventListener("click", () => {
        handleGeolocation();
      });
    }
  }

  // ========================================================
  // GÉOLOCALISATION GPS HAUTE PRÉCISION (100% UNIVERSELLE DYNAMIQUE)
  // Aucun lieu codé en dur : fonctionne partout en France et dans le monde
  // ========================================================
  function handleGeolocation() {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    if (globalSearchSpinner) globalSearchSpinner.style.display = "block";
    if (geoLocateBtn) geoLocateBtn.classList.add("loading");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          let alt = pos.coords.altitude ? Math.round(pos.coords.altitude) : null;

          // Si altitude manquante du GPS (fréquent sur navigateur web), interroger Open-Meteo Elevation
          if (alt === null || alt === 0) {
            try {
              const elevRes = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}`);
              if (elevRes.ok) {
                const elevData = await elevRes.json();
                if (elevData && Array.isArray(elevData.elevation) && elevData.elevation[0] != null) {
                  alt = Math.round(elevData.elevation[0]);
                }
              }
            } catch (eElev) {
              console.warn("Erreur fetch altitude Open-Meteo:", eElev);
            }
          }
          if (alt === null) alt = 250;

          let detectedName = "";
          let adminRegion = "";
          let detectedPostcode = "";
          let isCommune = false;
          let isSummit = alt >= 1200;

          const inFrance = (lat >= 41.0 && lat <= 51.5 && lon >= -5.5 && lon <= 10.0);
          if (inFrance) {
            try {
              const gouvRes = await fetch(`https://geo.api.gouv.fr/communes?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&fields=nom,codesPostaux,departement,region`);
              if (gouvRes.ok) {
                const list = await gouvRes.json();
                if (Array.isArray(list) && list.length > 0) {
                  const com = list[0];
                  detectedName = com.nom;
                  detectedPostcode = (Array.isArray(com.codesPostaux) && com.codesPostaux.length > 0) ? String(com.codesPostaux[0]).slice(0, 5) : "";
                  const dept = com.departement ? `${com.departement.code} - ${com.departement.nom}` : "";
                  const reg = com.region ? com.region.nom : "";
                  adminRegion = [dept, reg].filter(Boolean).join(", ") || "France";
                  isCommune = true;
                }
              }
            } catch (eGouv) {
              console.warn("Erreur gouv reverse:", eGouv);
            }
          }

          if (!detectedName) {
            // Reverse geocoding via OpenStreetMap Nominatim ou BigDataCloud
            try {
              const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=14`;
              const nomRes = await fetch(nomUrl, { headers: { "Accept-Language": "fr" } });
              if (nomRes.ok) {
                const nomData = await nomRes.json();
                const addr = nomData.address || {};
                detectedName = addr.natural || addr.mountain_pass || addr.peak || addr.village || addr.hamlet || addr.town || addr.municipality || addr.city || "";
                adminRegion = addr.county || addr.state || "";
                detectedPostcode = addr.postcode ? String(addr.postcode).replace(/[^0-9]/g, "").slice(0, 5) : "";
              }
            } catch (eNom) {
              console.warn("Erreur Nominatim reverse:", eNom);
            }

            if (!detectedName) {
              try {
                const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`;
                const bdcRes = await fetch(bdcUrl);
                if (bdcRes.ok) {
                  const bdcData = await bdcRes.json();
                  detectedName = bdcData.locality || bdcData.city || bdcData.principalSubdivision || "";
                  if (!adminRegion) adminRegion = bdcData.principalSubdivision || "";
                }
              } catch (eBdc) {
                console.warn("Erreur BigDataCloud:", eBdc);
              }
            }
          }

          if (!detectedName) {
            detectedName = isSummit ? `Sommet (${alt}m)` : `Position GPS (${alt}m)`;
          }
          if (!adminRegion) {
            adminRegion = inFrance ? "France" : "Position GPS";
          }

          selectLocation({
            name: detectedName,
            alt: alt,
            lat: lat,
            lon: lon,
            admin1: adminRegion,
            postcode: detectedPostcode,
            communeName: isCommune ? detectedName : "",
            communePostcode: isCommune ? detectedPostcode : "",
            nearestCity: detectedName,
            countryCode: inFrance ? "FR" : "OTHER",
            isCommune: isCommune,
            isSummit: isSummit
          });
        } catch (errGeo) {
          console.error("Erreur géolocalisation:", errGeo);
          alert("Erreur lors de la récupération de la position.");
        } finally {
          if (globalSearchSpinner) globalSearchSpinner.style.display = "none";
          if (geoLocateBtn) geoLocateBtn.classList.remove("loading");
        }
      },
      (geoErr) => {
        if (globalSearchSpinner) globalSearchSpinner.style.display = "none";
        if (geoLocateBtn) geoLocateBtn.classList.remove("loading");
        let msg = "Impossible d'accéder à votre position GPS.";
        if (geoErr.code === 1) msg = "Accès à la position refusé. Veuillez l'autoriser dans votre navigateur.";
        else if (geoErr.code === 2) msg = "Signal GPS ou réseau indisponible.";
        else if (geoErr.code === 3) msg = "Délai d'attente dépassé.";
        alert(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000
      }
    );
  }

  function selectLocation(loc) {
    currentLocation = loc;
    addToSearchHistory(loc);
    try {
      localStorage.setItem("meteo_current_location", JSON.stringify(loc));
    } catch (e) {}

    if (globalSearchInput) globalSearchInput.value = "";
    if (globalSearchDropdown) globalSearchDropdown.style.display = "none";
    if (globalSearchClearBtn) globalSearchClearBtn.style.display = "none";
    closeSearchBar();

    // Synchroniser l'état actif des favoris (étoiles, chips, flyout)
    updateFavoritesUI();

    loadAllLocationData(currentLocation);
  }

  function renderGlobalSearchResults(results, query) {
    if (!globalSearchDropdown) return;
    globalSearchDropdown.innerHTML = "";

    if (results.length === 0) {
      globalSearchDropdown.innerHTML = `<div class="search-dropdown-empty">Aucun lieu trouvé pour "${query}"</div>`;
      globalSearchDropdown.style.display = "block";
      return;
    }

    // ========================================================
    // DÉDUPLICATION GÉOGRAPHIQUE & ADMINISTRATIVE INTELLIGENTE
    // - Fusionne les doublons d'un même lieu
    // - Conserve les lieux homonymes situés à des endroits distincts (ex: Saint-Pierre-d'Entremont 38 vs 73)
    // ========================================================
    function normalizePlaceName(s) {
      if (!s) return "";
      let str = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      str = str.replace(new RegExp("[-_'\",.]", "g"), " ");
      str = str.replace(/\b(st|ste|mt)\b/g, m => ({ st: "saint", ste: "sainte", mt: "mont" }[m] || m));
      str = str.replace(/\b\d{4,5}\b/g, " ");
      str = str.replace(/\b(mo|ca|ny|tx)\b/g, " ");
      str = str.replace(/\s+/g, " ").trim();
      return str;
    }

    function extractDeptCode(item) {
      const pc = String(item.postcode || "").trim();
      if (pc.length === 5 && /^\d+$/.test(pc)) {
        const d = pc.slice(0, 2);
        if (d === "20") return parseInt(pc, 10) < 20200 ? "2A" : "2B";
        return d;
      }
      const admin = item.admin1 || "";
      const m = admin.match(/\b(\d{2,3})\b/);
      if (m) return m[1];
      return "";
    }

    function getGeoDistanceKm(lat1, lon1, lat2, lon2) {
      if (typeof lat1 !== "number" || typeof lat2 !== "number") return 999999;
      const dLat = (lat2 - lat1) * 111.2;
      const avgLat = ((lat1 + lat2) / 2) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * 111.2 * Math.cos(avgLat);
      return Math.sqrt(dLat * dLat + dLon * dLon);
    }

    function isSamePlace(a, b) {
      const isAlpineA = !!(a.isSummit || a.isLake || a.isHut);
      const isAlpineB = !!(b.isSummit || b.isLake || b.isHut);
      if (isAlpineA !== isAlpineB) return false;

      const dist = getGeoDistanceKm(a.latitude, a.longitude, b.latitude, b.longitude);
      if (dist < 0.25) return true; // Moins de 250m = même lieu

      const na = normalizePlaceName(a.name);
      const nb = normalizePlaceName(b.name);
      const namesMatch = (na === nb) || (na.length >= 4 && nb.includes(na)) || (nb.length >= 4 && na.includes(nb));
      if (!namesMatch) return false;

      // Sommets, cols, lacs, refuges : même nom et distance <= 2.5 km
      if (isAlpineA && isAlpineB) {
        return dist <= 2.5;
      }

      // Villes / Communes :
      const deptA = extractDeptCode(a);
      const deptB = extractDeptCode(b);
      if (deptA && deptB) {
        // Départements distincts = communes différentes préservées !
        if (deptA !== deptB) return false;
        return dist <= 18; // Même département et < 18km = même commune
      }

      // Pays distincts
      const ccA = (a.countryCode || "FR").toUpperCase();
      const ccB = (b.countryCode || "FR").toUpperCase();
      if (ccA !== ccB) return false;

      return dist <= 18;
    }

    function mergePlace(target, inc) {
      if (target.elevation == null && inc.elevation != null) {
        target.elevation = inc.elevation;
      }
      if (!target.postcode && inc.postcode) {
        target.postcode = inc.postcode;
      }
      if (inc.admin1 && (!target.admin1 || target.admin1 === "France")) {
        target.admin1 = inc.admin1;
      }
      if ((inc.population || 0) > (target.population || 0)) {
        target.population = inc.population;
      }
      const tDigits = /^\d+$/.test(target.name);
      const iDigits = /^\d+$/.test(inc.name);
      if (tDigits && !iDigits) {
        target.name = inc.name;
      } else if (!tDigits && !iDigits) {
        if (inc.name.length < target.name.length && !inc.name.includes("(")) {
          target.name = inc.name;
        }
      }
      if (inc.isCommune) target.isCommune = true;
      if (inc.isSummit) target.isSummit = true;
      if (inc.isLake) target.isLake = true;
      if (inc.isHut) target.isHut = true;
      if (inc.massif && !target.massif) target.massif = inc.massif;
    }

    let deduped = [];
    results.forEach(item => {
      const existing = deduped.find(ex => isSamePlace(ex, item));
      if (existing) {
        mergePlace(existing, item);
      } else {
        deduped.push({ ...item });
      }
    });

    // Système de scoring intelligent et priorisation géographique
    const qTrim = query.trim();
    const qLower = qTrim.toLowerCase();
    const qNorm = qLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isDigitsQuery = /^\d+$/.test(qNorm);

    const wantsLake = qLower.includes("lac") || qLower.includes("etang") || qLower.includes("étang") || qLower.includes("plan d'eau");
    const wantsHut = qLower.includes("refuge") || qLower.includes("cabane") || qLower.includes("gite") || qLower.includes("gîte");
    const wantsSummit = qLower.includes("pic") || qLower.includes("mont") || qLower.includes("sommet") || qLower.includes("croix") || qLower.includes("dent") || qLower.includes("aiguille") || qLower.includes("col");

    function scoreItem(item) {
      let score = 0;
      const nameNorm = (item.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const pc = String(item.postcode || "").trim();
      const cc = (item.countryCode || "FR").toUpperCase();
      const isFrance = cc === "FR" || (item.admin1 || "").toLowerCase().includes("france");

      // 1. PAYS : Priorité absolue à la France (FR), puis pays alpins voisins (CH, IT)
      if (isFrance) {
        score += 20000;
      } else if (cc === "CH" || cc === "IT") {
        score += 5000;
      } else {
        // Forte pénalité pour les pays exotiques hors de France (Mexique, Thaïlande, etc.)
        score -= 25000;
      }

      // 2. RECHERCHE PAR CODE POSTAL (ex: 38000, 63118 -> ville correspondante en 1er)
      if (isDigitsQuery) {
        if (pc === qNorm) {
          score += 35000; // Correspondance exacte du code postal
        } else if (pc.startsWith(qNorm)) {
          score += 16000;
        }
        if (item.isCommune) {
          score += 15000; // Commune officielle issue du découpage administratif
        }
      }

      // 3. RECHERCHE PAR NOM
      if (nameNorm === qNorm) {
        score += 12000;
      } else if (nameNorm.startsWith(qNorm)) {
        score += 6000;
      } else if (nameNorm.includes(qNorm)) {
        score += 2000;
      }

      // 4. POPULATION : Pour les communes (Clermont-Ferrand 146k avant un petit lieu-dit)
      if (item.population && item.population > 0) {
        score += Math.min(3500, Math.round(Math.log10(item.population) * 700));
      }

      // 5. INTENTION (lacs, refuges, sommets)
      if (wantsLake && item.isLake) score += 8000;
      if (wantsHut && item.isHut) score += 8000;
      if (wantsSummit && item.isSummit) score += 8000;
      if (item.massif) score += 4000;

      // 6. Si le nom brut est uniquement des chiffres (code postal brut non résolu), le rétrograder
      if (/^\d+$/.test(nameNorm)) {
        score -= 8000;
      }

      return score;
    }

    // Si la recherche renvoie des communes ou lieux en France, écarter les résultats étrangers hors sujet (ex: Turquie, USA)
    const hasFrenchMatches = deduped.some(r => (r.countryCode || "FR") === "FR");
    if (hasFrenchMatches) {
      deduped = deduped.filter(r => (r.countryCode || "FR") === "FR");
    }

    deduped.sort((a, b) => scoreItem(b) - scoreItem(a));

    deduped.slice(0, 8).forEach(item => {
      const div = document.createElement("div");
      div.className = "global-search-dropdown-item search-dropdown-item";

      let icon = "📍";
      let typeLabel = "Lieu";
      if (item.isLake) {
        icon = "🌊";
        typeLabel = "Lac";
      } else if (item.isHut) {
        icon = "🏡";
        typeLabel = "Refuge";
      } else if (item.isSummit) {
        icon = "🏔️";
        typeLabel = "Sommet";
      } else if (item.isCommune) {
        icon = "🏙️";
        typeLabel = "Ville";
      }

      let cleanDisplayName = item.name;
      if (/^\d+$/.test(cleanDisplayName) && item.nearestCity) {
        cleanDisplayName = item.nearestCity;
      }
      const displayName = (item.postcode && !cleanDisplayName.includes(item.postcode) && !/^\d+$/.test(cleanDisplayName))
        ? `${cleanDisplayName} (${item.postcode})`
        : cleanDisplayName;

      const altMeta = item.elevation != null ? `${Math.round(item.elevation)} m` : typeLabel;
      const subtitle = [altMeta, item.admin1 || "France"].filter(Boolean).join(" • ");

      div.innerHTML = `
        <div class="search-item-info">
          <div class="search-item-name">${icon} ${displayName}</div>
          <div class="search-item-meta">${subtitle}</div>
        </div>
      `;

      div.addEventListener("click", async () => {
        if (globalSearchInput) globalSearchInput.value = "";
        if (globalSearchDropdown) globalSearchDropdown.style.display = "none";
        if (globalSearchSpinner) globalSearchSpinner.style.display = "block";

        let finalAlt = item.elevation;
        if (finalAlt == null || isNaN(finalAlt)) {
          // Résolution de l'altitude réelle via Open-Meteo Elevation API
          try {
            const elevUrl = `https://api.open-meteo.com/v1/elevation?latitude=${item.latitude.toFixed(4)}&longitude=${item.longitude.toFixed(4)}`;
            const elevRes = await fetch(elevUrl);
            if (elevRes.ok) {
              const elevData = await elevRes.json();
              if (elevData && Array.isArray(elevData.elevation) && elevData.elevation.length > 0) {
                finalAlt = Math.round(elevData.elevation[0]);
              }
            }
          } catch (eAlt) {
            console.warn("Erreur récupération altitude:", eAlt);
          }
        }
        if (finalAlt == null || isNaN(finalAlt)) {
          finalAlt = item.isSummit ? 1500 : (item.isLake ? 1000 : 250);
        }

        if (globalSearchSpinner) globalSearchSpinner.style.display = "none";

        selectLocation({
          id: item.id,
          name: cleanDisplayName,
          alt: finalAlt,
          lat: item.latitude,
          lon: item.longitude,
          admin1: item.admin1,
          postcode: item.postcode || "",
          nearestCity: item.nearestCity || (item.isCommune ? cleanDisplayName : ""),
          communeName: item.communeName || (item.isCommune ? cleanDisplayName : ""),
          communePostcode: item.communePostcode || (item.isCommune ? (item.postcode || "") : ""),
          countryCode: item.countryCode || "FR",
          isCommune: !!item.isCommune,
          isLake: !!item.isLake,
          isHut: !!item.isHut,
          isSummit: !!item.isSummit,
          massif: item.massif
        });
      });

      globalSearchDropdown.appendChild(div);
    });

    globalSearchDropdown.style.display = "block";
  }

  // ========================================================
  // CONVERTISSEURS & MODÈLES MÉTÉOCIEL ET YR.NO
  // ========================================================
  function mapYrSymbolToWmo(sym) {
    if (!sym) return 3;
    if (sym.includes("clearsky")) return 0;
    if (sym.includes("fair")) return 1;
    if (sym.includes("partlycloudy")) return 2;
    if (sym.includes("fog")) return 45;
    if (sym.includes("heavyrain")) return 65;
    if (sym.includes("rainshowers") || sym.includes("rain")) return 61;
    if (sym.includes("heavysnow")) return 75;
    if (sym.includes("snow")) return 71;
    if (sym.includes("thunder")) return 95;
    if (sym.includes("cloudy")) return 3;
    return 3;
  }

  function convertMetNoToHourly(metData) {
    if (!metData || !metData.properties || !metData.properties.timeseries) return null;
    const ts = metData.properties.timeseries;
    const hourly = {
      time: [],
      temperature_2m: [],
      precipitation: [],
      wind_speed_10m: [],
      wind_direction_10m: [],
      weather_code: [],
      symbol_code: []
    };

    ts.forEach(item => {
      const d = new Date(item.time);
      const localTime = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      hourly.time.push(localTime);

      const inst = item.data.instant ? item.data.instant.details : {};
      hourly.temperature_2m.push(inst.air_temperature != null ? inst.air_temperature : 10);
      
      const windMs = inst.wind_speed != null ? inst.wind_speed : 2;
      hourly.wind_speed_10m.push(windMs * 3.6);
      hourly.wind_direction_10m.push(inst.wind_from_direction != null ? inst.wind_from_direction : 180);

      const next1 = item.data.next_1_hours;
      const next6 = item.data.next_6_hours;
      let prec = 0;
      let sym = "cloudy";

      if (next1) {
        prec = (next1.details && next1.details.precipitation_amount != null) ? next1.details.precipitation_amount : 0;
        if (next1.summary && next1.summary.symbol_code) sym = next1.summary.symbol_code;
      } else if (next6) {
        prec = (next6.details && next6.details.precipitation_amount != null) ? next6.details.precipitation_amount / 6 : 0;
        if (next6.summary && next6.summary.symbol_code) sym = next6.summary.symbol_code;
      }

      hourly.precipitation.push(prec);
      hourly.symbol_code.push(sym);
      hourly.weather_code.push(mapYrSymbolToWmo(sym));
    });

    return { hourly: hourly };
  }

  // ========================================================
  // REDIRECTIONS DYNAMIQUES & UNIVERSELLES (CORSE, BRETAGNE, OCCITANIE, ALPES...)
  // Aucun sommet ou ville en dur : fonctionne partout en France et dans le monde
  // ========================================================

  function getCleanLocationSlug(name) {
    if (!name) return "";
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function resolveNearestCommune(location) {
    if (!location || typeof location.lat !== "number" || typeof location.lon !== "number") return;

    // Si déjà validé avec communeName et communePostcode
    if (location.communeName && location.communePostcode && String(location.communePostcode).length === 5) {
      updateMeteofranceHeaders(location);
      updateMeteocielHeaders(location);
      return;
    }

    // Si c'est explicitement une commune officielle française
    if (location.isCommune && location.name && location.postcode && String(location.postcode).length === 5) {
      location.communeName = location.name;
      location.communePostcode = String(location.postcode).replace(/[^0-9]/g, "").slice(0, 5);
      location.nearestCity = location.name;
      updateMeteofranceHeaders(location);
      updateMeteocielHeaders(location);
      return;
    }

    // Vérifier si les coordonnées se trouvent en France
    const isFrance = !location.countryCode || location.countryCode === "FR" || (
      location.lat >= 41.0 && location.lat <= 51.5 && location.lon >= -5.5 && location.lon <= 10.0
    );
    if (!isFrance) {
      updateMeteofranceHeaders(location);
      updateMeteocielHeaders(location);
      return;
    }

    try {
      const res = await fetch(`https://geo.api.gouv.fr/communes?lat=${location.lat.toFixed(4)}&lon=${location.lon.toFixed(4)}&fields=nom,codesPostaux`);
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const com = list[0];
          const cName = com.nom || "";
          const cPc = (Array.isArray(com.codesPostaux) && com.codesPostaux.length > 0) ? String(com.codesPostaux[0]).slice(0, 5) : "";
          if (cName && cPc) {
            location.communeName = cName;
            location.communePostcode = cPc;
            location.nearestCity = cName;
            if (!location.postcode) location.postcode = cPc;

            if (currentLocation && currentLocation.lat === location.lat && currentLocation.lon === location.lon) {
              try {
                localStorage.setItem("meteo_current_location", JSON.stringify(currentLocation));
              } catch (_) {}
            }

            updateMeteofranceHeaders(location);
            updateMeteocielHeaders(location);
            updateMeteoblueHeaders(location);
            updateWebcamsSection(location);
          }
        }
      }
    } catch (e) {
      console.warn("Erreur résolution commune officielle:", e);
    }
  }

  function updateMeteocielHeaders(location) {
    if (!meteocielExtLink || !location) return;
    // Si code postal officiel de commune connu, Météociel redirige directement sur la fiche météo de la ville
    const query = location.communePostcode || (location.isCommune ? location.postcode : null) || location.communeName || location.nearestCity || location.postcode || location.name;
    meteocielExtLink.href = `https://www.meteociel.fr/prevville.php?action=getville&ville=${encodeURIComponent(query)}`;
    const displayCity = location.communeName || (location.nearestCity && location.nearestCity !== location.name ? location.nearestCity : "");
    const targetName = (displayCity && displayCity !== location.name) ? `${location.name} (${displayCity})` : location.name;
    meteocielExtLink.title = `Consulter directement les prévisions de ${targetName} sur Météociel`;
  }

  function updateYrnoHeaders(location) {
    if (!yrLink || !location) return;
    // Redirection directe vers l'onglet graph officiel de Yr.no avec les coordonnées exactes (ex. https://www.yr.no/en/forecast/graph/45.203,%205.760)
    if (typeof location.lat === "number" && typeof location.lon === "number") {
      yrLink.href = `https://www.yr.no/en/forecast/graph/${location.lat.toFixed(3)},%20${location.lon.toFixed(3)}`;
    } else {
      yrLink.href = `https://www.yr.no/en/search?q=${encodeURIComponent(location.name)}`;
    }
    yrLink.title = `Consulter le graphique météogramme de ${location.name} sur Yr.no`;
  }

  function updateMeteofranceHeaders(location) {
    if (!meteofranceLink || !location) return;

    const isFrance = !location.countryCode || location.countryCode === "FR" || (
      typeof location.lat === "number" && typeof location.lon === "number" &&
      location.lat >= 41.0 && location.lat <= 51.5 && location.lon >= -5.5 && location.lon <= 10.0
    );

    if (!isFrance) {
      meteofranceLink.href = "https://meteofrance.com/";
      meteofranceLink.title = `Consulter les prévisions internationales sur Météo-France`;
      return;
    }

    // Commune officielle résolue (Météo-France n'accepte QUE les communes officielles françaises au format slug/codePostal)
    let commune = location.communeName;
    let pc = location.communePostcode;

    if (!commune && location.isCommune) {
      commune = location.name;
      pc = location.postcode;
    }

    if (!commune && location.nearestCity && location.nearestCity !== location.name) {
      commune = location.nearestCity;
      pc = location.postcode;
    }

    const cleanPc = pc ? String(pc).replace(/[^0-9]/g, "").slice(0, 5) : "";

    if (commune && cleanPc.length === 5) {
      const slug = getCleanLocationSlug(commune);
      meteofranceLink.href = `https://meteofrance.com/previsions-meteo-france/${slug}/${cleanPc}`;
      const targetName = (commune && commune !== location.name) ? `${location.name} (${commune})` : location.name;
      meteofranceLink.title = `Consulter directement les prévisions de ${targetName} sur Météo-France`;
    } else {
      // Résolution dynamique en cours : ne pas mettre de ville arbitraire en dur
      meteofranceLink.href = "https://meteofrance.com/";
      meteofranceLink.title = `Consulter les prévisions de ${location.name} sur Météo-France`;
    }

    // Si la commune officielle n'est pas encore identifiée, lancer immédiatement sa résolution
    if ((!location.communeName || !location.communePostcode) && typeof location.lat === "number" && typeof location.lon === "number") {
      resolveNearestCommune(location);
    }
  }


  window.getMeteofranceTargetUrlAsync = async function() {
    if (!currentLocation) return "https://meteofrance.com/";
    const isFrance = !currentLocation.countryCode || currentLocation.countryCode === "FR" || (
      typeof currentLocation.lat === "number" && typeof currentLocation.lon === "number" &&
      currentLocation.lat >= 41.0 && currentLocation.lat <= 51.5 && currentLocation.lon >= -5.5 && currentLocation.lon <= 10.0
    );
    if (!isFrance) return "https://meteofrance.com/";

    let commune = currentLocation.communeName;
    let pc = currentLocation.communePostcode;
    if (!commune && currentLocation.isCommune) {
      commune = currentLocation.name;
      pc = currentLocation.postcode;
    }
    let cleanPc = pc ? String(pc).replace(/[^0-9]/g, "").slice(0, 5) : "";
    if (commune && cleanPc.length === 5) {
      return `https://meteofrance.com/previsions-meteo-france/${getCleanLocationSlug(commune)}/${cleanPc}`;
    }

    await resolveNearestCommune(currentLocation);
    commune = currentLocation.communeName;
    pc = currentLocation.communePostcode;
    cleanPc = pc ? String(pc).replace(/[^0-9]/g, "").slice(0, 5) : "";
    if (commune && cleanPc.length === 5) {
      return `https://meteofrance.com/previsions-meteo-france/${getCleanLocationSlug(commune)}/${cleanPc}`;
    }

    if (meteofranceLink && meteofranceLink.href && meteofranceLink.href.includes("previsions-meteo-france")) {
      return meteofranceLink.href;
    }
    return "https://meteofrance.com/";
  };

  function updateMeteoblueHeaders(location) {
    const extLink = document.getElementById("meteoblueExtLink");
    if (!extLink || !location) return;
    const lat = typeof location.lat === "number" ? location.lat : 45.1885;
    const lon = typeof location.lon === "number" ? location.lon : 5.7245;
    const targetName = location.nearestCity ? `${location.name} (${location.nearestCity})` : location.name;
    extLink.title = `Consulter directement les prévisions de ${targetName} sur Météoblue`;

    const cleanName = (location.name || "grenoble")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

    // Redirection directe vers la fiche météo locale (format demandé https://www.meteoblue.com/en/weather/today/grenoble_france_3014728)
    extLink.href = `https://www.meteoblue.com/en/weather/today/${cleanName}_france`;

    // Résolution dynamique du slug officiel et identifiant Météoblue via API query3
    const queryCoord = `${lat.toFixed(4)} ${lon.toFixed(4)}`;
    fetch(`https://www.meteoblue.com/fr/server/search/query3?query=${encodeURIComponent(queryCoord)}&apikey=1iw4Jq5NZK60Ig7O`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data.results) && data.results.length > 0 && data.results[0].url) {
          extLink.href = `https://www.meteoblue.com/en/weather/today/${data.results[0].url}`;
        }
      })
      .catch(() => {});
  }

  function renderSelectedMeteocielModel() {
    updateMeteocielHeaders(currentLocation);
    const dataToUse = gfsDataCache || weatherDataCache;
    if (dataToUse) {

      renderMeteocielTable(dataToUse);
    }
  }

  // ========================================================
  // CHARGEMENT UNIFIÉ DE TOUTES LES PRÉVISIONS DU SITE (EN DIRECT)
  // ========================================================
  async function loadAllLocationData(location, forceFresh = true) {
    if (!location) return;

    // 1. Mise à jour immédiate des titres et badges d'en-tête (sans lat/lon et sans doublon d'altitude)
    if (globalSearchInput) globalSearchInput.value = "";
    if (heroSummitName) heroSummitName.textContent = location.name;
    if (heroAltitudeBadge) heroAltitudeBadge.textContent = `${Math.round(location.alt).toLocaleString('fr-FR')} m`;
    if (heroDeptTag) {
      let deptText = "";
      if (location.admin1) {
        let text = location.admin1;
        if (text.includes(" - ")) {
          text = text.split(" - ")[1].split(",")[0].trim();
        } else if (text.includes(",")) {
          text = text.split(",")[0].trim();
        } else if (text.includes("/")) {
          text = text.split("/")[0].trim();
        }
        deptText = text;
      }
      heroDeptTag.textContent = deptText;
      heroDeptTag.style.display = deptText ? "inline" : "none";
    }
    if (heroMassifTag) {
      if (location.isLake) {
        heroMassifTag.textContent = location.admin1 ? `🌊 Lac • ${location.admin1}` : "🌊 Lac / Plan d'eau";
      } else if (location.isHut) {
        heroMassifTag.textContent = location.admin1 ? `🏡 Refuge • ${location.admin1}` : "🏡 Refuge / Cabane";
      } else {
        heroMassifTag.textContent = location.admin1 || (location.isSummit ? "Sommet Alpe" : "Vallée / Ville");
      }
    }

    updateMeteocielHeaders(location);
    updateYrnoHeaders(location);
    updateMeteofranceHeaders(location);
    updateMeteoblueHeaders(location);
    updateWebcamsSection(location);

    // Résolution automatique immédiate de la commune officielle la plus proche
    if ((!location.communeName || !location.communePostcode) && typeof location.lat === "number" && typeof location.lon === "number") {
      resolveNearestCommune(location);
    }

    if (yrCurrentLocationName) yrCurrentLocationName.textContent = location.name;
    if (yrCurrentLocationAlt) yrCurrentLocationAlt.textContent = `${Math.round(location.alt).toLocaleString('fr-FR')} m`;

    // Pas d'utilisation de cache : requêtes toujours réelles et fraîches en direct
    // (si pas de réseau, aucune donnée obsolète masquant l'erreur)

    if (!forceFresh) {
      if (aromeHourlyScroll) aromeHourlyScroll.innerHTML = '<div class="loading-state">Calcul des prévisions en direct...</div>';
      if (yrCanvasLoading) yrCanvasLoading.style.display = "flex";
      if (dailyForecastGrid) dailyForecastGrid.innerHTML = '<div class="loading-state">Calcul des tendances 7 jours ECMWF...</div>';
    }

    // 2. Requêtes API TOUJOURS EN DIRECT (cache: 'no-store')
    try {
      const fetchOpts = { cache: "no-store" };

      // a) Modèle de Base Haute Résolution Étendu 16 jours (T°, Isotherme, Lever/Coucher, WMO codes, Indice UV & Ciel clair)
      const baseUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&elevation=${location.alt}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,cloud_cover,surface_pressure,precipitation,snowfall,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,freezing_level_height,uv_index,uv_index_clear_sky&daily=sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max,uv_index_clear_sky_max&timezone=Europe%2FParis&forecast_days=16`;

      // b) Modèle officiel Météo-France Étendu 16 jours (AROME HD 1.3km pour 0-42h + ARPEGE pour 42-96h via meteofrance_seamless)
      const inFrance = location.lat >= 41 && location.lat <= 52 && location.lon >= -5 && location.lon <= 10;
      const mfUrl = inFrance
        ? `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&elevation=${location.alt}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,cloud_cover,surface_pressure,precipitation,snowfall,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,freezing_level_height&daily=sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&models=meteofrance_seamless&timezone=Europe%2FParis&forecast_days=16`
        : baseUrl;

      // c) Modèle AROME HD 1.3km Météo-France (Spécifique Météociel Haute Résolution)
      const aromeUrl = inFrance
        ? `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&elevation=${location.alt}&hourly=temperature_2m,relative_humidity_2m,surface_pressure,precipitation,snowfall,wind_speed_10m,wind_direction_10m,wind_gusts_10m,freezing_level_height,weather_code&models=meteofrance_arome_france_hd&timezone=Europe%2FParis`
        : baseUrl;

      // d) Modèle GFS 0.25° NOAA (Météociel Classique 3 jours)
      const gfsUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&elevation=${location.alt}&hourly=temperature_2m,relative_humidity_2m,surface_pressure,precipitation,snowfall,wind_speed_10m,wind_direction_10m,wind_gusts_10m,freezing_level_height,weather_code&models=gfs_seamless&timezone=Europe%2FParis`;

      // e) Modèle ECMWF IFS 0.25° (Centre Européen / Base de Yr.no et tendances 15 jours Météo-France)
      const ecmwfUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&elevation=${location.alt}&hourly=temperature_2m,relative_humidity_2m,surface_pressure,precipitation,snowfall,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,freezing_level_height&daily=sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&models=ecmwf_ifs025&timezone=Europe%2FParis&forecast_days=16`;

      // f) API officielle MET Norway (Yr.no) en direct
      const metNoPromise = fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${location.lat.toFixed(4)}&lon=${location.lon.toFixed(4)}`, fetchOpts)
        .then(r => r.ok ? r.json() : null)
        .catch(errMet => {
          console.warn("Repli sur modèle ECMWF IFS (MET Norway non joignable):", errMet);
          return null;
        });

      // g) API officielle Météo-France en direct (prévisions expertisées et pictos natifs MF)
      const mfOfficialUrl = inFrance
        ? `https://webservice.meteofrance.com/forecast?token=__Wj7dVSTjV9YGu1guveLyDq0g7S7TfTjaHBTPTpO0kj8__&lat=${location.lat}&lon=${location.lon}`
        : null;
      const mfOfficialPromise = mfOfficialUrl
        ? fetch(mfOfficialUrl, fetchOpts)
            .then(r => r.ok ? r.json() : null)
            .catch(err => {
              console.warn("API Météo-France webservice inaccessible, repli sur modèle seamless:", err);
              return null;
            })
        : Promise.resolve(null);

      // Lancement simultané des requêtes
      const [baseRes, mfRes, aromeRes, gfsRes, ecmwfRes, metNoData, mfOfficialData] = await Promise.all([
        fetch(baseUrl, fetchOpts).catch(() => null),
        fetch(mfUrl, fetchOpts).catch(() => null),
        fetch(aromeUrl, fetchOpts).catch(() => null),
        fetch(gfsUrl, fetchOpts).catch(() => null),
        fetch(ecmwfUrl, fetchOpts).catch(() => null),
        metNoPromise,
        mfOfficialPromise
      ]);

      const baseData = (baseRes && baseRes.ok) ? await baseRes.json() : null;
      const mfRawData = (mfRes && mfRes.ok) ? await mfRes.json() : null;
      const aromeData = (aromeRes && aromeRes.ok) ? await aromeRes.json() : null;
      const gfsData = (gfsRes && gfsRes.ok) ? await gfsRes.json() : null;
      const ecmwfData = (ecmwfRes && ecmwfRes.ok) ? await ecmwfRes.json() : null;

      // Fusion intelligente pour Météo-France :
      // 1. Modèle officiel Météo-France (AROME 1.3km + ARPEGE via meteofrance_seamless) pour les 4-5 premiers jours
      // 2. Continuité sur ECMWF IFS 0.25° pour les jours suivants (J+5 à J+15), exactement comme Météo-France officiel
      let mfMergedData = null;
      if (mfRawData && mfRawData.hourly && mfRawData.hourly.time) {
        mfMergedData = JSON.parse(JSON.stringify(mfRawData));
        const ecmwfH = (ecmwfData && ecmwfData.hourly) ? ecmwfData.hourly : (baseData ? baseData.hourly : null);
        const ecmwfD = (ecmwfData && ecmwfData.daily) ? ecmwfData.daily : (baseData ? baseData.daily : null);

        // Compléter hourly quand meteofrance_seamless est null (au-delà de J+4)
        if (ecmwfH && ecmwfH.time) {
          const ecmwfTimes = ecmwfH.time;
          const hourlyKeys = Object.keys(mfMergedData.hourly);
          hourlyKeys.forEach(k => {
            if (k === 'time' || !Array.isArray(mfMergedData.hourly[k])) return;
            const arr = mfMergedData.hourly[k];
            const fallbackArr = ecmwfH[k];
            if (!fallbackArr) return;
            for (let i = 0; i < arr.length; i++) {
              if (arr[i] === null || arr[i] === undefined) {
                const tStr = mfMergedData.hourly.time[i];
                const fbIdx = ecmwfTimes.indexOf(tStr);
                if (fbIdx !== -1 && fallbackArr[fbIdx] != null) {
                  arr[i] = fallbackArr[fbIdx];
                }
              }
            }
          });
        }

        // Compléter daily quand meteofrance_seamless est null
        if (mfMergedData.daily && ecmwfD && ecmwfD.time) {
          const ecmwfDTimes = ecmwfD.time;
          const dailyKeys = Object.keys(mfMergedData.daily);
          dailyKeys.forEach(k => {
            if (k === 'time' || !Array.isArray(mfMergedData.daily[k])) return;
            const dArr = mfMergedData.daily[k];
            const fallbackDArr = ecmwfD[k];
            if (!fallbackDArr) return;
            for (let i = 0; i < dArr.length; i++) {
              if (dArr[i] === null || dArr[i] === undefined) {
                const dStr = mfMergedData.daily.time[i];
                const fbDIdx = ecmwfDTimes.indexOf(dStr);
                if (fbDIdx !== -1 && fallbackDArr[fbDIdx] != null) {
                  dArr[i] = fallbackDArr[fbDIdx];
                }
              }
            }
          });
        }
      }

      // Enrichissement d'AROME HD avec les données de base pour les champs non fournis par le modèle brut
      if (aromeData && aromeData.hourly && baseData && baseData.hourly) {
        const fieldsToBackfill = ['weather_code', 'freezing_level_height', 'snowfall', 'surface_pressure', 'dew_point_2m', 'cloud_cover'];
        const aromeTimes = aromeData.hourly.time || [];
        const baseTimes = baseData.hourly.time || [];

        fieldsToBackfill.forEach(field => {
          const aromeArr = aromeData.hourly[field];
          const baseArr = baseData.hourly[field];
          if (!baseArr) return;

          const isAllNull = !aromeArr || aromeArr.every(v => v === null || v === undefined);
          if (isAllNull) {
            aromeData.hourly[field] = aromeTimes.map(tStr => {
              const bIdx = baseTimes.indexOf(tStr);
              return bIdx !== -1 ? baseArr[bIdx] : null;
            });
          }
        });
      }

      const primaryData = baseData || aromeData || gfsData || ecmwfData;
      if (!primaryData || !primaryData.hourly) {
        throw new Error("Impossible de récupérer les données météo");
      }

      weatherDataCache = primaryData;
      aromeDataCache = aromeData || primaryData;
      mfDataCache = mfMergedData || aromeData || primaryData;
      mfOfficialDataCache = mfOfficialData;
      gfsDataCache = gfsData || primaryData;

      // Traitement Yr.no officiel
      let yrProcessed = null;
      if (metNoData) {
        yrProcessed = convertMetNoToHourly(metNoData);
      }
      if (!yrProcessed || !yrProcessed.hourly || yrProcessed.hourly.time.length === 0) {
        yrProcessed = ecmwfData || primaryData;
      }
      yrnoDataCache = yrProcessed;

      // Mise à jour de l'horodatage en direct et horodatage de succès
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      lastSuccessfulFetchTime = Date.now();
      if (heroLiveBadge) {
        heroLiveBadge.textContent = `● ${timeStr}`;
      }

      // 3. Rendu de tous les modules de l'application
      renderCurrentMetrics(primaryData);
      renderEphemeris(primaryData, location);

      // Rendu Météociel selon le modèle choisi (AROME HD ou GFS)
      renderSelectedMeteocielModel();

      // Rendu Météo-France (alimenté par le modèle officiel Météo-France AROME + ARPEGE étendu)
      renderAromeTimeline(mfDataCache || aromeDataCache);
      if (tabAromeChart && tabAromeChart.classList.contains("active")) {
        drawAromeChart(aromeDataCache);
      }

      // Rendu Yr.no (avec données officielles MET Norway / ECMWF)
      drawYrnoMeteogram(yrnoDataCache);
      renderEcmwfDaily(ecmwfData || primaryData);
      renderRommaStations(location);
      updateMeteoblueMap(location);
      if (radarMap) {
        loadRadarData();
      }

    } catch (err) {
      console.error("Échec récupération météo en direct:", err);
      if (heroLiveBadge) {
        heroLiveBadge.textContent = "⚠️ Connexion interrompue • Cliquez pour réessayer";
        heroLiveBadge.style.cursor = "pointer";
        heroLiveBadge.onclick = () => loadAllLocationData(currentLocation, true);
      }
      if (aromeHourlyScroll) {
        aromeHourlyScroll.innerHTML = '<div class="error-banner">⚠️ Erreur de connexion aux serveurs météo. <button id="btnRetryArome" class="ext-link-btn" style="margin-left:10px;padding:4px 8px;font-size:0.8rem;">Réessayer</button></div>';
        const btn = document.getElementById("btnRetryArome");
        if (btn) btn.onclick = () => loadAllLocationData(currentLocation, true);
      }
      if (dailyForecastGrid) {
        dailyForecastGrid.innerHTML = '<div class="error-banner">⚠️ Données temporairement indisponibles.</div>';
      }
    } finally {
      if (yrCanvasLoading) yrCanvasLoading.style.display = "none";
    }
  }

  // ========================================================
  // EVENT LISTENERS
  // ========================================================
  function setupEventListeners() {
    if (tabAromeHourly && tabAromeChart) {
      tabAromeHourly.addEventListener("click", () => {
        tabAromeHourly.classList.add("active");
        tabAromeChart.classList.remove("active");
        if (aromeTimelineView) aromeTimelineView.style.display = "block";
        if (aromeChartView) aromeChartView.style.display = "none";
      });

      tabAromeChart.addEventListener("click", () => {
        tabAromeChart.classList.add("active");
        tabAromeHourly.classList.remove("active");
        if (aromeTimelineView) aromeTimelineView.style.display = "none";
        if (aromeChartView) aromeChartView.style.display = "block";
        if (aromeDataCache) {
          drawAromeChart(aromeDataCache);
        }
      });
    }

    // Blocs Accordéons / Enroulables (Tous les modules du dashboard)
    function setupAccordions() {
      const accordions = [

        {
          sectionId: "meteocielCitySection",
          headerId: "meteocielAccordionHeader",
          onExpand: () => {
            if (gfsDataCache || weatherDataCache) {
              // Diagramme précipitations supprimé
            }
          }
        },
        {
          sectionId: "aromeSection",
          headerId: "aromeAccordionHeader",
          onExpand: () => {
            if (tabAromeChart && tabAromeChart.classList.contains("active") && aromeDataCache) {
              drawAromeChart(aromeDataCache);
            }
          }
        },
        {
          sectionId: "ecmwfSection",
          headerId: "yrnoAccordionHeader",
          onExpand: () => {
            if (yrnoDataCache || weatherDataCache) {
              drawYrnoMeteogram(yrnoDataCache || weatherDataCache);
            }
          }
        },
        {
          sectionId: "rommaSection",
          headerId: "rommaAccordionHeader",
          onExpand: null
        },
        {
          sectionId: "meteoblueSection",
          headerId: "meteoblueAccordionHeader",
          onExpand: () => {
            if (radarMap) {
              setTimeout(() => radarMap.invalidateSize(), 150);
            }
          }
        },
        {
          sectionId: "safetySection",
          headerId: "safetyAccordionHeader",
          onExpand: null
        }
      ];

      accordions.forEach(({ sectionId, headerId, onExpand }) => {
        const section = document.getElementById(sectionId);
        const header = document.getElementById(headerId);
        if (!section || !header) return;

        const body = section.querySelector(".accordion-body");
        if (!body) return;

        function toggle() {
          const isCollapsed = body.classList.toggle("collapsed");
          header.classList.toggle("collapsed", isCollapsed);
          section.classList.toggle("collapsed", isCollapsed);
          header.setAttribute("aria-expanded", !isCollapsed);

          if (!isCollapsed && typeof onExpand === "function") {
            requestAnimationFrame(() => {
              onExpand();
            });
          }
        }

        header.addEventListener("click", (e) => {
          if (e.target.closest("a, button, input, select, .unit-toggle-btn, .ext-link-btn")) return;
          toggle();
        });

        header.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            if (e.target.closest("a, button, input, select, .unit-toggle-btn, .ext-link-btn, .block-drag-handle")) return;
            e.preventDefault();
            toggle();
          }
        });
      });
    }

    // Réorganisation verticale des blocs via le bouton burger (Souris, Tactile & Clavier + Persistance localStorage)
    function setupBlockReordering() {
      const mainContainer = document.querySelector("main.main-content");
      if (!mainContainer) return;
      const BLOCKS_ORDER_KEY = "meteo_blocks_order_v1";

      function getBlocks() {
        return Array.from(mainContainer.querySelectorAll(":scope > section.card"));
      }

      function saveBlocksOrder() {
        try {
          const order = getBlocks().map(sec => sec.id).filter(Boolean);
          localStorage.setItem(BLOCKS_ORDER_KEY, JSON.stringify(order));
        } catch (e) {
          console.warn("Erreur sauvegarde ordre des blocs:", e);
        }
      }

      function restoreBlocksOrder() {
        try {
          const raw = localStorage.getItem(BLOCKS_ORDER_KEY);
          if (!raw) return;
          const savedIds = JSON.parse(raw);
          if (!Array.isArray(savedIds) || savedIds.length === 0) return;

          savedIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.parentElement === mainContainer) {
              mainContainer.appendChild(el);
            }
          });
        } catch (e) {
          console.warn("Erreur restauration ordre des blocs:", e);
        }
      }

      restoreBlocksOrder();

      let draggedSection = null;
      let currentClientY = 0;
      let autoScrollRaf = null;

      function evaluateSwap(clientY) {
        if (!draggedSection) return;
        const blocks = getBlocks();
        const idx = blocks.indexOf(draggedSection);
        if (idx === -1) return;

        if (idx > 0) {
          const prev = blocks[idx - 1];
          const prevRect = prev.getBoundingClientRect();
          const prevMid = prevRect.top + prevRect.height / 2;
          if (clientY < prevMid) {
            mainContainer.insertBefore(draggedSection, prev);
            return;
          }
        }

        if (idx < blocks.length - 1) {
          const next = blocks[idx + 1];
          const nextRect = next.getBoundingClientRect();
          const nextMid = nextRect.top + nextRect.height / 2;
          if (clientY > nextMid) {
            mainContainer.insertBefore(draggedSection, next.nextSibling);
          }
        }
      }

      function autoScrollLoop() {
        if (!draggedSection) return;
        const edgeZone = 75;
        const maxSpeed = 14;
        const vh = window.innerHeight;

        if (currentClientY < edgeZone) {
          const ratio = Math.max(0.15, (edgeZone - currentClientY) / edgeZone);
          window.scrollBy(0, -Math.round(maxSpeed * ratio));
          evaluateSwap(currentClientY);
        } else if (currentClientY > vh - edgeZone) {
          const ratio = Math.max(0.15, (currentClientY - (vh - edgeZone)) / edgeZone);
          window.scrollBy(0, Math.round(maxSpeed * ratio));
          evaluateSwap(currentClientY);
        }

        autoScrollRaf = requestAnimationFrame(autoScrollLoop);
      }

      function onPointerMove(e) {
        if (!draggedSection) return;
        currentClientY = e.clientY;
        evaluateSwap(currentClientY);
      }

      function endDrag() {
        if (!draggedSection) return;
        if (autoScrollRaf) {
          cancelAnimationFrame(autoScrollRaf);
          autoScrollRaf = null;
        }
        draggedSection.classList.remove("block-dragging");
        document.body.classList.remove("is-reordering-blocks");
        draggedSection = null;

        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", endDrag);
        window.removeEventListener("pointercancel", endDrag);

        saveBlocksOrder();
        if (radarMap) {
          setTimeout(() => radarMap.invalidateSize(), 100);
        }
      }

      mainContainer.querySelectorAll(".block-drag-handle").forEach(handle => {
        handle.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
        });

        handle.addEventListener("pointerdown", (e) => {
          if (e.button !== undefined && e.button !== 0) return;
          const section = handle.closest("section.card");
          if (!section) return;

          e.preventDefault();
          e.stopPropagation();

          draggedSection = section;
          currentClientY = e.clientY;
          draggedSection.classList.add("block-dragging");
          document.body.classList.add("is-reordering-blocks");

          window.addEventListener("pointermove", onPointerMove, { passive: true });
          window.addEventListener("pointerup", endDrag);
          window.addEventListener("pointercancel", endDrag);

          autoScrollRaf = requestAnimationFrame(autoScrollLoop);
        });

        handle.addEventListener("keydown", (e) => {
          if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
          const section = handle.closest("section.card");
          if (!section) return;
          e.preventDefault();
          e.stopPropagation();

          const blocks = getBlocks();
          const idx = blocks.indexOf(section);
          if (e.key === "ArrowUp" && idx > 0) {
            mainContainer.insertBefore(section, blocks[idx - 1]);
            saveBlocksOrder();
            handle.focus();
            section.scrollIntoView({ behavior: "smooth", block: "nearest" });
          } else if (e.key === "ArrowDown" && idx < blocks.length - 1) {
            mainContainer.insertBefore(section, blocks[idx + 1].nextSibling);
            saveBlocksOrder();
            handle.focus();
            section.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        });
      });
    }

    setupAccordions();
    setupBlockReordering();
    setTimeout(initRadarMap, 100);

    // Gestion interactive de l'info-bulle Indice UV
    const uvTooltipPopover = document.getElementById("uvTooltipPopover");
    if (uvInfoBtn && uvTooltipPopover) {
      uvInfoBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        uvTooltipPopover.classList.toggle("open");
      });
    }

    if (uvTooltipClose && uvTooltipPopover) {
      uvTooltipClose.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        uvTooltipPopover.classList.remove("open");
      });
    }

    // Fermeture automatique au clic n'importe où ailleurs (Recherche, Info-bulle UV, Favoris)
    document.addEventListener("click", (e) => {
      // 1. Fermer le menu déroulant de recherche et replier la barre de recherche en loupe seule
      const searchBox = document.getElementById("globalSearchBox");
      const searchWrap = document.querySelector(".hero-search-inline-wrap") || searchBox;
      const searchDropdown = document.getElementById("globalSearchDropdown");
      if (searchWrap && !searchWrap.contains(e.target) && (!searchDropdown || !searchDropdown.contains(e.target))) {
        if (searchDropdown) searchDropdown.style.display = "none";
        if (searchBox) searchBox.classList.remove("search-expanded");
        closeSearchBar();
        const clearBtn = document.getElementById("globalSearchClearBtn") || document.getElementById("globalSearchClear");
        if (clearBtn && globalSearchInput && !globalSearchInput.value) {
          clearBtn.style.display = "none";
        }
      }

      // 2. Fermer l'info-bulle UV si on clique en dehors
      if (uvTooltipPopover && uvTooltipPopover.classList.contains("open")) {
        const uvCard = document.getElementById("metricCardUv");
        if (uvCard && !uvCard.contains(e.target)) {
          uvTooltipPopover.classList.remove("open");
        }
      }

      // 3. Fermer le panneau des favoris si on clique en dehors
      const favWrap = document.querySelector(".favorites-flyout-wrap");
      const favFlyout = document.getElementById("favoritesFlyout");
      if (favFlyout && favFlyout.style.display !== "none" && favWrap && !favWrap.contains(e.target)) {
        favFlyout.style.display = "none";
        const favBtn = document.getElementById("favoritesToggleBtn");
        if (favBtn) favBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Info-bulle & Guideline au survol du météogramme Yr.no
    if (yrCanvas) {
      function updateYrnoTooltip(e) {
        if (!yrnoMeteogramMeta || !yrnoMeteogramMeta.data) return;
        const { data, totalHours, padLeft, slotW, totalW } = yrnoMeteogramMeta;
        if (!totalHours || slotW <= 0 || !data.hourly || !data.hourly.time) return;

        const rect = yrCanvas.getBoundingClientRect();
        const isTouch = e.touches && e.touches.length > 0;
        const clientX = isTouch ? e.touches[0].clientX : e.clientX;
        const clientY = isTouch ? e.touches[0].clientY : e.clientY;

        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        // Tranche horaire correspondante
        const index = Math.round((mouseX - padLeft) / slotW);
        if (index < 0 || index >= totalHours) {
          hideYrnoTooltip();
          return;
        }

        const hourly = data.hourly;
        if (!hourly.time || !hourly.time[index]) {
          hideYrnoTooltip();
          return;
        }

        const d = new Date(hourly.time[index]);
        const dayStr = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
        const capDay = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
        const hStart = d.getHours();
        const hEnd = (hStart + 1) % 24;

        if (yrnoTtHeader) yrnoTtHeader.textContent = `${capDay} à ${hStart}–${hEnd}h`;

        // Température
        const rawT = hourly.temperature_2m ? hourly.temperature_2m[index] : null;
        if (yrnoTtTemp) {
          if (rawT !== null && rawT !== undefined && !isNaN(Number(rawT))) {
            const t = Number(rawT);
            yrnoTtTemp.textContent = `${Math.round(t)}°`;
            yrnoTtTemp.style.color = t < 0 ? "#0284c7" : "#dc2626";
          } else {
            yrnoTtTemp.textContent = "--";
          }
        }

        // Précipitations
        const rawP = hourly.precipitation ? hourly.precipitation[index] : null;
        if (yrnoTtRain) {
          if (rawP !== null && rawP !== undefined && !isNaN(Number(rawP))) {
            const p = Number(rawP);
            yrnoTtRain.textContent = `${p >= 10 ? Math.round(p) : p.toFixed(1)} mm`;
          } else {
            yrnoTtRain.textContent = "0 mm";
          }
        }

        // Vent (toujours en km/h)
        const rawW = hourly.wind_speed_10m ? hourly.wind_speed_10m[index] : null;
        if (yrnoTtWind) {
          if (rawW !== null && rawW !== undefined && !isNaN(Number(rawW))) {
            const numWind = Number(rawW);
            yrnoTtWind.textContent = `${Math.round(numWind)} km/h`;
          } else {
            yrnoTtWind.textContent = "--";
          }
        }

        // Positionnement de la colonne horaire en surbrillance (screen 1 Yr.no)
        const colX = padLeft + index * slotW;
        if (yrnoGuideline) {
          yrnoGuideline.style.left = `${colX - slotW / 2}px`;
          yrnoGuideline.style.width = `${slotW}px`;
          yrnoGuideline.style.display = "block";
        }

        // Positionnement de l'info-bulle flottante
        if (yrnoTooltip) {
          const ttWidth = 220;
          let ttLeft = colX + 16;
          if (ttLeft + ttWidth > totalW - 12) {
            ttLeft = colX - ttWidth - 16;
          }
          if (ttLeft < 8) ttLeft = 8;

          const ttTop = Math.max(34, Math.min(160, mouseY - 50));
          yrnoTooltip.style.left = `${ttLeft}px`;
          yrnoTooltip.style.top = `${ttTop}px`;
          yrnoTooltip.style.display = "block";
        }
      }

      function hideYrnoTooltip() {
        if (yrnoTooltip) yrnoTooltip.style.display = "none";
        if (yrnoGuideline) yrnoGuideline.style.display = "none";
      }

      yrCanvas.addEventListener("mousemove", updateYrnoTooltip);
      yrCanvas.addEventListener("mouseleave", hideYrnoTooltip);

      yrCanvas.addEventListener("touchstart", updateYrnoTooltip, { passive: true });
      yrCanvas.addEventListener("touchmove", updateYrnoTooltip, { passive: true });
      yrCanvas.addEventListener("touchend", hideYrnoTooltip);
    }

    function refreshAllComponents() {
      if (aromeChartView && aromeChartView.style.display !== "none" && aromeDataCache) {
        drawAromeChart(aromeDataCache);
      }
      renderSelectedMeteocielModel();
      if (yrnoDataCache || weatherDataCache) {
        drawYrnoMeteogram(yrnoDataCache || weatherDataCache);
      }
      const mbSection = document.getElementById("meteoblueSection");
      if (radarMap) {
        if (mbSection && mbSection.offsetParent !== null) {
          radarMap.invalidateSize();
          if (Date.now() - lastRadarLoadTime > 8 * 60 * 1000) {
            loadRadarData();
          } else {
            syncRadarToCurrentTime();
          }
        } else {
          stopRadarPlayback();
        }
      }
      if (rommaMapIframe && rommaMapIframe.offsetParent !== null) {
        // Chargement initial uniquement (aucun recentrage forcé au resize : la carte reste déplaçable)
        if (!rommaMapIframe.dataset.loadedKey || rommaMapIframe.dataset.loadedKey !== rommaMapIframe.dataset.pendingKey) {
          updateRommaMap(currentLocation, false);
        }
      }
      const wcSection = document.getElementById("webcamsSection");
      if (wcSection && wcSection.offsetParent !== null) {
        mountVisibleWebcamMedia();
      } else {
        unmountAllWebcamMedia();
      }
    }
    window.refreshMeteoComponents = refreshAllComponents;

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refreshAllComponents, 120);
    }, { passive: true });

    // ========================================================
    // GESTION UNIFIÉE DES RESSOURCES ET RAFRAÎCHISSEMENT (TOUS ONGLETS & PAGES)
    // 1. Zéro tâche de fond périodique (pas de rechargement toutes les minutes)
    // 2. Strictement rien en arrière-plan (visibilityState !== 'visible' -> aucun calcul ni requête)
    // 3. Rechargement réel et direct à l'arrivée sur l'application ou au basculement d'onglet
    // 4. Protection debounce (15 secondes) évitant tout martèlement ou requêtes superflues
    // 5. Zéro cache fallacieux masquant le réseau : données toujours fraîches en direct
    // ========================================================
    const TAB_DEBOUNCE_MS = 15 * 1000;

    function getActiveTabKey() {
      const activeBtn = document.querySelector(".tab-nav-btn.active");
      if (activeBtn && activeBtn.dataset.tab) {
        return activeBtn.dataset.tab;
      }
      try {
        const stored = localStorage.getItem("meteo_active_tab_horizontal");
        if (stored) return stored;
      } catch (_) {}
      return "meteociel";
    }

    function refreshActiveTabContent(force = false) {
      // 1. Zéro activité si la page est masquée / en arrière-plan
      if (document.visibilityState !== "visible") return;

      const activeTab = getActiveTabKey();
      const now = Date.now();

      // 2. Onglets météo partageant les prévisions directes (Météociel, ECMWF/Yr.no, Météo-France)
      if (["meteociel", "ecmwf", "arome"].includes(activeTab)) {
        if (!force && (now - lastSuccessfulFetchTime < TAB_DEBOUNCE_MS)) return;
        if (currentLocation) {
          loadAllLocationData(currentLocation, true);
        }
        return;
      }

      // 3. Onglet Radar de précipitations (Météoblue)
      if (activeTab === "meteoblue") {
        if (radarMap) {
          radarMap.invalidateSize();
          if (force || (now - lastRadarLoadTime >= TAB_DEBOUNCE_MS)) {
            loadRadarData();
          } else {
            syncRadarToCurrentTime();
          }
        }
        return;
      }

      // 4. Onglet Webcams
      if (activeTab === "webcams") {
        if (force || (now - lastWebcamRefreshTime >= TAB_DEBOUNCE_MS)) {
          lastWebcamRefreshTime = now;
          mountVisibleWebcamMedia(true);
        }
        return;
      }

      // 5. Onglet Stations ROMMA
      if (activeTab === "romma") {
        if (force || (now - lastRommaRefreshTime >= TAB_DEBOUNCE_MS)) {
          lastRommaRefreshTime = now;
          if (rommaMapIframe && rommaMapIframe.offsetParent !== null) {
            updateRommaMap(currentLocation, false);
          }
        }
        return;
      }
    }
    window.refreshActiveTab = refreshActiveTabContent;

    // A. Événements système quand l'utilisateur revient sur l'application (au premier plan)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        refreshActiveTabContent();
      } else {
        stopRadarPlayback();
      }
    });

    window.addEventListener("pageshow", () => {
      if (document.visibilityState === "visible") {
        refreshActiveTabContent();
      }
    });

    window.addEventListener("focus", () => {
      if (document.visibilityState === "visible") {
        refreshActiveTabContent();
      }
    });

    // B. Événements de navigation : quand l'utilisateur clique ou bascule sur un onglet
    document.addEventListener("click", (e) => {
      const btn = e.target.closest('.tab-nav-btn');
      if (btn && document.visibilityState === "visible") {
        setTimeout(() => refreshActiveTabContent(false), 50);
      }
    });
  }

  // ========================================================
  // CALCULS MÉTÉO DE MONTAGNE (Windchill, Limite Pluie/Neige)
  // ========================================================
  function computeWindchill(temp, windKmh) {
    if (temp > 10 || windKmh < 4.8) {
      return Math.round(temp);
    }
    const wc = 13.12 + 0.6215 * temp - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * temp * Math.pow(windKmh, 0.16);
    return Math.round(wc);
  }

  // ========================================================
  // AFFICHAGE DES MÉTRIQUES ACTUELLES (HERO)
  // ========================================================
  function renderCurrentMetrics(data) {
    const hourly = data.hourly;
    if (!hourly || !hourly.time) return;

    // Trouver l'index de l'heure courante (ou la plus proche) en heure locale
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const localIsoHour = `${y}-${m}-${d}T${h}`;

    let idx = hourly.time.findIndex(t => t.startsWith(localIsoHour));
    if (idx === -1) {
      const nowTs = now.getTime();
      let bestDiff = Infinity;
      idx = 0;
      for (let i = 0; i < hourly.time.length; i++) {
        const diff = Math.abs(new Date(hourly.time[i]).getTime() - nowTs);
        if (diff < bestDiff) {
          bestDiff = diff;
          idx = i;
        }
      }
    }

    const t = hourly.temperature_2m ? hourly.temperature_2m[idx] : null;
    const wind = hourly.wind_speed_10m ? hourly.wind_speed_10m[idx] : 0;
    const gust = hourly.wind_gusts_10m ? hourly.wind_gusts_10m[idx] : 0;
    const iso = hourly.freezing_level_height ? hourly.freezing_level_height[idx] : null;

    // Cumul 24h
    let p24 = 0;
    let s24 = 0;
    for (let i = idx; i < Math.min(idx + 24, hourly.time.length); i++) {
      if (hourly.precipitation && hourly.precipitation[i] != null) p24 += hourly.precipitation[i];
      if (hourly.snowfall && hourly.snowfall[i] != null) s24 += hourly.snowfall[i];
    }

    // Température & Windchill
    let currentCalculatedWc = null;
    if (t !== null && t !== undefined) {
      currentCalculatedWc = computeWindchill(t, gust || wind || 0);
      if (currentTemp) currentTemp.textContent = `${t.toFixed(1)} °C`;
      if (currentWindchill) currentWindchill.textContent = `Ressentie ${currentCalculatedWc} °C`;
      window._currentMeteoData = {
        temp: t,
        windchill: currentCalculatedWc,
        wind: Math.round(wind || 0),
        gust: Math.round(gust || 0)
      };
    } else {
      if (currentTemp) currentTemp.textContent = "-- °C";
      if (currentWindchill) currentWindchill.textContent = "Non mesuré";
      window._currentMeteoData = null;
    }

    // Vent & Rafales (sécurisé si le petit carré en haut est retiré)
    if (currentWind) {
      currentWind.textContent = `${Math.round(wind || 0)} km/h`;
    }
    if (currentGusts) {
      currentGusts.textContent = `Rafales max ${Math.round(gust || 0)} km/h`;
      if (gust > 65) {
        currentGusts.style.color = "#f43f5e";
        currentGusts.textContent += " ⚠️ VENT FORT";
      } else {
        currentGusts.style.color = "";
      }
    }

    // Isotherme 0°C (Priorité aux données officielles Météo-France si disponibles)
    let finalIso = iso;
    if (mfOfficialDataCache && Array.isArray(mfOfficialDataCache.forecast) && mfOfficialDataCache.forecast.length > 0) {
      const mfCurrentSlot = mfOfficialDataCache.forecast[0];
      if (mfCurrentSlot && mfCurrentSlot.iso0 != null) {
        finalIso = mfCurrentSlot.iso0;
      }
    }
    if (finalIso !== null && finalIso !== undefined) {
      currentIsoZero.textContent = `${Math.round(finalIso)} m`;
    } else {
      currentIsoZero.textContent = "-- m";
    }
    if (currentIsoStatus) {
      currentIsoStatus.textContent = "";
    }

    // Précipitations (si élément présent dans le DOM)
    if (currentPrecip) currentPrecip.textContent = `${p24.toFixed(1)} mm`;
    if (currentSnow) currentSnow.textContent = s24 > 0 ? `Neige : +${Math.round(s24)} cm` : "Pas de neige annoncée";

    // Indice UV & Protection solaire (Échelle OMS / 11+ & Comparatif immédiat)
    if (currentUv) {
      const nowHour = new Date().getHours();
      const isNightNow = nowHour < 7 || nowHour >= 20;

      let curUv = (hourly.uv_index && hourly.uv_index[idx] != null) ? hourly.uv_index[idx] : 0;
      if (isNightNow) {
        curUv = 0;
      }

      // Prise en compte de l'heure actuelle pour le calcul du Max UV affiché :
      // La nuit, aucun rayonnement solaire direct ne subsiste : max = 0.
      let maxUv = 0;
      if (isNightNow) {
        maxUv = 0;
      } else if (hourly.uv_index && hourly.time) {
        // En journée : calcul du max restant d'ici la fin de journée
        for (let hIdx = idx; hIdx < Math.min(idx + 14, hourly.time.length); hIdx++) {
          const hDate = new Date(hourly.time[hIdx]);
          if (hDate.getHours() >= 20 || hDate.getDate() !== new Date().getDate()) break;
          const val = hourly.uv_index[hIdx] || 0;
          if (val > maxUv) maxUv = val;
        }
        if (maxUv === 0 && curUv > 0) maxUv = curUv;
      } else {
        maxUv = curUv;
      }

      const clearSkyMax = (data.daily && data.daily.uv_index_clear_sky_max && data.daily.uv_index_clear_sky_max[0] != null)
        ? data.daily.uv_index_clear_sky_max[0]
        : null;

      // Niveau et Recommandations OMS
      const refUv = isNightNow ? 0 : Math.max(curUv, maxUv);
      let uvLabel = "Faible";
      let uvColor = "#10b981";
      let burnTime = "Sans risque (> 1h)";
      let uvAdvice = "Crème non requise";
      let uvIcon = isNightNow ? "🌙" : "☀️";

      if (isNightNow) {
        uvLabel = "Nuit (0/5)";
        uvColor = "#10b981";
        burnTime = "Nuit : aucun rayonnement UV";
        uvAdvice = "Protection solaire non requise";
        uvIcon = "🌙";
      } else if (refUv < 3) {
        uvLabel = "Faible (1/5)";
        uvColor = "#10b981";
        burnTime = "Coup de soleil : > 60 min";
        uvAdvice = (currentLocation.alt >= 1800 || s24 > 0)
          ? "Neige : Crème conseillée"
          : "Crème non requise";
        uvIcon = "☀️";
      } else if (refUv < 6) {
        uvLabel = "Modéré (2/5)";
        uvColor = "#f59e0b";
        burnTime = "Coup de soleil : ~45 min";
        uvAdvice = "⛱️ Crème SPF 30+ & lunettes";
        uvIcon = "⛱️";
      } else if (refUv < 8) {
        uvLabel = "Élevé (3/5)";
        uvColor = "#f97316";
        burnTime = "Coup de soleil : ~25-30 min";
        uvAdvice = "⛱️ Crème SPF 50+ & chapeau";
        uvIcon = "⛱️";
      } else if (refUv < 11) {
        uvLabel = "Très élevé (4/5)";
        uvColor = "#ef4444";
        burnTime = "Coup de soleil : ~15-20 min";
        uvAdvice = "🚨 SPF 50+ indispensable • Éviter midi";
        uvIcon = "🚨";
      } else {
        uvLabel = "Extrême (5/5)";
        uvColor = "#8b5cf6";
        burnTime = "Coup de soleil : < 15 min";
        uvAdvice = "⛔ Danger brûlure • Ombre requise";
        uvIcon = "⛔";
      }

      if (currentUvIcon) currentUvIcon.textContent = uvIcon;

      // Affichage sobre : Valeur actuelle et Max selon l'heure
      const curDisplay = curUv >= 0.1 ? curUv.toFixed(1) : "0";
      const maxDisplay = maxUv >= 0.1 ? maxUv.toFixed(1) : "0";

      currentUv.textContent = curDisplay;

      if (uvMaxTag) {
        uvMaxTag.textContent = isNightNow ? "(Nuit • Max 0)" : `(Max ${maxDisplay})`;
      }

      // Mise à jour de l'info-bulle détaillée interactive
      if (ttUvCurrent) ttUvCurrent.textContent = isNightNow ? "0 / 11 (Nuit)" : `${curDisplay} / 11`;
      if (ttUvMax) ttUvMax.textContent = isNightNow ? "0 / 11 (Nuit)" : `${maxDisplay} / 11`;
      if (ttUvClearSky) ttUvClearSky.textContent = isNightNow ? "0 / 11 (Nuit)" : `${clearSkyMax ? clearSkyMax.toFixed(1) : maxDisplay} / 11`;

      // Position du curseur sur la jauge (0 à 11+)
      if (uvGaugePin) {
        const pinPercent = Math.min(100, Math.max(3, (refUv / 11) * 100));
        uvGaugePin.style.left = `${pinPercent}%`;
        uvGaugePin.style.backgroundColor = uvColor;
      }

      // Ligne d'explication concrète (si élément présent)
      if (currentUvAdvice) {
        currentUvAdvice.textContent = `${burnTime} • ${uvAdvice}`;
        currentUvAdvice.style.color = uvColor;
      }

      // Suppression explicite de tout attribut title natif pour ne garder que l'info-bulle visuelle
      const card = document.getElementById("metricCardUv");
      if (card) card.removeAttribute("title");
    }
  }

  // ========================================================
  // ========================================================
  // DESIGN OFFICIEL MÉTÉO FRANCE (Screen 3)
  // Carte 4 périodes (Matin, Après-midi, Soirée, Nuit) + Sélecteur 15 jours
  // ========================================================
  let mfDaysForecastData = [];

  function showMfDayDetail(dayIndex) {
    if (!mfDaysForecastData || !mfDaysForecastData[dayIndex]) return;
    const day = mfDaysForecastData[dayIndex];

    const titleEl = document.getElementById("mfDayDetailTitle");
    if (titleEl) {
      titleEl.textContent = day.fullDateStr;
    }

    const gridEl = document.querySelector(".mf-periods-grid");
    if (!gridEl) return;
    gridEl.innerHTML = "";

    const periodsToRender = [];
    const currentHour = new Date().getHours();
    window._lastRenderedDayHour = currentHour;

    if (dayIndex === 0) {
      // JOUR J : Température actuelle ressentie du moment en première colonne,
      // puis uniquement la suite de la journée restante (pas de matin si 15h !).

      // 1. Valeurs du moment
      let curT = null;
      let curWc = null;
      let curWind = day.dayWind || 10;
      let curWindArrow = "▲";

      if (window._currentMeteoData && window._currentMeteoData.temp != null) {
        curT = Math.round(window._currentMeteoData.temp);
        curWc = Math.round(window._currentMeteoData.windchill);
        if (window._currentMeteoData.wind != null) curWind = window._currentMeteoData.wind;
      } else if (day.currentSlot && day.currentSlot.temp != null) {
        curT = Math.round(day.currentSlot.temp);
        curWc = Math.round(day.currentSlot.felt != null ? day.currentSlot.felt : day.currentSlot.temp);
        curWind = day.currentSlot.wind;
        curWindArrow = day.currentSlot.windArrow || "▲";
      } else {
        curT = day.apresMidi ? day.apresMidi.temp : (day.matin ? day.matin.temp : 0);
        curWc = curT;
      }

      if (day.currentSlot && day.currentSlot.windArrow) {
        curWindArrow = day.currentSlot.windArrow;
      }

      const curDesc = (day.currentSlot && day.currentSlot.desc) ? day.currentSlot.desc : (day.matin ? day.matin.desc : "Ensoleillé");
      const curIcon = (day.currentSlot && day.currentSlot.icon) ? day.currentSlot.icon : (day.matin ? day.matin.icon : "☀️");

      periodsToRender.push({
        name: "EN CE MOMENT",
        desc: curDesc,
        icon: curIcon,
        temp: `${curT}°`,
        felt: `Ressentie ${curWc}°`,
        wind: curWind,
        windArrow: curWindArrow
      });

      // 2. Suite de la journée
      // - Si < 12h : Après-midi, Soirée, Nuit
      // - Si 12h <= h < 18h (ex: 15h) : Soirée, Nuit (le matin et début d'après-midi sont passés)
      // - Si 18h <= h < 22h : Nuit
      // - Si >= 22h : fin de journée, seule la météo du moment est affichée
      if (currentHour < 12) {
        if (day.apresMidi) periodsToRender.push({ name: "APRÈS-MIDI", desc: day.apresMidi.desc, icon: day.apresMidi.icon, temp: `${day.apresMidi.temp}°`, wind: day.apresMidi.wind, windArrow: day.apresMidi.windArrow });
        if (day.soiree) periodsToRender.push({ name: "SOIRÉE", desc: day.soiree.desc, icon: day.soiree.icon, temp: `${day.soiree.temp}°`, wind: day.soiree.wind, windArrow: day.soiree.windArrow });
        if (day.nuit) periodsToRender.push({ name: "NUIT", desc: day.nuit.desc, icon: day.nuit.icon, temp: `${day.nuit.temp}°`, wind: day.nuit.wind, windArrow: day.nuit.windArrow });
      } else if (currentHour >= 12 && currentHour < 18) {
        if (day.soiree) periodsToRender.push({ name: "SOIRÉE", desc: day.soiree.desc, icon: day.soiree.icon, temp: `${day.soiree.temp}°`, wind: day.soiree.wind, windArrow: day.soiree.windArrow });
        if (day.nuit) periodsToRender.push({ name: "NUIT", desc: day.nuit.desc, icon: day.nuit.icon, temp: `${day.nuit.temp}°`, wind: day.nuit.wind, windArrow: day.nuit.windArrow });
      } else if (currentHour >= 18 && currentHour < 22) {
        if (day.nuit) periodsToRender.push({ name: "NUIT", desc: day.nuit.desc, icon: day.nuit.icon, temp: `${day.nuit.temp}°`, wind: day.nuit.wind, windArrow: day.nuit.windArrow });
      }
    } else {
      // Jours futurs (J+1 à J+14) : Les 4 périodes classiques AVEC prévisions du vent
      if (day.matin) periodsToRender.push({ name: "MATIN", desc: day.matin.desc, icon: day.matin.icon, temp: `${day.matin.temp}°`, wind: day.matin.wind, windArrow: day.matin.windArrow });
      if (day.apresMidi) periodsToRender.push({ name: "APRÈS-MIDI", desc: day.apresMidi.desc, icon: day.apresMidi.icon, temp: `${day.apresMidi.temp}°`, wind: day.apresMidi.wind, windArrow: day.apresMidi.windArrow });
      if (day.soiree) periodsToRender.push({ name: "SOIRÉE", desc: day.soiree.desc, icon: day.soiree.icon, temp: `${day.soiree.temp}°`, wind: day.soiree.wind, windArrow: day.soiree.windArrow });
      if (day.nuit) periodsToRender.push({ name: "NUIT", desc: day.nuit.desc, icon: day.nuit.icon, temp: `${day.nuit.temp}°`, wind: day.nuit.wind, windArrow: day.nuit.windArrow });
    }

    periodsToRender.forEach(p => {
      const col = document.createElement("div");
      col.className = "mf-period-col";
      col.innerHTML = `
        <span class="mf-period-name">${p.name}</span>
        <span class="mf-period-desc">${p.desc}</span>
        <div class="mf-period-icon">${p.icon}</div>
        <div class="mf-period-temp">${p.temp}</div>
        ${p.felt ? `<div class="mf-period-felt">${p.felt}</div>` : ""}
        <div class="mf-period-wind">
          <span class="mf-wind-arrow">${p.windArrow || "▲"}</span>
          <span>${p.wind != null ? p.wind : "--"} km/h</span>
        </div>
      `;
      gridEl.appendChild(col);
    });
  }

  function renderOfficialMfTimeline(officialData) {
    const daysSelectorBar = document.getElementById("mfDaysSelectorBar");
    if (!daysSelectorBar) return;
    daysSelectorBar.innerHTML = "";

    const dailyList = Array.isArray(officialData.daily_forecast) ? officialData.daily_forecast : [];
    const hourlyList = Array.isArray(officialData.forecast) ? officialData.forecast : [];
    if (dailyList.length === 0) return;

    // Grouper les créneaux horaires par jour (YYYY-MM-DD en heure locale)
    const hourlyByDay = new Map();
    hourlyList.forEach(slot => {
      const d = new Date(slot.dt * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!hourlyByDay.has(key)) hourlyByDay.set(key, []);
      hourlyByDay.get(key).push({ d, slot });
    });

    mfDaysForecastData = [];

    dailyList.slice(0, 15).forEach((dItem, dayIdx) => {
      const firstDate = new Date(dItem.dt * 1000);
      const dayNameShort = firstDate.toLocaleDateString("fr-FR", { weekday: "short" }).replace(/\./g, "").toUpperCase().slice(0, 3) + ".";
      const dayNum = firstDate.getDate();
      const fullDateStr = firstDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      const dateKey = `${firstDate.getFullYear()}-${String(firstDate.getMonth() + 1).padStart(2, '0')}-${String(firstDate.getDate()).padStart(2, '0')}`;

      const slots = hourlyByDay.get(dateKey) || [];

      // Températures Min et Max officielles
      const tMin = (dItem.T && dItem.T.min != null) ? Math.round(dItem.T.min) : 0;
      const tMax = (dItem.T && dItem.T.max != null) ? Math.round(dItem.T.max) : 0;

      // Picto et description officiels
      const w12 = dItem.weather12H || {};
      let dayIconRaw = w12.icon || "p1j";
      let dayDesc = w12.desc || "Ensoleillé";

      // Prise en compte de la dissipation du brouillard / brume matinale l'après-midi
      // (conforme à l'affichage officiel de meteofrance.com)
      const isMorningFog = dayIconRaw.startsWith("p7") || dayIconRaw.startsWith("p6") || dayIconRaw.startsWith("p8") || dayDesc.toLowerCase().includes("brouillard");
      if (isMorningFog) {
        let aftSlot = null;
        let eveSlot = null;
        slots.forEach(({ d, slot }) => {
          const h = d.getHours();
          if (h >= 12 && h <= 16 && !aftSlot) aftSlot = slot;
          if (h >= 17 && h <= 21 && !eveSlot) eveSlot = slot;
        });
        const aftIcon = (aftSlot && aftSlot.weather && aftSlot.weather.icon) ? aftSlot.weather.icon : "";
        const eveIcon = (eveSlot && eveSlot.weather && eveSlot.weather.icon) ? eveSlot.weather.icon : "";

        if (aftIcon.startsWith("p1") && tMax >= 18) {
          dayIconRaw = "p1j";
          dayDesc = "Ensoleillé";
        } else if ((aftIcon.startsWith("p1") || eveIcon.startsWith("p1")) && tMax >= 14) {
          dayIconRaw = "p5j";
          dayDesc = "Soleil et brumes matinales";
        } else if (aftIcon.startsWith("p2") || eveIcon.startsWith("p1") || eveIcon.startsWith("p2") || dayIdx >= 9) {
          dayIconRaw = "p2j";
          dayDesc = "Éclaircies";
        }
      }

      const dayIcon = getMfPictoHtml(dayIconRaw, false, dayDesc);

      // Calcul vent représentatif et rafales maximales
      let maxWind = 0;
      let maxGust = 0;
      slots.forEach(({ slot }) => {
        const w = slot.wind ? Math.round((slot.wind.speed || 0) * 3.6) : 0;
        const g = slot.wind ? Math.round((slot.wind.gust || 0) * 3.6) : 0;
        if (w > maxWind) maxWind = w;
        if (g > maxGust) maxGust = g;
      });

      const dayWind = maxWind < 8 ? 5 : (maxWind < 13 ? 10 : (maxWind || 10));
      const dayGustBadge = maxGust >= 40 ? `<span class="mf-day-pill-gust" title="Rafales maximales : ${maxGust} km/h">${maxGust}</span>` : "";

      // 4 Périodes : Matin (8h), Après-midi (14h), Soirée (20h), Nuit (2h)
      function getPeriodData(targetHour, isNight) {
        if (!slots || slots.length === 0) {
          return {
            desc: dayDesc,
            icon: getMfPictoHtml(dayIconRaw, isNight, dayDesc),
            temp: isNight ? tMin : tMax,
            wind: dayWind,
            windArrow: "▲"
          };
        }
        let closest = slots[0];
        let minDiff = 999;
        slots.forEach(item => {
          const diff = Math.abs(item.d.getHours() - targetHour);
          if (diff < minDiff) {
            minDiff = diff;
            closest = item;
          }
        });
        const s = closest.slot;
        const sDesc = (s.weather && s.weather.desc) ? s.weather.desc : dayDesc;
        const sIconRaw = (s.weather && s.weather.icon) ? s.weather.icon : dayIconRaw;
        const sTemp = (s.T && s.T.value != null) ? Math.round(s.T.value) : (isNight ? tMin : tMax);
        const sWind = s.wind ? Math.round((s.wind.speed || 0) * 3.6) : dayWind;
        const sDir = s.wind ? (s.wind.direction || 0) : 0;
        return {
          desc: sDesc,
          icon: getMfPictoHtml(sIconRaw, isNight, sDesc),
          temp: sTemp,
          wind: sWind,
          windArrow: getMeteocielWindArrow(sDir)
        };
      }

      const nowHour = new Date().getHours();
      const isNightNow = nowHour < 7 || nowHour >= 21;
      const currentPeriodSlot = getPeriodData(nowHour, isNightNow);

      const dayItem = {
        dayIdx,
        fullDateStr,
        dayNameShort,
        dayNum,
        tMin,
        tMax,
        dayIcon,
        dayWind,
        dayGustBadge,
        currentSlot: currentPeriodSlot,
        matin: getPeriodData(8, false),
        apresMidi: getPeriodData(14, false),
        soiree: getPeriodData(20, true),
        nuit: getPeriodData(2, true)
      };

      mfDaysForecastData.push(dayItem);

      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = `mf-day-pill ${dayIdx === 0 ? "active" : ""}`;
      pill.dataset.dayIndex = dayIdx;
      pill.innerHTML = `
        <span class="mf-day-pill-name">${dayItem.dayNameShort} ${dayItem.dayNum}</span>
        <span class="mf-day-pill-icon">${dayItem.dayIcon}</span>
        <div class="mf-day-pill-temps">
          <span class="mf-day-tmin">${dayItem.tMin}°</span>
          <span class="mf-day-tmax">${dayItem.tMax}°</span>
        </div>
        <span class="mf-day-pill-wind">${dayItem.dayWind} km/h${dayItem.dayGustBadge}</span>
      `;

      pill.addEventListener("click", () => {
        daysSelectorBar.querySelectorAll(".mf-day-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        showMfDayDetail(dayIdx);
      });

      daysSelectorBar.appendChild(pill);
    });

    if (mfDaysForecastData.length > 0) {
      showMfDayDetail(0);
    }
  }

  function renderAromeTimeline(data) {
    if (mfOfficialDataCache && Array.isArray(mfOfficialDataCache.daily_forecast) && mfOfficialDataCache.daily_forecast.length > 0) {
      renderOfficialMfTimeline(mfOfficialDataCache);
      return;
    }
    const masterData = (mfDataCache && mfDataCache.hourly && mfDataCache.hourly.time && mfDataCache.hourly.time.length >= 24)
      ? mfDataCache
      : ((data && data.hourly && data.hourly.time) ? data : (aromeDataCache || weatherDataCache));

    if (!masterData || !masterData.hourly || !masterData.hourly.time) return;
    const hourly = masterData.hourly;
    const daily = masterData.daily || {};

    const daysSelectorBar = document.getElementById("mfDaysSelectorBar");
    if (!daysSelectorBar) return;
    daysSelectorBar.innerHTML = "";

    // Modèle AROME haute résolution (pour les 42 premières heures)
    const aromeH = (aromeDataCache && aromeDataCache.hourly) ? aromeDataCache.hourly : null;
    const aromeTimes = aromeH && Array.isArray(aromeH.time) ? aromeH.time : [];

    // 1. Grouper les données horaires par date calendrier
    const daysMap = new Map();
    for (let i = 0; i < hourly.time.length; i++) {
      const timeStr = hourly.time[i];
      const d = new Date(timeStr);
      const dateKey = String(timeStr).split("T")[0]; // YYYY-MM-DD local

      if (!daysMap.has(dateKey)) {
        daysMap.set(dateKey, []);
      }

      // Priorité absolue aux prévisions officielles Météo-France (Seamless AROME+ARPEGE ou AROME HD)
      const hasMasterVal = hourly.temperature_2m && hourly.temperature_2m[i] != null;
      const aromeIdx = aromeTimes.indexOf(timeStr);
      const useArome = !hasMasterVal && aromeIdx !== -1 && aromeH.temperature_2m && aromeH.temperature_2m[aromeIdx] != null;
      const srcHourly = useArome ? aromeH : hourly;
      const srcIdx = useArome ? aromeIdx : i;

      daysMap.get(dateKey).push({
        date: d,
        hour: d.getHours(),
        temp: Math.round(srcHourly.temperature_2m ? srcHourly.temperature_2m[srcIdx] : 0),
        code: (srcHourly.weather_code && srcHourly.weather_code[srcIdx] != null) ? srcHourly.weather_code[srcIdx] : 0,
        wind: Math.round(srcHourly.wind_speed_10m ? srcHourly.wind_speed_10m[srcIdx] : 0),
        windDir: srcHourly.wind_direction_10m ? srcHourly.wind_direction_10m[srcIdx] : 0,
        precip: srcHourly.precipitation ? srcHourly.precipitation[srcIdx] : 0,
        snow: srcHourly.snowfall ? srcHourly.snowfall[srcIdx] : 0
      });
    }

    mfDaysForecastData = [];
    const dateKeys = Array.from(daysMap.keys()).slice(0, 15);

    dateKeys.forEach((dateKey, dayIdx) => {
      const slots = daysMap.get(dateKey);
      if (!slots || slots.length === 0) return;

      const firstDate = slots[0].date;
      const dayNameShort = firstDate.toLocaleDateString("fr-FR", { weekday: "short" });
      const dayNum = firstDate.getDate();
      const fullDateStr = firstDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

      // Trouver le créneau le plus proche pour chacune des 4 périodes
      function getClosestSlot(targetHour) {
        let closest = slots[0];
        let minDiff = 999;
        slots.forEach(s => {
          const diff = Math.abs(s.hour - targetHour);
          if (diff < minDiff) {
            minDiff = diff;
            closest = s;
          }
        });
        return closest;
      }

      const sMatin = getClosestSlot(8);
      const sApresMidi = getClosestSlot(14);
      const sSoiree = getClosestSlot(20);
      const sNuit = getClosestSlot(2);

      const wmoMatin = decodeWMO(sMatin.code, false);
      const wmoApresMidi = decodeWMO(sApresMidi.code, false);
      const wmoSoiree = decodeWMO(sSoiree.code, true);
      const wmoNuit = decodeWMO(sNuit.code, true);

      // Températures Min et Max du jour
      let tMin = daily.temperature_2m_min && daily.temperature_2m_min[dayIdx] != null
        ? Math.round(daily.temperature_2m_min[dayIdx])
        : Math.min(...slots.map(s => s.temp));
      let tMax = daily.temperature_2m_max && daily.temperature_2m_max[dayIdx] != null
        ? Math.round(daily.temperature_2m_max[dayIdx])
        : Math.max(...slots.map(s => s.temp));

      // Code météo du jour
      const dayCode = daily.weather_code && daily.weather_code[dayIdx] != null
        ? daily.weather_code[dayIdx]
        : sApresMidi.code;
      const dayWmo = decodeWMO(dayCode, false);

      // Vent moyen du jour
      const dayWind = sApresMidi.wind || 10;

      // Indice de confiance officiel : 4/5 pour J à J+3, 3/5 pour J+4 à J+7, 2/5 pour J+8 à J+14
      let confidence = "4/5";
      if (dayIdx >= 3 && dayIdx <= 7) confidence = "3/5";
      else if (dayIdx > 7) confidence = "2/5";

      const dayItem = {
        dayIdx,
        fullDateStr,
        dayNameShort: dayNameShort.replace(/\./g, "").toUpperCase().slice(0, 3) + ".",
        dayNum,
        tMin,
        tMax,
        dayIcon: getMfPictoHtml(dayCode, false, dayWmo.desc),
        dayWind,
        confidence,
        matin: {
          desc: wmoMatin.desc,
          icon: getMfPictoHtml(sMatin.code, false, wmoMatin.desc),
          temp: sMatin.temp,
          wind: sMatin.wind,
          windArrow: getMeteocielWindArrow(sMatin.windDir)
        },
        apresMidi: {
          desc: wmoApresMidi.desc,
          icon: getMfPictoHtml(sApresMidi.code, false, wmoApresMidi.desc),
          temp: sApresMidi.temp,
          wind: sApresMidi.wind,
          windArrow: getMeteocielWindArrow(sApresMidi.windDir)
        },
        soiree: {
          desc: wmoSoiree.desc,
          icon: getMfPictoHtml(sSoiree.code, true, wmoSoiree.desc),
          temp: sSoiree.temp,
          wind: sSoiree.wind,
          windArrow: getMeteocielWindArrow(sSoiree.windDir)
        },
        nuit: {
          desc: wmoNuit.desc,
          icon: getMfPictoHtml(sNuit.code, true, wmoNuit.desc),
          temp: sNuit.temp,
          wind: sNuit.wind,
          windArrow: getMeteocielWindArrow(sNuit.windDir)
        }
      };

      mfDaysForecastData.push(dayItem);

      // Création de la pilule de sélection du jour
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = `mf-day-pill ${dayIdx === 0 ? "active" : ""}`;
      pill.dataset.dayIndex = dayIdx;
      pill.innerHTML = `
        <span class="mf-day-pill-name">${dayItem.dayNameShort} ${dayItem.dayNum}</span>
        <span class="mf-day-pill-icon">${dayItem.dayIcon}</span>
        <div class="mf-day-pill-temps">
          <span class="mf-day-tmin">${dayItem.tMin}°</span>
          <span class="mf-day-tmax">${dayItem.tMax}°</span>
        </div>
        <span class="mf-day-pill-wind">${dayItem.dayWind} km/h</span>
      `;

      pill.addEventListener("click", () => {
        daysSelectorBar.querySelectorAll(".mf-day-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        showMfDayDetail(dayIdx);
      });

      daysSelectorBar.appendChild(pill);
    });

    // Afficher le détail du premier jour par défaut
    if (mfDaysForecastData.length > 0) {
      showMfDayDetail(0);
    }
  }

  // ========================================================
  // GRAPHIQUE CANVAS AUTONOME HAUTE PERFORMANCE
  // ========================================================
  function drawAromeChart(data) {
    if (!data || !data.hourly) return;
    const canvas = aromeChartCanvas;
    const ctx = canvas.getContext("2d");

    // Adapter la résolution retina
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = (rect.width || 800) * dpr;
    canvas.height = 260 * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width || 800;
    const height = 260;

    const hourly = data.hourly;
    const steps = Math.min(36, hourly.time.length);
    if (steps < 2) return;

    // Déterminer min/max températures
    let minT = 999;
    let maxT = -999;
    let maxGust = 0;
    let maxPrecip = 0.5;

    for (let i = 0; i < steps; i++) {
      const t = hourly.temperature_2m[i] || 0;
      if (t < minT) minT = t;
      if (t > maxT) maxT = t;

      const g = hourly.wind_gusts_10m ? hourly.wind_gusts_10m[i] || 0 : 0;
      if (g > maxGust) maxGust = g;

      const p = hourly.precipitation ? hourly.precipitation[i] || 0 : 0;
      if (p > maxPrecip) maxPrecip = p;
    }

    minT = Math.floor(minT) - 2;
    maxT = Math.ceil(maxT) + 2;

    const padLeft = 40;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 40;
    const graphW = width - padLeft - padRight;
    const graphH = height - padTop - padBottom;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Ligne de gel 0°C (si dans la plage)
    if (minT <= 0 && maxT >= 0) {
      const zeroY = padTop + graphH - ((0 - minT) / (maxT - minT)) * graphH;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padLeft, zeroY);
      ctx.lineTo(width - padRight, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "10px sans-serif";
      ctx.fillText("0°C", 10, zeroY + 3);
    }

    // Tracer les barres de précipitations
    const barWidth = Math.max(4, (graphW / steps) * 0.4);
    for (let i = 0; i < steps; i++) {
      const p = hourly.precipitation ? hourly.precipitation[i] || 0 : 0;
      const s = hourly.snowfall ? hourly.snowfall[i] || 0 : 0;
      const x = padLeft + (i / (steps - 1)) * graphW;

      if (p > 0 || s > 0) {
        const barH = Math.min(graphH, (p / maxPrecip) * (graphH * 0.5));
        ctx.fillStyle = s > 0 ? "rgba(192, 132, 252, 0.7)" : "rgba(2, 132, 199, 0.7)";
        ctx.fillRect(x - barWidth / 2, padTop + graphH - barH, barWidth, barH);
      }
    }

    // Tracer la courbe de température
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < steps; i++) {
      const t = hourly.temperature_2m[i] || 0;
      const x = padLeft + (i / (steps - 1)) * graphW;
      const y = padTop + graphH - ((t - minT) / (maxT - minT)) * graphH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Tracer les points et étiquettes heures
    ctx.font = "10px sans-serif";
    for (let i = 0; i < steps; i += 3) {
      const t = hourly.temperature_2m[i] || 0;
      const x = padLeft + (i / (steps - 1)) * graphW;
      const y = padTop + graphH - ((t - minT) / (maxT - minT)) * graphH;

      // Point
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Texte température
      ctx.fillStyle = "#f1f5f9";
      ctx.fillText(`${Math.round(t)}°`, x - 8, y - 8);

      // Heure en bas
      const d = new Date(hourly.time[i]);
      const hourStr = d.getHours() + "h";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(hourStr, x - 8, height - 12);
    }
  }

  // ========================================================
  // SYMBOLES VECTORIELS OFFICIELS YR.NO (CANVAS HD)
  // Reproduction des icônes météo vectorielles de Yr.no
  // ========================================================
  function drawYrnoSun(ctx, cx, cy) {
    const r = 7;
    // Disque solaire doré vif
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Rayons dorés
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    for (let a = 0; a < 8; a++) {
      const angle = (a * Math.PI) / 4;
      const x1 = cx + Math.cos(angle) * (r + 2.5);
      const y1 = cy + Math.sin(angle) * (r + 2.5);
      const x2 = cx + Math.cos(angle) * (r + 6);
      const y2 = cy + Math.sin(angle) * (r + 6);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  function drawYrnoMoon(ctx, cx, cy) {
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(cx, cy, 7.5, 0.4, Math.PI * 1.5, false);
    ctx.bezierCurveTo(cx - 1, cy - 3.5, cx - 1, cy + 3.5, cx + Math.cos(0.4) * 7.5, cy + Math.sin(0.4) * 7.5);
    ctx.closePath();
    ctx.fill();
  }

  function drawYrnoCloud(ctx, cx, cy, fill = "#cbd5e1", stroke = "#94a3b8") {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.arc(cx - 7, cy + 2, 4.5, Math.PI * 0.7, Math.PI * 1.6);
    ctx.arc(cx - 1, cy - 3, 6.5, Math.PI * 1.0, Math.PI * 1.95);
    ctx.arc(cx + 6, cy + 1, 5, Math.PI * 1.5, Math.PI * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawYrnoSunCloud(ctx, cx, cy) {
    // Soleil en arrière-plan décalé en haut à droite
    ctx.save();
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(cx + 4, cy - 4, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    [-0.3, 0.1, 0.5, 0.9].forEach(ang => {
      const a = ang - Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(cx + 4 + Math.cos(a) * 7.5, cy - 4 + Math.sin(a) * 7.5);
      ctx.lineTo(cx + 4 + Math.cos(a) * 10.5, cy - 4 + Math.sin(a) * 10.5);
      ctx.stroke();
    });
    ctx.restore();

    // Nuage au premier plan
    drawYrnoCloud(ctx, cx - 2, cy + 2, "#e2e8f0", "#94a3b8");
  }

  function drawYrnoMoonCloud(ctx, cx, cy) {
    ctx.save();
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(cx + 4, cy - 4, 5.5, 0.4, Math.PI * 1.5, false);
    ctx.bezierCurveTo(cx + 3, cy - 7, cx + 3, cy - 1, cx + 4 + Math.cos(0.4) * 5.5, cy - 4 + Math.sin(0.4) * 5.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    drawYrnoCloud(ctx, cx - 2, cy + 2, "#e2e8f0", "#94a3b8");
  }

  function drawYrnoRain(ctx, cx, cy, drops = 2) {
    drawYrnoCloud(ctx, cx, cy - 2, "#94a3b8", "#64748b");
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    const offsets = drops === 2 ? [-3, 3] : [-5, 0, 5];
    offsets.forEach(dx => {
      ctx.beginPath();
      ctx.moveTo(cx + dx, cy + 7);
      ctx.lineTo(cx + dx - 2, cy + 13);
      ctx.stroke();
    });
  }

  function drawYrnoSnow(ctx, cx, cy) {
    drawYrnoCloud(ctx, cx, cy - 2, "#94a3b8", "#64748b");
    ctx.fillStyle = "#0284c7";
    [-4, 0, 4].forEach((dx, idx) => {
      ctx.beginPath();
      ctx.arc(cx + dx, cy + 8 + (idx % 2 === 0 ? 0 : 3), 1.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawYrnoThunder(ctx, cx, cy) {
    drawYrnoCloud(ctx, cx, cy - 2, "#475569", "#334155");
    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.moveTo(cx - 1, cy + 5);
    ctx.lineTo(cx - 4, cy + 10);
    ctx.lineTo(cx - 1, cy + 10);
    ctx.lineTo(cx - 3, cy + 15);
    ctx.lineTo(cx + 2, cy + 9);
    ctx.lineTo(cx - 1, cy + 9);
    ctx.closePath();
    ctx.fill();
  }

  function drawYrnoFog(ctx, cx, cy) {
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    [-3, 1, 5].forEach((dy, i) => {
      const w = i === 1 ? 14 : 10;
      ctx.beginPath();
      ctx.moveTo(cx - w / 2, cy + dy);
      ctx.lineTo(cx + w / 2, cy + dy);
      ctx.stroke();
    });
  }

  function drawYrnoIcon(ctx, code, isNight, cx, cy) {
    ctx.save();
    if (code === 0) {
      if (isNight) drawYrnoMoon(ctx, cx, cy);
      else drawYrnoSun(ctx, cx, cy);
    } else if (code === 1 || code === 2) {
      if (isNight) drawYrnoMoonCloud(ctx, cx, cy);
      else drawYrnoSunCloud(ctx, cx, cy);
    } else if (code === 3) {
      drawYrnoCloud(ctx, cx, cy, "#cbd5e1", "#94a3b8");
    } else if (code === 45 || code === 48) {
      drawYrnoFog(ctx, cx, cy);
    } else if (code === 51 || code === 53 || code === 55 || code === 61 || code === 80) {
      drawYrnoRain(ctx, cx, cy, 2);
    } else if (code === 63 || code === 65 || code === 81 || code === 82) {
      drawYrnoRain(ctx, cx, cy, 3);
    } else if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86) {
      drawYrnoSnow(ctx, cx, cy);
    } else if (code >= 95) {
      drawYrnoThunder(ctx, cx, cy);
    } else {
      drawYrnoSunCloud(ctx, cx, cy);
    }
    ctx.restore();
  }

  // Fonctions de lissage Catmull-Rom pour les courbes T° et Vent
  function drawCatmullRomSpline(ctx, points) {
    if (!points || points.length === 0) return;
    if (points.length === 1) {
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, 3, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
    ctx.stroke();
  }

  function fillSplineArea(ctx, points, baselineY, gradientFill) {
    if (!points || points.length < 2) return;
    ctx.save();
    ctx.fillStyle = gradientFill;
    ctx.beginPath();
    ctx.moveTo(points[0].x, baselineY);
    ctx.lineTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
    ctx.lineTo(points[points.length - 1].x, baselineY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ========================================================
  // MÉTÉOGRAMME OFFICIEL YR.NO (HAUTE QUALITÉ VISUELLE)
  // Reproduction conforme pixel par pixel du site officiel Yr.no :
  // - En-tête : Noms des jours avec séparateurs + heures toutes les 2h
  // - Bandeau : Symboles météo vectoriels précis
  // - Panneau Supérieur : T° rouge intense avec dégradé + barres pluie bleues avec valeurs
  // - Panneau Inférieur : Vent violet avec dégradé + flèches vectorielles précises
  // ========================================================
  function drawYrnoMeteogram(data) {
    try {
      if (!data || !data.hourly || !data.hourly.time) return;
      const canvas = yrCanvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const hourly = data.hourly;
      const timeLen = Array.isArray(hourly.time) ? hourly.time.length : 0;
      let validHours = timeLen;
      if (Array.isArray(hourly.temperature_2m)) {
        let i = 0;
        while (i < hourly.temperature_2m.length && hourly.temperature_2m[i] !== null && hourly.temperature_2m[i] !== undefined) {
          i++;
        }
        if (i > 0) validHours = Math.min(validHours, i);
      }

      // Exactement 48 heures (2 jours complets pour la lisibilité et l'espacement parfait de Yr.no)
      const totalHours = Math.min(48, validHours);
      if (totalHours < 4) return;

      const dpr = Math.max(2, window.devicePixelRatio || 1);
      const scrollWrapper = yrCanvas.parentElement;
      const availableW = scrollWrapper ? scrollWrapper.clientWidth : 960;
      const minSlotW = 24; // Espacement minimal de 24px par heure (conforme à l'officiel Yr.no)
      const padLeft = 52; // Pour l'axe T° et l'axe Vent
      const padRight = 48; // Pour l'axe Pluie
      // Étalement fluide sur grands écrans pour occuper toute la largeur si besoin
      const slotW = Math.max(minSlotW, (availableW - padLeft - padRight) / totalHours);
      const innerW = totalHours * slotW;
      const totalW = Math.round(padLeft + innerW + padRight);
      const totalH = 348;

      yrnoMeteogramMeta = {
        data,
        totalHours,
        padLeft,
        padRight,
        slotW,
        totalW,
        totalH
      };

      canvas.width = totalW * dpr;
      canvas.height = totalH * dpr;
      canvas.style.width = `${totalW}px`;
      canvas.style.height = `${totalH}px`;
      ctx.scale(dpr, dpr);

      // Fond blanc pur Yr.no
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, totalW, totalH);

      // Repères verticaux des panneaux
      const topPanelY0 = 76;
      const topPanelY1 = 208;
      const topPanelH = topPanelY1 - topPanelY0;

      const botPanelY0 = 240;
      const botPanelY1 = 300;
      const botPanelH = botPanelY1 - botPanelY0;

      // Calcul des échelles
      let minT = 999;
      let maxT = -999;
      let maxP = 8;
      let observedMaxW = 0;

      for (let i = 0; i < totalHours; i++) {
        const rawT = hourly.temperature_2m ? hourly.temperature_2m[i] : null;
        if (rawT !== null && rawT !== undefined) {
          const t = Number(rawT);
          if (!isNaN(t)) {
            if (t < minT) minT = t;
            if (t > maxT) maxT = t;
          }
        }

        const rawP = hourly.precipitation ? hourly.precipitation[i] : null;
        if (rawP !== null && rawP !== undefined) {
          const p = Number(rawP);
          if (!isNaN(p) && p > maxP) maxP = Math.ceil(p + 1);
        }

        const rawWind = hourly.wind_speed_10m ? hourly.wind_speed_10m[i] : null;
        if (rawWind !== null && rawWind !== undefined) {
          const numWind = Number(rawWind);
          if (!isNaN(numWind)) {
            const w = numWind;
            if (w > observedMaxW) observedMaxW = w;
          }
        }
      }

      if (minT === 999) minT = 0;
      if (maxT === -999) maxT = 10;
      if (minT >= maxT) maxT = minT + 4;

      const scaleMinT = Math.floor(minT / 4) * 4;
      const scaleMaxT = Math.max(scaleMinT + 12, Math.ceil(maxT / 4) * 4);
      const rangeT = (scaleMaxT - scaleMinT) || 1;

      const scaleMaxP = Math.max(8, Math.ceil(maxP / 2) * 2);

      // Échelle aérée et très lisible du vent (maximum 3 graduations : 0, médiane, max)
      let scaleMaxW = 10;
      let stepW = 5; // 0, 5, 10 km/h

      if (observedMaxW <= 10) {
        scaleMaxW = 10;
        stepW = 5; // 0, 5, 10
      } else if (observedMaxW <= 20) {
        scaleMaxW = 20;
        stepW = 10; // 0, 10, 20
      } else if (observedMaxW <= 30) {
        scaleMaxW = 30;
        stepW = 15; // 0, 15, 30
      } else if (observedMaxW <= 50) {
        scaleMaxW = Math.ceil((observedMaxW + 2) / 10) * 10;
        stepW = Math.round(scaleMaxW / 2); // 0, mid, max
      } else {
        scaleMaxW = Math.ceil((observedMaxW + 5) / 20) * 20;
        stepW = Math.round(scaleMaxW / 2); // 0, mid, max
      }

      function getX(i) {
        return padLeft + i * slotW;
      }

      function getYTemp(t) {
        const val = (t !== null && t !== undefined && !isNaN(t)) ? Number(t) : scaleMinT;
        return topPanelY1 - ((val - scaleMinT) / rangeT) * topPanelH;
      }

      function getYRain(p) {
        const val = (p !== null && p !== undefined && !isNaN(p)) ? Number(p) : 0;
        return topPanelY1 - (Math.min(scaleMaxP, Math.max(0, val)) / scaleMaxP) * topPanelH;
      }

      function getYWind(w) {
        const val = (w !== null && w !== undefined && !isNaN(w)) ? Number(w) : 0;
        return botPanelY1 - (Math.min(scaleMaxW, Math.max(0, val)) / scaleMaxW) * botPanelH;
      }

      // 1. Lignes horizontales et Axes
      // Détection de l'heure courante pour la surbrillance (façon Météociel)
      const nowMs = Date.now();
      let currentHourIdx = -1;
      let minDiffMs = Infinity;
      for (let i = 0; i < totalHours; i++) {
        const diff = Math.abs(new Date(hourly.time[i]).getTime() - nowMs);
        if (diff < minDiffMs) {
          minDiffMs = diff;
          currentHourIdx = i;
        }
      }

      // Surbrillance verticale de l'heure actuelle sur le graph Yr.no
      if (currentHourIdx >= 0 && currentHourIdx < totalHours) {
        const curX = getX(currentHourIdx);
        // Bande bleue translucide
        ctx.fillStyle = "rgba(2, 132, 199, 0.08)";
        ctx.fillRect(curX - slotW / 2, 40, slotW, botPanelY1 - 40);

        // Ligne verticale pointillée de repère
        ctx.strokeStyle = "rgba(2, 132, 199, 0.85)";
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(curX, 40);
        ctx.lineTo(curX, botPanelY1);
        ctx.stroke();
        ctx.setLineDash([]);

        // Pastille repère sur la ligne des 40px
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.arc(curX, 40, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Panneau Supérieur : Grille T° et Pluie ---
      for (let tVal = scaleMinT; tVal <= scaleMaxT; tVal += 4) {
        const y = Math.round(getYTemp(tVal)) + 0.5;

        ctx.strokeStyle = tVal === 0 ? "#64748b" : "#e2e8f0";
        ctx.lineWidth = tVal === 0 ? 1.2 : 0.9;
        if (tVal === 0) {
          ctx.setLineDash([4, 2]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(totalW - padRight, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels Température à gauche
        ctx.fillStyle = tVal === 0 ? "#0284c7" : "#475569";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.font = tVal === 0 ? "bold 11px system-ui, -apple-system, sans-serif" : "11px system-ui, -apple-system, sans-serif";
        ctx.fillText(`${tVal}°`, padLeft - 8, y);
      }

      // Icône Thermomètre en haut de l'axe T° (au-dessus du chiffre max, parfaitement dégagée)
      ctx.fillStyle = "#334155";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.font = "14px sans-serif";
      ctx.fillText("🌡️", padLeft - 8, topPanelY0 - 15);

      // Labels Pluie à droite (Bleu officiel Yr.no)
      const pStep = scaleMaxP <= 10 ? 2 : 4;
      for (let pVal = 0; pVal <= scaleMaxP; pVal += pStep) {
        const y = Math.round(getYRain(pVal)) + 0.5;
        ctx.fillStyle = "#0284c7";
        ctx.textAlign = "left";
        ctx.font = "11px system-ui, -apple-system, sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillText(pVal.toString(), totalW - padRight + 8, y);
      }

      // Icône Parapluie en haut de l'axe Pluie (au-dessus du chiffre max, parfaitement dégagée)
      ctx.fillStyle = "#0284c7";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = "13px sans-serif";
      ctx.fillText("☂️", totalW - padRight + 8, topPanelY0 - 15);

      // --- Panneau Inférieur : Grille Vent ---
      for (let wVal = 0; wVal <= scaleMaxW; wVal += stepW) {
        const y = Math.round(getYWind(wVal)) + 0.5;

        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(totalW - padRight, y);
        ctx.stroke();

        ctx.fillStyle = "#7c3aed";
        ctx.textAlign = "right";
        ctx.font = "11px system-ui, -apple-system, sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillText(wVal.toString(), padLeft - 8, y);
      }

      // Icône Vent à gauche au-dessus de l'axe
      ctx.fillStyle = "#7c3aed";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.font = "12px sans-serif";
      ctx.fillText("💨", padLeft - 8, botPanelY0 - 14);

      // 2. Grille verticale & En-têtes des jours (Timeline)
      let prevDay = -1;
      const dayPositions = [];
      for (let i = 0; i < totalHours; i++) {
        const d = new Date(hourly.time[i]);
        const dayNum = d.getDay();
        const hour = d.getHours();
        const x = getX(i);

        if (dayNum !== prevDay || i === 0) {
          prevDay = dayNum;
          dayPositions.push({ x, date: d, hourIndex: i });
        } else {
          // Lignes verticales de la grille (démarrent strictement à 40px, sous les chiffres des heures)
          ctx.strokeStyle = hour % 2 === 0 ? "#cbd5e1" : "#e2e8f0";
          ctx.lineWidth = hour % 2 === 0 ? 0.9 : 0.7;
          ctx.beginPath();
          ctx.moveTo(x, 40);
          ctx.lineTo(x, botPanelY1);
          ctx.stroke();
        }

        // Chiffre de l'heure avec mise en surbrillance de l'heure actuelle
        if (i === currentHourIdx) {
          const curLabel = String(hour).padStart(2, "0") + "h";
          const bW = 28;
          const bH = 17;
          ctx.fillStyle = "#0284c7";
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(x - bW / 2, 20, bW, bH, 4);
            ctx.fill();
          } else {
            ctx.fillRect(x - bW / 2, 20, bW, bH);
          }
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(curLabel, x, 28);
        } else if (hour % 2 === 0) {
          ctx.fillStyle = "#64748b";
          ctx.font = "11px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const hLabel = String(hour).padStart(2, "0");
          ctx.fillText(hLabel, x, 28);
        }
      }

      // DISTINCTION VISUELLE DOUCE ET ÉLÉGANTE ENTRE LES DIFFÉRENTS JOURS
      dayPositions.forEach((dp, idx) => {
        const nextDp = dayPositions[idx + 1];
        const startX = dp.x - slotW / 2;
        const endX = nextDp ? (nextDp.x - slotW / 2) : (totalW - padRight);
        const bandW = endX - startX;

        // Alternance de fond très douce et discrète pour un jour sur deux
        if (idx % 2 === 1) {
          ctx.fillStyle = "rgba(241, 245, 249, 0.42)";
          ctx.fillRect(startX, 40, bandW, botPanelY1 - 40);
        }

        // Séparateur vertical fin et discret entre les jours
        if (idx > 0) {
          ctx.strokeStyle = "rgba(203, 213, 225, 0.65)";
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(startX, 40);
          ctx.lineTo(startX, botPanelY1);
          ctx.stroke();
        }

        // Cartouche sobre pour le nom du jour en haut
        const dayName = dp.date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: bandW < 80 ? undefined : "short" });
        const formattedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        const badgeW = Math.min(bandW - 10, 84);

        if (badgeW >= 38) {
          ctx.fillStyle = idx % 2 === 0 ? "rgba(241, 245, 249, 0.85)" : "rgba(226, 232, 240, 0.85)";
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(startX + 6, 2, badgeW, 16, 4);
            ctx.fill();
          } else {
            ctx.fillRect(startX + 6, 2, badgeW, 16);
          }
          ctx.fillStyle = "#334155";
          ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(formattedDay, startX + 6 + badgeW / 2, 10);
        }
      });

      // Ligne horizontale sous les heures pour séparer proprement la timeline
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(padLeft, 40);
      ctx.lineTo(totalW - padRight, 40);
      ctx.stroke();

      // 3. Barres de Précipitations (Bleu officiel Yr.no #0284c7)
      const barWidth = 12;
      for (let i = 0; i < totalHours; i++) {
        const rawP = hourly.precipitation ? hourly.precipitation[i] : null;
        if (rawP !== null && rawP !== undefined) {
          const p = Number(rawP);
          if (!isNaN(p) && p > 0) {
            const x = getX(i) - barWidth / 2;
            const y = getYRain(p);
            const h = Math.max(2, topPanelY1 - y);
            ctx.fillStyle = "#0284c7";
            ctx.fillRect(x, y, barWidth, h);

            // Étiquette de valeur si > 0.2mm
            if (p >= 0.2) {
              ctx.fillStyle = "#0369a1";
              ctx.font = "bold 9px system-ui, -apple-system, sans-serif";
              ctx.textAlign = "center";
              ctx.textBaseline = "bottom";
              const pLabel = p >= 10 ? Math.round(p).toString() : p.toFixed(1);
              ctx.fillText(pLabel, getX(i), y - 2);
            }
          }
        }
      }

      // 4. Courbe rouge de Température (Smooth Spline + Gradient)
      const tPoints = [];
      for (let i = 0; i < totalHours; i++) {
        const rawT = hourly.temperature_2m ? hourly.temperature_2m[i] : null;
        if (rawT !== null && rawT !== undefined) {
          const t = Number(rawT);
          if (!isNaN(t)) {
            tPoints.push({ x: getX(i), y: getYTemp(t) });
          }
        }
      }

      if (tPoints.length > 1) {
        // Dégradé léger sous la courbe rouge
        const redGrad = ctx.createLinearGradient(0, topPanelY0, 0, topPanelY1);
        redGrad.addColorStop(0, "rgba(220, 38, 38, 0.08)");
        redGrad.addColorStop(1, "rgba(220, 38, 38, 0.0)");
        fillSplineArea(ctx, tPoints, topPanelY1, redGrad);

        // Ligne rouge franche Yr.no
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 2.6;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        drawCatmullRomSpline(ctx, tPoints);
      }

      // 5. Symboles Météo Vectoriels positionnés au niveau de la courbe de température (conforme screen 2 Yr.no)
      for (let i = 0; i < totalHours; i += 2) {
        const d = new Date(hourly.time[i]);
        const hour = d.getHours();
        const isNight = hour < 7 || hour >= 20;
        const code = (hourly.weather_code && hourly.weather_code[i] != null) ? hourly.weather_code[i] : 0;
        const x = getX(i);
        const rawT = hourly.temperature_2m ? hourly.temperature_2m[i] : null;
        const tY = (rawT !== null && rawT !== undefined && !isNaN(Number(rawT))) ? getYTemp(Number(rawT)) : 140;
        // Positionnement à ~20px au-dessus de la courbe de température, parfaitement dégagé
        const iconY = Math.max(48, Math.min(topPanelY1 - 18, Math.round(tY - 20)));
        drawYrnoIcon(ctx, code, isNight, x, iconY);
      }

      // 6. Séparateur horizontal entre les deux panneaux
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, 224);
      ctx.lineTo(totalW - padRight, 224);
      ctx.stroke();

      // 7. Courbe violette du Vent (Smooth Spline + Gradient)
      const wPoints = [];
      for (let i = 0; i < totalHours; i++) {
        const rawWind = hourly.wind_speed_10m ? hourly.wind_speed_10m[i] : null;
        if (rawWind !== null && rawWind !== undefined) {
          const numWind = Number(rawWind);
          if (!isNaN(numWind)) {
            wPoints.push({ x: getX(i), y: getYWind(numWind) });
          }
        }
      }

      if (wPoints.length > 1) {
        const purpleGrad = ctx.createLinearGradient(0, botPanelY0, 0, botPanelY1);
        purpleGrad.addColorStop(0, "rgba(124, 58, 237, 0.08)");
        purpleGrad.addColorStop(1, "rgba(124, 58, 237, 0.0)");
        fillSplineArea(ctx, wPoints, botPanelY1, purpleGrad);

        ctx.strokeStyle = "#7c3aed";
        ctx.lineWidth = 2.0;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        drawCatmullRomSpline(ctx, wPoints);
      }

      // 8. Flèches vectorielles de direction du vent & valeurs (y = 318 et 333)
      const arrowY = 318;
      const speedY = 333;

      for (let i = 0; i < totalHours; i += 2) {
        const dir = (hourly.wind_direction_10m && hourly.wind_direction_10m[i] != null) ? hourly.wind_direction_10m[i] : null;
        const spd = (hourly.wind_speed_10m && hourly.wind_speed_10m[i] != null) ? hourly.wind_speed_10m[i] : null;
        const x = getX(i);

        if (dir !== null && dir !== undefined) {
          ctx.save();
          ctx.translate(x, arrowY);
          // Direction météorologique officielle Yr.no (sens où souffle le vent)
          ctx.rotate(((dir + 180) % 360) * Math.PI / 180);
          ctx.strokeStyle = "#334155";
          ctx.lineWidth = 1.6;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          ctx.moveTo(0, -6);
          ctx.lineTo(0, 6);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-3, 2);
          ctx.lineTo(0, 6);
          ctx.lineTo(3, 2);
          ctx.stroke();
          ctx.restore();
        }

        if (spd !== null && spd !== undefined) {
          const val = Math.round(spd);
          ctx.fillStyle = "#475569";
          ctx.font = "10px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(val.toString(), x, speedY);
        }
      }
    } catch (err) {
      console.error("Erreur lors du dessin du météogramme Yr.no :", err);
    } finally {
      if (yrCanvasLoading) yrCanvasLoading.style.display = "none";
    }
  }

  // ========================================================
  // AFFICHAGE ECMWF / YR.NO 7 JOURS
  // ========================================================
  function renderEcmwfDaily(data) {
    if (!dailyForecastGrid) return;
    const daily = data.daily;
    if (!daily || !daily.time) return;

    dailyForecastGrid.innerHTML = "";

    const daysCount = daily.time.length;
    for (let i = 0; i < daysCount; i++) {
      const dateStr = daily.time[i]; // "2026-10-19"
      const dateObj = new Date(dateStr + "T12:00:00");

      let dayName = dateObj.toLocaleDateString("fr-FR", { weekday: "short" });
      dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      if (i === 0) dayName = "Aujourd'hui";
      else if (i === 1) dayName = "Demain";

      const formattedDate = dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

      const wmo = decodeWMO(daily.weather_code ? daily.weather_code[i] : 0);
      const tMax = daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[i]) : 0;
      const tMin = daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[i]) : 0;
      const pSum = daily.precipitation_sum ? daily.precipitation_sum[i] : 0;
      const sSum = daily.snowfall_sum ? daily.snowfall_sum[i] : 0;
      const gustMax = daily.wind_gusts_10m_max ? Math.round(daily.wind_gusts_10m_max[i]) : 0;

      const card = document.createElement("div");
      card.className = "daily-card";
      card.innerHTML = `
        <span class="daily-day">${dayName}</span>
        <span class="daily-date">${formattedDate}</span>
        <span class="daily-icon" title="${wmo.desc}">${wmo.icon}</span>
        <div class="daily-temps">
          <span class="temp-max" title="Température Maximale">${tMax}°</span>
          <span class="temp-min" title="Température Minimale">${tMin}°</span>
        </div>
        <span class="daily-precip-sum">${pSum > 0 ? `💧 ${pSum.toFixed(1)} mm` : 'Sec'}</span>
        ${sSum > 0 ? `<span style="font-size:0.75rem; color:#c084fc;">❄️ +${Math.round(sSum)} cm</span>` : ''}
        <span class="daily-wind-max">Raf. ${gustMax} km/h</span>
      `;

      dailyForecastGrid.appendChild(card);
    }
  }

  // ========================================================
  // CARTE INTERACTIVE DU RÉSEAU ROMMA (OFFICIELLE & DIRECTE)
  // ========================================================
  function isNearAlps(lat, lon) {
    return typeof lat === "number" && typeof lon === "number" &&
           lat >= 43.8 && lat <= 46.8 && lon >= 4.8 && lon <= 7.8;
  }

  function isNearGieres(lat, lon) {
    // ~15 km autour de Saint-Martin-d'Hères (agglomération grenobloise) -> centrage par défaut sur SMH
    return Math.abs(lat - ROMMA_DEFAULT_CENTER.lat) < 0.14 && Math.abs(lon - ROMMA_DEFAULT_CENTER.lon) < 0.19;
  }

  // La carte de romma.fr a une taille FIXE (930 x 1216 px, cf. maps_new.css) : Leaflet centre
  // le lieu au milieu de cette zone, alors que l'iframe n'en montre que le coin haut-gauche.
  // On décale donc le centre envoyé dans le hash pour que le lieu tombe au milieu de la partie visible.
  const ROMMA_MAP_W = 930;
  const ROMMA_MAP_H = 1216;

  function buildRommaHash(lat, lon) {
    const visW = Math.min(ROMMA_MAP_W, (rommaMapIframe && rommaMapIframe.clientWidth) || ROMMA_MAP_W);
    const visH = Math.min(ROMMA_MAP_H, (rommaMapIframe && rommaMapIframe.clientHeight) || ROMMA_MAP_H);
    const dx = ROMMA_MAP_W / 2 - visW / 2; // décalage vers l'est (px)
    const dy = ROMMA_MAP_H / 2 - visH / 2; // décalage vers le sud (px)

    const scale = 256 * Math.pow(2, ROMMA_ZOOM);
    const x = (lon + 180) / 360 * scale + dx;
    const sinLat = Math.sin(lat * Math.PI / 180);
    const y = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale + dy;

    const cLon = x / scale * 360 - 180;
    const n = Math.PI - 2 * Math.PI * y / scale;
    const cLat = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    return `${ROMMA_ZOOM}/${cLat.toFixed(4)}/${cLon.toFixed(4)}`;
  }

  function updateRommaMap(loc, forceCenter = false) {
    if (!rommaMapIframe) return;

    const useLoc = loc && isNearAlps(loc.lat, loc.lon) && !isNearGieres(loc.lat, loc.lon);
    const target = useLoc ? { lat: loc.lat, lon: loc.lon } : ROMMA_DEFAULT_CENTER;
    const extHash = `${ROMMA_ZOOM}/${target.lat.toFixed(4)}/${target.lon.toFixed(4)}`;
    if (rommaExtLink) rommaExtLink.href = "https://www.romma.fr/#10.799999999999999/45.1245/5.7227";

    // Clé stable (lieu) : on ne recharge l'iframe que si le lieu change ou sur demande explicite,
    // pour te laisser déplacer librement la carte
    const key = extHash;
    rommaMapIframe.dataset.pendingKey = key;

    if (rommaMapIframe.offsetParent !== null) {
      if (forceCenter || rommaMapIframe.dataset.loadedKey !== key) {
        rommaMapIframe.dataset.loadedKey = key;
        rommaMapIframe.src = `https://www.romma.fr/map/carte.php#${buildRommaHash(target.lat, target.lon)}`;
      }
    } else if (forceCenter) {
      delete rommaMapIframe.dataset.loadedKey;
    }
  }


  // ========================================================
  // CARTE RADAR INTERACTIVE NATIVE (RADAR PLUIE & NUAGES)
  // Reproduction fidèle, fluide et 100% conforme à Météoblue officiel
  // ========================================================
  let radarMap = null;
  let radarMarker = null;
  let radarSlots = [];
  let radarLayersMap = new Map(); // path -> L.tileLayer
  let futureRadarLayer = null;
  let currentRadarIndex = 0;
  let radarPlayInterval = null;
  let radarTimeRangeHours = 3; // 3h par défaut selon la demande utilisateur
  let lastRadarLoadTime = 0;

  function syncRadarToCurrentTime() {
    if (!radarSlots || radarSlots.length === 0 || radarPlayInterval) return;
    const nowSec = Math.floor(Date.now() / 1000);
    let bestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < radarSlots.length; i++) {
      const diff = Math.abs(radarSlots[i].time - nowSec);
      if (diff < minDiff) {
        minDiff = diff;
        bestIdx = i;
      }
    }
    if (bestIdx !== currentRadarIndex) {
      showRadarSlot(bestIdx, false);
    }
  }

  async function initRadarMap() {
    const mapEl = document.getElementById("meteoblueRadarMap");
    if (!mapEl || typeof L === "undefined") return;

    if (!radarMap) {
      const initialLat = currentLocation && currentLocation.lat ? currentLocation.lat : 45.1885;
      const initialLon = currentLocation && currentLocation.lon ? currentLocation.lon : 5.7245;

      radarMap = L.map("meteoblueRadarMap", {
        center: [initialLat, initialLon],
        zoom: 9.5,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false
      });

      // Fond de carte Topographique / Relief alpin exclusif (conforme à Météoblue officiel, aucune carte sombre)
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
        zIndex: 1,
        attribution: false
      }).addTo(radarMap);

      // Marqueur cible circulaire lumineux sur la localisation
      const targetIcon = L.divIcon({
        className: "radar-target-dot",
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      radarMarker = L.marker([initialLat, initialLon], { icon: targetIcon, zIndexOffset: 1000 }).addTo(radarMap);

      setTimeout(() => {
        if (radarMap) radarMap.invalidateSize();
      }, 300);
    }

    // Charger les données radar RainViewer et initialiser la timeline
    await loadRadarData();

    // Configuration des écouteurs de contrôles et synchronisation de la fiche Météoblue
    setupRadarControls();
    if (currentLocation) updateMeteoblueHeaders(currentLocation);
  }

  function findClosestRadarFrame(frames, targetTs) {
    if (!frames || frames.length === 0) return null;
    let closest = frames[0];
    let minDiff = Math.abs(frames[0].time - targetTs);
    for (let i = 1; i < frames.length; i++) {
      const diff = Math.abs(frames[i].time - targetTs);
      if (diff < minDiff) {
        minDiff = diff;
        closest = frames[i];
      }
    }
    return closest;
  }

  function getForecastForTimestamp(timestampSec) {
    const data = aromeDataCache || weatherDataCache;
    if (!data || !data.hourly || !data.hourly.time) return null;
    const times = data.hourly.time;
    const targetMs = timestampSec * 1000;
    let bestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < times.length; i++) {
      const tMs = new Date(times[i]).getTime();
      const diff = Math.abs(tMs - targetMs);
      if (diff < minDiff) {
        minDiff = diff;
        bestIdx = i;
      }
    }
    const h = data.hourly;
    const dObj = new Date(times[bestIdx]);
    const hr = dObj.getHours();
    return {
      temp: h.temperature_2m && h.temperature_2m[bestIdx] != null ? Math.round(h.temperature_2m[bestIdx]) : null,
      rain: h.precipitation && h.precipitation[bestIdx] != null ? Math.round(h.precipitation[bestIdx] * 10) / 10 : 0,
      snow: h.snowfall && h.snowfall[bestIdx] != null ? Math.round(h.snowfall[bestIdx] * 10) / 10 : 0,
      code: h.weather_code && h.weather_code[bestIdx] != null ? h.weather_code[bestIdx] : 0,
      wind: h.wind_speed_10m && h.wind_speed_10m[bestIdx] != null ? Math.round(h.wind_speed_10m[bestIdx]) : 0,
      gust: h.wind_gusts_10m && h.wind_gusts_10m[bestIdx] != null ? Math.round(h.wind_gusts_10m[bestIdx]) : 0,
      isNight: hr < 7 || hr >= 20
    };
  }

  async function loadRadarData() {
    try {
      // API officielle Météoblue (Radar & Précipitations haute définition temps réel + nowcast)
      const apiKey = "1iw4Jq5NZK60Ig7O";
      const timeUrl = `https://maps-api-cdn.meteoblue.com/v1/tiles/precipitation_global_internal/meteomapsTimeLast24h.json?lang=fr&apikey=${apiKey}&_t=${Math.floor(Date.now() / 60000)}`;
      const res = await fetch(timeUrl, { cache: "no-store" });
      if (!res.ok) {
        console.warn("Météoblue time API error:", res.status);
        return;
      }
      const data = await res.json();
      const allTimesteps = data.timesteps || [];
      if (allTimesteps.length === 0) return;

      lastRadarLoadTime = Date.now();
      const isobs = data.isobservation || [];

      // Déterminer le créneau de 15 min correspondant exactement à l'heure actuelle réelle (Date.now())
      const nowMs = Date.now();
      let currentIdx = typeof data.current === "number" ? data.current : (allTimesteps.length - 1);
      let minTimeDiff = Infinity;
      for (let i = 0; i < allTimesteps.length; i++) {
        const tsMs = new Date(allTimesteps[i].timestep).getTime();
        if (!isNaN(tsMs)) {
          const diff = Math.abs(tsMs - nowMs);
          if (diff < minTimeDiff) {
            minTimeDiff = diff;
            currentIdx = i;
          }
        }
      }

      // Règle 1 : EXACTEMENT 1 plage horaire passée avant le créneau actuel (1 créneau de 15m)
      const pastSlotsCount = 1;
      const startIndex = Math.max(0, currentIdx - pastSlotsCount);

      // Règle 2 : Durée dans le futur selon la durée sélectionnée (3h par défaut = 12 créneaux de 15m)
      const rangeFutureSteps = {
        1: 4,   // +1h
        3: 12,  // +3h (par défaut)
        6: 24,  // +6h
        9: 36,  // +9h
        12: 48, // +12h
        18: 72, // +18h
        24: 96, // +24h
        48: 120 // max disponible
      };
      const futureCount = rangeFutureSteps[radarTimeRangeHours] || 12;
      const endIndex = Math.min(allTimesteps.length - 1, currentIdx + futureCount);

      radarSlots = [];
      const now = new Date();
      function formatSlotLabel(d) {
        const isToday = d.toDateString() === now.toDateString();
        const timeStr = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        if (isToday) return timeStr;
        const dayShort = d.toLocaleDateString("fr-FR", { weekday: "short" });
        const cap = dayShort.charAt(0).toUpperCase() + dayShort.slice(1, 3);
        return `${cap} ${timeStr}`;
      }

      let activeSlotIndex = 0;

      for (let i = startIndex; i <= endIndex; i++) {
        const item = allTimesteps[i];
        const d = new Date(item.timestep);
        const offsetMin = (i - currentIdx) * 15;
        const isObs = isobs[i] === 1;
        const type = i < currentIdx ? "past" : (i === currentIdx ? "current" : "future");

        if (i === currentIdx) {
          activeSlotIndex = radarSlots.length;
        }

        radarSlots.push({
          time: Math.floor(d.getTime() / 1000),
          label: formatSlotLabel(d),
          fullDate: d,
          type: type,
          isObservation: isObs,
          offsetMinutes: offsetMin,
          tileValue: item.value
        });
      }

      // Supprimer les anciennes couches radar du map
      radarLayersMap.forEach(l => {
        if (radarMap && radarMap.hasLayer(l)) radarMap.removeLayer(l);
      });
      radarLayersMap.clear();

      if (futureRadarLayer && radarMap && radarMap.hasLayer(futureRadarLayer)) {
        radarMap.removeLayer(futureRadarLayer);
        futureRadarLayer = null;
      }

      // Pré-créer les couches de tuiles officielles Météoblue
      radarSlots.forEach(s => {
        if (!radarLayersMap.has(s.tileValue)) {
          const tileUrl = `https://maps-api-cdn.meteoblue.com/v1/tiles/precipitation_global_internal/${s.tileValue}/{z}/{x}/{y}.png?apikey=${apiKey}`;
          const tileLayer = L.tileLayer(tileUrl, {
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            maxNativeZoom: 7,
            maxZoom: 19,
            opacity: 0,
            zIndex: 10,
            className: "radar-tile-layer"
          });
          if (radarMap) tileLayer.addTo(radarMap);
          radarLayersMap.set(s.tileValue, tileLayer);
        }
      });

      renderRadarTimeline();

      // Afficher le créneau EN DIRECT par défaut au chargement (sans défilement automatique)
      showRadarSlot(activeSlotIndex);

    } catch (e) {
      console.warn("Erreur chargement données radar Météoblue:", e);
    }
  }

  function renderRadarTimeline() {
    const scrollEl = document.getElementById("radarTimelineScroll");
    if (!scrollEl) return;
    scrollEl.innerHTML = "";

    radarSlots.forEach((slot, idx) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `radar-time-chip ${idx === currentRadarIndex ? "active" : ""}`;
      chip.textContent = slot.label;
      const d = slot.fullDate || new Date(slot.time * 1000);
      const isToday = d.toDateString() === new Date().toDateString();
      const timeStr = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      const fullDateStr = isToday ? `Aujourd'hui à ${timeStr}` : `${d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })} à ${timeStr}`;
      chip.title = slot.type === "current" ? `En direct (maintenant ${timeStr})` : (slot.type === "future" ? `Prévision : ${fullDateStr} (+${Math.round(slot.offsetMinutes / 60)}h)` : `Observation : ${fullDateStr}`);
      chip.addEventListener("click", () => {
        stopRadarPlayback();
        showRadarSlot(idx);
      });
      scrollEl.appendChild(chip);
    });
  }

  function showRadarSlot(index, isPlaying = false) {
    if (index < 0 || index >= radarSlots.length) return;
    currentRadarIndex = index;
    const slot = radarSlots[index];

    // 1. Affichage de la couche radar officielle Météoblue
    radarLayersMap.forEach((layer, val) => {
      if (val === slot.tileValue) {
        layer.setOpacity(0.85);
      } else {
        layer.setOpacity(0);
      }
    });

    // 2. Mettre à jour l'étiquette d'heure active et le badge de statut
    const labelEl = document.getElementById("radarActiveTimeLabel");
    if (labelEl) {
      const d = slot.fullDate || new Date(slot.time * 1000);
      const isToday = d.toDateString() === new Date().toDateString();
      const timeStr = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      labelEl.textContent = isToday ? `Aujourd'hui à ${timeStr}` : `${d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })} à ${timeStr}`;
    }

    const liveIndicator = document.getElementById("radarLiveIndicator");
    if (liveIndicator) {
      if (slot.type === "current") {
        liveIndicator.textContent = "● EN DIRECT";
        liveIndicator.style.background = "rgba(239, 68, 68, 0.2)";
        liveIndicator.style.color = "#ef4444";
        liveIndicator.style.borderColor = "rgba(239, 68, 68, 0.3)";
      } else if (slot.type === "future") {
        liveIndicator.textContent = `🔮 PRÉVISION +${slot.offsetMinutes}m`;
        liveIndicator.style.background = "rgba(14, 165, 233, 0.2)";
        liveIndicator.style.color = "#38bdf8";
        liveIndicator.style.borderColor = "rgba(14, 165, 233, 0.3)";
      } else {
        liveIndicator.textContent = `⏱️ OBSERVATION ${slot.offsetMinutes}m`;
        liveIndicator.style.background = "rgba(148, 163, 184, 0.2)";
        liveIndicator.style.color = "#94a3b8";
        liveIndicator.style.borderColor = "rgba(148, 163, 184, 0.3)";
      }
    }

    // 3. Mettre à jour la puce temporelle active et défilement fluide
    const chips = document.querySelectorAll(".radar-time-chip");
    chips.forEach((c, i) => c.classList.toggle("active", i === index));
    const activeChip = chips[index];
    const scrollEl = document.getElementById("radarTimelineScroll");
    if (scrollEl && activeChip) {
      const targetScroll = activeChip.offsetLeft - (scrollEl.clientWidth - activeChip.clientWidth) / 2;
      if (isPlaying) {
        scrollEl.scrollLeft = targetScroll;
      } else {
        scrollEl.scrollTo({ left: targetScroll, behavior: "smooth" });
      }
    }
  }

  function startRadarPlayback() {
    stopRadarPlayback();
    const playBtn = document.getElementById("radarPlayBtn");
    if (playBtn) playBtn.textContent = "⏸";

    // Vitesse officielle Météoblue (~580 ms par pas de 15 min + pause en fin de boucle)
    const STEP_DELAY_MS = 580;
    const END_PAUSE_MS = 1150;

    function tick() {
      let next = currentRadarIndex + 1;
      let delay = STEP_DELAY_MS;
      if (next >= radarSlots.length) {
        next = 0;
        delay = END_PAUSE_MS; // Pause naturelle en fin de boucle avant de relancer
      }
      showRadarSlot(next, true);
      radarPlayInterval = setTimeout(tick, delay);
    }

    radarPlayInterval = setTimeout(tick, STEP_DELAY_MS);
  }

  function stopRadarPlayback() {
    if (radarPlayInterval) {
      clearTimeout(radarPlayInterval);
      clearInterval(radarPlayInterval);
      radarPlayInterval = null;
    }
    const playBtn = document.getElementById("radarPlayBtn");
    if (playBtn) playBtn.textContent = "▶";
  }

  function setupRadarControls() {
    const playBtn = document.getElementById("radarPlayBtn");
    const prevBtn = document.getElementById("radarPrevBtn");
    const nextBtn = document.getElementById("radarNextBtn");

    if (playBtn) {
      playBtn.onclick = () => {
        if (radarPlayInterval) stopRadarPlayback();
        else startRadarPlayback();
      };
    }

    if (prevBtn) {
      prevBtn.onclick = () => {
        stopRadarPlayback();
        let prev = currentRadarIndex - 1;
        if (prev < 0) prev = radarSlots.length - 1;
        showRadarSlot(prev);
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        stopRadarPlayback();
        let next = currentRadarIndex + 1;
        if (next >= radarSlots.length) next = 0;
        showRadarSlot(next);
      };
    }

    // Sélecteur de durée officiel Météoblue (1h, 3h, 6h, 9h, 12h, 18h, 24h)
    document.querySelectorAll(".radar-range-btn").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll(".radar-range-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        radarTimeRangeHours = parseInt(btn.dataset.range, 10) || 1;
        loadRadarData();
      };
    });

    const resetBtn = document.getElementById("meteoblueResetBtn");
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (currentLocation && radarMap) {
          radarMap.setView([currentLocation.lat, currentLocation.lon], 9.5);
        }
      };
    }

    // Navigation tactile et à la molette : scroller pour passer d'une tranche à une autre (sur la barre et sur la carte)
    const controlsBar = document.querySelector(".radar-overlay-bottom, .radar-controls-bar");
    const scrubberBar = document.querySelector(".radar-scrubber-bar");
    const mapEl = document.getElementById("meteoblueRadarMap");
    let wheelAccumulator = 0;
    let wheelResetTimer = null;
    const HORIZONTAL_THRESHOLD = 30;

    function handleScrubberWheel(e, isMap = false) {
      if (e.target.closest && e.target.closest(".radar-timerange-pills")) return;

      // 1. Si Ctrl est maintenu sur la carte : zoomer / dézoomer la carte Leaflet
      if (isMap && e.ctrlKey && radarMap) {
        e.preventDefault();
        if (e.deltaY < 0) radarMap.zoomIn();
        else if (e.deltaY > 0) radarMap.zoomOut();
        return;
      }

      // 2. Défilement horizontal EXCLUSIF (molette spéciale horizontale de souris)
      // Si c'est un scroll vertical classique (deltaX nul ou négligeable), ne PAS changer les heures
      // et laisser le scroll vertical natif de la page s'exécuter librement
      if (Math.abs(e.deltaX) < 1) {
        return;
      }

      // 3. Défilement horizontal détecté : avancer / reculer les tranches horaires
      e.preventDefault();
      stopRadarPlayback();

      let delta = e.deltaX;
      if (e.deltaMode === 1) delta *= 33; // Normalisation Firefox

      wheelAccumulator += delta;

      clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => {
        wheelAccumulator = 0;
      }, 200);

      if (wheelAccumulator >= HORIZONTAL_THRESHOLD) {
        const steps = Math.max(1, Math.floor(wheelAccumulator / HORIZONTAL_THRESHOLD));
        wheelAccumulator %= HORIZONTAL_THRESHOLD;
        let next = currentRadarIndex + steps;
        if (next >= radarSlots.length) next = radarSlots.length - 1;
        if (next !== currentRadarIndex) showRadarSlot(next);
      } else if (wheelAccumulator <= -HORIZONTAL_THRESHOLD) {
        const steps = Math.max(1, Math.floor(Math.abs(wheelAccumulator) / HORIZONTAL_THRESHOLD));
        wheelAccumulator %= HORIZONTAL_THRESHOLD;
        let prev = currentRadarIndex - steps;
        if (prev < 0) prev = 0;
        if (prev !== currentRadarIndex) showRadarSlot(prev);
      }
    }

    if (controlsBar) {
      controlsBar.addEventListener("wheel", (e) => handleScrubberWheel(e, false), { passive: false });
    }

    if (mapEl) {
      mapEl.addEventListener("wheel", (e) => handleScrubberWheel(e, true), { passive: false });
    }

    if (scrubberBar) {
      let isDragging = false;
      let startX = 0;
      let startIdx = 0;

      const onPointerDown = (clientX, target) => {
        if (target && target.closest(".radar-scrubber-nav")) return;
        isDragging = true;
        startX = clientX;
        startIdx = currentRadarIndex;
        stopRadarPlayback();
      };

      const onPointerMove = (clientX) => {
        if (!isDragging) return;
        const dx = clientX - startX;
        const slotDelta = -Math.round(dx / 30);
        let target = startIdx + slotDelta;
        if (target < 0) target = 0;
        if (target >= radarSlots.length) target = radarSlots.length - 1;
        if (target !== currentRadarIndex) {
          showRadarSlot(target, true);
        }
      };

      const onPointerUp = () => {
        isDragging = false;
      };

      scrubberBar.addEventListener("mousedown", (e) => onPointerDown(e.clientX, e.target));
      window.addEventListener("mousemove", (e) => onPointerMove(e.clientX));
      window.addEventListener("mouseup", onPointerUp);

      scrubberBar.addEventListener("touchstart", (e) => {
        if (e.touches && e.touches[0]) onPointerDown(e.touches[0].clientX, e.target);
      }, { passive: true });
      window.addEventListener("touchmove", (e) => {
        if (e.touches && e.touches[0]) onPointerMove(e.touches[0].clientX);
      }, { passive: true });
      window.addEventListener("touchend", onPointerUp);
    }
  }

  function updateMeteoblueMap(location) {
    if (!location) return;
    const lat = typeof location.lat === "number" ? location.lat : 45.1885;
    const lon = typeof location.lon === "number" ? location.lon : 5.7245;

    if (radarMap) {
      radarMap.setView([lat, lon], 9.5);
      if (radarMarker) radarMarker.setLatLng([lat, lon]);
      setTimeout(() => radarMap.invalidateSize(), 200);
    }

    updateMeteoblueHeaders(location);
  }

  function renderRommaStations(loc) {
    updateRommaMap(loc, false);
  }

  // Événements pour recentrer la carte ROMMA
  if (rommaResetBtn) {
    rommaResetBtn.addEventListener("click", () => {
      updateRommaMap(currentLocation, true);
    });
  }

  // ========================================================
  // MODULE WEBCAMS RÉGIONALES (OPTION A : FILTRES + MOSAÏQUE + LIGHTBOX)
  // Affichage strict : Isère (38) uniquement si ville en 38 • Clermont/PDD (63) uniquement si ville en 63
  // ========================================================
  const WEBCAMS_BY_REGION = {
    "38": {
      label: "Isère (38)",
      defaultUrl: "https://www.chamrousse.com/webcams.html",
      filters: [
        { key: "chamrousse", label: "Chamrousse", url: "https://www.chamrousse.com/webcams.html" },
        { key: "bastille", label: "La Bastille", url: "https://www.grenoble-tourisme.com/fr/webcam/" },
        { key: "chamechaude", label: "Chamechaude", url: "https://www.grenoble-tourisme.com/fr/webcam/" },
        { key: "7laux", label: "Les 7 Laux", url: "https://www.les7laux.com/hiver/ski-alpin-nordique-autres-glisses/ski/webcams/" }
      ],
      items: [
        {
          id: "cham-croix",
          site: "chamrousse",
          siteLabel: "Chamrousse",
          title: "La Croix de Chamrousse",
          alt: "2 250 m",
          type: "iframe",
          src: "https://www.skaping.com/chamrousse/la-croix",
          officialUrl: "https://www.chamrousse.com/webcams.html"
        },
        {
          id: "cham-cretes",
          site: "chamrousse",
          siteLabel: "Chamrousse",
          title: "Les Crêtes",
          alt: "1 960 m",
          type: "iframe",
          src: "https://www.skaping.com/chamrousse/les-cretes",
          officialUrl: "https://www.chamrousse.com/webcams.html"
        },
        {
          id: "cham-recoin",
          site: "chamrousse",
          siteLabel: "Chamrousse",
          title: "Recoin • Place de Belledonne",
          alt: "1 650 m",
          type: "iframe",
          src: "https://www.skaping.com/chamrousse/recoin/archives",
          officialUrl: "https://www.chamrousse.com/webcams.html"
        },
        {
          id: "cham-vercors",
          site: "chamrousse",
          siteLabel: "Chamrousse",
          title: "Vue Grenoble & Vercors",
          alt: "1 780 m",
          type: "image",
          src: "http://static.meteo-chamrousse.com/webcam/webcam-chamrousse.jpg",
          officialUrl: "https://www.chamrousse.com/webcams.html"
        },
        {
          id: "cham-casserousse",
          site: "chamrousse",
          siteLabel: "Chamrousse",
          title: "Panorama Casserousse",
          alt: "1 650 m",
          type: "iframe",
          src: "https://www.skaping.com/chamrousse/panorama-casserousse",
          officialUrl: "https://www.chamrousse.com/webcams.html"
        },
        {
          id: "bastille-sommet",
          site: "bastille",
          siteLabel: "La Bastille",
          title: "Grenoble • Sommet de la Bastille",
          alt: "476 m",
          type: "iframe",
          src: "https://www.skaping.com/grenoble/bastille",
          officialUrl: "https://www.grenoble-tourisme.com/fr/webcam/"
        },
        {
          id: "bastille-hdv",
          site: "bastille",
          siteLabel: "La Bastille",
          title: "Grenoble • Hôtel de Ville & Belledonne",
          alt: "214 m",
          type: "iframe",
          src: "https://www.skaping.com/grenoble/hotel-de-ville",
          officialUrl: "https://www.grenoble-tourisme.com/fr/webcam/"
        },
        {
          id: "chamechaude-coldeporte",
          site: "chamechaude",
          siteLabel: "Chamechaude",
          title: "Col de Porte • Vue Sommet de Chamechaude",
          alt: "1 326 m",
          type: "iframe",
          src: "https://www.skaping.com/grenoble/col-de-porte",
          officialUrl: "https://www.grenoble-tourisme.com/fr/webcam/"
        },
        {
          id: "chamechaude-sappey",
          site: "chamechaude",
          siteLabel: "Chamechaude",
          title: "Le Sappey-en-Chartreuse • Vue Chamechaude",
          alt: "1 000 m",
          type: "iframe",
          src: "https://www.skaping.com/sappey-en-chartreuse",
          officialUrl: "https://www.grenoble-tourisme.com/fr/webcam/"
        },
        {
          id: "chamechaude-alpin",
          site: "chamechaude",
          siteLabel: "Chamechaude",
          title: "Col de Porte • Pistes de Chamechaude",
          alt: "1 326 m",
          type: "iframe",
          src: "https://www.skaping.com/col-de-porte/ski-alpin",
          officialUrl: "https://www.grenoble-tourisme.com/fr/webcam/"
        },
        {
          id: "chamechaude-biathlon",
          site: "chamechaude",
          siteLabel: "Chamechaude",
          title: "Col de Porte • Stade de Biathlon",
          alt: "1 326 m",
          type: "iframe",
          src: "https://www.skaping.com/col-de-porte/biathlon",
          officialUrl: "https://www.grenoble-tourisme.com/fr/webcam/"
        },
        {
          id: "7laux-bouquetins",
          site: "7laux",
          siteLabel: "Les 7 Laux",
          title: "Prapoutel • Sommet des Bouquetins",
          alt: "2 100 m",
          type: "iframe",
          src: "https://www.skaping.com/les7laux/prapoutel/sommetdesbouquetins",
          officialUrl: "https://www.les7laux.com/hiver/ski-alpin-nordique-autres-glisses/ski/webcams/"
        },
        {
          id: "7laux-oursiere",
          site: "7laux",
          siteLabel: "Les 7 Laux",
          title: "Le Pleynet • L'Oursière",
          alt: "1 950 m",
          type: "iframe",
          src: "https://www.skaping.com/les7laux/pleynet/oursiere",
          officialUrl: "https://www.les7laux.com/hiver/ski-alpin-nordique-autres-glisses/ski/webcams/"
        },
        {
          id: "7laux-pipay",
          site: "7laux",
          siteLabel: "Les 7 Laux",
          title: "Pipay • Grand Cerf",
          alt: "1 550 m",
          type: "iframe",
          src: "https://www.skaping.com/les7laux/pipay/grand-cerf",
          officialUrl: "https://www.les7laux.com/hiver/ski-alpin-nordique-autres-glisses/ski/webcams/"
        },
        {
          id: "7laux-loups",
          site: "7laux",
          siteLabel: "Les 7 Laux",
          title: "Le Pleynet • Les Loups",
          alt: "1 450 m",
          type: "iframe",
          src: "https://www.skaping.com/les7laux/pleynet/les-loups",
          officialUrl: "https://www.les7laux.com/hiver/ski-alpin-nordique-autres-glisses/ski/webcams/"
        }
      ]
    },
    "63": {
      label: "Clermont & Puy-de-Dôme (63)",
      defaultUrl: "https://wwwobs.univ-bpclermont.fr/opgc/webcam.php",
      filters: [
        { key: "pdd", label: "Puy de Dôme (OPGC & Sommet)", url: "https://wwwobs.univ-bpclermont.fr/opgc/webcam.php" },
        { key: "routes63", label: "Département Puy-de-Dôme (Routes)", url: "https://www.puy-de-dome.fr/routes-deplacements/webcam.html" }
      ],
      items: [
        {
          id: "pdd-opgc",
          site: "pdd",
          siteLabel: "OPGC Puy de Dôme",
          title: "Observatoire OPGC • Vue Puy de Dôme (Cezeaux)",
          alt: "1 465 m",
          type: "image",
          src: "https://wwwobs.univ-bpclermont.fr/opgc/webcampdd.jpg",
          fallbackVideo: "https://www.panoramiquedesdomes.fr/wp-content/uploads/cameras/camera_1/video_Webcam_1.mp4",
          officialUrl: "https://wwwobs.univ-bpclermont.fr/opgc/webcam.php"
        },
        {
          id: "pdd-cam1",
          site: "pdd",
          siteLabel: "Sommet Puy de Dôme",
          title: "Sommet Puy de Dôme • Vue Chaîne des Puys (Nord)",
          alt: "1 465 m",
          type: "video",
          src: "https://www.panoramiquedesdomes.fr/wp-content/uploads/cameras/camera_1/video_Webcam_1.mp4",
          officialUrl: "https://wwwobs.univ-bpclermont.fr/opgc/webcam.php"
        },
        {
          id: "pdd-cam2",
          site: "pdd",
          siteLabel: "Sommet Puy de Dôme",
          title: "Sommet Puy de Dôme • Gare & Clermont-Ferrand",
          alt: "1 465 m",
          type: "video",
          src: "https://www.panoramiquedesdomes.fr/wp-content/uploads/cameras/camera_2/video_Webcam_2.mp4",
          officialUrl: "https://wwwobs.univ-bpclermont.fr/opgc/webcam.php"
        },
        {
          id: "pdd-cam3",
          site: "pdd",
          siteLabel: "Sommet Puy de Dôme",
          title: "Sommet Puy de Dôme • Temple de Mercure (Sud)",
          alt: "1 465 m",
          type: "video",
          src: "https://www.panoramiquedesdomes.fr/wp-content/uploads/cameras/camera_3/video_Webcam_3.mp4",
          officialUrl: "https://wwwobs.univ-bpclermont.fr/opgc/webcam.php"
        },
        {
          id: "pdd-cam4",
          site: "pdd",
          siteLabel: "Pied du Dôme",
          title: "Pied du Dôme • Maison de Site (Départ Crémaillère)",
          alt: "880 m",
          type: "video",
          src: "https://www.panoramiquedesdomes.fr/wp-content/uploads/cameras/camera_4/video_Webcam_4.mp4",
          officialUrl: "https://wwwobs.univ-bpclermont.fr/opgc/webcam.php"
        },
        {
          id: "routes-pdd63",
          site: "routes63",
          siteLabel: "Département 63",
          title: "Routes & Cols du Puy-de-Dôme (Inforoute 63)",
          alt: "Réseau 63",
          type: "iframe",
          src: "https://www.inforoute-massif-central.fr/",
          officialUrl: "https://www.puy-de-dome.fr/routes-deplacements/webcam.html"
        }
      ]
    }
  };

  let activeWebcamRegion = null;
  let activeWebcamFilter = "all";

  function getWebcamRegionForLocation(loc) {
    if (!loc) return "38";
    const pc = String(loc.postcode || "").trim();
    const admin = String(loc.admin1 || "").toLowerCase();
    const name = String(loc.name || "").toLowerCase();

    if (pc.startsWith("38") || admin.includes("isère") || admin.includes("isere") || admin.includes("(38)")) {
      return "38";
    }
    if (
      pc.startsWith("63") ||
      admin.includes("puy-de-dôme") ||
      admin.includes("puy-de-dome") ||
      admin.includes("(63)") ||
      name.includes("clermont-ferrand") ||
      name.includes("puy de dôme") ||
      name.includes("puy-de-dôme")
    ) {
      return "63";
    }
    if (typeof loc.lat === "number" && typeof loc.lon === "number") {
      if (loc.lat >= 45.28 && loc.lat <= 46.26 && loc.lon >= 2.38 && loc.lon <= 3.99) {
        return "63";
      }
      if (loc.lat >= 44.68 && loc.lat <= 45.88 && loc.lon >= 4.74 && loc.lon <= 6.38) {
        return "38";
      }
    }
    return null;
  }

  function unmountAllWebcamMedia() {
    const section = document.getElementById("webcamsSection");
    if (!section) return;
    section.querySelectorAll(".webcam-media-box").forEach(box => {
      if (box.dataset.mounted === "1") {
        box.dataset.mounted = "0";
        box.innerHTML = `<div class="webcam-media-placeholder">📷 En pause (économie batterie)...</div>`;
      }
    });
  }

  function mountVisibleWebcamMedia(forceReload = false) {
    const section = document.getElementById("webcamsSection");
    if (!section || section.offsetParent === null) return;
    const ts = Date.now();

    section.querySelectorAll(".webcam-card").forEach(card => {
      const box = card.querySelector(".webcam-media-box");
      if (!box) return;
      if (card.style.display === "none") {
        if (box.dataset.mounted === "1") {
          box.dataset.mounted = "0";
          box.innerHTML = `<div class="webcam-media-placeholder">📷 En pause...</div>`;
        }
        return;
      }
      if (box.dataset.mounted === "1" && !forceReload) return;
      box.dataset.mounted = "1";

      const type = box.dataset.type;
      const src = box.dataset.src;
      const fallbackVideo = box.dataset.fallbackVideo || "";
      const title = box.dataset.title || "Webcam";

      box.innerHTML = "";
      if (type === "iframe") {
        const ifr = document.createElement("iframe");
        ifr.className = "webcam-embed-iframe";
        ifr.src = src;
        ifr.allowFullscreen = true;
        ifr.loading = "lazy";
        ifr.title = title;
        ifr.setAttribute("scrolling", "no");
        box.appendChild(ifr);
      } else if (type === "video") {
        const vid = document.createElement("video");
        vid.className = "webcam-embed-video";
        vid.autoplay = true;
        vid.muted = true;
        vid.loop = true;
        vid.playsInline = true;
        vid.src = `${src}?t=${ts}`;
        box.appendChild(vid);
      } else if (type === "image") {
        const img = document.createElement("img");
        img.className = "webcam-embed-img";
        img.alt = title;
        img.src = `${src}?t=${ts}`;
        img.onerror = () => {
          if (fallbackVideo) {
            box.innerHTML = "";
            const vid = document.createElement("video");
            vid.className = "webcam-embed-video";
            vid.autoplay = true;
            vid.muted = true;
            vid.loop = true;
            vid.playsInline = true;
            vid.src = `${fallbackVideo}?t=${ts}`;
            box.appendChild(vid);
          }
        };
        box.appendChild(img);
      }
    });
  }

  function openWebcamLightbox(item) {
    const existing = document.querySelector(".webcam-lightbox-overlay");
    if (existing) existing.remove();

    const ts = Date.now();
    const overlay = document.createElement("div");
    overlay.className = "webcam-lightbox-overlay";

    let mediaHtml = "";
    if (item.type === "iframe") {
      mediaHtml = `<iframe class="webcam-lightbox-iframe" src="${item.src}" allowfullscreen scrolling="no" title="${item.title}"></iframe>`;
    } else if (item.type === "video") {
      mediaHtml = `<video class="webcam-lightbox-video" src="${item.src}?t=${ts}" autoplay muted loop playsinline controls></video>`;
    } else {
      mediaHtml = `<img class="webcam-lightbox-img" src="${item.src}?t=${ts}" alt="${item.title}">`;
    }

    overlay.innerHTML = `
      <div class="webcam-lightbox-dialog" role="dialog" aria-modal="true">
        <div class="webcam-lightbox-header">
          <div class="webcam-lightbox-title-wrap">
            <span class="webcam-site-tag">${item.siteLabel}</span>
            <strong>${item.title}</strong>
            <span class="altitude-badge">${item.alt}</span>
          </div>
          <div class="webcam-lightbox-actions">
            <a href="${item.officialUrl}" target="_blank" rel="noopener noreferrer" class="ext-link-btn">Site officiel ↗</a>
            <button type="button" class="tabs-reorder-close" aria-label="Fermer">✕</button>
          </div>
        </div>
        <div class="webcam-lightbox-body">${mediaHtml}</div>
      </div>
    `;

    const imgEl = overlay.querySelector(".webcam-lightbox-img");
    if (imgEl && item.fallbackVideo) {
      imgEl.onerror = () => {
        const body = overlay.querySelector(".webcam-lightbox-body");
        if (body) {
          body.innerHTML = `<video class="webcam-lightbox-video" src="${item.fallbackVideo}?t=${ts}" autoplay muted loop playsinline controls></video>`;
        }
      };
    }

    function close() {
      document.removeEventListener("keydown", onKey);
      overlay.remove();
    }
    function onKey(e) {
      if (e.key === "Escape") close();
    }
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    overlay.querySelector(".tabs-reorder-close").addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(overlay);
  }

  function applyWebcamFilter(filterKey) {
    // Si on reclique sur la catégorie active, on la désélectionne (filtre = null -> tout s'affiche)
    if (activeWebcamFilter === filterKey) {
      activeWebcamFilter = null;
    } else {
      activeWebcamFilter = filterKey;
    }

    const cfg = WEBCAMS_BY_REGION[activeWebcamRegion];
    if (!cfg) return;

    const filtersBar = document.getElementById("webcamsFiltersBar");
    if (filtersBar) {
      filtersBar.querySelectorAll(".webcam-filter-pill").forEach(btn => {
        const active = activeWebcamFilter !== null && btn.dataset.filter === activeWebcamFilter;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    const activeFilterObj = cfg.filters.find(f => f.key === activeWebcamFilter);
    const extLink = document.getElementById("webcamsExtLink");
    if (extLink) {
      extLink.href = activeFilterObj ? activeFilterObj.url : cfg.defaultUrl;
    }

    const grid = document.getElementById("webcamsGrid");
    if (grid) {
      grid.querySelectorAll(".webcam-card").forEach(card => {
        const show = activeWebcamFilter === null || card.dataset.site === activeWebcamFilter;
        card.style.display = show ? "" : "none";
      });
    }

    mountVisibleWebcamMedia(false);
  }

  function updateWebcamsSection(loc) {
    const region = getWebcamRegionForLocation(loc || currentLocation);
    const badge = document.getElementById("webcamsRegionBadge");
    const filtersBar = document.getElementById("webcamsFiltersBar");
    const grid = document.getElementById("webcamsGrid");
    const extLink = document.getElementById("webcamsExtLink");
    if (!grid || !filtersBar) return;

    if (!region || !WEBCAMS_BY_REGION[region]) {
      activeWebcamRegion = null;
      if (badge) badge.style.display = "none";
      filtersBar.innerHTML = "";
      grid.innerHTML = `
        <div class="webcams-empty-state">
          Aucune webcam configurée pour cette commune.<br>
          <span>Les webcams d'Isère (Chamrousse, La Bastille, Chamechaude, Les 7 Laux) s'affichent automatiquement pour les villes du <strong>38</strong>, et celles de Clermont / Puy-de-Dôme pour les villes du <strong>63</strong>.</span>
        </div>
      `;
      return;
    }

    if (activeWebcamRegion === region && grid.children.length > 0 && !grid.querySelector(".webcams-empty-state")) {
      mountVisibleWebcamMedia(false);
      return;
    }

    activeWebcamRegion = region;
    activeWebcamFilter = null; // Par défaut, aucun filtre actif : toutes les webcams sont visibles
    const cfg = WEBCAMS_BY_REGION[region];

    if (badge) badge.style.display = "none";
    if (extLink) extLink.href = cfg.defaultUrl;

    filtersBar.innerHTML = "";
    cfg.filters.forEach(f => {
      const count = cfg.items.filter(it => it.site === f.key).length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "webcam-filter-pill";
      btn.dataset.filter = f.key;
      btn.innerHTML = `<span>${f.label}</span><span class="webcam-filter-count">${count}</span>`;
      btn.addEventListener("click", () => applyWebcamFilter(f.key));

      // Gestion du double-clic sur l'onglet de catégorie webcam -> ouvre le site officiel
      let lastClick = 0;
      btn.addEventListener("pointerdown", () => {
        const now = Date.now();
        if (now - lastClick < 350) {
          lastClick = 0;
          window.open(f.url, "_blank", "noopener,noreferrer");
        } else {
          lastClick = now;
        }
      });
      btn.addEventListener("dblclick", () => {
        window.open(f.url, "_blank", "noopener,noreferrer");
      });

      filtersBar.appendChild(btn);
    });

    grid.innerHTML = "";
    cfg.items.forEach(item => {
      const card = document.createElement("article");
      card.className = "webcam-card";
      card.dataset.site = item.site;
      card.innerHTML = `
        <div class="webcam-card-header" title="Double-clic pour ouvrir le site officiel">
          <div class="webcam-card-title-group">
            <span class="webcam-site-tag">${item.siteLabel}</span>
            <h4 class="webcam-card-title">${item.title}</h4>
          </div>
          <div class="webcam-card-actions">
            <span class="altitude-badge">${item.alt}</span>
          </div>
        </div>
        <div class="webcam-media-box" data-type="${item.type}" data-src="${item.src}" data-fallback-video="${item.fallbackVideo || ""}" data-title="${item.title}">
          <div class="webcam-media-placeholder">📷 Chargement du direct...</div>
        </div>
      `;
      const header = card.querySelector(".webcam-card-header");
      let lastTap = 0;
      header.addEventListener("click", () => {
        const now = Date.now();
        if (now - lastTap < 350) {
          lastTap = 0;
          window.open(item.officialUrl, "_blank", "noopener,noreferrer");
          return;
        }
        lastTap = now;
      });
      header.addEventListener("dblclick", () => {
        window.open(item.officialUrl, "_blank", "noopener,noreferrer");
      });
      grid.appendChild(card);
    });

    mountVisibleWebcamMedia(false);
  }

  // ========================================================
  // MODULE MÉTÉOCIEL GRENOBLE (VILLE)
  // Reproduction fidèle des 3 visuels plébiscités :
  // 1. Éphéméride & Lune (Image 3)
  // 2. Diagramme précipitations (mm) en bâtons bleus (Image 2)
  // 3. Grand tableau horaire à codes couleurs (Image 1)
  // ========================================================

  // Calendrier des Saints français (365 jours complets)
  const FRENCH_SAINTS = {
    "01-01": "Jour de l'An", "01-02": "Saint Basile", "01-03": "Sainte Geneviève", "01-04": "Saint Odilon",
    "01-05": "Saint Édouard", "01-06": "Épiphanie", "01-07": "Saint Raymond", "01-08": "Saint Lucien",
    "01-09": "Sainte Alix", "01-10": "Saint Guillaume", "01-11": "Saint Paulin", "01-12": "Sainte Tatiana",
    "01-13": "Sainte Yvette", "01-14": "Sainte Nina", "01-15": "Saint Rémi", "01-16": "Saint Marcel",
    "01-17": "Sainte Roseline", "01-18": "Sainte Prisca", "01-19": "Saint Marius", "01-20": "Saint Sébastien",
    "01-21": "Sainte Agnès", "01-22": "Saint Vincent", "01-23": "Saint Barnard", "01-24": "Saint François de Sales",
    "01-25": "Conversion de Paul", "01-26": "Sainte Paule", "01-27": "Sainte Angèle", "01-28": "Saint Thomas d'Aquin",
    "01-29": "Saint Gildas", "01-30": "Sainte Martine", "01-31": "Sainte Marcelle",
    "02-01": "Sainte Ella", "02-02": "Présentation", "02-03": "Saint Blaise", "02-04": "Sainte Véronique",
    "02-05": "Sainte Agathe", "02-06": "Saint Gaston", "02-07": "Sainte Eugénie", "02-08": "Sainte Jacqueline",
    "02-09": "Sainte Apolline", "02-10": "Saint Arnaud", "02-11": "Notre-Dame de Lourdes", "02-12": "Saint Félix",
    "02-13": "Sainte Béatrice", "02-14": "Saint Valentin", "02-15": "Saint Claude", "02-16": "Sainte Julienne",
    "02-17": "Saint Alexis", "02-18": "Sainte Bernadette", "02-19": "Saint Gabin", "02-20": "Sainte Aimée",
    "02-21": "Saint Pierre Damien", "02-22": "Sainte Isabelle", "02-23": "Saint Lazare", "02-24": "Saint Modeste",
    "02-25": "Saint Roméo", "02-26": "Saint Nestor", "02-27": "Sainte Honorine", "02-28": "Saint Romain", "02-29": "Saint Auguste",
    "03-01": "Saint Aubin", "03-02": "Saint Charles le Bon", "03-03": "Saint Guénolé", "03-04": "Saint Casimir",
    "03-05": "Sainte Olive", "03-06": "Sainte Colette", "03-07": "Sainte Félicité", "03-08": "Saint Jean de Dieu",
    "03-09": "Sainte Françoise", "03-10": "Saint Vivien", "03-11": "Sainte Rosine", "03-12": "Sainte Justine",
    "03-13": "Saint Rodrigue", "03-14": "Sainte Mathilde", "03-15": "Sainte Louise", "03-16": "Sainte Bénédicte",
    "03-17": "Saint Patrice", "03-18": "Saint Cyrille", "03-19": "Saint Joseph", "03-20": "Saint Herbert",
    "03-21": "Sainte Clémence", "03-22": "Sainte Léa", "03-23": "Saint Victorien", "03-24": "Sainte Catherine de Suède",
    "03-25": "Annonciation", "03-26": "Sainte Lara", "03-27": "Saint Habib", "03-28": "Saint Gontran",
    "03-29": "Sainte Gwladys", "03-30": "Saint Amédée", "03-31": "Saint Benjamin",
    "04-01": "Saint Hugues", "04-02": "Sainte Sandrine", "04-03": "Saint Richard", "04-04": "Saint Isidore",
    "04-05": "Sainte Irène", "04-06": "Saint Marcellin", "04-07": "Saint Jean-Baptiste de la Salle", "04-08": "Sainte Julie",
    "04-09": "Saint Gautier", "04-10": "Saint Fulbert", "04-11": "Saint Stanislas", "04-12": "Saint Jules",
    "04-13": "Sainte Ida", "04-14": "Saint Maxime", "04-15": "Saint Paterne", "04-16": "Saint Benoît-Joseph",
    "04-17": "Saint Anicet", "04-18": "Saint Parfait", "04-19": "Sainte Emma", "04-20": "Sainte Odette",
    "04-21": "Saint Anselme", "04-22": "Saint Alexandre", "04-23": "Saint Georges", "04-24": "Saint Fidèle",
    "04-25": "Saint Marc", "04-26": "Sainte Alida", "04-27": "Sainte Zita", "04-28": "Sainte Valérie",
    "04-29": "Sainte Catherine de Sienne", "04-30": "Saint Robert",
    "05-01": "Fête du Travail", "05-02": "Saint Boris", "05-03": "Saints Philippe et Jacques", "05-04": "Saint Sylvain",
    "05-05": "Sainte Judith", "05-06": "Sainte Prudence", "05-07": "Sainte Gisèle", "05-08": "Saint Désiré",
    "05-09": "Saint Pacôme", "05-10": "Sainte Solange", "05-11": "Sainte Estelle", "05-12": "Saint Achille",
    "05-13": "Sainte Rolande", "05-14": "Saint Matthias", "05-15": "Sainte Denise", "05-16": "Saint Honoré",
    "05-17": "Saint Pascal", "05-18": "Saint Éric", "05-19": "Saint Yves", "05-20": "Saint Bernardin",
    "05-21": "Saint Constantin", "05-22": "Saint Émile", "05-23": "Saint Didier", "05-24": "Saint Donatien",
    "05-25": "Sainte Sophie", "05-26": "Saint Bérenger", "05-27": "Saint Augustin", "05-28": "Saint Germain",
    "05-29": "Saint Aymar", "05-30": "Saint Ferdinand", "05-31": "Visitation",
    "06-01": "Saint Justin", "06-02": "Sainte Blandine", "06-03": "Saint Kévin", "06-04": "Sainte Clotilde",
    "06-05": "Saint Igor", "06-06": "Saint Norbert", "06-07": "Saint Gilbert", "06-08": "Saint Médard",
    "06-09": "Sainte Diane", "06-10": "Saint Landry", "06-11": "Saint Barnabé", "06-12": "Saint Guy",
    "06-13": "Saint Antoine de Padoue", "06-14": "Saint Élisée", "06-15": "Sainte Germaine", "06-16": "Saint Jean-François",
    "06-17": "Saint Hervé", "06-18": "Saint Léonce", "06-19": "Saint Romuald", "06-20": "Saint Silvère",
    "06-21": "Saint Rodolphe", "06-22": "Saint Alban", "06-23": "Sainte Audrey", "06-24": "Saint Jean-Baptiste",
    "06-25": "Saint Prosper", "06-26": "Saint Anthelme", "06-27": "Saint Fernand", "06-28": "Saint Irénée",
    "06-29": "Saints Pierre et Paul", "06-30": "Saint Martial",
    "07-01": "Saint Thierry", "07-02": "Saint Martinien", "07-03": "Saint Thomas", "07-04": "Saint Florent",
    "07-05": "Saint Antoine", "07-06": "Sainte Mariette", "07-07": "Saint Raoul", "07-08": "Saint Thibaut",
    "07-09": "Sainte Amélie", "07-10": "Saint Ulrich", "07-11": "Saint Benoît", "07-12": "Saint Olivier",
    "07-13": "Saint Henri", "07-14": "Fête Nationale", "07-15": "Saint Donald", "07-16": "Notre-Dame du Mont-Carmel",
    "07-17": "Sainte Charlotte", "07-18": "Saint Frédéric", "07-19": "Saint Arsène", "07-20": "Sainte Marina",
    "07-21": "Saint Victor", "07-22": "Sainte Marie-Madeleine", "07-23": "Sainte Brigitte", "07-24": "Sainte Christine",
    "07-25": "Saint Jacques", "07-26": "Sainte Anne", "07-27": "Sainte Nathalie", "07-28": "Saint Samson",
    "07-29": "Sainte Marthe", "07-30": "Sainte Juliette", "07-31": "Saint Ignace de Loyola",
    "08-01": "Saint Alphonse", "08-02": "Saint Julien Eymard", "08-03": "Sainte Lydie", "08-04": "Saint Jean-Marie Vianney",
    "08-05": "Saint Abel", "08-06": "Transfiguration", "08-07": "Saint Gaétan", "08-08": "Saint Dominique",
    "08-09": "Saint Amour", "08-10": "Saint Laurent", "08-11": "Sainte Claire", "08-12": "Sainte Clarisse",
    "08-13": "Saint Hippolyte", "08-14": "Saint Évrard", "08-15": "Assomption", "08-16": "Saint Armel",
    "08-17": "Saint Hyacinthe", "08-18": "Sainte Hélène", "08-19": "Saint Jean Eudes", "08-20": "Saint Bernard",
    "08-21": "Saint Christophe", "08-22": "Saint Fabrice", "08-23": "Sainte Rose de Lima", "08-24": "Saint Barthélemy",
    "08-25": "Saint Louis", "08-26": "Sainte Natacha", "08-27": "Sainte Monique", "08-28": "Saint Augustin",
    "08-29": "Sainte Sabine", "08-30": "Saint Fiacre", "08-31": "Saint Aristide",
    "09-01": "Saint Gilles", "09-02": "Sainte Ingrid", "09-03": "Saint Grégoire", "09-04": "Sainte Rosalie",
    "09-05": "Sainte Raïssa", "09-06": "Saint Bertrand", "09-07": "Sainte Reine", "09-08": "Nativité de Marie",
    "09-09": "Saint Alain", "09-10": "Sainte Inès", "09-11": "Saint Adelphe", "09-12": "Saint Apollinaire",
    "09-13": "Saint Aimé", "09-14": "La Sainte Croix", "09-15": "Saint Roland", "09-16": "Sainte Édith",
    "09-17": "Saint Renaud", "09-18": "Sainte Nadège", "09-19": "Sainte Émilie", "09-20": "Saint Davy",
    "09-21": "Saint Matthieu", "09-22": "Saint Maurice", "09-23": "Saint Constant", "09-24": "Sainte Thècle",
    "09-25": "Saint Hermann", "09-26": "Saints Côme et Damien", "09-27": "Saint Vincent de Paul", "09-28": "Saint Venceslas",
    "09-29": "Saints Michel et Gabriel", "09-30": "Saint Jérôme",
    "10-01": "Sainte Thérèse de l'Enfant-Jésus", "10-02": "Saints Anges Gardiens", "10-03": "Saint Gérard",
    "10-04": "Saint François d'Assise", "10-05": "Sainte Fleur", "10-06": "Saint Bruno", "10-07": "Notre-Dame du Rosaire",
    "10-08": "Sainte Pélagie", "10-09": "Saint Denis", "10-10": "Saint Ghislain", "10-11": "Saint Firmin",
    "10-12": "Saint Wilfried", "10-13": "Saint Géraud", "10-14": "Saint Juste", "10-15": "Sainte Thérèse d'Avila",
    "10-16": "Sainte Edwige", "10-17": "Saint Baudouin", "10-18": "Saint Luc", "10-19": "Saint René",
    "10-20": "Sainte Adeline", "10-21": "Sainte Céline", "10-22": "Sainte Élodie", "10-23": "Saint Jean de Capistran",
    "10-24": "Saint Florentin", "10-25": "Saint Crépin", "10-26": "Saint Dimitri", "10-27": "Sainte Émeline",
    "10-28": "Saints Simon et Jude", "10-29": "Saint Narcisse", "10-30": "Saint Bienvenu", "10-31": "Saint Quentin",
    "11-01": "La Toussaint", "11-02": "Fête des Défunts", "11-03": "Saint Hubert", "11-04": "Saint Charles Borromée",
    "11-05": "Sainte Sylvie", "11-06": "Sainte Bertille", "11-07": "Sainte Carine", "11-08": "Saint Geoffroy",
    "11-09": "Saint Théodore", "11-10": "Saint Léon", "11-11": "Saint Martin", "11-12": "Saint Christian",
    "11-13": "Saint Brice", "11-14": "Saint Sidoine", "11-15": "Saint Albert", "11-16": "Sainte Marguerite",
    "11-17": "Sainte Élisabeth", "11-18": "Sainte Aude", "11-19": "Saint Tanguy", "11-20": "Saint Edmond",
    "11-21": "Présentation de Marie", "11-22": "Sainte Cécile", "11-23": "Saint Clément", "11-24": "Sainte Flora",
    "11-25": "Sainte Catherine d'Alexandrie", "11-26": "Sainte Delphine", "11-27": "Saint Séverin", "11-28": "Saint Jacques de la Marche",
    "11-29": "Saint Saturnin", "11-30": "Saint André",
    "12-01": "Sainte Florence", "12-02": "Sainte Viviane", "12-03": "Saint François-Xavier", "12-04": "Sainte Barbe",
    "12-05": "Saint Gérald", "12-06": "Saint Nicolas", "12-07": "Saint Ambroise", "12-08": "Immaculée Conception",
    "12-09": "Saint Pierre Fourier", "12-10": "Saint Romaric", "12-11": "Saint Daniel", "12-12": "Sainte Jeanne-Françoise",
    "12-13": "Sainte Lucie", "12-14": "Sainte Odile", "12-15": "Sainte Ninon", "12-16": "Sainte Alice",
    "12-17": "Saint Gaël", "12-18": "Saint Gatien", "12-19": "Saint Urbain", "12-20": "Saint Théophile",
    "12-21": "Saint Pierre Canisius", "12-22": "Sainte Françoise-Xavière", "12-23": "Saint Armand", "12-24": "Sainte Adèle",
    "12-25": "Noël", "12-26": "Saint Étienne", "12-27": "Saint Jean", "12-28": "Saints Innocents",
    "12-29": "Saint David", "12-30": "Saint Roger", "12-31": "Saint Sylvestre"
  };

  // Calcul astronomique haute précision de la phase lunaire et de son illumination
  function computeMoonPhase(date) {
    const knownNewMoon = new Date('2024-01-11T11:57:00Z');
    const synodicMonth = 29.530588853;
    const diffDays = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const phaseDays = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;
    const normalized = phaseDays / synodicMonth;

    // Pourcentage d'illumination du disque lunaire (0% à 100%)
    const illumination = Math.round((1.0 - Math.cos(2.0 * Math.PI * normalized)) / 2.0 * 100);

    let name = "";
    let icon = "";

    // 8 phases canoniques astronomiques
    if (normalized < 0.03 || normalized >= 0.97) {
      name = "Nouvelle lune";
      icon = "🌑";
    } else if (normalized < 0.22) {
      name = "Premier croissant";
      icon = "🌒";
    } else if (normalized < 0.28) {
      name = "Premier quartier";
      icon = "🌓";
    } else if (normalized < 0.47) {
      name = "Gibbeuse croissante";
      icon = "🌔";
    } else if (normalized < 0.53) {
      name = "Pleine lune";
      icon = "🌕";
    } else if (normalized < 0.72) {
      name = "Gibbeuse décroissante";
      icon = "🌖";
    } else if (normalized < 0.78) {
      name = "Dernier quartier";
      icon = "🌗";
    } else {
      name = "Dernier croissant";
      icon = "🌘";
    }

    return {
      name: name,
      icon: icon,
      illumination: illumination,
      fullText: `${name} (${illumination}%)`
    };
  }

  // Calcul astronomique de l'aube et du crépuscule civil (Soleil à 6° sous l'horizon)
  function computeTwilight(lat, date, riseDate, setDate) {
    const rad = Math.PI / 180.0;
    const deg = 180.0 / Math.PI;
    const start = new Date(date.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((date - start) / 86400000);
    const gamma = 2.0 * Math.PI / 365.0 * (dayOfYear - 1);
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
               - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
               - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);

    function calcHourAngle(zenithDeg) {
      const cosHa = (Math.cos(zenithDeg * rad) / (Math.cos(lat * rad) * Math.cos(decl))) - (Math.tan(lat * rad) * Math.tan(decl));
      if (cosHa > 1 || cosHa < -1) return null;
      return Math.acos(cosHa) * deg;
    }

    const haSun = calcHourAngle(90.833) || 90;
    const haCivil = calcHourAngle(96.0) || 96;
    const twilightMinutes = Math.max(22, Math.round((haCivil - haSun) * 4));

    const dawn = new Date(riseDate.getTime() - twilightMinutes * 60000);
    const dusk = new Date(setDate.getTime() + twilightMinutes * 60000);

    const fmt = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    return {
      dawnStr: fmt(dawn),
      duskStr: fmt(dusk)
    };
  }

  // Flèche de vent Météociel selon l'angle de provenance
  function getMeteocielWindArrow(degrees) {
    if (degrees === null || degrees === undefined) return "•";
    // Le vent souffle vers (degrees + 180) % 360
    const blowTo = (degrees + 180) % 360;
    const arrows = ["↓", "↙", "←", "↖", "↑", "↗", "→", "↘"];
    const index = Math.round(blowTo / 45) % 8;
    return arrows[index];
  }

  // Code couleur officiel pour le vent Météociel rigoureusement conforme à Screen 1 :
  // <=5 (w-5: #97e6ff), <=10 (w-10: #33ccff), <=15 (w-15: #0099ff), <=20 (w-20: #00ff99),
  // <=25 (w-25: #33cc66), <=35 (w-35: #66cc33), <=50 (w-50: #99cc00), <=65 (w-65: #66ff00),
  // <=80 (w-80: #ffcc00), <=95 (w-95: #ff6600), >=96 (w-100: #ff3300)
  function getMeteocielWindClass(speed) {
    if (speed === null || speed === undefined || speed === "--") return "w-5";
    const val = typeof speed === "number" ? speed : parseFloat(speed);
    if (isNaN(val) || val <= 5) return "w-5";
    if (val <= 10) return "w-10";
    if (val <= 15) return "w-15";
    if (val <= 20) return "w-20";
    if (val <= 25) return "w-25";
    if (val <= 35) return "w-35";
    if (val <= 50) return "w-50";
    if (val <= 65) return "w-65";
    if (val <= 80) return "w-80";
    if (val <= 95) return "w-95";
    return "w-100";
  }

  // Classe de couleur de température Météociel Screen 1
  function getMeteocielTempClass(temp) {
    if (temp < 0) return "t-subzero";
    if (temp <= 3) return "t-cyan";
    if (temp <= 5) return "t-spring-green";
    if (temp <= 7) return "t-bright-green";
    if (temp <= 9) return "t-lime";
    if (temp <= 11) return "t-yellow-lime";
    if (temp <= 14) return "t-yellow";
    if (temp <= 18) return "t-yellow-orange";
    if (temp <= 22) return "t-orange";
    if (temp <= 26) return "t-hot-orange";
    return "t-hot-red";
  }

  // Classes de couleur d'humidité Météociel Screen 1 (<60%: #a5a5a5, 60-74%: #909090, 75-84%: #858585, >=85%: #777777)
  function getMeteocielHumidityClass(humi) {
    if (humi === null || humi === undefined || isNaN(humi)) return "h-mid";
    if (humi < 60) return "h-low";
    if (humi < 75) return "h-mid";
    if (humi < 85) return "h-high";
    return "h-veryhigh";
  }

  // Icône météo rétro stylée Météociel
  function getMeteocielWeatherIcon(code, isNight) {
    if (code === null || code === undefined || isNaN(code)) return isNight ? "🌙" : "☀️";
    if (code === 0) return isNight ? "🌙" : "☀️";
    if (code === 1 || code === 2) return isNight ? "☁️" : "🌤️";
    if (code === 3) return "☁️"; // Couvert gris
    if (code >= 45 && code <= 48) return "🌫️"; // Brouillard
    if (code >= 51 && code <= 55) return isNight ? "🌧️" : "🌦️"; // Bruine
    if (code >= 61 && code <= 63) return "🌧️"; // Pluie faible à modérée
    if (code >= 65) return "🌧️"; // Forte pluie
    if (code >= 71 && code <= 77) return "🌨️"; // Neige
    if (code >= 80 && code <= 82) return isNight ? "🌧️" : "🌦️"; // Averse
    if (code >= 95) return "⛈️"; // Orage
    return isNight ? "☁️" : "⛅";
  }



  // 1. Rendu Éphéméride & Lune (Image 3)
  function renderEphemeris(data) {
    const now = new Date();
    // Nom du jour en français (ex: Mardi 20 octobre 2026)
    const dayName = now.toLocaleDateString("fr-FR", { weekday: "long" });
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const dayNum = now.getDate();
    const monthName = now.toLocaleDateString("fr-FR", { month: "long" });
    const year = now.getFullYear();

    ephemDate.textContent = `${capitalizedDay} ${dayNum} ${monthName} ${year}`;

    // Saint du jour
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(dayNum).padStart(2, "0");
    const saintKey = `${mm}-${dd}`;
    ephemSaint.textContent = FRENCH_SAINTS[saintKey] || "Sainte Adeline";

    // Heures de Lever / Coucher
    if (data.daily && data.daily.sunrise && data.daily.sunrise[0]) {
      const riseDate = new Date(data.daily.sunrise[0]);
      const setDate = new Date(data.daily.sunset[0]);

      ephemSunrise.textContent = riseDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      ephemSunset.textContent = setDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

      // Différence de durée du jour (par rapport au jour suivant ou précédent)
      if (data.daily.sunrise[1] && data.daily.sunset[1]) {
        const durToday = setDate.getTime() - riseDate.getTime();
        const durTmrw = new Date(data.daily.sunset[1]).getTime() - new Date(data.daily.sunrise[1]).getTime();
        const diffMinutes = Math.round((durTmrw - durToday) / 60000);
        const sign = diffMinutes > 0 ? "+" : diffMinutes < 0 ? "-" : "";
        ephemDelta.textContent = `( ${sign}${diffMinutes !== 0 ? Math.abs(diffMinutes) : 0} min. )`;
      } else {
        ephemDelta.textContent = "( -3 min. )";
      }

      // Aube et Crépuscule civil calculés astronomiquement
      const lat = (currentLocation && currentLocation.lat) ? currentLocation.lat : 45.1885;
      const tw = computeTwilight(lat, now, riseDate, setDate);
      if (ephemDawn) ephemDawn.textContent = tw.dawnStr;
      if (ephemDusk) ephemDusk.textContent = tw.duskStr;
    }

    // Phase Lunaire avec pourcentage d'illumination officiel
    const moon = computeMoonPhase(now);
    if (ephemMoonIcon) ephemMoonIcon.textContent = moon.icon;
    if (ephemMoonText) ephemMoonText.textContent = moon.fullText;
  }

  // 2. Rendu Diagramme Précipitations (mm) en bâtons bleus (Image 2)
  function drawPrecipDiagram(data) {
    // Supprime a la demande de l'utilisateur
    return;
  }

  // 3. Rendu Grand Tableau Horaire Météociel à codes couleurs (Image 1)
  function renderMeteocielTable(data) {
    if (!data || !data.hourly || !data.hourly.time) return;
    const hourly = data.hourly;
    meteocielTableBody.innerHTML = "";

    // Construire les créneaux de 3h : 02h, 05h, 08h, 11h, 14h, 17h, 20h, 23h
    const slots = [];
    let current3hRain = 0;

    for (let i = 0; i < Math.min(120, hourly.time.length); i++) {
      const p = hourly.precipitation ? hourly.precipitation[i] : 0;
      current3hRain += (p || 0);

      const d = new Date(hourly.time[i]);
      const hour = d.getHours();

      if ([2, 5, 8, 11, 14, 17, 20, 23].includes(hour) || i === Math.min(120, hourly.time.length) - 1) {
        slots.push({
          date: d,
          timeStr: d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          temp: hourly.temperature_2m ? hourly.temperature_2m[i] : 0,
          windDir: hourly.wind_direction_10m ? hourly.wind_direction_10m[i] : 0,
          windSpeed: hourly.wind_speed_10m ? Math.round(hourly.wind_speed_10m[i]) : 0,
          windGust: hourly.wind_gusts_10m ? Math.round(hourly.wind_gusts_10m[i]) : 0,
          rain3h: Math.round(current3hRain * 10) / 10,
          humidity: hourly.relative_humidity_2m ? Math.round(hourly.relative_humidity_2m[i]) : 80,
          pressure: hourly.surface_pressure ? Math.round(hourly.surface_pressure[i]) : 1015,
          weatherCode: hourly.weather_code ? hourly.weather_code[i] : 0,
          isNight: hour < 7 || hour >= 20
        });
        current3hRain = 0;
      }
    }

    if (slots.length === 0) return;

    // Suppression des heures passées sauf la toute dernière passée
    const nowMs = Date.now();
    let lastPassedIdx = -1;
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].date.getTime() <= nowMs) {
        lastPassedIdx = i;
      } else {
        break;
      }
    }

    const filteredSlots = lastPassedIdx >= 0 ? slots.slice(lastPassedIdx) : slots;
    if (filteredSlots.length === 0) return;

    // Déterminer le créneau actuel (le plus proche de maintenant)
    let currentSlotObj = null;
    let minDiff = Infinity;
    filteredSlots.forEach(slot => {
      const diff = Math.abs(slot.date.getTime() - nowMs);
      if (diff < minDiff && diff < 6 * 3600 * 1000) {
        minDiff = diff;
        currentSlotObj = slot;
      }
    });

    // Regrouper par jour pour le rowspan de la colonne "Jour"
    const daysMap = [];
    let curDayKey = "";
    let curDayObj = null;

    filteredSlots.forEach(slot => {
      const dayKey = slot.date.toDateString();
      if (dayKey !== curDayKey) {
        curDayKey = dayKey;
        const dayShort = slot.date.toLocaleDateString("fr-FR", { weekday: "short" });
        const dayLabel = dayShort.charAt(0).toUpperCase() + dayShort.slice(1, 3);
        const dayNum = slot.date.getDate();
        curDayObj = {
          dayName: dayLabel,
          dayNum: dayNum,
          slots: []
        };
        daysMap.push(curDayObj);
      }
      curDayObj.slots.push(slot);
    });

    // Génération du HTML avec les classes et styles fidèles (Screen 1)
    daysMap.forEach((group, dayGroupIdx) => {
      const dayClass = (dayGroupIdx % 2 === 0) ? "td-day-even" : "td-day-odd";

      group.slots.forEach((s, idx) => {
        const tr = document.createElement("tr");
        const isCurrent = (s === currentSlotObj);
        if (isCurrent) {
          tr.className = "tr-current-slot";
        }

        // Colonne Jour fusionnée (Jour au-dessus, numéro du jour en dessous à la verticale)
        if (idx === 0) {
          const tdJour = document.createElement("td");
          tdJour.className = `td-jour-group ${dayClass}`;
          tdJour.rowSpan = group.slots.length;
          tdJour.innerHTML = `<div class="td-jour-content"><span class="td-jour-name">${group.dayName}</span><span class="td-jour-num">${group.dayNum}</span></div>`;
          tr.appendChild(tdJour);
        }

        // Colonne Heure (fond du jour actif)
        const tdHeure = document.createElement("td");
        tdHeure.className = `td-heure ${dayClass}`;
        if (isCurrent) {
          tdHeure.classList.add("td-heure-current");
        }
        tdHeure.textContent = s.timeStr;
        tr.appendChild(tdHeure);

        // Colonne Température (avec code couleur Screen 1)
        const tdTemp = document.createElement("td");
        tdTemp.className = `td-temp ${getMeteocielTempClass(s.temp)}`;
        tdTemp.textContent = `${Math.round(s.temp)} °C`;
        tr.appendChild(tdTemp);

        // Colonnes Vent (dir, moy, raf) - Même charte couleur Screen 1 pour la flèche et la vitesse
        const windClass = getMeteocielWindClass(s.windSpeed);
        const gustClass = getMeteocielWindClass(s.windGust);

        const tdVentDir = document.createElement("td");
        tdVentDir.className = `td-vent-dir ${windClass}`;
        tdVentDir.textContent = getMeteocielWindArrow(s.windDir);
        tr.appendChild(tdVentDir);

        const tdVentMoy = document.createElement("td");
        tdVentMoy.className = `td-vent-val td-vent-moy ${windClass}`;
        tdVentMoy.textContent = s.windSpeed;
        tr.appendChild(tdVentMoy);

        const tdVentRaf = document.createElement("td");
        tdVentRaf.className = `td-vent-val td-vent-raf ${gustClass}`;
        tdVentRaf.textContent = s.windGust;
        tr.appendChild(tdVentRaf);

        // Colonne Pluie sur 3h (Screen 1 : '--' couleur jour, <1mm cyan, 1-2mm teal clair, >2mm teal foncé)
        const tdPluie = document.createElement("td");
        if (s.rain3h === 0) {
          tdPluie.className = `td-pluie-none ${dayClass}`;
          tdPluie.textContent = "--";
        } else if (s.rain3h < 1.0) {
          tdPluie.className = "td-pluie-light";
          tdPluie.textContent = `${s.rain3h.toFixed(1)} mm`;
        } else if (s.rain3h <= 2.0) {
          tdPluie.className = "td-pluie-medium";
          tdPluie.textContent = `${s.rain3h.toFixed(1)} mm`;
        } else {
          tdPluie.className = "td-pluie-heavy";
          tdPluie.textContent = `${s.rain3h.toFixed(1)} mm`;
        }
        tr.appendChild(tdPluie);

        // Colonne Humidité (Screen 1 : échelle taupe/gris)
        const tdHumi = document.createElement("td");
        tdHumi.className = `td-humi ${getMeteocielHumidityClass(s.humidity)}`;
        tdHumi.textContent = `${s.humidity} %`;
        tr.appendChild(tdHumi);

        // Colonne Temps (Screen 1 : couleur du jour + icône)
        const tdTemps = document.createElement("td");
        tdTemps.className = `td-temps ${dayClass}`;
        tdTemps.textContent = getMeteocielWeatherIcon(s.weatherCode, s.isNight);
        tr.appendChild(tdTemps);

        meteocielTableBody.appendChild(tr);
      });
    });
  }

  // Démarrage de l'application
  document.addEventListener("DOMContentLoaded", () => {
    init();
    if ("serviceWorker" in navigator && (location.protocol === "http:" || location.protocol === "https:")) {
      navigator.serviceWorker.register("./sw.js?v=8.79").catch(err => {
        console.log("Service Worker non activé (normal en dev ou local) :", err);
      });
    }
  });

})();
