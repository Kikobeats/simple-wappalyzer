'use strict'

const wappalyzer = require('wappalyzer-core')
const test = require('ava')

const analyze = require('../src')

test('a failed technologies load is retried on the next call', async t => {
  const { setTechnologies } = wappalyzer
  wappalyzer.setTechnologies = () => {
    throw new Error('load failed')
  }

  await t.throwsAsync(
    analyze({ url: 'https://example.com', headers: {}, html: '' }),
    {
      message: 'load failed'
    }
  )

  wappalyzer.setTechnologies = setTechnologies

  const detections = await analyze({
    url: 'https://example.com',
    headers: { server: 'nginx' },
    html: ''
  })
  t.true(detections.some(({ name }) => name === 'Nginx'))
})
