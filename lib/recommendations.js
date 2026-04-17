import { activityFeed, catalog, friendProfiles } from "@/data/catalog";

const southLanguages = ["Tamil", "Telugu", "Malayalam", "Kannada"];

function normalizeText(value = "") {
  return value.toLowerCase().trim();
}

export function getCatalogById(id) {
  return catalog.find((item) => item.id === id);
}

export function getFriendById(id) {
  return friendProfiles.find((friend) => friend.id === id);
}

export function getFeedEntries() {
  return activityFeed.map((entry) => ({
    ...entry,
    friend: getFriendById(entry.friendId),
    content: getCatalogById(entry.contentId)
  }));
}

function scoreFromEnergy(item, energy) {
  if (!energy) {
    return 0;
  }

  const map = {
    comfort: ["comfort", "warm", "hopeful", "funny", "gentle", "heartfelt"],
    brainy: ["brainy", "smart", "mysterious", "prestige", "cinematic"],
    chaotic: ["chaotic", "loud", "kinetic", "stylish", "massive"],
    reflective: ["reflective", "quiet", "moody", "meditative", "moving"]
  };

  return item.moodTags.some((tag) => map[energy]?.includes(tag)) ? 14 : 0;
}

function scoreFromFormat(item, format) {
  if (!format) {
    return 0;
  }

  if (format === "audio-comedy") {
    return item.type === "Podcast" || item.type === "Standup" ? 16 : -2;
  }

  return item.type === format ? 16 : 0;
}

function scoreFromLanguage(item, language) {
  if (!language || language === "Any") {
    return 0;
  }

  if (language === "South") {
    return southLanguages.includes(item.language) ? 12 : 0;
  }

  return item.language === language ? 12 : 0;
}

function scoreFromText(item, text) {
  const normalized = normalizeText(text);

  if (!normalized) {
    return 0;
  }

  const haystack = [
    item.title,
    item.type,
    item.language,
    item.region,
    ...item.genres,
    ...item.moodTags,
    ...item.scoreTags,
    ...item.cast
  ]
    .join(" ")
    .toLowerCase();

  const tokens = normalized
    .split(/[,/ ]+/)
    .filter(Boolean)
    .slice(0, 8);

  return tokens.reduce((sum, token) => sum + (haystack.includes(token) ? 4 : 0), 0);
}

function scoreFromFriendFactor(item, factor) {
  const numericFactor = Number(factor ?? 0);

  if (!numericFactor) {
    return 0;
  }

  let friendMatches = 0;

  friendProfiles.forEach((friend) => {
    if (
      friend.currentlyWatching.includes(item.title) ||
      friend.watched.includes(item.title) ||
      friend.recommendationsForYou.includes(item.title)
    ) {
      friendMatches += 1;
    }
  });

  return friendMatches * numericFactor;
}

function scoreFromRating(item, threshold) {
  const minRating = Number(threshold ?? 0);
  return item.rating >= minRating ? 8 : -16;
}

export function computeRecommendations(answers = {}, limit = 7) {
  const scored = catalog
    .map((item) => {
      const friendBoost = scoreFromFriendFactor(item, answers.friendFactor);
      const score =
        50 +
        scoreFromEnergy(item, answers.energy) +
        scoreFromFormat(item, answers.format) +
        scoreFromLanguage(item, answers.language) +
        scoreFromText(item, answers.lastLiked) +
        friendBoost +
        scoreFromRating(item, answers.ratingTolerance);

      return {
        ...item,
        score,
        why: [
          answers.energy ? `matches your ${answers.energy} mood` : null,
          answers.format === "audio-comedy" && (item.type === "Podcast" || item.type === "Standup")
            ? "fits a low-commitment audio/comedy slot"
            : answers.format === item.type
              ? `locks into your ${item.type.toLowerCase()} choice`
              : null,
          answers.language === "South" && southLanguages.includes(item.language)
            ? "keeps the language lane in South Indian territory"
            : answers.language && answers.language !== "Any" && answers.language === item.language
              ? `stays in your ${item.language} comfort zone`
              : null,
          friendBoost > 0 ? `gets a social boost from your friends` : null,
          answers.lastLiked ? `echoes parts of "${answers.lastLiked}"` : null
        ]
          .filter(Boolean)
          .slice(0, 3)
          .join(" • ")
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}
