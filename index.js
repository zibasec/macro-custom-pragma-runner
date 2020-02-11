const debug = require('debug')('macro-custom-pragma-runner')
const path = require('path')

const resolvePragma = name => {
  const validPaths = [
    path.resolve(process.cwd(), 'src', 'pragmas', name),
    path.resolve(process.cwd(), 'src', 'pragmas', name.replace(/^_/, '')),
    path.resolve(process.cwd(), 'node_modules', name),
    path.resolve(process.cwd(), 'node_modules', `@${name}`),
    path.resolve(process.cwd(), 'node_modules', name.replace(/^_/, '')),
    path.resolve(process.cwd(), 'node_modules', `@${name.replace(/^_/, '')}`)
  ]

  for (const p of validPaths) {
    try {
      require.resolve(p)
      debug(`Custom pragma found in ${p}.`)
      return require(p)
    } catch (err) {
      debug(`Custom pragma not found in ${p}.`)
      continue
    }
  }
  throw new Error(`Custom pragama not found in valid paths: ${validPaths.join(', ')}`)
}

module.exports = async function customPragmaRunner (arc, cloudformation, stage) {
  debug('invoked')
  const customPragmas = Object.keys(arc).filter(n => n.startsWith('_')).map(name => name.replace(/^_/, '')) // grab custom pragma keys from arc
  debug(`Custom pragmas found ${customPragmas.join(', ')}`)
  for await (const pragmaName of customPragmas) {
    debug(`Running custom pragma: ${pragmaName}`)
    const args = arc['_' + pragmaName]

    let output = null
    try {
      output = await resolvePragma('_' + pragmaName)({ arc, cloudformation, stage, args }) || {}
    } catch (err) {
      console.error(`Error executing custom pragma _${pragmaName}: ${err.message}`)
      throw err
    }
    const { cloudformation: cftMods } = output
    Object.assign(cloudformation, cftMods)
  }
  return cloudformation
}
