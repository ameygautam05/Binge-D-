# binge-d

`binge-d` is a neon social watch portal built with Next.js for Vercel deployment. It is now configured to work out of the box with no keys or external services required.

- a six-question recommendation predictor
- a social feed based on what friends are watching and recommending
- friend profile pages with current watches, finished titles, ratings, and taste tags
- cover art collages and top-7 results with ratings, cast, and India watch platforms
- browser-saved personal profile and social activity in zero-setup mode
- optional live TMDb-backed recommendations and India watch-provider lookup if you ever add keys later

## Stack

- Next.js App Router
- React 18
- CSS-only neon/pixel visual system
- browser localStorage for zero-setup personal persistence
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
3. Deploy.

That is enough for the zero-setup version.

## Zero-setup behavior

- Shared demo friends and reviews are built into the app.
- Each visitor can create a browser-saved profile and add their own watch updates.
- Those personal updates persist in that browser using localStorage.
- No database, auth provider, or API keys are needed for the default deploy.

## Optional upgrades later

If you later want real cross-user sync, email login, or live catalog APIs, the repo still contains the optional Supabase and TMDb scaffolding. That setup is no longer required for the default deploy.

## Notes

- The app ships with a built-in starter catalog covering movies, series, documentaries, podcasts, and standup specials.
- The provided IMDb TSV files are still useful offline through [scripts/build-imdb-social-seed.mjs](/Users/ameygautam/Documents/Playground/scripts/build-imdb-social-seed.mjs) if you later decide to re-enable a real backend.
- A true shared multi-user social network cannot exist on Vercel with no external storage at all, so this zero-setup version uses browser persistence for each visitor's personal activity.
