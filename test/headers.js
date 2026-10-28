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
  for (const value of [
    ['PHP/8.2.1', 'Express'],
    ['Express', 'PHP/8.2.1']
  ]) {
    const detected = await detect({ 'X-Powered-By': value })
    t.true(detected.includes('PHP@8.2.1'))
    t.true(detected.includes('Express'))
  }
})

test('merge values whose header names differ only by case', async t => {
  for (const headers of [
    { Server: 'nginx/1.25.3', server: 'Apache' },
    { server: 'Apache', Server: 'nginx/1.25.3' }
  ]) {
    const detected = await detect(headers)
    t.true(detected.includes('Nginx@1.25.3'))
    t.true(detected.includes('Apache HTTP Server'))
  }
})

test('keep detecting when headers are missing', async t => {
  const html = '<meta name="generator" content="WordPress 6.4.2">'
  const url = 'https://example.com/'
  const names = async input =>
    (await wappalyzer({ url, html, ...input })).map(({ name }) => name)

  t.true((await names()).includes('WordPress'))
  t.true((await names({ headers: undefined })).includes('WordPress'))
  t.true((await names({ headers: null })).includes('WordPress'))
})
