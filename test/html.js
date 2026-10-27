'use strict'

const test = require('ava')

const wappalyzer = require('../src')

const WORDPRESS_META = '<meta name="generator" content="WordPress 6.4.2">'

const detect = async html =>
  (await wappalyzer({ url: 'https://example.com/', headers: {}, html })).map(
    ({ name, version }) => (version ? `${name}@${version}` : name)
  )

test('detect technologies from meta tags', async t => {
  t.deepEqual(await detect(WORDPRESS_META), ['WordPress@6.4.2', 'MySQL', 'PHP'])
})

test('match meta tags in a case insensitive way', async t => {
  t.deepEqual(
    await detect('<META NAME="GENERATOR" CONTENT="WordPress 6.4.2">'),
    ['WordPress@6.4.2', 'MySQL', 'PHP']
  )
})

test('decode entities in meta content', async t => {
  t.deepEqual(
    await detect('<meta name="generator" content="WordPress&#32;6.4.2">'),
    ['WordPress@6.4.2', 'MySQL', 'PHP']
  )
})

test('detect meta tags placed after an inline svg with a style', async t => {
  t.deepEqual(
    await detect(`<svg><style>.a{fill:#fff}</style></svg>${WORDPRESS_META}`),
    ['WordPress@6.4.2', 'MySQL', 'PHP']
  )
})

test('ignore meta tags inside template, comments and scripts', async t => {
  t.deepEqual(
    await detect(
      `<template>${WORDPRESS_META}</template><!-- ${WORDPRESS_META} --><script>"${WORDPRESS_META}"</script>`
    ),
    []
  )
})

test('reject an invalid url', async t => {
  await t.throwsAsync(
    wappalyzer({ url: 'not a url', headers: {}, html: WORDPRESS_META }),
    { message: 'Invalid URL' }
  )
})

test('ignore markup inside a self-closing script until </script>', async t => {
  t.deepEqual(
    await detect(`<script src="/a.js"/>var s = '${WORDPRESS_META}';</script>`),
    []
  )
})

test('accept a Buffer as html', async t => {
  t.deepEqual(await detect(Buffer.from(WORDPRESS_META)), [
    'WordPress@6.4.2',
    'MySQL',
    'PHP'
  ])
})

test('a stray </template> after a self-closing script keeps later templates inert', async t => {
  t.deepEqual(
    await detect(
      `<script src="/a.js"/><template><script></script></template><template>${WORDPRESS_META}</template>`
    ),
    []
  )
})
