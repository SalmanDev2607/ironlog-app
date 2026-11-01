-- ==============================================================================
-- IronLog pgvector Setup: Semantic Vector Search for RAG AI Coach
-- Run this in your Supabase Project: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable the pgvector extension (Free & native in Supabase PostgreSQL)
create extension if not exists vector;

-- 2. Create the knowledge base documents table
create table if not exists public.ironlog_rag_documents (
  id text primary key,
  title text not null,
  category text not null,
  content text not null,
  embedding vector(768), -- 768 dimensions standard for Google Gemini text-embedding-004
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Enable Row-Level Security (RLS)
alter table public.ironlog_rag_documents enable row level security;

-- 4. Create policy: Allow everyone (anonymous & authenticated) to search knowledge chunks
drop policy if exists "Allow public read access to knowledge chunks" on public.ironlog_rag_documents;
create policy "Allow public read access to knowledge chunks"
  on public.ironlog_rag_documents
  for select
  using (true);

-- Allow authenticated users or service role to update/insert chunks
drop policy if exists "Allow auth users to upsert knowledge chunks" on public.ironlog_rag_documents;
create policy "Allow auth users to upsert knowledge chunks"
  on public.ironlog_rag_documents
  for all
  using (auth.uid() is not null);

-- 5. Create the Vector Search RPC function (Cosine Similarity)
create or replace function match_ironlog_documents (
  query_embedding vector(768),
  match_threshold float default 0.40,
  match_count int default 3
)
returns table (
  id text,
  title text,
  category text,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    ironlog_rag_documents.id,
    ironlog_rag_documents.title,
    ironlog_rag_documents.category,
    ironlog_rag_documents.content,
    1 - (ironlog_rag_documents.embedding <=> query_embedding) as similarity
  from ironlog_rag_documents
  where ironlog_rag_documents.embedding is not null
    and 1 - (ironlog_rag_documents.embedding <=> query_embedding) > match_threshold
  order by ironlog_rag_documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 6. Pre-seed the initial core IronLog knowledge base chunks
insert into public.ironlog_rag_documents (id, title, category, content)
values
(
  'progressive_overload',
  'Progressive Overload & Double Progression Algorithm',
  'training',
  'IronLog implements a smart double progression model for progressive overload:
1. Target Rep Brackets: Each movement has an optimal hypertrophy rep target (e.g. 8–10 reps).
2. Weight Increase Threshold: When a lifter reaches the upper ceiling of their target reps on all working sets with strict form, IronLog recommends increasing the load on the next workout.
   • Compound Lifts (Bench Press, Squats, Deadlifts, Overhead Press, Rows): Recommend adding +2.5 kg (+5 lbs).
   • Isolation Lifts (Dumbbell Lateral Raises, Bicep Curls, Tricep Pushdowns, Calf Raises): Recommend adding +1 to 2 kg (+2.5 lbs).
3. Rep Progression: If adding weight is not yet feasible, the app encourages adding repetitions within the target range before increasing resistance.
4. Auto-Preloading: IronLog pre-loads previous session weights so lifters always know the exact benchmark to beat.'
),
(
  'golden_era_ratios',
  'Golden-Era Aesthetic Proportions & Steve Reeves Grecian Ratios',
  'aesthetic',
  'IronLog''s Body model calculates classic Golden-Era bodybuilding targets based on Steve Reeves and John McCallum formulas:
• V-Taper (Chest-to-Waist): The Golden Ratio is 1.618. Target chest circumference is 1.618× your waist circumference.
• Arm Size: Target arm circumference is approximately 2.52 × wrist circumference.
• Classical Symmetry (1:1:1): Calves and Neck circumferences should ideally match your Arm circumference.
• Thighs: Target thigh circumference is approximately 1.75 × knee circumference.
Lifters enter wrist, knee, and tape measurements in the Body tab to calculate their aesthetic rating and 1-month future projections.'
),
(
  'muscle_recovery',
  'Muscle Recovery Tracking & Fatigue Modeling',
  'recovery',
  'IronLog monitors recovery across all 11 primary muscle groups:
• Calculation Method: Every completed workout logs volume (sets × reps) for targeted muscles. Recovery regenerates over 24 to 72 hours based on total volume and muscle size.
• Small Muscles (Biceps, Triceps, Calves, Abs): Recover within 24 to 48 hours.
• Large Muscles (Quads, Hamstrings, Chest, Back): Recover within 48 to 72 hours.
• Color Status on Anatomical Body Map:
  🔴 Red (<40%): High fatigue; active rest advised.
  🟡 Yellow (40–80%): Partial recovery; moderate volume allowable.
  🟢 Green (>80%): Fully recovered and primed for progressive overload.
Users can inspect the front and back anatomical visualizer on the Body tab.'
),
(
  'workout_splits',
  '15 Workout Splits & Custom Daily Routines',
  'splits',
  'IronLog includes 15 built-in workout routines:
1. Push-Pull-Legs (PPL 6-Day): The default hypertrophy split rotating Push A, Pull A, Legs A, Push B, Pull B, Legs B, and Sunday Rest.
2. Upper / Lower Split (4-Day): Balances volume with extra recovery days.
3. Arnold Split (6-Day): Classic split pairing Chest & Back on Day 1, Shoulders & Arms on Day 2, and Legs on Day 3.
4. Full Body (3-Day): Optimal for beginners or time-constrained schedules.
Lifters can swap exercises, reorder movements, or use the "Override Split" button on the Today tab to switch routines on any day.'
),
(
  'exercise_library',
  '82-Exercise Library & Muscle Group Targets',
  'exercises',
  'IronLog comes with 82 pre-programmed hypertrophy movements across 11 muscle groups:
• Chest: Flat Dumbbell Bench Press, Incline Barbell Press, Cable Chest Fly, Dips.
• Back / Lats: Barbell Bent-Over Row, Lat Pulldown, Seated Cable Row, Pull-Ups.
• Shoulders: Overhead Barbell Press, Dumbbell Lateral Raise, Cable Face Pull, Rear Delt Fly.
• Biceps & Triceps: Incline Dumbbell Curl, Hammer Curl, Skull Crushers, Cable Rope Pushdown.
• Legs (Quads, Hamstrings, Glutes, Calves): Barbell Back Squat, Romanian Deadlift (RDL), Leg Press, Bulgarian Split Squat, Standing Calf Raise.
• Abs: Hanging Leg Raise, Cable Woodchoppers, Ab Wheel Rollouts.
Users can create unlimited custom exercises via the Exercises tab.'
),
(
  'active_workout_logging',
  'Active Workout Logging & Check-In Protocol',
  'logging',
  'How to log training sessions in IronLog:
1. Navigate to the Today tab and tap "Start Workout" or "Check In".
2. Enter the working Weight and Reps for each set.
3. Tap the Checkmark (✓) button to mark the set complete. This immediately activates the Rest Timer.
4. If you need to substitute an exercise, tap "Swap" to pick another movement for that muscle group.
5. Tap "Finish Workout" when complete. The session is saved to local history and scheduled for debounced cloud backup.'
),
(
  'rest_timer_chime',
  'Rest Timer, Web Audio Harmonic Chime & Mobile Haptics',
  'timer',
  'IronLog includes an integrated rest timer:
• Auto-Start: Automatically triggers as soon as any set is marked complete (✓).
• Web Audio Synthesis: Rather than streaming MP3s, IronLog synthesizes a resonant harmonic chime directly via the browser''s Web Audio API. Works 100% offline.
• Tactile Haptics: Triggers a double-pulse vibration on supported mobile devices when rest expires.
• Floating Rest Bar: Provides quick +/-15s and +30s buttons, pause, and dismiss.
• Duration: Default is 90 seconds, customizable in Settings.'
),
(
  'cloud_sync_offline',
  'Offline-First Architecture & Supabase Cloud Sync',
  'sync',
  'IronLog''s offline-first architecture:
• Local Storage: All workouts and weights are saved instantly to localStorage (''il''). You never lose workout data due to poor gym reception.
• Debounced Sync: 1.5 seconds after saving, changes automatically sync to Supabase PostgreSQL (''user_data'' table).
• Non-Destructive Union Merge: Workout sessions and weights are merged by date and unique timestamp keys, ensuring multi-device synchronization never overwrites logs.
• Guest Mode vs Account: Full offline browsing in Guest Mode; signing in with Google or Email activates cloud backup.'
),
(
  'units_and_settings',
  'Units, Themes & Data Export / Import',
  'settings',
  'IronLog settings and data control:
• Units: Switch between Kilograms (kg) and Pounds (lbs), and Centimeters (cm) and Inches (in) in Settings.
• Themes: Dark Theme, Light Theme, and System Automatic.
• Data Portability: Export full JSON backups, import JSON backups, or export a CSV spreadsheet of completed workouts.'
)
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  content = excluded.content,
  updated_at = timezone('utc'::text, now());

