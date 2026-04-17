import { activityFeed, catalog, friendProfiles } from "@/data/catalog";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase-server";

const DEFAULT_VIEWER_SLUG = process.env.SOCIAL_DEMO_VIEWER_SLUG || "aarya";

function findFallbackContentByTitle(title) {
  return catalog.find((item) => item.title === title) || {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title,
    type: "Title",
    language: "Unknown",
    rating: 0,
    blurb: "Metadata will appear here once this title is in your live catalog.",
    platforms: []
  };
}

function buildFallbackFeed() {
  return activityFeed.map((entry) => {
    const friend = friendProfiles.find((profile) => profile.id === entry.friendId);
    const content = findFallbackContentByTitle(catalog.find((item) => item.id === entry.contentId)?.title || entry.contentId);

    return {
      id: entry.id,
      action: entry.action,
      review: entry.review,
      recommendedForYou: entry.recommendedForYou,
      timestamp: entry.timestamp,
      friend,
      content
    };
  });
}

function buildFallbackProfiles() {
  return friendProfiles.map((friend) => ({
    id: friend.id,
    slug: friend.id,
    name: friend.name,
    handle: friend.handle,
    city: friend.city,
    tagline: friend.tagline,
    avatar: friend.avatar,
    taste: friend.taste,
    currentlyWatching: friend.currentlyWatching.map(findFallbackContentByTitle),
    watched: friend.watched.map(findFallbackContentByTitle),
    recommendationsForYou: friend.recommendationsForYou.map(findFallbackContentByTitle)
  }));
}

function fallbackSocialPayload() {
  const profiles = buildFallbackProfiles();
  const viewer = profiles.find((profile) => profile.slug === DEFAULT_VIEWER_SLUG) || profiles[0];

  return {
    source: "fallback",
    viewer,
    profiles,
    friends: profiles.filter((profile) => profile.slug !== viewer.slug),
    feed: buildFallbackFeed(),
    recommendationsForViewer: profiles
      .filter((profile) => profile.slug !== viewer.slug)
      .flatMap((profile) =>
        profile.recommendationsForYou.map((content) => ({
          id: `${profile.slug}-${content.id}`,
          fromProfile: profile,
          title: content,
          note: `This one is lined up for your lane by ${profile.name.split(" ")[0]}.`
        }))
      )
  };
}

function normalizeTimestamp(value) {
  if (!value) {
    return "recently";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "recently" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function toSortValue(value) {
  const date = new Date(value || 0);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function normalizeTitleRow(row) {
  return {
    id: row.id,
    imdbId: row.imdb_id,
    title: row.title,
    type: row.title_type || "Title",
    language: row.language_hint || "Unknown",
    rating: Number(row.rating || 0),
    blurb: row.blurb || "Your backend title metadata is ready for richer platform and poster sync.",
    platforms: row.platforms || [],
    year: row.year || null,
    cast: row.people_hint || []
  };
}

function mapProfileRow(row, contentById) {
  const watching = [];
  const watched = [];

  (row.watch_entries || []).forEach((entry) => {
    const content = contentById.get(entry.title_id);
    if (!content) {
      return;
    }

    if (entry.status === "watching") {
      watching.push(content);
    }

    if (entry.status === "completed") {
      watched.push({
        ...content,
        friendRating: entry.rating,
        friendReview: entry.review_text
      });
    }
  });

  return {
    id: row.id,
    slug: row.slug,
    name: row.display_name,
    handle: row.handle,
    city: row.city,
    tagline: row.tagline,
    avatar: row.avatar_text,
    taste: row.taste_tags || [],
    currentlyWatching: watching,
    watched,
    recommendationsForYou: []
  };
}

export async function getSocialGraph() {
  if (!isSupabaseConfigured()) {
    return fallbackSocialPayload();
  }

  const supabase = getSupabaseServerClient();

  const [{ data: profilesData, error: profilesError }, { data: titlesData, error: titlesError }, { data: recsData, error: recsError }] =
    await Promise.all([
      supabase.from("profiles").select("id, slug, display_name, handle, city, tagline, avatar_text, taste_tags, watch_entries(title_id, status, rating, review_text, updated_at)").order("display_name"),
      supabase.from("titles").select("id, imdb_id, title, title_type, language_hint, rating, blurb, platforms, year, people_hint").order("rating", { ascending: false }),
      supabase.from("direct_recommendations").select("id, note, from_profile_id, to_profile_id, title_id, created_at").order("created_at", { ascending: false })
    ]);

  if (profilesError || titlesError || recsError) {
    return fallbackSocialPayload();
  }

  const contentById = new Map((titlesData || []).map((row) => [row.id, normalizeTitleRow(row)]));
  const profiles = (profilesData || []).map((row) => mapProfileRow(row, contentById));
  const viewer = profiles.find((profile) => profile.slug === DEFAULT_VIEWER_SLUG) || profiles[0];
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));

  const recommendationsForViewer = (recsData || [])
    .filter((row) => row.to_profile_id === viewer?.id)
    .map((row) => ({
      id: row.id,
      fromProfile: profileById.get(row.from_profile_id),
      title: contentById.get(row.title_id),
      note: row.note || "A friend lined this up for you.",
      createdAt: normalizeTimestamp(row.created_at),
      sortValue: toSortValue(row.created_at)
    }))
    .filter((row) => row.fromProfile && row.title);

  recommendationsForViewer.forEach((entry) => {
    const profile = profileById.get(entry.fromProfile.id);
    if (!profile) {
      return;
    }

    profile.recommendationsForYou = [...(profile.recommendationsForYou || []), entry.title];
  });

  const feed = (profilesData || [])
    .flatMap((row) =>
      (row.watch_entries || [])
        .filter((entry) => entry.review_text)
        .map((entry) => ({
          id: `${row.id}-${entry.title_id}-${entry.updated_at}`,
          action: entry.status === "completed" ? `finished and rated ${entry.rating || "it"}` : entry.status,
          review: entry.review_text,
          recommendedForYou: recommendationsForViewer.some((rec) => rec.fromProfile.id === row.id && rec.title.id === entry.title_id),
          timestamp: normalizeTimestamp(entry.updated_at),
          sortValue: toSortValue(entry.updated_at),
          friend: profileById.get(row.id),
          content: contentById.get(entry.title_id)
        }))
    )
    .filter((entry) => entry.friend && entry.content)
    .sort((a, b) => b.sortValue - a.sortValue);

  return {
    source: "supabase",
    viewer,
    profiles,
    friends: profiles.filter((profile) => profile.slug !== viewer?.slug),
    feed,
    recommendationsForViewer
  };
}

export async function getFriendProfile(slug) {
  const social = await getSocialGraph();
  return social.profiles.find((profile) => profile.slug === slug) || null;
}

export async function getFriendInfluenceTitles() {
  const social = await getSocialGraph();
  const set = new Set();

  social.friends.forEach((friend) => {
    friend.currentlyWatching.forEach((item) => set.add(item.title));
    friend.watched.forEach((item) => set.add(item.title));
  });

  social.recommendationsForViewer.forEach((item) => set.add(item.title.title));

  return set;
}
