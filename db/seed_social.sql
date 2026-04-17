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

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt9438740', 'Shōgun', 'tvSeries', 2024, 2026, 60, null, null, ARRAY['Action', 'Adventure', 'Drama'], ARRAY['Freddy Murphy', 'Sirius Blvck', 'Nick Kartes', 'Trent Tomlinson'], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt14524712', 'Beckham', 'tvMiniSeries', 2023, 2023, 70, 8.1, 40060, ARRAY['Biography', 'Documentary', 'Sport'], ARRAY['Franc Alarcón', 'Gary Neville', 'Tamim El Dalati', 'Aleix Montanyés'], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt27853283', 'Kohrra', 'tvSeries', 2023, null, null, 7.5, 12029, ARRAY['Crime', 'Drama', 'Mystery'], ARRAY['Navtej Singh Johar', 'Rewati Chetri', 'Jatinder Singh', 'Ajit Ranjan'], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt8637042', 'The Bear', 'tvSeries', 2022, 2026, 30, 6.5, 39, ARRAY['Comedy', 'Drama'], ARRAY['Adam Lindblom', 'Katja Brigge', 'Björn Friberg'], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt21626284', 'Lost Ladies', 'movie', 2023, null, 122, 8.3, 59582, ARRAY['Comedy', 'Drama'], ARRAY['Ravi Kishan', 'Ram Sampath', 'Sparsh Shrivastava', 'Jitain Khanna'], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt30590498', 'Blue Eye Samurai', 'tvSeries', 2023, null, 45, null, null, ARRAY['Action', 'Adventure', 'Animation'], ARRAY[]::text[], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt9714698', 'Fallout', 'tvSeries', 2024, null, 60, null, null, ARRAY['Action', 'Adventure', 'Drama'], ARRAY['Michaela Schaaf', 'Trevor Bukowski', 'Cam Keough', 'Hailey Roosa'], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt12735488', 'Kalki 2898 AD', 'movie', 2024, null, 180, 7, 75785, ARRAY['Action', 'Adventure', 'Sci-Fi'], ARRAY['Hamish Boyd', 'Brahmanandam', 'Agustín Cavalieri', 'C. Aswani Dutt'], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt24226474', 'Jigarthanda Double X', 'movie', 2023, null, 172, 8, 11842, ARRAY['Action', 'Comedy', 'Drama'], ARRAY['Yamuna', 'Tuney John', 'Adithya Bhaskar', 'Jaikumar'], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt15327088', 'Kantara', 'movie', 2022, null, 148, 8.1, 116345, ARRAY['Action', 'Adventure', 'Drama'], ARRAY['Pratheek Shetty', 'Pragathi Rishab Shetty', 'Shine Shetty', 'Vinay Bidappa'], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt9664832', 'The Family Man', 'tvSeries', 2019, null, 45, null, null, ARRAY['Action', 'Comedy', 'Crime'], ARRAY['Shiaslynn Thompson', 'Elesé Arias', 'Jena Block', 'Luis Lopez'], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt7983428', 'Panchayat', 'tvSeries', 2020, null, null, 7.6, 30, ARRAY['Comedy', 'Drama'], ARRAY['Navraj Sharma', 'Prabhat Baskota', 'Tanka Budathoki', 'Shivam Adhikari'], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt23628262', 'The Elephant Whisperers', 'short', 2022, null, 41, 7.5, 10859, ARRAY['Documentary', 'Short'], ARRAY['Kumer Kakon Uzzal', 'Kartiki Gonsalves', 'Elangovan Rangappan', 'Bassilo George Cott'], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt32086077', 'All We Imagine as Light', 'movie', 2024, null, 118, 7, 13744, ARRAY['Drama', 'Romance'], ARRAY['Payal Kapadia', 'Julien Graff', 'Suyash Kamat', 'Himanshu Prajapati'], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt23623070', 'Zakir Khan: Tathastu', 'tvSpecial', 2022, null, 94, 9, 4405, ARRAY['Comedy'], ARRAY['Ankur Kaushik', 'Ramesh Mallesh Ayaldar', 'Rishabh Nahar', 'Dharamraj Dongriyal'], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into titles (imdb_id, title, title_type, year, end_year, runtime_minutes, rating, num_votes, genres, people_hint, source, blurb)
values ('tt9619832', 'Maharaja', 'movie', 2024, null, 141, 6.2, 34, ARRAY['Action', 'Crime', 'Drama'], ARRAY['Mohamad Shishakli', 'Raed Senan', 'Edmond Haddad', 'Dana Halabi'], 'imdb', 'Imported from IMDb TSV seed for binge-d social graph.')
on conflict (imdb_id) do update
set title = excluded.title,
    title_type = excluded.title_type,
    year = excluded.year,
    end_year = excluded.end_year,
    runtime_minutes = excluded.runtime_minutes,
    rating = excluded.rating,
    num_votes = excluded.num_votes,
    genres = excluded.genres,
    people_hint = excluded.people_hint;

insert into friendships (profile_id, friend_id, status)
select p1.id, p2.id, 'accepted'
from profiles p1
join profiles p2 on p1.slug <> p2.slug
where p1.slug in ('aarya', 'ishaan', 'meher')
  and p2.slug in ('aarya', 'ishaan', 'meher')
on conflict (profile_id, friend_id) do nothing;

insert into watch_entries (profile_id, title_id, status, rating, review_text, visibility, updated_at)
values
  ((select id from profiles where slug = 'aarya'), (select id from titles where imdb_id = 'tt9438740'), 'watching', null, null, 'friends', now()),
  ((select id from profiles where slug = 'aarya'), (select id from titles where imdb_id = 'tt8637042'), 'completed', 4.6, 'Kitchen panic cinema disguised as a series. Every scene feels like the timer is about to explode.', 'friends', now() - interval '20 minutes'),
  ((select id from profiles where slug = 'aarya'), (select id from titles where imdb_id = 'tt32086077'), 'completed', 4.4, 'This one sits with you after the credits. Gorgeous restraint, zero wasted beats.', 'friends', now() - interval '3 days'),
  ((select id from profiles where slug = 'ishaan'), (select id from titles where imdb_id = 'tt9714698'), 'watching', null, null, 'friends', now() - interval '30 minutes'),
  ((select id from profiles where slug = 'ishaan'), (select id from titles where imdb_id = 'tt24226474'), 'completed', 4.7, 'Pure speaker-rattling energy. Self-aware, loud, and somehow still emotional.', 'friends', now() - interval '1 hour'),
  ((select id from profiles where slug = 'ishaan'), (select id from titles where imdb_id = 'tt15327088'), 'completed', 4.5, 'Folklore with actual fury. This absolutely deserved the obsession cycle.', 'friends', now() - interval '4 days'),
  ((select id from profiles where slug = 'meher'), (select id from titles where imdb_id = 'tt7983428'), 'watching', null, null, 'friends', now() - interval '2 hours'),
  ((select id from profiles where slug = 'meher'), (select id from titles where imdb_id = 'tt21626284'), 'completed', 4.5, 'A crowd-pleaser with actual tenderness. Hope without cringe, which is rare.', 'friends', now() - interval '4 hours'),
  ((select id from profiles where slug = 'meher'), (select id from titles where imdb_id = 'tt23628262'), 'completed', 4.2, 'Quietly wrecked me. Tiny documentary, huge heart.', 'friends', now() - interval '2 days')
on conflict (profile_id, title_id, status) do update
set rating = excluded.rating,
    review_text = excluded.review_text,
    visibility = excluded.visibility,
    updated_at = excluded.updated_at;

insert into direct_recommendations (from_profile_id, to_profile_id, title_id, note)
values
  ((select id from profiles where slug = 'ishaan'), (select id from profiles where slug = 'aarya'), (select id from titles where imdb_id = 'tt24226474'), 'If you want one huge theatrical swing tonight, this is the move.'),
  ((select id from profiles where slug = 'ishaan'), (select id from profiles where slug = 'aarya'), (select id from titles where imdb_id = 'tt9714698'), 'This scratches the same premium-chaos itch but in sci-fi mode.'),
  ((select id from profiles where slug = 'meher'), (select id from profiles where slug = 'aarya'), (select id from titles where imdb_id = 'tt21626284'), 'Trust me, this is the warm reset watch.'),
  ((select id from profiles where slug = 'meher'), (select id from profiles where slug = 'aarya'), (select id from titles where imdb_id = 'tt23628262'), 'Short, gentle, and worth every minute.')
on conflict (from_profile_id, to_profile_id, title_id) do update
set note = excluded.note;
