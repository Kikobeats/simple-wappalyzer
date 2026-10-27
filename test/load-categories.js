'use strict'

const wappalyzer = require('wappalyzer-core')
const test = require('ava')

const analyze = require('../src')

test('a failed categories load is retried without compiling technologies again', async t => {
  const { setTechnologies, setCategories } = wappalyzer
  const calls = { technologies: 0, categories: 0 }

  wappalyzer.setTechnologies = data => {
    calls.technologies++
    return setTechnologies(data)
  }
  wappalyzer.setCategories = () => {
    calls.categories++
    throw new Error('categories failed')
  }

  await t.throwsAsync(
    analyze({ url: 'https://example.com/', headers: {}, html: '' }),
    { message: 'categories failed' }
  )
  t.is(calls.technologies, 1)
  t.is(calls.categories, 1)

  wappalyzer.setCategories = data => {
    calls.categories++
    return setCategories(data)
  }

  const detections = await analyze({
    url: 'https://example.com/',
    headers: { server: 'nginx' },
    html: ''
  })
  const nginx = detections.find(({ name }) => name === 'Nginx')
  t.truthy(nginx)
  t.true(nginx.categories.some(category => category && category.slug))
  t.is(calls.technologies, 1)
  t.is(calls.categories, 2)

  await analyze({
    url: 'https://example.com/',
    headers: { server: 'nginx' },
    html: ''
  })
  t.is(calls.technologies, 1)
  t.is(calls.categories, 2)
})
