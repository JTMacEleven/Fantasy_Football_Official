import sql from "mssql";
import {
  findUserByFplId,
  findUserById,
  getUserIdFromRequest,
  hashPassword,
  normalizeEmail,
  normalizeFplId,
  normalizePhone,
  toPublicUser,
  validateFplId,
  validatePassword,
  verifyPassword,
} from "../services/authService.js";

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function profileRoutes(fastify) {
  fastify.patch("/api/profile/details", async (request, reply) => {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const body = request.body ?? {};
    const displayName = body.displayName != null ? String(body.displayName).trim() : null;
    const phoneNumber = body.phoneNumber != null ? normalizePhone(body.phoneNumber) : null;
    const fplId = body.fplId != null ? normalizeFplId(body.fplId) : null;

    if (fplId) {
      const fplCheck = validateFplId(fplId);
      if (!fplCheck.ok) {
        return reply.code(400).send({ error: fplCheck.message });
      }
      const taken = await findUserByFplId(fastify.db, fplId, userId);
      if (taken) {
        return reply.code(409).send({ error: "This FPL ID is already in use." });
      }
    }

    try {
      await fastify.db
        .request()
        .input("id", sql.UniqueIdentifier, userId)
        .input("displayName", sql.VarChar(200), displayName || null)
        .input("phoneNumber", sql.VarChar(32), phoneNumber)
        .input("fplId", sql.VarChar(64), fplId)
        .query(`
          UPDATE dbo.app_users SET
            display_name = COALESCE(@displayName, display_name),
            phone_number = @phoneNumber,
            fpl_id = @fplId,
            updated_at = SYSUTCDATETIME()
          WHERE id = @id
        `);
    } catch (err) {
      if (err && typeof err === "object" && "number" in err && err.number === 2627) {
        return reply.code(409).send({ error: "This FPL ID is already in use." });
      }
      throw err;
    }

    const user = await findUserById(fastify.db, userId);
    return { user: toPublicUser(user) };
  });

  fastify.patch("/api/profile/email", async (request, reply) => {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const currentPassword = String(request.body?.currentPassword ?? "");
    const newEmail = normalizeEmail(request.body?.newEmail);

    if (!currentPassword || !newEmail) {
      return reply.code(400).send({ error: "Current password and new email are required." });
    }

    const result = await fastify.db
      .request()
      .input("id", sql.UniqueIdentifier, userId)
      .query(`SELECT TOP (1) password_hash, email FROM dbo.app_users WHERE id = @id`);
    const row = result.recordset[0];
    if (!row || !verifyPassword(currentPassword, row.password_hash)) {
      return reply.code(401).send({ error: "Current password is incorrect." });
    }

    if (newEmail === normalizeEmail(row.email)) {
      return reply.code(400).send({ error: "New email must be different from your current email." });
    }

    try {
      await fastify.db
        .request()
        .input("id", sql.UniqueIdentifier, userId)
        .input("email", sql.VarChar(255), newEmail)
        .query(`
          UPDATE dbo.app_users
          SET email = @email, updated_at = SYSUTCDATETIME()
          WHERE id = @id
        `);
    } catch (err) {
      if (err && typeof err === "object" && "number" in err && err.number === 2627) {
        return reply.code(409).send({ error: "An account with this email already exists." });
      }
      throw err;
    }

    const user = await findUserById(fastify.db, userId);
    return { user: toPublicUser(user) };
  });

  fastify.patch("/api/profile/password", async (request, reply) => {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const currentPassword = String(request.body?.currentPassword ?? "");
    const newPassword = String(request.body?.newPassword ?? "");
    const confirmPassword = String(request.body?.confirmPassword ?? "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return reply.code(400).send({
        error: "Current password, new password, and confirm password are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return reply.code(400).send({ error: "New passwords do not match." });
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.ok) {
      return reply.code(400).send({ error: passwordCheck.message });
    }

    const result = await fastify.db
      .request()
      .input("id", sql.UniqueIdentifier, userId)
      .query(`SELECT TOP (1) password_hash FROM dbo.app_users WHERE id = @id`);
    const row = result.recordset[0];
    if (!row || !verifyPassword(currentPassword, row.password_hash)) {
      return reply.code(401).send({ error: "Current password is incorrect." });
    }

    const hash = hashPassword(newPassword);
    await fastify.db
      .request()
      .input("id", sql.UniqueIdentifier, userId)
      .input("hash", sql.VarChar(255), hash)
      .query(`
        UPDATE dbo.app_users
        SET password_hash = @hash, updated_at = SYSUTCDATETIME()
        WHERE id = @id
      `);

    return { ok: true };
  });
}
