-- ======================================================
-- LYCÉE QUALIFIANT TAMANSOURTE - UNIFIED SCHEMA
-- ======================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Cleanup (drop old triggers, functions, notification tables if they exist)
DROP TRIGGER IF EXISTS tr_notify_security_app ON security_team_applicants;
DROP TRIGGER IF EXISTS tr_update_section_score ON competition_scores;
DROP FUNCTION IF EXISTS fn_notify_admins_of_security_app() CASCADE;
DROP FUNCTION IF EXISTS fn_safe_insert_user_notification(uuid, text, text, text, text, text, text, text, uuid, text) CASCADE;
DROP TABLE IF EXISTS user_notifications CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- 3. Users table + constraints + base admin insert
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  class_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure correct columns and constraints
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='class') THEN
    ALTER TABLE users RENAME COLUMN class TO class_name;
  END IF;
  
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
  UPDATE users SET role = 'super_admin' WHERE role = 'super-admin';
  ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'admin', 'super_admin'));
END $$;

-- 4. Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  seen_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tools table
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Requests table
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered')),
  reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Competition sections table
CREATE TABLE IF NOT EXISTS competition_sections (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    total_score INTEGER DEFAULT 0,
    best_student_name TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Competition scores table
CREATE TABLE IF NOT EXISTS competition_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    section_id INT NOT NULL REFERENCES competition_sections(id) ON DELETE CASCADE,
    points INTEGER NOT NULL DEFAULT 0,
    reason TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Trigger function fn_update_section_score + trigger tr_update_section_score
CREATE OR REPLACE FUNCTION fn_update_section_score()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE competition_sections SET total_score = total_score + NEW.points, updated_at = now() WHERE id = NEW.section_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE competition_sections SET total_score = total_score - OLD.points, updated_at = now() WHERE id = OLD.section_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE competition_sections SET total_score = total_score - OLD.points + NEW.points, updated_at = now() WHERE id = NEW.section_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_update_section_score 
AFTER INSERT OR UPDATE OR DELETE ON competition_scores 
FOR EACH ROW EXECUTE FUNCTION fn_update_section_score();

-- 10. security_team_applicants table
DROP TABLE IF EXISTS security_team_applicants CASCADE;
CREATE TABLE security_team_applicants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  instagram_link text NOT NULL,
  technical_skill text NOT NULL,
  gender text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- 11. RLS and GRANTS section
-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE tools DISABLE ROW LEVEL SECURITY;
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE competition_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE competition_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE security_team_applicants DISABLE ROW LEVEL SECURITY;

-- Grant ALL on all tables to anon and authenticated
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON announcements TO anon, authenticated;
GRANT ALL ON tools TO anon, authenticated;
GRANT ALL ON requests TO anon, authenticated;
GRANT ALL ON competition_sections TO anon, authenticated;
GRANT ALL ON competition_scores TO anon, authenticated;
GRANT ALL ON security_team_applicants TO anon, authenticated;

-- Grant usage on all sequences (needed for SERIAL columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
