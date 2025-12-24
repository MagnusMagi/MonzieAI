const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure Metro to listen on both IPv4 and IPv6
config.server = {
  ...config.server,
  // Listen on all network interfaces
  // Using undefined or not specifying host will make it listen on both IPv4 and IPv6
  port: 8081,
};

// Add support for additional file extensions if needed
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
};

module.exports = config;
