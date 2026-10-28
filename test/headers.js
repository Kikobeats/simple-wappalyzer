'use strict'

const test = require('ava')

const wappalyzer = require('../src')

const detect = async headers =>
  (
    await wappalyzer({
      url: 'https://example.com/',
      headers,
      html: '<html></html>'
    })
  ).map(({ name, version }) => (version ? `${name}@${version}` : name))

test('detect a technology from a header whatever its name casing', async t => {
  t.deepEqual(
    await detect({ 'X-Powered-By': 'Express' }),
    await detect({ 'x-powered-by': 'Express' })
  )
  t.true((await detect({ 'X-Powered-By': 'Express' })).includes('Express'))
})

test('detect a header version whatever its name casing', async t => {
  t.true((await detect({ Server: 'nginx/1.25.3' })).includes('Nginx@1.25.3'))
})

test('match every value of a multi-value header', async t => {
  t.true(
    (await detect({ 'X-Powered-By': ['PHP/8.2.1', 'Express'] })).includes(
      'Express'
    )
  )
})
