'use strict'

const wappalyzer = require('wappalyzer-core')
const test = require('ava')

const analyze = require('../src')

test('a failed technologies load is retried on the next call', async t => {
  const { setTechnologies, setCategories } = wappalyzer
  let categoryCalls = 0
  wappalyzer.setCategories = data => {
    categoryCalls++
    return setCategories(data)
  }
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
  t.is(categoryCalls, 1)

  await analyze({
    url: 'https://example.com',
    headers: { server: 'nginx' },
    html: ''
  })
  t.is(categoryCalls, 1)
})
