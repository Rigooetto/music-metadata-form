import React from "react";
import TrackDetails from "./TrackDetails";

export default function TrackList({
  tracks,
  setTracks,
  handleTrackChange,
  handleComposerChange,
  addComposer,
  removeComposer,
  removeTrack,
  isLocked,
  catalogDB,
  composersDB,
  artistDB,
  publishersDB,
}) {
  return (
    <div>
      {tracks.map((track, i) => (
        <TrackDetails
          key={i}
          index={i}
          track={track}
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
          setTracks={setTracks}
        />
      ))}
      <div className="text-center mt-10">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md shadow text-lg font-semibold"
          onClick={() => setTracks([...tracks, { ...tracks[0], trackNumber: tracks.length + 1 }])}
          disabled={isLocked}
        >
          + Add Another Track
        </button>
      </div>
    </div>
  );
}