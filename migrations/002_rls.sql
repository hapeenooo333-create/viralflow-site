-- migrations/002_rls.sql

-- Enable row level security for multi-tenant safety
-- Note: Supabase uses `auth.uid()` to reference the logged-in user

-- Profiles: allow users to insert their own profile on signup
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "profiles_owner"
  ON profiles
  FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Organizations: allow members to access org rows via organization_members
ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "orgs_read_for_members"
  ON organizations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members m WHERE m.organization_id = organizations.id AND m.profile_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "orgs_insert_owner"
  ON organizations
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Projects: members can access projects for their org
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "projects_org_members_select"
  ON projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members m WHERE m.organization_id = projects.organization_id AND m.profile_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "projects_org_members_insert"
  ON projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members m WHERE m.organization_id = projects.organization_id AND m.profile_id = auth.uid()
    )
  );

-- Generations: members of the project/org can read/write
ALTER TABLE IF EXISTS generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "generations_org_members_select"
  ON generations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p JOIN organization_members m ON p.organization_id = m.organization_id WHERE p.id = generations.project_id AND m.profile_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "generations_org_members_insert"
  ON generations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p JOIN organization_members m ON p.organization_id = m.organization_id WHERE p.id = generations.project_id AND m.profile_id = auth.uid()
    )
  );
