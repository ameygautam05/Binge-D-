"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FeedCard } from "@/components/feed-card";
import {
  acceptFriendRequest,
  createBrowserSocialClient,
  createGroup,
  createProfile,
  fetchDashboardBundle,
  getCurrentUserAndProfile,
  recommendTitleToFriend,
  rejectFriendRequest,
  removeFriend,
  saveWatchEntry,
  sendFriendRequest,
  sendGroupMessage,
  sendMagicLink,
  subscribeToRealtime
} from "@/lib/social-browser";
import { catalog } from "@/data/catalog";

function EmptyState({ title, copy }) {
  return (
    <div className="glass small-card pixel-frame">
      <strong>{title}</strong>
      <p className="hint" style={{ marginTop: "8px" }}>{copy}</p>
    </div>
  );
}

function AuthGate({ onSignedIn }) {
  const supabase = useMemo(() => createBrowserSocialClient(), []);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    getCurrentUserAndProfile(supabase).then(({ user }) => {
      if (user) {
        onSignedIn();
      }
    });
  }, [onSignedIn, supabase]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!supabase) {
      setStatus("This real-time build needs Supabase env keys in Vercel.");
      return;
    }

    try {
      setLoading(true);
      await sendMagicLink(supabase, email);
      setStatus("Magic link sent. Open it from your inbox and come right back.");
      setEmail("");
    } catch (error) {
      setStatus(error.message || "Could not send the sign-in link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass page-panel pixel-frame">
      <div className="eyebrow">real app mode</div>
      <h1 className="section-title display" style={{ marginTop: "16px" }}>
        sign in, build a profile,
        <br />
        <span style={{ color: "var(--lime)" }}>go live with your people</span>
      </h1>
      <p className="section-copy" style={{ marginTop: "16px" }}>
        This version runs as a real multi-user app on Vercel with Supabase Auth, Postgres, and Realtime behind it.
      </p>
      <form onSubmit={handleSubmit} className="stack-row" style={{ marginTop: "20px" }}>
        <input
          type="email"
          className="field"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send magic link"}
        </button>
      </form>
      <p className="hint" style={{ marginTop: "14px" }}>
        {status || "Email auth is the fastest way to get real users into the app."}
      </p>
    </section>
  );
}

function ProfileSetup({ user, onCreated }) {
  const supabase = useMemo(() => createBrowserSocialClient(), []);
  const [form, setForm] = useState({
    displayName: user.email?.split("@")[0] || "",
    handle: user.email?.split("@")[0] || "",
    city: "",
    tagline: ""
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      const profile = await createProfile(supabase, user, form);
      onCreated(profile);
    } catch (error) {
      setStatus(error.message || "Profile creation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass page-panel pixel-frame">
      <div className="label pixel">Create profile</div>
      <h2 style={{ margin: "10px 0 16px", fontSize: "2rem" }}>Let people find you by handle</h2>
      <form onSubmit={handleSubmit} className="split">
        <div className="stack-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
          <input className="field" value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} placeholder="Display name" required />
          <input className="field" value={form.handle} onChange={(event) => setForm((current) => ({ ...current, handle: event.target.value }))} placeholder="@yourhandle" required />
        </div>
        <div className="stack-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
          <input className="field" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} placeholder="City" />
          <input className="field" value={form.tagline} onChange={(event) => setForm((current) => ({ ...current, tagline: event.target.value }))} placeholder="Taste line" />
        </div>
      </form>
      <div className="cta-row" style={{ marginTop: "16px" }}>
        <button className="button" onClick={handleSubmit} type="button" disabled={loading}>
          {loading ? "Saving..." : "Create my profile"}
        </button>
      </div>
      {status ? <p className="hint" style={{ marginTop: "12px" }}>{status}</p> : null}
    </section>
  );
}

export function RealtimeSocialApp() {
  const supabase = useMemo(() => createBrowserSocialClient(), []);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bundle, setBundle] = useState(null);
  const [status, setStatus] = useState("");
  const [friendHandle, setFriendHandle] = useState("");
  const [watchForm, setWatchForm] = useState({ contentId: catalog[0]?.id || "", status: "completed", rating: "4.5", reviewText: "" });
  const [recommendForm, setRecommendForm] = useState({ friendProfileId: "", contentId: catalog[0]?.id || "", note: "" });
  const [groupForm, setGroupForm] = useState({ name: "", description: "", contentId: "", memberIds: [] });
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const current = await getCurrentUserAndProfile(supabase);
    setUser(current.user);
    setProfile(current.profile);

    if (current.profile) {
      const nextBundle = await fetchDashboardBundle(supabase, current.profile);
      setBundle(nextBundle);
      setRecommendForm((form) => ({
        ...form,
        friendProfileId: form.friendProfileId || nextBundle.friends[0]?.id || ""
      }));
      setSelectedGroupId((currentGroup) => currentGroup || nextBundle.groups[0]?.id || "");
    } else {
      setBundle(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !profile) {
      return;
    }

    return subscribeToRealtime(supabase, () => {
      refresh();
    });
  }, [profile, supabase]);

  const selectedGroup = bundle?.groups.find((group) => group.id === selectedGroupId) || null;
  const selectedGroupMessages = (bundle?.groupMessages || []).filter((message) => message.group_id === selectedGroupId);
  const selectedGroupMembers = (bundle?.groupMembers || []).filter((member) => member.group_id === selectedGroupId);

  async function withStatus(action) {
    try {
      setStatus("");
      await action();
      await refresh();
    } catch (error) {
      setStatus(error.message || "That action did not land.");
    }
  }

  if (!supabase) {
    return (
      <section className="glass page-panel pixel-frame">
        <div className="eyebrow">setup needed</div>
        <h1 className="section-title display" style={{ marginTop: "16px" }}>real-time mode needs Supabase</h1>
        <p className="section-copy" style={{ marginTop: "16px" }}>
          Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel to turn on real accounts, friend requests, groups, and live discussion.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="glass page-panel pixel-frame">
        <p className="hint">Loading your social layer...</p>
      </section>
    );
  }

  if (!user) {
    return <AuthGate onSignedIn={refresh} />;
  }

  if (!profile) {
    return <ProfileSetup user={user} onCreated={refresh} />;
  }

  return (
    <div className="content-grid">
      <section className="glass page-panel pixel-frame">
        <div className="mini-row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="eyebrow">real-time social portal</div>
            <h1 className="section-title display" style={{ marginTop: "16px" }}>
              your people,
              <br />
              <span style={{ color: "var(--pink)" }}>live right now</span>
            </h1>
            <p className="section-copy" style={{ marginTop: "16px" }}>
              Send friend requests by handle, log what you finished, recommend titles directly, spin up groups, and discuss movies or series in live threads.
            </p>
            <p className="hint" style={{ marginTop: "12px" }}>
              Signed in as <strong>{profile.display_name}</strong> ({profile.handle})
            </p>
          </div>
          <div className="cta-row">
            <Link href="/discover" className="ghost-button">Run predictor</Link>
            <button className="button" type="button" onClick={() => supabase.auth.signOut().then(refresh)}>
              Sign out
            </button>
          </div>
        </div>
        {status ? <p className="hint" style={{ marginTop: "14px", color: "var(--orange)" }}>{status}</p> : null}
      </section>

      <section className="split">
        <div className="glass page-panel pixel-frame">
          <div className="label pixel">Friend portal</div>
          <div className="stack-row" style={{ marginTop: "16px" }}>
            <input className="field" value={friendHandle} onChange={(event) => setFriendHandle(event.target.value)} placeholder="@friendhandle" />
            <button className="button" type="button" onClick={() => withStatus(() => sendFriendRequest(supabase, profile, friendHandle))}>
              Send request
            </button>
          </div>

          <div className="content-stack" style={{ marginTop: "18px" }}>
            <strong>Incoming requests</strong>
            {bundle.friendRequests.incoming.length ? bundle.friendRequests.incoming.map((request) => (
              <div className="glass small-card" key={request.id}>
                <strong>{request.from_profile.display_name}</strong>
                <p className="hint" style={{ marginTop: "6px" }}>{request.from_profile.handle}</p>
                <div className="cta-row" style={{ marginTop: "12px" }}>
                  <button className="button" type="button" onClick={() => withStatus(() => acceptFriendRequest(supabase, request.id))}>Accept</button>
                  <button className="ghost-button" type="button" onClick={() => withStatus(() => rejectFriendRequest(supabase, request.id))}>Reject</button>
                </div>
              </div>
            )) : <EmptyState title="No incoming requests" copy="Once someone searches your handle and sends a request, it lands here." />}
          </div>

          <div className="content-stack" style={{ marginTop: "18px" }}>
            <strong>Your friends</strong>
            {bundle.friends.length ? bundle.friends.map((friend) => (
              <div className="glass small-card" key={friend.id}>
                <div className="friend-head">
                  <div className="avatar">{friend.avatar_text || friend.handle.slice(1, 3).toUpperCase()}</div>
                  <div>
                    <strong>{friend.display_name}</strong>
                    <p className="hint" style={{ marginTop: "4px" }}>{friend.handle}</p>
                  </div>
                </div>
                <div className="cta-row" style={{ marginTop: "12px" }}>
                  <Link href={`/friends/${friend.slug}`} className="ghost-button">Open profile</Link>
                  <button className="ghost-button" type="button" onClick={() => withStatus(() => removeFriend(supabase, profile.id, friend.id))}>
                    Remove friend
                  </button>
                </div>
              </div>
            )) : <EmptyState title="No friends yet" copy="Send your first request by handle to start the network." />}
          </div>
        </div>

        <div className="glass page-panel pixel-frame">
          <div className="label pixel">Log and recommend</div>
          <div className="split" style={{ marginTop: "16px" }}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                withStatus(() =>
                  saveWatchEntry(supabase, profile, {
                    contentId: watchForm.contentId,
                    status: watchForm.status,
                    rating: Number(watchForm.rating || 0),
                    reviewText: watchForm.reviewText
                  })
                );
              }}
            >
              <div className="stack-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
                <select className="select" value={watchForm.contentId} onChange={(event) => setWatchForm((current) => ({ ...current, contentId: event.target.value }))}>
                  {catalog.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
                <select className="select" value={watchForm.status} onChange={(event) => setWatchForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="completed">Finished</option>
                  <option value="watching">Watching now</option>
                  <option value="planned">Planned</option>
                </select>
                <input className="field" value={watchForm.rating} onChange={(event) => setWatchForm((current) => ({ ...current, rating: event.target.value }))} placeholder="Rating out of 5" />
                <textarea className="textarea" rows={4} value={watchForm.reviewText} onChange={(event) => setWatchForm((current) => ({ ...current, reviewText: event.target.value }))} placeholder="What did you think?" />
                <button className="button" type="submit">Save activity</button>
              </div>
            </form>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                withStatus(() =>
                  recommendTitleToFriend(supabase, profile, recommendForm.friendProfileId, {
                    contentId: recommendForm.contentId,
                    note: recommendForm.note
                  })
                );
              }}
            >
              <div className="stack-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
                <select className="select" value={recommendForm.friendProfileId} onChange={(event) => setRecommendForm((current) => ({ ...current, friendProfileId: event.target.value }))}>
                  <option value="">Pick a friend</option>
                  {bundle.friends.map((friend) => <option key={friend.id} value={friend.id}>{friend.display_name}</option>)}
                </select>
                <select className="select" value={recommendForm.contentId} onChange={(event) => setRecommendForm((current) => ({ ...current, contentId: event.target.value }))}>
                  {catalog.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
                <textarea className="textarea" rows={4} value={recommendForm.note} onChange={(event) => setRecommendForm((current) => ({ ...current, note: event.target.value }))} placeholder="Why this friend should watch it" />
                <button className="button" type="submit" disabled={!bundle.friends.length}>Recommend to friend</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="split">
        <div className="glass page-panel pixel-frame">
          <div className="label pixel">Groups</div>
          <form
            style={{ marginTop: "16px" }}
            onSubmit={(event) => {
              event.preventDefault();
              withStatus(() =>
                createGroup(supabase, profile, {
                  ...groupForm,
                  memberIds: groupForm.memberIds
                })
              );
            }}
          >
            <div className="stack-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <input className="field" value={groupForm.name} onChange={(event) => setGroupForm((current) => ({ ...current, name: event.target.value }))} placeholder="Group name" required />
              <input className="field" value={groupForm.description} onChange={(event) => setGroupForm((current) => ({ ...current, description: event.target.value }))} placeholder="What is this group for?" />
              <select className="select" value={groupForm.contentId} onChange={(event) => setGroupForm((current) => ({ ...current, contentId: event.target.value }))}>
                <option value="">Optional title focus</option>
                {catalog.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
              <select
                multiple
                className="select"
                value={groupForm.memberIds}
                onChange={(event) =>
                  setGroupForm((current) => ({
                    ...current,
                    memberIds: Array.from(event.target.selectedOptions).map((option) => option.value)
                  }))
                }
                style={{ minHeight: "150px" }}
              >
                {bundle.friends.map((friend) => (
                  <option key={friend.id} value={friend.id}>{friend.display_name}</option>
                ))}
              </select>
              <button className="button" type="submit">Create group</button>
            </div>
          </form>

          <div className="content-stack" style={{ marginTop: "20px" }}>
            {bundle.groups.length ? bundle.groups.map((group) => (
              <button key={group.id} type="button" className={`option-button ${selectedGroupId === group.id ? "selected" : ""}`} onClick={() => setSelectedGroupId(group.id)}>
                <strong>{group.name}</strong>
                <p className="hint" style={{ marginTop: "6px" }}>{group.description || "No description yet."}</p>
              </button>
            )) : <EmptyState title="No groups yet" copy="Create a group and invite friends to start a live discussion thread." />}
          </div>
        </div>

        <div className="glass page-panel pixel-frame">
          <div className="label pixel">Group discussion</div>
          {selectedGroup ? (
            <>
              <h2 style={{ margin: "10px 0 8px" }}>{selectedGroup.name}</h2>
              <p className="hint">{selectedGroup.description || "Live discussion room."}</p>
              <div className="inline-badges" style={{ marginTop: "12px" }}>
                {selectedGroup.title?.title ? <span className="inline-badge">{selectedGroup.title.title}</span> : null}
                {selectedGroupMembers.map((member) => (
                  <span className="inline-badge" key={member.id}>{member.profile.display_name}</span>
                ))}
              </div>
              <div className="content-stack" style={{ marginTop: "18px", maxHeight: "360px", overflowY: "auto" }}>
                {selectedGroupMessages.length ? selectedGroupMessages.map((message) => (
                  <div className="glass small-card" key={message.id}>
                    <strong>{message.profile.display_name}</strong>
                    <p className="hint" style={{ marginTop: "6px" }}>{message.body}</p>
                  </div>
                )) : <EmptyState title="No messages yet" copy="Drop the first message and the thread becomes live for every member." />}
              </div>
              <form
                className="stack-row"
                style={{ marginTop: "16px" }}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!messageText.trim()) {
                    return;
                  }

                  withStatus(() => sendGroupMessage(supabase, profile, selectedGroup.id, messageText.trim()));
                  setMessageText("");
                }}
              >
                <textarea className="textarea" rows={3} value={messageText} onChange={(event) => setMessageText(event.target.value)} placeholder="Say something smart, chaotic, or very opinionated" />
                <button className="button" type="submit">Send</button>
              </form>
            </>
          ) : (
            <EmptyState title="Pick a group" copy="Choose a group from the left to see the discussion thread." />
          )}
        </div>
      </section>

      <section className="glass page-panel pixel-frame">
        <div className="label pixel">Live feed</div>
        <div className="feed-stack" style={{ marginTop: "16px" }}>
          {bundle.watches.length ? bundle.watches.map((entry) => (
            <FeedCard
              entry={{
                id: entry.id,
                action: entry.status === "completed" ? `finished and rated ${entry.rating || "it"}` : entry.status,
                review: entry.review_text || "No written note yet.",
                recommendedForYou: false,
                timestamp: new Date(entry.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
                friend: {
                  id: entry.profile.id,
                  slug: entry.profile.slug,
                  avatar: entry.profile.avatar_text || entry.profile.handle.slice(1, 3).toUpperCase(),
                  name: entry.profile.display_name,
                  handle: entry.profile.handle
                },
                content: {
                  ...entry.title,
                  title: entry.title.title,
                  platforms: entry.title.platforms || [],
                  rating: Number(entry.title.rating || 0)
                }
              }}
              key={entry.id}
            />
          )) : <EmptyState title="No activity yet" copy="As soon as you and your friends start logging titles, the feed wakes up." />}
        </div>
      </section>
    </div>
  );
}
