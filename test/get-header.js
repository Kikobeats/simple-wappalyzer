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

test('return nothing when the header map is missing', t => {
  t.is(getHeader(undefined, 'set-cookie'), undefined)
  t.is(getHeader(null, 'set-cookie'), undefined)
})
