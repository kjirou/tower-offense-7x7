const path = require('path');
const webpack = require('webpack');

const {
  DIST_ROOT,
  SRC_ROOT,
  sharedWebpackConfig,
} = require('./shared');

module.exports = {
  mode: 'development',
  entry: {
    'webpacked': path.join(SRC_ROOT, 'index.ts'),
  },
  output: {
    filename: '[name].js',
    path: DIST_ROOT,
  },
  devtool: 'source-map',
  module: {
    rules: sharedWebpackConfig.module.rules,
  },
  resolve: {
    extensions: sharedWebpackConfig.resolve.extensions,
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEVELOPMENT__: true,
      __REACT_DEVTOOLS_GLOBAL_HOOK__: '({isDisabled: true})',
      __TEST__: false,
    }),
  ],
};
