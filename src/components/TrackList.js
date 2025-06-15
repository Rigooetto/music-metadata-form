import React from "react";
import TrackDetails from "./TrackDetails";

export default function TrackList({
  tracks,
  handleTrackChange,
  handleTrackArtistChange,
  addTrackArtist,
  removeTrack,
  addComposer,
  removeComposer,
  composerSuggestions,
  highlightedComposerIndex,
  handleComposerChange,
  activeComposerInput,
  setComposerSuggestions,
  setActiveComposerInput,
  isLocked,
  onAddTrack,
}) {
  return (
    <div>
      {tracks.map((track, i) => (
        <TrackDetails
          key={i}
          track={track}
          i={i}
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
        />
      ))}
      <div className="text-center mt-10">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md shadow text-lg font-semibold"
          onClick={onAddTrack}
        >+ Add Another Track</button>
      </div>
    </div>
  );
}