import React, { useState, useEffect, useRef } from "react";
import {
  fetchDB,
  COMPOSERS_DB_URL,
  ARTISTS_DB_URL,
  CATALOG_DB_URL,
  PUBLISHERS_DB_URL
} from "./api";
import { createEmptyTrack, createEmptyComposer, normalizeDuration } from "./normalize";
import ReleaseForm from "./components/ReleaseForm";
import TrackList from "./components/TrackList";

export default function App() {
  // --- STATE ---
  const [isLocked, setIsLocked] = useState(false);

  // Release-level info
  const [releaseInfo, setReleaseInfo] = useState({
    upc: "",
    albumTitle: "",
    albumArtist: [""],
    numTracks: "1",
    distributor: "",
    releaseDate: "",
    recDate: "",
    typeOfRelease: "",
    coverArtPreview: null,
    coverArt: null,
  });

  // Tracks
  const [tracks, setTracks] = useState([{ ...createEmptyTrack(), collapsed: false }]);

  // Databases
  const [catalogDB, setCatalogDB] = useState([]);
  const [composersDB, setComposersDB] = useState([]);
  const [artistDB, setArtistDB] = useState([]);
  const [publishersDB, setPublishersDB] = useState([]);

  // Suggestion States for ReleaseForm
  const [artistSuggestions, setArtistSuggestions] = useState([]);
  const [highlightedArtistIndex, setHighlightedArtistIndex] = useState(-1);
  const [activeArtistInputIndex, setActiveArtistInputIndex] = useState(null);

  // Album Suggestions
  const [albumSuggestions, setAlbumSuggestions] = useState([]);
  const [highlightedAlbumIndex, setHighlightedAlbumIndex] = useState(-1);
  const [albumSearch, setAlbumSearch] = useState("");
  const [showAlbumSuggestions, setShowAlbumSuggestions] = useState(false);

  // UPC Suggestions
  const [upcSuggestions, setUpcSuggestions] = useState([]);
  const [highlightedUpcIndex, setHighlightedUpcIndex] = useState(-1);

  // Track suggestions
  const [trackSuggestions, setTrackSuggestions] = useState([]);
  const [highlightedTrackIndex, setHighlightedTrackIndex] = useState(-1);

  // Composer suggestions (per track)
  const [composerSuggestions, setComposerSuggestions] = useState([]);
  const [highlightedComposerIndex, setHighlightedComposerIndex] = useState(-1);
  const [activeComposerInput, setActiveComposerInput] = useState(null);

  // For publisher/admin dropdowns (per composer)
  const [publisherSuggestions, setPublisherSuggestions] = useState([]);
  const [highlightedPublisherIndex, setHighlightedPublisherIndex] = useState(-1);

  // -- EFFECTS: Load all remote DBs on mount --
  useEffect(() => {
    fetchDB(CATALOG_DB_URL).then(setCatalogDB);
    fetchDB(COMPOSERS_DB_URL).then(setComposersDB);
    fetchDB(ARTISTS_DB_URL).then(setArtistDB);
    fetchDB(PUBLISHERS_DB_URL).then(setPublishersDB);
  }, []);

  // --- HANDLERS ---

  // Release Info Handlers
  const handleReleaseInfoChange = (field, value) => {
    if (field === "coverArt") {
      const file = value;
      const previewURL = file ? URL.createObjectURL(file) : null;
      setReleaseInfo(prev => ({
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
      setReleaseInfo(prev => ({ ...prev, [field]: value }));
    } else {
      setReleaseInfo(prev => ({ ...prev, [field]: value }));
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
    setReleaseInfo(prev => ({ ...prev, albumArtist: updated }));
  };

  // --- TRACKS ---

  const handleTrackChange = (index, field, value) => {
    const updated = [...tracks];
    updated[index][field] = value;
    setTracks(updated);
  };

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
  const removeTrack = (index) => {
    const updated = tracks.filter((_, i) => i !== index);
    setTracks(updated);
    setReleaseInfo(prev => ({
      ...prev,
      numTracks: updated.length.toString(),
    }));
  };
  const addTrack = () => {
    if (releaseInfo.typeOfRelease === "Single" && tracks.length >= 1) return;
    if (releaseInfo.typeOfRelease === "EP" && tracks.length >= 9) return;
    const updated = tracks.map(t => ({ ...t, collapsed: true }));
    const newTrack = { ...createEmptyTrack(), collapsed: false };
    const newTracks = [...updated, newTrack];
    setTracks(newTracks);
    setReleaseInfo(prev => ({
      ...prev,
      numTracks: newTracks.length.toString(),
    }));
  };

  // --- COMPOSERS ---

  const handleComposerChange = (trackIndex, composerIndex, field, value) => {
    const updated = [...tracks];
    updated[trackIndex].composers[composerIndex][field] = value;

    // Composer name suggestions (first/last)
    if (field === "firstName" || field === "lastName") {
      const input = String(value || "").toLowerCase();
      const matches = composersDB.filter((c) =>
        c.firstName?.toLowerCase?.().startsWith(input) ||
        c.lastName?.toLowerCase?.().startsWith(input)
      );
      setComposerSuggestions(matches);
      setHighlightedComposerIndex(0);
      setActiveComposerInput({ trackIndex, composerIndex, field });
    }

    // Publisher suggestions
    if (field === "publisher") {
      const input = String(value || "").toLowerCase();
      const matches = publishersDB.filter((p) =>
        p.publisher?.toLowerCase?.().startsWith(input)
      );
      setPublisherSuggestions(matches);
      setHighlightedPublisherIndex(0);
    }

    setTracks(updated);
  };

  const addComposer = (trackIndex) => {
    const updated = [...tracks];
    updated[trackIndex].composers.push(createEmptyComposer());
    setTracks(updated);
  };
  const removeComposer = (trackIndex, composerIndex) => {
    const updated = [...tracks];
    updated[trackIndex].composers.splice(composerIndex, 1);
    setTracks(updated);
  };

  // --- CLEAR FORM ---
  const handleClearForm = () => {
    setReleaseInfo({
      upc: "",
      albumTitle: "",
      albumArtist: [""],
      numTracks: "1",
      distributor: "",
      releaseDate: "",
      recDate: "",
      typeOfRelease: "",
      coverArt: null,
      coverArtPreview: null,
    });
    setTracks([{ ...createEmptyTrack(), trackNumber: 1 }]);
    setArtistSuggestions([]);
    setUpcSuggestions([]);
    setAlbumSuggestions([]);
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    const payload = { releaseInfo, tracks };
    try {
      const response = await fetch("https://rigoletto.app.n8n.cloud/webhook/fd8ebef7-dccb-4b7f-9381-1702ea074949", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  // --- RENDER ---
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">Music Catalog Data Entry</h1>
        {/* Release Info */}
        <ReleaseForm
          releaseInfo={releaseInfo}
          handleReleaseInfoChange={handleReleaseInfoChange}
          artistDB={artistDB}
          artistSuggestions={artistSuggestions}
          setArtistSuggestions={setArtistSuggestions}
          highlightedArtistIndex={highlightedArtistIndex}
          setHighlightedArtistIndex={setHighlightedArtistIndex}
          activeArtistInputIndex={activeArtistInputIndex}
          setActiveArtistInputIndex={setActiveArtistInputIndex}
          addAlbumArtist={addAlbumArtist}
          handleAlbumArtistChange={handleAlbumArtistChange}
          isLocked={isLocked}
        />
        {/* Track List */}
        <TrackList
          tracks={tracks}
          handleTrackChange={handleTrackChange}
          handleTrackArtistChange={handleTrackArtistChange}
          addTrackArtist={addTrackArtist}
          removeTrack={removeTrack}
          addComposer={addComposer}
          removeComposer={removeComposer}
          composerSuggestions={composerSuggestions}
          highlightedComposerIndex={highlightedComposerIndex}
          handleComposerChange={handleComposerChange}
          activeComposerInput={activeComposerInput}
          setComposerSuggestions={setComposerSuggestions}
          setActiveComposerInput={setActiveComposerInput}
          isLocked={isLocked}
          onAddTrack={addTrack}
        />
        {/* Buttons */}
        <div className="text-center mt-10 space-x-4">
          <button
            type="button"
            onClick={handleClearForm}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md shadow text-md font-semibold"
          >Clear Form</button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow text-md font-semibold"
          >Submit</button>
        </div>
      </div>
    </div>
  );
}