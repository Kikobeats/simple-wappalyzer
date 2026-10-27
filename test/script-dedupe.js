'use strict'

const wappalyzer = require('wappalyzer-core')
const test = require('ava')

const analyze = require('../src')

test('duplicate script src values are matched once', async t => {
  const { setTechnologies } = wappalyzer
  wappalyzer.setTechnologies = data => {
    data.OnceScript = {
      cats: [1],
      scripts: '^https://example\\.com/app\\.js$'
    }
    return setTechnologies(data)
  }

  const detections = await analyze({
    url: 'https://example.com/',
    headers: {},
    html: '<script src="/app.js"></script><script src="https://example.com/app.js"></script>'
  })

  t.true(detections.some(({ name }) => name === 'OnceScript'))
})
