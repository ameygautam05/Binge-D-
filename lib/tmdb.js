import { catalog } from "@/data/catalog";
import { computeRecommendations } from "@/lib/recommendations";
import { getFriendInfluenceTitles } from "@/lib/social-db";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w780";
const INDIA_REGION = "IN";

const LANGUAGE_LABELS = {
  hi: "Hindi",
  en: "English",
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam",
  kn: "Kannada",
  mr: "Marathi",
  bn: "Bengali"
};

const MOVIE_GENRES = {
  documentary: 99,
  comedy: 35,
  drama: 18,
  action: 28,
  scifi: 878,
  thriller: 53
};

const TV_GENRES = {
  documentary: 99,
  comedy: 35,
  drama: 18,
  action: 10759,
  scifi: 10765,
  thriller: 9648
};

function getTmdbToken() {
  return process.env.TMDB_READ_ACCESS_TOKEN || process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN;
}

function getOmdbKey() {
  return process.env.OMDB_API_KEY || process.env.NEXT_PUBLIC_OMDB_API_KEY;
}

function hasTmdbCredentials() {
  return Boolean(getTmdbToken());
}

async function tmdbFetch(path, searchParams = {}) {
  const token = getTmdbToken();

  if (!token) {
    return null;
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json"
    },
    next: {
      revalidate: 3600
    }
  });

  if (!response.ok) {
    throw new Error(`TMDb request failed: ${response.status}`);
  }

  return response.json();
}

function pickProviders(providerBlock) {
  if (!providerBlock?.results?.[INDIA_REGION]) {
    return [];
  }

  const region = providerBlock.results[INDIA_REGION];
  const buckets = ["flatrate", "free", "ads", "rent", "buy"];
  const names = new Set();

  buckets.forEach((bucket) => {
    (region[bucket] || []).forEach((entry) => names.add(entry.provider_name));
  });

  return Array.from(names);
}

function toTypeLabel(mediaType, genreIds = []) {
  if (genreIds.includes(MOVIE_GENRES.documentary) || genreIds.includes(TV_GENRES.documentary)) {
    return "Documentary";
  }

  if (genreIds.includes(MOVIE_GENRES.comedy) && mediaType === "movie") {
    return "Movie";
  }

  if (mediaType === "tv") {
    return "Series";
  }

  return "Movie";
}

function buildPoster(path) {
  if (!path) {
    return "https://image.tmdb.org/t/p/w780/wwemzKWzjKYJFfCeiB57q3r4Bcm.png";
  }

  return `${IMAGE_BASE_URL}${path}`;
}

function inferLanguage(code) {
  return LANGUAGE_LABELS[code] || code?.toUpperCase() || "Unknown";
}

function normalizeTitle(item) {
  return item.title || item.name || "Untitled";
}

function buildWhy(answers, friendBoost, matchText) {
  return [
    answers.energy ? `matches your ${answers.energy} mood` : null,
    matchText || null,
    friendBoost ? "gets a boost from titles your friends are into" : null,
    answers.language && answers.language !== "Any" ? `fits your ${answers.language} language lane` : null
  ]
    .filter(Boolean)
    .slice(0, 3)
    .join(" • ");
}

function scoreLiveCandidate(item, answers, socialTitles) {
  const title = normalizeTitle(item).toLowerCase();
  const overview = (item.overview || "").toLowerCase();
  const combined = `${title} ${overview}`;
  const requestedText = (answers.lastLiked || "").toLowerCase();
  const typeLabel = item.media_type === "tv" ? "Series" : "Movie";
  const originalLanguage = inferLanguage(item.original_language);
  const southLanguages = ["Tamil", "Telugu", "Malayalam", "Kannada"];

  let score = 50;

  const energyMap = {
    comfort: ["heart", "family", "funny", "warm", "village", "hope"],
    brainy: ["mystery", "science", "crime", "smart", "political"],
    chaotic: ["war", "action", "revenge", "explosive", "chaos"],
    reflective: ["love", "quiet", "melancholy", "poetic", "intimate"]
  };

  if (energyMap[answers.energy]?.some((token) => combined.includes(token))) {
    score += 14;
  }

  if (answers.format === "Movie" && item.media_type === "movie") {
    score += 18;
  }

  if (answers.format === "Series" && item.media_type === "tv") {
    score += 18;
  }

  if (answers.format === "Documentary" && item.genre_ids?.includes(MOVIE_GENRES.documentary)) {
    score += 18;
  }

  if (answers.format === "audio-comedy" && item.genre_ids?.includes(MOVIE_GENRES.comedy)) {
    score += 8;
  }

  if (answers.language === "South" && southLanguages.includes(originalLanguage)) {
    score += 12;
  }

  if (answers.language !== "Any" && answers.language !== "South" && answers.language === originalLanguage) {
    score += 12;
  }

  if (requestedText) {
    requestedText
      .split(/[,/ ]+/)
      .filter(Boolean)
      .slice(0, 8)
      .forEach((token) => {
        if (combined.includes(token)) {
          score += 5;
        }
      });
  }

  const friendBoost = socialTitles.has(normalizeTitle(item)) ? Number(answers.friendFactor || 0) : 0;
  score += friendBoost;

  if ((item.vote_average || 0) >= Number(answers.ratingTolerance || 0)) {
    score += 8;
  } else {
    score -= 10;
  }

  return {
    score,
    friendBoost,
    why: buildWhy(
      answers,
      friendBoost,
      requestedText && combined.includes(requestedText.split(/[,/ ]+/)[0]) ? `echoes parts of "${answers.lastLiked}"` : null
    ),
    typeLabel
  };
}

async function fetchDetailsForCandidates(items) {
  const detailPromises = items.map(async (item) => {
    const path = item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
    const detail = await tmdbFetch(path, {
      append_to_response: "credits,watch/providers,external_ids"
    });

    let imdbRating = null;
    if (detail?.external_ids?.imdb_id && getOmdbKey()) {
      try {
        const omdbUrl = new URL("https://www.omdbapi.com/");
        omdbUrl.searchParams.set("apikey", getOmdbKey());
        omdbUrl.searchParams.set("i", detail.external_ids.imdb_id);
        const omdbResponse = await fetch(omdbUrl.toString(), { next: { revalidate: 3600 } });
        if (omdbResponse.ok) {
          const omdb = await omdbResponse.json();
          if (omdb?.imdbRating && omdb.imdbRating !== "N/A") {
            imdbRating = Number(omdb.imdbRating);
          }
        }
      } catch {
        imdbRating = null;
      }
    }

    return {
      id: `${item.media_type}-${item.id}`,
      tmdbId: item.id,
      imdbId: detail?.external_ids?.imdb_id || null,
      title: detail.title || detail.name,
      type: toTypeLabel(item.media_type, detail.genres?.map((genre) => genre.id) || item.genre_ids || []),
      language: inferLanguage(detail.original_language),
      year: Number((detail.release_date || detail.first_air_date || "").slice(0, 4)) || null,
      rating: imdbRating || detail.vote_average || item.vote_average || 0,
      poster: buildPoster(detail.poster_path || item.poster_path),
      blurb: detail.overview || "No overview landed for this title yet.",
      cast: (detail.credits?.cast || []).slice(0, 4).map((member) => member.name),
      platforms: pickProviders(detail["watch/providers"]),
      genres: (detail.genres || []).map((genre) => genre.name),
      mediaType: item.media_type,
      popularity: detail.popularity || item.popularity || 0
    };
  });

  return Promise.all(detailPromises);
}

async function gatherCandidatePool(answers) {
  const socialTitles = await getFriendInfluenceTitles();
  const typeHint =
    answers.format === "Series" ? "tv" : answers.format === "Documentary" ? "movie" : "movie";
  const originalLanguage =
    answers.language === "Hindi"
      ? "hi"
      : answers.language === "English"
        ? "en"
        : answers.language === "South"
          ? "ta|te|ml|kn"
          : undefined;

  const discoverParams = {
    include_adult: false,
    sort_by: "popularity.desc",
    "vote_count.gte": 30,
    page: 1,
    watch_region: INDIA_REGION,
    with_watch_monetization_types: "flatrate|free|ads"
  };

  if (answers.ratingTolerance) {
    discoverParams["vote_average.gte"] = answers.ratingTolerance;
  }

  if (answers.language && answers.language !== "Any" && answers.language !== "South") {
    discoverParams.with_original_language = originalLanguage;
  }

  if (answers.energy === "brainy") {
    discoverParams.with_genres = typeHint === "tv" ? `${TV_GENRES.scifi}|${TV_GENRES.thriller}` : `${MOVIE_GENRES.scifi}|${MOVIE_GENRES.thriller}`;
  }

  if (answers.energy === "comfort") {
    discoverParams.with_genres = typeHint === "tv" ? `${TV_GENRES.comedy}|${TV_GENRES.drama}` : `${MOVIE_GENRES.comedy}|${MOVIE_GENRES.drama}`;
  }

  if (answers.energy === "chaotic") {
    discoverParams.with_genres = typeHint === "tv" ? `${TV_GENRES.action}|${TV_GENRES.scifi}` : `${MOVIE_GENRES.action}|${MOVIE_GENRES.scifi}`;
  }

  if (answers.energy === "reflective") {
    discoverParams.with_genres = typeHint === "tv" ? `${TV_GENRES.drama}|${TV_GENRES.documentary}` : `${MOVIE_GENRES.drama}|${MOVIE_GENRES.documentary}`;
  }

  if (answers.format === "Documentary") {
    discoverParams.with_genres = typeHint === "tv" ? String(TV_GENRES.documentary) : String(MOVIE_GENRES.documentary);
  }

  const requests = [];

  if (answers.format === "Series") {
    requests.push(tmdbFetch("/discover/tv", discoverParams));
  } else {
    requests.push(tmdbFetch("/discover/movie", discoverParams));
  }

  if (answers.lastLiked) {
    requests.push(
      tmdbFetch("/search/multi", {
        query: answers.lastLiked,
        include_adult: false,
        page: 1
      })
    );
  }

  const responses = (await Promise.all(requests)).filter(Boolean);
  const pool = [];
  const seen = new Set();

  responses.forEach((response) => {
    (response.results || []).forEach((item) => {
      if (!["movie", "tv"].includes(item.media_type || (response.results === undefined ? typeHint : item.media_type))) {
        return;
      }

      const normalized = {
        ...item,
        media_type: item.media_type || typeHint
      };
      const key = `${normalized.media_type}-${normalized.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        pool.push(normalized);
      }
    });
  });

  const scoredPool = pool
    .map((item) => ({
      ...item,
      ...scoreLiveCandidate(item, answers, socialTitles)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  return scoredPool;
}

export async function getLiveRecommendations(answers, limit = 7) {
  if (!hasTmdbCredentials()) {
    return {
      source: "fallback",
      items: computeRecommendations(answers, limit).map((item) => ({
        ...item,
        imdbId: null,
        source: "seeded"
      }))
    };
  }

  const candidates = await gatherCandidatePool(answers);
  const details = await fetchDetailsForCandidates(candidates);
  const scored = details
    .map((detail, index) => ({
      ...detail,
      why: candidates[index]?.why || "strong live-data match across mood, format, and availability.",
      score: candidates[index]?.score || 0
    }))
    .filter((item) => item.poster && item.title)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return {
    source: "tmdb-live",
    items: scored
  };
}

export async function getLiveHomeShowcase() {
  if (!hasTmdbCredentials()) {
    return {
      source: "fallback",
      items: catalog.slice(0, 7)
    };
  }

  const [movies, shows] = await Promise.all([
    tmdbFetch("/discover/movie", {
      watch_region: INDIA_REGION,
      with_watch_monetization_types: "flatrate|free|ads",
      sort_by: "popularity.desc",
      include_adult: false,
      page: 1
    }),
    tmdbFetch("/discover/tv", {
      watch_region: INDIA_REGION,
      with_watch_monetization_types: "flatrate|free|ads",
      sort_by: "popularity.desc",
      include_adult: false,
      page: 1
    })
  ]);

  const candidates = [...(movies?.results || []), ...(shows?.results || []).map((entry) => ({ ...entry, media_type: "tv" }))]
    .slice(0, 10)
    .map((entry) => ({
      ...entry,
      media_type: entry.media_type || "movie"
    }));

  const details = await fetchDetailsForCandidates(candidates.slice(0, 7));

  return {
    source: "tmdb-live",
    items: details
  };
}
