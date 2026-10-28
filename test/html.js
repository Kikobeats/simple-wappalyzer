'use strict'

const test = require('ava')

const wappalyzer = require('../src')

const WORDPRESS_META = '<meta name="generator" content="WordPress 6.4.2">'

const detect = async (html, url = 'https://example.com/') =>
  (await wappalyzer({ url, headers: {}, html })).map(({ name, version }) =>
    version ? `${name}@${version}` : name
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

test('a solidus ends a script so later technologies are read', async t => {
  const names = await detect(
    `<script src="/a.js"></script/>${WORDPRESS_META}<script src="/algoliasearch.min.js"></script>`
  )
  t.true(names.includes('WordPress@6.4.2'))
  t.true(names.includes('Algolia'))
})

test('a solidus ends a style so a later meta tag is read', async t => {
  t.deepEqual(await detect(`<style></style/>${WORDPRESS_META}`), [
    'WordPress@6.4.2',
    'MySQL',
    'PHP'
  ])
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

test('detect meta tags placed after a script', async t => {
  t.deepEqual(await detect(`<script src="/a.js"></script>${WORDPRESS_META}`), [
    'WordPress@6.4.2',
    'MySQL',
    'PHP'
  ])
})

test('ignore meta tags inside a nested template', async t => {
  t.deepEqual(
    await detect(`<template><template></template>${WORDPRESS_META}</template>`),
    []
  )
})

test('detect meta tags after a nested template closes', async t => {
  t.deepEqual(
    await detect(`<template><template></template></template>${WORDPRESS_META}`),
    ['WordPress@6.4.2', 'MySQL', 'PHP']
  )
})

test('ignore meta tags written as text inside textarea, title and xmp', async t => {
  for (const tag of ['textarea', 'title', 'xmp']) {
    t.deepEqual(await detect(`<${tag}>${WORDPRESS_META}</${tag}>`), [])
  }
})

test('detect meta tags inside noscript', async t => {
  t.deepEqual(await detect(`<noscript>${WORDPRESS_META}</noscript>`), [
    'WordPress@6.4.2',
    'MySQL',
    'PHP'
  ])
})

test('resolve an empty script src against the page url', async t => {
  t.true(
    (
      await detect(
        '<script src=""></script>',
        'https://example.com/algoliasearch.js'
      )
    ).includes('Algolia')
  )
})

test('keep a relative script src when the page url cannot resolve it', async t => {
  const names = await wappalyzer({
    headers: {},
    html: '<script src="algoliasearch.js"></script>'
  })
  t.true(names.some(({ name }) => name === 'Algolia'))
})

test('detect meta tags placed after a script inside an svg', async t => {
  t.deepEqual(
    await detect(`<svg><script src="/a.js"></script></svg>${WORDPRESS_META}`),
    ['WordPress@6.4.2', 'MySQL', 'PHP']
  )
})

test('detect technologies from meta property attributes', async t => {
  t.true(
    (await detect('<meta property="og:site_name" content="GitLab">')).includes(
      'GitLab'
    )
  )
})

test('prefer meta name over property', async t => {
  t.false(
    (
      await detect(
        '<meta name="viewport" property="og:site_name" content="GitLab">'
      )
    ).includes('GitLab')
  )
})

test('use meta property when name is empty', async t => {
  t.true(
    (
      await detect('<meta name="" property="og:site_name" content="GitLab">')
    ).includes('GitLab')
  )
})

test('ignore meta tags without a name or property', async t => {
  t.deepEqual(await detect(`<meta content="x">${WORDPRESS_META}`), [
    'WordPress@6.4.2',
    'MySQL',
    'PHP'
  ])
})

test('resolve a root-relative script src against the page url', async t => {
  t.true(
    (await detect('<script src="/algoliasearch.min.js"></script>')).includes(
      'Algolia'
    )
  )
})

test('resolve a protocol-relative script src against the page url', async t => {
  t.true(
    (
      await detect('<script src="//cdn.example.com/algoliasearch.js"></script>')
    ).includes('Algolia')
  )
})

test('ignore scripts inside a template', async t => {
  t.deepEqual(
    await detect(
      '<template><script src="/algoliasearch.min.js"></script></template>'
    ),
    []
  )
})

test('keep the first script src when the attribute is repeated', async t => {
  t.deepEqual(
    await detect(
      '<script src="/nope.js" src="/algoliasearch.min.js"></script>'
    ),
    []
  )
  t.true(
    (
      await detect(
        '<script src="/algoliasearch.min.js" src="/nope.js"></script>'
      )
    ).includes('Algolia')
  )
})

test('keep going when a script src is not a valid url', async t => {
  t.deepEqual(
    await detect(`<script src="http://["></script>${WORDPRESS_META}`),
    ['WordPress@6.4.2', 'MySQL', 'PHP']
  )
})

test('ignore a script that has no src', async t => {
  t.true(
    (
      await detect(
        '<script src="/app.php"></script><script></script>',
        'https://example.com/page'
      )
    ).includes('PHP')
  )
})

test('drop an empty script src when it cannot be resolved', async t => {
  const names = await wappalyzer({
    headers: {},
    html: '<script src="https://example.com/app.php"></script><script src=""></script>'
  })
  t.true(names.some(({ name }) => name === 'PHP'))
})

test('resolve an absolute script src when the page url is omitted', async t => {
  const names = await wappalyzer({
    headers: {},
    html: '<script src="https://cdn.example.com/algoliasearch.js"></script>'
  })
  t.true(names.some(({ name }) => name === 'Algolia'))
})

test('resolve an absolute script src when the page url is null', async t => {
  const names = await wappalyzer({
    url: null,
    headers: {},
    html: '<script src="https://cdn.example.com/algoliasearch.js"></script>'
  })
  t.true(names.some(({ name }) => name === 'Algolia'))
})

test('reject an empty url', async t => {
  await t.throwsAsync(
    wappalyzer({ url: '', headers: {}, html: WORDPRESS_META }),
    {
      message: 'Invalid URL'
    }
  )
})
