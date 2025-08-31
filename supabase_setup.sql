-- SmartProctor-X Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable Row Level Security (RLS) on all tables
-- This is important for security but requires proper policies

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('student', 'proctor', 'admin')) NOT NULL DEFAULT 'student',
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create proctor_sessions table
CREATE TABLE IF NOT EXISTS proctor_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  level INTEGER CHECK (level >= 1 AND level <= 5) NOT NULL DEFAULT 1,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('active', 'completed', 'terminated')) NOT NULL DEFAULT 'active',
  suspicion_score INTEGER CHECK (suspicion_score >= 0 AND suspicion_score <= 100) DEFAULT 0,
  violations INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create violations table
CREATE TABLE IF NOT EXISTS violations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES proctor_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL DEFAULT 'low',
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  screenshot_url TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_proctor_sessions_user_id ON proctor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_proctor_sessions_status ON proctor_sessions(status);
CREATE INDEX IF NOT EXISTS idx_violations_session_id ON violations(session_id);
CREATE INDEX IF NOT EXISTS idx_violations_timestamp ON violations(timestamp);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can create a profile" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- Create policies for proctor_sessions
CREATE POLICY "Users can view their own sessions" ON proctor_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" ON proctor_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON proctor_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for violations
CREATE POLICY "Users can view violations from their sessions" ON violations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM proctor_sessions
      WHERE proctor_sessions.id = violations.session_id
      AND proctor_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create violations" ON violations
  FOR INSERT WITH CHECK (true);

-- Create storage bucket for screenshots/recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('proctoring-data', 'proctoring-data', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy
CREATE POLICY "Users can upload to their session folder" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'proctoring-data' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view files from their sessions" ON storage.objects
  FOR SELECT USING (bucket_id = 'proctoring-data' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proctor_sessions_updated_at
    BEFORE UPDATE ON proctor_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
-- You can remove this section if you don't want sample data
INSERT INTO user_profiles (email, role, display_name) VALUES
  ('admin@smartproctor.com', 'admin', 'System Administrator'),
  ('proctor@smartproctor.com', 'proctor', 'Senior Proctor'),
  ('demo@smartproctor.com', 'student', 'Demo User')
ON CONFLICT (email) DO NOTHING;

-- Display setup completion message
DO $$
BEGIN
    RAISE NOTICE 'SmartProctor-X database setup completed successfully!';
    RAISE NOTICE 'Tables created: user_profiles, proctor_sessions, violations';
    RAISE NOTICE 'Storage bucket created: proctoring-data';
    RAISE NOTICE 'Row Level Security enabled on all tables';
END $$;
