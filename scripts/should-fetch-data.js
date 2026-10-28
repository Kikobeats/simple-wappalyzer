'use strict'

const isInstallOfThisRepository = ({ cwd, env }) => env.INIT_CWD === cwd

module.exports = ({ cwd, env, argv }) =>
  argv.includes('--force') ||
  Boolean(env.CI) ||
  !isInstallOfThisRepository({ cwd, env })
