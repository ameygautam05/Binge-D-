# binge-d

`binge-d` is a neon social watch portal built with Next.js for Vercel deployment. This version is set up for a real multi-user launch with profiles, friend requests, direct recommendations, groups, and live discussion threads.

- a six-question recommendation predictor
- a social feed based on what friends are watching and recommending
- friend profile pages with current watches, finished titles, ratings, and taste tags
- cover art collages and top-7 results with ratings, cast, and India watch platforms
- real account creation and sign-in through Supabase Auth
- real-time social graph through Supabase Postgres + Realtime
- optional TMDb-backed live catalog enrichment later

## Stack

- Next.js App Router
- React 18
- CSS-only neon/pixel visual system
- Supabase Auth
- Supabase Postgres
- Supabase Realtime
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
3. Add these env vars in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
TMDB_READ_ACCESS_TOKEN=optional
OMDB_API_KEY=optional
```

4. In Supabase:
   - create a project
   - run [db/schema.sql](/Users/ameygautam/Documents/Playground/db/schema.sql) in the SQL editor
   - add your Vercel domain and `http://localhost:3000` as Auth redirect URLs
   - enable Realtime for `profiles`, `friend_requests`, `watch_entries`, `direct_recommendations`, `groups`, `group_members`, and `group_messages`
   - if you want starter IMDb-backed social data, optionally run [db/seed_social.sql](/Users/ameygautam/Documents/Playground/db/seed_social.sql)

## What works

- users create real profiles after signing in by email
- users send and accept friend requests by handle
- users remove friends
- users log titles as watching or completed with ratings and review notes
- users recommend titles directly to friends
- users create groups and invite friends
- users chat in group discussion threads that update live through Supabase Realtime

## Notes

- The app ships with a built-in starter catalog covering movies, series, documentaries, podcasts, and standup specials.
- The provided IMDb TSV files are useful offline through [scripts/build-imdb-social-seed.mjs](/Users/ameygautam/Documents/Playground/scripts/build-imdb-social-seed.mjs) if you want to seed richer title data.
- The predictor can still fall back to built-in data if TMDb keys are omitted, but the real social app needs Supabase to be truly multi-user.
