import React from "react";

export default function ComposerForm({
  composers,
  trackIndex,
  handleComposerChange,
  addComposer,
  removeComposer,
  isLocked,
  composersDB,
  publishersDB,
}) {
  const onFieldChange = (composerIdx, field, value) => {
    handleComposerChange(trackIndex, composerIdx, field, value);
  };

  return (
    <div>
      {composers.map((composer, composerIdx) => (
        <div key={composerIdx} className="mb-6 pb-4 border-b border-gray-300">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-blue-600">Composer {composerIdx + 1}</h4>
            <button
              title="Remove Composer"
              onClick={() => removeComposer(trackIndex, composerIdx)}
              className="text-gray-400 hover:text-red-600 text-xl"
              disabled={isLocked}
            >
              🗑️
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              disabled={isLocked}
              type="text"
              value={composer.firstName || ""}
              onChange={e => onFieldChange(composerIdx, "firstName", e.target.value)}
              placeholder="First Name"
              className="p-2 border border-gray-300 rounded-md"
            />
            <input
              disabled={isLocked}
              type="text"
              value={composer.middleName || ""}
              onChange={e => onFieldChange(composerIdx, "middleName", e.target.value)}
              placeholder="Middle Name"
              className="p-2 border border-gray-300 rounded-md"
            />
            <input
              disabled={isLocked}
              type="text"
              value={composer.lastName || ""}
              onChange={e => onFieldChange(composerIdx, "lastName", e.target.value)}
              placeholder="Last Name"
              className="p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              disabled={isLocked}
              type="text"
              value={composer.ipi || ""}
              onChange={e => onFieldChange(composerIdx, "ipi", e.target.value)}
              placeholder="IPI/CAE#"
              className="p-2 border border-gray-300 rounded-md"
            />
            <input
              disabled={isLocked}
              type="text"
              value={composer.pro || ""}
              onChange={e => onFieldChange(composerIdx, "pro", e.target.value)}
              placeholder="Composer PRO"
              className="p-2 border border-gray-300 rounded-md"
            />
            <input
              disabled={isLocked}
              type="text"
              value={composer.split || ""}
              onChange={e => onFieldChange(composerIdx, "split", e.target.value)}
              placeholder="Composer Share %"
              className="p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              disabled={isLocked}
              type="text"
              value={composer.roleCode || ""}
              onChange={e => onFieldChange(composerIdx, "roleCode", e.target.value)}
              placeholder="Writer Role Code"
              className="p-2 border border-gray-300 rounded-md"
            />
            <input
              disabled={isLocked}
              type="text"
              value={composer.publisher || ""}
              onChange={e => onFieldChange(composerIdx, "publisher", e.target.value)}
              placeholder="Publisher"
              className="p-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
            onClick={() => addComposer(trackIndex)}
            disabled={isLocked}
          >
            + Add Composer
          </button>
        </div>
      ))}
    </div>
  );
}