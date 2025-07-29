const { withUniwind } = require('../../packages/uniwind/metro')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

module.exports = withUniwind(config)
