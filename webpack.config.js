const path = require('path');
const webpack = require('webpack');

// copy manifest.json to the path: 'public/build'
// this will allow for the authRequest to see the file at www.example.com/manifest.json
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ManifestAssetPlugin = new CopyWebpackPlugin([ { from: 'src/assets/manifest.json', to: 'manifest.json' } ]);
const IconAssetPlugin = new CopyWebpackPlugin([
		 { from: 'src/images/icon-192x192.png', to: 'images/icon-192x192.png' },
		{ from: 'src/images/favicon.ico', to: 'images/favicon.ico' },
		{ from: 'src/images/bg-pattern.png', to: 'images/bg-pattern.png' },
]);

const UglifyEsPlugin = require('uglify-es-webpack-plugin');
const UglifyEsPluginConfig = new UglifyEsPlugin({
	mangle: {
		reserved: [
                	'Buffer',
                        'BigInteger',
                        'Point',
                        'ECPubKey',
                        'ECKey',
                        'sha512_asm',
                        'asm',
                        'ECPair',
                        'HDNode'
                ]
        }
})

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  entry: './src/index.js',
  target: 'web',
  output: {
    path: path.resolve('public/build'),
    filename: 'index_bundle.js',
    publicPath: '/'
  },
  devServer: {
    historyApiFallback: {
      disableDotRule: true
    },
    watchOptions: { aggregateTimeout: 300, poll: 1000 },
    headers: {
			"Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
    },
  },
  module: {
    rules: [
      { test: /\.json$/, use: 'json-loader' },
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
        loader: 'file-loader',
      },
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  },
  plugins: [
	HtmlWebpackPluginConfig,
	ManifestAssetPlugin,
	IconAssetPlugin,
	UglifyEsPluginConfig,
	/*
	new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    }),
	*/
 ]
}
