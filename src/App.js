import React, { useState, useRef, useEffect } from "react";
import { Toaster, toast } from 'react-hot-toast';







function normalizeReleaseRow(data) {
  const release = {
    upc: data["UPC"] || "",
    albumTitle: data["Album Title"] || "",
    albumArtist: (() => {
  try {
    const parsed = JSON.parse(data["Album Artists"]);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch (e) {
    return data["Album Artist"]
      ? Array.isArray(data["Album Artist"])
        ? data["Album Artist"]
        : [data["Album Artist"]]
      : [""];
  }
})(),
    distributor: data["Distributor"] || "",
    releaseDate: data["Digital Release Date"] || "",
    typeOfRelease: data["Type of Release"] || "",
    numTracks: data["# Tracks"] || "1",
  };

  if (data.albumArtists) {
    try {
      const parsedAlbumArtists = JSON.parse(data.albumArtists);
      if (Array.isArray(parsedAlbumArtists)) {
        release.albumArtist = parsedAlbumArtists;
      } else {
        release.albumArtist = [data.albumArtist || ""];
      }
    } catch (e) {
      console.error("Error parsing albumArtists JSON:", e);
      release.albumArtist = [data.albumArtist || ""];
    }
  }

  return release;
}




function normalizeDuration(raw) {
  if (!raw) return "";

  // 🎯 Si ya viene como "mm:ss"
  if (typeof raw === "string" && /^\d+:\d{2}$/.test(raw)) {
    return raw;
  }

  // 🧠 Si es una fracción de día (como 0.13611...)
  if (typeof raw === "number" && raw > 0 && raw < 1) {
    const totalSeconds = Math.round(raw * 86400); // 24 * 60 * 60
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  // 🧠 Si es un número entero como 676 (lo tomamos como minutos)
  if (typeof raw === "number") {
    return `${String(raw).padStart(2, "0")}:00`;
  }

  // 🧠 Si es una fecha tipo "1899-12-30T03:16:00.000Z"
  if (typeof raw === "string" && raw.includes("T")) {
    try {
      const date = new Date(raw);
      const minutes = date.getUTCHours() * 60 + date.getUTCMinutes();
      const seconds = date.getUTCSeconds();
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    } catch (err) {
      console.warn("❌ Invalid duration datetime:", raw);
      return "";
    }
  }

  return raw;
}


const COMPOSERS_DB_URL = "https://script.google.com/macros/s/AKfycbzrJdRXwsv_tQrcuQMqEE9WfRN1ZDlqwUXqJ8k7o39eA1t5lXLwiExuZmMpDD_Dmvy4iw/exec";
const ARTISTS_DB_URL = "https://script.google.com/macros/s/AKfycbzr3Mg2opXIyPXs5KZArgchglEyuZA-I135mYoL9aK2yuJIaHgCZSskdGS_mMiNShyw/exec";
const CATALOG_DB_URL = "https://script.google.com/macros/s/AKfycbxdta-h0LUQ4bHSRLF_czTFlOyIbs4z2RQjixNgVYEJOeKNp7T2rwJhi9-SZcBs57Q6/exec";
const PUBLISHERS_DB_URL = "https://script.google.com/macros/s/AKfycbzbKo0E1wih647uiiPQebf6x7Sl-LQTM9khdDhuv0D2lP79bqz69-smUUTUEsrnsuBGmA/exec";


export default function App() {
  const [isLocked, setIsLocked] = useState(false); // Fields are editable initially




  const handleEditClick = () => setIsLocked(false);
  const handleNewClick = () => {
    setIsLocked(false);
    setReleaseInfo({
      upc: "",
      albumTitle: "",
      albumArtist: [""],
      numTracks: "1",
      distributor: "Believe",
      releaseDate: "",
      typeOfRelease: "",
      coverArtPreview: null,
    });
    setTracks([{ ...createEmptyTrack(), trackNumber: 1 }]);
  };

const handleClearForm = () => {
  setReleaseInfo({
    upc: "",
    albumTitle: "",
    albumArtist: [""],
    numTracks: "1",
    distributor: "Believe",
    releaseDate: "",
    typeOfRelease: "",
    coverArt: null,
    coverArtPreview: null,
  });

  setTracks([{ ...createEmptyTrack(), trackNumber: 1 }]);


  // Optionally clear UI states
  setSuggestions([]);
  setUpcSuggestions([]);
  setAlbumSuggestions([]);
  setArtistSuggestions([]);
};




  const [upcSearch, setUpcSearch] = useState("");
  const [tracks, setTracks] = useState([{ ...createEmptyTrack(), collapsed: false }]);
  const [releaseInfo, setReleaseInfo] = useState({
    upc: "",
    albumTitle: "",
    albumArtist: [""],
    numTracks: "1",
    distributor: "Believe",
    releaseDate: "",
    recDate: "",
    typeOfRelease: "",
    coverArtPreview: null,
  });

const maybeAutofillPLine = (i, label, releaseDate) => {
  if (!label || !releaseDate) return;

  const releaseYear = new Date(releaseDate).getFullYear();
  const pLine = `${releaseYear} ${label.trim()}`;
  handleTrackChange(i, "trackPLine", pLine);
};



  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [composersDB, setComposerDB] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [upcSuggestions, setUpcSuggestions] = useState([]);
  const [upcInputFocused, setUpcInputFocused] = useState(false);
  const [highlightedUpcIndex, setHighlightedUpcIndex] = useState(-1);
  const [albumSearch, setAlbumSearch] = useState("");
  const [albumSuggestions, setAlbumSuggestions] = useState([]);
  const [highlightedAlbumIndex, setHighlightedAlbumIndex] = useState(-1);
   // default to locked after DB load
  

  const [activeInput, setActiveInput] = useState(null); // to know which input is triggering suggestions

const [artistSuggestions, setArtistSuggestions] = useState([]);
const [activeArtistInputIndex, setActiveArtistInputIndex] = useState(null);
const [highlightedArtistIndex, setHighlightedArtistIndex] = useState(-1);
const [highlightedTrackIndex, setHighlightedTrackIndex] = useState(-1);
const [artistInput, setArtistInput] = useState(""); // For filtering
const [trackSuggestions, setTrackSuggestions] = useState([]);
const [artistDB, setArtistDB] = useState([]);
const [catalogDB, setCatalogDB] = useState([]);
const [publishersDB, setPublishersDB] = useState([]);
const [activePrimaryInputIndex, setActivePrimaryInputIndex] = useState(null);
const [adminSuggestions, setAdminSuggestions] = useState([]);
const [highlightedAdminIndex, setHighlightedAdminIndex] = useState(0);
const [activeAdminField, setActiveAdminField] = useState(null); // { trackIndex, composerIndex }
const [isSubmitting, setIsSubmitting] = useState(false);
const [publisherData, setPublisherData] = useState([]);
const [composerData, setComposerData] = useState([]);



const handleTrackArtistChange = (trackIndex, artistIndex, value) => {
  const updated = [...tracks];
  updated[trackIndex].trackArtistNames[artistIndex] = value;
  setTracks(updated);
};

const addTrackArtist = (trackIndex) => {
  const updated = [...tracks];
  updated[trackIndex].trackArtistNames.push("");
  setTracks(updated);
};


useEffect(() => {
  if (!albumSearch.trim()) {
    setAlbumSuggestions([]);
    return;
  }

  const results = catalogDB.filter(entry =>
    entry["Album Title"]?.toLowerCase().includes(albumSearch.toLowerCase())
  );

  // Deduplicate by UPC
  const uniqueAlbums = [...new Map(results.map(item => [item["UPC"], item])).values()];
  setAlbumSuggestions(uniqueAlbums);
}, [albumSearch, catalogDB]);


useEffect(() => {
  if (catalogDB?.length) {
    console.log("🔍 Sample catalog entry:", catalogDB[0]);
    console.log("🔑 Keys in entry:", Object.keys(catalogDB[0]));
  }
}, [catalogDB]);


useEffect(() => {
  if (albumSearch.trim() === "") {
    setAlbumSuggestions([]);
    return;
  }

  const results = catalogDB.filter(entry =>
    entry["Album Title"]?.toLowerCase().includes(albumSearch.toLowerCase())
  );

  const uniqueResults = [...new Map(results.map(item => [item["UPC"], item])).values()];
  setAlbumSuggestions(uniqueResults);
}, [albumSearch, catalogDB]);




useEffect(() => {
  fetch(PUBLISHERS_DB_URL)
    .then(res => res.json())
    .then(data => {
      console.log("✅ Raw PublishersDB data:", data);
      const normalized = data.map(p => ({
        publisher: p.publisher || "",
        publisherIPI: p.publisheripi || "",
        publisherPRO: p.publisherpro || "",
        publisheradmin: p.publisheradmin || "",
        publisheradminIPI: p.publisheradminipi || "",
        publisheradminShare: p.publisheradmincollectionshare || "",
      }));
      console.log("✅ Normalized PublishersDB:", normalized);
      setPublishersDB(normalized);  // ← THIS MUST BE CALLED
    })
    .catch(err => console.error("Failed to fetch PublishersDB", err));
}, []);

const handleAlbumSuggestionClick = (albumEntry) => {
  const upc = albumEntry["UPC"];
  const matches = catalogDB.filter((entry) => entry["UPC"] === upc);

  if (!matches.length) return;

  // Load release-level metadata from first match
  const main = matches[0];
  setReleaseInfo((prev) => ({
    ...prev,
    albumTitle: main["Album Title"] || "",
albumArtist: (() => {
  if (main["Album Artists"]) {
    try {
      const parsed = JSON.parse(main["Album Artists"]);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch (e) {
      console.error("Error parsing Album Artists:", e);
      return [main["Album Artist"] || ""];
    }
  } else {
    return main["Album Artist"]
      ? Array.isArray(main["Album Artist"])
        ? main["Album Artist"]
        : [main["Album Artist"]]
      : [""];
  }
})(),
    upc: main["UPC"] || "",
    distributor: main["Distributor"] || "",
releaseDate: main["Digital Release Date"]
  ? new Date(main["Digital Release Date"]).toISOString().split("T")[0]
  : "",
    typeOfRelease: main["Type of Release"] || "",
    numTracks: main["# Tracks"] || "",
  }));

  // Load tracks
const newTracks = matches.map((entry) => {
  let composerData = [];
  let publisherData = [];

  // 🎯 Wrap each parser in its own try-catch for better debugging
  try {
    if (typeof entry.Composers === "string") {
      composerData = JSON.parse(entry.Composers);
    } else {
      composerData = entry.Composers || [];
    }
  } catch (err) {
    console.error("❌ Error parsing Composers JSON for entry:", entry["Primary Title"], "\nRaw:", entry.Composers, "\nError:", err);
    composerData = [];
  }

  try {
    if (typeof entry.Publishers === "string") {
      publisherData = JSON.parse(entry.Publishers);
    } else {
      publisherData = entry.Publishers || [];
    }
  } catch (err) {
    console.error("❌ Error parsing Publishers JSON for entry:", entry["Primary Title"], "\nRaw:", entry.Publishers, "\nError:", err);
    publisherData = [];
  }

  console.log("🔍 Parsed publisher sample for", entry["Primary Title"] || "unknown", ":", publisherData?.[0] || "No publisher");



const composers = composerData.map((c) => {
  return {
    firstName: c["First Name"] || "",
    middleName: c["Middle Name"] || "",
    lastName: c["Last Name"] || "",
    ipi: c["IPI"] || "",
    pro: c["PRO"] || "",
    roleCode: c["Role Code"] || "",
    split: c["Split"] || "",
    composeraddress: c["Address"] || "",
    composercity: c["City"] || "",
    composerstate: c["State"] || "",
    composerzip: c["Zip"] || "",
    publisher: c["Publisher"] || "",
    publisherIPI: c["Publisher IPI"] || "",
    publisherPRO: c["Publisher PRO"] || "",
    pubadmin: c["Publisher Admin"] || "",
    pubadminIPI: c["Publisher Admin IPI"] || "",
    pubadminShare: c["Publisher Admin Collection Share"] || "",
    collapsed: true,
  };
});

    // ✅ Handle multiple track artists
let trackArtists = [];

try {
  const possibleArray = JSON.parse(entry["Track Artist Name"]);
  if (Array.isArray(possibleArray)) {
    trackArtists = possibleArray;
   console.log("✅ Parsed track artist array:", trackArtists);
  }
} catch {
  // Not a JSON array, fall back to gathering from individual fields
  for (let k = 1; k <= 8; k++) {
  const key = k === 1 ? "Track Artist Name" : `Track Artist Name ${k}`;
  const value = entry[key];
  if (value && value.trim()) {
    trackArtists.push(value.trim());
  }
}
}




// Default to one empty string if still empty
if (trackArtists.length === 0) trackArtists.push("");

return {
  primaryTitle: entry["Primary Title"] || "",
  trackArtistNames: trackArtists,
  trackNumber: entry["Track Number"] || "",
  recordingTitle: entry["Recording Title"] || "",
  akaTitle: entry["AKA Title"] || "",
  akaTypeCode: entry["AKA Type Code"] || "",
  isrc: entry["ISRC"] || "",
  iswc: entry["ISWC"] || "",
  duration: normalizeDuration(entry["Duration"]),
  trackLabel: entry["Track Label"] || "",
  trackPLine: entry["Track P Line"] || "",
  countryRelease: entry["Country of Release"] || "",
  basisClaim:  entry["Basis of Claim"] || "",
  percentClaim: entry["Percent of Claim"] || "",
  collectionEnd: entry["Collection End Date"] || "",
  nonUSRights: entry["Non-US Collection Rights"] || "",
  genre: entry["Genre"] || "",
  recEng: entry["Recording Engineer"] || "",
  producer: entry["Producer"] || "",
  execProducer: entry["Executive Producer"] || "", 
  composers,
  collapsed: true,
};
  });

  setTracks(newTracks);
  setAlbumSuggestions([]);
  toast.success(`✅ ${newTracks.length} track(s) loaded from album`);
};

const [publisherSuggestions, setPublisherSuggestions] = useState([]);
const [activePublisherField, setActivePublisherField] = useState(null);
const handlePublisherSuggestionClick = (publisherData, trackIndex, composerIndex) => {
  const updated = [...tracks];
  updated[trackIndex].composers[composerIndex] = {
    ...updated[trackIndex].composers[composerIndex],
    publisher: publisherData.publisher || "",
    publisherIPI: publisherData.publisheripi || "", // lowercase!
    publisherPRO: publisherData.publisherpro || "", // lowercase!
    pubadmin: publisherData.publisheradmin || "",   // match exact key
    pubadminIPI: publisherData.publisheradminipi || "",
    pubadminShare: publisherData.publisheradmincollectionshare || ""
  };
  setTracks(updated);
  setPublisherSuggestions([]);
};

const handleAdminSuggestionClick = (adminData, trackIndex, composerIndex) => {
  const updated = [...tracks];
  updated[trackIndex].composers[composerIndex] = {
    ...updated[trackIndex].composers[composerIndex],
    pubadmin: adminData.publisheradmin || "",
    pubadminIPI: adminData.publisheradminipi || "",
    pubadminShare: adminData.publisheradmincollectionshare || "",
  };
  setTracks(updated);
  setAdminSuggestions([]);
};


const handleUpcSuggestionClick = (entry) => {
  const upc = entry["UPC"];
  const matches = catalogDB.filter(e => e["UPC"] === upc);

  if (matches.length === 0) {
    toast.error("No tracks found for selected UPC");
    return;
  }

  // ✅ Actualiza releaseInfo con metadatos del primer match
  const main = matches[0];
  setReleaseInfo((prev) => ({
    ...prev,
    albumTitle: main["Album Title"] || "",
albumArtist: (() => {
  if (main["Album Artists"]) {
    try {
      const parsed = JSON.parse(main["Album Artists"]);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch (e) {
      console.error("Error parsing Album Artists:", e);
      return [main["Album Artist"] || ""];
    }
  } else {
    return main["Album Artist"]
      ? Array.isArray(main["Album Artist"])
        ? main["Album Artist"]
        : [main["Album Artist"]]
      : [""];
  }
})(),
    upc: main["UPC"] || "",
    distributor: main["Distributor"] || "",
releaseDate: main["Digital Release Date"]
  ? new Date(main["Digital Release Date"]).toISOString().split("T")[0]
  : "",
    typeOfRelease: main["Type of Release"] || "",
    numTracks: main["# Tracks"] || "",
  }));

  // ✅ Procesar tracks como ya lo tenías
  const newTracks = matches.map((entry) => {
    let composerData = [];
    let publisherData = [];

    try {
      composerData = typeof entry.Composers === "string" ? JSON.parse(entry.Composers) : entry.Composers || [];
      publisherData = typeof entry.Publishers === "string" ? JSON.parse(entry.Publishers) : entry.Publishers || [];
    } catch (err) {
      console.error("Error parsing composer or publisher data", err);
    }

    const composers = composerData.map((c) => {
  return {
    firstName: c["First Name"] || "",
    middleName: c["Middle Name"] || "",
    lastName: c["Last Name"] || "",
    ipi: c["IPI"] || "",
    pro: c["PRO"] || "",
    roleCode: c["Role Code"] || "",
    split: c["Split"] || "",
    composeraddress: c["Address"] || "",
    composercity: c["City"] || "",
    composerstate: c["State"] || "",
    composerzip: c["Zip"] || "",
    publisher: c["Publisher"] || "",
    publisherIPI: c["Publisher IPI"] || "",
    publisherPRO: c["Publisher PRO"] || "",
    pubadmin: c["Publisher Admin"] || "",
    pubadminIPI: c["Publisher Admin IPI"] || "",
    pubadminShare: c["Publisher Admin Collection Share"] || "",
    collapsed: true,
  };
});

    return {
      primaryTitle: entry["Primary Title"] || "",
trackArtistNames: (() => {
  const raw = entry["Track Artist Name"];
  if (!raw) return [""];
  if (Array.isArray(raw)) return raw;

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return [String(raw)];
  }
})(),
      trackNumber: entry["Track Number"] || "",
      recordingTitle: entry["Recording Title"] || "",
      akaTitle: entry["AKA Title"] || "",
      akaTypeCode: entry["AKA Type Code"] || "",
      isrc: entry["ISRC"] || "",
      iswc: entry["ISWC"] || "",
      duration: normalizeDuration(entry["Duration"]),
      trackLabel: entry["Track Label"] || "",
      trackPLine: entry["Track P Line"] || "",
      countryRelease: entry["Country of Release"] || "",
      basisClaim:  entry["Basis of Claim"] || "",
      percentClaim: entry["Percent of Claim"] || "",
      collectionEnd: entry["Collection End Date"] || "",
      nonUSRights: entry["Non-US Collection Rights"] || "",
      genre: entry["Genre"] || "",      
      recEng: entry["Recording Engineer"] || "",
      producer: entry["Producer"] || "",
      execProducer: entry["Executive Producer"] || "", 
      composers,
      collapsed: true
    };
  });

  setTracks(newTracks);
  setUpcSuggestions([]);
  setHighlightedUpcIndex(-1);
  toast.success(`🎵 Loaded ${newTracks.length} track(s) from UPC`);
};

const handleUpcSuggestionSelect = (entry) => {
  try {
    const composers = (typeof entry.Composers === "string"
      ? JSON.parse(entry.Composers)
      : entry.Composers || []
    ).map((c, idx) => {
      const pub = (typeof entry.Publishers === "string"
        ? JSON.parse(entry.Publishers)
        : entry.Publishers || []
      )[idx] || {};

      return {
        firstName: c["First Name"] || "",
        middleName: c["Middle Name"] || "",
        lastName: c["Last Name"] || "",
        ipi: c["IPI"] || "",
        pro: c["PRO"] || "",
        roleCode: c["Role Code"] || "",
        split: c["Split"] || "",
        composeraddress: c["Address"] || "",
        composercity: c["City"] || "",
        composerstate: c["State"] || "",
        composerzip: c["Zip"] || "",
        publisher: pub["Publisher"] || "",
        publisherIPI: pub["Publisher IPI"] || "",
        publisherPRO: pub["Publisher PRO"] || "",
        pubadmin: entry["Publisher Admin"] || "",
        pubadminIPI: entry["Publisher Admin IPI"] || "",
        pubadminShare: entry["Publisher Admin Collection Share"] || "",
      };
    });

    setTracks([
      {
        primaryTitle: entry["Primary Title"] || "",
trackArtistNames: (() => {
  const raw = entry["Track Artist Name"];
  if (!raw) return [""];
  if (Array.isArray(raw)) return raw;

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return [String(raw)];
  }
})(),
        trackNumber: entry["Track Number"] || "",
        recordingTitle: entry["Recording Title"] || "",
        akaTitle: entry["AKA Title"] || "",
        akaTypeCode: entry["AKA Type Code (MLC)"] || "",
        isrc: entry["ISRC"] || "",
        iswc: entry["ISWC"] || "",
        duration: normalizeDuration(entry["Duration"]),
        trackLabel: entry["Track Label"] || "",
        trackPLine: entry["Track P Line"] || "",
        countryRelease: entry["Country of Release"] || "",
        basisClaim:  entry["Basis of Claim"] || "",
        percentClaim: entry["Percent of Claim"] || "",
        collectionEnd: entry["Collection End Date"] || "",
        nonUSRights: entry["Non-US Collection Rights"] || "",
        genre: entry["Genre"] || "",
        recEng: entry["Recording Engineer"] || "",
        producer: entry["Producer"] || "",
        execProducer: entry["Executive Producer"] || "", 
        composers,
      },
    ]);

    toast.success(`✅ Track loaded for UPC ${entry["UPC"]}`);
    setUpcSuggestions([]);
    setHighlightedUpcIndex(-1);
  } catch (err) {
    console.error("Error loading UPC track:", err);
    toast.error("Error loading UPC track");
  }
};


  const trackRefs = useRef([]);
  const composerRefs = useRef({});
  const trackAddedRef = useRef(false);
  useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest("ul")) {
      setSuggestions([]);
      setActiveInput(null);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  
  const handleTrackArtistChange = (trackIndex, artistIndex, value) => {
    const updated = [...tracks];
    updated[trackIndex].trackArtistNames[artistIndex] = value;
    setTracks(updated);
  };

  const addTrackArtist = (trackIndex) => {
    const updated = [...tracks];
    updated[trackIndex].trackArtistNames.push("");
    setTracks(updated);
  };


  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

useEffect(() => {
  if (catalogDB.length) {
    console.log("🧾 Sample catalogDB record:", catalogDB[0]);
    console.log("🧾 Available keys:", Object.keys(catalogDB[0]));
  }
}, [catalogDB]);

useEffect(() => {
  async function fetchComposers() {
    try {
      const response = await fetch(COMPOSERS_DB_URL);
      const raw = await response.json();
      console.log("Raw composersDB:", raw);

console.log("Raw composer data before normalization:", raw);

      // 🔧 Normalize keys to match your code
      const normalized = raw.map((c) => ({
        firstName: c["First Name"] || "",
        middleName: c["Middle Name"] || "",
        lastName: c["Last Name"] || "",
        ipi: c["IPI"] || "",
        pro: c["PRO"] || "",
        publisher: c["Publisher"] || "",
        publisherIPI: c["Publisher IPI"] || "",
        publisherPRO: c["Publisher PRO"] || "",
        pubadmin: c["Publisher Admin"] || "",
        pubadminIPI: c["Publisher Admin IPI"] || "",
        pubadminShare: c["Publisher Admin Collection Share"] || "",
        composeraddress: c["Address"] || "",
        composercity: c["City"] || "",
        composerstate: c["State"] || "",
        composerzip: c["Zip"] || "",

      }));

      setComposerDB(normalized);
    } catch (error) {
      console.error("Failed to fetch composers:", error);
    }
  }

  fetchComposers();
}, []);
useEffect(() => {
  async function fetchArtists() {
    try {
      const response = await fetch(ARTISTS_DB_URL);
      const data = await response.json();
      console.log("Fetched artistDB:", data); // 👈 Add this line
      setArtistDB(data);
    } catch (error) {
      console.error("Failed to fetch artists:", error);
    }
  }

  fetchArtists();
}, []);

useEffect(() => {
  async function fetchCatalog() {
    try {
      const response = await fetch(CATALOG_DB_URL);
      const data = await response.json();
      setCatalogDB(data);
    } catch (error) {
      console.error("Failed to fetch catalog:", error);
    }
  }

  fetchCatalog();
}, []);
useEffect(() => {
  async function fetchPublishers() {
    try {
      const response = await fetch(PUBLISHERS_DB_URL);
      const data = await response.json();
      setPublishersDB(data);
    } catch (error) {
      console.error("Failed to fetch publishers:", error);
    }
  }

  fetchPublishers();
}, []);

  useEffect(() => {
  if (trackAddedRef.current) {
    const lastIndex = trackRefs.current.length - 1;
    if (lastIndex >= 0 && trackRefs.current[lastIndex]) {
      trackRefs.current[lastIndex].scrollIntoView({ behavior: "smooth", block: "start" });
    }
    trackAddedRef.current = false; // reset after scroll
  }
}, [tracks.length]);
function createEmptyTrack() {
  return {
    trackNumber: "",
    primaryTitle: "",
    recordingTitle: "",
    akaTitle: "",
    akaTypeCode: "",
    countryRelease: "United States",
    basisClaim: "Copyright Owner",
    percentClaim: "",
    collectionEnd: "12/31/3000",
    nonUSRights: "Worldwide",
    genre: "Regional Mexican",
    recDate: "",
    recEng: "",
    producer: "",
    execProducer:"",
    audioFile: null,
    isrc: "",
    iswc: "",
    trackLabel: "",
    duration: "",
    trackPLine: "",
    trackArtistNames: [""], // <-- update from single to array
    typeOfRelease: "",
    collapsed: true,
    composers: [createEmptyComposer()],
    publishers: [],
  };
}

  function createEmptyComposer() {
    return {
      firstName: "",
      middleName: "",
      lastName: "",
      composeraddress: "",
      composercity: "",
      composerstate: "",
      composerzip: "",
      ipi: "",
      split: "",
      pro: "",
      roleCode: "CA",
      publisher: "",
      publisherIPI: "",
      publisherPRO: "",
      pubadmin: "",
      pubadminIPI: "",
      pubadminShare: "",
    };
  }

  const handleTrackChange = (index, field, value) => {
    const updated = [...tracks];
    updated[index][field] = value;
    setTracks(updated);
  };





const handleComposerChange = (trackIndex, composerIndex, field, value) => {
  const updated = [...tracks];
  updated[trackIndex].composers[composerIndex][field] = value;

if (field === "publisheradmin") {
  console.log("📥 Admin input typed:", value);
  const input = value.toLowerCase();
  const matches = publishersDB.filter((p) =>
    p.publisheradmin?.toLowerCase?.().startsWith(input)
  );
  console.log("📚 publishersDB:", publishersDB);
  console.log("✅ Matched admins:", matches);
  setAdminSuggestions(matches);
  setHighlightedAdminIndex(0);
  setActiveAdminField({ trackIndex, composerIndex });
}


  // Composer name suggestions (first/last)
  if (field === "firstName" || field === "lastName") {
    const input = value.toLowerCase();
    const matches = composersDB.filter((c) =>
      c.firstName?.toLowerCase?.().startsWith(input) ||
      c.lastName?.toLowerCase?.().startsWith(input)
    );

    setSuggestions(matches);
    setHighlightedIndex(0);
    setActiveInput({ trackIndex, composerIndex, field });

    // Auto-fill when both fields are typed
    const composer = updated[trackIndex].composers[composerIndex];
    if (composer.firstName && composer.lastName) {
      const match = composersDB.find(
        (c) =>
          c.firstName?.toLowerCase?.() === composer.firstName.toLowerCase() &&
          c.lastName?.toLowerCase?.() === composer.lastName.toLowerCase()
      );
      if (match) {
        updated[trackIndex].composers[composerIndex] = {
          ...composer, // keep typed names
          ...match     // fill rest
        };
        setSuggestions([]);

if (field === "pubadmin") {
  const input = value.toLowerCase();
  const matches = publishersDB.filter((p) =>
    p.pubadmin?.toLowerCase?.().startsWith(input)
  );
  setAdminSuggestions(matches);
  setHighlightedAdminIndex(0);
  setActiveAdminField({ trackIndex, composerIndex });
}
      }
    }
  }

  // Publisher name suggestions
  if (field === "publisher") {
    const input = value.toLowerCase();


    // ✅ Add debug logs here
    console.log("📥 User typed:", input);
    console.log("📚 publishersDB:", publishersDB);

    const matches = publishersDB.filter((p) =>
      p.publisher?.toLowerCase?.().startsWith(input)
    );

    console.log("✅ Matched publishers:", matches); // 👈 This is the key one
    setPublisherSuggestions(matches);
    setHighlightedIndex(0);
    setActivePublisherField({ trackIndex, composerIndex });
  }

  setTracks(updated);
};

  const addComposer = (trackIndex) => {
    const updated = [...tracks];
    updated[trackIndex].composers.push(createEmptyComposer());
    setTracks(updated);

    setTimeout(() => {
      const newComposerKey = `${trackIndex}-${updated[trackIndex].composers.length - 1}`;
      if (composerRefs.current[newComposerKey]) {
        composerRefs.current[newComposerKey].scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };
  const removeTrack = (index) => {
  const updated = tracks.filter((_, i) => i !== index);
  setTracks(updated);
  setReleaseInfo((prev) => ({
    ...prev,
    numTracks: updated.length.toString(),
  }));
};
  const addTrack = () => {
    if (releaseInfo.typeOfRelease === "Single" && tracks.length >= 1) return;
    if (releaseInfo.typeOfRelease === "EP" && tracks.length >= 9) return;

    const updated = tracks.map((t) => ({ ...t, collapsed: true }));
    const newTrack = { ...createEmptyTrack(), collapsed: false };
    const newTracks = [...updated, newTrack];
    setTracks(newTracks);
    trackAddedRef.current = true;
    setReleaseInfo((prev) => ({
      ...prev,
      numTracks: newTracks.length.toString(),
    }));
  };
const handleUpcSearch = () => {
  if (!upcSearch) return;

  const matches = catalogDB.filter(entry => entry?.["UPC"] === upcSearch);

  if (matches.length === 0) {
    toast.error("UPC not found in catalog");
    return;
  }

  const newTracks = matches.map((entry) => {
    let composerData = [];
    let publisherData = [];

    try {
      composerData = typeof entry.Composers === "string" ? JSON.parse(entry.Composers) : entry.Composers || [];
      publisherData = typeof entry.Publishers === "string" ? JSON.parse(entry.Publishers) : entry.Publishers || [];
    } catch (err) {
      console.error("Error parsing composer or publisher data", err);
    }

    const composers = composerData.map((c) => {
  return {
    firstName: c["First Name"] || "",
    middleName: c["Middle Name"] || "",
    lastName: c["Last Name"] || "",
    ipi: c["IPI"] || "",
    pro: c["PRO"] || "",
    roleCode: c["Role Code"] || "",
    split: c["Split"] || "",
    composeraddress: c["Address"] || "",
    composercity: c["City"] || "",
    composerstate: c["State"] || "",
    composerzip: c["Zip"] || "",
    publisher: c["Publisher"] || "",
    publisherIPI: c["Publisher IPI"] || "",
    publisherPRO: c["Publisher PRO"] || "",
    pubadmin: c["Publisher Admin"] || "",
    pubadminIPI: c["Publisher Admin IPI"] || "",
    pubadminShare: c["Publisher Admin Collection Share"] || "",
    collapsed: true,
  };
});

    // ✅ Handle multiple track artists
let trackArtists = [];

try {
  const possibleArray = JSON.parse(entry["Track Artist Name"]);
  if (Array.isArray(possibleArray)) {
    trackArtists = possibleArray;
  }
} catch {
  // Not a JSON array, fall back to gathering from individual fields
  for (let k = 0; k <= 8; k++) {
    const key = k === 0 ? "Track Artist Name" : `Track Artist Name ${k}`;
    const value = entry[key];
    if (value && value.trim()) {
      trackArtists.push(value.trim());
    }
  }
}

// Default to one empty string if still empty
if (trackArtists.length === 0) trackArtists.push("");

return {
  primaryTitle: entry["Primary Title"] || "",
  trackArtistNames: trackArtists,
  trackNumber: entry["Track Number"] || "",
  recordingTitle: entry["Recording Title"] || "",
  akaTitle: entry["AKA Title"] || "",
  akaTypeCode: entry["AKA Type Code"] || "",
  countryRelease: entry["Country of Release"] || "",
  basisClaim:  entry["Basis of Claim"] || "",
  percentClaim: entry["Percent of Claim"] || "",
  collectionEnd: entry["Collection End Date"] || "",
  nonUSRights: entry["Non-US Collection Rights"] || "",
  genre: entry["Genre"] || "",
  recDate: entry["Recording Date"] || "",
  recEng: entry["Recording Engineer"] || "",
  producer: entry["Producer"] || "",
  execProducer: entry["Executive Producer"] || "",  
  isrc: entry["ISRC"] || "",
  iswc: entry["ISWC"] || "",
  duration: normalizeDuration(entry["Duration"]),
  trackLabel: entry["Track Label"] || "",
  trackPLine: entry["Track P Line"] || "",
  composers,
};
  });

  setTracks(newTracks);
  toast.success(`✅ ${newTracks.length} track(s) loaded for UPC`);
};

  const handleReleaseInfoChange = (field, value) => {
  if (field === "coverArt") {
    const file = value;
    const previewURL = file ? URL.createObjectURL(file) : null;
    setReleaseInfo((prev) => ({
      ...prev,
      coverArt: file,
      coverArtPreview: previewURL,
    }));
  } else if (field === "numTracks") {
    const count = Math.max(0, parseInt(value || "0"));
    const newTracks = [...tracks];
    while (newTracks.length < count) {
      newTracks.push({ ...createEmptyTrack(), collapsed: true });
    }
    while (newTracks.length > count) {
      newTracks.pop();
    }
    setTracks(newTracks);

    setReleaseInfo({ ...releaseInfo, [field]: value });
  } else {
    setReleaseInfo({ ...releaseInfo, [field]: value });
  }
};

const addAlbumArtist = () => {
  setReleaseInfo(prev => ({
    ...prev,
    albumArtist: [...prev.albumArtist, ""],
  }));
};

const handleAlbumArtistChange = (index, value) => {
  const updated = [...releaseInfo.albumArtist];
  updated[index] = value;
  setReleaseInfo(prev => ({
    ...prev,
    albumArtist: updated,
  }));
};




  function renderInput(label, value, onChange, placeholder = "") {
    
  const handleTrackArtistChange = (trackIndex, artistIndex, value) => {
    const updated = [...tracks];
    updated[trackIndex].trackArtistNames[artistIndex] = value;
    setTracks(updated);
  };

  const addTrackArtist = (trackIndex) => {
    const updated = [...tracks];
    updated[trackIndex].trackArtistNames.push("");
    setTracks(updated);
  };

const handleSubmit = async () => {
  try {
    setIsSubmitting(true);

    const payload = {
      releaseInfo,
      tracks,
      composers: composerData,
      publishers: publisherData,
    };

    // 🔍 Debug
    console.log("📦 Payload to webhook:", JSON.stringify(payload, null, 2));

    // 🚀 Send to your main webhook (n8n)
    const response = await fetch("https://rigoletto.app.n8n.cloud/webhook/fd8ebef7-dccb-4b7f-9381-1702ea074949", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      alert("❌ Webhook submission failed.");
    }

    // Optionally still save to your Google Sheet endpoints
    await fetch(ARTISTS_DB_URL, {
      method: "POST",
      body: JSON.stringify(releaseInfo),
      headers: { "Content-Type": "application/json" },
    });

    for (const track of tracks) {
      await fetch(CATALOG_DB_URL, {
        method: "POST",
        body: JSON.stringify(track),
        headers: { "Content-Type": "application/json" },
      });
    }

    for (const composer of composerData) {
      await fetch(COMPOSERS_DB_URL, {
        method: "POST",
        body: JSON.stringify(composer),
        headers: { "Content-Type": "application/json" },
      });
    }

    if (publisherData?.length) {
      for (const publisher of publisherData) {
        await fetch(PUBLISHERS_DB_URL, {
          method: "POST",
          body: JSON.stringify(publisher),
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    alert("✅ Data submitted successfully!");
    handleClearForm();
  } catch (error) {
    console.error("❌ Error submitting form:", error);
    alert("❌ Something went wrong.");
  } finally {
    setIsSubmitting(false);
  }
};

  





  return (


    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">Music Catalog Data Entry</h1>

        <section className="mb-10 border-b pb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Release Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Type of Release</label>
              <select
                className="p-2 h-11 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={releaseInfo.typeOfRelease || ""}
                onChange={(e) => handleReleaseInfoChange("typeOfRelease", e.target.value)}
              >
                <option value="" disabled>Select type</option>
                <option value="Single">Single</option>
                <option value="Album">Album</option>
                <option value="EP">EP</option>
              </select>
            
            </div>
            <div className="relative flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">UPC</label>
  <input
    disabled={isLocked}
    type="text"
    value={releaseInfo.upc || ""}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, "");
      handleReleaseInfoChange("upc", value);

      const matches = catalogDB.filter(entry =>
        entry?.["UPC"]?.toString().startsWith(value)
      );
      const unique = [...new Map(matches.map(item => [item["UPC"], item])).values()];
      setUpcSuggestions(unique);
      setHighlightedUpcIndex(-1);
    }}
    onKeyDown={(e) => {
      if (upcSuggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedUpcIndex(prev =>
            prev < upcSuggestions.length - 1 ? prev + 1 : prev
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedUpcIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (highlightedUpcIndex >= 0) {
            handleUpcSuggestionClick(upcSuggestions[highlightedUpcIndex]);
          }
        } else if (e.key === "Escape") {
          setUpcSuggestions([]);
          setHighlightedUpcIndex(-1);
        }
      }
    }}
    onBlur={() => setTimeout(() => setUpcSuggestions([]), 200)}
    placeholder="Buscar por UPC"
    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
  />

  {upcSuggestions.length > 0 && (
    <ul className="absolute z-10 mt-12 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
      {upcSuggestions.map((sugg, idx) => (
        <li
          key={idx}
          className={`p-2 hover:bg-blue-100 cursor-pointer ${
            highlightedUpcIndex === idx ? "bg-blue-100" : ""
          }`}
          onMouseDown={() => handleUpcSuggestionClick(sugg)}
        >
          {sugg["UPC"]} — {sugg["Album Title"] || "Sin título"}
        </li>
      ))}
    </ul>
  )}
</div>

<div className="flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">{albumArtistLabel}(s)</label>
{Array.isArray(releaseInfo.albumArtist) &&
  releaseInfo.albumArtist.map((artist, idx) => (
  <React.Fragment key={idx}>
    <div className="relative flex items-center mb-2">
      <input
        type="text"
        value={artist}
        placeholder={`Artist ${idx + 1}`}
        onChange={(e) => {
          const value = e.target.value;
          handleAlbumArtistChange(idx, value);

          if (value.length > 0) {
            const matches = artistDB
              .map((a) => a["Artist Name"])
              .filter((name) =>
                name?.toLowerCase().startsWith(value.toLowerCase())
              );
            setArtistSuggestions(matches);
            setHighlightedArtistIndex(0);
            setActiveArtistInputIndex(`album-${idx}`);
          } else {
            setArtistSuggestions([]);
            setActiveArtistInputIndex(null);
          }
        }}
        onKeyDown={(e) => {
          if (artistSuggestions.length > 0) {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlightedArtistIndex((prev) =>
                prev < artistSuggestions.length - 1 ? prev + 1 : 0
              );
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightedArtistIndex((prev) =>
                prev > 0 ? prev - 1 : artistSuggestions.length - 1
              );
            } else if (e.key === "Enter") {
              e.preventDefault();
              const selected = artistSuggestions[highlightedArtistIndex];
              if (selected) {
                handleAlbumArtistChange(idx, selected);
                setArtistSuggestions([]);
                setActiveArtistInputIndex(null);
              }
            }
          }
        }}
        onBlur={() => setTimeout(() => setArtistSuggestions([]), 150)}
        className="p-2 border border-gray-300 rounded-md w-full"
      />

      {/* Trashcan to remove artist */}
      {releaseInfo.albumArtist.length > 1 && (
        <button
          type="button"
          onClick={() => {
            const updated = [...releaseInfo.albumArtist];
            updated.splice(idx, 1);
            setReleaseInfo((prev) => ({
              ...prev,
              albumArtist: updated,
            }));
          }}
          className="ml-2 text-red-500 hover:text-red-700 text-lg"
          title="Remove Artist"
        >
          🗑️
        </button>
      )}
    </div>

    {/* Suggestions Dropdown */}
    {activeArtistInputIndex === `album-${idx}` &&
      artistSuggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
          {artistSuggestions.map((name, i) => (
            <li
              key={i}
              className={`p-2 cursor-pointer ${
                highlightedArtistIndex === i ? "bg-blue-100" : ""
              }`}
              onMouseDown={() => {
                handleAlbumArtistChange(idx, name);
                setArtistSuggestions([]);
                setActiveArtistInputIndex(null);
              }}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
  </React.Fragment>
))}
  <button
    type="button"
    className="text-blue-600 hover:text-blue-800 text-sm mt-1 self-start"
    onClick={addAlbumArtist}
  >
    + Add Another Artist
  </button>
</div>


<div className="flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">Digital Release Date</label>
  <input
     disabled={isLocked}type="date"
    value={releaseInfo.releaseDate || ""}
    onChange={(e) => handleReleaseInfoChange("releaseDate", e.target.value)}
    className="p-2 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
</div>
            
<div className="relative flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">Album Title</label>
  <input
    disabled={isLocked}
    type="text"
    value={releaseInfo.albumTitle || ""}
    onChange={(e) => {
      const value = e.target.value;
      handleReleaseInfoChange("albumTitle", value);
      setAlbumSearch(value);
      setHighlightedAlbumIndex(0); // 👈 reinicia selección al escribir
    }}
    onKeyDown={(e) => {
      if (albumSuggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedAlbumIndex((prev) =>
            prev < albumSuggestions.length - 1 ? prev + 1 : prev
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedAlbumIndex((prev) =>
            prev > 0 ? prev - 1 : 0
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (highlightedAlbumIndex >= 0) {
            handleAlbumSuggestionClick(albumSuggestions[highlightedAlbumIndex]);
          }
        }
      }
    }}
    onBlur={() => setTimeout(() => setAlbumSuggestions([]), 200)}
    placeholder="Search by album title"
    className="p-2 border border-gray-300 rounded-md w-full"
  />

  {albumSuggestions.length > 0 && (
    <ul className="absolute z-10 mt-12 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
      {albumSuggestions.map((sugg, idx) => (
        <li
          key={idx}
          className={`p-2 cursor-pointer ${
            highlightedAlbumIndex === idx ? "bg-blue-100" : "hover:bg-blue-50"
          }`}
          onMouseDown={() => handleAlbumSuggestionClick(sugg)}
          onMouseEnter={() => setHighlightedAlbumIndex(idx)} // 👈 esto permite resaltar con el mouse
        >
          {sugg["Album Title"] || "Unknown Album"} — {sugg["Album Artist"] || "Unknown Artist"}
        </li>
      ))}
    </ul>
  )}
</div>
     

  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1"># of Tracks</label>
    <input
       disabled={isLocked}type="number"
      min="1"
      step="1"
      value={releaseInfo.numTracks || ""}
      onChange={(e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
          handleReleaseInfoChange("numTracks", value);
        }
      }}
      placeholder="Enter number of tracks"
      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>




           <div className="flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">Distributor</label>
  <input
     disabled={isLocked}type="text"
    value={releaseInfo.distributor || ""}
    onChange={(e) => handleReleaseInfoChange("distributor", e.target.value)}
    placeholder="Enter Distributor"
    className="p-2 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
  />

  </div>
           <div className="flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">Upload Cover Art</label>
  <input
     disabled={isLocked}type="file"
    accept="image/*"
    onChange={(e) => handleReleaseInfoChange("coverArt", e.target.files[0])}
    className="p-2 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
  {releaseInfo.coverArtPreview && (
    <img
      src={releaseInfo.coverArtPreview}
      alt="Cover Preview"
      className="mt-2 w-24 h-24 object-cover rounded shadow"
    />
  )}
</div>
          </div>
        </section>

        {tracks.map((track, i) => (
          <details key={i} open={!track.collapsed} ref={(el) => (trackRefs.current[i] = el)} className="mb-6 border rounded-xl p-4 bg-gray-50">
            <summary
  className="cursor-pointer font-semibold text-blue-700 mb-4 flex items-center justify-between"
  onClick={(e) => {
    e.preventDefault();
    const updated = [...tracks];
    updated[i].collapsed = !updated[i].collapsed;
    setTracks(updated);



  }}
>
<div className="flex items-center justify-between w-full">
  <span>
    Track {i + 1} Information
    {tracks[i]?.primaryTitle && (
      <span className="text-gray-500 italic text-sm ml-2">
        – “{tracks[i].primaryTitle}”
      </span>
    )}
  </span>

  <span
    className="text-gray-400 hover:text-red-600 text-xl ml-4 cursor-pointer"
    title="Delete Track"
    onClick={(e) => {
      e.stopPropagation();
      removeTrack(i);
    }}
  >
    🗑️
  </span>
</div>
</summary>




           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

{/* Primary Title */}
<div className="relative flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">Primary Title</label>
<input
   disabled={isLocked}type="text"
  value={track.primaryTitle || ""}
  onChange={(e) => {
    const value = e.target.value;
    handleTrackChange(i, "primaryTitle", value);

    if (value.length >= 1) {
      const matches = catalogDB.filter((entry) =>
        entry?.["Primary Title"]?.toLowerCase?.().startsWith(value.toLowerCase())
      );
      setTrackSuggestions(matches);
      setHighlightedTrackIndex(0); // Reset highlight
    } else {
      setTrackSuggestions([]);
      setHighlightedTrackIndex(-1);
    }
  }}
  onKeyDown={(e) => {
    if (trackSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedTrackIndex((prev) =>
          prev < trackSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedTrackIndex((prev) =>
          prev > 0 ? prev - 1 : trackSuggestions.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const entry = trackSuggestions[highlightedTrackIndex];
console.log("🧩 Selected catalog entry:", entry);

if (entry) {
  // Basic track info
  handleTrackChange(i, "primaryTitle", entry["Primary Title"] || "");
let parsedTrackArtists = [];

try {
  if (Array.isArray(entry["Track Artist Name"])) {
    parsedTrackArtists = entry["Track Artist Name"];
  } else {
    parsedTrackArtists = JSON.parse(entry["Track Artist Name"]);
  }
} catch {
  // Fallback to individual fields
  for (let k = 0; k <= 8; k++) {
    const key = k === 0 ? "Track Artist Name" : `Track Artist Name ${k}`;
    const value = entry[key];
    if (value && value.trim()) {
      parsedTrackArtists.push(value.trim());
    }
  }
}

if (parsedTrackArtists.length === 0) parsedTrackArtists.push("");

// ✅ Now set it properly
handleTrackChange(i, "trackArtistNames", parsedTrackArtists);
  handleTrackChange(i, "trackNumber", entry["Track Number"] || "");
  handleTrackChange(i, "recordingTitle", entry["Recording Title"] || "");
  handleTrackChange(i, "akaTitle", entry["AKA Title"] || "");
  handleTrackChange(i, "akaTypeCode", entry["AKA Type Code (MLC)"] || "");
  handleTrackChange(i, "countryRelease", entry["Country of Release"] || "");
  handleTrackChange(i, "basisClaim",  entry["Basis of Claim"] || "");
  handleTrackChange(i, "percentClaim", entry["Percent of Claim"] || "");
  handleTrackChange(i, "collectionEnd", entry["Collection End Date"] || "");
  handleTrackChange(i, "nonUSRights", entry["Non-US Collection Rights"] || "");
  handleTrackChange(i, "genre", entry["Genre"] || "");
  handleTrackChange(i, "recEng", entry["Recording Engineer"] || "");
  handleTrackChange(i, "producer", entry["Producer"] || "");
  handleTrackChange(i, "execProducer", entry["Executive Producer"] || "");    
  handleTrackChange(i, "recDate", entry["Recording Date"] || "");
  handleTrackChange(i, "isrc", entry["ISRC"] || "");
  handleTrackChange(i, "iswc", entry["ISWC"] || "");
  handleTrackChange(i, "duration", normalizeDuration(entry["Duration"]) || "");
  handleTrackChange(i, "trackLabel", entry["Track Label"] || "");
  handleTrackChange(i, "trackPLine", entry["Track P Line"] || "");




  // 🎯 Parse composerData
  let composerData = entry.Composers;
  if (typeof composerData === "string") {
    try {
      composerData = JSON.parse(composerData);
    } catch (err) {
      console.error("❌ Failed to parse composerData:", err);
      composerData = [];
    }
  }

  // 🎯 Parse publisherData
let publisherData = entry.Publishers;
if (typeof publisherData === "string") {
  try {
    publisherData = JSON.parse(publisherData);
  } catch (err) {
    console.error("❌ Failed to parse publisherData:", err);
    publisherData = [];
  }
}
  // ✅ Merge composer and publisher into one per composer slot
  if (Array.isArray(composerData)) {
    const merged = composerData.map((composer, idx) => {
      const publisher = Array.isArray(publisherData) ? publisherData[idx] || {} : {};
const admin = Array.isArray(publisherData)
  ? publisherData.find(p => p["Publisher Admin"]) || {}
  : {};

return {
  firstName: composer["First Name"] || "",
  middleName: composer["Middle Name"] || "",
  lastName: composer["Last Name"] || "",
  ipi: composer["IPI"] || "",
  split: composer["Split"] || "",
  pro: composer["PRO"] || "",
  roleCode: composer["Role Code"] || "",
  composeraddress: composer["Address"] || "",
  composercity: composer["City"] || "",
  composerstate: composer["State"] || "",
  composerzip: composer["Zip"] || "",
  publisher: publisher["Publisher"] || "N/A",
  publisherIPI: publisher["Publisher IPI"] || "N/A",
  publisherPRO: publisher["Publisher PRO"] || "N/A",
  pubadmin: admin["Publisher Admin"] || "N/A",
  pubadminIPI: admin["Publisher Admin IPI"] || "N/A",
  pubadminShare: admin["Publisher Admin Collection Share"] || "0"
};
    });

    const updated = [...tracks];
    updated[i].composers = merged;
    setTracks(updated);

toast.success("🎼 Composer & Publisher Info Loaded", {
  style: {
    borderRadius: '8px',
    background: '#1f2937',
    color: '#fff',
  },
});

  } else {
    console.warn("⚠️ No valid composers found for selected track.");
  }

  setTrackSuggestions([]);
  setHighlightedTrackIndex(-1);
}
      }
    }
  }}
  onBlur={() => setTimeout(() => setTrackSuggestions([]), 150)}
  placeholder="Start typing primary title"
  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
/>

  {trackSuggestions.length > 0 && (
    <ul className="absolute z-10 mt-10 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
      {trackSuggestions.map((entry, idx) => (
        <li
          key={idx}
          className={`p-2 cursor-pointer ${
            idx === highlightedTrackIndex ? "bg-blue-100" : "hover:bg-blue-50"
          }`}
          onMouseDown={() => {
  handleTrackChange(i, "primaryTitle", entry["Primary Title"] || "");
let parsedTrackArtists = [];

try {
  if (Array.isArray(entry["Track Artist Name"])) {
    parsedTrackArtists = entry["Track Artist Name"];
  } else {
    parsedTrackArtists = JSON.parse(entry["Track Artist Name"]);
  }
} catch {
  // Fallback to individual fields
  for (let k = 0; k <= 8; k++) {
    const key = k === 0 ? "Track Artist Name" : `Track Artist Name ${k}`;
    const value = entry[key];
    if (value && value.trim()) {
      parsedTrackArtists.push(value.trim());
    }
  }
}

if (parsedTrackArtists.length === 0) parsedTrackArtists.push("");

// ✅ Now set it properly
handleTrackChange(i, "trackArtistNames", parsedTrackArtists);
  handleTrackChange(i, "trackNumber", entry["Track Number"] || "");
  handleTrackChange(i, "recordingTitle", entry["Recording Title"] || "");
  handleTrackChange(i, "akaTitle", entry["AKA Title"] || "");
  handleTrackChange(i, "akaTypeCode", entry["AKA Type Code (MLC)"] || "");
  handleTrackChange(i, "countryRelease", entry["Country of Release"] || "");
  handleTrackChange(i, "basisClaim",  entry["Basis of Claim"] || "");
  handleTrackChange(i, "percentClaim", entry["Percent of Claim"] || "");
  handleTrackChange(i, "collectionEnd", entry["Collection End Date"] || "");
  handleTrackChange(i, "nonUSRights", entry["Non-US Collection Rights"] || "");
  handleTrackChange(i, "genre", entry["Genre"] || "");
  handleTrackChange(i, "recDate", entry["Recording Date"] || "");
  handleTrackChange(i, "recEng", entry["Recording Engineer"] || "");
  handleTrackChange(i, "producer", entry["Producer"] || "");
  handleTrackChange(i, "execProducer", entry["Executive Producer"] || "");  
  handleTrackChange(i, "isrc", entry["ISRC"] || "");
  handleTrackChange(i, "iswc", entry["ISWC"] || "");
  handleTrackChange(i, "duration", normalizeDuration(entry["Duration"]) || "");
  handleTrackChange(i, "trackLabel", entry["Track Label"] || "");
  handleTrackChange(i, "trackPLine", entry["Track P Line"] || "");

let publisherData = entry.Publishers;
if (typeof publisherData === "string") {
  try {
    publisherData = JSON.parse(publisherData);
  } catch (err) {
    console.error("❌ Failed to parse publisherData:", err);
    publisherData = [];
  }
}
// Log full entry to debug
console.log("Selected catalog entry:", entry);

// 🎯 Add composer data if available
let composerData = entry.Composers;

// Parse if stringified
if (typeof composerData === "string") {
  try {
    composerData = JSON.parse(composerData);
  } catch (err) {
    console.error("❌ Failed to parse composerData:", err);
    composerData = [];
  }
}

if (Array.isArray(composerData)) {
  // Pull publisher + admin objects from publisherData
  const publisherInfo = Array.isArray(publisherData)
    ? publisherData.find(p => p["Publisher"])
    : {};
  const adminInfo = Array.isArray(publisherData)
    ? publisherData.find(p => p["Publisher Admin"])
    : {};

 const composers = composerData.map((c) => ({
  firstName: c["First Name"] || "",
  middleName: c["Middle Name"] || "",
  lastName: c["Last Name"] || "",
  ipi: c["IPI"] || "",
  pro: c["PRO"] || "",
  roleCode: c["Role Code"] || "",
  split: c["Split"] || "",
  composeraddress: c["Address"] || "",
  composercity: c["City"] || "",
  composerstate: c["State"] || "",
  composerzip: c["Zip"] || "",
  publisher: c["Publisher"] || "",
  publisherIPI: c["Publisher IPI"] || "",
  publisherPRO: c["Publisher PRO"] || "",
  pubadmin: c["Publisher Admin"] || "",
  pubadminIPI: c["Publisher Admin IPI"] || "",
  pubadminShare: c["Publisher Admin Collection Share"] || "",
}));

  const updated = [...tracks];
  updated[i].composers = composers;
  setTracks(updated);
} else {
  console.warn("⚠️ No valid composers found for selected track.");
}

  setTrackSuggestions([]);
  setHighlightedTrackIndex(-1);
}}
        >
          {entry["Primary Title"]} – {Array.isArray(entry["Track Artist Name"])
      ? entry["Track Artist Name"].join(", ")
      : entry["Track Artist Name"] || "Unknown Artist"}
        </li>
      ))}
    </ul>
  )}
</div>



{/* Track Artist(s) with Search */}
<div className="flex flex-col mb-4">
  <label className="text-sm font-medium text-gray-700 mb-1">
    Track Artist(s)
  </label>

  {track.trackArtistNames.map((artist, artistIndex) => (
  <React.Fragment key={artistIndex}>
    <div className="relative flex items-center mb-2">
      <input
        type="text"
        disabled={isLocked}
        value={artist}
        placeholder={`Artist ${artistIndex + 1}`}
        onChange={(e) => {
          const value = e.target.value;
          handleTrackArtistChange(i, artistIndex, value);

          if (value.length > 0) {
            const matches = artistDB
              .map((a) => a["Artist Name"])
              .filter((name) =>
                name?.toLowerCase().startsWith(value.toLowerCase())
              );
            setArtistSuggestions(matches);
            setHighlightedArtistIndex(0);
            setActiveArtistInputIndex(`${i}-${artistIndex}`);
          } else {
            setArtistSuggestions([]);
            setActiveArtistInputIndex(null);
          }
        }}
        onKeyDown={(e) => {
          if (artistSuggestions.length > 0) {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlightedArtistIndex((prev) =>
                prev < artistSuggestions.length - 1 ? prev + 1 : 0
              );
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightedArtistIndex((prev) =>
                prev > 0 ? prev - 1 : artistSuggestions.length - 1
              );
            } else if (e.key === "Enter") {
              e.preventDefault();
              const selected = artistSuggestions[highlightedArtistIndex];
              if (selected) {
                handleTrackArtistChange(i, artistIndex, selected);
                setArtistSuggestions([]);
                setActiveArtistInputIndex(null);
              }
            }
          }
        }}
        onBlur={() => setTimeout(() => setArtistSuggestions([]), 150)}
        className="p-2 border border-gray-300 rounded-md w-full"
      />

      {/* Remove button */}
      {track.trackArtistNames.length > 1 && (
        <button
          type="button"
          onClick={() => {
            const updated = [...track.trackArtistNames];
            updated.splice(artistIndex, 1);
            const updatedTracks = [...tracks];
            updatedTracks[i].trackArtistNames = updated;
            setTracks(updatedTracks);
          }}
          className="ml-2 text-red-500 hover:text-red-700 text-lg"
          title="Remove Artist"
        >
          🗑️
        </button>
      )}
    </div>

    {/* Suggestions Dropdown */}
    {activeArtistInputIndex === `${i}-${artistIndex}` &&
      artistSuggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
          {artistSuggestions.map((name, idx) => (
            <li
              key={idx}
              className={`p-2 cursor-pointer ${
                idx === highlightedArtistIndex ? "bg-blue-100" : ""
              }`}
              onMouseDown={() => {
                handleTrackArtistChange(i, artistIndex, name);
                setArtistSuggestions([]);
                setActiveArtistInputIndex(null);
              }}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
  </React.Fragment>
))}

  <button
    type="button"
    onClick={() => addTrackArtist(i)}
    className="text-blue-600 hover:text-blue-800 text-sm mt-1 self-start"
  >
    + Add Another Artist
  </button>
</div>




  {/* Other Fields */}
  {renderInput("Recording Title", track.recordingTitle, (e) => handleTrackChange(i, "recordingTitle", e.target.value))}
  {renderInput("AKA Title", track.akaTitle, (e) => handleTrackChange(i, "akaTitle", e.target.value))}

  {/* ISRC */}
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">ISRC</label>
    <input
       disabled={isLocked}type="text"
      value={track.isrc || ""}
      maxLength={15}
      onChange={(e) => {
        let raw = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 12);
        let formatted = "";
        if (raw.length > 0) formatted += raw.slice(0, 2);
        if (raw.length > 2) formatted += "-" + raw.slice(2, 5);
        if (raw.length > 5) formatted += "-" + raw.slice(5, 7);
        if (raw.length > 7) formatted += "-" + raw.slice(7, 12);
        handleTrackChange(i, "isrc", formatted);
      }}
      placeholder="AA-AAA-AA-12345"
      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>

  {/* ISWC */}
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">ISWC</label>
    <input
       disabled={isLocked}type="text"
      value={track.iswc || ""}
      onFocus={(e) => {
        if (!e.target.value.startsWith("T-")) {
          handleTrackChange(i, "iswc", "T-");
        }
      }}
      onChange={(e) => {
        let input = e.target.value.replace(/[^0-9-]/g, "");
        if (input.startsWith("T-")) input = input.slice(2);
        input = input.replace(/-/g, "").slice(0, 10);
        let formatted = "T-";
        if (input.length <= 9) {
          formatted += input;
        } else {
          formatted += input.slice(0, 9) + "-" + input[9];
        }
        handleTrackChange(i, "iswc", formatted);
      }}
      placeholder="T-123456789-0"
      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>

  {renderInput("Track number", track.trackNumber, (e) => handleTrackChange(i, "trackNumber", e.target.value))}

<div className="flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">Duration</label>
  <input
    disabled={isLocked}
    type="text"
    value={track.duration || ""}
    onChange={(e) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 4); // only digits
      handleTrackChange(i, "duration", raw); // store unformatted
    }}
    onBlur={(e) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
      let formatted = "";

      if (raw.length >= 3) {
        const minutes = raw.slice(0, raw.length - 2).padStart(2, "0");
        const seconds = raw.slice(-2);
        formatted = `${minutes}:${seconds}`;
      } else if (raw.length > 0) {
        formatted = `00:${raw.padStart(2, "0")}`;
      }

      handleTrackChange(i, "duration", formatted);
    }}
    placeholder="mm:ss"
    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
</div>
{renderInput("Track label", track.trackLabel, (e) => {
  const label = e.target.value;
  handleTrackChange(i, "trackLabel", label);
  maybeAutofillPLine(i, label, releaseInfo.releaseDate);
})}
  {renderInput("Track P Line", track.trackPLine, (e) => handleTrackChange(i, "trackPLine", e.target.value))}
  {renderInput("AKA Type Code (MLC)", track.akaTypeCode, (e) => handleTrackChange(i, "akaTypeCode", e.target.value))}
  {renderInput("Country of Release", track.countryRelease, (e) => handleTrackChange(i, "countryRelease", e.target.value))}
  {renderInput("Basis of Claim", track.basisClaim, (e) => handleTrackChange(i, "basisClaim", e.target.value))}
  {renderInput("Percentage Claimed", track.percentClaim, (e) => handleTrackChange(i, "percentClaim", e.target.value))}
  {renderInput("Collection Rights End Date", track.collectionEnd, (e) => handleTrackChange(i, "collectionEnd", e.target.value))}
  {renderInput("Non-US Collection Rights", track.nonUSRights, (e) => handleTrackChange(i, "nonUSRights", e.target.value))}
  {renderInput("Genre", track.genre, (e) => handleTrackChange(i, "genre", e.target.value))}





<div className="flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">Recording Date</label>
  <input
    type="date"
    disabled={isLocked}
    value={track.recDate || ""}
    onChange={(e) => handleTrackChange(i, "recDate", e.target.value)}
    className="p-2 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
</div>
  {renderInput("Recording Engineer", track.recEng, (e) => handleTrackChange(i, "recEng", e.target.value))}
  {renderInput("Producer", track.producer, (e) => handleTrackChange(i, "producer", e.target.value))}
  {renderInput("Executive Producer", track.execProducer, (e) => handleTrackChange(i, "execProducer", e.target.value))}



  {/* Audio Upload */}
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">Audio File</label>
    <input
       disabled={isLocked}type="file"
      accept="audio/*"
      onChange={(e) => handleTrackChange(i, "audioFile", e.target.files[0])}
      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>
</div>
          
    
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Composers</h3>
              {track.composers.map((composer, j) => {
                const key = `${i}-${j}`;
const removeComposer = (trackIndex, composerIndex) => {
  const updated = [...tracks];
  updated[trackIndex].composers.splice(composerIndex, 1);
  setTracks(updated);
};
                



  return (
                  <div key={key} ref={(el) => (composerRefs.current[key] = el)} className="mb-6 pb-4 border-b border-gray-300">
                    <div className="flex items-center justify-between mb-2">
  <h4 className="font-semibold text-blue-600">Composer {j + 1}</h4>
  <button
    title="Remove Composer"
    onClick={() => removeComposer(i, j)}
    className="text-gray-400 hover:text-red-600 text-xl"
  >
    🗑️
  </button>
</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                     {/* Composer First Name */}
{/* Composer First Name */}
<div className="relative flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">First Name</label>
<input
   disabled={isLocked}type="text"
  value={composer.firstName || ""}
  onChange={(e) => handleComposerChange(i, j, "firstName", e.target.value)}
  onKeyDown={(e) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected = suggestions[highlightedIndex];
      if (selected) {
        const updated = [...tracks];
        updated[i].composers[j] = {
          ...updated[i].composers[j],
          ...selected,
        };
        setTracks(updated);
        setSuggestions([]);
        setActiveInput(null);
      }
    }

    if (e.key === "Escape") {
      setSuggestions([]);
      setActiveInput(null);
    }
  }}
  onBlur={() => setTimeout(() => setSuggestions([]), 200)}
  placeholder="Start typing first name"
  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
/>

  {/* 👇 Composer name suggestion dropdown */}
  {activeInput &&
    activeInput.trackIndex === i &&
    activeInput.composerIndex === j &&
    activeInput.field === "firstName" &&
    suggestions.length > 0 && (
      <ul className="absolute z-10 mt-10 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
  {suggestions.map((sugg, idx) => (
    <li
      key={idx}
      className={`p-2 cursor-pointer hover:bg-blue-100 ${
        idx === highlightedIndex ? "bg-blue-100 font-medium" : ""
      }`}
      onMouseDown={() => {
        const updated = [...tracks];
        updated[i].composers[j] = {
          ...updated[i].composers[j],
          ...sugg,
        };
        setTracks(updated);
        setSuggestions([]);
        setActiveInput(null);
      }}
    >
      {sugg.firstName} {sugg.middleName} {sugg.lastName}
    </li>
  ))}
</ul>
    )}
</div>

                       {renderInput("Middle Name", composer.middleName, (e) => handleComposerChange(i, j, "middleName", e.target.value))}

{/* Composer Last Name */}
<div className="relative flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">Last Name(s)</label>
  <input
   disabled={isLocked}type="text"
  value={composer.lastName || ""}
  onChange={(e) => handleComposerChange(i, j, "lastName", e.target.value)}
  onKeyDown={(e) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected = suggestions[highlightedIndex];
      if (selected) {
        const updated = [...tracks];
        updated[i].composers[j] = {
          ...updated[i].composers[j],
          ...selected,
        };
        setTracks(updated);
        setSuggestions([]);
        setActiveInput(null);
      }
    }

    if (e.key === "Escape") {
      setSuggestions([]);
      setActiveInput(null);
    }
  }}
  onBlur={() => setTimeout(() => setSuggestions([]), 200)}
  placeholder="Start typing last name"
  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
/>
{activeInput &&
  activeInput.trackIndex === i &&
  activeInput.composerIndex === j &&
  activeInput.field === "lastName" &&
  suggestions.length > 0 && (
    <ul className="absolute z-10 mt-10 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
      {suggestions.map((sugg, idx) => (
        <li
          key={idx}
          className={`p-2 hover:bg-blue-100 cursor-pointer ${
            highlightedIndex === idx ? "bg-blue-100" : ""
          }`}
          onMouseDown={() => {
            const updated = [...tracks];
            updated[i].composers[j] = {
              ...updated[i].composers[j],
              ...sugg,
            };
            setTracks(updated);
            setSuggestions([]);
          }}
        >
           {sugg.firstName} {sugg.middleName} {sugg.lastName}
        </li>
      ))}
    </ul>
)}

</div>                     


                      
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {renderInput("Composer Address", composer.composeraddress, (e) => handleComposerChange(i, j, "composeraddress", e.target.value))}
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {renderInput("City", composer.composercity, (e) => handleComposerChange(i, j, "composercity", e.target.value))}
                      {renderInput("State", composer.composerstate, (e) => handleComposerChange(i, j, "composerstate", e.target.value))}
                      {renderInput("Zip", composer.composerzip, (e) => handleComposerChange(i, j, "composerzip", e.target.value))}
                    </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderInput("Composer IPI/CAE#", composer.ipi, (e) => handleComposerChange(i, j, "ipi", e.target.value))}
                      {renderInput("Composer PRO", composer.pro, (e) => handleComposerChange(i, j, "pro", e.target.value))}
                      {renderInput("Composer Share %", composer.split, (e) => handleComposerChange(i, j, "split", e.target.value))}
                      {renderInput("Writer Role Code (MLC)", composer.roleCode, (e) => handleComposerChange(i, j, "roleCode", e.target.value))}




<div className="flex flex-col relative">
  <label className="text-sm font-medium text-gray-700 mb-1">Publisher</label>
    <input
   disabled={isLocked}type="text"
  value={composer.publisher || ""}
  onChange={(e) =>
    handleComposerChange(i, j, "publisher", e.target.value)
  }
  onKeyDown={(e) => {
    if (publisherSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < publisherSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handlePublisherSuggestionClick(
            publisherSuggestions[highlightedIndex],
            i,
            j
          );
        }
      }
    }
  }}
  onBlur={() => setTimeout(() => setPublisherSuggestions([]), 200)}
  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
/>

{activePublisherField?.trackIndex === i &&
  activePublisherField?.composerIndex === j &&
  publisherSuggestions.length > 0 && (
    <div className="absolute top-full left-0 w-full z-10 bg-white border border-gray-300 rounded-md shadow-md max-h-48 overflow-y-auto">
      {publisherSuggestions.map((s, idx) => (
        <div
          key={idx}
          onMouseDown={() => handlePublisherSuggestionClick(s, i, j)}
          className={`px-3 py-2 cursor-pointer ${
            idx === highlightedIndex ? "bg-blue-100" : "hover:bg-blue-50"
          }`}
        >
          {s.publisher}
        </div>
      ))}
    </div>
)}
</div>





                      {renderInput("Publisher IPI/CAE#", composer.publisherIPI, (e) => handleComposerChange(i, j, "publisherIPI", e.target.value))}

                      
<div className="flex flex-col relative">
  <label className="text-sm font-medium text-gray-700 mb-1">Publisher Admin</label>
  <input
    disabled={isLocked}
    type="text"
    value={composer.pubadmin || ""}
    onChange={(e) => handleComposerChange(i, j, "pubadmin", e.target.value)}
    onKeyDown={(e) => {
      if (adminSuggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedAdminIndex((prev) =>
            prev < adminSuggestions.length - 1 ? prev + 1 : prev
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedAdminIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (highlightedAdminIndex >= 0) {
            handleAdminSuggestionClick(
              adminSuggestions[highlightedAdminIndex],
              i,
              j
            );
          }
        }
      }
    }}
    onBlur={() => setTimeout(() => setAdminSuggestions([]), 200)}
    onFocus={() => {
      setActiveAdminField({ trackIndex: i, composerIndex: j });
    }}
    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
  />

  {activeAdminField?.trackIndex === i &&
    activeAdminField?.composerIndex === j &&
    adminSuggestions.length > 0 && (
      <div className="absolute top-full left-0 w-full z-10 bg-white border border-gray-300 rounded-md shadow-md max-h-48 overflow-y-auto">
        {adminSuggestions.map((s, idx) => (
          <div
            key={idx}
            onMouseDown={() => handleAdminSuggestionClick(s, i, j)}
            className={`px-3 py-2 cursor-pointer ${
              idx === highlightedAdminIndex ? "bg-blue-100" : "hover:bg-blue-50"
            }`}
          >
            {s.publisheradmin}
          </div>
        ))}
      </div>
    )}
</div>

                      {renderInput("Pub Admin IPI", composer.pubadminIPI, (e) => handleComposerChange(i, j, "pubadminIPI", e.target.value))}
                      {renderInput("Publisher PRO", composer.publisherPRO, (e) => handleComposerChange(i, j, "publisherPRO", e.target.value))}
                      {renderInput("Pub Admin Collection Share", composer.pubadminShare, (e) => handleComposerChange(i, j, "pubadminShare", e.target.value))}
                      
                      
                    </div>
                  </div>

                );
              })}
              <button type="button" onClick={() => addComposer(i)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2">
                + Add Composer
              </button>
            </div>
          </details>
        ))}

        {releaseInfo.typeOfRelease !== "Single" || tracks.length < 1 ? (
          <div className="text-center mt-10">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md shadow text-lg font-semibold" onClick={addTrack}>
              + Add Another Track
            </button>
          </div>
        ) : null}
      </div>
<div className="text-center mt-10 space-x-4">
  <button
    type="button"
    onClick={handleClearForm}
    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md shadow text-md font-semibold"
  >
    Clear Form
  </button>

  <button
    type="button"
    onClick={handleSubmit}
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow text-md font-semibold"
  >
    Submit
  </button>
</div>
    </div>
  );
}
