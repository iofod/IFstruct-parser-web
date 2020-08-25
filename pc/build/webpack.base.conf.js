const path = require('path')
const fs = require('fs')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')

const PATHS = {
	src: path.join(__dirname, '../src'),
	dist: path.join(__dirname, '../dist'),
	assets: 'static/',
	currDir: path.resolve(__dirname, '../')
}

const PAGES_DIR = PATHS.src
const PAGES = fs.readdirSync(PAGES_DIR).filter((fileName) => fileName.endsWith('.html'))

module.exports = {
	externals: {
		paths: PATHS
	},
	entry: {
		app: path.join(__dirname, '../src/index.js')
	},
	output: {
		filename: `${PATHS.assets}js/[name].[contenthash].js`,
		path: PATHS.dist,
		publicPath: '/'
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendor: {
					name: 'vendors',
					test: /node_modules/,
					chunks: 'all',
					enforce: true
				}
			}
		}
	},
	module: {
		rules: [
			{
				// JavaScript
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: '/node_modules/'
			},
			{
				// Vue
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					loader: {
						scss: 'vue-style-loader!css-loader!sass-loader'
					}
				}
			},
			{
				// Fonts
				test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'file-loader',
				options: {
					name: '[name].[ext]'
				}
			},
			{
				// images / icons
				test: /\.(png|jpg|gif|svg)$/,
				loader: 'file-loader',
				options: {
					name: '[name].[ext]'
				}
			},
			{
				// scss
				test: /\.scss$/,
				use: [
					'style-loader',
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: { sourceMap: true }
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: true,
							config: { path: `./postcss.config.js` }
						}
					},
					{
						loader: 'sass-loader',
						options: { sourceMap: true }
					}
				]
			},
			{
				// less
				test: /\.less$/,
				use: [
					'style-loader',
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: { sourceMap: true }
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: true,
							config: { path: `./postcss.config.js` }
						}
					},
					{
						loader: 'less-loader',
						options: { sourceMap: true }
					}
				]
			},
			{
				// css
				test: /\.css$/,
				use: [
					'style-loader',
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: { sourceMap: true }
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: true,
							config: { path: `./postcss.config.js` }
						}
					}
				]
			}
		]
	},
	resolve: {
		extensions: [ '.js', '.vue', '.json' ],
		alias: {
			'~': path.resolve(__dirname, '../src'),
			vue$: 'vue/dist/vue.js',
			assets: path.resolve(__dirname, '../src/main/assets')
		}
	},
	plugins: [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			filename: `${PATHS.assets}css/[name].[contenthash].css`
		}),
		new FriendlyErrorsWebpackPlugin(),
		new CopyWebpackPlugin([
			{
				from: path.join(__dirname, '../public')
			}
		]),

		...PAGES.map(
			(page) =>
				new HtmlWebpackPlugin({
					template: `${PAGES_DIR}/${page}`,
					filename: `./${page}`
				})
		)
	]
}
