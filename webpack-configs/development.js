const ejs = require('ejs');
const path = require('path');
const webpack = require('webpack');

const {
  DIST_ROOT,
  SRC_ROOT,
  WEBPACK_DEV_SERVER_ROOT,
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
  devServer: {
    publicPath: '/tower-offense-7x7/',

    compress: true,

    port: 9000,

    before(app) {
      const genereateCommonTemplateVariables = () => {
        return {
        };
      };

      app.engine('html', ejs.renderFile);

      app.get('/', (req, res) => {
        res.render(
          path.join(WEBPACK_DEV_SERVER_ROOT, 'templates/index.html'),
          genereateCommonTemplateVariables()
        );
      });

      app.get('/*.html', (req, res) => {
        res.render(
          path.join(WEBPACK_DEV_SERVER_ROOT, 'templates', req.path),
          genereateCommonTemplateVariables()
        );
      });
    },
  },
};
