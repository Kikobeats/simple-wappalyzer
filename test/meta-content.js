'use strict'

const wappalyzer = require('wappalyzer-core')
const test = require('ava')

const analyze = require('../src')

test('a meta tag with no content is passed as null', async t => {
  const { setTechnologies } = wappalyzer
  wappalyzer.setTechnologies = data => {
    data.NullMeta = { cats: [1], meta: { generator: '^null$' } }
    return setTechnologies(data)
  }

  const detections = await analyze({
    url: 'https://example.com/',
    headers: {},
    html: '<meta name="generator">'
  })

  t.true(detections.some(({ name }) => name === 'NullMeta'))
})
