'use strict'

const test = require('ava')

const wappalyzer = require('../src')

test('ignores invalid Set-Cookie values instead of throwing', async t => {
  const result = await wappalyzer({
    url: 'https://example.com/',
    headers: {
      'set-cookie': [
        'session=abc; Path=/; HttpOnly',
        'InvalidCookieWithoutEquals',
        '%%%',
        'tracking=1; Path=/'
      ]
    },
    html: '<html><head></head><body></body></html>'
  })

  t.true(Array.isArray(result))
})

test('ignores a single invalid Set-Cookie string', async t => {
  const result = await wappalyzer({
    url: 'https://example.com/',
    headers: { 'set-cookie': 'not-a-cookie' },
    html: '<html><head></head><body></body></html>'
  })

  t.true(Array.isArray(result))
})

const detectFromCookies = async setCookie =>
  (
    await wappalyzer({
      url: 'https://example.com/',
      headers: { 'set-cookie': setCookie },
      html: '<html><head></head><body></body></html>'
    })
  ).map(({ name, version }) => (version ? `${name}@${version}` : name))

test('detect a technology from a Set-Cookie name', async t => {
  t.deepEqual((await detectFromCookies('laravel_session=abc; Path=/')).sort(), [
    'Laravel',
    'PHP'
  ])
})

test('match cookie names in a case insensitive way', async t => {
  t.deepEqual(await detectFromCookies('PHPSESSID=abc; Path=/'), ['PHP'])
})

test('detect a technology from every Set-Cookie header', async t => {
  t.deepEqual(
    (
      await detectFromCookies([
        '__stripe_mid=abc; Path=/',
        'InvalidCookieWithoutEquals',
        '_shopify_y=def; Path=/'
      ])
    ).sort(),
    ['Shopify', 'Stripe']
  )
})

test('read the version from a cookie pattern', async t => {
  t.deepEqual(await detectFromCookies('_gat=1; Path=/'), [
    'Google Analytics@UA'
  ])
})

test('keep every value of a repeated cookie name', async t => {
  for (const setCookie of [
    ['rr-testCookie=nope', 'rr-testCookie=testvalue'],
    ['rr-testCookie=testvalue', 'rr-testCookie=nope']
  ]) {
    t.deepEqual(await detectFromCookies(setCookie), ['Retail Rocket'])
  }
})

test('accept cookie names that shadow object properties', async t => {
  t.deepEqual(
    await detectFromCookies([
      '__proto__=a; Path=/',
      'constructor=b; Path=/',
      'hasOwnProperty=c; Path=/'
    ]),
    []
  )
})
