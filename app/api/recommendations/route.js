import { NextResponse } from "next/server";
import { getLiveRecommendations } from "@/lib/tmdb";

export async function POST(request) {
  try {
    const answers = await request.json();
    const result = await getLiveRecommendations(answers, 7);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || "Failed to load recommendations."
      },
      { status: 500 }
    );
  }
}
