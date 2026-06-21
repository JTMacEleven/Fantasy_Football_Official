const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.watcher = {
  ...config.watcher,
  additionalExcludes: [
    /node_modules[\\/]lightningcss-darwin-.*/,
    /node_modules[\\/]lightningcss-linux-.*/,
    /node_modules[\\/]lightningcss-freebsd-.*/,
  ],
};

module.exports = config;
