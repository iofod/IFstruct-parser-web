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
		host: '192.168.88.32',
		allowedHosts: ['testdemo.qk123.cn', '192.168.1.101', '192.168.88.32', '127.0.0.1'],
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
