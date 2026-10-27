'use strict'

const path = require('path')
const Module = require('module')
const wappalyzer = require('wappalyzer-core')
const test = require('ava')

const analyze = require('../src')

test('a missing categories file does not compile technologies', async t => {
  const { setTechnologies } = wappalyzer
  let technologiesCalls = 0
  wappalyzer.setTechnologies = data => {
    technologiesCalls++
    return setTechnologies(data)
  }

  const originalLoad = Module._load
  Module._load = function (request, parent, isMain) {
    if (
      request.endsWith('categories.json') &&
      parent &&
      parent.filename.endsWith(`${path.sep}src${path.sep}index.js`)
    ) {
      throw new Error('categories missing')
    }
    return originalLoad.call(this, request, parent, isMain)
  }

  try {
    await t.throwsAsync(
      analyze({ url: 'https://example.com/', headers: {}, html: '' }),
      { message: 'categories missing' }
    )
  } finally {
    Module._load = originalLoad
  }

  t.is(technologiesCalls, 0)

  const detections = await analyze({
    url: 'https://example.com/',
    headers: { server: 'nginx' },
    html: ''
  })
  t.true(detections.some(({ name }) => name === 'Nginx'))
  t.is(technologiesCalls, 1)
})
