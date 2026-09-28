/* suzume - AniList GraphQL helpers (no key needed, CORS-friendly).
   Rate limit: ~90 requests/min. We cache aggressively in localStorage. */

const ANILIST_API = "https://graphql.anilist.co";
const ANI_CACHE_KEY = "suzume.anilist.v1";
const TREND_TTL_MS = 60 * 60 * 1000; // 1 hour
const SEARCH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function aniCacheLoad() {
  try {
    return JSON.parse(localStorage.getItem(ANI_CACHE_KEY)) || {};
  } catch {
    return {};
  }
}

function aniCacheSave(cache) {
  try {
    localStorage.setItem(ANI_CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* storage full/blocked — run without cache */
  }
}

async function aniQuery(query, variables) {
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error("AniList HTTP " + res.status);
  const json = await res.json();
  if (json.errors && json.errors.length) throw new Error(json.errors[0].message);
  return json.data;
}

function aniTitle(t) {
  if (!t) return "Unknown";
  return t.english || t.romaji || "Unknown";
}

/* Search one anime by name. Cached 7 days. Returns null on failure. */
async function aniSearchAnime(name) {
  const cache = aniCacheLoad();
  const key = "s:" + name.toLowerCase();
  const hit = cache[key];
  if (hit && Date.now() - hit.at < SEARCH_TTL_MS) return hit.media;

  try {
    const data = await aniQuery(
      `query ($search: String) {
        Media(search: $search, type: ANIME) {
          id
          title { romaji english }
          coverImage { medium large }
          siteUrl
          averageScore
          seasonYear
        }
      }`,
      { search: name }
    );
    cache[key] = { at: Date.now(), media: data.Media || null };
    aniCacheSave(cache);
    return data.Media || null;
  } catch {
    return null;
  }
}

/* Trending anime right now. Cached 1 hour. force=true skips cache. */
async function aniTrending(perPage = 12, force = false) {
  const cache = aniCacheLoad();
  const key = "trending:" + perPage;
  const hit = cache[key];
  if (!force && hit && Date.now() - hit.at < TREND_TTL_MS) return hit.list;

  const data = await aniQuery(
    `query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, sort: TRENDING_DESC) {
          id
          title { romaji english }
          coverImage { medium large }
          siteUrl
          averageScore
          seasonYear
        }
      }
    }`,
    { perPage }
  );
  const list = (data.Page && data.Page.media) || [];
  cache[key] = { at: Date.now(), list };
  aniCacheSave(cache);
  return list;
}
