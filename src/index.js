'use strict'

const { chain, mapValues } = require('lodash')
const wappalyzer = require('wappalyzer-core')
const { Cookie } = require('tough-cookie')
const jsdom = require('jsdom')

const { JSDOM, VirtualConsole } = jsdom

const { apps: technologies, categories } = require('./apps.json')

wappalyzer.setTechnologies(technologies)
wappalyzer.setCategories(categories)

const parseCookie = str => Cookie.parse(str).toJSON()

const getCookies = str =>
  chain(str)
    .castArray()
    .compact()
    .map(parseCookie)
    .map(({ key: name, ...props }) => ({ name, ...props }))
    .value()

const getHeaders = headers => mapValues(headers, value => [value])

const getScripts = scripts =>
  chain(scripts)
    .map('src')
    .compact()
    .uniq()
    .value()

const getMeta = document =>
  Array.from(document.querySelectorAll('meta')).reduce((acc, meta) => {
    const key = meta.getAttribute('name') || meta.getAttribute('property')
    if (key) acc[key.toLowerCase()] = [meta.getAttribute('content')]
    return acc
  }, {})

module.exports = ({ url, headers, html }) => {
  const dom = new JSDOM(html, {
    url,
    runScripts: 'dangerously',
    virtualConsole: new VirtualConsole()
  })

  const detections = wappalyzer.analyze({
    url,
    meta: getMeta(dom.window.document),
    headers: getHeaders(headers),
    scripts: getScripts(dom.window.document.scripts),
    cookies: getCookies(headers['set-cookie']),
    html: dom.serialize()
  })

  return wappalyzer.resolve(detections)
}
