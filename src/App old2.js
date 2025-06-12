import React, { useState, useRef, useEffect } from "react";
import { Toaster, toast } from 'react-hot-toast';

export default function App() {
const [upcSearch, setUpcSearch] = useState("");
  const [tracks, setTracks] = useState([{ ...createEmptyTrack(), collapsed: false }]);



  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [composersDB, setComposerDB] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [upcSuggestions, setUpcSuggestions] = useState([]);
  const [upcInputFocused, setUpcInputFocused] = useState(false);
  const [highlightedUpcIndex, setHighlightedUpcIndex] = useState(-1);
  const [albumSearch, setAlbumSearch] = useState("");
  const [albumSuggestions, setAlbumSuggestions] = useState([]);
  const [highlightedAlbumIndex, setHighlightedAlbumIndex] = useState(-1);
  const [isLocked, setIsLocked] = useState(true); // default to locked after DB load
  const [suppressAlbumSuggestions, setSuppressAlbumSuggestions] = useState(false);
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
const [isProgrammaticAlbumUpdate, setIsProgrammaticAlbumUpdate] = useState(false);
const [showAlbumSuggestions, setShowAlbumSuggestions] = useState(false);
const [showUpcSuggestions, setShowUpcSuggestions] = useState(false);




  const [releaseInfo, setReleaseInfo] = useState({
    upc: "",
    albumTitle: "",
    albumArtist: "",
    numTracks: "1",
    distributor: "Believe",
    releaseDate: "",
    typeOfRelease: "",
    coverArtPreview: null,
  });


  

  const [activeInput, setActiveInput] = useState(null); // to know which input is triggering suggestions





useEffect(() => {
  console.log("🎯 useEffect triggered", {
    albumSearch,
    isProgrammaticAlbumUpdate,
    showAlbumSuggestions,
    suggestionsCount: albumSuggestions.length
  });

  if (isProgrammaticAlbumUpdate) {
    setIsProgrammaticAlbumUpdate(false);
    setShowAlbumSuggestions(false);
    return;
  }

  if (!albumSearch.trim()) {
    setAlbumSuggestions([]);
    setShowAlbumSuggestions(false);
    return;
  }

  const results = catalogDB.filter(entry =>
    entry["Album Title"]?.toLowerCase().includes(albumSearch.toLowerCase())
  );

  const uniqueAlbums = [...new Map(results.map(item => [item["UPC"], item])).values()];
  setAlbumSuggestions(uniqueAlbums);
  setShowAlbumSuggestions(uniqueAlbums.length > 0);
}, [albumSearch, catalogDB, isProgrammaticAlbumUpdate]);


useEffect(() => {
  if (catalogDB?.length) {
    console.log("🔍 Sample catalog entry:", catalogDB[0]);
    console.log("🔑 Keys in entry:", Object.keys(catalogDB[0]));
  }
}, [catalogDB]);


useEffect(() => {
  if (isProgrammaticAlbumUpdate) {
    setIsProgrammaticAlbumUpdate(false);
    setShowAlbumSuggestions(false); // 🔐 Don’t reopen the dropdown
    return;
  }

  if (!albumSearch.trim()) {
    setAlbumSuggestions([]);
    setShowAlbumSuggestions(false);
    return;
  }

  const results = catalogDB.filter(entry =>
    entry["Album Title"]?.toLowerCase().includes(albumSearch.toLowerCase())
  );

  const uniqueAlbums = [...new Map(results.map(item => [item["UPC"], item])).values()];
  setAlbumSuggestions(uniqueAlbums);
  setShowAlbumSuggestions(uniqueAlbums.length > 0);
}, [albumSearch, catalogDB, isProgrammaticAlbumUpdate]);
const [publisherSuggestions, setPublisherSuggestions] = useState([]);
const [activePublisherField, setActivePublisherField] = useState(null);
const handlePublisherSuggestionClick = (publisherData, trackIndex, composerIndex) => {
  const updated = [...tracks];
  updated[trackIndex].composers[composerIndex] = {
    ...updated[trackIndex].composers[composerIndex],
    publisher: publisherData.publisher || "",
    publisherIPI: publisherData.publisherIPI || "",
    publisherPRO: publisherData.publisherPRO || "",
    pubadmin: publisherData.pubadmin || "",
    pubadminIPI: publisherData.pubadminIPI || "",
    pubadminShare: publisherData.pubadminShare || "",
  };
  setTracks(updated);
  setPublisherSuggestions([]);
};

const populateReleaseFromCatalogUPC = (upc) => {
  const matches = catalogDB.filter((entry) => entry["UPC"] === upc);
  if (!matches.length) {
    toast.error("UPC not found in catalog");
    return;
  }

  const main = matches[0];

  // 🛑 Suppress auto-suggestions BEFORE changing albumSearch
  setIsProgrammaticAlbumUpdate(true); // 🧠 flag useEffect to cancel itself

  // 🔁 Force albumSearch change to re-trigger useEffect if needed
  setAlbumSearch(""); 
  setTimeout(() => {
    setAlbumSearch(main["Album Title"] || "");
  }, 10); // Small delay to let suppression state apply

  // 🔒 Make sure album suggestions dropdown is forcibly closed
  setAlbumSuggestions([]);
  setHighlightedAlbumIndex(-1);
  setShowAlbumSuggestions(false); // <-- This one is new and crucial

  // Optionally hide UPC dropdown too:
  setShowUpcSuggestions(false);

  // Set release-level info
  setReleaseInfo({
    albumTitle: main["Album Title"] || "",
    albumArtist: main["Album Artist"] || "",
    upc: main["UPC"] || "",
    distributor: main["Distributor"] || "",
    releaseDate: main["Digital Release Date"] || "",
    typeOfRelease: main["Type of Release"] || "",
    numTracks: matches.length.toString(),
    coverArt: null,
    coverArtPreview: null,
  });

  // Set tracks
  const newTracks = matches.map((entry) => {
    let composerData = [];
    let publisherData = [];

    try {
      composerData = typeof entry.Composers === "string" ? JSON.parse(entry.Composers) : entry.Composers || [];
      publisherData = typeof entry.Publishers === "string" ? JSON.parse(entry.Publishers) : entry.Publishers || [];
    } catch (err) {
      console.error("Error parsing composer or publisher data", err);
    }

    const composers = composerData.map((c, idx) => {
      const pub = publisherData[idx] || {};
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
        pubadmin: pub["Publisher Admin"] || "",
        pubadminIPI: pub["Publisher Admin IPI"] || "",
        pubadminShare: pub["Publisher Admin Collection Share"] || "",
      };
    });

    return {
      primaryTitle: entry["Primary Title"] || "",
      trackArtistName: entry["Track Artist Name"] || "",
      trackNumber: entry["Track Number"] || "",
      recordingTitle: entry["Recording Title"] || "",
      akaTitle: entry["AKA Title"] || "",
      akaTypeCode: entry["AKA Type Code"] || "",
      isrc: entry["ISRC"] || "",
      iswc: entry["ISWC"] || "",
      duration: entry["Duration"] || "",
      trackLabel: entry["Track Label"] || "",
      trackPLine: entry["Track P Line"] || "",
      composers,
    };
  });

  setTracks(newTracks);
  toast.success(`✅ Loaded ${newTracks.length} track(s) from UPC`);
};

const handleUpcSuggestionClick = (entry) => {
  populateReleaseFromCatalogUPC(entry["UPC"]);
  setUpcSuggestions([]);
  
};

const handleUpcSuggestionSelect = (entry) => {
  populateReleaseFromCatalogUPC(entry["UPC"]);
  setUpcSuggestions([]);
  setHighlightedUpcIndex(-1);
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
  
  const renderAlbumDropdown = () => {
    const shouldShow = showAlbumSuggestions && albumSuggestions.length > 0;

    console.log("🔍 FINAL CONDITIONS –", {
      showAlbumSuggestions,
      albumSuggestionsLength: albumSuggestions.length,
    });

    if (!shouldShow) return null;

    return (
      <ul className="absolute z-10 mt-12 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
        {albumSuggestions.map((sugg, idx) => (
          <li
            key={idx}
            className={`p-2 hover:bg-blue-100 cursor-pointer ${highlightedAlbumIndex === idx ? "bg-blue-100" : ""}`}
            onClick={() => handleAlbumSuggestionClick(sugg)}
          >
            {sugg["Album Title"] || "Unknown Album"} — {sugg["Album Artist"] || "Unknown Artist"}
          </li>
        ))}
      </ul>
    );
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
      audioFile: null,
      isrc: "",
      iswc: "",
      trackLabel: "",
      duration: "",
      trackPLine: "",
      trackArtistName: "",
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
      roleCode: "",
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
      }
    }
  }

  // Publisher name suggestions
  if (field === "publisher") {
    const input = value.toLowerCase();
    const matches = publishersDB.filter((p) =>
      p.publisher?.toLowerCase?.().startsWith(input)
    );
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

    const composers = composerData.map((c, idx) => {
      const pub = publisherData[idx] || {};
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
        pubadmin: pub["Publisher Admin"] || "",
        pubadminIPI: pub["Publisher Admin IPI"] || "",
        pubadminShare: pub["Publisher Admin Collection Share"] || "",
      };
    });

    return {
      primaryTitle: entry["Primary Title"] || "",
      trackArtistName: entry["Track Artist Name"] || "",
      trackNumber: entry["Track Number"] || "",
      recordingTitle: entry["Recording Title"] || "",
      akaTitle: entry["AKA Title"] || "",
      akaTypeCode: entry["AKA Type Code (MLC)"] || "",
      isrc: entry["ISRC"] || "",
      iswc: entry["ISWC"] || "",
      duration: entry["Duration"] || "",
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

  function renderInput(label, value, onChange, placeholder = "") {
    return (

      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    );
  }

  const albumTitleLabel =
    releaseInfo.typeOfRelease === "EP"
      ? "EP Title"
      : releaseInfo.typeOfRelease === "Single"
      ? "Single Title"
      : "Album Title";

  const albumArtistLabel =
    releaseInfo.typeOfRelease === "EP"
      ? "EP Artist"
      : releaseInfo.typeOfRelease === "Single"
      ? "Single Artist"
      : "Album Artist";
const handleSubmit = async () => {
  const payload = {
    releaseInfo,
    tracks
  };

  try {
    const response = await fetch("https://your-n8n.com/webhook/form-submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert("Form submitted successfully!");
    } else {
      alert("Submission failed.");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Something went wrong.");
  }
};

const handleAlbumSuggestionClick = (entry) => {
  setShowAlbumSuggestions(false); // ✅ Force close the dropdown
  populateReleaseFromCatalogUPC(entry["UPC"]); // Sync all release info
  setAlbumSuggestions([]); // Clear suggestions
  setHighlightedAlbumIndex(-1); // Reset highlight
};

;

  if (!shouldShow) return null;

  console.log("📦 Rendering album suggestion dropdown");

  return (
    <ul className="absolute z-10 mt-12 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
      {albumSuggestions.map((sugg, idx) => (
        <li
          key={idx}
          className={`p-2 hover:bg-blue-100 cursor-pointer ${
            highlightedAlbumIndex === idx ? "bg-blue-100" : ""
          }`}
          onClick={() => {
            handleAlbumSuggestionClick(sugg);
            setShowAlbumSuggestions(false);
            setAlbumSuggestions([]);
            setHighlightedAlbumIndex(-1);
          }}
        >
          {sugg["Album Title"] || "Unknown Album"} —{" "}
          {sugg["Album Artist"] || "Unknown Artist"}
        </li>
      ))}
    </ul>
  );
};




  return (


    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">Music Metadata Entry</h1>

        <section className="mb-10 border-b pb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Release Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Type of Release</label>
              <select
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={releaseInfo.typeOfRelease || ""}
                onChange={(e) => handleReleaseInfoChange("typeOfRelease", e.target.value)}
              >
                <option value="" disabled>Select type</option>
                <option value="Single">Single</option>
                <option value="Album">Album</option>
                <option value="EP">EP</option>
              </select>
            
            </div>
            <div className="flex flex-col relative">
  <label className="text-sm font-medium text-gray-700 mb-1">UPC</label>
 <input
  type="text"
  value={releaseInfo.upc || ""}
  onFocus={() => setUpcInputFocused(true)}
  onChange={(e) => {
    const value = e.target.value;
    handleReleaseInfoChange("upc", value);

    // Filter catalog suggestions
    const matches = catalogDB.filter(entry =>
      entry?.["UPC"]?.toString().startsWith(value)
    );
    setUpcSuggestions(matches);
    setHighlightedUpcIndex(-1);

    // ✅ Hide album suggestions when typing UPC
    setAlbumSuggestions([]);
    setHighlightedAlbumIndex(-1);
setShowAlbumSuggestions(false);
  }}
  onKeyDown={(e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedUpcIndex((prev) =>
        prev < upcSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedUpcIndex((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedUpcIndex >= 0) {
        handleUpcSuggestionSelect(upcSuggestions[highlightedUpcIndex]);
      }
    } else if (e.key === "Escape") {
      setUpcSuggestions([]);
      setHighlightedUpcIndex(-1);
    }
  }}
  onBlur={() => setTimeout(() => setUpcSuggestions([]), 200)}
  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
  placeholder="Search UPC"
/>


  {upcInputFocused && upcSuggestions.length > 0 && (
    <ul className="absolute z-10 mt-10 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
{[...new Map(upcSuggestions.map((item) => [item["UPC"], item])).values()].map((s, idx) => (
  <div
    key={idx}
    onMouseDown={() => handleUpcSuggestionClick(s)}
    className={`px-3 py-2 cursor-pointer ${
      idx === highlightedUpcIndex ? "bg-blue-100" : "hover:bg-blue-50"
    }`}
  >
    {s["Album Title"] || "Unknown Album"}
  </div>
))}
    </ul>
  )}
</div>
            {renderInput(albumArtistLabel, releaseInfo.albumArtist, (e) => handleReleaseInfoChange("albumArtist", e.target.value))}
<div className="flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">Digital Release Date</label>
  <input
    type="date"
    value={releaseInfo.releaseDate || ""}
    onChange={(e) => handleReleaseInfoChange("releaseDate", e.target.value)}
    className="p-2 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
</div>
            {releaseInfo.typeOfRelease !== "Single" && (
  <div className="relative flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">Album Title</label>
    <input
  type="text"
  value={releaseInfo.albumTitle || ""}
onFocus={() => {
  setShowAlbumSuggestions(true);
  setSuppressAlbumSuggestions(false);
}}  
  onChange={(e) => {
    const value = e.target.value;
    handleReleaseInfoChange("albumTitle", value);
    setAlbumSearch(value);
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
          setAlbumSuggestions([]);
          setHighlightedAlbumIndex(-1);
        }
      } else if (e.key === "Escape") {
        setAlbumSuggestions([]);
        setHighlightedAlbumIndex(-1);
      }
    }
  }}
  onBlur={() =>
  setTimeout(() => {
    setAlbumSuggestions([]);
    setShowAlbumSuggestions(false);}, 200)}
  placeholder="Search by album title"
  className="p-2 border border-gray-300 rounded-md w-full"
/>

{renderAlbumDropdown()}

</div>
)}            
{releaseInfo.typeOfRelease !== "Single" && (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1"># of Tracks</label>
    <input
      type="number"
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
)}



           <div className="flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">Distributor</label>
  <input
    type="text"
    value={releaseInfo.distributor || ""}
    onChange={(e) => handleReleaseInfoChange("distributor", e.target.value)}
    placeholder="Enter Distributor"
    className="p-2 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
  />

  </div>
           <div className="flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">Upload Cover Art</label>
  <input
    type="file"
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
  <span>Track {i + 1} Information</span>
  <span
    className="text-gray-400 hover:text-red-600 text-xl ml-4"
    title="Delete Track"
    onClick={(e) => {
      e.stopPropagation(); // prevent collapse toggle
      removeTrack(i); // you must define this function above your return
    }}
  >
    🗑️
  </span>
</summary>




           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
{/* Primary Title */}
<div className="relative flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">Primary Title</label>
<input
  type="text"
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
  handleTrackChange(i, "trackArtistName", entry["Track Artist Name"] || "");
  handleTrackChange(i, "trackNumber", entry["Track Number"] || "");
  handleTrackChange(i, "recordingTitle", entry["Recording Title"] || "");
  handleTrackChange(i, "akaTitle", entry["AKA Title"] || "");
  handleTrackChange(i, "akaTypeCode", entry["AKA Type Code (MLC)"] || "");
  handleTrackChange(i, "isrc", entry["ISRC"] || "");
  handleTrackChange(i, "iswc", entry["ISWC"] || "");
  handleTrackChange(i, "duration", entry["Duration"] || "");
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
  handleTrackChange(i, "trackArtistName", entry["Track Artist Name"] || "");
  handleTrackChange(i, "trackNumber", entry["Track Number"] || "");
  handleTrackChange(i, "recordingTitle", entry["Recording Title"] || "");
  handleTrackChange(i, "akaTitle", entry["AKA Title"] || "");
  handleTrackChange(i, "akaTypeCode", entry["AKA Type Code (MLC)"] || "");
  handleTrackChange(i, "isrc", entry["ISRC"] || "");
  handleTrackChange(i, "iswc", entry["ISWC"] || "");
  handleTrackChange(i, "duration", entry["Duration"] || "");
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
    publisher: publisherInfo?.["Publisher"] || "",
    publisherIPI: publisherInfo?.["Publisher IPI"] || "",
    publisherPRO: publisherInfo?.["Publisher PRO"] || "",
    pubadmin: adminInfo?.["Publisher Admin"] || "",
    pubadminIPI: adminInfo?.["Publisher Admin IPI"] || "",
    pubadminShare: adminInfo?.["Publisher Admin Collection Share"] || "",
    composeraddress: c["Address"] || "",
    composercity: c["City"] || "",
    composerstate: c["State"] || "",
    composerzip: c["Zip"] || "",
    split: c["Split"] || ""
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
          {entry["Primary Title"]}
        </li>
      ))}
    </ul>
  )}
</div>



{/* Track Artist Name */}
<div className="relative flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">Track Artist Name</label>
  <input
  type="text"
  value={track.trackArtistName || ""}
  onChange={(e) => {
    const value = e.target.value;
    handleTrackChange(i, "trackArtistName", value);
    if (value.length >= 1) {
      const matches = artistDB
        .map((a) => a["Artist Name"])
        .filter((name) =>
          name?.toLowerCase().startsWith(value.toLowerCase())
        );
      setArtistSuggestions(matches);
      setHighlightedArtistIndex(0);
      setActiveArtistInputIndex(i);
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
        if (highlightedArtistIndex >= 0) {
          const selected = artistSuggestions[highlightedArtistIndex];
          handleTrackChange(i, "trackArtistName", selected);
          setArtistSuggestions([]);
          setActiveArtistInputIndex(null);
        }
      }
    }
  }}
  onBlur={() => setTimeout(() => setArtistSuggestions([]), 150)}
  placeholder="Start typing artist name"
  className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
/>
  {activeArtistInputIndex === i && artistSuggestions.length > 0 && (
  <ul className="absolute z-10 mt-10 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
    {artistSuggestions.map((name, idx) => (
      <li
        key={idx}
        className={`p-2 cursor-pointer ${
          idx === highlightedArtistIndex ? "bg-blue-100" : ""
        }`}
        onMouseDown={() => {
          handleTrackChange(i, "trackArtistName", name);
          setArtistSuggestions([]);
          setActiveArtistInputIndex(null);
        }}
      >
        {name}
      </li>
    ))}
  </ul>
)}
</div>


  {/* Other Fields */}
  {renderInput("Recording Title", track.recordingTitle, (e) => handleTrackChange(i, "recordingTitle", e.target.value))}
  {renderInput("AKA Title", track.akaTitle, (e) => handleTrackChange(i, "akaTitle", e.target.value))}

  {/* ISRC */}
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">ISRC</label>
    <input
      type="text"
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
      type="text"
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
  {renderInput("Duration", track.duration, (e) => handleTrackChange(i, "duration", e.target.value))}
  {renderInput("Track label", track.trackLabel, (e) => handleTrackChange(i, "trackLabel", e.target.value))}
  {renderInput("Track P Line", track.trackPLine, (e) => handleTrackChange(i, "trackPLine", e.target.value))}
  {renderInput("AKA Type Code (MLC)", track.akaTypeCode, (e) => handleTrackChange(i, "akaTypeCode", e.target.value))}

  {/* Audio Upload */}
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">Audio File</label>
    <input
      type="file"
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

console.log("🔍 FINAL CONDITIONS", {
  showAlbumSuggestions,
  albumSuggestionsLength: albumSuggestions.length,
});


          className={`p-2 hover:bg-blue-100 cursor-pointer ${
            highlightedAlbumIndex === idx ? "bg-blue-100" : ""
          }`}
          onClick={() => handleAlbumSuggestionClick(sugg)}
        >
          {sugg["Album Title"] || "Unknown Album"} — {sugg["Album Artist"] || "Unknown Artist"}
        </li>
      ))}
    </ul>
  );
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
  type="text"
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
      {sugg.firstName} {sugg.lastName}
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
  type="text"
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
          {sugg.firstName} {sugg.lastName}
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
  type="text"
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
                      {renderInput("Publisher PRO", composer.publisherPRO, (e) => handleComposerChange(i, j, "publisherPRO", e.target.value))}
                      {renderInput("Pub Admin Name", composer.pubadmin, (e) => handleComposerChange(i, j, "pubadmin", e.target.value))}
                      {renderInput("Pub Admin IPI", composer.pubadminIPI, (e) => handleComposerChange(i, j, "pubadminIPI", e.target.value))}
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
<div className="text-center mt-10">
  <button
    type="button"
    onClick={handleSubmit}
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow text-lg font-semibold"
  >
    Submit
  </button>
</div>
    </div>
  );
}

  function renderAlbumDropdown() {
    const shouldShow = showAlbumSuggestions && albumSuggestions.length > 0;

    if (!shouldShow) return null;

    return (
      <ul className="absolute z-10 mt-12 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
        {albumSuggestions.map((sugg, idx) => (
          <li
            key={idx}
            className={`p-2 hover:bg-blue-100 cursor-pointer ${highlightedAlbumIndex === idx ? "bg-blue-100" : ""}`}
            onClick={() => handleAlbumSuggestionClick(sugg)}
          >
            {sugg["Album Title"] || "Unknown Album"} — {sugg["Album Artist"] || "Unknown Artist"}
          </li>
        ))}
      </ul>
    );
  }


  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <Toaster position="top-right" />
      {/* Add your main form UI here */}
      {renderAlbumDropdown()}
    </div>
  );
}
