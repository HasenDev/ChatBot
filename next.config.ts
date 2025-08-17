/** @type {import('next').NextConfig} */
const webpack = require('webpack');
const JavaScriptObfuscator = require('webpack-obfuscator');

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images-ext-1.discordapp.net', pathname: '/**' },
      { protocol: 'https', hostname: 'media.discordapp.net', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.discordapp.com', pathname: '/**' },
      { protocol: 'https', hostname: 'dash.admibot.xyz', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.admibot.xyz', pathname: '/**' },
      { protocol: 'https', hostname: 'api.dicebear.com', pathname: '/**' },
    ],
  },

  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({ resourceRegExp: /^zlib-sync$/ }),
        new webpack.IgnorePlugin({ resourceRegExp: /^discord.js$/ })
      );
      config.resolve.alias['discord.js'] = false;
      config.resolve.alias['zlib-sync'] = false;
      if (!dev) {
        config.plugins.push(
          new JavaScriptObfuscator(
            {
              rotateStringArray: true,
              stringArray: true,
              stringArrayThreshold: 0.8,
              compact: true,
              controlFlowFlattening: false,
              controlFlowFlatteningThreshold: 0.75,
              deadCodeInjection: true,
              deadCodeInjectionThreshold: 0.4,
              debugProtection: true,
              debugProtectionInterval: 4000,
              disableConsoleOutput: true,
              renameGlobals: false,
              selfDefending: true,
              splitStrings: true,
              splitStringsChunkLength: 8,
              transformObjectKeys: true,
              unicodeEscapeSequence: true,
            }
          )
        );
      }
    }
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    return config;
  },
};

module.exports = nextConfig;
