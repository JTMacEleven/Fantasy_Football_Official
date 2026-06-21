-- 002_seed_admin.sql
-- Default admin: username admin, email admin@afroangel.local, password ChangeMe!123

IF NOT EXISTS (SELECT 1 FROM dbo.app_users WHERE username = 'admin')
BEGIN
  INSERT INTO dbo.app_users (
    email,
    username,
    password_hash,
    display_name,
    is_active
  )
  VALUES (
    'admin@afroangel.local',
    'admin',
    '$2a$10$Zqqxev0hsIv6u4/p5KaQK.4j74YyHlRQ9mIGQlajW6lMZ./HPfYQO',
    'Administrator',
    1
  );
END;
