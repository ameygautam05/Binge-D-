import { activityFeed, catalog, friendProfiles } from "@/data/catalog";

export const ZERO_SOCIAL_STORAGE_KEY = "binge-d-zero-social-v1";

function findContentById(id) {
  return catalog.find((item) => item.id === id);
}

function cloneContent(item) {
  return item ? { ...item, platforms: [...(item.platforms || [])], cast: [...(item.cast || [])] } : null;
}

export function buildZeroSetupSeed() {
  const profiles = friendProfiles.map((friend) => ({
    id: friend.id,
    slug: friend.id,
    name: friend.name,
    handle: friend.handle,
    city: friend.city,
    tagline: friend.tagline,
    avatar: friend.avatar,
    taste: [...friend.taste],
    currentlyWatching: friend.currentlyWatching.map((title) => cloneContent(catalog.find((item) => item.title === title))).filter(Boolean),
    watched: friend.watched.map((title) => cloneContent(catalog.find((item) => item.title === title))).filter(Boolean),
    recommendationsForYou: friend.recommendationsForYou.map((title) => cloneContent(catalog.find((item) => item.title === title))).filter(Boolean)
  }));

  const viewer = {
    id: "you",
    slug: "you",
    name: "You",
    handle: "@you",
    city: "Your screen",
    tagline: "Zero-setup mode. Your updates stay in this browser but the whole app works instantly.",
    avatar: "YU",
    taste: ["build-first", "late-night scrolls", "personal recs"],
    currentlyWatching: [],
    watched: [],
    recommendationsForYou: []
  };

  const feed = activityFeed
    .map((entry) => {
      const friend = profiles.find((profile) => profile.slug === entry.friendId);
      const content = cloneContent(findContentById(entry.contentId));
      if (!friend || !content) {
        return null;
      }

      return {
        id: entry.id,
        action: entry.action,
        review: entry.review,
        recommendedForYou: entry.recommendedForYou,
        timestamp: entry.timestamp,
        friend,
        content,
        sortValue: Date.now()
      };
    })
    .filter(Boolean);

  const recommendationsForViewer = profiles.flatMap((profile) =>
    profile.recommendationsForYou.map((content) => ({
      id: `${profile.slug}-${content.id}`,
      fromProfile: profile,
      title: cloneContent(content),
      note: `This one is lined up for your lane by ${profile.name.split(" ")[0]}.`
    }))
  );

  return {
    source: "zero-setup",
    viewer,
    profiles: [viewer, ...profiles],
    friends: profiles,
    feed,
    recommendationsForViewer
  };
}

export function mergeZeroSetupState(base, stored) {
  if (!stored) {
    return base;
  }

  const viewer = {
    ...base.viewer,
    ...(stored.viewer || {}),
    currentlyWatching: (stored.viewer?.currentlyWatching || []).map((item) => cloneContent(item)).filter(Boolean),
    watched: (stored.viewer?.watched || []).map((item) => cloneContent(item)).filter(Boolean),
    recommendationsForYou: base.viewer.recommendationsForYou
  };

  const customFeed = (stored.feed || []).map((entry) => ({
    ...entry,
    friend: viewer,
    content: cloneContent(entry.content)
  }));

  return {
    ...base,
    viewer,
    profiles: [viewer, ...base.friends],
    feed: [...customFeed, ...base.feed].sort((a, b) => (b.sortValue || 0) - (a.sortValue || 0))
  };
}

export function makeViewerFeedEntry({ contentId, status, rating, reviewText, viewer }) {
  const content = cloneContent(findContentById(contentId));
  if (!content) {
    return null;
  }

  return {
    id: `you-${contentId}-${Date.now()}`,
    action: status === "watching" ? "started watching" : `finished and rated ${rating || "it"}`,
    review: reviewText || "No review dropped yet.",
    recommendedForYou: false,
    timestamp: "just now",
    friend: viewer,
    content,
    sortValue: Date.now()
  };
}
