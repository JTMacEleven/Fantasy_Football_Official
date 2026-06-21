-- 003_profile_fields.sql
-- Profile fields: phone, FPL ID, last login

IF COL_LENGTH('dbo.app_users', 'phone_number') IS NULL
  ALTER TABLE dbo.app_users ADD phone_number VARCHAR(32) NULL;
GO

IF COL_LENGTH('dbo.app_users', 'fpl_id') IS NULL
  ALTER TABLE dbo.app_users ADD fpl_id VARCHAR(64) NULL;
GO

IF COL_LENGTH('dbo.app_users', 'last_login_at') IS NULL
  ALTER TABLE dbo.app_users ADD last_login_at DATETIME2 NULL;
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE name = N'UQ_app_users_fpl_id' AND object_id = OBJECT_ID(N'dbo.app_users')
)
  CREATE UNIQUE INDEX UQ_app_users_fpl_id ON dbo.app_users (fpl_id) WHERE fpl_id IS NOT NULL;
GO
