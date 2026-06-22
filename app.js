/**
 * Plesk entry point — Application root: httpdocs/FantasyFootball
 * Application startup file: app.js
 */
const path = require("path");
const { pathToFileURL } = require("url");

const entry = pathToFileURL(path.join(__dirname, "api", "src", "server.js")).href;

function logErr(...args) {
  console.error("[plesk]", ...args);
}

logErr("Starting API from:", entry);
logErr("PORT:", process.env.PORT || "(not set)");
logErr("NODE_ENV:", process.env.NODE_ENV || "(not set)");
logErr("cwd:", process.cwd());

process.on("uncaughtException", (err) => {
  logErr("uncaughtException:", err?.stack || err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logErr("unhandledRejection:", err?.stack || err);
  process.exit(1);
});

import(entry).catch((err) => {
  logErr("API failed to start:", err?.stack || err);
  process.exit(1);
});
