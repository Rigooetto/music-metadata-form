// src/services/api.js

// Example endpoints - change to your actual endpoints if different
const COMPOSERS_DB_URL = "https://script.google.com/macros/s/AKfycbzrJdRXwsv_tQrcuQMqEE9WfRN1ZDlqwUXqJ8k7o39eA1t5lXLwiExuZmMpDD_Dmvy4iw/exec";
const ARTIST_DB_URL = "https://script.google.com/macros/s/AKfycbzr3Mg2opXIyPXs5KZArgchglEyuZA-I135mYoL9aK2yuJIaHgCZSskdGS_mMiNShyw/exec";
const CATALOG_DB_URL = "https://script.google.com/macros/s/AKfycbxdta-h0LUQ4bHSRLF_czTFlOyIbs4z2RQjixNgVYEJOeKNp7T2rwJhi9-SZcBs57Q6/exec";
const PUBLISHERS_DB_URL = "https://script.google.com/macros/s/AKfycbzbKo0E1wih647uiiPQebf6x7Sl-LQTM9khdDhuv0D2lP79bqz69-smUUTUEsrnsuBGmA/exec";

export async function fetchComposers() {
  const response = await fetch(COMPOSERS_DB_URL);
  if (!response.ok) throw new Error("Failed to fetch composers");
  return response.json();
}

export async function fetchArtists() {
  const response = await fetch(ARTIST_DB_URL);
  if (!response.ok) throw new Error("Failed to fetch artists");
  return response.json();
}

export async function fetchCatalog() {
  const response = await fetch(CATALOG_DB_URL);
  if (!response.ok) throw new Error("Failed to fetch catalog");
  return response.json();
}

export async function fetchPublishers() {
  const response = await fetch(PUBLISHERS_DB_URL);
  if (!response.ok) throw new Error("Failed to fetch publishers");
  return response.json();
}