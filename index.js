const debug = require('debug')('macro-custom-pragma-runner')
const path = require('path')

module.exports = async function customPragmaRunner (arc, cloudformation, stage) {
  debug('invoked')
  const customPragmas = Object.keys(arc).filter(n => n.startsWith('_')).map(name => name.replace(/^_/, '')) // grab custom pragma keys from arc
  debug(`Custom pragmas found ${customPragmas.join(', ')}`)
  for await (const pragmaName of customPragmas) {
    debug(`Running custom pragma: ${pragmaName}`)
    const args = arc['_' + pragmaName]
    const customPragmaPath = path.resolve(process.cwd(), 'src', 'pragmas', pragmaName)
    const pragamFn = require(customPragmaPath)
    let outut = null
    try {
      output = await pragamFn({ arc, cloudformation, stage, args }) || {}
    } catch (err) {
      console.error(`Error executing custom pragma _${pragmaName}: ${err.message}`)
      throw err
    }
    const { cloudformation: cftMods } = output
    Object.assign(cloudformation, cftMods)
  }
  return cloudformation
}
