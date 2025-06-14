// src/utils/normalize.js

export function normalizeDuration(raw) {
  if (!raw) return "";
  // Accepts mm:ss or just seconds or just minutes
  if (/^\d+:\d+$/.test(raw)) {
    return raw;
  }
  if (/^\d+$/.test(raw)) {
    const minutes = Math.floor(Number(raw) / 60);
    const seconds = Number(raw) % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
  return raw;
}

export function createEmptyTrack() {
  return {
    primaryTitle: "",
    trackNumber: "",
    trackArtistNames: [""],
    composers: [createEmptyComposer()],
    collapsed: false,
    // add any other default fields as needed
  };
}

export function createEmptyComposer() {
  return {
    firstName: "",
    middleName: "",
    lastName: "",
    ipi: "",
    pro: "",
    split: "",
    roleCode: "",
    publisher: "",
  };
}