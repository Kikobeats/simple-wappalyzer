'use strict'

const core = require('wappalyzer-core')
const test = require('ava')

const wappalyzer = require('../src')

const scriptSrcByHtml = new Map()
const { analyze } = core
core.analyze = items => {
  scriptSrcByHtml.set(items.html, items.scriptSrc)
  return analyze(items)
}

const scriptSrcFor = async ({ url, html }) => {
  await wappalyzer({ url, headers: {}, html })
  return scriptSrcByHtml.get(html)
}

const detect = async html =>
  (await wappalyzer({ url: 'https://example.com/', headers: {}, html })).map(
    ({ name }) => name
  )

test('detect a technology from its script src', async t => {
  t.deepEqual(
    await detect(
      '<script src="https://plausible.io/js/plausible.js"></script>'
    ),
    ['Plausible']
  )
})

test('match every script src on its own', async t => {
  t.deepEqual(
    (
      await detect(
        '<script src="https://cdn.avasize.com/a.js"></script><script src="https://cdn.usefathom.com/script.js"></script>'
      )
    ).sort(),
    ['Avasize', 'Fathom']
  )
})

test('read the version from a script src', async t => {
  const detections = await wappalyzer({
    url: 'https://example.com/',
    headers: {},
    html: '<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>'
  })
  t.like(
    detections.find(({ name }) => name === 'jQuery'),
    { version: '3.7.1' }
  )
})

test('pass duplicate script src values once', async t => {
  t.deepEqual(
    await scriptSrcFor({
      url: 'https://example.com/',
      html: '<script src="/app.js"></script><script src="https://example.com/app.js"></script>'
    }),
    ['https://example.com/app.js']
  )
})

test('skip a script that has no src', async t => {
  t.deepEqual(
    await scriptSrcFor({
      url: 'https://example.com/page',
      html: '<script src="/app.js"></script><script></script>'
    }),
    ['https://example.com/app.js']
  )
})

test('drop an empty script src when it cannot be resolved', async t => {
  t.deepEqual(
    await scriptSrcFor({
      html: '<script src="https://example.com/app.js"></script><script src=""></script>'
    }),
    ['https://example.com/app.js']
  )
})

test('do not match a script url as script content', async t => {
  t.deepEqual(
    await detect(
      '<script src="/index.php?x=1"></script>' +
        '<script src="https://plausible.io/js/plausible.js"></script>'
    ),
    ['Plausible']
  )
})
