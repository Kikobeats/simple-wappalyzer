'use strict'

const test = require('ava')

const shouldFetchData = require('../scripts/should-fetch-data')

const REPOSITORY = '/work/simple-wappalyzer'
const CONSUMER = '/work/app'

test('fetch when installed as a dependency', t => {
  t.true(
    shouldFetchData({
      cwd: `${CONSUMER}/node_modules/simple-wappalyzer`,
      env: { INIT_CWD: CONSUMER },
      argv: []
    })
  )
})

test('skip when installing the repository locally', t => {
  t.false(
    shouldFetchData({
      cwd: REPOSITORY,
      env: { INIT_CWD: REPOSITORY },
      argv: []
    })
  )
})

test('fetch when installing the repository in CI', t => {
  t.true(
    shouldFetchData({
      cwd: REPOSITORY,
      env: { INIT_CWD: REPOSITORY, CI: 'true' },
      argv: []
    })
  )
})

test('fetch when forced', t => {
  t.true(
    shouldFetchData({
      cwd: REPOSITORY,
      env: { INIT_CWD: REPOSITORY },
      argv: ['node', 'scripts/postinstall', '--force']
    })
  )
})

test('fetch when run outside a package manager', t => {
  t.true(shouldFetchData({ cwd: REPOSITORY, env: {}, argv: [] }))
})
