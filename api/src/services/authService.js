import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sql from "mssql";
import { JWT_SECRET } from "../config.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FPL_ID_RE = /^[A-Za-z0-9_-]{3,32}$/;

export function normalizeEmail(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function normalizeLogin(value) {
  return String(value ?? "").trim();
}

export function normalizeFplId(value) {
  const v = String(value ?? "").trim();
  return v.length ? v : null;
}

export function normalizePhone(value) {
  const v = String(value ?? "").trim();
  return v.length ? v : null;
}

export function validatePassword(password) {
  const p = String(password ?? "");
  if (p.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }
  return { ok: true };
}

export function validateFplId(fplId) {
  if (fplId == null) return { ok: true };
  if (!FPL_ID_RE.test(fplId)) {
    return {
      ok: false,
      message: "FPL ID must be 3–32 characters (letters, numbers, _ or -).",
    };
  }
  return { ok: true };
}

export function signToken(user, rememberMe) {
  const expiresIn = rememberMe ? "30d" : "1d";
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const header = String(request.headers.authorization || "");
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

export function getUserIdFromRequest(request) {
  const payload = verifyToken(getTokenFromRequest(request));
  return payload?.sub ?? null;
}

export async function findUserByLogin(db, login) {
  const value = normalizeLogin(login);
  const email = normalizeEmail(login);
  const isEmail = EMAIL_RE.test(email);

  const result = await db
    .request()
    .input("login", sql.VarChar(255), isEmail ? email : value)
    .query(`
      SELECT TOP (1)
        id, email, username, password_hash, display_name, phone_number, fpl_id, last_login_at, is_active
      FROM dbo.app_users
      WHERE ${isEmail ? "email = @login" : "username = @login"}
    `);

  return result.recordset[0] ?? null;
}

export async function findUserById(db, id) {
  const result = await db
    .request()
    .input("id", sql.UniqueIdentifier, id)
    .query(`
      SELECT TOP (1)
        id, email, username, display_name, phone_number, fpl_id, last_login_at, is_active
      FROM dbo.app_users
      WHERE id = @id
    `);
  return result.recordset[0] ?? null;
}

export async function findUserByFplId(db, fplId, excludeUserId = null) {
  const request = db.request().input("fplId", sql.VarChar(64), fplId);
  let query = `
    SELECT TOP (1) id FROM dbo.app_users WHERE fpl_id = @fplId
  `;
  if (excludeUserId) {
    request.input("excludeId", sql.UniqueIdentifier, excludeUserId);
    query += " AND id <> @excludeId";
  }
  const result = await request.query(query);
  return result.recordset[0] ?? null;
}

export function userIsActive(row) {
  return row?.is_active === true || row?.is_active === 1;
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(String(password), String(hash));
}

export function hashPassword(password) {
  return bcrypt.hashSync(String(password), 10);
}

export function toPublicUser(row) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    displayName: row.display_name ?? row.username,
    phoneNumber: row.phone_number ?? null,
    fplId: row.fpl_id ?? null,
    lastLoginAt: row.last_login_at
      ? new Date(row.last_login_at).toISOString()
      : null,
  };
}

export async function updateLastLogin(db, userId) {
  await db
    .request()
    .input("id", sql.UniqueIdentifier, userId)
    .query(`
      UPDATE dbo.app_users
      SET last_login_at = SYSUTCDATETIME(), updated_at = SYSUTCDATETIME()
      WHERE id = @id
    `);
}

export async function createUser(db, { email, username, password, displayName }) {
  const hash = hashPassword(password);
  const result = await db
    .request()
    .input("email", sql.VarChar(255), email)
    .input("username", sql.VarChar(128), username)
    .input("hash", sql.VarChar(255), hash)
    .input("displayName", sql.VarChar(200), displayName || username)
    .query(`
      INSERT INTO dbo.app_users (email, username, password_hash, display_name, last_login_at)
      OUTPUT INSERTED.*
      VALUES (@email, @username, @hash, @displayName, SYSUTCDATETIME())
    `);
  return result.recordset[0];
}

export function usernameFromEmail(email) {
  const base = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 40) || "user";
  return base;
}
