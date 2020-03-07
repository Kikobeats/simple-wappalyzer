'use strict'

const test = require('ava')

const getHTML = require('html-get')

const wappalyzer = require('../src')

test('kikobeats.com', async t => {
  const { headers, statusCode, url, html } = await getHTML(
    'https://kikobeats.com'
  )
  const result = await wappalyzer({ url, statusCode, html, headers })
  t.snapshot(result)
})

test('zeit.co', async t => {
  const { headers, statusCode, url, html } = await getHTML('https://zeit.co')
  const result = await wappalyzer({ url, statusCode, html, headers })
  t.snapshot(result)
})
