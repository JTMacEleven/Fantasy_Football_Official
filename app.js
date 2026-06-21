/**
 * Plesk entry point — Application root: httpdocs/FantasyFootball
 * Application startup file: app.js
 */
const path = require("path");
const { pathToFileURL } = require("url");

const entry = pathToFileURL(path.join(__dirname, "api", "src", "server.js")).href;

console.log("[plesk] Starting API from:", entry);
console.log("[plesk] PORT:", process.env.PORT || "(not set)");
console.log("[plesk] NODE_ENV:", process.env.NODE_ENV || "(not set)");

import(entry).catch((err) => {
  console.error("[plesk] API failed to start:", err);
  process.exit(1);
});
