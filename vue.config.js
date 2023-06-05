const { defineConfig } = require('@vue/cli-service')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
module.exports = defineConfig({
  publicPath: './',
  lintOnSave: false,
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new MonacoWebpackPlugin()
    ]
  }
})
