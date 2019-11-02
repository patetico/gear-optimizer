const webpack = require('webpack');


let commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString()
  .trim();

console.log(`hash: ${commitHash}`)

module.exports = function override(config, env) {
        config.module.rules.push({
                test: /\.worker\.js$/i,
                use: {
                        loader: 'worker-loader'
                }
        });
        config.output['globalObject'] = 'this';

        config.plugins.push(new webpack.DefinePlugin({
                'process.env.REACT_APP_GIT_HASH': `"${commitHash}"`
        }));

        return config;
}
