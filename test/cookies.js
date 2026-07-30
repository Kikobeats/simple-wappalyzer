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
