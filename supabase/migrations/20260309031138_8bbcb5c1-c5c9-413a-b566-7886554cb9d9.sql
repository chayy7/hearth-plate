
-- Just ensure the functions exist (they were created above but migration failed on the ALTER)
-- Re-run without the ALTER PUBLICATION since orders is already in realtime
SELECT 1;
