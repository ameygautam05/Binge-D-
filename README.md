# binge-d

`binge-d` is a neon social watch portal built with Next.js for Vercel deployment. It merges:

- a six-question recommendation predictor
- a social feed based on what friends are watching and recommending
- friend profile pages with current watches, finished titles, ratings, and taste tags
- cover art collages and top-7 results with ratings, cast, and India watch platforms
- email magic-link login scaffolding through Supabase
- live TMDb-backed recommendations and India watch-provider lookup when API keys are present
- optional OMDb enrichment for IMDb IDs / rating overlays

## Stack

- Next.js App Router
- React 18
- CSS-only neon/pixel visual system
- Supabase browser client for email OTP / confirmation links
- Supabase Postgres for social graph storage
- IMDb TSV import script for seedable title metadata

## Local run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Vercel deploy

1. Push this folder to Git.
2. Import the repo into Vercel.
3. Add these environment variables in Vercel if you want real login flows:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TMDB_READ_ACCESS_TOKEN=your-tmdb-read-access-token
OMDB_API_KEY=optional-omdb-key
SOCIAL_DEMO_VIEWER_SLUG=aarya
```

4. In Supabase Auth:
   - enable email auth
   - enable email confirmations / magic links
   - add your Vercel URL and `http://localhost:3000` as redirect URLs
   - keep `/auth/callback` as the redirect target

## Social database setup

1. Create a Supabase project.
2. Run [db/schema.sql](/Users/ameygautam/Documents/Playground/db/schema.sql) in the Supabase SQL editor.
3. Generate seed data from your IMDb TSV files:

```bash
npm run imdb:seed
```

4. Run the generated [db/seed_social.sql](/Users/ameygautam/Documents/Playground/db/seed_social.sql) in the Supabase SQL editor.
5. Add the Supabase env vars locally in `.env.local` and in Vercel.

## Backend write route

The app now includes a real write endpoint at `/api/social/watch-entries` for storing friend activity in Supabase. Expected JSON:

```json
{
  "profileSlug": "aarya",
  "imdbId": "tt21626284",
  "title": "Lost Ladies",
  "titleType": "movie",
  "year": 2023,
  "rating": 4.5,
  "reviewText": "Warm, funny, and easy to recommend.",
  "status": "completed"
}
```

## Notes

- The app ships with a seeded starter catalog covering movies, series, documentaries, podcasts, and standup specials.
- Friend activity now reads from Supabase when configured and falls back locally only when keys are missing.
- If Supabase env vars are missing, the auth card stays in demo mode instead of breaking.
- Live recommendations use TMDb because it supports real movie/TV data, posters, credits, and watch providers for India.
- IMDb's official real-time API is a paid AWS Data Exchange product, and IMDb's free datasets are restricted to personal/non-commercial usage; they are not a safe basis for a public Vercel app without licensing.
- The provided IMDb TSV files are used offline through [scripts/build-imdb-social-seed.mjs](/Users/ameygautam/Documents/Playground/scripts/build-imdb-social-seed.mjs) to create importable seed data for the social backend.
