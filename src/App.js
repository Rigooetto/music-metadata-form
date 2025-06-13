import React, { useState } from "react";
import { Toaster, toast } from 'react-hot-toast';

// 🗂️ Simulated local Composer database
const mockComposersDB = [
  {
    firstName: "José",
    middleName: "Luis",
    lastName: "Pérez",
    ipi: "123456789",
    split: "50",
    pro: "BMI",
    roleCode: "C",
    publisher: "Afinarte Publishing",
    publisherIPI: "987654321",
    publisherPRO: "BMI",
    pubadmin: "Songs of Afinarte",
    pubadminIPI: "456789123",
    pubadminShare: "50",
  },
  {
    firstName: "Maria",
    middleName: "",
    lastName: "Lopez",
    ipi: "111222333",
    split: "100",
    pro: "ASCAP",
    roleCode: "CA",
    publisher: "Melodies Inc",
    publisherIPI: "999888777",
    publisherPRO: "ASCAP",
    pubadmin: "Melodies Admin",
    pubadminIPI: "222333444",
    pubadminShare: "100",
  },
];
const mockArtistsDB = [
  {
    name: "El Fantasma",
    label: "Afinarte Music",
  },
  {
    name: "Los Dos Carnales",
    label: "Afinarte Music",
  },
  {
    name: "La Zenda Norteña",
    label: "Z Records",
  },
];
const mockPublishersDB = [
  {
    name: "Afinarte Publishing",
    ipi: "987654321",
    pro: "BMI",
    admin: "Songs of Afinarte",
    adminIPI: "456789123",
    adminShare: "50",
  },
  {
    name: "Melodies Inc",
    ipi: "999888777",
    pro: "ASCAP",
    admin: "Melodies Admin",
    adminIPI: "222333444",
    adminShare: "100",
  },
];

const mockCatalogDB = [
  {
    primaryTitle: "El Corrido del Jefe",
    recordingTitle: "El Corrido del Jefe",
    akaTitle: "El Jefe",
    akaTypeCode: "AKA",
    isrc: "US-ABC-23-12345",
    iswc: "T-123456789-0",
    duration: "03:15",
    trackLabel: "Afinarte Music",
    trackPLine: "2025 Afinarte Music, LLC.",
    trackArtistNames: "Los Patroncitos",
  },
  {
    primaryTitle: "Mi Vida Loca",
    recordingTitle: "Mi Vida Loca",
    akaTitle: "Vida Loca",
    akaTypeCode: "ALT",
    isrc: "US-XYZ-24-67890",
    iswc: "T-987654321-0",
    duration: "02:50",
    trackLabel: "Ranchero Records",
    trackPLine: "2024 Ranchero Records, Inc.",
    trackArtistNames: "Maria La Reina",
  },
];

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

  // 🎯 If already "mm:ss"
  if (typeof raw === "string" && /^\d+:\d{2}$/.test(raw)) {
    return raw;
  }

  // 🧠 Fractional day (like 0.13611...)
  if (typeof raw === "number" && raw > 0 && raw < 1) {
    const totalSeconds = Math.round(raw * 86400); // 24 * 60 * 60
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  // 🧠 Whole number (assume as minutes)
  if (typeof raw === "number") {
    return `${String(raw).padStart(2, "0")}:00`;
  }

  // 🧠 Date string like "1899-12-30T03:16:00.000Z"
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

// Stub for createEmptyTrack (customize as needed)
function createEmptyTrack() {
  return {
    trackNumber: "",
    title: "",
    duration: "",
    trackPLine: "",
    // ... add other default fields as required
  };
}

const COMPOSERS_DB_URL = "https://script.google.com/macros/s/AKfycbzrJdRXwsv_tQrcuQMqEE9WfRN1ZDlqwUXqJ8k7o39eA1t5lXLwiExuZmMpDD_Dmvy4iw/exec";
const ARTISTS_DB_URL = "https://script.google.com/macros/s/AKfycbzr3Mg2opXIyPXs5KZArgchglEyuZA-I135mYoL9aK2yuJIaHgCZSskdGS_mMiNShyw/exec";
const CATALOG_DB_URL = "https://script.google.com/macros/s/AKfycbxdta-h0LUQ4bHSRLF_czTFlOyIbs4z2RQjixNgVYEJOeKNp7T2rwJhi9-SZcBs57Q6/exec";
const PUBLISHERS_DB_URL = "https://script.google.com/macros/s/AKfycbzbKo0E1wih647uiiPQebf6x7Sl-LQTM9khdDhuv0D2lP79bqz69-smUUTUEsrnsuBGmA/exec";

export default function App() {
  const [isLocked, setIsLocked] = useState(false); // Fields are editable initially

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

  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [composersDB, setComposersDB] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [upcSuggestions, setUpcSuggestions] = useState([]);
  const [upcInputFocused, setUpcInputFocused] = useState(false);
  const [highlightedUpcIndex, setHighlightedUpcIndex] = useState(-1);
  const [albumSearch, setAlbumSearch] = useState("");
  const [albumSuggestions, setAlbumSuggestions] = useState([]);
  const [highlightedAlbumIndex, setHighlightedAlbumIndex] = useState(-1);

  const [activeInput, setActiveInput] = useState(null);
  const [artistSuggestions, setArtistSuggestions] = useState([]);
  const [activeArtistInputIndex, setActiveArtistInputIndex] = useState(null);
  const [highlightedArtistIndex, setHighlightedArtistIndex] = useState(-1);
  const [highlightedTrackIndex, setHighlightedTrackIndex] = useState(-1);
  const [artistInput, setArtistInput] = useState("");
  const [trackSuggestions, setTrackSuggestions] = useState([]);
  const [artistDB, setArtistDB] = useState([]);
  const [catalogDB, setCatalogDB] = useState([]);

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
    setSuggestions([]);
    setUpcSuggestions([]);
    setAlbumSuggestions([]);
    setArtistSuggestions([]);
  };

  // Example: placeholder for handleTrackChange (implement as needed)
  const handleTrackChange = (i, field, value) => {
    setTracks((prevTracks) =>
      prevTracks.map((track, idx) =>
        idx === i ? { ...track, [field]: value } : track
      )
    );
  };

  const maybeAutofillPLine = (i, label, releaseDate) => {
    if (!label || !releaseDate) return;
    const releaseYear = new Date(releaseDate).getFullYear();
    const pLine = `${releaseYear} ${label.trim()}`;
    handleTrackChange(i, "trackPLine", pLine);
  };

  // ...rest of your component logic and JSX

  return (
    <div>
      <Toaster />
      {/* Your component UI goes here */}
      <p>App Skeleton (UI not shown for brevity)</p>
    </div>
  );
}
