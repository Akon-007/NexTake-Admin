-- =====================================================================
-- NexTake — reference data
-- Run AFTER 0001_nextake_admin.sql.
-- =====================================================================

-- Tracked companies / operators surfaced in "Related companies".
insert into public.companies (name, sector, website_url) values
  ('Nvidia', 'Accelerated computing', 'https://www.nvidia.com'),
  ('OpenAI', 'AI research', 'https://openai.com'),
  ('Flutterwave', 'Payments', 'https://flutterwave.com'),
  ('Paystack', 'Payments', 'https://paystack.com'),
  ('Anduril', 'Defence robotics', 'https://www.anduril.com'),
  ('Boston Dynamics', 'Robotics', 'https://www.bostondynamics.com'),
  ('Okta', 'Identity', 'https://www.okta.com'),
  ('Cloudflare', 'Cloud & network', 'https://www.cloudflare.com')
on conflict (name) do nothing;

-- Site copy (single row, id = 1).
update public.site_settings set
  site_name = 'NexTake',
  slogan = 'TECHNOLOGY NEWS. INTELLIGENTLY CURATED.',
  hero_headline = 'The signal in technology news.',
  hero_subhead = 'Every story summarised in three sentences, attributed to the source that broke it.',
  nav_links = '[
    {"label": "Feed Wire", "href": "#feed"},
    {"label": "Shorts", "href": "#shorts"},
    {"label": "Explore", "href": "#explore"},
    {"label": "Contact Us", "href": "#contact"}
  ]'::jsonb,
  newsletter_headline = 'Get The Daily Edit in your inbox',
  contact_email = 'nextakeafrica@gmail.com',
  updated_at = now()
where id = 1;

-- =====================================================================
-- Creating the first administrator
-- =====================================================================
-- 1. Supabase Dashboard → Authentication → Users → "Add user"
--    (set the email + password; Supabase hashes it — never store it here)
-- 2. Confirm the user (or let the confirmation email do it)
-- 3. Run the line below in the SQL editor:
--
--      select public.promote_admin('editor@nextake.africa');
--
-- The console then requires: password → emailed 6-digit code → dashboard.
