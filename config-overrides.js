const webpack = require('webpack');


const commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim();


module.exports = function override(config) {
  config.module.rules.push({
    test: /\.worker\.js$/i,
    use: {
      loader: 'worker-loader',
    },
  });

  // eslint-disable-next-line no-param-reassign
  config.output.globalObject = 'this';

  config.plugins.push(new webpack.DefinePlugin({
    'process.env.REACT_APP_GIT_HASH': `"${commitHash}"`,
  }));

  return config;
};
