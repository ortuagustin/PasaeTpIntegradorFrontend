// Configuracion
var path = require('path');
console.log(path);
var bundlesSrcPath = path.resolve(__dirname, './src/main/resources/static/dist');
console.log(bundlesSrcPath);
const webpack = require('webpack');

module.exports = {
	entry: './frontend-reactjs/src/js/App.jsx',
	devtool: 'inline-source-map',
	plugins: [
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
