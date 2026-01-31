-- ============================================
-- SALES BLITZ DATA MIGRATION
-- Run this AFTER schema.sql
-- ============================================

-- ============================================
-- INSERT DISTRIBUTORS
-- ============================================
INSERT INTO distributors (wd_code, name, section) VALUES
('MU3680', 'Shivam Impex', 'MUU001'),
('MU3786', 'Prime Enterprises', 'MUU001'),
('MU3800', 'Shree Siddhanath Marketing', 'MUU001'),
('MU3666', 'Sahil Enterprises', 'MUU003'),
('MU3695', 'Kranti Mercantile Pvt. Ltd.', 'MUU003'),
('MU3765', 'PARSHVANATH TRADEZONE LLP', 'MUU003'),
('MU3612', 'Sai Enterprises', 'MUU004'),
('MU3713', 'Ambika Traders', 'MUU004');

-- ============================================
-- INSERT SKUS (Products)
-- ============================================
INSERT INTO skus (name, image_url, points_per_unit, is_active) VALUES
('American Club', '/Images/American Club Lit.png', 5, true),
('Classic Clove', '/Images/Classic Clove.png', 10, true),
('Neo Smart', 'https://placehold.co/100x100/6366f1/white?text=SKU', 8, true),
('Special Mint', 'https://placehold.co/100x100/6366f1/white?text=SKU', 7, true),
('Super Star', 'https://placehold.co/100x100/6366f1/white?text=SKU', 12, true);

-- ============================================
-- INSERT MANAGERS
-- ============================================
INSERT INTO users (name, role, manager_level) VALUES
('Gowtham Kumar', 'manager', 'AM2'),
('Pankaj Sonawane', 'manager', 'AM1'),
('Navin Mandhare', 'manager', 'AE'),
('Gaus', 'manager', 'AE'),
('Sachin Devadiga', 'manager', 'AE'),
('Raghavendra', 'manager', 'AE'),
('Shreyas Prabhu', 'manager', 'AE');

-- ============================================
-- INSERT TEAM LEADERS (need distributor IDs first)
-- ============================================
DO $$
DECLARE
  wd_0001 UUID;
  wd_0002 UUID;
  wd_0003 UUID;
  wd_0004 UUID;
  wd_0005 UUID;
  wd_0006 UUID;
  wd_0007 UUID;
  wd_0008 UUID;
BEGIN
  -- Get distributor IDs
  SELECT id INTO wd_0001 FROM distributors WHERE wd_code = 'MU3680';
  SELECT id INTO wd_0002 FROM distributors WHERE wd_code = 'MU3786';
  SELECT id INTO wd_0003 FROM distributors WHERE wd_code = 'MU3800';
  SELECT id INTO wd_0004 FROM distributors WHERE wd_code = 'MU3666';
  SELECT id INTO wd_0005 FROM distributors WHERE wd_code = 'MU3695';
  SELECT id INTO wd_0006 FROM distributors WHERE wd_code = 'MU3765';
  SELECT id INTO wd_0007 FROM distributors WHERE wd_code = 'MU3612';
  SELECT id INTO wd_0008 FROM distributors WHERE wd_code = 'MU3713';

  -- Insert Team Leaders
  INSERT INTO users (name, role, distributor_id) VALUES
  ('DILIP_MU3680', 'team_leader', wd_0001),
  ('SHAILENDRA GUPTA', 'team_leader', wd_0001),
  ('ABBAS', 'team_leader', wd_0002),
  ('PRAVEEN_MU3573', 'team_leader', wd_0002),
  ('UMASHANKAR SINGH', 'team_leader', wd_0002),
  ('395 ASLAM', 'team_leader', wd_0003),
  ('96 NAZIR(OPL) 1', 'team_leader', wd_0003),
  ('IMRAN', 'team_leader', wd_0003),
  ('SANTOSH PRADHAN', 'team_leader', wd_0004),
  ('VIJAY GAMRE', 'team_leader', wd_0004),
  ('AWDESH SHUKLA', 'team_leader', wd_0005),
  ('FAROOK 1 (VMC)', 'team_leader', wd_0005),
  ('RAHUL KUSHWAHA', 'team_leader', wd_0005),
  ('RAJESH', 'team_leader', wd_0005),
  ('BAVISKAR_MU3714', 'team_leader', wd_0006),
  ('NAMEER_MU3714', 'team_leader', wd_0006),
  ('PRAKASH_MU3714', 'team_leader', wd_0006),
  ('VIRENDRA', 'team_leader', wd_0007),
  ('SHANKAR KRISHNA SHARMA', 'team_leader', wd_0004),
  ('JAIPRAKASH JAISWAL', 'team_leader', wd_0005),
  ('AJAY', 'team_leader', wd_0008),
  ('DHARMENDRA_MU3713', 'team_leader', wd_0008);
END $$;

-- ============================================
-- INSERT SALESMEN (need TL and distributor IDs)
-- ============================================
DO $$
DECLARE
  wd_0001 UUID;
  wd_0002 UUID;
  wd_0003 UUID;
  wd_0004 UUID;
  wd_0005 UUID;
  wd_0006 UUID;
  wd_0007 UUID;
  wd_0008 UUID;
  tl_0001 UUID;
  tl_0002 UUID;
  tl_0003 UUID;
  tl_0004 UUID;
  tl_0005 UUID;
  tl_0006 UUID;
  tl_0007 UUID;
  tl_0008 UUID;
  tl_0009 UUID;
  tl_0010 UUID;
  tl_0011 UUID;
  tl_0012 UUID;
  tl_0015 UUID;
  tl_0018 UUID;
  tl_0021 UUID;
  tl_0022 UUID;
BEGIN
  -- Get distributor IDs
  SELECT id INTO wd_0001 FROM distributors WHERE wd_code = 'MU3680';
  SELECT id INTO wd_0002 FROM distributors WHERE wd_code = 'MU3786';
  SELECT id INTO wd_0003 FROM distributors WHERE wd_code = 'MU3800';
  SELECT id INTO wd_0004 FROM distributors WHERE wd_code = 'MU3666';
  SELECT id INTO wd_0005 FROM distributors WHERE wd_code = 'MU3695';
  SELECT id INTO wd_0006 FROM distributors WHERE wd_code = 'MU3765';
  SELECT id INTO wd_0007 FROM distributors WHERE wd_code = 'MU3612';
  SELECT id INTO wd_0008 FROM distributors WHERE wd_code = 'MU3713';

  -- Get team leader IDs
  SELECT id INTO tl_0001 FROM users WHERE name = 'DILIP_MU3680' AND role = 'team_leader';
  SELECT id INTO tl_0002 FROM users WHERE name = 'SHAILENDRA GUPTA' AND role = 'team_leader';
  SELECT id INTO tl_0003 FROM users WHERE name = 'ABBAS' AND role = 'team_leader';
  SELECT id INTO tl_0004 FROM users WHERE name = 'PRAVEEN_MU3573' AND role = 'team_leader';
  SELECT id INTO tl_0005 FROM users WHERE name = 'UMASHANKAR SINGH' AND role = 'team_leader';
  SELECT id INTO tl_0006 FROM users WHERE name = '395 ASLAM' AND role = 'team_leader';
  SELECT id INTO tl_0007 FROM users WHERE name = '96 NAZIR(OPL) 1' AND role = 'team_leader';
  SELECT id INTO tl_0008 FROM users WHERE name = 'IMRAN' AND role = 'team_leader';
  SELECT id INTO tl_0009 FROM users WHERE name = 'SANTOSH PRADHAN' AND role = 'team_leader';
  SELECT id INTO tl_0010 FROM users WHERE name = 'VIJAY GAMRE' AND role = 'team_leader';
  SELECT id INTO tl_0011 FROM users WHERE name = 'AWDESH SHUKLA' AND role = 'team_leader';
  SELECT id INTO tl_0012 FROM users WHERE name = 'FAROOK 1 (VMC)' AND role = 'team_leader';
  SELECT id INTO tl_0015 FROM users WHERE name = 'BAVISKAR_MU3714' AND role = 'team_leader';
  SELECT id INTO tl_0018 FROM users WHERE name = 'VIRENDRA' AND role = 'team_leader';
  SELECT id INTO tl_0021 FROM users WHERE name = 'AJAY' AND role = 'team_leader';
  SELECT id INTO tl_0022 FROM users WHERE name = 'DHARMENDRA_MU3713' AND role = 'team_leader';

  -- Insert Salesmen for TL-0001 (DILIP_MU3680)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('ALTAF', 'salesman', tl_0001, wd_0001, 22),
  ('GHANSHYAM GUPTA', 'salesman', tl_0001, wd_0001, 31),
  ('HANUMAN GUPTA', 'salesman', tl_0001, wd_0001, 32),
  ('RAJENDRA DUBEY', 'salesman', tl_0001, wd_0001, 41),
  ('RAKESH YADAV', 'salesman', tl_0001, wd_0001, 21),
  ('SWD', 'salesman', tl_0001, wd_0001, 41),
  ('VINOD GUPTA', 'salesman', tl_0001, wd_0001, 40);

  -- Insert Salesmen for TL-0002 (SHAILENDRA GUPTA)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('A.K.GUPTA', 'salesman', tl_0002, wd_0001, 36),
  ('MUKESH GUPTA', 'salesman', tl_0002, wd_0001, 55),
  ('OMPRAKASH', 'salesman', tl_0002, wd_0001, 63),
  ('RUPENDRA', 'salesman', tl_0002, wd_0001, 38),
  ('SANTOSH JAISWAL', 'salesman', tl_0002, wd_0001, 68),
  ('SIYARAM', 'salesman', tl_0002, wd_0001, 53),
  ('VIRENDRA', 'salesman', tl_0002, wd_0001, 27);

  -- Insert Salesmen for TL-0003 (ABBAS)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('BM YADAV', 'salesman', tl_0003, wd_0002, 24),
  ('MUNNALAL 2', 'salesman', tl_0003, wd_0002, 28),
  ('RAHUL GUPTA', 'salesman', tl_0003, wd_0002, 45),
  ('SAROJ', 'salesman', tl_0003, wd_0002, 34),
  ('SHIVKUMAR', 'salesman', tl_0003, wd_0002, 42),
  ('SHUBHAM', 'salesman', tl_0003, wd_0002, 45),
  ('SUMIT', 'salesman', tl_0003, wd_0002, 56);

  -- Insert Salesmen for TL-0004 (PRAVEEN_MU3573)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('ALOK', 'salesman', tl_0004, wd_0002, 47),
  ('BASANT', 'salesman', tl_0004, wd_0002, 38),
  ('PRAKASH', 'salesman', tl_0004, wd_0002, 43),
  ('S.K GUPTA', 'salesman', tl_0004, wd_0002, 36),
  ('SURESH GONGE', 'salesman', tl_0004, wd_0002, 56),
  ('VIJAY GUPTA', 'salesman', tl_0004, wd_0002, 43);

  -- Insert Salesmen for TL-0005 (UMASHANKAR SINGH)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('ANIL', 'salesman', tl_0005, wd_0002, 41),
  ('KAMLA', 'salesman', tl_0005, wd_0002, 37),
  ('KB GUPTA', 'salesman', tl_0005, wd_0002, 43),
  ('PINTOO GUPTA', 'salesman', tl_0005, wd_0002, 49),
  ('PRADEEP JAISWAL', 'salesman', tl_0005, wd_0002, 37),
  ('SHEESHNATH', 'salesman', tl_0005, wd_0002, 65),
  ('SP CHOUDARY', 'salesman', tl_0005, wd_0002, 54);

  -- Insert Salesmen for TL-0006 (395 ASLAM)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('AJAY GUPTA', 'salesman', tl_0006, wd_0003, 40),
  ('ARUN JAISWAL', 'salesman', tl_0006, wd_0003, 53),
  ('DILIP AGARWAL', 'salesman', tl_0006, wd_0003, 68),
  ('JAYPRAKASH', 'salesman', tl_0006, wd_0003, 51),
  ('KATYA (OPL)', 'salesman', tl_0006, wd_0003, 55),
  ('OM PRAKASH 1', 'salesman', tl_0006, wd_0003, 46);

  -- Insert Salesmen for TL-0007 (96 NAZIR(OPL) 1)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('GUDDU', 'salesman', tl_0007, wd_0003, 67),
  ('KAMLA 1', 'salesman', tl_0007, wd_0003, 41),
  ('KUMAR', 'salesman', tl_0007, wd_0003, 62),
  ('PATIL', 'salesman', tl_0007, wd_0003, 21),
  ('SHYAMLAL', 'salesman', tl_0007, wd_0003, 24);

  -- Insert Salesmen for TL-0008 (IMRAN)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('DHIRAJ KASHYAP (OPL)', 'salesman', tl_0008, wd_0003, 49),
  ('PRASHANT 2', 'salesman', tl_0008, wd_0003, 38),
  ('RAMASHANKAR', 'salesman', tl_0008, wd_0003, 67),
  ('SHAILENDRA', 'salesman', tl_0008, wd_0003, 68),
  ('SURESH KANT KASHYUP', 'salesman', tl_0008, wd_0003, 37);

  -- Insert Salesmen for TL-0009 (SANTOSH PRADHAN)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('AWDESH', 'salesman', tl_0009, wd_0004, 61),
  ('DINESH GUPTA', 'salesman', tl_0009, wd_0004, 33),
  ('PRAMOD GUPTA', 'salesman', tl_0009, wd_0004, 59),
  ('RAMJI', 'salesman', tl_0009, wd_0004, 37),
  ('SUNIL GUPTA', 'salesman', tl_0009, wd_0004, 40),
  ('UMASHANKAR', 'salesman', tl_0009, wd_0004, 38);

  -- Insert Salesmen for TL-0010 (VIJAY GAMRE)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('ARUN GUPTA', 'salesman', tl_0010, wd_0004, 68),
  ('DAYASHANKAR', 'salesman', tl_0010, wd_0004, 34),
  ('SANTOSH GUPTA', 'salesman', tl_0010, wd_0004, 21),
  ('SATYAPRAKASH', 'salesman', tl_0010, wd_0004, 26),
  ('SUGREW', 'salesman', tl_0010, wd_0004, 50);

  -- Insert Salesmen for TL-0011 (AWDESH SHUKLA)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('AMIR', 'salesman', tl_0011, wd_0005, 24),
  ('ANIL KUMAR', 'salesman', tl_0011, wd_0005, 34),
  ('IRFAN AHMED ISAQ ATTAR', 'salesman', tl_0011, wd_0005, 51),
  ('SHAKIL', 'salesman', tl_0011, wd_0005, 40);

  -- Insert Salesmen for TL-0012 (FAROOK 1 VMC)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('ABDUL REHMAN', 'salesman', tl_0012, wd_0005, 36),
  ('AJAY 1', 'salesman', tl_0012, wd_0005, 45),
  ('SANJAY SHARMA', 'salesman', tl_0012, wd_0005, 38);

  -- Insert Salesmen for TL-0015 (BAVISKAR)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('BALIRAM', 'salesman', tl_0015, wd_0006, 42),
  ('GANESH', 'salesman', tl_0015, wd_0006, 55),
  ('HEMANT', 'salesman', tl_0015, wd_0006, 48);

  -- Insert Salesmen for TL-0018 (VIRENDRA)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('ASHOK', 'salesman', tl_0018, wd_0007, 33),
  ('DEVENDRA', 'salesman', tl_0018, wd_0007, 44),
  ('MANOJ', 'salesman', tl_0018, wd_0007, 39);

  -- Insert Salesmen for TL-0021 (AJAY)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('BHARAT', 'salesman', tl_0021, wd_0008, 29),
  ('CHANDAN', 'salesman', tl_0021, wd_0008, 47),
  ('DEEPAK', 'salesman', tl_0021, wd_0008, 52);

  -- Insert Salesmen for TL-0022 (DHARMENDRA)
  INSERT INTO users (name, role, team_leader_id, distributor_id, total_mapped_outlets) VALUES
  ('FIROZ', 'salesman', tl_0022, wd_0008, 35),
  ('GOVIND', 'salesman', tl_0022, wd_0008, 41),
  ('HARISH', 'salesman', tl_0022, wd_0008, 58);
END $$;

-- ============================================
-- SET UP MANAGER-DISTRIBUTOR MAPPINGS
-- ============================================
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

  -- Navin Mandhare -> MU3680, MU3786
  INSERT INTO manager_distributors (manager_id, distributor_id) VALUES
  (mgr_navin, wd_0001),
  (mgr_navin, wd_0002);

  -- Gaus -> MU3800
  INSERT INTO manager_distributors (manager_id, distributor_id) VALUES
  (mgr_gaus, wd_0003);

  -- Sachin Devadiga -> MU3666, MU3695
  INSERT INTO manager_distributors (manager_id, distributor_id) VALUES
  (mgr_sachin, wd_0004),
  (mgr_sachin, wd_0005);

  -- Raghavendra -> MU3765
  INSERT INTO manager_distributors (manager_id, distributor_id) VALUES
  (mgr_raghavendra, wd_0006);

  -- Shreyas Prabhu -> MU3612, MU3713
  INSERT INTO manager_distributors (manager_id, distributor_id) VALUES
  (mgr_shreyas, wd_0007),
  (mgr_shreyas, wd_0008);

  -- Update distributor ae_id references
  UPDATE distributors SET ae_id = mgr_navin WHERE wd_code IN ('MU3680', 'MU3786');
  UPDATE distributors SET ae_id = mgr_gaus WHERE wd_code = 'MU3800';
  UPDATE distributors SET ae_id = mgr_sachin WHERE wd_code IN ('MU3666', 'MU3695');
  UPDATE distributors SET ae_id = mgr_raghavendra WHERE wd_code = 'MU3765';
  UPDATE distributors SET ae_id = mgr_shreyas WHERE wd_code IN ('MU3612', 'MU3713');
END $$;

-- ============================================
-- INSERT OUTLETS (sample)
-- ============================================
INSERT INTO outlets (name, address, area) VALUES
('Krishna General Store', '123 Main Road', 'Sector 15'),
('Lakshmi Supermart', '456 Market Street', 'Gandhi Nagar'),
('Sharma Kirana', '789 Temple Road', 'Old City'),
('Modern Mart', '321 Ring Road', 'New Colony'),
('City Provisions', '654 Station Road', 'Railway Area'),
('Quick Stop', '987 Highway Junction', 'Bypass Road');

-- ============================================
-- INSERT FOCUS PRODUCTS
-- ============================================
DO $$
DECLARE
  sku_american UUID;
  sku_classic UUID;
  sku_neo UUID;
  sku_mint UUID;
  sku_star UUID;
BEGIN
  SELECT id INTO sku_american FROM skus WHERE name = 'American Club';
  SELECT id INTO sku_classic FROM skus WHERE name = 'Classic Clove';
  SELECT id INTO sku_neo FROM skus WHERE name = 'Neo Smart';
  SELECT id INTO sku_mint FROM skus WHERE name = 'Special Mint';
  SELECT id INTO sku_star FROM skus WHERE name = 'Super Star';

  INSERT INTO focus_products (sku_id, name, reward_per_unit, color, is_active) VALUES
  (sku_american, 'American Club', 5, 'from-blue-500 to-cyan-500', true),
  (sku_classic, 'Classic Clove', 10, 'from-amber-500 to-orange-500', true),
  (sku_neo, 'Neo Smart', 8, 'from-purple-500 to-pink-500', true),
  (sku_mint, 'Special Mint', 7, 'from-green-500 to-emerald-500', true),
  (sku_star, 'Super Star', 12, 'from-yellow-500 to-red-500', true);
END $$;

-- Show summary
SELECT 'Migration complete!' as status;
SELECT 'Distributors: ' || COUNT(*) FROM distributors;
SELECT 'Users: ' || COUNT(*) FROM users;
SELECT 'Managers: ' || COUNT(*) FROM users WHERE role = 'manager';
SELECT 'Team Leaders: ' || COUNT(*) FROM users WHERE role = 'team_leader';
SELECT 'Salesmen: ' || COUNT(*) FROM users WHERE role = 'salesman';
SELECT 'SKUs: ' || COUNT(*) FROM skus;
SELECT 'Focus Products: ' || COUNT(*) FROM focus_products;
SELECT 'Outlets: ' || COUNT(*) FROM outlets;
