import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";

// ====== DB URLs (replace with your own if needed) ======
const COMPOSERS_DB_URL = "https://script.google.com/macros/s/AKfycbzrJdRXwsv_tQrcuQMqEE9WfRN1ZDlqwUXqJ8k7o39eA1t5lXLwiExuZmMpDD_Dmvy4iw/exec";
const ARTISTS_DB_URL   = "https://script.google.com/macros/s/AKfycbzr3Mg2opXIyPXs5KZArgchglEyuZA-I135mYoL9aK2yuJIaHgCZSskdGS_mMiNShyw/exec";
const CATALOG_DB_URL   = "https://script.google.com/macros/s/AKfycbxdta-h0LUQ4bHSRLF_czTFlOyIbs4z2RQjixNgVYEJOeKNp7T2rwJhi9-SZcBs57Q6/exec";
const PUBLISHERS_DB_URL= "https://script.google.com/macros/s/AKfycbzbKo0E1wih647uiiPQebf6x7Sl-LQTM9khdDhuv0D2lP79bqz69-smUUTUEsrnsuBGmA/exec";

// ====== Utility functions ======
function normalizeDuration(raw) {
  if (!raw) return "";
  if (typeof raw === "string" && /^\d+:\d{2}$/.test(raw)) return raw;
  if (typeof raw === "number" && raw > 0 && raw < 1) {
    const totalSeconds = Math.round(raw * 86400);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  if (typeof raw === "number") {
    return `${String(raw).padStart(2, "0")}:00`;
  }
  if (typeof raw === "string" && raw.includes("T")) {
    try {
      const date = new Date(raw);
      const minutes = date.getUTCHours() * 60 + date.getUTCMinutes();
      const seconds = date.getUTCSeconds();
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    } catch {
      return "";
    }
  }
  return raw;
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

function createEmptyTrack() {
  return {
    trackNumber: "",
    primaryTitle: "",
    recordingTitle: "",
    akaTitle: "",
    akaTypeCode: "",
    countryRelease: "",
    basisClaim: "",
    percentClaim: "",
    collectionEnd: "",
    nonUSRights: "",
    genre: "",
    recDate: "",
    recEng: "",
    producer: "",
    execProducer: "",
    audioFile: null,
    isrc: "",
    iswc: "",
    trackLabel: "",
    duration: "",
    trackPLine: "",
    trackArtistNames: [""],
    typeOfRelease: "",
    collapsed: true,
    composers: [createEmptyComposer()],
    publishers: [],
  };
}

// ====== Main App Component ======
export default function App() {
  // -- Data DBs
  const [composersDB, setComposersDB] = useState([]);
  const [artistDB, setArtistDB] = useState([]);
  const [catalogDB, setCatalogDB] = useState([]);
  const [publishersDB, setPublishersDB] = useState([]);

  // -- UI State
  const [isLocked, setIsLocked] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState({
    upc: "",
    albumTitle: "",
    albumArtist: [""],
    numTracks: "1",
    distributor: "Believe",
    releaseDate: "",
    recDate: "",
    typeOfRelease: "",
    coverArt: null,
    coverArtPreview: null,
  });
  const [tracks, setTracks] = useState([{ ...createEmptyTrack(), trackNumber: 1 }]);
  const [albumSearch, setAlbumSearch] = useState("");
  const [albumSuggestions, setAlbumSuggestions] = useState([]);
  const [highlightedAlbumIndex, setHighlightedAlbumIndex] = useState(-1);
  const [artistSuggestions, setArtistSuggestions] = useState([]);
  const [activeArtistInputIndex, setActiveArtistInputIndex] = useState(null);
  const [highlightedArtistIndex, setHighlightedArtistIndex] = useState(-1);

  // -- Fetch DBs on mount
  useEffect(() => {
    fetch(COMPOSERS_DB_URL).then(r => r.json()).then(setComposersDB);
    fetch(ARTISTS_DB_URL).then(r => r.json()).then(setArtistDB);
    fetch(CATALOG_DB_URL).then(r => r.json()).then(setCatalogDB);
    fetch(PUBLISHERS_DB_URL).then(r => r.json()).then(setPublishersDB);
  }, []);

  // -- Album suggestion logic
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

  // -- Handlers
  const handleReleaseInfoChange = (field, value) => {
    if (field === "albumTitle") setAlbumSearch(value);
    setReleaseInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleAlbumArtistChange = (index, value) => {
    const updated = [...releaseInfo.albumArtist];
    updated[index] = value;
    setReleaseInfo(prev => ({ ...prev, albumArtist: updated }));
  };

  const addAlbumArtist = () => {
    setReleaseInfo(prev => ({ ...prev, albumArtist: [...prev.albumArtist, ""] }));
  };

  const handleAlbumSuggestionClick = (albumEntry) => {
    setReleaseInfo(prev => ({
      ...prev,
      albumTitle: albumEntry["Album Title"] || "",
      albumArtist: albumEntry["Album Artist"]
        ? [albumEntry["Album Artist"]]
        : [""],
      upc: albumEntry["UPC"] || "",
      distributor: albumEntry["Distributor"] || "",
      releaseDate: albumEntry["Digital Release Date"]
        ? new Date(albumEntry["Digital Release Date"]).toISOString().split("T")[0]
        : "",
      typeOfRelease: albumEntry["Type of Release"] || "",
      numTracks: albumEntry["# Tracks"] || "1",
    }));
    setAlbumSuggestions([]);
    setAlbumSearch(albumEntry["Album Title"] || "");
    toast.success("Album loaded!");
  };

  // -- Track/Composer Handlers
  const handleTrackChange = (idx, field, value) => {
    const updated = [...tracks];
    updated[idx][field] = value;
    setTracks(updated);
  };

  const handleTrackArtistChange = (trackIdx, artistIdx, value) => {
    const updated = [...tracks];
    updated[trackIdx].trackArtistNames[artistIdx] = value;
    setTracks(updated);
  };

  const addTrackArtist = (trackIdx) => {
    const updated = [...tracks];
    updated[trackIdx].trackArtistNames.push("");
    setTracks(updated);
  };

  const addTrack = () => {
    setTracks([...tracks.map(t => ({ ...t, collapsed: true })), { ...createEmptyTrack(), collapsed: false }]);
    setReleaseInfo(prev => ({ ...prev, numTracks: (parseInt(prev.numTracks || "1", 10) + 1).toString() }));
  };

  const removeTrack = (idx) => {
    const updated = tracks.filter((_, i) => i !== idx);
    setTracks(updated);
    setReleaseInfo(prev => ({ ...prev, numTracks: updated.length.toString() }));
  };

  const addComposer = (trackIdx) => {
    const updated = [...tracks];
    updated[trackIdx].composers.push(createEmptyComposer());
    setTracks(updated);
  };

  const handleComposerChange = (trackIdx, composerIdx, field, value) => {
    const updated = [...tracks];
    updated[trackIdx].composers[composerIdx][field] = value;
    setTracks(updated);
  };

  const removeComposer = (trackIdx, composerIdx) => {
    const updated = [...tracks];
    updated[trackIdx].composers.splice(composerIdx, 1);
    setTracks(updated);
  };

  const handleClearForm = () => {
    setReleaseInfo({
      upc: "",
      albumTitle: "",
      albumArtist: [""],
      numTracks: "1",
      distributor: "Believe",
      releaseDate: "",
      recDate: "",
      typeOfRelease: "",
      coverArt: null,
      coverArtPreview: null,
    });
    setTracks([{ ...createEmptyTrack(), trackNumber: 1 }]);
    setAlbumSearch("");
    setAlbumSuggestions([]);
    setArtistSuggestions([]);
    setActiveArtistInputIndex(null);
    setHighlightedArtistIndex(-1);
    setHighlightedAlbumIndex(-1);
  };

  // -- Submit (POST to webhook, adjust as needed)
  const handleSubmit = async () => {
    try {
      const payload = { releaseInfo, tracks };
      // TODO: replace with your webhook URL
      await fetch("https://rigoletto.app.n8n.cloud/webhook/fd8ebef7-dccb-4b7f-9381-1702ea074949", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      toast.success("Form submitted successfully!");
      handleClearForm();
    } catch (err) {
      console.error(err);
      toast.error("Submission failed.");
    }
  };

  // ====== Render ======
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <Toaster />
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">Music Catalog Data Entry</h1>
        {/* Release Info Section */}
        <section className="mb-10 border-b pb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Release Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type of Release */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">Type of Release</label>
              <select
                value={releaseInfo.typeOfRelease}
                onChange={e => handleReleaseInfoChange("typeOfRelease", e.target.value)}
                disabled={isLocked}
                className="p-2 h-11 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="" disabled>Select type</option>
                <option value="Single">Single</option>
                <option value="Album">Album</option>
                <option value="EP">EP</option>
              </select>
            </div>
            {/* UPC */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">UPC</label>
              <input
                type="text"
                value={releaseInfo.upc}
                onChange={e => handleReleaseInfoChange("upc", e.target.value.replace(/\D/g, ""))}
                disabled={isLocked}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            {/* Album Artists */}
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1">Album Artist(s)</label>
              {releaseInfo.albumArtist.map((artist, idx) => (
                <div key={idx} className="mb-2 flex items-center">
                  <input
                    type="text"
                    value={artist}
                    placeholder={`Artist ${idx + 1}`}
                    onChange={e => handleAlbumArtistChange(idx, e.target.value)}
                    disabled={isLocked}
                    className="p-2 border border-gray-300 rounded-md mr-2"
                  />
                  {releaseInfo.albumArtist.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...releaseInfo.albumArtist];
                        updated.splice(idx, 1);
                        setReleaseInfo(prev => ({ ...prev, albumArtist: updated }));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >🗑️</button>
                  )}
                </div>
              ))}
              <button type="button" className="text-blue-600 hover:text-blue-800 text-sm" onClick={addAlbumArtist}>+ Add Artist</button>
            </div>
            {/* Digital Release Date */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">Digital Release Date</label>
              <input
                type="date"
                value={releaseInfo.releaseDate}
                onChange={e => handleReleaseInfoChange("releaseDate", e.target.value)}
                disabled={isLocked}
                className="p-2 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            {/* Album Title + Suggestions */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700 mb-1">Album Title</label>
              <input
                type="text"
                value={albumSearch}
                onChange={e => setAlbumSearch(e.target.value)}
                onFocus={e => setAlbumSearch(releaseInfo.albumTitle)}
                onBlur={() => setTimeout(() => setAlbumSuggestions([]), 200)}
                disabled={isLocked}
                placeholder="Search by album title"
                className="p-2 border border-gray-300 rounded-md w-full"
              />
              {albumSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-12 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
                  {albumSuggestions.map((sugg, idx) => (
                    <li
                      key={idx}
                      className={`p-2 cursor-pointer ${highlightedAlbumIndex === idx ? "bg-blue-100" : "hover:bg-blue-50"}`}
                      onMouseDown={() => handleAlbumSuggestionClick(sugg)}
                      onMouseEnter={() => setHighlightedAlbumIndex(idx)}
                    >
                      {sugg["Album Title"] || "Unknown Album"} — {sugg["Album Artist"] || "Unknown Artist"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* # of Tracks */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1"># of Tracks</label>
              <input
                type="number"
                value={releaseInfo.numTracks}
                min={1}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, "");
                  setReleaseInfo(prev => ({ ...prev, numTracks: value }));
                  // Auto-add/remove tracks if needed
                  let count = Math.max(1, parseInt(value || "1", 10));
                  let updated = [...tracks];
                  while (updated.length < count) updated.push(createEmptyTrack());
                  while (updated.length > count) updated.pop();
                  setTracks(updated);
                }}
                disabled={isLocked}
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>
            {/* Distributor */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">Distributor</label>
              <input
                type="text"
                value={releaseInfo.distributor}
                onChange={e => handleReleaseInfoChange("distributor", e.target.value)}
                disabled={isLocked}
                className="p-2 h-12 border border-gray-300 rounded-md"
              />
            </div>
            {/* Cover Art */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1">Upload Cover Art</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files[0];
                  setReleaseInfo(prev => ({
                    ...prev,
                    coverArt: file,
                    coverArtPreview: file ? URL.createObjectURL(file) : null,
                  }));
                }}
                disabled={isLocked}
                className="p-2 h-12 border border-gray-300 rounded-md"
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

        {/* Tracks */}
        {tracks.map((track, idx) => (
          <details key={idx} open={!track.collapsed} className="mb-6 border rounded-xl p-4 bg-gray-50">
            <summary className="cursor-pointer font-semibold text-blue-700 mb-4 flex items-center justify-between">
              <span>
                Track {idx + 1}{track.primaryTitle ? ` – “${track.primaryTitle}”` : ""}
              </span>
              <button type="button" className="text-gray-400 hover:text-red-600 text-xl ml-4" title="Delete Track"
                onClick={e => {
                  e.preventDefault(); removeTrack(idx);
                }}>🗑️</button>
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Primary Title</label>
                <input
                  type="text"
                  value={track.primaryTitle}
                  onChange={e => handleTrackChange(idx, "primaryTitle", e.target.value)}
                  disabled={isLocked}
                  className="p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Track Number</label>
                <input
                  type="text"
                  value={track.trackNumber}
                  onChange={e => handleTrackChange(idx, "trackNumber", e.target.value)}
                  disabled={isLocked}
                  className="p-2 border border-gray-300 rounded-md"
                />
              </div>
              {/* Add more fields as needed */}
            </div>
            {/* Track Artists */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 mb-1">Track Artist(s)</label>
              {track.trackArtistNames.map((artist, artistIdx) => (
                <div key={artistIdx} className="mb-2 flex items-center">
                  <input
                    type="text"
                    value={artist}
                    onChange={e => handleTrackArtistChange(idx, artistIdx, e.target.value)}
                    disabled={isLocked}
                    className="p-2 border border-gray-300 rounded-md mr-2"
                  />
                  {track.trackArtistNames.length > 1 && (
                    <button type="button" className="text-red-500" onClick={() => {
                      const updated = [...track.trackArtistNames];
                      updated.splice(artistIdx, 1);
                      handleTrackChange(idx, "trackArtistNames", updated);
                    }}>🗑️</button>
                  )}
                </div>
              ))}
              <button type="button" className="text-blue-600 text-sm" onClick={() => addTrackArtist(idx)}>+ Add Artist</button>
            </div>
            {/* Composers */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Composers</h3>
              {track.composers.map((composer, j) => (
                <div key={j} className="mb-4 border-b pb-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={composer.firstName}
                      onChange={e => handleComposerChange(idx, j, "firstName", e.target.value)}
                      placeholder="First Name"
                      disabled={isLocked}
                      className="p-2 border border-gray-300 rounded-md mr-2"
                    />
                    <input
                      type="text"
                      value={composer.lastName}
                      onChange={e => handleComposerChange(idx, j, "lastName", e.target.value)}
                      placeholder="Last Name"
                      disabled={isLocked}
                      className="p-2 border border-gray-300 rounded-md"
                    />
                    {track.composers.length > 1 && (
                      <button type="button" className="text-red-500" onClick={() => removeComposer(idx, j)}>🗑️</button>
                    )}
                  </div>
                  {/* Add more composer fields as needed */}
                </div>
              ))}
              <button type="button" className="text-blue-600 text-sm" onClick={() => addComposer(idx)}>+ Add Composer</button>
            </div>
          </details>
        ))}
        <div className="text-center mt-10 space-x-4">
          <button type="button" onClick={addTrack}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md shadow text-lg font-semibold">
            + Add Another Track
          </button>
          <button type="button" onClick={handleClearForm}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md shadow text-md font-semibold">
            Clear Form
          </button>
          <button type="button" onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow text-md font-semibold">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
