/**
 * Plesk entry point when Application root = httpdocs/FantasyFootball
 * Set Application startup file to: app.js
 */
import("./api/src/server.js").catch((err) => {
  console.error(err);
  process.exit(1);
});
