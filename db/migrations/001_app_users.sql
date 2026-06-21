-- 001_app_users.sql
-- AfroAngel Fantasy Football mobile/web app users

IF OBJECT_ID(N'dbo.app_users', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.app_users (
    id            UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_app_users_id DEFAULT (NEWID()) PRIMARY KEY,
    email         VARCHAR(255)     NOT NULL,
    username      VARCHAR(128)     NOT NULL,
    password_hash VARCHAR(255)     NOT NULL,
    display_name  VARCHAR(200)     NULL,
    is_active     BIT              NOT NULL CONSTRAINT DF_app_users_is_active DEFAULT (1),
    created_at    DATETIME2        NOT NULL CONSTRAINT DF_app_users_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at    DATETIME2        NOT NULL CONSTRAINT DF_app_users_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT UQ_app_users_email UNIQUE (email),
    CONSTRAINT UQ_app_users_username UNIQUE (username)
  );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_app_users_email' AND object_id = OBJECT_ID(N'dbo.app_users'))
  CREATE INDEX idx_app_users_email ON dbo.app_users (email);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_app_users_username' AND object_id = OBJECT_ID(N'dbo.app_users'))
  CREATE INDEX idx_app_users_username ON dbo.app_users (username);
