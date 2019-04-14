const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_ROOT = path.join(PROJECT_ROOT, 'src');
const DIST_ROOT = path.join(PROJECT_ROOT, 'dist');

const sharedWebpackConfig = {
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /\/node_modules\//,
        use: [
          {loader: 'ts-loader'},
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx'],
  },
};

module.exports = {
  DIST_ROOT,
  PROJECT_ROOT,
  SRC_ROOT,
  sharedWebpackConfig,
};
