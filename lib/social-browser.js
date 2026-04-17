"use client";

import { catalog } from "@/data/catalog";
import { getSupabaseBrowserClient } from "@/lib/supabase";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createBrowserSocialClient() {
  return getSupabaseBrowserClient();
}

export function initialsFromName(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "BD";
}

export async function getCurrentUserAndProfile(supabase) {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const user = session?.user || null;

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return { user, profile: profile || null };
}

export async function createProfile(supabase, user, values) {
  const payload = {
    user_id: user.id,
    email: user.email,
    slug: slugify(values.handle || values.displayName),
    display_name: values.displayName,
    handle: values.handle.startsWith("@") ? values.handle : `@${values.handle}`,
    city: values.city || null,
    tagline: values.tagline || null,
    avatar_text: initialsFromName(values.displayName),
    taste_tags: []
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function ensureCatalogTitle(supabase, contentId) {
  const item = catalog.find((entry) => entry.id === contentId);

  if (!item) {
    throw new Error("Title not found in the current catalog.");
  }

  const { data: existing } = await supabase
    .from("titles")
    .select("id")
    .eq("source_key", item.id)
    .maybeSingle();

  if (existing?.id) {
    return existing;
  }

  const { data, error } = await supabase
    .from("titles")
    .insert({
      source_key: item.id,
      title: item.title,
      title_type: item.type,
      year: item.year || null,
      runtime_minutes: item.runtime ? Number.parseInt(item.runtime, 10) || null : null,
      rating: item.rating || null,
      genres: item.genres || [],
      people_hint: item.cast || [],
      language_hint: item.language || null,
      poster_url: item.poster || null,
      blurb: item.blurb || null,
      platforms: item.platforms || [],
      source: "catalog"
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchDashboardBundle(supabase, profile) {
  const [
    profilesResponse,
    requestsResponse,
    watchesResponse,
    recsResponse,
    groupsResponse,
    membersResponse,
    messagesResponse
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("display_name"),
    supabase
      .from("friend_requests")
      .select("*, from_profile:from_profile_id(*), to_profile:to_profile_id(*)")
      .or(`from_profile_id.eq.${profile.id},to_profile_id.eq.${profile.id}`)
      .order("created_at", { ascending: false }),
    supabase
      .from("watch_entries")
      .select("*, profile:profile_id(*), title:title_id(*)")
      .order("updated_at", { ascending: false })
      .limit(50),
    supabase
      .from("direct_recommendations")
      .select("*, from_profile:from_profile_id(*), to_profile:to_profile_id(*), title:title_id(*)")
      .or(`from_profile_id.eq.${profile.id},to_profile_id.eq.${profile.id}`)
      .order("created_at", { ascending: false }),
    supabase
      .from("groups")
      .select("*, title:title_id(*)")
      .order("created_at", { ascending: false }),
    supabase
      .from("group_members")
      .select("*, profile:profile_id(*), group:group_id(*)")
      .order("created_at", { ascending: true }),
    supabase
      .from("group_messages")
      .select("*, profile:profile_id(*), group:group_id(*)")
      .order("created_at", { ascending: true })
      .limit(200)
  ]);

  const profiles = profilesResponse.data || [];
  const allRequests = requestsResponse.data || [];
  const acceptedConnections = allRequests.filter((entry) => entry.status === "accepted");
  const pendingIncoming = allRequests.filter((entry) => entry.status === "pending" && entry.to_profile_id === profile.id);
  const pendingOutgoing = allRequests.filter((entry) => entry.status === "pending" && entry.from_profile_id === profile.id);

  const friendIds = new Set(
    acceptedConnections.map((entry) => (entry.from_profile_id === profile.id ? entry.to_profile_id : entry.from_profile_id))
  );

  const friends = profiles.filter((entry) => friendIds.has(entry.id));
  const peopleById = new Map(profiles.map((entry) => [entry.id, entry]));
  const watches = (watchesResponse.data || []).filter(
    (entry) => friendIds.has(entry.profile_id) || entry.profile_id === profile.id
  );
  const incomingRecommendations = (recsResponse.data || []).filter((entry) => entry.to_profile_id === profile.id);
  const outgoingRecommendations = (recsResponse.data || []).filter((entry) => entry.from_profile_id === profile.id);

  const memberships = (membersResponse.data || []).filter((entry) => entry.profile_id === profile.id);
  const memberGroupIds = new Set(memberships.map((entry) => entry.group_id));
  const groups = (groupsResponse.data || []).filter((entry) => memberGroupIds.has(entry.id));
  const groupMembers = (membersResponse.data || []).filter((entry) => memberGroupIds.has(entry.group_id));
  const groupMessages = (messagesResponse.data || []).filter((entry) => memberGroupIds.has(entry.group_id));

  return {
    profiles,
    friends,
    friendRequests: {
      incoming: pendingIncoming,
      outgoing: pendingOutgoing,
      accepted: acceptedConnections
    },
    watches,
    incomingRecommendations,
    outgoingRecommendations,
    groups,
    groupMembers,
    groupMessages,
    peopleById
  };
}

export async function sendMagicLink(supabase, email) {
  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: redirectTo
    }
  });

  if (error) {
    throw error;
  }
}

export async function sendFriendRequest(supabase, currentProfile, targetHandle) {
  const normalized = targetHandle.startsWith("@") ? targetHandle : `@${targetHandle}`;

  const { data: target, error: targetError } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", normalized)
    .maybeSingle();

  if (targetError) {
    throw targetError;
  }

  if (!target) {
    throw new Error("No profile found for that handle.");
  }

  if (target.id === currentProfile.id) {
    throw new Error("You cannot send a friend request to yourself.");
  }

  const { error } = await supabase.from("friend_requests").upsert(
    {
      from_profile_id: currentProfile.id,
      to_profile_id: target.id,
      status: "pending"
    },
    { onConflict: "from_profile_id,to_profile_id" }
  );

  if (error) {
    throw error;
  }
}

export async function acceptFriendRequest(supabase, requestId) {
  const { error } = await supabase
    .from("friend_requests")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) {
    throw error;
  }
}

export async function rejectFriendRequest(supabase, requestId) {
  const { error } = await supabase
    .from("friend_requests")
    .update({ status: "rejected", responded_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) {
    throw error;
  }
}

export async function removeFriend(supabase, currentProfileId, friendProfileId) {
  const { error } = await supabase
    .from("friend_requests")
    .delete()
    .or(
      `and(from_profile_id.eq.${currentProfileId},to_profile_id.eq.${friendProfileId}),and(from_profile_id.eq.${friendProfileId},to_profile_id.eq.${currentProfileId})`
    );

  if (error) {
    throw error;
  }
}

export async function saveWatchEntry(supabase, currentProfile, payload) {
  const title = await ensureCatalogTitle(supabase, payload.contentId);

  const { error } = await supabase.from("watch_entries").upsert(
    {
      profile_id: currentProfile.id,
      title_id: title.id,
      status: payload.status,
      rating: payload.rating || null,
      review_text: payload.reviewText || null,
      visibility: "friends",
      updated_at: new Date().toISOString(),
      finished_at: payload.status === "completed" ? new Date().toISOString() : null
    },
    { onConflict: "profile_id,title_id,status" }
  );

  if (error) {
    throw error;
  }
}

export async function recommendTitleToFriend(supabase, currentProfile, friendProfileId, payload) {
  const title = await ensureCatalogTitle(supabase, payload.contentId);

  const { error } = await supabase.from("direct_recommendations").upsert(
    {
      from_profile_id: currentProfile.id,
      to_profile_id: friendProfileId,
      title_id: title.id,
      note: payload.note || null
    },
    { onConflict: "from_profile_id,to_profile_id,title_id" }
  );

  if (error) {
    throw error;
  }
}

export async function createGroup(supabase, currentProfile, payload) {
  const title = payload.contentId ? await ensureCatalogTitle(supabase, payload.contentId) : null;
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({
      created_by_profile_id: currentProfile.id,
      name: payload.name,
      description: payload.description || null,
      title_id: title?.id || null
    })
    .select("*")
    .single();

  if (groupError) {
    throw groupError;
  }

  const members = [currentProfile.id, ...(payload.memberIds || [])];
  const { error: memberError } = await supabase.from("group_members").insert(
    members.map((profileId, index) => ({
      group_id: group.id,
      profile_id: profileId,
      role: index === 0 ? "owner" : "member"
    }))
  );

  if (memberError) {
    throw memberError;
  }

  return group;
}

export async function sendGroupMessage(supabase, currentProfile, groupId, body) {
  const { error } = await supabase.from("group_messages").insert({
    group_id: groupId,
    profile_id: currentProfile.id,
    body
  });

  if (error) {
    throw error;
  }
}

export function subscribeToRealtime(supabase, onChange) {
  const channel = supabase
    .channel("binge-d-social")
    .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "friend_requests" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "watch_entries" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "direct_recommendations" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "groups" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "group_members" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "group_messages" }, onChange)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
