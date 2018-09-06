const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: ['./src/main.ts'],
  watch: false,
  target: 'node',
  externals: [
    nodeExternals({
      whitelist: [
          '@nestjs/core',
          '@nestjs/common',
          '@nestjs/websockets',
          '@nestjs/microservices',
          'ws'
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },
  mode: "development",
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.js',
  },
};
