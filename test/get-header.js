'use strict'

const test = require('ava')

const { getHeader } = require('../src')

test('get a header value in a key insensitive way', t => {
  t.is(
    getHeader(
      {
        'set-cookie': 'foo'
      },
      'set-cookie'
    ),
    'foo'
  )

  t.is(
    getHeader(
      {
        'Set-Cookie': 'foo'
      },
      'set-cookie'
    ),
    'foo'
  )
  t.is(
    getHeader(
      {
        'Set-Cookie': 'foo'
      },
      'Set-cookie'
    ),
    'foo'
  )
})
