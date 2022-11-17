/* eslint-disable @typescript-eslint/camelcase */
import { ConfigurationFactory } from 'webpack'
import path from 'path'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import config from './src/config/config.json'

const webpackConfig: ConfigurationFactory = () => {
  return {
    entry: {
      popup: path.join(__dirname, 'src', 'popup', 'main.tsx'),
      manaba_main: path.join(
        __dirname,
        'src',
        'content-scripts',
        'manabaMain.ts'
      ),
      manaba_main_ui: path.join(
        __dirname,
        'src',
        'content-scripts',
        'manabaMainUI.tsx'
      ),
      manaba_commit: path.join(
        __dirname,
        'src',
        'content-scripts',
        'manabaCommit.tsx'
      ),
      background: path.join(__dirname, 'src', 'background', 'background.ts'),
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].js',
    },
    module: {
      rules: [
        {
          test: /.tsx?$/,
          use: 'ts-loader',
          exclude: '/node_modules/',
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    plugins: [
      new CopyWebpackPlugin([
        {
          from: 'public/manifest.json',
          to: './manifest.json',
          transform(content): string {
            const json = JSON.parse(content.toString())
            json.key = config.key
	          json.permissions = json.permissions.filter((key: string) => {
		          return key != "declarativeContent"
	          })
            json.browser_action = json.page_action
            delete json.page_action
	          json.background.persistent = true
            return JSON.stringify(json)
          },
        },
        { from: 'public', to: '.' },
      ]),
    ],
  }
}

export default webpackConfig
