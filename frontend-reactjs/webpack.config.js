// Configuracion
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var bundlesSrcPath = path.resolve(__dirname, '../src/main/resources/static/dist');
var templateSrcServerPath = path.resolve(__dirname, '../src/main/resources/templates/');
const webpack = require('webpack');

module.exports = {
	entry: './src/js/App.jsx',
	devtool: 'inline-source-map',
	devServer: {
		contentBase: 'src/',
		port: 8091,
		// Send API requests on localhost to API server get around CORS.
		proxy : {
			'/**' : {
				target : {
					host : "localhost",
					protocol : 'http:',
					port : 8081
				}
			}
		},
		hot: true,
		inline: true
	},
	plugins: [
		new CopyWebpackPlugin([{
			from: 'src/index.html',
			to: templateSrcServerPath
		}]),
		new webpack.HotModuleReplacementPlugin(),
		// Hago global jQuery
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery'
		})
	],
	output: {
		path: bundlesSrcPath,
		filename: 'bundle.js',
		publicPath: '/dist/'
	},
	module: {
		loaders: [{
			test: path.join(__dirname, '.'),
			exclude: /node_modules/,
			loader: 'babel-loader',
			query: {
				cacheDirectory: true,
				presets: ['es2015', 'react']
			}
		}, {
			test: /\.css$/,
			use: ['style-loader', 'css-loader']
		}, {
			test: /\.(png|jpg)$/,
			loader: 'url-loader'
		}]
	}
};