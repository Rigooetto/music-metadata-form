import React from "react";

export default function ComposerForm({
  composer,
  i,
  j,
  onComposerChange,
  onRemoveComposer,
  suggestions,
  highlightedIndex,
  onSuggestionSelect,
  isLocked,
  activeInput,
  setSuggestions,
  setActiveInput,
}) {
  return (
    <div className="mb-6 pb-4 border-b border-gray-300">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-blue-600">Composer {j + 1}</h4>
        <button
          title="Remove Composer"
          onClick={() => onRemoveComposer(i, j)}
          className="text-gray-400 hover:text-red-600 text-xl"
        >🗑️</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* First Name with suggestions */}
        <div className="relative flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            disabled={isLocked}
            type="text"
            value={composer.firstName || ""}
            onChange={e => onComposerChange(i, j, "firstName", e.target.value)}
            onKeyDown={e => {
              if (suggestions.length === 0) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                onSuggestionSelect("next");
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                onSuggestionSelect("prev");
              }
              if (e.key === "Enter") {
                e.preventDefault();
                onSuggestionSelect("select", i, j, suggestions[highlightedIndex]);
              }
              if (e.key === "Escape") {
                setSuggestions([]);
                setActiveInput(null);
              }
            }}
            onBlur={() => setTimeout(() => setSuggestions([]), 200)}
            placeholder="Start typing first name"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {/* Suggestions */}
          {activeInput &&
            activeInput.trackIndex === i &&
            activeInput.composerIndex === j &&
            activeInput.field === "firstName" &&
            suggestions.length > 0 && (
              <ul className="absolute z-10 mt-10 bg-white border border-gray-300 rounded-md w-full shadow-lg max-h-48 overflow-auto">
                {suggestions.map((sugg, idx) => (
                  <li
                    key={idx}
                    className={`p-2 cursor-pointer hover:bg-blue-100 ${
                      idx === highlightedIndex ? "bg-blue-100 font-medium" : ""
                    }`}
                    onMouseDown={() =>
                      onSuggestionSelect("select", i, j, sugg)
                    }
                  >
                    {sugg.firstName} {sugg.middleName} {sugg.lastName}
                  </li>
                ))}
              </ul>
            )}
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Middle Name</label>
          <input
            disabled={isLocked}
            type="text"
            value={composer.middleName || ""}
            onChange={e => onComposerChange(i, j, "middleName", e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            disabled={isLocked}
            type="text"
            value={composer.lastName || ""}
            onChange={e => onComposerChange(i, j, "lastName", e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
      {/* Add the rest of the composer fields as in your code */}
      {/* Example: IPI, PRO, Publisher, Publisher IPI, etc. */}
    </div>
  );
}