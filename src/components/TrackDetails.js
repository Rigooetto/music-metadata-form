import React from "react";
import ComposerForm from "./ComposerForm";

export default function TrackDetails({
  index,
  track,
  handleTrackChange,
  handleComposerChange,
  addComposer,
  removeComposer,
  removeTrack,
  isLocked,
  composersDB,
  artistDB,
  publishersDB,
  setTracks,
}) {
  // Helper for changing a track field
  const onFieldChange = (field, value) => handleTrackChange(index, field, value);

  // Add/remove artist logic for this track
  const addTrackArtist = () => {
    const updated = [...track.trackArtistNames, ""];
    onFieldChange("trackArtistNames", updated);
  };

  const removeTrackArtist = (artistIdx) => {
    const updated = [...track.trackArtistNames];
    updated.splice(artistIdx, 1);
    onFieldChange("trackArtistNames", updated);
  };

  const onTrackArtistChange = (artistIdx, value) => {
    const updated = [...track.trackArtistNames];
    updated[artistIdx] = value;
    onFieldChange("trackArtistNames", updated);
  };

  return (
    <details open={!track.collapsed} className="mb-6 border rounded-xl p-4 bg-gray-50">
      <summary className="cursor-pointer font-semibold text-blue-700 mb-4 flex items-center justify-between">
        <span>
          Track {index + 1} Information
          {track?.primaryTitle && (
            <span className="text-gray-500 italic text-sm ml-2">– “{track.primaryTitle}”</span>
          )}
        </span>
        <span
          className="text-gray-400 hover:text-red-600 text-xl ml-4 cursor-pointer"
          title="Delete Track"
          onClick={e => {
            e.stopPropagation();
            removeTrack(index);
          }}
        >
          🗑️
        </span>
      </summary>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Primary Title</label>
          <input
            disabled={isLocked}
            type="text"
            value={track.primaryTitle || ""}
            onChange={e => onFieldChange("primaryTitle", e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Track Number</label>
          <input
            disabled={isLocked}
            type="text"
            value={track.trackNumber || ""}
            onChange={e => onFieldChange("trackNumber", e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>
        {/* ...add other basic fields as needed, following the above pattern... */}

        {/* Track Artists */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-sm font-medium text-gray-700 mb-1">Track Artist(s)</label>
          {Array.isArray(track.trackArtistNames) &&
            track.trackArtistNames.map((artist, artistIdx) => (
              <div key={artistIdx} className="relative flex items-center mb-2">
                <input
                  type="text"
                  disabled={isLocked}
                  value={artist}
                  placeholder={`Artist ${artistIdx + 1}`}
                  onChange={e => onTrackArtistChange(artistIdx, e.target.value)}
                  className="p-2 border border-gray-300 rounded-md w-full"
                />
                {track.trackArtistNames.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTrackArtist(artistIdx)}
                    className="ml-2 text-red-500 hover:text-red-700 text-lg"
                    title="Remove Artist"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          <button
            type="button"
            onClick={addTrackArtist}
            className="text-blue-600 hover:text-blue-800 text-sm mt-1 self-start"
            disabled={isLocked}
          >
            + Add Another Artist
          </button>
        </div>
      </div>

      {/* Composers */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Composers</h3>
        <ComposerForm
          composers={track.composers}
          trackIndex={index}
          handleComposerChange={handleComposerChange}
          addComposer={addComposer}
          removeComposer={removeComposer}
          isLocked={isLocked}
          composersDB={composersDB}
          publishersDB={publishersDB}
          artistDB={artistDB}
        />
      </div>
    </details>
  );
}