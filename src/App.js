import React, { useState, useEffect } from "react";
import { Toaster, toast } from 'react-hot-toast';
import ReleaseForm from "./components/ReleaseForm";
import TrackList from "./components/TrackList";
import {
  fetchComposers,
  fetchArtists,
  fetchCatalog,
  fetchPublishers,
} from "./services/api";
import { createEmptyTrack, createEmptyComposer, normalizeDuration } from "./utils/normalize";

const initialReleaseInfo = {
  upc: "",
  albumTitle: "",
  albumArtist: [""],
  numTracks: "",
  distributor: "Believe",
  releaseDate: "",
  recDate: "",
  typeOfRelease: "",
  coverArt: null,
  coverArtPreview: null,
};

export default function App() {
  // Top-level state
  const [isLocked, setIsLocked] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState({ ...initialReleaseInfo });
  const [tracks, setTracks] = useState([{ ...createEmptyTrack(), collapsed: false }]);
  const [composersDB, setComposersDB] = useState([]);
  const [artistDB, setArtistDB] = useState([]);
  const [catalogDB, setCatalogDB] = useState([]);
  const [publishersDB, setPublishersDB] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

// Data loading
useEffect(() => {
  fetchComposers().then(data => {
    setComposersDB(data);
    console.log("Composers DB:", data);
  });
  fetchArtists().then(data => {
    setArtistDB(data);
    console.log("Artists DB:", data);
  });
  fetchCatalog().then(data => {
    setCatalogDB(data);
    console.log("Catalog DB:", data);
  });
  fetchPublishers().then(data => {
    setPublishersDB(data);
    console.log("Publishers DB:", data);
  });
}, []);

  // Form actions
  const handleReleaseInfoChange = (field, value) => {
    setReleaseInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleTrackChange = (index, field, value) => {
    setTracks(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleComposerChange = (trackIdx, composerIdx, field, value) => {
    setTracks(prev => {
      const updated = [...prev];
      updated[trackIdx].composers[composerIdx][field] = value;
      return updated;
    });
  };

  const addTrack = () => {
    setTracks(prev => [
      ...prev,
      { ...createEmptyTrack(), collapsed: false }
    ]);
    setReleaseInfo(prev => ({
      ...prev,
      numTracks: (parseInt(prev.numTracks || "0") + 1).toString(),
    }));
  };

  const removeTrack = (index) => {
    setTracks(prev => {
      const updated = prev.filter((_, i) => i !== index);
      setReleaseInfo(r => ({ ...r, numTracks: updated.length.toString() }));
      return updated;
    });
  };

  const addComposer = (trackIdx) => {
    setTracks(prev => {
      const updated = [...prev];
      updated[trackIdx].composers.push(createEmptyComposer());
      return updated;
    });
  };

  const removeComposer = (trackIdx, composerIdx) => {
    setTracks(prev => {
      const updated = [...prev];
      updated[trackIdx].composers.splice(composerIdx, 1);
      return updated;
    });
  };

  const handleClearForm = () => {
    setReleaseInfo({ ...initialReleaseInfo });
    setTracks([{ ...createEmptyTrack(), trackNumber: 1 }]);
  };

  // Submission logic -- update as needed for your real endpoints
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Compose payload
      const payload = {
        releaseInfo,
        tracks,
      };
      // TODO: Post to your endpoint
      toast.success("Submitted!");
      handleClearForm();
    } catch (err) {
      toast.error("Submission failed!");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <Toaster />
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">Music Catalog Data Entry</h1>
        <ReleaseForm
          releaseInfo={releaseInfo}
          onChange={handleReleaseInfoChange}
          artistDB={artistDB}
          isLocked={isLocked}
        />
        <TrackList
          tracks={tracks}
          setTracks={setTracks}
          handleTrackChange={handleTrackChange}
          handleComposerChange={handleComposerChange}
          addComposer={addComposer}
          removeComposer={removeComposer}
          removeTrack={removeTrack}
          isLocked={isLocked}
          catalogDB={catalogDB}
          composersDB={composersDB}
          artistDB={artistDB}
          publishersDB={publishersDB}
        />
        <div className="text-center mt-10 space-x-4">
          <button
            type="button"
            onClick={handleClearForm}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-md shadow text-md font-semibold"
            disabled={isSubmitting}
          >
            Clear Form
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow text-md font-semibold"
            disabled={isSubmitting}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
