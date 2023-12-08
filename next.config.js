module.exports = {
  output: 'export',
  distDir: 'build',
  basePath: '',
  swcMinify: true,
  transpilePackages: [
    '@ionic/react', 
    '@ionic/core', 
    '@stencil/core', 
    'ionicons',
    '@lifi/widget', 
    '@lifi/wallet-management',
    '@0xsquid/widget'
  ],
}
