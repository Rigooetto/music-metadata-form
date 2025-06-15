export const COMPOSERS_DB_URL = "https://script.google.com/macros/s/AKfycbzrJdRXwsv_tQrcuQMqEE9WfRN1ZDlqwUXqJ8k7o39eA1t5lXLwiExuZmMpDD_Dmvy4iw/exec";
export const ARTISTS_DB_URL   = "https://script.google.com/macros/s/AKfycbzr3Mg2opXIyPXs5KZArgchglEyuZA-I135mYoL9aK2yuJIaHgCZSskdGS_mMiNShyw/exec";
export const CATALOG_DB_URL   = "https://script.google.com/macros/s/AKfycbxdta-h0LUQ4bHSRLF_czTFlOyIbs4z2RQjixNgVYEJOeKNp7T2rwJhi9-SZcBs57Q6/exec";
export const PUBLISHERS_DB_URL= "https://script.google.com/macros/s/AKfycbzbKo0E1wih647uiiPQebf6x7Sl-LQTM9khdDhuv0D2lP79bqz69-smUUTUEsrnsuBGmA/exec";

export async function fetchDB(url) {
  const response = await fetch(url);
  return response.json();
}