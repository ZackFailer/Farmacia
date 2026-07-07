const { join, resolve } = require('path');

module.exports = {
  target: 'node',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/main.ts',
  output: {
    path: join(__dirname, 'dist'),
    filename: 'main.js',
    clean: true,
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: resolve(__dirname, 'tsconfig.app.json'),
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    '@nestjs/common': 'commonjs @nestjs/common',
    '@nestjs/core': 'commonjs @nestjs/core',
    '@nestjs/jwt': 'commonjs @nestjs/jwt',
    '@nestjs/passport': 'commonjs @nestjs/passport',
    '@nestjs/platform-express': 'commonjs @nestjs/platform-express',
    '@nestjs/typeorm': 'commonjs @nestjs/typeorm',
    'class-transformer': 'commonjs class-transformer',
    'class-validator': 'commonjs class-validator',
    express: 'commonjs express',
    passport: 'commonjs passport',
    'passport-jwt': 'commonjs passport-jwt',
    'reflect-metadata': 'commonjs reflect-metadata',
    rxjs: 'commonjs rxjs',
    typeorm: 'commonjs typeorm',
    uuid: 'commonjs uuid',
    bcryptjs: 'commonjs bcryptjs',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};
