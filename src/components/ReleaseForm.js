import React, { useState } from "react";
console.log(">>> ReleaseForm.js loaded!");

export default function ReleaseForm({ releaseInfo, onChange, artistDB, isLocked, catalogDB }) {
  const [upcSuggestions, setUpcSuggestions] = useState([]);
  const [showUpcDropdown, setShowUpcDropdown] = useState(false);


export default function ReleaseForm({ releaseInfo, onChange, artistDB, isLocked }) {
  const [artistSuggestions, setArtistSuggestions] = useState([]);
  const [activeArtistInputIndex, setActiveArtistInputIndex] = useState(null);
  const [highlightedArtistIndex, setHighlightedArtistIndex] = useState(0);

  // UPC search and auto-suggest
  const handleUpcChange = (e) => {
    console.log("handleUpcChange fired!");
    const value = e.target.value.replace(/\D/g, "");
    onChange("upc", value);

    if (value.length > 4 && catalogDB && catalogDB.length) {
      const matches = catalogDB
        .filter(row => row.UPC && String(row.UPC).startsWith(value));
      console.log("Matches found:", matches);
      setUpcSuggestions(matches.slice(0, 10)); // show up to 10 matches
      setShowUpcDropdown(true);
    } else {
      console.log("Matches found:", matches);
      setUpcSuggestions([]);
      setShowUpcDropdown(false);
    }
console.log("handleUpcChange called, value:", e.target.value);
    
  };

  const handleUpcSelect = (item) => {
    // Populate the form with fields from the selected catalog item
    onChange("upc", item.UPC || "");
    onChange("albumTitle", item["Album Title"] || "");
    onChange("albumArtist", [item["Album Artist"] || ""]);
    onChange("distributor", item["Distributor"] || "");
    onChange("releaseDate", item["Digital Release Date"]?.split("T")[0] || "");
    // Add more fields as needed
    setUpcSuggestions([]);
    setShowUpcDropdown(false);
  };
  
  const handleAlbumArtistChange = (index, value) => {
    const updated = [...releaseInfo.albumArtist];
    updated[index] = value;
    onChange("albumArtist", updated);

    if (value.length > 0) {
      const matches = artistDB
        .map(a => a["Artist Name"])
        .filter(name => String(name || "").toLowerCase().startsWith(String(value || "").toLowerCase()));
      setArtistSuggestions(matches);
      setHighlightedArtistIndex(0);
      setActiveArtistInputIndex(index);
    } else {
      setArtistSuggestions([]);
      setActiveArtistInputIndex(null);
    }
  };

  const addAlbumArtist = () => {
    onChange("albumArtist", [...releaseInfo.albumArtist, ""]);
    
    console.log("catalogDB in ReleaseForm:", catalogDB);
  };


  
  return (
    <h1>TESTING</h1>
     <section>
    <h1>TESTING</h1>
    {/* ...rest of your form... */}
  </section>
    <section className="mb-10 border-b pb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Release Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Type of Release */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Type of Release</label>
          <select
            className="p-2 h-11 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={releaseInfo.typeOfRelease || ""}
            onChange={e => onChange("typeOfRelease", e.target.value)}
            disabled={isLocked}
          >
            <option value="" disabled>Select type</option>
            <option value="Single">Single</option>
            <option value="Album">Album</option>
            <option value="EP">EP</option>
          </select>
        </div>

        {/* UPC */}
      <div className="relative flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">UPC</label>
  <input
    disabled={isLocked}
    type="text"
    value={releaseInfo.upc || ""}
    onChange={handleUpcChange}
    placeholder="Enter UPC"
    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    onFocus={() => (upcSuggestions.length > 0 ? setShowUpcDropdown(true) : null)}
    onBlur={() => setTimeout(() => setShowUpcDropdown(false), 150)}
  />
  {/* You can put this log here using a curly brace block */}
  {(() => {
    console.log("showUpcDropdown:", showUpcDropdown, "upcSuggestions:", upcSuggestions);
    return null;
  })()}
  {showUpcDropdown && upcSuggestions.length > 0 && (
    <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg max-h-56 overflow-auto">
      {upcSuggestions.map((item, idx) => (
        <li
          key={idx}
          className="p-2 cursor-pointer hover:bg-blue-100"
          onMouseDown={() => handleUpcSelect(item)}
        >
          <span className="font-mono">{item.UPC}</span>
          {item["Album Title"] && (
            <span> — <span className="italic">{item["Album Title"]}</span></span>
          )}
          {item["Album Artist"] && (
            <span className="text-gray-500"> ({item["Album Artist"]})</span>
          )}
        </li>
      ))}
    </ul>
  )}
</div>

        {/* Album Artists */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1">Album Artist(s)</label>
          {Array.isArray(releaseInfo.albumArtist) &&
            releaseInfo.albumArtist.map((artist, idx) => (
              <React.Fragment key={idx}>
                <div className="relative flex items-center mb-2">
                  <input
                    type="text"
                    value={artist}
                    disabled={isLocked}
                    placeholder={`Artist ${idx + 1}`}
                    onChange={e => handleAlbumArtistChange(idx, e.target.value)}
                    onKeyDown={e => {
                      if (artistSuggestions.length > 0) {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setHighlightedArtistIndex(prev =>
                            prev < artistSuggestions.length - 1 ? prev + 1 : prev
                          );
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setHighlightedArtistIndex(prev =>
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
                        onChange("albumArtist", updated);
                      }}
                      className="ml-2 text-red-500 hover:text-red-700 text-lg"
                      title="Remove Artist"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                {/* Suggestions Dropdown */}
                {activeArtistInputIndex === idx &&
                  artistSuggestions.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
                      {artistSuggestions.map((name, i) => (
                        <li
                          key={i}
                          className={`p-2 cursor-pointer ${highlightedArtistIndex === i ? "bg-blue-100" : ""}`}
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
            disabled={isLocked}
          >
            + Add Another Artist
          </button>
        </div>

        {/* Digital Release Date */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Digital Release Date</label>
          <input
            disabled={isLocked}
            type="date"
            value={releaseInfo.releaseDate || ""}
            onChange={e => onChange("releaseDate", e.target.value)}
            className="p-2 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Album Title */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Album Title</label>
          <input
            disabled={isLocked}
            type="text"
            value={releaseInfo.albumTitle || ""}
            onChange={e => onChange("albumTitle", e.target.value)}
            placeholder="Album Title"
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>

        {/* Number of Tracks */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1"># of Tracks</label>
          <input
            disabled={isLocked}
            type="number"
            min="1"
            step="1"
            value={releaseInfo.numTracks || ""}
            onChange={e => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                onChange("numTracks", value);
              }
            }}
            placeholder="Enter number of tracks"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Distributor */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Distributor</label>
          <input
            disabled={isLocked}
            type="text"
            value={releaseInfo.distributor || ""}
            onChange={e => onChange("distributor", e.target.value)}
            placeholder="Distributor"
            className="p-2 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Cover Art */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Upload Cover Art</label>
          <input
            disabled={isLocked}
            type="file"
            accept="image/*"
            onChange={e => onChange("coverArt", e.target.files[0])}
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
  );
}
