import { NextResponse } from "next/server";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase-server";

export async function POST(request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error: "Supabase is not configured yet."
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { profileSlug, imdbId, title, titleType, year, rating, reviewText, status = "completed" } = body;

    if (!profileSlug || !title || !status) {
      return NextResponse.json(
        {
          error: "profileSlug, title, and status are required."
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("slug", profileSlug)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          error: "Profile not found."
        },
        { status: 404 }
      );
    }

    let titleId = null;

    if (imdbId) {
      const { data: existingTitle } = await supabase
        .from("titles")
        .select("id")
        .eq("imdb_id", imdbId)
        .maybeSingle();

      if (existingTitle?.id) {
        titleId = existingTitle.id;
      }
    }

    if (!titleId) {
      const titlePayload = {
        imdb_id: imdbId || null,
        title,
        title_type: titleType || null,
        year: year || null,
        source: imdbId ? "imdb-manual" : "manual"
      };

      const titleMutation = imdbId
        ? supabase.from("titles").upsert(titlePayload, { onConflict: "imdb_id" })
        : supabase.from("titles").insert(titlePayload);

      const { data: insertedTitle, error: titleError } = await titleMutation.select("id").single();

      if (titleError || !insertedTitle) {
        return NextResponse.json(
          {
            error: "Title could not be created."
          },
          { status: 500 }
        );
      }

      titleId = insertedTitle.id;
    }

    const payload = {
      profile_id: profile.id,
      title_id: titleId,
      status,
      rating: rating || null,
      review_text: reviewText || null,
      visibility: "friends",
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("watch_entries")
      .upsert(payload, { onConflict: "profile_id,title_id,status" })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: error.message || "Watch entry write failed."
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: data.id
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || "Unexpected write failure."
      },
      { status: 500 }
    );
  }
}
