const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')

const devWebpackConfig = merge(baseWebpackConfig, {
	mode: 'development',
	devtool: 'cheap-module-eval-source-map',
	devServer: {
		contentBase: baseWebpackConfig.externals.paths.dist,
		port: 8181,
		overlay: {
			warnings: true,
			errors: true
		},
		host: '127.0.0.12',
		quiet: true, // necessary for FriendlyErrorsPlugin
		proxy: {
			'/api': {
				target: 'http://192.168.3.12:9001',
				changeOrigin: true,
				pathRewrite: {
					'^/api': ''
				}
			}
		}
	},
	plugins: [
		new webpack.SourceMapDevToolPlugin({
			filename: '[file].map'
		})
	]
})

module.exports = new Promise((resolve, reject) => {
	resolve(devWebpackConfig)
})
