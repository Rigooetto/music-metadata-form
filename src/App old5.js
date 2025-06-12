
import React, { useState, useEffect } from "react";

const App = () => {
  const [releaseInfo, setReleaseInfo] = useState({
    typeOfRelease: "",
    upc: "",
    albumArtist: "",
    releaseDate: "",
    numTracks: "",
    distributor: "",
    albumTitle: ""
  });

  const [catalogDB, setCatalogDB] = useState([]);
  const [upcSuggestions, setUpcSuggestions] = useState([]);
  const [highlightedUpcIndex, setHighlightedUpcIndex] = useState(-1);
  const [upcInputFocused, setUpcInputFocused] = useState(false);

  const [albumSuggestions, setAlbumSuggestions] = useState([]);
  const [highlightedAlbumIndex, setHighlightedAlbumIndex] = useState(-1);
  const [showAlbumSuggestions, setShowAlbumSuggestions] = useState(false);
  const [albumSearch, setAlbumSearch] = useState("");
  const [suppressAlbumSuggestions, setSuppressAlbumSuggestions] = useState(false);

  useEffect(() => {
    // Placeholder for catalogDB fetch
    setCatalogDB([
      { "UPC": "1234567890", "Album Title": "Example Album", "Album Artist": "Example Artist" }
    ]);
  }, []);

  const handleReleaseInfoChange = (field, value) => {
    setReleaseInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpcSuggestionClick = (sugg) => {
    handleReleaseInfoChange("upc", sugg["UPC"]);
    handleReleaseInfoChange("albumTitle", sugg["Album Title"]);
    handleReleaseInfoChange("albumArtist", sugg["Album Artist"]);
    setUpcSuggestions([]);
    setHighlightedUpcIndex(-1);
  };

  const handleAlbumSuggestionClick = (sugg) => {
    handleReleaseInfoChange("albumTitle", sugg["Album Title"]);
    handleReleaseInfoChange("albumArtist", sugg["Album Artist"]);
    setAlbumSuggestions([]);
    setShowAlbumSuggestions(false);
    setHighlightedAlbumIndex(-1);
  };

  const renderAlbumDropdown = () => {
    const shouldShow = showAlbumSuggestions && albumSuggestions.length > 0;
    if (!shouldShow) return null;

    return (
      <ul className="absolute z-10 mt-12 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
        {albumSuggestions.map((sugg, idx) => (
          <li
            key={idx}
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
                  const matches = catalogDB.filter(entry =>
                    entry?.["UPC"]?.toString().startsWith(value)
                  );
                  setUpcSuggestions(matches);
                  setHighlightedUpcIndex(-1);
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
                      handleUpcSuggestionClick(upcSuggestions[highlightedUpcIndex]);
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

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Album Artist</label>
              <input
                type="text"
                value={releaseInfo.albumArtist}
                onChange={(e) => handleReleaseInfoChange("albumArtist", e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
              />
            </div>

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
              <div className="relative flex flex-col col-span-2">
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
                        }
                      } else if (e.key === "Escape") {
                        setAlbumSuggestions([]);
                        setHighlightedAlbumIndex(-1);
                      }
                    }
                  }}
                  onBlur={() => setTimeout(() => {
                    setAlbumSuggestions([]);
                    setShowAlbumSuggestions(false);
                  }, 200)}
                  placeholder="Search by album title"
                  className="p-2 border border-gray-300 rounded-md w-full"
                />
                {renderAlbumDropdown()}
              </div>
            )}

            {releaseInfo.typeOfRelease !== "Single" && (
              <div className="flex flex-col col-span-2">
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

            <div className="flex flex-col col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1">Distributor</label>
              <input
                type="text"
                value={releaseInfo.distributor || ""}
                onChange={(e) => handleReleaseInfoChange("distributor", e.target.value)}
                placeholder="Enter Distributor"
                className="p-2 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;
