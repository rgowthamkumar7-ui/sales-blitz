-- ================================================================
-- DATA INTEGRITY CHECK & FIX SCRIPT
-- Run this in Supabase SQL Editor to verify and fix data
-- ================================================================

-- 1. SUMMARY COUNTS
-- Check if tables are populated
SELECT 'Distributors' as table_name, count(*) as count FROM distributors
UNION ALL
SELECT 'Users (Total)', count(*) FROM users
UNION ALL
SELECT 'Managers', count(*) FROM users WHERE role = 'manager'
UNION ALL
SELECT 'Team Leaders', count(*) FROM users WHERE role = 'team_leader'
UNION ALL
SELECT 'Salesmen', count(*) FROM users WHERE role = 'salesman'
UNION ALL
SELECT 'Manager-Distributor Mappings', count(*) FROM manager_distributors
UNION ALL
SELECT 'SKUs', count(*) FROM skus
UNION ALL
SELECT 'Outlets', count(*) FROM outlets;

-- 2. MISSING RELATIONSHIPS CHECK

-- Check Distributors without assigned AE (Manager)
SELECT 'Distributors without AE' as issue, wd_code, name 
FROM distributors 
WHERE ae_id IS NULL;

-- Check Managers (AEs) without assigned Distributors
SELECT 'AEs without Distributors' as issue, name 
FROM users 
WHERE role = 'manager' AND manager_level = 'AE'
AND id NOT IN (SELECT manager_id FROM manager_distributors);

-- Check Team Leaders without Distributor
SELECT 'TLs without Distributor' as issue, name 
FROM users 
WHERE role = 'team_leader' AND distributor_id IS NULL;

-- Check Salesmen without Team Leader
SELECT 'Salesmen without TL' as issue, name 
FROM users 
WHERE role = 'salesman' AND team_leader_id IS NULL;

-- 3. FIX DATA (RUN THIS IF COUNTS ARE LOW OR ZERO)

-- Re-run Manager-Distributor Mappings (Safe to run multiple times, ignores duplicates)
DO $$
DECLARE
  mgr_navin UUID;
  mgr_gaus UUID;
  mgr_sachin UUID;
  mgr_raghavendra UUID;
  mgr_shreyas UUID;
  wd_0001 UUID;
  wd_0002 UUID;
  wd_0003 UUID;
  wd_0004 UUID;
  wd_0005 UUID;
  wd_0006 UUID;
  wd_0007 UUID;
  wd_0008 UUID;
BEGIN
  -- Get manager IDs
  SELECT id INTO mgr_navin FROM users WHERE name = 'Navin Mandhare' AND role = 'manager';
  SELECT id INTO mgr_gaus FROM users WHERE name = 'Gaus' AND role = 'manager';
  SELECT id INTO mgr_sachin FROM users WHERE name = 'Sachin Devadiga' AND role = 'manager';
  SELECT id INTO mgr_raghavendra FROM users WHERE name = 'Raghavendra' AND role = 'manager';
  SELECT id INTO mgr_shreyas FROM users WHERE name = 'Shreyas Prabhu' AND role = 'manager';

  -- Get distributor IDs
  SELECT id INTO wd_0001 FROM distributors WHERE wd_code = 'MU3680';
  SELECT id INTO wd_0002 FROM distributors WHERE wd_code = 'MU3786';
  SELECT id INTO wd_0003 FROM distributors WHERE wd_code = 'MU3800';
  SELECT id INTO wd_0004 FROM distributors WHERE wd_code = 'MU3666';
  SELECT id INTO wd_0005 FROM distributors WHERE wd_code = 'MU3695';
  SELECT id INTO wd_0006 FROM distributors WHERE wd_code = 'MU3765';
  SELECT id INTO wd_0007 FROM distributors WHERE wd_code = 'MU3612';
  SELECT id INTO wd_0008 FROM distributors WHERE wd_code = 'MU3713';

  -- Insert mappings if they don't exist
  -- Navin -> MU3680, MU3786
  IF mgr_navin IS NOT NULL AND wd_0001 IS NOT NULL THEN
    INSERT INTO manager_distributors (manager_id, distributor_id) 
    VALUES (mgr_navin, wd_0001) ON CONFLICT DO NOTHING;
  END IF;
  
  IF mgr_navin IS NOT NULL AND wd_0002 IS NOT NULL THEN
    INSERT INTO manager_distributors (manager_id, distributor_id) 
    VALUES (mgr_navin, wd_0002) ON CONFLICT DO NOTHING;
  END IF;

  -- Gaus -> MU3800
  IF mgr_gaus IS NOT NULL AND wd_0003 IS NOT NULL THEN
    INSERT INTO manager_distributors (manager_id, distributor_id) 
    VALUES (mgr_gaus, wd_0003) ON CONFLICT DO NOTHING;
  END IF;

  -- Sachin -> MU3666, MU3695
  IF mgr_sachin IS NOT NULL AND wd_0004 IS NOT NULL THEN
    INSERT INTO manager_distributors (manager_id, distributor_id) 
    VALUES (mgr_sachin, wd_0004) ON CONFLICT DO NOTHING;
  END IF;

  IF mgr_sachin IS NOT NULL AND wd_0005 IS NOT NULL THEN
    INSERT INTO manager_distributors (manager_id, distributor_id) 
    VALUES (mgr_sachin, wd_0005) ON CONFLICT DO NOTHING;
  END IF;

  -- Raghavendra -> MU3765
  IF mgr_raghavendra IS NOT NULL AND wd_0006 IS NOT NULL THEN
    INSERT INTO manager_distributors (manager_id, distributor_id) 
    VALUES (mgr_raghavendra, wd_0006) ON CONFLICT DO NOTHING;
  END IF;

  -- Shreyas -> MU3612, MU3713
  IF mgr_shreyas IS NOT NULL AND wd_0007 IS NOT NULL THEN
    INSERT INTO manager_distributors (manager_id, distributor_id) 
    VALUES (mgr_shreyas, wd_0007) ON CONFLICT DO NOTHING;
  END IF;

  IF mgr_shreyas IS NOT NULL AND wd_0008 IS NOT NULL THEN
    INSERT INTO manager_distributors (manager_id, distributor_id) 
    VALUES (mgr_shreyas, wd_0008) ON CONFLICT DO NOTHING;
  END IF;

  -- Update Distributor AE references
  UPDATE distributors SET ae_id = mgr_navin WHERE wd_code IN ('MU3680', 'MU3786') AND ae_id IS NULL;
  UPDATE distributors SET ae_id = mgr_gaus WHERE wd_code = 'MU3800' AND ae_id IS NULL;
  UPDATE distributors SET ae_id = mgr_sachin WHERE wd_code IN ('MU3666', 'MU3695') AND ae_id IS NULL;
  UPDATE distributors SET ae_id = mgr_raghavendra WHERE wd_code = 'MU3765' AND ae_id IS NULL;
  UPDATE distributors SET ae_id = mgr_shreyas WHERE wd_code IN ('MU3612', 'MU3713') AND ae_id IS NULL;

END $$;
