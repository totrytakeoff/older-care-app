module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'import',
      {
        libraryName: 'uview-ui',
        customName: name => {
          return `uview-ui/lib/${name}/${name}`
        }
      }
    ]
  ]
} 