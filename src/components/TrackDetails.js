import React from "react";
import ComposerForm from "./ComposerForm";

export default function TrackDetails({
  track,
  i,
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
}) {
  return (
    <details open={!track.collapsed} className="mb-6 border rounded-xl p-4 bg-gray-50">
      <summary className="cursor-pointer font-semibold text-blue-700 mb-4 flex items-center justify-between">
        <span>Track {i + 1} Information</span>
        <span
          className="text-gray-400 hover:text-red-600 text-xl ml-4 cursor-pointer"
          title="Delete Track"
          onClick={e => {
            e.stopPropagation();
            removeTrack(i);
          }}
        >🗑️</span>
      </summary>
      {/* ...Render all track fields and artist suggestions, as in your working App.js... */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Composers</h3>
        {track.composers.map((composer, j) => (
          <ComposerForm
            key={j}
            composer={composer}
            i={i}
            j={j}
            suggestions={composerSuggestions}
            highlightedIndex={highlightedComposerIndex}
            onComposerChange={handleComposerChange}
            onRemoveComposer={removeComposer}
            onSuggestionSelect={() => {}}
            isLocked={isLocked}
            activeInput={activeComposerInput}
            setSuggestions={setComposerSuggestions}
            setActiveInput={setActiveComposerInput}
          />
        ))}
        <button
          type="button"
          onClick={() => addComposer(i)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
        >+ Add Composer</button>
      </div>
    </details>
  );
}