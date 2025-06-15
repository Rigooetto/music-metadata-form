export function normalizeDuration(raw) {
  if (!raw) return "";
  if (typeof raw === "string" && /^\d+:\d{2}$/.test(raw)) return raw;
  if (typeof raw === "number" && raw > 0 && raw < 1) {
    const totalSeconds = Math.round(raw * 86400);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  if (typeof raw === "number") return `${String(raw).padStart(2, "0")}:00`;
  if (typeof raw === "string" && raw.includes("T")) {
    try {
      const date = new Date(raw);
      const minutes = date.getUTCHours() * 60 + date.getUTCMinutes();
      const seconds = date.getUTCSeconds();
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    } catch {
      return "";
    }
  }
  return raw;
}

export function createEmptyComposer() {
  return {
    firstName: "",
    middleName: "",
    lastName: "",
    composeraddress: "",
    composercity: "",
    composerstate: "",
    composerzip: "",
    ipi: "",
    split: "",
    pro: "",
    roleCode: "",
    publisher: "",
    publisherIPI: "",
    publisherPRO: "",
    pubadmin: "",
    pubadminIPI: "",
    pubadminShare: "",
  };
}

export function createEmptyTrack() {
  return {
    trackNumber: "",
    primaryTitle: "",
    recordingTitle: "",
    akaTitle: "",
    akaTypeCode: "",
    countryRelease: "United States",
    basisClaim: "Copyright Owner",
    percentClaim: "",
    collectionEnd: "2999-12-31",
    nonUSRights: "Worldwide",
    genre: "Regional Mexican",
    recDate: "",
    recEng: "",
    producer: "",
    execProducer: "",
    audioFile: null,
    isrc: "",
    iswc: "",
    trackLabel: "",
    duration: "",
    trackPLine: "",
    trackArtistNames: [""],
    typeOfRelease: "",
    collapsed: true,
    composers: [createEmptyComposer()],
    publishers: [],
  };
}