const path = require('path')

module.exports = {
  transpileDependencies: ['uview-ui'],
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  }
} 