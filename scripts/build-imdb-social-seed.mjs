import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const root = process.cwd();
const downloads = "/Users/ameygautam/Downloads";
const basicsPath = path.join(downloads, "title.basics.tsv");
const ratingsPath = path.join(downloads, "title.ratings.tsv");
const akasPath = path.join(downloads, "title.akas.tsv");
const namesPath = path.join(downloads, "name.basics.tsv");
const outputJson = path.join(root, "db", "imdb_social_seed.json");
const outputSql = path.join(root, "db", "seed_social.sql");

const targets = [
  { key: "shogun", labels: ["Shogun"], year: 2024, typeGroup: "series" },
  { key: "beckham", labels: ["Beckham"], year: 2023, typeGroup: "series" },
  { key: "kohrra", labels: ["Kohrra"], year: 2023, typeGroup: "series" },
  { key: "the-bear", labels: ["The Bear"], year: 2022, typeGroup: "series" },
  { key: "laapataa-ladies", labels: ["Laapataa Ladies", "Lost Ladies"], year: 2024, typeGroup: "movie" },
  { key: "blue-eye-samurai", labels: ["Blue Eye Samurai"], year: 2023, typeGroup: "series" },
  { key: "fallout", labels: ["Fallout"], year: 2024, typeGroup: "series" },
  { key: "kalki-2898-ad", labels: ["Kalki 2898 AD", "Kalki 2898 - A.D."], year: 2024, typeGroup: "movie" },
  { key: "jigarthanda-doublex", labels: ["Jigarthanda DoubleX"], year: 2023, typeGroup: "movie" },
  { key: "kantara", labels: ["Kantara"], year: 2022, typeGroup: "movie" },
  { key: "the-family-man", labels: ["The Family Man"], year: 2019, typeGroup: "series" },
  { key: "panchayat", labels: ["Panchayat"], year: 2020, typeGroup: "series" },
  { key: "the-elephant-whisperers", labels: ["The Elephant Whisperers"], year: 2022, typeGroup: "movie" },
  { key: "all-we-imagine-as-light", labels: ["All We Imagine as Light"], year: 2024, typeGroup: "movie" },
  { key: "zakir-khan-tathastu", labels: ["Zakir Khan: Tathastu"], year: 2022, typeGroup: "movie" },
  { key: "maharaja", labels: ["Maharaja"], year: 2024, typeGroup: "movie" },
  { key: "daniel-sloss-jigsaw", labels: ["Daniel Sloss: Jigsaw"], year: 2018, typeGroup: "movie" }
];

const labelToTarget = new Map();
targets.forEach((target) => {
  target.labels.forEach((label) => labelToTarget.set(label.toLowerCase(), target));
});

const candidateMap = new Map();
const matchedTconsts = new Set();

function parseLine(line) {
  return line.replace(/\r?\n$/, "").split("\t");
}

function scoreCandidate(target, row, viaAka = false) {
  let score = viaAka ? 30 : 25;
  const year = row.startYear === "\\N" ? null : Number(row.startYear);
  const titleType = row.titleType || "";
  const labelHit = target.labels.some((label) => [row.primaryTitle, row.originalTitle, row.akaTitle].includes(label));

  if (labelHit) {
    score += 30;
  }

  if (year && target.year) {
    score += Math.max(0, 20 - Math.abs(target.year - year) * 4);
  }

  if (target.typeGroup === "series" && ["tvSeries", "tvMiniSeries"].includes(titleType)) {
    score += 18;
  }

  if (target.typeGroup === "movie" && ["movie", "tvMovie"].includes(titleType)) {
    score += 18;
  }

  return score;
}

async function scanBasics() {
  const rl = readline.createInterface({
    input: fs.createReadStream(basicsPath, { encoding: "utf8" }),
    crlfDelay: Infinity
  });

  let first = true;
  for await (const line of rl) {
    if (first) {
      first = false;
      continue;
    }

    const [tconst, titleType, primaryTitle, originalTitle, isAdult, startYear, endYear, runtimeMinutes, genres] = parseLine(line);

    [primaryTitle, originalTitle].forEach((title) => {
      const target = labelToTarget.get(title.toLowerCase());
      if (!target) {
        return;
      }

      const row = { tconst, titleType, primaryTitle, originalTitle, isAdult, startYear, endYear, runtimeMinutes, genres };
      const score = scoreCandidate(target, row, false);
      const existing = candidateMap.get(target.key);
      if (!existing || score > existing.score) {
        candidateMap.set(target.key, { ...row, score, targetKey: target.key });
        matchedTconsts.add(tconst);
      }
    });
  }
}

async function scanAkas() {
  const rl = readline.createInterface({
    input: fs.createReadStream(akasPath, { encoding: "utf8" }),
    crlfDelay: Infinity
  });

  let first = true;
  for await (const line of rl) {
    if (first) {
      first = false;
      continue;
    }

    const [titleId, ordering, title, region, language, types, attributes, isOriginalTitle] = parseLine(line);
    const target = labelToTarget.get(title.toLowerCase());
    if (!target) {
      continue;
    }

    const existing = candidateMap.get(target.key);
    if (!existing || existing.tconst !== titleId) {
      candidateMap.set(target.key, {
        ...(existing || {}),
        tconst: titleId,
        akaTitle: title,
        score: scoreCandidate(target, { ...(existing || {}), akaTitle: title }, true),
        targetKey: target.key
      });
      matchedTconsts.add(titleId);
    }
  }
}

async function enrichBasicsForAkaMatches() {
  const needed = new Set(Array.from(candidateMap.values()).filter((item) => !item.primaryTitle).map((item) => item.tconst));
  if (!needed.size) {
    return;
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(basicsPath, { encoding: "utf8" }),
    crlfDelay: Infinity
  });

  let first = true;
  for await (const line of rl) {
    if (first) {
      first = false;
      continue;
    }

    const [tconst, titleType, primaryTitle, originalTitle, isAdult, startYear, endYear, runtimeMinutes, genres] = parseLine(line);
    if (!needed.has(tconst)) {
      continue;
    }

    for (const [key, item] of candidateMap.entries()) {
      if (item.tconst === tconst) {
        candidateMap.set(key, { ...item, titleType, primaryTitle, originalTitle, isAdult, startYear, endYear, runtimeMinutes, genres });
      }
    }
  }
}

async function scanRatings() {
  const ratings = new Map();
  const rl = readline.createInterface({
    input: fs.createReadStream(ratingsPath, { encoding: "utf8" }),
    crlfDelay: Infinity
  });

  let first = true;
  for await (const line of rl) {
    if (first) {
      first = false;
      continue;
    }

    const [tconst, averageRating, numVotes] = parseLine(line);
    if (matchedTconsts.has(tconst)) {
      ratings.set(tconst, {
        averageRating: Number(averageRating),
        numVotes: Number(numVotes)
      });
    }
  }

  for (const [key, item] of candidateMap.entries()) {
    candidateMap.set(key, { ...item, ...(ratings.get(item.tconst) || {}) });
  }
}

async function scanNames() {
  const namesByTitle = new Map(Array.from(matchedTconsts).map((tconst) => [tconst, []]));
  const rl = readline.createInterface({
    input: fs.createReadStream(namesPath, { encoding: "utf8" }),
    crlfDelay: Infinity
  });

  let first = true;
  for await (const line of rl) {
    if (first) {
      first = false;
      continue;
    }

    const [nconst, primaryName, birthYear, deathYear, primaryProfession, knownForTitles] = parseLine(line);
    const known = knownForTitles === "\\N" ? [] : knownForTitles.split(",");

    known.forEach((tconst) => {
      const bucket = namesByTitle.get(tconst);
      if (!bucket || bucket.length >= 4) {
        return;
      }

      bucket.push(primaryName);
    });
  }

  for (const [key, item] of candidateMap.entries()) {
    candidateMap.set(key, { ...item, peopleHint: namesByTitle.get(item.tconst) || [] });
  }
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlNullable(value) {
  if (value === null || value === undefined || value === "" || value === "\\N") {
    return "null";
  }

  return sqlString(value);
}

function sqlArray(values = []) {
  if (!values.length) {
    return "ARRAY[]::text[]";
  }

  return `ARRAY[${values.map((value) => sqlString(value)).join(", ")}]`;
}

function buildSeedArtifacts() {
  const titles = targets
    .map((target) => {
      const item = candidateMap.get(target.key);
      if (!item?.tconst || !item.primaryTitle) {
        return null;
      }

      return {
        key: target.key,
        imdbId: item.tconst,
        title: item.primaryTitle,
        titleType: item.titleType,
        year: item.startYear && item.startYear !== "\\N" ? Number(item.startYear) : null,
        endYear: item.endYear && item.endYear !== "\\N" ? Number(item.endYear) : null,
        runtimeMinutes: item.runtimeMinutes && item.runtimeMinutes !== "\\N" ? Number(item.runtimeMinutes) : null,
        rating: item.averageRating || null,
        numVotes: item.numVotes || null,
        genres: item.genres && item.genres !== "\\N" ? item.genres.split(",") : [],
        peopleHint: item.peopleHint || []
      };
    })
    .filter(Boolean);

  const imdbByKey = new Map(titles.map((title) => [title.key, title.imdbId]));

  function imdbLiteral(key) {
    const imdbId = imdbByKey.get(key);
    return imdbId ? sqlString(imdbId) : "null";
  }

  const sql = `
insert into profiles (slug, email, display_name, handle, city, tagline, avatar_text, taste_tags)
values
  ('aarya', 'aarya@binge-d.test', 'Aarya Sen', '@framesbyaarya', 'Bengaluru', 'Prestige drama sniper. Soft spot for weird docs.', 'AS', ARRAY['slow-burn crime', 'premium craft', 'sharp standup']),
  ('ishaan', 'ishaan@binge-d.test', 'Ishaan Rao', '@loudscreenish', 'Hyderabad', 'Massy genre maximalist. If it slaps, it stays.', 'IR', ARRAY['action', 'sci-fi', 'blockbuster weirdness']),
  ('meher', 'meher@binge-d.test', 'Meher Kohli', '@mehernotes', 'Delhi', 'Comfort-core curator with hidden arthouse menace.', 'MK', ARRAY['comfort stories', 'gentle docs', 'women-led cinema'])
on conflict (slug) do update
set display_name = excluded.display_name,
    handle = excluded.handle,
    city = excluded.city,
    tagline = excluded.tagline,
    avatar_text = excluded.avatar_text,
    taste_tags = excluded.taste_tags;

${titles
  .map(
    (title) => `insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values (${sqlString(title.imdbId)}, ${sqlString(title.title)}, ${sqlNullable(title.titleType)}, ${title.year ?? "null"}, ${title.endYear ?? "null"}, ${title.runtimeMinutes ?? "null"}, ${title.rating ?? "null"}, ${title.numVotes ?? "null"}, ${sqlArray(title.genres)}, ${sqlArray(title.peopleHint)}, 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;`
  )
  .join("\n\n")}

insert into friendships (profile_id, friend_id, status)
select p1.id, p2.id, 'accepted'
from profiles p1
join profiles p2 on p1.slug <> p2.slug
where p1.slug in ('aarya', 'ishaan', 'meher')
  and p2.slug in ('aarya', 'ishaan', 'meher')
on conflict (profile_id, friend_id) do nothing;

insert into watch_entries (profile_id, title_id, status, rating, review_text, visibility, updated_at)
values
  ((select id from profiles where slug = 'aarya'), (select id from titles where imdb_id = ${imdbLiteral("shogun")}), 'watching', null, null, 'friends', now()),
  ((select id from profiles where slug = 'aarya'), (select id from titles where imdb_id = ${imdbLiteral("the-bear")}), 'completed', 4.6, 'Kitchen panic cinema disguised as a series. Every scene feels like the timer is about to explode.', 'friends', now() - interval '20 minutes'),
  ((select id from profiles where slug = 'aarya'), (select id from titles where imdb_id = ${imdbLiteral("all-we-imagine-as-light")}), 'completed', 4.4, 'This one sits with you after the credits. Gorgeous restraint, zero wasted beats.', 'friends', now() - interval '3 days'),
  ((select id from profiles where slug = 'ishaan'), (select id from titles where imdb_id = ${imdbLiteral("fallout")}), 'watching', null, null, 'friends', now() - interval '30 minutes'),
  ((select id from profiles where slug = 'ishaan'), (select id from titles where imdb_id = ${imdbLiteral("jigarthanda-doublex")}), 'completed', 4.7, 'Pure speaker-rattling energy. Self-aware, loud, and somehow still emotional.', 'friends', now() - interval '1 hour'),
  ((select id from profiles where slug = 'ishaan'), (select id from titles where imdb_id = ${imdbLiteral("kantara")}), 'completed', 4.5, 'Folklore with actual fury. This absolutely deserved the obsession cycle.', 'friends', now() - interval '4 days'),
  ((select id from profiles where slug = 'meher'), (select id from titles where imdb_id = ${imdbLiteral("panchayat")}), 'watching', null, null, 'friends', now() - interval '2 hours'),
  ((select id from profiles where slug = 'meher'), (select id from titles where imdb_id = ${imdbLiteral("laapataa-ladies")}), 'completed', 4.5, 'A crowd-pleaser with actual tenderness. Hope without cringe, which is rare.', 'friends', now() - interval '4 hours'),
  ((select id from profiles where slug = 'meher'), (select id from titles where imdb_id = ${imdbLiteral("the-elephant-whisperers")}), 'completed', 4.2, 'Quietly wrecked me. Tiny documentary, huge heart.', 'friends', now() - interval '2 days')
on conflict (profile_id, title_id, status) do update
set rating = excluded.rating,
    review_text = excluded.review_text,
    visibility = excluded.visibility,
    updated_at = excluded.updated_at;

insert into direct_recommendations (from_profile_id, to_profile_id, title_id, note)
values
  ((select id from profiles where slug = 'ishaan'), (select id from profiles where slug = 'aarya'), (select id from titles where imdb_id = ${imdbLiteral("jigarthanda-doublex")}), 'If you want one huge theatrical swing tonight, this is the move.'),
  ((select id from profiles where slug = 'ishaan'), (select id from profiles where slug = 'aarya'), (select id from titles where imdb_id = ${imdbLiteral("fallout")}), 'This scratches the same premium-chaos itch but in sci-fi mode.'),
  ((select id from profiles where slug = 'meher'), (select id from profiles where slug = 'aarya'), (select id from titles where imdb_id = ${imdbLiteral("laapataa-ladies")}), 'Trust me, this is the warm reset watch.'),
  ((select id from profiles where slug = 'meher'), (select id from profiles where slug = 'aarya'), (select id from titles where imdb_id = ${imdbLiteral("the-elephant-whisperers")}), 'Short, gentle, and worth every minute.')
on conflict (from_profile_id, to_profile_id, title_id) do update
set note = excluded.note;`.trim();

  return { titles, sql };
}

async function main() {
  await scanBasics();
  await scanAkas();
  await enrichBasicsForAkaMatches();
  await scanRatings();
  await scanNames();

  const artifacts = buildSeedArtifacts();
  fs.mkdirSync(path.join(root, "db"), { recursive: true });
  fs.writeFileSync(outputJson, JSON.stringify(artifacts.titles, null, 2));
  fs.writeFileSync(outputSql, `${artifacts.sql}\n`);

  console.log(`Wrote ${artifacts.titles.length} titles to ${outputJson}`);
  console.log(`Wrote SQL seed to ${outputSql}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
